var PayList = (function () {
    var payKey = 'MicroSalePayType';
    var scroller, ullist, viewpage, payInfo, payType, offlinePay, vipMoney, vipcardMoney, autoBack, hasInit;

    //payWay  0 线下支付  1 微信支付  2 储值卡  4--支付宝  5--资金通 6-实体卡

    //支付完成后回退到上一个界面
    MiniQuery.Event.bind(window, {
        'PayListBackView': function (pay) {
            if (payInfo && pay.billid == payInfo.interid) {
                kdShare.backView();
            }
        }
    });

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-pay-list');
            viewpage = $(div);
            var divlist = document.getElementById('div-view-pay-list');
            var ul = divlist.firstElementChild;
            ullist = $(ul);
            bindEvents();
            offlinePay = kdAppSet.getUserInfo().allowpayway || [];
            addOffLinePay(offlinePay);
            initScroll(divlist);
            hasInit = true;
        }
    }

    function addOffLinePay(ls) {
        //判断是否开启线下支付
        //sprite-list_union-pay线下支付原样式
        if (ls.indexOf('offline') >= 0) {
            var liTemplate = '<li data-pay="{key}"  data-cmd="offline" class="union-pay  sprite-own-way">' +
                ' <div class="pay-style">{name}</div></li>';
            var payTypeList = kdAppSet.getUserInfo().offlinesubpay;
            var payHtml = '';
            for (var i in payTypeList) {
                var item = payTypeList[i];
                payHtml += $.String.format(liTemplate, {
                    key: item.key,
                    name: item.name
                });
            }
            ullist.append(payHtml);
        }
        //判断是否开启微信支付，若开启则添加代付选项
        if (ls.indexOf('wx') >= 0) {
            ls.push('wx_other');
        }

    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, {});
    }

    function setListView(payinfo) {
        var payTypeList = kdAppSet.getUserInfo().allowpayway;
        var payls = MiniQuery.Object.clone(payTypeList);

        payType = '';
        //隐藏所有支付类型
        viewpage.find('[data-pay]').hide();

        if (payinfo.sendType == 1) {
            //门店自提 不能使用线下支付
            var posi = payls.indexOf('offline');
            if (posi >= 0) {
                payls.splice(posi, 1);
            }
        } else {
            //显示线下支付类型
            var offPay = viewpage.find('[data-cmd="offline"]');
            offPay.removeClass('on');
            offPay.show();
        }

        //显示线上支付类型
        for (var i = 0, len = payls.length; i < len; i++) {
            var viewli = viewpage.find('[data-pay="' + payls[i] + '"]');
            viewli.removeClass('on');
            viewli.show();
        }
        setDefaultSelect(payls);
        scroller && scroller.refresh();
    }


    //设置为上次选择的支付方式
    function setDefaultSelect(payList) {
        //获取上次的支付类型
        var lastPay = kdShare.cache.getCacheDataObj(payKey);
        if (payList.indexOf(lastPay) >= 0 || (payList.indexOf('offline') >= 0 && checkOfflinePay(lastPay))) {
            var payli = viewpage.find('[data-pay="' + lastPay + '"]');
            if (payli != null) {
                payType = lastPay;
                payli.addClass('on');
            }
        } else {
            //设置第一个支付方式 为默认
            //todo
        }
    }

    //检测某个类型的线下支付
    function checkOfflinePay(pay) {
        var payTypeList = kdAppSet.getUserInfo().offlinesubpay;
        for (var i in payTypeList) {
            if (payTypeList[i].key == pay) {
                return true;
            }
        }
        return false;
    }

    // 绑定事件
    function bindEvents() {

        viewpage.delegate('[data-cmd="cancel"]', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('press1');
            },
            'touchend': function () {
                $(this).removeClass('press1');
            }
        }).delegate('[data-cmd="pay"]', {
            'click': function () {
                pay();
            },
            'touchstart': function () {
                $(this).addClass('press2');
            },
            'touchend': function () {
                $(this).removeClass('press2');
            }
        }).delegate('[data-pay]', {
            'click': function () {
                var $this = $(this);
                $this.siblings().removeClass('on');
                $this.addClass('on');
                payType = $this.attr('data-pay');

                if ($this.attr('data-pay') == 'wx_other') {
                    OrderPay.wxPayOther(payInfo);
                }
            }
        });

    }

    function pay() {
        if (payType == '') {
            OptMsg.ShowMsg('请选择支付方式!', '', 2000);
            return;
        }
        //记住支付类型
        if (payType != 'wx_other') {
            kdShare.cache.setCacheData(payType, payKey);
        }
        switch (payType) {
            case 'offline':
                break;
            case 'prepay':
                //储值卡wx
                var money = payInfo.billmoney + payInfo.freight;
                if (vipMoney >= money) {
                    kdAppSet.setKdLoading(true, "提交支付信息..");
                    setBillPayType(false, function () {
                        OrderPay.cardPay(payInfo, vipMoney, 'prepay');
                    });
                } else {
                    OptMsg.ShowMsg('储值卡余额不足!', '', 1500);
                }
                break;
            case 'vipcard':
                //实体卡
                var money2 = payInfo.billmoney + payInfo.freight;
                if (vipcardMoney >= money2 || true) {
                    kdAppSet.setKdLoading(true, "提交支付信息..");
                    setBillPayType(false, function () {
                        OrderPay.cardPay(payInfo, vipcardMoney, 'vipcard');
                    });
                } else {
                    OptMsg.ShowMsg('实体卡余额不足!', '', 1500);
                }
                break;
            case 'wx':
                //微信支付
                setBillPayType(false);
                OrderPay.wxPay(payInfo);
                break;
            case 'wx_other':
                //微信代付
                setBillPayType(true);
                break;
            case 'alipay':
                //支付宝
                setBillPayType(false);
                OrderPay.aliPay(payInfo);
                break;
            case 'zjt':
                //资金通
                setBillPayType(false);
                OrderPay.zjtPay(payInfo);
                break;
            default :
                //其它的都当做线下支付来处理
                if (kdAppSet.getUserInfo().identity == 'retail') {
                    setBillPayType(true);
                } else {
                    setBillPayType(false);
                    MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                        {
                            newbill: true,
                            payType: payType,
                            payNo: '',
                            payOrder: payInfo.billno,
                            paymoney: kdAppSet.getIsShowPrice() ? payInfo.billmoney : null,
                            payBillId: payInfo.interid
                        }
                    ]);
                }
                break;
        }
    }

    //设置订单支付类型
    function setBillPayType(backview, fn) {
        if (backview) {
            kdAppSet.setKdLoading(true, "提交支付信息..");
        }

        Lib.API.get('SetOrderPayType', {
                para: {
                    PayType: payType,
                    InterID: payInfo.interid
                }
            },
            function (data) {
                kdAppSet.setKdLoading(false);
                if (data.status == 1) {
                    OptMsg.ShowMsg('提交订单支付方式失败!');
                } else {
                    //设置支付方式后 如果是零售用户，并且是线下支付，要隐藏付款按钮
                    var bOffLine = ['prepay', 'wx', 'alipay', 'zjt'].indexOf(payType) >= 0;
                    if (!bOffLine && kdAppSet.getUserInfo().identity == 'retail') {
                        MiniQuery.Event.trigger(window, 'OrderDetailSetPayBtn', [
                            {billid: payInfo.interid }
                        ]);
                    }
                    fn && fn();
                    if (backview) {
                        OptMsg.ShowMsg('已提交', function () {
                            kdShare.backView();
                        }, 1500);
                    }
                }
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('提交订单支付方式出错!');
            });

    }


    function fill(pay) {
        var billno = viewpage.find('[data-type="billno"]');
        billno[0].innerText = pay.billno;
        var money = pay.billmoney + pay.freight;
        var billMoney = viewpage.find('[data-type="money"]');
        billMoney[0].innerText = '￥' + kdAppSet.formatMoneyStr(money);

        vipMoney = kdAppSet.getUserInfo().vipAmount;
        var cardMoney = viewpage.find('[data-type="card-money"]');
        cardMoney[0].innerText = '￥' + kdAppSet.formatMoneyStr(vipMoney.toFixed(2));

        vipcardMoney = kdAppSet.getUserInfo().vipcardAmount;
        var vipcard = viewpage.find('[data-type="vipcard-money"]');
        vipcard[0].innerText = '￥' + kdAppSet.formatMoneyStr(vipcardMoney.toFixed(2));
    }

    function render(config) {
        payInfo = config;
        autoBack = false;
        initView();
        show();
        setListView(payInfo);
        fill(payInfo);
        PayCode.setWxShare(payInfo);
    }


    function show() {
        kdAppSet.setAppTitle('支付方式');
        if (autoBack) {
            setTimeout(function () {
                kdShare.backView();
            }, 50);
        }
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
        kdAppSet.wxShareInfo({});
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();