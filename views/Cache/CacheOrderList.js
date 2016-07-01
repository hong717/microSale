/*购物车 订单显示界面*/
var CacheOrderList = (function () {

    var div,
        scroller,
        samples,
        sampleStore,
        cacheOrderList_ul,
        goodsListArr,
        bsummiting,
        billId,//订单编号
        addressInfo,//收货地址信息
        invoiceInfo,//发票信息
        viewPage,
        payInfo,
        promptTxt,
        isOutInStore, //是否门店自提
        isNeedInvoice,//是否需要发票
        privilegeInfo,
        storeInfo,//自提门店信息
        billInfo,//单据信息 金额
        enablePoints,//是否允许积分兑换
        billPoint,//本单积分
        hasInit,
        lng = 0,
        lat = 0;
    var deliverway = 0;//交货方式
    var deliverList = [];
    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById("viewid_cacheOrderList");
            var listitemarea = document.getElementById('cacheOrderListContent');
            scroller = Lib.Scroller.create(listitemarea);
            cacheOrderList_ul = document.getElementById('cacheOrderList_ul');
            var ul = document.getElementById('cacheOrderList_ul');
            samples = $.String.getTemplates(ul.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                },
                {
                    name: 'rowli',
                    begin: '#--rowli.begin--#',
                    end: '#--rowli.end--#',
                    outer: '{rowsli}'
                }
            ]);
            var storeTemplate = document.getElementById('cacheOrderList_store_view').innerHTML;
            sampleStore = $.String.between(storeTemplate, '<!--', '-->');
            bsummiting = false;
            billId = 0;
            billInfo = {};
            viewPage = $(div);
            initAddressInfo();
            initInvoiceInfo();
            initStore();
            bindEvents();
            // 备注信息栏获取焦点
            promptTxt = '请在此处输入要备注的信息';
            isOutInStore = false;
            isNeedInvoice = false;
            $('.view_cacheOrderList .editgoods img').attr('src', 'img/edit_img.png');
            $('.view_cacheOrderList .add_goods img').attr('src', 'img/add_img.png');
            var identity = kdAppSet.getUserInfo().identity;
            if (identity == "manager" || identity == "buyer") {
                viewPage.find('[data-cmd="manage"]').show();
                viewPage.find('[data-cmd="retail"]').hide();
            } else {
                viewPage.find('[data-cmd="retail"]').show();
                viewPage.find('[data-cmd="manage"]').hide();
            }
            if (kdAppSet.getUserInfo().allowoutinstore == 0) {
                $('#cacheOrderList_store').css({ 'visibility': 'hidden' });
            }
            setInvoiceView();
            setWxCardInfo();
            deliverList = kdAppSet.getUserInfo().fetchstylelist;
            if (deliverList.length <= 1) {
                setDeliverway(deliverList);
            }
            hasInit = true;
        }
    }

    function refreshPayBtn(billMoney){
        if (kdAppSet.getIsShowPrice() && billMoney>0) {
            $('#getlistbill')[0].innerText = '立即付款';
        } else {
            $('#getlistbill')[0].innerText = '查看订单';
        }
    }

    //设置微信卡券是否显示
    function setWxCardInfo() {
        var wxCard = $('#cacheOrderList_wxCard');
        if (!kdAppSet.getUserInfo().cmpInfo.allowWxCard) {
            wxCard.hide();
        } else {
            wxCard.show();
        }
    }

    function initStore() {
        var date = new Date();
        //用户自定义取货时间
        var laydate = kdAppSet.getUserInfo().cmpInfo.outinstoretakedelaydate;
        var newDate = new Date(date.setDate(date.getDate() + laydate));//加上延时收货时间
        var currentdate = newDate.getFullYear() + "-" + ((newDate.getMonth() + 1) < 10 ? "0" : "") + (newDate.getMonth() + 1) + "-" + (newDate.getDate() < 10 ? "0" : "") + newDate.getDate();
        storeInfo = {
            newDate: newDate,
            date: currentdate,
            id: 0
        };
    }

    function fillStore() {

        $('#cacheOrderList_store_view')[0].innerHTML = $.String.format(sampleStore, {
            'store': storeInfo.store || '选择门店',
            'address': storeInfo.address || '',
            'date': storeInfo.date
        });
        setTimeout(function () {
            var dateStore = viewPage.find('[data-cmd="date"]');
            initDate(dateStore, {
                'onSelect': function () {
                    storeInfo.date = dateStore.val();
                }
            });
        }, 50);
    }

    function initDate(dateCtrl, event) {
        var fn = function () {
        };

        var startDate = $.Date.format(storeInfo.newDate, "yyyy-MM-dd").split("-");
        var minDate = new Date(startDate[0], startDate[1] - 1, startDate[2], 00, 00, 00);
        //初始化日期控件
        var maxDate = new Date(2020, 12, 30, 23, 59, 59);
        dateCtrl.mobiscroll().date({
            'theme': 'android-ics',
            'lang': 'zh',
            'maxDate': maxDate,
            'minDate': minDate,
            'display': 'bottom',
            'mode': 'scroller',
            'dateFormat': "yy-mm-dd",
            'inputDateFormat': "yy-mm-dd",
            'showLabel': false,
            'dateOrder': 'yymmdd',
            'cancelText': "取消",
            'setText': "确定",
            'rows': 5,
            //点击确定按钮，触发事件。
            'onSelect': event.onSelect || fn,
            //当时间选择的内容发生变化触发的事件
            'onChange': event.onChange || fn,
            //点击取消按钮触发的事件
            'onCancel': event.onCancel || fn
        });
    }

    //初始化收货地址 以及发票信息
    function initAddressInfo() {
        var addrinfo = kdAppSet.getUserInfo().addressInfo;
        addressInfo = {
            provincenumber: addrinfo.provincenumber,
            citynumber: addrinfo.citynumber,
            districtnumber: addrinfo.districtnumber,
            name: addrinfo.receivername,
            mobile: addrinfo.mobile,
            addressdetail: addrinfo.receiveraddress,
            address: addrinfo.address
        };
        freshReceiveInfo(addressInfo);
    }

    //初始化发票信息
    function initInvoiceInfo() {
        var userInfo = kdAppSet.getUserInfo();
        var addrinfo = userInfo.addressInfo;
        invoiceInfo = {
            invoiceHead: userInfo.companyName,
            name: addrinfo.receivername,
            mobile: addrinfo.mobile,
            address: addrinfo.receiveraddress
        };
        freshInvoiceInfo(invoiceInfo);
    }

    //刷新发票信息
    function freshInvoiceInfo(invoice) {
        $("#orderInvoiceHead").text(invoice.invoiceHead);
        $("#orderInvoiceAddress").text(invoice.address);
    }


    //编辑商品
    function editBillInfo() {
        var goodslist = JSON.stringify(goodsListArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        MiniQuery.Event.trigger(window, 'editCacheListInfo', [
            { editBillId: billId }
        ]);
        //通知购物车刷新数量
        MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
    }

    function setDeliverway(data) {
        if (data.length == 0) {
            viewPage.find('[data-cmd="deliverway"]')[0].innerHTML = "快递送货"
        } else {
            viewPage.find('[data-cmd="deliverway"]')[0].innerHTML = data[0].name || "快递送货";
            deliverway = data[0].id || 0;
        }
    }

    function onSelect() {//第几个元素被选中
        var onseList = [];
        for (i = 0; i < deliverList.length; i++) {
            if (deliverList[i].id == deliverway) {
                onseList.push(i);
            }
        }
        return onseList;
    }

    function bindEvents() {
        //经销商选择交货方式
        viewPage.delegate('[data-cmd="manage"]', {
            'click': function () {
                var identity = kdAppSet.getUserInfo().identity;
                if (deliverList.length > 1 && (identity == "manager" || identity == "buyer"))
                    jSelect.showSelect({
                        title: "交货方式",
                        data: deliverList,
                        onselect: onSelect(),
                        fnselect: function (data) {
                            setDeliverway(data);
                        }
                    });
            }
        }
        );

        //刷新购物车列表 处理库存不足
        MiniQuery.Event.bind(window, {
            'freshCacheOrderListInfo': function () {
                goodsListArr = getDataList('goodsList');
                freshListView(goodsListArr);
            }
        });

        //取消修改 按钮事件
        viewPage.delegate('#cancelChange', {
            'click': function () {
                jConfirm("你确定要取消订单修改?", null, function (flag) {
                    if (flag) {
                        MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', { billId: billId }]);
                        finishBillEdit();
                    }
                }, { ok: "确定", no: "取消" });
            },
            'touchstart': function () {
                $(this).addClass('cancelChange_touched');
            },
            'touchend': function () {
                $(this).removeClass('cancelChange_touched');
            }
        });

        //提交单据 按钮事件
        viewPage.delegate('#summitOrder', {
            'click': function () {
                if (checkBillCanSubmit()) {
                    submitOrder();
                    kdAppSet.h5Analysis('CacheOrderList_submit');
                }
            },
            'touchstart': function () {
                $(this).css({ background: '#ef5215' });
            },
            'touchend': function () {
                $(this).css({ background: '#ff6427' });
            }
        });

        //订单添加商品
        viewPage.delegate('.add_goods', {
            'click': function () {
                editBillInfo();
                MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
                kdAppSet.h5Analysis('CacheOrderList_addGoods');
            },
            'touchstart': function () {
                $(this).addClass('touched');
                $(this).find('img').attr('src', 'img/add_img_click.png');
            },
            'touchend': function () {
                $(this).removeClass('touched');
                $(this).find('img').attr('src', 'img/add_img.png');
            }
        });

        //订单编辑商品
        viewPage.delegate('.editgoods', {
            'click': function () {
                editBillInfo();
                MiniQuery.Event.trigger(window, 'toview', ['CacheList', {}]);
                kdAppSet.h5Analysis('CacheOrderList_editGoods');
            },
            'touchstart': function () {
                $(this).addClass('touched');
                $(this).find('img').attr('src', 'img/edit_img_click.png');
            },
            'touchend': function () {
                $(this).removeClass('touched');
                $(this).find('img').attr('src', 'img/edit_img.png');
            }
        });

        //选择收货地址
        viewPage.delegate('.liaddress', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['AddressList', {
                    mode: 'select',
                    addressInfo: addressInfo,
                    fnselect: function (data) {
                        var address = {
                            provincenumber: data.provincenumber,
                            citynumber: data.citynumber,
                            districtnumber: data.districtnumber,
                            name: data.name,
                            mobile: data.mobile,
                            addressdetail: data.addressdetail,
                            address: data.address
                        };
                        freshReceiveInfo(address);
                        caculateFreight();
                    }
                }]);
            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        });

        //选择填写发票信息
        viewPage.delegate('.liinvoice', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['Invoice', {
                    Invoice: invoiceInfo,
                    fnselect: function (data) {
                        invoiceInfo = data;
                        freshInvoiceInfo(invoiceInfo);
                    }
                }]);
            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        });


        //选择门店
        viewPage.delegate('[data-cmd="store-select"]', {
            'click': function () {
                if (lng == 0 && lat == 0) {
                    kdAppSet.setKdLoading(true, '正在加载...');
                    Gaode.getlocation(function (data) {
                        kdAppSet.setKdLoading(false);
                        if (data.type == "complete") {
                            lng = data.position.getLng(),
                            lat = data.position.getLat()
                        }
                        goTostore();
                    });
                } else {
                    goTostore();
                }

            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        });

        //快递收货
        viewPage.delegate('#cacheOrderList_express', {
            'click': function () {
                //显示发票信息
                setInvoiceView(true);
                changeExpressMode(true);
            }
        });

        //门店自提
        viewPage.delegate('#cacheOrderList_store', {
            'click': function () {
                //隐藏发票信息
                setInvoiceView(false);
                changeExpressMode(false);
                //如果只有一个门店 则自动选择
                setOneStore();
            }
        });

        //微信卡券
        viewPage.on({
            'click': function (event) {
                if (billInfo.money) {
                    var that = $(this);
                    if (that.hasClass('sprite-more')) {
                        //选择卡券
                        WXCard.getCardList(function (card) {
                            billInfo.cardCode = card.code;
                            billInfo.freeMoney = card.freeMoney < billInfo.money ? card.freeMoney : billInfo.money;
                            var money = billInfo.money - card.freeMoney;
                            billInfo.billMoney = money > 0 ? money : 0;
                            freshBillMoney(billInfo.billMoney);
                            that.find('[data-cmd="wxCard-name"]').text(card.name);
                            /*                            that.removeClass('sprite-more');
                             that.addClass('sprite-delete-a');*/
                        }, function (msg) {
                            OptMsg.ShowMsg(msg);
                        }, billInfo.money);
                    } else {
                        /*                        //删除卡券
                         if(screenWidth-event.screenX<=60){
                         billInfo.cardCode=0;
                         billInfo.freeMoney=0;
                         billInfo.billMoney=billInfo.money;
                         freshBillMoney(billInfo.billMoney);
                         that.find('[data-cmd="wxCard-name"]').text('');
                         that.removeClass('sprite-delete-a');
                         that.addClass('sprite-more');
                         }*/
                    }
                }
            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        }, '#cacheOrderList_wxCard');

        //需要发票
        viewPage.delegate('#cacheOrderList_invoice_on', {
            'click': function () {
                changeInvoiceMode(true);
            }
        });

        //不需要发票
        viewPage.delegate('#cacheOrderList_invoice_off', {
            'click': function () {
                changeInvoiceMode(false);
            }
        }).delegate('[data-cmd="expoint"]', {
            //是否使用积分兑换
            'click': function () {
                enablePoints = Number(!enablePoints);
                enablePoints ? $(this).addClass('sprite-area_select') : $(this).removeClass('sprite-area_select');
                //使用积分
                var billMoney = billInfo.billMoney || billInfo.money;
                if (enablePoints == 1) {
                    var money = getPointMoney();
                    freshBillMoney(billMoney - money);
                } else {
                    freshBillMoney(billMoney);
                }
            }
        });

        //提交单据后，继续购物 按钮事件
        $('#backtoitem').bind('click', function () {
            freshListView([]);
            MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
            kdShare.clearBackView(1);
        });


        //提交单据后，立即支付或者查看订单 按钮事件
        $('#getlistbill').bind('click', function () {
            freshListView([]);
            var billMoney = payInfo.billmoney + payInfo.freight;
            if (kdAppSet.getIsShowPrice() && billMoney>0) {
                toPayView();
            } else {
                MiniQuery.Event.trigger(window, 'toview', ['Orderlist', { item: "" }]);
                kdShare.clearBackView(1);
            }
        });

        viewPage.delegate('#cacheOrderRemark', {
            'focus': function () {
                if (kdShare.trimStr($(this).val()) == promptTxt) {
                    $(this).val('');
                }
                $(this).addClass('textColor');
            },
            'blur': function () {
                if (kdShare.trimStr($(this).val()) == '') {
                    $(this).val(promptTxt);
                    $(this).removeClass('textColor');
                }
            }
        });
        //日期点击效果控制
        $('#orderReceiveDate').on(kdShare.clickfnIcon($('#orderReceiveDate'), 'date', 'date_s'));

        viewPage.delegate('.btn-freightRule', 'click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['FreightRule']);
        });

        WXCard.checkApi(function (check) {
            if (!check) {
                $('#cacheOrderList_wxCard').find('[data-cmd="wxCard-name"]').text('您的微信版本不支持卡券功能');
            }
        });

    }

    function goTostore() {
        MiniQuery.Event.trigger(window, 'toview', ['StoreList', {
            'lng': lng,
            'lat': lat,
            'selectId': storeInfo.id,
            'fnselect': function (data) {
                $.Object.extend(storeInfo, {
                    id: data.id,
                    store: data.name,
                    address: data.address
                });
                fillStore();
            }
        }]);
    }

    //获取能积分兑换商品的金额
    function getPointMoney() {
        var item;
        var sumMoney = 0;
        var data = CacheOrderList_Retail.getSubmitData();
        for (var i = 0, len = data.length; i < len; i++) {
            item = data[i];
            if (item.expoint > 0) {
                sumMoney = sumMoney + (item.onlyexpoint == 1 ? 0 : Number(item.DiscountPrice) * Number(item.Qty));
            }
        }
        return sumMoney;
    }

    //设置只有一个门店的情况
    function setOneStore() {
        var user = kdAppSet.getUserInfo();
        var one = user.oneStore;
        if (one && !storeInfo.id) {
            $.Object.extend(storeInfo, {
                store: one.name,
                address: one.address,
                id: one.id
            });
            fillStore();
        }
    }

    //设置发票信息是否可见
    function setInvoiceView(bview) {
        //判断后台参数 是否允许选择发票
        var setting = kdAppSet.getUserInfo().cmpInfo;
        var aview = false;
        if (setting.allowChooseInvoice) {
            aview = true;
        }
        if (bview == undefined) {
            bview = aview;
        } else {
            bview = bview && aview;
        }
        var invoice = $('#cacheOrderList_invoice');
        var invoiceView = $('#cacheOrderList_invoice_view');

        if (bview) {
            invoice.show();
            //hong
            if (isNeedInvoice) {
                invoiceView.show();
            } else {
                invoiceView.hide();
            }
        } else {
            invoice.hide();
            invoiceView.hide();
        }
        scroller && scroller.refresh();
    }

    //更改送货方式
    function changeExpressMode(isExpress) {
        var liaddress = $('#cacheOrderList_liaddress');
        var listore = $('#cacheOrderList_store_view');
        var SendMode = $('#cacheOrderList_SendMode');
        var express = $('#cacheOrderList_express');
        var store = $('#cacheOrderList_store');

        if (isExpress) {
            isOutInStore = false;
            SendMode.removeClass('borderBottom');
            express.addClass('sprite-style-on');
            store.removeClass('sprite-style-on');
            liaddress.addClass('borderBottom');
            liaddress.show();
            listore.hide();
        } else {
            isOutInStore = true;
            SendMode.addClass('borderBottom');
            express.removeClass('sprite-style-on');
            store.addClass('sprite-style-on');
            liaddress.hide();
            listore.show();
            fillStore();
        }
        caculateFreight();
        checkOverseaGoods();
        scroller.refresh();
    }

    //是否需要发票
    function changeInvoiceMode(needInvoice) {

        var liinvoice = $('#cacheOrderList_invoice_view');
        var invoice = $('#cacheOrderList_invoice');
        var invoice_on = $('#cacheOrderList_invoice_on');
        var invoice_off = $('#cacheOrderList_invoice_off');

        if (needInvoice) {
            isNeedInvoice = true;
            invoice.removeClass('borderBottom');
            invoice_on.addClass('sprite-style-on');
            invoice_off.removeClass('sprite-style-on');
            liinvoice.addClass('borderBottom');
            liinvoice.show();
        } else {
            isNeedInvoice = false;
            invoice.addClass('borderBottom');
            invoice_on.removeClass('sprite-style-on');
            invoice_off.addClass('sprite-style-on');
            liinvoice.hide();
        }
        scroller.refresh();

    }

    //检测单据是否能提交
    function checkBillCanSubmit() {
        var identity = kdAppSet.getUserInfo().identity;
        /*        if (deliverList.length > 1 && (identity == "manager" || identity == "buyer")) {
                    if (deliverway == 0) {
                        jAlert("请选择交货方式!");
                        return false;
                    }
                }*/
        if (!isOutInStore) {
            if (addressInfo.address == "") {
                jAlert("收货地址不能为空,请修改!");
                return false;
            }
            if ((addressInfo.provincenumber == '0') || (addressInfo.citynumber == '0') || (addressInfo.districtnumber == '0')) {
                jAlert("收货地址中 省,市,区都不能为空,请修改!");
                return false;
            }
        } else {
            //门店提货
            var today = kdShare.getToday();
            if (storeInfo.date < today) {
                jAlert("提货日期不能小于今天!");
                return false;
            }

            if (storeInfo.id == 0) {
                jAlert("门店不能为空,请选择!");
                return false;
            }
        }


        var display = $('#cacheOrderList_identity').css("display");
        if (display != 'none') {
            var identityStr = kdShare.trimStr($(".view_cacheOrderList .identity input")[0].value);
            if (identityStr == '') {
                jAlert("身份证号码不能为空,\n请录入!");
                return false;
            } else if ((identityStr.length != 15) && (identityStr.length != 18)) {
                jAlert("身份证号码长度不对,\n请检查!");
                return false;
            }
        }
        return true;
    }

    function setPrivilegeInfo(value) {
        var $div = $(div).find('.privilegeInfo-div');
        if (value === '') {
            $div.hide();
            return;
        }
        $div.text(value);
        $div.show();
    }

    //设置是否使用积分兑换 以及微信卡券
    function setPayInfo(data) {
        var pointInfo = getPointsData(data);
        var pointView = viewPage.find('[data-cmd="expoint-view"]');
        pointView.hide();
        //是否包含可积分兑换的商品
        if (pointInfo.points > 0) {
            if (kdAppSet.getUserInfo().identity == 'retail') {
                pointView.show();
            }
            //如果有积分兑换商品，则不能使用微信卡券
            $('#cacheOrderList_wxCard').hide();
        } else {
            setWxCardInfo();
        }
        /*        var points=0;
         //勾选积分兑换或者有仅限积分的商品时
         //enablePoints==1 ||
         if( pointInfo.hasOnlyPoint){
         points=pointInfo.points;
         }*/
        return pointInfo.points;
    }

    //刷新 商品列表数据
    function freshListView(data) {
        var points = setPayInfo(data);
        freshViewStatus();
        checkOverseaGoods();
        var user = kdAppSet.getUserInfo();
        if (user.identity == 'retail') {
            $('#summitOrder').hide();
            CacheOrderList_Retail.getPromotion(data, scroller, function(point){
                billPoint=point;
                caculateFreight();
            }, billInfo, points);
            $('.view_cacheOrderList [data-cmd="totalHead"]').show();
            return;
        }
        caculateFreight();
        var sumMomey = 0;
        var sumNum = 0;
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        cacheOrderList_ul.innerHTML = $.Array.map(data, function (item) {
            var attrList = [];
            var listObj = item.attrList;
            var attrsum = 0;
            var attrsumMoney = 0;
            var itmp;
            for (var attr in listObj) {
                attrList.push(listObj[attr]);
                attrsum = kdShare.calcAdd(attrsum, Number(listObj[attr].num));
                itmp = kdShare.calcMul(Number(listObj[attr].num), Number(listObj[attr].price));
                attrsumMoney = kdShare.calcAdd(attrsumMoney, itmp);
            }
            sumNum = kdShare.calcAdd(sumNum, attrsum);
            sumMomey = kdShare.calcAdd(sumMomey, attrsumMoney);
            return $.String.format(samples['li'], {
                img: item.img == "" ? (imgMode ? "img/no_img.png" : noimgModeDefault) : (imgMode ? kdAppSet.getImgThumbnail(item.img) : noimgModeDefault),
                name: item.name,
                attrsum: attrsum + item.unitname,
                attrsumMoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(attrsumMoney),
                'rows': $.Array.map([""], function (row) {
                    return $.String.format(samples['row'], {
                        'rowsli': $.Array.map(attrList, function (row) {
                            return $.String.format(samples['rowli'], {
                                attrname: row.name,
                                attrprice: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(row.price),
                                num: row.num,
                                money: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(Number(row.num), Number(row.price)))
                            });
                        }
                        ).join('')
                    });
                }
                ).join('')
            });
        }).join('');
        billInfo.money = sumMomey;
        freshBillMoney(sumMomey);
        scroller.refresh();
        setPriceVisiable();
    }

    //刷新单据金额
    function freshBillMoney(money) {
        var moneyStr = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(money);
        $("#viewid_cacheOrderList").find(".divbillmoney span").text(moneyStr);
        $('.view_cacheOrderList [data-cmd="totalMoney"]')[0].innerText = moneyStr;
    }

    //检测是否有跨境商品
    function checkOverseaGoods() {
        var data = goodsListArr;
        var inum = data.length;
        var bcheck = false;
        if (!isOutInStore) {
            for (var i = 0; i < inum; i++) {
                if (data[i].isoverseas == 1) {
                    bcheck = true;
                    break;
                }
            }
        }
        var identityView = $('#cacheOrderList_identity');
        bcheck ? identityView.show() : identityView.hide();
    }

    //刷新收货信息
    function freshReceiveInfo(datainfo) {
        $("#orderReceiveName").text(datainfo.name);
        var phone = $("#orderReceivePhone");
        if (datainfo.name == datainfo.mobile) {
            phone.text('');
        } else {
            phone.text(datainfo.mobile);
        }
        $("#orderReceiveAddress").text(datainfo.addressdetail);
        addressInfo = datainfo;
    }

    //获取提交单据的列表数据
    function getListData(data) {

        var tempdata = [];
        var recDate = '';
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var iauxtype = data[i].auxtype;
            if (iauxtype == 0) {
                var temp = {};
                temp.MaterialID = data[i].itemid;
                temp.IsOverseas = data[i].isoverseas;
                temp.UnitID = data[i].unitid;
                temp.AuxID = 0;
                temp.IsGift = 0;
                temp.ActivityID = 0;
                var attrList0 = data[i].attrList;
                temp.Qty = attrList0[0].num;
                temp.Price = attrList0[0].price;
                temp.DiscountPrice = attrList0[0].price;
                temp.DeliverDate = recDate;
                tempdata.push(temp);

            } else if (iauxtype == 1) {

                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    var temp1 = {};
                    temp1.MaterialID = attrList1[j].fitemid;
                    temp1.IsOverseas = data[i].isoverseas;
                    temp1.UnitID = data[i].unitid;
                    temp1.AuxID = 0;
                    temp1.IsGift = 0;
                    temp1.ActivityID = 0;
                    temp1.Qty = attrList1[j].num;
                    temp1.Price = attrList1[j].price;
                    temp1.DiscountPrice = attrList1[j].price;
                    temp1.DeliverDate = recDate;
                    tempdata.push(temp1);
                }

            } else if (iauxtype == 2) {

                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    var temp2 = {};
                    temp2.MaterialID = data[i].itemid;
                    temp2.IsOverseas = data[i].isoverseas;
                    temp2.UnitID = data[i].unitid;
                    temp2.AuxID = attrList2[k].fauxid;
                    temp2.Qty = attrList2[k].num;
                    temp2.Price = attrList2[k].price;
                    temp2.DiscountPrice = attrList2[k].price;
                    temp2.DeliverDate = recDate;
                    temp2.IsGift = 0;
                    temp2.ActivityID = 0;
                    tempdata.push(temp2);
                }
            }
        }
        return tempdata;
    }

    //获取积分兑换的信息
    function getPointsData(data) {
        var points = 0;
        var hasOnlyPoint = false;
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var attrList = data[i].attrList;
            var gnum = attrList.length;
            for (var g = 0; g < gnum; g++) {
                points = points + attrList[g].expoint || 0;
                if (!!attrList[g].onlyexpoint) {
                    hasOnlyPoint = true;
                }
            }
        }
        return {
            points: points,
            hasOnlyPoint: hasOnlyPoint
        };
    }

    //提交订单
    function submitOrder() {

        if (bsummiting) {
            OptMsg.ShowMsg('正在提交订单，请稍候!');
            return;
        }
        bsummiting = true;
        var tempdata = null;
        if (kdAppSet.getUserInfo().identity == 'retail') {
            tempdata = CacheOrderList_Retail.getSubmitData();
        } else {
            tempdata = getListData(goodsListArr);
        }

        var optOpenid = kdAppSet.getUserInfo().optid;
        var remark = $("#cacheOrderRemark")[0].value;
        if (remark == promptTxt) {
            remark = "";
        }
        remark = kdAppSet.ReplaceJsonSpecialChar(remark);

        var identityStr = $(".view_cacheOrderList .identity input")[0].value;
        identityStr = kdAppSet.ReplaceJsonSpecialChar(identityStr);
        kdShare.cache.setCacheData(identityStr, 'identityStr');

        var userinfo = kdAppSet.getUserInfo();
        var contactName = userinfo.contactName;
        var nameStr = addressInfo.name;

        var mobileStr = addressInfo.mobile;
        if (isOutInStore) {
            nameStr = contactName || '';
            mobileStr = userinfo.senderMobile || '';
        }
        nameStr = kdAppSet.ReplaceJsonSpecialChar(nameStr);
        var addressStr = kdAppSet.ReplaceJsonSpecialChar(addressInfo.address);
        var invoiceAddrStr = kdAppSet.ReplaceJsonSpecialChar(invoiceInfo.address);

        var submitData = {
            optOpenid: optOpenid,
            InterID: billId,
            Explanation: remark,
            provincenumber: isOutInStore ? '0' : addressInfo.provincenumber,
            citynumber: isOutInStore ? '0' : addressInfo.citynumber,
            districtnumber: isOutInStore ? '0' : addressInfo.districtnumber,
            name: nameStr,
            mobile: mobileStr,
            IdNumber: identityStr,
            address: isOutInStore ? '现场提货' : addressStr,
            OutInStore: isOutInStore ? 1 : 0,
            NeedInvoice: isNeedInvoice ? 1 : 0,
            InvoiceName: invoiceInfo.invoiceHead,
            InvoiceReceiver: invoiceInfo.name,
            InvoiceReceiverMobile: invoiceInfo.mobile,
            InvoiceReceiverAddress: invoiceAddrStr,
            WXCardNumber: billInfo.cardCode || '',
            WXDiscountMoney: billInfo.freeMoney || 0,
            StoreID: storeInfo.id,
            TakeDate: storeInfo.date,
            EnablePoints: enablePoints,
            BillPoint: billPoint,
            SODetail: tempdata,
            FetchStyle: deliverway//交货方式
        };

        kdAppSet.setKdLoading(true, "正在提交订单...");
        var para = { para: submitData };

        submitOrderApi(function (data) {
            payInfo.billno = data.billno;
            payInfo.interid = data.billId || billId;
            payInfo.billmoney = data.billmoney;
            payInfo.freight = data.freight || 0;
            $("#cacheOrderRemark").val("");
            document.getElementById('popbillno').innerHTML = payInfo.billno;
            kdAppSet.setKdLoading(false);
            finishBillEdit();
            //通知订单列表刷新
            MiniQuery.Event.trigger(window, 'freshListInfo', []);
            //通知购物车刷新数量
            MiniQuery.Event.trigger(window, 'freshListBoxCount', []);

            //初始化门店数据
            if (isOutInStore) {
                initStore();
                fillStore();
            }
            var billMoney = payInfo.billmoney + payInfo.freight;
            refreshPayBtn(billMoney);
            //如果是经销商身份，并且只有线下支付方式，则不出来付款页面
            var user = kdAppSet.getUserInfo();
            var payls = user.allowpayway || [];
            var offpayls = user.offlinesubpay || [];
            if (user.identity != 'retail' && payls.length == 1
                && payls.indexOf('offline') >= 0 && offpayls.length<=1) {
                $('#orderpopupTip').show();
            } else if (kdAppSet.getIsShowPrice() && (billMoney > 0)) {
                //付款
                toPayView();
            } else {
                $('#orderpopupTip').show();
            }

        }, para);
    }

    //跳到微信支付页面
    function toPayView() {
        if (payInfo.billno) {
            payInfo.sendType = isOutInStore ? 1 : 0;
            OrderPay.payBill(payInfo);
            kdShare.clearBackView(1);
        }
    }

    //订单编辑结束
    function finishBillEdit() {
        billId = 0;
        //清空购物车缓存
        kdShare.cache.setCacheData("", kdAppSet.getGoodslistFlag());
        goodsListArr.length = 0;
        //通知完成订单提交
        MiniQuery.Event.trigger(window, 'EditBillFinish', [
            {}
        ]);
    }

    //调用提交订单接口
    function submitOrderApi(fn, para) {

        Lib.API.get('SubmitSaleOrder', para,
            function (data, json) {
                var status = data.status || 0;
                if (status == 0) {
                    bsummiting = false;
                    var billno = data.BillNo || "";
                    var BillIdv = data.BillId || "";
                    if (billno != "") {
                        //发送订单消息
                        OptMsg.NewOrderBill(billno, BillIdv, (billId == 0));
                    }
                    WXCard.consumeCard(billInfo.cardCode);
                    fn && fn({ billId: data.BillId, billno: billno, billmoney: data.BillMoney, freight: data.BillFreight });

                } else if (status == -1) {
                    //库存不足
                    bsummiting = false;
                    kdAppSet.setKdLoading(false);
                    var itemlist = data.itemlist || [];
                    var msg = '库存不足提示\n存在' + itemlist.length + '个库存不足的商品\n请处理后再下单';
                    jAlert(msg, '', function () {
                        MiniQuery.Event.trigger(window, 'toview', ['LowStock', { itemlist: itemlist }]);
                    });
                }
            }, function (code, msg) {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function (errcode) {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert(kdAppSet.getAppMsg.workError + "!错误编码 " + errcode);
            });
    }


    //调用接口获取订单详情
    function getOrderDetail(interID) {

        kdAppSet.setKdLoading(true, "获取订单信息...");
        Lib.API.get('GetOrderDetail', {
            currentPage: 1,
            ItemsOfPage: 9999,
            para: { InterID: interID }
        }, function (data, json) {
            var Explanation = data.Explanation;
            Explanation = Explanation.replace("-此单来自微订货", "");
            if (Explanation == "请在此处输入要备注的信息") {
                Explanation = "";
            }
            var identity = data.IdNumber || '';
            $('.view_cacheOrderList .identity input').val(identity);

            $("#cacheOrderRemark").val(Explanation);
            $('#viewid_cacheOrderList #billId').text(data.BillNo);

            saveBillDataToCache(data.list);
            getDatafromCache();
            isOutInStore = !!data.OutInStore;
            changeExpressMode(!isOutInStore);
            freshReceiveInfo({
                provincenumber: data.provincenumber || 0,
                citynumber: data.citynumber || 0,
                districtnumber: data.districtnumber || 0,
                name: data.name || '',
                mobile: data.mobile || '',
                address: data.address || '',
                addressdetail: data.receiveraddress || ''
            });
            setDeliverway([{
                name: data.FetchStyleName,
                id: data.FetchStyleID
            }]);//交货方式
            changeInvoiceMode(data.NeedInvoice == 1);
            invoiceInfo = {
                invoiceHead: data.InvoiceName,
                name: data.InvoiceReceiver,
                mobile: data.InvoiceReceiverMobile,
                address: data.InvoiceReceiverAddress
            };
            freshInvoiceInfo(invoiceInfo);
            viewPage.find('.view_cacheOrderList').text('￥' + data.freight); //设置运费
            //设置门店信息
            $.Object.extend(storeInfo, {
                id: data.StoreID,
                store: data.StoreName,
                date: data.TakeDate,
                address: data.StoreAddress || ''
            });
            fillStore();
            setInvoiceView(!isOutInStore);
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            jAlert("获取订单信息出错," + msg);
            kdAppSet.setKdLoading(false);
        }, function () {
            kdAppSet.setKdLoading(false);
            jAlert(kdAppSet.getAppMsg.workError);
        }, "");
    }


    //刷新购物车界面状态
    function freshViewStatus() {
        //billId 不等于0 表示是编辑订单
        var view_cacheOrder = $("#viewid_cacheOrderList");
        var cancelChange = view_cacheOrder.find("#cancelChange");
        var orderNumber = view_cacheOrder.find(".orderNumber");
        var billsum = view_cacheOrder.find(".cacheOrder_billsum");
        var cacheOrderListContent = view_cacheOrder.find("#cacheOrderListContent");
        var divid_cacheOrder_billsum = view_cacheOrder.find("#divid_cacheOrder_billsum");


        if (billId == 0) {
            cancelChange.hide();
            orderNumber.hide();
            billsum.css("top", "0");
            $('.view_cacheOrderList .content').attr('style', "min-hight:0px");//最小高度置为0
            if (privilegeInfo !== '') {
                cacheOrderListContent.css("top", "1.66rem");
                divid_cacheOrder_billsum.css("height", "1.66rem");
            } else {
                cacheOrderListContent.css("top", "1.28rem");
                divid_cacheOrder_billsum.css("height", "1.28rem");
            }
        } else {
            cancelChange.show();
            orderNumber.show();
            $('.view_cacheOrderList .content').attr('style', "min-hight:0px");//最小高度置为0
            if (privilegeInfo !== '') {
                cacheOrderListContent.css("top", "2.16rem");
                divid_cacheOrder_billsum.css("height", "2.16rem");
            } else {
                cacheOrderListContent.css("top", "1.78rem");
                divid_cacheOrder_billsum.css("height", "1.78rem");
            }
        }
        scroller.refresh();
        //获取当前高度，并设置最小高度确保底部不被顶起
        var minHeight = $('.view_cacheOrderList .content').height();
        $('.view_cacheOrderList .content').css('min-height', minHeight);

        // 设置最小高度，确保底部不被顶起 --mayue
        //var minHeight = $('.view_cacheOrderList .content').height();
        //if (billId != 0) {
        //    minHeight = minHeight - 25;
        //}
        //$('.view_cacheOrderList .content').css('min-height', minHeight);
    }

    //保存订单数据到缓存
    function saveBillDataToCache(data) {
        var goodslist = JSON.stringify(data);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getOrderlistFlag());
    }

    //由缓存获取数据
    function getDatafromCache() {
        goodsListArr = getDataList();
        freshListView(goodsListArr);
    }

    //获取本地缓存数据
    function getDataList(goodsList) {
        var listStr = kdAppSet.getOrderlistFlag();
        if (goodsList == "goodsList") {
            listStr = kdAppSet.getGoodslistFlag();
        }
        var goodslist = kdShare.cache.getCacheDataObj(listStr);
        var list = [];
        if (goodslist != "") {
            list = JSON.parse(goodslist);
        }
        return list;
    }

    //设置价格信息是否显示
    function setPriceVisiable() {

        if (kdAppSet.getIsShowPrice()) {
            viewPage.find('.billmoney').show();
            viewPage.find('.freight').show();
            viewPage.find(".total").show();
            viewPage.find(".price").show();
        } else {
            viewPage.find('.billmoney').hide();
            viewPage.find('.freight').hide();
            viewPage.find(".total").hide();
            viewPage.find(".price").hide();
        }
    }

    function initCardInfo() {
        //设置微信卡券 初始化空白信息
        billInfo = {};
        var that = $('#cacheOrderList_wxCard');
        that.find('[data-cmd="wxCard-name"]').text('');
        that.removeClass('sprite-delete-a');
        that.addClass('sprite-more');
        //设置是否使用积分兑换  初始化为不使用
        enablePoints = 0;
        viewPage.find('[data-cmd="expoint"]').removeClass('sprite-area_select');
    }

    function render(config) {
        initView();
        privilegeInfo = config.privilegeInfo || '';
        setPrivilegeInfo(privilegeInfo);
        var identityStr = kdShare.cache.getCacheDataObj('identityStr');
        $('.view_cacheOrderList .identity input').val(identityStr);
        if (isOutInStore) {
            setOneStore();
        }
        payInfo = {};
        billPoint=0;
        initCardInfo();
        billId = config.billId || 0;
        show();
        if (billId != 0) {
            //由订单详情 编辑订单跳转过来
            getOrderDetail(billId);
        } else {
            //由购物车 提交订单跳转过来
            var cancelEdit = config.cancelEdit;
            if (cancelEdit) {
                //如果是取消编辑，跳转过来，则读取原订单数据
                goodsListArr = getDataList();
            } else {
                goodsListArr = config.data;
            }
            freshListView(goodsListArr);
            afterRender(config);
        }
        //默认获取用户经纬度
    }

    function afterRender(config) {
        var editbillid = config.editBillId || 0;
        if (editbillid > 0) {
            billId = editbillid;
            freshViewStatus();
        }
    }

    function caculateFreight() {
        var freightSpan = viewPage.find('.freight');
        if (kdAppSet.getUserInfo().ueVersion < 4) {
            viewPage.find('#div-freight-line').hide();
            return;
        }
        viewPage.find('#div-freight-line').show();
        if (isOutInStore || !kdAppSet.getIsShowPrice()) {
            freightSpan.text('￥0');
            return;
        }
        var aitemlist = [];
        var user = kdAppSet.getUserInfo();
        if (user.identity == 'retail') {
            aitemlist = CacheOrderList_Retail.getFreightData();
        } else {
            aitemlist = getItemList();
        }
        var data = {
            provincenumber: addressInfo.provincenumber,
            citynumber: addressInfo.citynumber,
            districtnumber: addressInfo.districtnumber,
            ItemList: aitemlist
        };

        Lib.API.get('GetFreightInfo', { para: data }, function (data, json) {
            freightSpan.text('￥' + data.freight);
        }, function (code, msg) {
            jAlert(msg);
        }, function (errcode) {
            jAlert(kdAppSet.getAppMsg.workError + "!错误编码 " + errcode);
        });
    }

    function getItemList() {
        var arr = [];
        for (var i = goodsListArr.length - 1; i > -1; i--) {
            var item = goodsListArr[i];
            var iauxtype = +item.auxtype;
            switch (iauxtype) {
                case 0:
                    arr.push({
                        ItemID: item.itemid,
                        Price: item.attrList[0].price,
                        Qty: item.attrList[0].num
                    });
                    break;
                case 1:
                    var attrList1 = item.attrList;
                    for (var j = attrList1.length - 1; j > -1; j--) {
                        arr.push({
                            ItemID: attrList1[j].fitemid,
                            Price: attrList1[j].price,
                            Qty: attrList1[j].num
                        });
                    }
                    break;
                case 2:
                    var attrList2 = item.attrList;
                    for (var k = attrList2.length - 1; k > -1; k--) {
                        arr.push({
                            ItemID: item.itemid,
                            Price: attrList2[k].price,
                            Qty: attrList2[k].num
                        });
                    }
            }
        }
        return arr;
    }

    function show() {
        viewPage.show();
        $('#orderpopupTip').hide();
        scroller.refresh();
    }

    function hide() {
        viewPage.hide();
        jSelect.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();

