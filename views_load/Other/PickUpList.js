/*门店待提货列表*/


var PickUpList = (function () {
    var sample, scroller, pickupList, pickul, ullist, config,
        viewPage, showHint, currentPage, itemsOfPage, TotalPage, hasInit, list;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-pickup-list');
            viewPage = $(div);
            var divlist = viewPage.find('[data-cmd="scroll-view"]')[0];
            pickul = document.getElementById('ul-view-pickup-list');
            ullist = $(pickul);
            sample = $.String.between(pickul.innerHTML, '<!--', '-->');
            pickupList = [];
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            bindEvents();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            fnfresh: function (reset) {
                reset();
                pickupList = [];
                currentPage = 1;
                getPickUpList();
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                getPickUpList();
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 获取待提货列表
    function getPickUpList() {

        loadingHint();
        Lib.API.get('GetMyTakingBillList', {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: {}
        },
            function (data, json) {
                TotalPage = json.TotalPage ? json.TotalPage : 0;
                list = getListData(data.TakingBillList);
                // 填充模板
                freshList();
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }


    function getListData(data) {
        showHint = true;
        var listOther = [];
        var list = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            var aitem = {
                billid: item.billid,
                store: item.storename,
                address: item.storeaddress,
                phone: item.storephone,
                money: item.billmoney,
                num: item.qty,
                takecode: item.takecode,
                takedate: item.takedate,
                goodsName: getName(item.itemList),
                lat: item.lat,
                lng: item.lng,
                storename: item.storename
            };
            listOther.push(aitem);
        }
        return (list.length > 0 ? list : listOther)
    }


    function getName(list) {
        var alist = list || [];
        var len = alist.length;
        var name = '';
        if (len == 1) {
            name = alist[0].name;
        }
        if (len > 1) {
            name = alist[0].name;
            name = name + '...';
        }
        return name;
    }

    // 填充待提货列表
    function freshList() {
        pickupList = currentPage == 1 ? list : pickupList.concat(list);
        var listStr = $.Array.keep(list, function (item, index) {
            return $.String.format(sample, {
                index: index + (currentPage - 1) * itemsOfPage,
                store: item.store,
                address: item.address,
                phone: item.phone,
                money: item.money,
                imgurl: getImgQrcodeUrl(item.takecode),
                num: item.num,
                takecode: item.takecode,
                takedate: item.takedate,
                goodsName: item.goodsName
            });
        }).join('');
        removeHint();
        if (pickupList.length == 0) {
            pickul.innerHTML = '<div class="emptySearch">' +
                '<img src="img/empty.png"><span>抱歉,您没有待提货信息</span></div>';
        } else {
            if (currentPage == 1) {
                pickul.innerHTML = listStr;
            } else {
                pickul.innerHTML += listStr;
            }
        }
        scroller.isPageEnd = (currentPage >= TotalPage);
        scroller.refresh();
    }

    function getImgQrcodeUrl(takeCode) {
        var discribe = '';
        var url = takeCode;
        var logourl = '';
        var timestamp = Math.round(new Date().getTime() / 1000);
        var token = Lib.MD5.encrypt(discribe + "kingdee_xxx" + timestamp);
        var qrImg = 'http://mob.cmcloud.cn/ServerCloud/WDH/genGoodsQRcode?';
        qrImg = qrImg + 'discribe=' + encodeURIComponent(discribe) + '&url=' + encodeURIComponent(url)
            + '&logourl=' + encodeURIComponent(logourl) + '&timestamp=' + timestamp + '&token=' + token;
        return qrImg;
    }


    // 移除加载提示信息
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }

    // 绑定事件
    function bindEvents() {
        viewPage.delegate('[data-cmd="detail"]', {
            'click': function (event) {
                var index = this.getAttribute('data-index');
                var target = event.target;
                var node = target.nodeName;
                if (node == 'A' || node == 'IMG') {
                    return;
                }
                if (target.getAttribute('data-cmd') == 'guide') {
                    //导航
                    navigation(index);
                    return;
                }
                var index = this.getAttribute('data-index');
                var billid = pickupList[index].billid;
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                    billId: billid
                }]);

            },
            'touchstart': function () {
                $(this).addClass('pressed');
            },
            'touchend': function () {
                $(this).removeClass('pressed');
            }
        });

        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            }
        });
    }

    //门店导航--2016-4-18 by mayue
    function navigation(index) {
        var address = list[index].address;
        var lng = list[index].lng;
        var lat = list[index].lat;
        if (lat == 0 && lng == 0) {
            Gaode.regeocoder(address, function (location) {
                if (location.result == "complete") {
                    lng = location.lng;
                    lat = location.lat;
                    mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + list[index].storename;
                    MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
                } else {
                    OptMsg.ShowMsg('地址有误，请联系客服', "", 3000);
                    return false;
                }
            });
        } else {
            mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + list[index].storename;
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
        }
    }

    function render(configp) {
        config = configp || {};
        initView();
        show();
        pickul.innerHTML = '';
        getPickUpList();
    }

    // 显示加载提示信息
    function loadingHint() {

        ullist.children().filter('.hintflag').remove();
        ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<div class="spacerow"></div>');
    }


    function show() {
        kdAppSet.setAppTitle('待提货列表');
        viewPage.show();

    }

    function hide() {
        viewPage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();