/*地址列表页*/


var AddressList = (function () {
    var div, sample, scroller, addressList, ul, ullist, config, viewpage, mode, receiveidSel, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_addressList');
            viewpage = $(div);
            var divlist = document.getElementById('addressList_select');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            addressList = [];
            receiveidSel = '';
            bindEvents();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 0.2,
            fnfresh: function (reset) {
                reset();
                getAddressList();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 获取地址列表
    function getAddressList(fnCallBack) {
        loadingHint();
        Lib.API.get('GetReceiverAddressList', {para: {}},
            function (data, json) {
                data = data.ReceiverList;
                addressList = $.Array.keep(data || [], function (item, index) {
                    return {
                        receiverid: item.receiverid,
                        name: item.name,
                        address: item.address,
                        mobile: item.mobile,
                        isdefault: item.isdefault,
                        provincenumber: item.provincenumber,
                        citynumber: item.citynumber,
                        districtnumber: item.districtnumber,
                        provincename: item.provincename,
                        cityname: item.cityname,
                        districtname: item.districtname,
                        addressdetail: item.provincename + item.cityname + item.districtname + item.address
                    };
                });

                // 填充模板
                freshList(addressList);
                fnCallBack && fnCallBack();
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    // 填充地址列表
    function freshList(datalist) {
        var listStr = $.Array.keep(datalist, function (item, index) {
            return $.String.format(sample, {
                index: index,
                name: item.name,
                phone: item.mobile,
                address: item.addressdetail,
                defaultFlag: item.isdefault ? 'inline-block;color:#FF662B' : 'none'
            });
        }).join('');
        removeHint();
        if (datalist.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        freshListStatus();
        showSelectAddress();
        scroller.refresh();
    }


    // 设置选择项
    function showSelectAddress() {
        var addrSel = config.addressInfo;
        if (addrSel) {
            var inum = addressList.length;
            var selInfo = addrSel.name + addrSel.mobile + addrSel.addressdetail;
            for (var i = 0; i < inum; i++) {
                var item = addressList[i];
                var tmp = item.name + item.mobile + item.addressdetail;
                if (selInfo == tmp) {
                    receiveidSel = item.receiverid;
                    $('#addressList_select ').find('li[index=' + i + '] .info img').attr('src', 'img/selected.png');
                    break;
                } else if ((receiveidSel != '') && (receiveidSel == item.receiverid)) {
                    $('#addressList_select ').find('li[index=' + i + '] .info img').attr('src', 'img/selected.png');
                    break;
                }
            }
        }
    }

    // 移除加载提示信息
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }

    function selectAddress(item) {
        if ((item.provincenumber == '0') || (item.citynumber == '0') || (item.provincenumber == '') || (item.citynumber == '')) {
            jAlert("收货地址中 省,市,区都不能为空,请修改!");
            return false;
        }
        config.fnselect(item);
        receiveidSel = item.receiverid;
        kdShare.backView();
    }

    // 绑定事件
    function bindEvents() {

        viewpage.delegate('.addBtn', {
            'click': function () {
                // 添加地址操作标识
                MiniQuery.Event.trigger(window, 'toview', ['EditAddress',
                    { addressInfo: '',
                        optType: 1,
                        addressNum: addressList.length,
                        fn: function () {
                            getAddressList(function () {
                                if ((mode == 'select') && (addressList.length == 1)) {
                                    selectAddress(addressList[0]);
                                }
                            });
                        }
                    }]);
            },
            'touchstart': function () {
                $(this).addClass('addBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('addBtn_touched');
            }
        });

        //选择收货地址
        $(ul).delegate('.info', {
            'click': function () {
                var index = this.getAttribute('index');
                if (mode == 'select') {
                    // 回调函数，返回当前选中的地址信息
                    var item = addressList[index];
                    selectAddress(item);
                } else {
                    editAddressInfo(index);
                }
            },
            'touchstart': function (event) {
                $(this).addClass('li_touched');
                $(this).find('img').attr('src', 'img/selected.png');
            },
            'touchend': function (event) {
                $(this).removeClass('li_touched');
                var index = this.getAttribute('index');
                var item = addressList[index];
                if (receiveidSel != item.receiverid) {
                    $(this).find('img').attr('src', 'img/select.png');
                }
            }
        });

        //编辑
        $(ul).delegate('.edit', {
            'click': function (event) {
                var iindex = this.getAttribute('index');
                editAddressInfo(iindex);
            },
            'touchstart': function (event) {
                $(this).addClass('li_touched');
            },
            'touchend': function (event) {
                $(this).removeClass('li_touched');
            }
        });

        //删除
        $(ul).delegate('.delete', {
            'click': function (event) {
                var iindex = this.getAttribute('index');
                jConfirm("您确定要删除选中的地址?", null, function (flag) {
                    if (flag) {
                        var ctrlP = $("#viewid_addressList  li[index=" + iindex + "]");
                        ctrlP.animate({left: "-320px"}, 500, function () {
                            deleteAddressInfo(addressList[iindex]);
                            addressList.splice(iindex, 1);
                            freshList(addressList);
                        });
                    }
                }, {ok: "确定", no: "取消"});
            },
            'touchstart': function (event) {
                $(this).addClass('li_touched');
            },
            'touchend': function (event) {
                $(this).removeClass('li_touched');
            }
        });
    }

    //编辑收货地址
    function editAddressInfo(iindex) {
        MiniQuery.Event.trigger(window, 'toview', ['EditAddress', {
            addressInfo: addressList[iindex],
            optType: 2,
            addressNum: addressList.length,
            fn: function () {
                getAddressList(function () {
                    if ((mode == 'select') && (addressList.length==1)) {
                        selectAddress(addressList[0]);
                    }
                });
            }
        }]);
    }

    //删除收货地址
    function deleteAddressInfo(addressItem) {
        Lib.API.get('SetReceiverAddress', {
            para: getAddressPara(addressItem)
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('网络错误删除地址失败，请稍候再试', '', 3000);
        });
    }

    function getAddressPara(addressItem) {
        var para = {};
        para.ReceiverID = addressItem.receiverid;
        para.OptType = 0;
        return para;
    }

    function render(configp) {
        config = configp || {};
        mode = config.mode || '';
        initView();
        show();
        getAddressList();
    }


    //刷新地址列表状态
    function freshListStatus() {
        if (mode == 'select') {
        } else {
            $('.view_addressList li .img').hide();
            $('.view_addressList li .infoDiv').css('margin-left', '20px');
        }
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
        kdAppSet.setAppTitle('我的地址');
        viewpage.show();

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