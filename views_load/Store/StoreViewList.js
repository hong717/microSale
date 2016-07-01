/*门店选择列表*/


var StoreViewList = (function () {
    var viewpage, hasInit, sample, scroller, currentPage, itemsOfPage,
        TotalPage, storeList, ul, ullist;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-store-view-list');
            viewpage = $(div);
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            storeList = [];
            var divlist = document.getElementById('viewid-store-view-list-scroll');//滑动区域
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            var name = kdAppSet.getUserInfo().cmpInfo.name;
            bindevents();
            initScroll(divlist);
            fillhead();
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        scroller.noticetop = 1.8;
        var option = {
            fnfresh: function (reset) {
                storeList = [];
                currentPage = 1;
                getStoreList(reset);
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                getStoreList(reset);
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    function fillhead() {
        var imgsrc = kdAppSet.getUserInfo().cmpInfo.img || "img/me.png";
        $(".header-detail img").attr("src", imgsrc);
        viewpage.find('[data-cmd="name"]')[0].innerHTML = kdAppSet.getUserInfo().cmpInfo.name;
    }

    function bindevents() {
        viewpage.delegate('[data-cmd="guide"]', {
            'click': function () {
                var index = this.parentElement.getAttribute('index');
                navigation(index);

            },
            'touchstart': function () {
                $(this).addClass('on');
            },
            'touchend': function () {
                $(this).removeClass('on');
            }
        });

        viewpage.delegate('[data-cmd="phone"]', {
            'click': function () {
                var index = this.getAttribute('index');
                callphone(index);
            },
            'touchstart': function () {
                $(this).addClass('on');
            },
            'touchend': function () {
                $(this).removeClass('on');
            }
        });

        //清除
        viewpage.delegate('[data-cmd="clear"]', {
            'click': function () {
                var str = viewpage.find('[data-cmd="keyword"]')[0].value;
                str = str.replace(/\s+/g, "");
                viewpage.find('[data-cmd="keyword"]')[0].value = '';
                if (str) {
                    storeList = [];
                    currentPage = 1;
                    getStoreList();
                } else {
                    return false;
                }


            }
        });

        //form 表单 阻断提交
        viewpage.delegate('[data-cmd="input"]', {
            'submit': function () {
                var str = viewpage.find('[data-cmd="keyword"]')[0].value;
                str = str.replace(/\s+/g, "");
                if (str) {
                    storeList = [];
                    currentPage = 1;
                    ul.innerHTML = "";
                    ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
                    getStoreList();
                }
                return false;  //阻断
            }
        });
    }

    function callphone(index) {
        var phone = storeList[index].phone || '';
        var phoneUrl = "tel:" + phone;
        if (phoneUrl == "tel:") {
            jAlert("很抱歉,门店的电话号码为空!");
            return false;
        }
        window.location.href = phoneUrl;
    }

    //门店导航
    function navigation(index) {
        var address = storeList[index];
        var lng = address.lng;
        var lat = address.lat;
        if (lat == 0 && lng == 0) {
            Gaode.regeocoder(address.address, function (location) {
                if (location.result == "complete") {
                    lng = location.lng;
                    lat = location.lat;
                    mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + address.address;
                    MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
                } else {
                    OptMsg.ShowMsg('地址有误，请联系客服', "", 3000);
                    return false;
                }
            });
        } else {
            mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + address.address;
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
        }

    }

    // 获取门店列表
    function getStoreList(fnReset) {
        if (currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            //scroller.refresh();
        }
        var str = viewpage.find('[data-cmd="keyword"]')[0].value;
        str = str.replace(/\s+/g, "");

        Lib.API.get('GetStoreList', {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: {
                'keyword': str,
                'type': 'offline'
            }
        },
            function (data, json) {
                TotalPage = json.TotalPage ? json.TotalPage : 0;
                var list = data.storelist;
                storeList = currentPage == 1 ? list : storeList.concat(list);
                // 填充模板
                freshList(storeList);
                removeHint();
                fnReset && fnReset();
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
                fnReset && fnReset();
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
                fnReset && fnReset();

            });
    }

    function freshList(storeList) {
        var listStr = $.Array.keep(storeList, function (item, index) {
            return $.String.format(sample, {
                index: index,
                name: item.name,
                address: item.address,
                phone: item.phone || ""
            });
        }).join('');

        if (storeList.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关门店数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        scroller.isPageEnd = (currentPage >= TotalPage);
        scroller.refresh();
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    function render() {
        initView();
        show();
        debugger;
        viewpage.find('[data-cmd="keyword"]')[0].value = '';

    }
    function show() {
        kdAppSet.setAppTitle('门店列表');
        OptAppMenu.showKdAppMenu(false);
        viewpage.show();
        getStoreList();
        scroller.refresh();
    }

    function hide() {
        viewpage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();