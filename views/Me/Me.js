var Me = (function () {
    var viewpage, scroller, hasInit, endTime, sample, iconSample;
    // 初始化视图
    function initView() {
        if (!hasInit) {
            viewpage = $('.view_Me');
            scroller = Lib.Scroller.create($('.me_commonItems')[0]);
            sample = document.getElementById('me_saler').innerHTML;
            sample = $.String.between(sample, '<!--', '-->');
            iconSample = $.String.between(document.getElementById('iconsample').innerHTML, '<!--', '-->');
            initicon();
            bindEvents();
            endTime = " 23:59:59";
            var imgsrc = kdAppSet.getUserInfo().headimgurl || "img/picture.png";
            $(".me_userInfo img").attr("src", imgsrc);
            repalceImg();
            hasInit = true;
        }
    }

    function repalceImg() {
        $('#nav_Oredrs .icon-item').attr('src', 'img/Me_order.png');
        $('#nav_Notices .icon-item').attr('src', 'img/Me_pay.png');
        $('#me_Address .icon-item').attr('src', 'img/Me_address.png');
        $('#me_Collect .icon-item').attr('src', 'img/Me_collection.png');
        $('#me_Collect .icon-item').attr('src', 'img/Me_collection.png');
        $('#me_manager .icon-item').attr('src', 'img/Me_manage.png');
        $('#me_join .icon-item').attr('src', 'img/Me_join.png');
        $('#me_setting .icon-item').attr('src', 'img/Me_setting.png');
        $('#me_Money img').attr('src', 'img/Me_payable.png');
        $('#me_Buyer img').attr('src', 'img/Me_buyer.png');
        $('#me_Money img').attr('src', 'img/Me_turnover.png');
        $('#me_Buyer img').attr('src', 'img/Me_buyer.png');
        $('#me_retail img').attr('src', 'img/Me_retail.png');
    }

    function fillHead() {
        var mview = $('#me_info');
        var sview = $('#me_saler');
        mview.hide();
        sview.hide();
        var user = kdAppSet.getUserInfo();
        if (user.identity == 'retail') {
            sview.show();
            sview[0].innerHTML = $.String.format(sample, {
                'name': user.contactName || user.senderName,
                'points': (user.vipPoints || 0).toFixed(2),
                'level': user.viplevelname,
                'money': (user.vipAmount || 0).toFixed(2),
                'view': user.usertype == -1 ? 'hide' : '',
                'vipView': user.usertype == -1 ? '' : 'vip',
                'allowView': user.cmpInfo.allowRetailPoint ? '' : 'hidev'
            });
        } else {
            mview.show();
        }
    }

    // 页面渲染
    function render() {
        initView();
        show();
        initUserInfo();
    }

    function initUserInfo() {

        // 获取图片及采购主管信息
        var contactName = kdAppSet.getUserInfo().contactName;
        $('.view_Me #userName').text(contactName);
        var userinfo = kdAppSet.getUserInfo();
        var position = "";
        var identity = userinfo.identity;
        var mobile = userinfo.senderMobile || '';

        var compony = $('.view_Me #userCompony');
        compony.text(userinfo.companyName);
        var NamePosition = $('.view_Me .NamePosition');

        if (userinfo.caninvited == 1 && userinfo.cmpInfo.allowshareprice == 1) {
            viewpage.find('[data-cmd="invite"]').show();//显示输入邀请码
        } else {
            viewpage.find('[data-cmd="invite"]').hide();//隐藏输入邀请码
        }

        if (identity == "manager") {
            position = "采购主管";
            NamePosition.css('top', '0');
            $('#me_manager').show();
            if (userinfo.cmpInfo.allowshareprice == 1) {
                viewpage.find('[data-cmd="share"]').show();//显示邀请有礼
            }
            $('#me_join').hide();
        }
        else if (identity == "buyer") {
            position = "采购员";
            if (userinfo.cmpInfo.allowshareprice == 1) {
                viewpage.find('[data-cmd="share"]').show();//显示邀请有礼
            }
            NamePosition.css('top', '0');
        }
        else {
            if (identity == "retail") {
                position = "(会员)";
                compony.hide();
                NamePosition.css('top', '10px');
                $('#me_manager').hide();
            }
        }
        $('.view_Me #userPosition').text(position);
        //是否在微信中打开
        var iswxBrower = !(!kdAppSet.isPcBrower() && !kdShare.is_weixinbrower());

        //手机号未验证
        var checkDiv = $('.view_Me .checkDiv span');
        var check = (!mobile && iswxBrower || (kdAppSet.getAppParam().isdebug && !mobile));
        check ? checkDiv.show() : checkDiv.hide();

        scroller.refresh();
        var quitDiv = $('.view_Me .quitDiv');
        userinfo.senderMobile ? quitDiv.show() : quitDiv.hide();

        setViewByPower();
        fillHead();
    }

    //马跃--2016/4/7重写根据不同身份不同图标的显示。此次采取动态填充分别放在manageList，retailList以便以后扩充
    function initicon() {
        //采购员||主管
        var manageList = [
            {
                styleid: 'nav_uncheck',
                styleclass: 'sprite-toComfirm',
                stylename: '待确认'
            },
            {
                styleid: 'nav_Sending',
                styleclass: 'sprite-pay',
                stylename: '待发货'
            },
            {
                styleid: 'nav_sended',
                styleclass: 'nav_BadOrders_return sprite-sending',
                stylename: '已发货'
            },
            {
                styleid: 'nav_BadOrders',
                styleclass: 'nav_BadOrders_return sprite-return',
                stylename: '退货'
            }
        ];
        //会员||游客
        var retailList = [
            {
                styleid: 'nav_unpay',
                styleclass: 'sprite-toComfirm',
                stylename: '待付款'
            },
            {
                styleid: 'nav_uncheck',
                styleclass: 'sprite-toComfirm',
                stylename: '待确认'
            },
            {
                styleid: 'nav_Sending',
                styleclass: 'sprite-pay',
                stylename: '待发货'
            },
            {
                styleid: 'nav_sended',
                styleclass: 'nav_BadOrders_return sprite-sending',
                stylename: '已发货'
            }
        ];

        var iconList = $('#iconsample');
        var identity = kdAppSet.getUserInfo().identity;
        var iconData = [];
        if (identity == "manager" || identity == "buyer") {
            iconData = manageList;
        } else {
            iconData = retailList;
        }
        iconList[0].innerHTML = "";
        iconList[0].innerHTML += $.Array.keep(iconData, function (item) {
            return $.String.format(iconSample, {
                styleid: item.styleid,
                styleclass: item.styleclass,
                stylename: item.stylename
            });
        }).join('');
    }

    //初始化状态数量
    function initTips() {
        if (!kdAppSet.getUserInfo().senderMobile) {
            $('.count-tip').hide();
            return;
        }
        $('.count-tip').hide();
        var identity = kdAppSet.getUserInfo().identity;
        var now = $.Date.now();
        var endDatev = $.Date.format(now, "yyyy-MM-dd");
        now.setDate(now.getDate() - 90);
        var startDatav = $.Date.format(now, "yyyy-MM-dd");
        var optOpenid = kdAppSet.getUserInfo().optid;

        var para = {
            para: {
                optOpenid: optOpenid,
                BeginDate: startDatav,
                EndDate: endDatev
            }
        };

        Lib.API.get('GetDynamicInfo', para, function (data, json) {
            var counts = {
                toConfirm: +data.statuslist[1].total,//待确认
                toDeliver: +data.statuslist[2].total,//待发货
                hasDeliver: +data.statuslist[3].total,//已发货
                toPay: +data.statuslist[4].total,//待付款
                salesReturn: +data.statuslist[5].total//退货
            };
            //显示数量
            var contTip = $('.count-tip');
            var data1 = identity === 'retail' ? counts.toPay : counts.toConfirm;
            var data2 = identity === 'retail' ? counts.toConfirm : counts.toDeliver;
            var data3 = identity === 'retail' ? counts.toDeliver : counts.hasDeliver;
            var data4 = identity === 'retail' ? counts.hasDeliver : counts.salesReturn;
            if (data1 > 0) {
                contTip[0].innerText = data1 < 99 ? data1 : 99;
                contTip[0].style.display = 'block';
            }
            if (data2 > 0) {
                contTip[1].innerText = data2 < 99 ? data2 : 99;
                contTip[1].style.display = 'block';
            }
            if (data3 > 0) {
                contTip[2].innerText = data3 < 99 ? data3 : 99;
                contTip[2].style.display = 'block';
            }
            if (data4 > 0) {
                contTip[3].innerText = data4 < 99 ? data4 : 99;
                contTip[3].style.display = 'block';
            }
            var vip = data.vip || {};
            kdAppSet.updateUserInfo({
                vipAmount: vip.vipAmount || 0,
                vipPoints: vip.vipPoints || 0,
                viplevelname: vip.viplevelname || ''
            });

            fillHead();
        }, function (code, msg) {
            jAlert(msg);
        }, function () {
        });
    }

    // 游客跳转到登录页面
    function gotoLoginPage() {
        MiniQuery.Event.trigger(window, 'toview', ['Register', { fromView: 'person' }]);
    }

    //显示指定的订单页面
    function showOrderView(tabIndex) {
        if (isCanShowView()) {
            showView(['Orderlist', { tabindex: tabIndex }]);
        }
    }

    // 事件绑定
    function bindEvents() {

        //点击头像 --已验证：会员中心  未验证：登录
        viewpage.delegate('.picture img', {
            'click': function () {
                var mobile = kdAppSet.getUserInfo().senderMobile || '';
                var iswxBrower = !(!kdAppSet.isPcBrower() && !kdShare.is_weixinbrower());
                if (!mobile && iswxBrower || (kdAppSet.getAppParam().isdebug && !mobile)) {
                    gotoLoginPage();
                } else {
                    //1  表示要修改会员信息
                    goToVip(1);
                }
            }
        });

        // 绑定点击样式效果

        // 绑定通用项的点击效果
        viewpage.delegate('.commonItem', {
            'touchstart': function () {
                $(this).addClass('me_touched');
                $(this).children().addClass('me_touchedBottom');
            },
            'touchend': function () {
                $(this).removeClass('me_touched');
                $(this).children().removeClass('me_touchedBottom');
            }
        });

        viewpage.delegate('.singleItem', {
            'touchstart': function () {
                $(this).addClass('me_touched');
                $(this).children().addClass('me_touchedBottom');
            },
            'touchend': function () {
                $(this).removeClass('me_touched');
                $(this).children().removeClass('me_touchedBottom');
            }
        });

        viewpage.delegate('.second-level', {
            'touchstart': function () {
                $(this).css('backgroundColor', '#ebebeb');
            },
            'touchend': function () {
                $(this).css('backgroundColor', '#fff');
            }
        });

        // 会员金额
        viewpage.delegate('[data-cmd="vip"]', {
            'click': function () {
                goToVip();
            }
        });

        // 全部订单点击事件
        viewpage.delegate('#nav_Oredrs', {
            'click': function () {
                if (isCanShowView()) {
                    showView(['Orderlist', { tabindex: 0 }]);
                    kdAppSet.h5Analysis('me_allBill');
                }
            }
        });

        // 付款通知点击事件
        viewpage.delegate('#nav_Notices', {
            'click': function () {
                if (isCanShowView()) {
                    showView(['PaymentList', {}]);
                    kdAppSet.h5Analysis('me_payList');
                }
            }
        });

        // 待付款点击事件--会员特有
        viewpage.delegate('#nav_unpay', {
            'click': function () {
                showOrderView(1);
                kdAppSet.h5Analysis('me_unpay');
            }
        });

        // 待确认点击事件
        viewpage.delegate('#nav_uncheck', {
            'click': function () {
                showOrderView(2);
                kdAppSet.h5Analysis('');
            }
        }
        );

        // 待发货点击事件
        viewpage.delegate('#nav_Sending', {
            'click': function () {
                showOrderView(3);
                kdAppSet.h5Analysis('me_unsend');
            }
        });

        // 已发货点击事件
        viewpage.delegate('#nav_sended', {
            'click': function () {
                showOrderView(4);
                kdAppSet.h5Analysis('me_sended');
            }
        });

        // 退货点击事件--经销商特有
        viewpage.delegate('#nav_BadOrders', {
            'click': function () {
                if (isCanShowView()) {
                    showView(['RejectBillList', {}]);
                    kdAppSet.h5Analysis('me_salesReturn');
                }
            }
        });

        // 我的应付款点击事件
        viewpage.delegate('#me_Money', {
            'click': function () {
                if (isCanShowView()) {
                    if (kdAppSet.getUserInfo().identity == "manager") {
                        showView(['Balance', {}]);
                        kdAppSet.h5Analysis('me_checkMoney');
                        return;
                    } else {
                        showRightHint();
                    }
                }
            }
        });

        // 我的采购员点击事件
        viewpage.delegate('#me_Buyer', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                var user = kdAppSet.getUserInfo();
                if (user.identity == "manager") {
                    kdAppSet.stopEventPropagation();
                    showView(['Buyer', {}]);
                    kdAppSet.h5Analysis('me_buyer');
                }
                else {
                    showRightHint();
                }
            }
        });

        // 我的收货地址 点击事件
        viewpage.delegate('#me_Address', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                showView(['AddressList', {}]);
                kdAppSet.h5Analysis('me_address');
            }
        });

        // 我的收藏 点击事件
        viewpage.delegate('#me_Collect', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                showView(['CollectionList', {}]);
                kdAppSet.h5Analysis('me_collect');
            }
        });

        //我的买家
        viewpage.delegate('#me_retail', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                var user = kdAppSet.getUserInfo();
                if (user.identity == "manager") {
                    kdAppSet.stopEventPropagation();
                    showView(['BuyerList', {}]);
                    kdAppSet.h5Analysis('me_myBuyer');
                }
                else {
                    showRightHint();
                }
            }
        });

        //我要加盟
        viewpage.delegate('#me_join', 'click', function () {
            var mobile = kdAppSet.getUserInfo().senderMobile || '';
            MiniQuery.Event.trigger(window, 'toview', ['registerDetail', { mobile: mobile }]);
            kdAppSet.h5Analysis('me_toJoin');
        });

        // 我的消息 点击事件
        viewpage.delegate('#me_Message',
            {
                'click': function () {
                    if (!isCanShowView()) {
                        return;
                    }
                    showView(['Message', {}]);
                }
            });

        // 我的设置点击事件
        $('.view_Me #me_setting').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['Setting']);
            kdAppSet.h5Analysis('me_setting');
        });

        // 退出当前帐号点击事件
        viewpage.delegate('#quitBtn', {
            'click': function () {
                var msg = "您是否要注销当前账号？注销后<br>下次登录需重新验证手机号";
                jConfirm(msg, null, function (flag) {
                    if (flag) {
                        unBindWxOpenid();
                        kdAppSet.h5Analysis('me_loginout');
                    }
                }, { ok: "是", no: "否" });
            },
            'touchstart': function () {
                $(this).addClass('quit_touched');
            },
            'touchend': function () {
                $(this).removeClass('quit_touched');
            }
        });

        // 验证手机号码按键
        viewpage.delegate('.checkDiv span', {
            'click': function () {
                gotoLoginPage();
            },
            'touchstart': function () {
                $(this).css('background', 'rgba(255,255,255,0.2)');
            },
            'touchend': function () {
                $(this).css('background', 'rgba(0,0,0,0.2)');
            }
        });

        //点击分享有礼  必须是采购主管和采购员身份才可以点击
        viewpage.delegate('[data-cmd="share"]', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                var user = kdAppSet.getUserInfo();
                 if (user.identity == "manager" || user.identity == "buyer") {
                kdAppSet.stopEventPropagation();
                showView(['Share', {}]);
                }
                 else {
                     showRightHint();
                 }
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });

        //点击输入邀请码
        viewpage.delegate('[data-cmd="invite"]', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                //是否可以输入邀请码
                if (kdAppSet.getUserInfo().caninvited == 1) {
                    showView(['Invite', {}]);
                }
                else {
                    OptMsg.ShowMsg('您暂不可以输入邀请码，请联系客服!', "", 1500);
                }
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });
    }

    function goToVip(flag) {
        var user = kdAppSet.getUserInfo();
        if (user.usertype != -1 && user.identity == "retail") {
            flag = flag || 0;
            //正式
            var vipUrl = 'http://mob.cmcloud.cn/webapp/vip' + kdAppSet.getUserInfo().apiversion + '/microSaleLogin.html?eid=' + kdAppSet.getAppParam().eid + '&flag=' + flag;
            //测试
            //var vipUrl = 'http://mob.cmcloud.cn/webapp/vip' + '/microSaleLogin.html?eid=' + kdAppSet.getAppParam().eid + '&flag=' + flag;
            //本地
            //var vipUrl = "http://localhost/VIP/vip/htdocs/index.html#VIP-7E8D2BA6";
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: vipUrl }]);
            kdAppSet.h5Analysis('me_balance');
        }
    }

    function showRightHint() {
        OptMsg.ShowMsg('您不是采购主管,没有权限!', "", 1500);
    }

    //解除绑定用户信息
    function unBindWxOpenid() {
        kdAppSet.setKdLoading(true);
        Lib.API.get('RemoveOpenID', {
            para: {}
        },
            function (data, json) {
                kdAppSet.setKdLoading(false);
                if (data.status == 0) {
                    kdAppSet.showMsg('账号已注销');
                    kdAppSet.logout();
                    initTips();
                    initUserInfo();
                    //通知商品订单列表刷新
                    MiniQuery.Event.trigger(window, 'GoodsList_refresh', []);
                    //通知首页刷新
                    MiniQuery.Event.trigger(window, 'Home_refresh', []);
                } else {
                    kdAppSet.showMsg('注销账号出错');
                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                jAlert("注销账号出错");
            });
    }

    //根据权限控制 能显示的功能模块
    function setViewByPower() {
        var moneyview = $('.view_Me #me_Money_group');
        moneyview.show();
        var buyer = $('.view_Me #me_Buyer');
        buyer.show();
        if (kdAppSet.getUserInfo().identity != "manager") {
            moneyview.hide();
            buyer.hide();
        }
    }

    // 页面展示权限检测
    function isCanShowView() {
        //var myMsg = '您没有权限查看,请登录';
        if (kdAppSet.getUserInfo().usertype != 0) {
            //OptMsg.ShowMsg(myMsg, "", 1500);
            gotoLoginPage();
            return;
        }
        return true;
    }

    // 页面跳转
    function showView(config) {
        MiniQuery.Event.trigger(window, 'toview', config);
        kdAppSet.stopEventPropagation();
    }

    // 页面显示
    function show() {
        viewpage.show();
        OptAppMenu.selectKdAppMenu("meId");
        OptAppMenu.showKdAppMenu(true);
        kdAppSet.setKdLoading(false);
        initTips();
        fillHead();
        // 每次进来刷新下滚动区域
        scroller.refresh();
        kdAppSet.setAppTitle('我');
    }

    function hide() {
        viewpage.hide();
        OptAppMenu.showKdAppMenu(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    }
})();