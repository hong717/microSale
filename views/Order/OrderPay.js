var OrderPay = (function () {
    //查看付款单
    //var payBillFlag = 'kdCreatePayBillFlag';

    function viewPayBill(order) {
        MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
            {
                payNo: order.payno,
                payOrder: order.billno
            }
        ]);
        kdAppSet.stopEventPropagation();
    }

    //订单支付
    function payBill(payInfo) {
        /*        var payInfo = {
         billno: '',
         interid: '',
         billmoney: '',
         freight: '',
         payType:'',//付款方式 "offline", "prepay", "wx"  ""
         sendType:'' //送货方式 配送方式（0--快递；1--门店自提；）
         };*/
        if (payInfo.payType == 'offline') {
            //线下
            MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                {
                    newbill: true,
                    payNo: '',
                    payOrder: payInfo.billno,
                    paymoney: kdAppSet.getIsShowPrice() ? payInfo.billmoney : null,
                    payBillId: payInfo.interid
                }
            ]);
        } else {
            MiniQuery.Event.trigger(window, 'toview', ['PayList', payInfo]);
        }
    }

    //微信支付
    function wxPay(order) {
        var NetID = window.kis$NetID || '';
        if (NetID) {
            callWx(order, NetID)
        } else {

            var eid = kdAppSet.getAppParam().eid;
            var mobile = kdAppSet.getUserInfo().senderMobile;
            OptLog.debug('发起getNetid: eid=' + eid + ' mobile=' + mobile + ' netid:' + window.kis$NetID);
            KDNetID.get(eid, function (msg, data) {
                if (msg == 'ok') {
                    OptLog.debug('返回getNetid: eid=' + eid + ' mobile=' + mobile + ' netid:' + data.NetID);
                    NetID = data.NetID || '';
                    if (NetID) {
                        callWx(order, NetID);
                    } else {
                        jAlert('NetID为空，发起支付出现异常，请稍后重试');
                    }
                } else {
                    jAlert('发起支付出现异常，请稍后重试');
                }
            });
        }
    }

    //微信代付
    function wxPayOther(order) {
        var urlpay = getWxPayUrl(order);
        MiniQuery.Event.trigger(window, 'toview', ['PayCode', {url: urlpay, pay: order}]);
    }

    //获取微信代付链接
    function getWxPayUrl(order) {
        var NetID = window.kis$NetID || '';
        var appParam = kdAppSet.getAppParam();
        var appId = appParam.appid;
        var eId = appParam.eid;
        var openId = appParam.openid;
        var billNo = order.billno;

        var freight = Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);

        var user = kdAppSet.getUserInfo();
        var contactName = encodeURIComponent(user.contactName);
        var senderMobile = encodeURIComponent(user.senderMobile);
        var cmpName = encodeURIComponent(encodeURIComponent(user.companyName));

        var payBackUrl = window.location.href.split('?')[0];
        payBackUrl = payBackUrl.replace("start.html", "index.html") + '?eid=' + eId;
        payBackUrl = encodeURIComponent(payBackUrl);

        var param = '?appid=' + appId + '&NetID=' + NetID + '&eid=' + eId + '&optOpenid=' + openId + '&billno=' + billNo
            + '&billmoney=' + sumMoney + '&contactName=' + contactName + '&senderMobile=' + senderMobile
            + '&cmpName=' + cmpName + '&payBackUrl=' + payBackUrl;
        var urlpay = 'http://mob.cmcloud.cn/webapp/PayOther/index.html';
        urlpay = urlpay + param;
        return urlpay;
    }

    function callWx(order, NetID) {

        var appParam = kdAppSet.getAppParam();
        var appId = appParam.appid;
        var eId = appParam.eid;
        var openId = appParam.openid;
        var billNo = order.billno;

        var freight = Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);
        if (sumMoney <= 0 || !kdAppSet.getIsShowPrice()) {
            MiniQuery.Event.trigger(window, 'toview', []);
        }

        var callbackUrl = window.location.href.split('?')[0] || '';
        callbackUrl = encodeURIComponent(callbackUrl);

        var user = kdAppSet.getUserInfo();
        var contactName = encodeURIComponent(user.contactName);
        var senderMobile = encodeURIComponent(user.senderMobile);
        var cmpName = encodeURIComponent(encodeURIComponent(user.companyName));

        var toview = 'OrderDetail|' + order.interid;
        var param = '?appid=' + appId + '&NetID=' + NetID + '&eid=' + eId + '&openid=' + openId + '&billno=' + billNo
            + '&billmoney=' + sumMoney + '&contactName=' + contactName + '&senderMobile=' + senderMobile
            + '&callbackurl=' + callbackUrl + '&toviewflag=' + toview + '&cmpName=' + cmpName;

        var urlpay = 'http://mob.cmcloud.cn/webapp/weixinPay/wxPay.html';
        urlpay = urlpay + param;
        window.location.href = urlpay;
    }


    //支付宝支付
    function aliPay(order) {

        var NetID = window.kis$NetID || '';
        if (NetID) {
            callAli(order, NetID)
        } else {
            KDNetID.get(kdAppSet.getAppParam().eid, function (msg, data) {
                if (msg == 'ok') {
                    NetID = data.NetID || '';
                    if (NetID) {
                        callAli(order, NetID);
                    } else {
                        jAlert('NetID为空，发起支付出现异常，请稍后重试');
                    }
                } else {
                    jAlert('发起支付出现异常，请稍后重试');
                }
            });
        }

    }

    function callAli(order, NetID) {
        var billNo = order.billno;
        var user = kdAppSet.getUserInfo();
        var freight = Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);
        if (sumMoney <= 0 || !kdAppSet.getIsShowPrice()) {
            MiniQuery.Event.trigger(window, 'toview', []);
        }
        var cmpName = encodeURIComponent(encodeURIComponent(user.companyName));
        var payLink = window.location.href.split('?')[0] || "kdurl_error";
        payLink = payLink.replace("start.html", "alipay.html") + '?alipay=1&billmoney=' + sumMoney + '&NetID=' + NetID + '&billno=' + billNo + '&cmpName=' + cmpName;
        MiniQuery.Event.trigger(window, 'toview', ['commonIframe', {src: payLink}]);
    }

    //资金通支付
    function zjtPay(order) {

        var NetID = window.kis$NetID || '';
        if (NetID) {
            callZjt(order, NetID)
        } else {
            KDNetID.get(kdAppSet.getAppParam().eid, function (msg, data) {
                if (msg == 'ok') {
                    NetID = data.NetID || '';
                    if (NetID) {
                        callZjt(order, NetID);
                    } else {
                        jAlert('NetID为空，发起支付出现异常，请稍后重试');
                    }
                } else {
                    jAlert('发起支付出现异常，请稍后重试');
                }
            });
        }

    }

    function callZjt(order, NetID) {

        var billNo = order.billno;
        var freight = kdAppSet.getUserInfo().ueVersion < 4 ? 0 : Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);
        if (sumMoney <= 0 || !kdAppSet.getIsShowPrice()) {
            MiniQuery.Event.trigger(window, 'toview', []);
        }
        var payLink = window.location.href.split('?')[0] || "kdurl_error";
        payLink = payLink.replace("start.html", "zjtpay.html") + '?zjtpay=1&billmoney=' + sumMoney + '&billno=' + billNo + '&NetID=' + NetID;
        MiniQuery.Event.trigger(window, 'toview', ['commonIframe', {src: payLink}]);
    }

    //储值卡支付
    function cardPay(pay, vipMoney, payType) {
        /*billno: '',
         interid: '',
         billmoney: '',
         freight: ''
         payType:'',//付款方式 "offline", "prepay", "wx"  ""
         sendType:'' //送货方式 配送方式（0--快递；1--门店自提；）
         */
        var money = pay.billmoney + pay.freight;
        var payWay = 2;
        if (payType == 'vipcard') {
            payWay = 6;
        }
        var para = {
            payWay: payWay,
            payNo: '',
            payMoney: money,
            payDate: kdShare.getToday(),
            payMsg: '',
            payOrder: pay.billno,
            payTargetBank: '',
            payTargetBankNo: '',
            payImgList: []
        };
        kdAppSet.setKdLoading(true, "提交支付信息..");
        Lib.API.get('setPayOrderInfo', {
                para: para
            },
            function (data) {
                kdAppSet.setKdLoading(false);
                // OptMsg.ShowMsg(data.Msg);
                if (data.status == '0') {

                    if (payType == 'prepay') {
                        kdAppSet.updateUserInfo({
                            vipAmount: (vipMoney - money)
                        });
                    }else{
                        kdAppSet.updateUserInfo({
                            vipcardAmount: (vipMoney - money)
                        });
                    }

                    var payno = data.payNo || '';
                    MiniQuery.Event.trigger(window, 'freshOrderPayNo', [
                        {payno: payno, billid: pay.interid, payType: payType}
                    ]);
                    MiniQuery.Event.trigger(window, 'OrderDetailTakeCode', [
                        {billid: pay.interid, takecode: data.takecode, point: data.vantage }
                    ]);
                    OptMsg.PayBillMsg({
                        money: para.payMoney,
                        orderno: pay.billno,
                        billno: payno
                    });

                    //如果是门店自提 则要跳转到订单详情
                    if (pay.sendType == 1) {
                        OptMsg.ShowMsg('已支付,并生成提货码,请查看!', function () {
                            autoBack = true;
                            MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                                billId: pay.interid
                            }]);
                        }, 2000);
                    } else {
                        OptMsg.ShowMsg('已支付!', function () {
                            kdShare.backView();
                        }, 1500);
                    }
                }
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                jAlert("提交支付信息出错:" + msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('提交支付信息出错!');
            });
    }


    return {
        viewPayBill: viewPayBill,
        payBill: payBill,
        aliPay: aliPay,
        zjtPay: zjtPay,
        wxPay: wxPay,
        wxPayOther: wxPayOther,
        getWxPayUrl: getWxPayUrl,
        cardPay: cardPay
    };
})
();

