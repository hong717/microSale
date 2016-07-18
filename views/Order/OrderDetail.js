var OrderDetail = (function () {
    var div, listorderdetail, orderdetailul, orderdetailullist,
        samples, sampleStore, scroller, datalist, viewPage, hasInit,
        billId,user, config,

    //0全部 1待确认 2待发货 3已发货 4 已收货 5未付款  6已付款 7部分发货
        _Status = {
            all: 0,
            check: 1,
            unsend: 2,
            sended: 3,
            receive: 4,
            unpay: 5
        },
        billStatus = {
            readonly: 0,
            edit: 1
        },
    //1 开通微信支付 0 没开通
        wxpay,
    //当前订单信息
        targetorder;


    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view_orderdetail');
            viewPage = $(div);
            listorderdetail = document.getElementById('orderscrollarea');
            scroller = Lib.Scroller.create(listorderdetail);
            orderdetailul = document.getElementById('orderdetailarea');
            orderdetailullist = $(orderdetailul);
            samples = $.String.getTemplates(orderdetailul.innerHTML, [
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
                }
            ]);
            var storeTemplate = document.getElementById('view_orderdetail_store').innerHTML;
            sampleStore = $.String.between(storeTemplate, '<!--', '-->');
            billId = 0;
            targetorder = {};
            datalist = [];
            bindEvents();
            viewPage.find('.receiveimg').attr('src', 'img/receiveman.png');
            viewPage.find('.moneyimg').attr('src', 'img/billmoney.png');
            viewPage.find('.buyagain').attr('src', 'img/buyagain.png');
            viewPage.find('.btnctrl_right img').attr('src', 'img/menubtn_normal.png');
            wxpay = kdAppSet.getAppParam().wxpay;
            PopMenu.bindWithBtn('goodsdetail_popmenu');
            user = kdAppSet.getUserInfo();
            hasInit = true;
        }
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


    function fillStore(storeInfo) {
        var express = viewPage.find('[data-cmd="express"]');
        var store = $('#view_orderdetail_store');
        var listv = $(listorderdetail);
        viewPage.find('[data-type="codeImg"]').hide();
        viewPage.find('[data-type="imgHint"]').hide();
        store[0].innerHTML = $.String.format(sampleStore, {
            'name': storeInfo.storeName || '',
            'address': storeInfo.storeAddress || '',
            'phone': storeInfo.storePhone || '',
            'takeCode': storeInfo.takeCode || '',
            'date': storeInfo.takeDate
        });

        if (storeInfo.isOutInStore == 1) {
            if (storeInfo.takeCode) {
                setTimeout(function () {
                    setTakeCodeImg(viewPage, storeInfo.takeCode);
                }, 50);
            }
            express.hide();
            listv.css({ top:'1.6rem' });
            store.show();
        } else {
            store.hide();
            express.show();

        }
    }

    function setTakeCodeImg(view, takecode) {
        var imgview = view.find('[data-type="codeImg"]');
        view.find('[data-type="imgHint"]').show();
        imgview.show();
        imgview.attr('src', 'img/loading.png');
        var imgurl = getImgQrcodeUrl(takecode);
        imgview.attr('src', imgurl);
    }

    function setViewInfo() {
        viewPage.find('[data-cmd="express"]').hide();
        $('#view_orderdetail_store').hide();
        if (kdAppSet.getUserInfo().ueVersion < 4) {
            $('.orderdetail_express').hide();
        }
        else {
            $('.orderdetail_express').show();
        }
    }


    function render(configp) {
        config = configp;
        initView();
        setViewInfo();
        show();
        // 隐藏菜单栏
        HideMenuBar(true);
        kdAppSet.setKdLoading(false);
        billId = config.billId;
        freshBtnInfo(config);
        getOrderItemInfor(billId);
    }

    function freshBtnInfo(config) {
        $("#view_orderdetail .orderdetail_btnctrl").hide();
        if (config.isReject) {
            viewPage.find('.orderdetailRejectDiv').show();
        } else {
            viewPage.find('.orderdetailRejectDiv').hide();
        }
    }


    function setView(item) {

        $("#view_orderdetail .orderdetail_btnctrl").show();
        $('#orderdetail_receivename')[0].innerHTML = item.name;
        $('#orderdetail_receivephone')[0].innerHTML = item.mobile;
        $('#orderdetail_address')[0].innerHTML = item.address;
        $('#orderdetail-status')[0].innerHTML = getStatusName(item.status);
        $('#orderdetail-count-1')[0].innerHTML = item.num;
        $('#orderdetail-amount-1')[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(item.billmoney); //合计金额
        $('#orderdetail_freight').html('￥' + item.freight);
        $('#orderdetail_identity')[0].innerHTML = item.identity;

        var identityView = $('.view_orderdetail .identity');
        var listv = $(listorderdetail);
        if (item.identity == '') {
            listv.css({ top:'3.08rem' });
            if(targetorder.isOutInStore == 1){listv.css({ top:'1.6rem' });}
            identityView.hide();
        } else {
            listv.css({ top:'3.48rem' });
            identityView.show();
        }
        var ordertotalInfo = $('.ordertotalInfo');
        ordertotalInfo.find('.order').html(item.billno);
        ordertotalInfo.find('.bookDate').html(item.date);
        ordertotalInfo.find('.orderPoint').html(item.point + "积分");
        ordertotalInfo.find('.billexPoint').html(item.billexpoint + "积分");
        ordertotalInfo.find('.maker').html(item.buyername);
        ordertotalInfo.find('.deliverway').html(item.FetchStyleName);
    }

    //刷新订单详情界面
    function freshViewInfo(item) {

        setView(item);

        //经销商隐藏本次积分，显示交货方式
        var orderPoint = $('#orderDetail-Point');//获取积分
        var billexpoint = viewPage.find('[data-cmd="orderDetail-billexPoint"]');//消费积分
        var deliverway = viewPage.find('[data-cmd="orderDetail-deliverway"]');//交货方式

        if (user.identity != 'retail') {
            orderPoint.hide();
            billexpoint.hide();
            deliverway.show();
        } else {
            orderPoint.show();
            billexpoint.show();
            deliverway.hide();
        }

        var receive_btn = $('#orderdetail_receive_btn');
        receive_btn.parent().show();
        if (item.status == _Status.receive) {
            receive_btn.parent().hide();
            //receive_btn.find('span').html('已确认收货');
        }
        else if (item.status == _Status.sended) {
            receive_btn.find('span').html('确认收货');
            receive_btn.attr('class', 'orderdetail_receive');
        }
        else if (item.status == _Status.check) {
            receive_btn.find('span').html('修改订单');
            receive_btn.attr('class', 'orderdetail_changeOrder');
            if (item.canedit == billStatus.readonly) {
                receive_btn.parent().hide();
            }

            //如果是零售用户，则只能删除订单，不能修改订单
            if(user.identity == 'retail' && item.canedit == billStatus.edit){
                var btnDelete=receive_btn.find('span');
                btnDelete.removeClass('sprite-open');
                btnDelete.css({'padding-right':0});
                btnDelete.html('删除订单');
            }
        }
        else if (item.status == _Status.receive) {
        }
        else {
            receive_btn.find('span').html('提醒厂家');
            receive_btn.attr('class', 'orderdetail_received');
        }

        if (item.status == _Status.check) {
            receive_btn.css({ background: '#fff', color: '#8c9093' });
        } else if (item.status != _Status.unsend) {
            receive_btn.css({ background: '#fff', color: '#FF6427' });
        } else {
            receive_btn.css({ background: '#fff', color: '#FF6427' });
        }


        //设置付款按钮状态
        var ctrl = viewPage.find('[data-cmd="btnCtrl"]');
        var billPayed = (item.paystatus > 0);
        //如果是经销商身份，有做过付款通知单 也算已付款
        if (user.identity != 'retail' && item.payno != '') {
            billPayed = true;
        }

        var btnpay = $('#orderdetail_payBtn span');
        var orderPayBtn = $('#orderdetail_payBtn');

        //如果是门店自提 并且已经付款，则不显示底部按钮
        if ((item.sendType == 1) && billPayed) {
            ctrl.hide();
        } else {
            ctrl.show();
        }

        var takecode = viewPage.find('[data-type="takecode"]');
        //如果是买家订单列表过来的，则不显示底部按钮，并且不显示提货码
        if (config && config.from == 'buyerOrderList') {
            ctrl.hide();
            setTimeout(function () {
                try {
                    takecode[0].innerText = '提货码：**** ****';
                    viewPage.find('[data-type="codeImg"]').hide();
                    viewPage.find('[data-type="imgHint"]').hide();
                } catch (e) {
                }
            }, 50);
        }


        if (wxpay == 1) {
            //开启微信支付
            if (billPayed) {
                hidePayMenu(true);
                setBtnPayView(btnpay, '查看付款单');

            } else {
                if (user.identity == 'retail') {
                    //零售用户
                    hidePayMenu(true);
                    setBtnPayView(btnpay, '付款');
                } else {
                    //经销商
                    btnpay.text('付款');
                    btnpay.removeClass('sprite-open');
                    btnpay.removeClass('sprite-open_s');
                }
            }
        } else {
            hidePayMenu(true);
            if (billPayed) {
                setBtnPayView(btnpay, '查看付款单');
            } else {
                setBtnPayView(btnpay, '付款');
            }

        }

        if (billPayed) {
            //如果是门店提货或者储值卡付款,实体卡  都不能查看付款单
            if (item.sendType == 1 || item.paystatus == 3  || item.paystatus == 6) {
                orderPayBtn.hide();
            } else {
                orderPayBtn.show();
            }
        } else {
            if (item.billmoney + Number(item.freight) > 0) {
                orderPayBtn.show();
            } else {
                orderPayBtn.hide();
            }
            //零售用户 并且是线下支付方式 则不显示付款按钮
            if (kdAppSet.getUserInfo().identity == 'retail' && item.payType == 'offline') {
                orderPayBtn.hide();
            }
        }

        //如果是已发货 或者已收货，并且不是由退货申请单过来 则隐藏收款按钮  显示退货按钮 ，
        var returnBtn = $('#orderdetail_return_btn');
        if ((targetorder.status == _Status.sended || targetorder.status == _Status.receive) && !config.isReject) {
            orderPayBtn.hide();
            returnBtn.show();
        } else {
            returnBtn.hide();
        }

    }

    function setBtnPayView(btnpay, btnname) {
        btnpay.text(btnname);
        btnpay.removeClass('sprite-open');
        btnpay.removeClass('sprite-open_s');
        btnpay.css('padding-right', '0');
    }

    //刷新订单详情列表
    function freshListViewInfo(data) {
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
		var status = false;
        //for (i in data.SEOrderItems) {
        //    if ((data.SEOrderItems[i].OutAuxQty != 0) && (data.status == 7)) {
        //        status = true;//待发货状态并且有已出库商品，显示已出库
        //        break;
        //    }
        //}
        orderdetailul.innerHTML = $.Array.map(data.SEOrderItems, function (item, pindex) {
            return $.String.format(samples['li'], {
                index: pindex,
                fparentid: item.FParentID,
                fitemid: item.FItemID,
                gift: item.FIsGift == 0 ? 'hide' : '',
                name: item.FName,
                num: item.FAuxQty + " " + item.FUnitName,
                model: item.FModel,
                totalMoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.FSumMoney)), //商品总价
                img: item.FImageUrl != '' ? (imgMode ? kdAppSet.getImgThumbnail(item.FImageUrl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                hasAttrList: item.FRemark == "0" ? "display:none" : "display:block",
                totalTxt: item.FRemark == "0" ? "display:none" : "display:block", // 只有一个类别的隐藏‘小计’文本
                out_good: data.status == 7 ? "display:block" : "display:none",//待发货状态并且有已出库商品，显示已出库
                OutAuxQty: item.OutAuxQty + " " + item.FUnitName,
                OutAmount: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.OutAmount)),
                attrListFlag: item.FRemark,
                'rows': ""
            });
        }).join('');
        setPriceVisiable();
        $('#orderdetail-money').html(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(data.BillMoney));
        $('.ordertotalInfo .note').html(data.Explanation);
        showPayInfo(data);
        var ctrlSum = $("#view-orderdetail").find(".orderdetail-sum");
        if (data.SEOrderItems.length > 2) {
            ctrlSum.show();
        } else {
            ctrlSum.hide();
        }
        scroller.refresh();
    }


    function showPayInfo(data) {
        //设置支付信息
        var paystatus = data.paystatus || 0;
        var payinfo = viewPage.find('.payinfo');
        if (paystatus > 0) {
            payinfo.show();
            if (paystatus == 1) {
                payinfo.attr('src', 'img/wx_pay.png');
            } else if (paystatus == 2) {
                payinfo.attr('src', 'img/lineoff_pay.png');
            } else if (paystatus == 3) {
                payinfo.attr('src', 'img/prepay.png');
            }else if (paystatus == 4) {
                //支付宝支付
                payinfo.attr('src', 'img/alipay_list.png');
            } else if (paystatus == 5) {
                //资金通支付
                payinfo.attr('src', 'img/zjt_list.png');
            }
        } else {
            payinfo.hide();
        }
    }

    //获取订单详情
    function getOrderItemInfor(interid) {
        $('.paybuttonList').hide();
        var parax = { InterID: interid };
        var para = { currentPage: 1, ItemsOfPage: 50, para: parax };
        orderdetailullist.empty();
        removeHintList();
        orderdetailullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        GetOrderItemInforAPI(function (data) {
            targetorder = {
                interid: interid,
                status: data.status,
                paystatus: data.paystatus,
                num: data.num,
                date: data.date,
                billmoney: data.BillMoney || 0,
                address: data.address,
                name: data.name,
                mobile: data.mobile,
                buyername: data.buyername,
                billno: data.billno,
                payno: data.payNo || '',
                canedit: data.canedit || 0,
                expresscom: data.expresscom || '',
                expressnumber: data.expressnumber || '',
                isOutInStore: data.OutInStore,
                identity: data.IdNumber || '',
                freight: Number(data.freight) || 0,
                storeID: data.StoreID,
                takeDate: data.TakeDate,
                storeName: data.StoreName,
                storePhone: data.StorePhone,
                storeAddress: data.StoreAddress,
                point: data.billVantage,
                takeCode: data.TakeCode,
                payType: data.PayType || '',
                sendType: data.SendType || '',
                billexpoint: data.billexpoint || 0,
                FetchStyleName: data.FetchStyleName || "快递送货"
            };
            fillStore(targetorder);
            freshViewInfo(targetorder);
            freshListViewInfo(data);
        }, para);

        function GetOrderItemInforAPI(fn, para) {
            Lib.API.get('GetSEOrderItem', para,
                function (data, json) {
                    removeHintList();
                    datalist = data || [];
                    fn && fn(datalist);
                }, function (code, msg, json) {
                    removeHintList();
                    orderdetailullist.append('<li class="hintflag">' + msg + '</li>');
                    //在导购分享过来的链接，即使没权限也能保证能进入微商城
                    viewPage.find(".orderdetail_btnctrl").show();
                    viewPage.find('[data-cmd="btnCtrl"]').hide();
                }, function () {
                    removeHintList();
                    orderdetailullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
                });
        }
    }

    function getStatusName(index) {
        index = index || 0;
        var statusList = ["", "待确认", "待发货", "已发货", "已收货","","","部分发货"];
        return statusList[index];
    }

    function removeHintAttrList(attrLst) {
        attrLst.children().filter('.hintflag').remove();
    }

    function removeHintList() {
        orderdetailullist.children().filter('.hintflag').remove();
    }

    //显示商品辅助属性
    function showAttrLst(datalist, attrLst) {
        var attrLstHtml = $.Array.map(datalist, function (row) {
                return $.String.format(samples['row'], {
                    attrname: row.FAuxName,
                    attrnum: row.FAuxQty + row.FUnitName,
                    attrprice: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(row.FPrice)  // 添加商品单价
                });
            }
        ).join('');
        attrLst.empty();
        attrLst.append(attrLstHtml);
        setPriceVisiable();
        scroller.refresh();
    }

    function showDetail(curclick) {
        var ctrlli = curclick.parent();
        var index = ctrlli.attr("index");
        var attrLst = ctrlli.find(".attrList");
        if (attrLst.css("display") == "none") {
            attrLst.show();
            if (attrLst.children().length > 0) {
                return;
            }
        } else {
            attrLst.hide();
            return;
        }
        removeHintAttrList(attrLst);
        attrLst.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        var itemclick = datalist.SEOrderItems[index];
        Lib.API.get('GetSEOrderItemDetail', {
            currentPage: 1,
            ItemsOfPage: 100,
            para: {
                InterID: targetorder.interid,
                ItemID: itemclick.FItemID
            }
        }, function (data) {
            var datalist = data.SEOrderItemDetail || [];
            showAttrLst(datalist, attrLst);
        }, function (code, msg) {
            removeHintAttrList(attrLst);
            attrLst.append('<li class="hintflag">' + msg + '</li>');
            scroller.refresh();
        }, function () {
            removeHintAttrList(attrLst);
            attrLst.append('<li class="hintflag">网络错误，请稍候再试</li>');
            scroller.refresh();
        }, "");

    }

    function bindEvents() {


        //支付完成后 刷新提货码
        MiniQuery.Event.bind(window, {
            'OrderDetailTakeCode': function (config) {
                if (config && billId == config.billid && config.takecode != '') {
                    var view = $('#view_orderdetail');
                    var takecode = view.find('[data-type="takecode"]');
                    takecode[0].innerText = '提货码：' + config.takecode;
                    setTakeCodeImg(view, config.takecode);
                    $('#view_orderdetail .orderPoint').html(config.point);
                }
            }
        });


        //设置支付方式后 如果是零售用户，并且是线下支付，要隐藏付款按钮
        MiniQuery.Event.bind(window, {
            'OrderDetailSetPayBtn': function (config) {
                if (config && billId == config.billid) {
                    var orderPayBtn = $('#orderdetail_payBtn');
                    orderPayBtn.hide();
                }
            }
        });

        //刷新订单支付信息
        MiniQuery.Event.bind(window, {
            'freshOrderPayNo': function (payinfo) {
                //{payno:data.payNo,billid:order.interid}
                var interid = payinfo.billid;
                if (interid == billId) {
                    targetorder.payno = payinfo.payno;
                    setBtnPayView($('#orderdetail_payBtn span'), '查看付款单');
                    var receive_btn = $('#orderdetail_receive_btn');
                    if (receive_btn.find('span')[0].innerText == '修改订单') {
                        receive_btn.parent().hide();
                    }
                    if (payinfo.payType == 'prepay') {
                        $('#orderdetail_payBtn').hide();
                    }
                }
            }
        });


        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            }
        });

        viewPage.delegate('.btn-freightRule', 'click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['FreightRule']);
        });


        //再次购买
        $("#view_orderdetail").delegate('.buyagain', {
            'click': function () {
                var curBill = targetorder.interid;
                MiniQuery.Event.trigger(window, 'toview', ['CacheList', { copyBillId: curBill }]);
            },
            'touchstart': function () {
                $(this).attr('src', 'img/buyagain_s.png');
            },
            'touchend': function () {
                $(this).attr('src', 'img/buyagain.png');
            }
        });

        //商品明细展开
        $("#orderdetailarea").delegate('.rowhead', {
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
                $(this).find("img").css('background', '#fff');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            },
            'click': function (event) {
                if (event.target.nodeName == "IMG") {
                    //商品详情
                    var index = $(this).attr("index");
                    var itemclick = datalist.SEOrderItems[index];
                    MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: { itemid: itemclick.FItemID } }]);
                } else {
                    var attrListFlag = $(this).attr("attrListFlag");
                    if (attrListFlag == 1) {
                        showDetail($(this));
                    }
                    var icon = $(this).find('.sumMsg div');
                    kdShare.changeClassOfTouch(icon, 'unfold_s', 'unfold');
                }
            }
        });


        //付款 按钮
        viewPage.delegate('#orderdetail_payBtn', {
            'click': function () {
                if (this.innerText == '付款') {
                    //hidePayMenu();
                    //改为弹出付款方式
                    OrderPay.payBill({
                        interid: targetorder.interid,
                        billno: targetorder.billno,
                        billmoney: targetorder.billmoney,
                        freight: targetorder.freight,
                        payType: targetorder.payType,
                        sendType: targetorder.sendType
                    });
                }
                else if (this.innerText == '付款通知') {
                    newPayDetail();
                }
                else if (this.innerText == '付款') {
                    //零售用户 付款
                    if (!kdAppSet.getIsShowPrice() || wxpay != 1) {
                        jAlert('暂时无法付款，请联系商家');
                        return;
                    }
                    OrderPay.payBill(targetorder, '', 1);
                }
                else {
                    OrderPay.viewPayBill(targetorder);
                }
                HideMenuBar(true);
            },
            'touchstart': function () {
                $(this).css({ background: '#8c9093', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#8c9093' });
            }
        });


        //客服
        viewPage.delegate('[data-cmd="chat"]', {
            'click': function () {
                kdShare.openChat({});
            }
        });

        //付款
        viewPage.delegate('.paybuttonList .payNow', {
            'click': function () {
                if (!kdAppSet.getIsShowPrice() || wxpay != 1) {
                    jAlert('暂时无法付款，请联系商家');
                    return;
                }
                OrderPay.payBill(targetorder, '', 1);
                hidePayMenu(true);
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //付款通知
        viewPage.delegate('.paybuttonList .payNotify', {
            'click': function () {
                newPayDetail();
                hidePayMenu(true);
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //退货
        viewPage.delegate('#orderdetail_return_btn  .orderdetail_receive', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectBillList', {}]);
            },
            'touchstart': function () {
                $(this).css({ background: '#8c9093', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#8c9093' });
            }
        });


        //确认收货 修改订单 订单提醒  零售用户删除订单
        viewPage.delegate('#orderdetail_receive_btn',
            {
                'click': function () {
                    if (targetorder.status == _Status.sended) {
                        CheckOrder()
                    }
                    else if ((targetorder.status == _Status.check)) {
                        HideMenuBar();
                        hidePayMenu(true);
                        if(user.identity == 'retail'){
                            CancelOrder();
                        }
                    }
                    else if ((targetorder.status == _Status.receive)) {
                        OptMsg.ShowMsg('重复收货！');
                    }
                    else {
                        var billno = $('.ordertotalInfo .order').text();
                        OptMsg.OrderBillRemind(billno);
                    }
                },
                'touchstart': function () {
                    if (targetorder.status == _Status.check  && user.identity != 'retail') {

                    }  else if(targetorder.status == _Status.check  && user.identity == 'retail'){
                        $(this).css({ background: '#8c9093', color: '#fff' });
                    }else{
                        $(this).css({ background: '#ff6427', color: '#fff' });
                    }
                },
                'touchend': function () {
                    if (targetorder.status == _Status.check  && user.identity != 'retail') {
                    }else if(targetorder.status == _Status.check  && user.identity == 'retail'){
                        $(this).css({ background: '#fff', color: '#8c9093' });
                    } else {
                        $(this).css({ background: '#fff', color: '#ff6427' });
                    }
                }
            }
        );

        //取消订单
        viewPage.delegate('.orderbuttonList .cancelOrder', {
            'click': function () {
                HideMenuBar();
                CancelOrder();
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //修改订单
        viewPage.delegate('.orderbuttonList .changeOrder', {
            'click': function () {
                HideMenuBar();
                EditOrder();
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //申请退货
        viewPage.delegate('.orderdetailRejectDiv .rejectBtn', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelect', { billid: billId }]);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }
        })
    }

    //新增付款通知单
    function newPayDetail() {
        MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
            {
                newbill: true,
                payNo: '',
                payOrder: targetorder.billno,
                paymoney: kdAppSet.getIsShowPrice() ? targetorder.billmoney : null,
                payBillId: targetorder.interid
            }
        ]);
    }

    function hidePayMenu(ishide) {
        //hong
        var btn = $('#orderdetail_payBtn');
        if (btn.hasClass('orderdetail_payBtn') && !ishide) {
            btn.removeClass('orderdetail_payBtn');
            btn.addClass('orderdetail_payBtn_s');
            btn.find('span').attr('class', 'sprite-open_s');
            $('.paybuttonList').show();
        } else {
            btn.removeClass('orderdetail_payBtn_s');
            btn.addClass('orderdetail_payBtn');
            //btn.find('span').attr('class', 'sprite-open');
            $('.paybuttonList').hide();
        }
        if (wxpay != 1) {
            btn.find('span').attr('class', '');
        }

        //如果是已收货 则付款按钮位置会在最右边
        if (targetorder.status == _Status.receive) {
            $('.view_orderdetail .paybuttonList').css("right", "1rem");
        } else {
            $('.view_orderdetail .paybuttonList').css("left", "1rem");
        }

    }

    function HideMenuBar(isHide) {

        var btn = $('#orderdetail_receive_btn');
        var btnTitle=btn.find('span')[0].innerText;
        if ( btnTitle== '修改订单') {
            if (btn.attr('class') == 'orderdetail_changeOrder' && !isHide) {
                btn.attr('class', 'orderdetail_changeOrder_s');
                btn.find('span').attr('class', 'sprite-open_s');
                $('.orderbuttonList').show();
            } else {
                btn.attr('class', 'orderdetail_changeOrder');
                btn.find('span').attr('class', 'sprite-open');
                $('.orderbuttonList').hide();
            }
        } else if(btnTitle== '删除订单'){

        }
    }

    function EditOrder() {
        var curBill = targetorder.interid;
        MiniQuery.Event.trigger(window, 'toview', ['CacheOrderList', { billId: curBill }]);
    }

    function CancelOrder() {
        jConfirm("你确定要取消订单?", null, function (flag) {
            if (flag) {
                var para = { currentPage: 1, ItemsOfPage: 10 };
                para.para = { billno: targetorder.billno };
                CancelOrderApi(function (data) {
                    //通知购物车取消订单
                    MiniQuery.Event.trigger(window, 'EditBillFinish', [
                        { billid: targetorder.interid }
                    ]);
                    //通知订单列表刷新
                    MiniQuery.Event.trigger(window, 'freshListInfo', []);
                    OptMsg.ShowMsg(data[0].result);

                    setTimeout(function () {
                        kdShare.backView();
                    }, 500);
                    //刷新待付款列表
                    MiniQuery.Event.trigger(window, 'freshPaymentListInfo', []);
                }, para);
                function CancelOrderApi(fn, para) {
                    Lib.API.get('DelOrderByBillId', para,
                        function (data) {
                            fn && fn(data['resultlist']);
                        }, function () {
                            kdAppSet.setKdLoading(false);
                        }, function () {
                            kdAppSet.setKdLoading(false);
                        }
                    );
                }
            } else {
            }
        }, { ok: "是", no: "否" });
    }


    function CheckOrder() {
        var para = { currentPage: 1, ItemsOfPage: 10 };
        para.para = { interid: targetorder.interid };
        checkorderAPI(function (data) {
            if (data == 'ok') {
                var receive_btn = $('#orderdetail_receive_btn');
                receive_btn.find('span').html('已确认收货');
                $('#orderdetail-status').html('已收货');
                if (receive_btn.hasClass('orderdetail_receive')) {
                    receive_btn.removeClass('orderdetail_receive');
                }
                receive_btn.addClass('orderdetail_received');
                targetorder.status = _Status.receive;
                receive_btn.parent().css('display', 'none');
                OptMsg.ReceiveOrderGoods(targetorder.billno);
                OptMsg.ShowMsg('收货成功！');
            }
        }, para);
        function checkorderAPI(fn, para) {
            Lib.API.get('CheckOrder', para,
                function (data) {
                    fn && fn(data['Status']);
                }, function () {
                    kdAppSet.setKdLoading(false);
                }, function () {
                    kdAppSet.setKdLoading(false);
                });
        }
    }

    function setPriceVisiable() {
        var showPrice = $('#orderscrollarea .showPrice');
        var totalMoney = $('#orderscrollarea .totalMoney');
        var moneyDiv = $('.orderdetail-top .moneyDiv');
        var money = $('#orderdetail-money');
        var freight = $('#orderdetail_freight');
        if (kdAppSet.getIsShowPrice()) {
            showPrice.show();
            totalMoney.show();
            moneyDiv.show();
            money.show();
            freight.show();
        } else {
            showPrice.hide();
            totalMoney.hide();
            moneyDiv.hide();
            money.hide();
            freight.hide();
        }
    }

    function show() {
        OptAppMenu.showKdAppMenu(false);
        viewPage.show();
    }

    function hide() {
        hidePayMenu(true);
        viewPage.hide();
        PopMenu.hideElem();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();

