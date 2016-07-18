/*门店选择列表*/


var StoreList = (function () {
    var sample, regionSample, scroller, storeList, ul, ullist, config,
        regionInfo, viewpage, showHint, currentPage, itemsOfPage, TotalPage, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-store-list');
            viewpage = $(div);
            viewpage.find('[data-cmd="locate"] img').attr('src', 'img/location.png');
            var divlist = document.getElementById('div-view-store-list');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            var region = document.getElementById('ul-view-store-address-list');
            regionSample = $.String.between(region.innerHTML, '<!--', '-->');
            storeList = [];
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            regionInfo = {
                prov: { name: "省", id: -1 },
                city: { name: "市", id: -1 },
                dist: { name: "区", id: -1 }
            };
            bindEvents();
            fillRegion();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 1.56,
            fnfresh: function (reset) {
                reset();
                storeList = [];
                currentPage = 1;
                getStoreList();
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                getStoreList();
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }


    function fillRegion() {
        $('#ul-view-store-address-list')[0].innerHTML = $.String.format(regionSample, {
            province: regionInfo.prov['name'] || '省',
            city: regionInfo.city['name'] || '市',
            district: regionInfo.dist['name'] || '区'
        });
    }

    function getPara() {
        var city = regionInfo.city['name'] || '';
        var dist = regionInfo.dist['name'] || '';
        return city + dist;
    }

    // 获取门店列表
    function getStoreList() {
        //loadingHint();
        //门店类型 type 增加传入项： "send" --- 表示允许配送的门店
        Lib.API.get('GetStoreList', {
                currentPage: currentPage,
                ItemsOfPage: itemsOfPage,
                para: {
                    'region': getPara(),
                    'lng': config.lng,
                    'lat': config.lat,
                    'type': config.type || ''
                }
            },
            function (data, json) {
                TotalPage = json.TotalPage ? json.TotalPage : 0;
                var list = getListData(data.storelist);
                storeList = currentPage == 1 ? list : storeList.concat(list);
                // 填充模板
                freshList(storeList);
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    //获取门店列表 判断是否只有一个门店
    function getOnlyOneStore(fn) {
        Lib.API.get('GetStoreList', {
                para: {
                    'region': '',
                    'lng': 0,
                    'lat': 0
                }
            },
            function (data, json) {
                var list = data.storelist;
                if (list.length == 1) {
                    var item = list[0];
                    var aitem = {
                        name: item.name,
                        address: item.address,
                        id: item.id
                    };
                    fn & fn(aitem);
                }
            });
    }


    function getListData(data) {
        showHint = true;
        var listOther = [];
        var list = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            var selected = (item.id == config.selectId);
            var aitem = {
                name: item.name,
                address: item.address,
                id: item.id,
                selected: selected,
                ismatch: item.ismatch,
                lat: item.lat,
                lng: item.lng,
                distance: item.distance,
                phone: item.phone || ""
            };
            if (aitem.ismatch == 1) {
                showHint = false;
                list.push(aitem);
            } else {
                listOther.push(aitem);
            }
        }
        if (getPara() == '市区') {
            showHint = false;
        }
        return (list.length > 0 ? list : listOther)
    }

    // 填充门店列表
    function freshList(datalist) {
        var hint = viewpage.find('[data-cmd="hint"]');
        var storeList = $('#div-view-store-list');
        if (datalist.length > 0 && showHint) {
            hint.show();
            storeList.css({ 'top': '1.8rem' });
        } else {
            hint.hide();
            storeList.css({ 'top': '1rem' });
        }

        var listStr = $.Array.keep(datalist, function (item, index) {
            return $.String.format(sample, {
                index: index,
                has: (!showHint && index == 0) ? 'has' : '',
                on: item.selected ? 'on' : '',
                name: item.name,
                address: item.address,
                hide: distancehide(item.distance),
                distance: distanceshow(item.distance)
            });
        }).join('');
        removeHint();
        if (datalist.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        scroller.isPageEnd = (currentPage >= TotalPage);
        scroller.refresh();
    }

    function distancehide(distance) {
        if (distance == -1) {
            return "hide";
        } else {
            return "";
        }
    }

    function distanceshow(distance) {
        if (distance < 1) {
            return (distance * 1000).toFixed(2) + 'm';
        } else {
            return distance.toFixed(2) + 'km';
        }
    }


    // 移除加载提示信息
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }

    // 绑定事件
    function bindEvents() {
        viewpage.delegate('[data-cmd="province"]', {
            'click': function () {
                callProvince();
            },
            'touchstart': function () {
                $(this).addClass('addBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('addBtn_touched');
            }
        }).delegate('[data-cmd="city"]', {
            'click': function () {
                callCity();
            }
        }).delegate('[data-cmd="district"]', {
            'click': function () {
                callDistrict();
            }
        }).delegate('[data-cmd="store"]', {
            'click': function (event) {
                //门店选择
                var index = this.getAttribute('data-index');
                if (event.target.getAttribute('data-cmd') == 'guide') {
                    //导航
                    navigation(index);
                } else {
                    config.fnselect && config.fnselect(storeList[index]);
                    kdShare.backView();
                }
            },
            'touchstart': function () {
                $(this).find('[data-cmd="guide"]').addClass('on');
            },
            'touchend': function () {
                $(this).find('[data-cmd="guide"]').removeClass('on');
            }
        }).delegate('[data-cmd="locate"]', {
            'click': function () {
                //自动定位
                MiniQuery.Event.trigger(window, 'toview', ['ViewMap', { selectAddress: selectAddress }]);
            }
        });
    }

    //门店导航--2016-4-18 by mayue
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

    function selectAddress(addrInfo) {
        regionInfo = {
            prov: { name: addrInfo.province, id: -1 },
            city: { name: addrInfo.city, id: -1 },
            dist: { name: addrInfo.district, id: -1 }
        };
        fillRegion();
        getAddressCode({
            province: addrInfo.province,
            city: addrInfo.city,
            district: addrInfo.district
        });
    }


    //获取定位地址编码
    function getAddressCode(address) {

        kdAppSet.setKdLoading(true, '获取地址编码...');

        Lib.API.post('GetAddressNumber', {
                para: getLocationPara(address)
            }, function (data, json, root, userflag) {
                kdAppSet.setKdLoading(false);
                dealLocationCode(data);
            }, function (code, msg, json, root, userflag) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('网络错误，请稍候再试', '', 3000);
            }
        );
    }

    function getLocationPara(address) {
        //{"citynumber":440300,"districtnumber":110101,"provincenumber":440000}
        return {
            provincename: address.province,
            provincenumber: "",
            cityname: address.city,
            citynumber: "",
            districtname: address.district,
            districtnumber: ""
        };
    }


    function dealLocationCode(data) {
        regionInfo.prov.id = data.provincenumber;
        regionInfo.city.id = data.citynumber;
        regionInfo.dist.id = data.districtnumber;
    }


    function callProvince() {
        var curThis = viewpage.find('[data-cmd="province"] span')[0];
        var oldProvince = curThis.innerText;
        OptView.getAreaInfo(regionInfo.prov, curThis, { parentnumber: '' }, function () {
            // 但内容改变时初始化市区内容
            if (oldProvince != curThis.innerText) {
                callCity();
                kdShare.clearBackView(1);
            }
        });
    }

    function callCity() {
        var curThis = viewpage.find('[data-cmd="city"] span')[0];
        var oldCity = curThis.innerText;
        var pid = regionInfo.prov['id'];
        if (pid == -1 || !pid) {
            OptMsg.ShowMsg('请先选择省份!', '', 1500);
            return;
        }
        OptView.getAreaInfo(regionInfo.city, curThis, { parentnumber: pid },
            function () {
                // 内容改变时初始化区内容
                if (oldCity != curThis.innerText) {
                    //不需要区
                    //callDistrict();
                    //kdShare.clearBackView(1);
                    kdShare.backView();

                }
            });
    }


    function callDistrict() {
        var curThis = viewpage.find('[data-cmd="district"] span')[0];
        var pid = regionInfo.city['id'];
        if (pid == -1 || !pid) {
            OptMsg.ShowMsg('请先选择市!', '', 1500);
            return;
        }
        OptView.getAreaInfo(regionInfo.dist, curThis, { parentnumber: pid }, function () {
            //刷新店铺列表
            ul.innerHTML = '';
            getStoreList();
            kdShare.backView();
        });
    }


    function render(configp) {
        config = configp || {};
        initView();
        show();
    }


    // 显示加载提示信息
    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<div class="spacerow"></div>');
    }


    function show() {
        kdAppSet.setAppTitle('门店列表');
        viewpage.show();
        ul.innerHTML = '';
        getStoreList();
    }

    function hide() {
        viewpage.hide();
    }

    return {
        getOnlyOneStore: getOnlyOneStore,
        render: render,
        show: show,
        hide: hide
    };


})();