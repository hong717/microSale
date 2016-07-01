var Register = (function () {
    var div, hasInit, htmlStr, viewPage, bcodeSendind, timeEvent, itimeCount, shopurl, config;

    //初始化视图
    function initView() {
        OptMsg.ShowMsg('先登录才能继续操作哦!', "", 3000);
        if (!hasInit) {
            htmlStr = '';
            div = document.getElementById('viewid_registerPage');
            viewPage = $("#viewid_registerPage");
            var cmpInfo = kdAppSet.getUserInfo().cmpInfo;
            viewPage.find('.logo').attr('src', cmpInfo.img);
            viewPage.find('.helpBtn').attr('src', 'img/kingdee.png');
            viewPage.find('.companyName').text(cmpInfo.name);
            shopurl = kdAppSet.getUserInfo().shopurl;
            if (shopurl == '') {
                viewPage.find('.retailCust').hide();
            }
            bcodeSendind = false;
            bindEvents();
            hasInit = true;
        }
    }

    //获取验证码
    function sendRegisterCode() {
        if (bcodeSendind) {
            return;
        }
        var mobile = viewPage.find("#phoneNumber")[0].value;
        mobile = kdShare.getPureNumber(mobile);
        if (!isMobileNumber(mobile)) {
            return;
        } else {
            viewPage.find("#phoneNumber").val(mobile);
        }

        kdAppSet.setKdLoading(true, "正在获取验证码..");
        Lib.API.get('GetVerifyCode', { para: { mobile: mobile } },
            function (data, json) {
                kdAppSet.setKdLoading(false);
                var status = +data.status;
                switch (status) {
                    case 0:
                        bcodeSendind = true;
                        itimeCount = 0;
                        timeEvent = setInterval(function () {
                            freshSendCodeBtn();
                        }, 1000);
                        jAlert(data.verifyMsg);
                        break;
                    case 1:
                        MiniQuery.Event.trigger(window, 'toview', ['failureLogin', { 'mobile': mobile }]);
                        break;
                    case 4: //已提交意向，但还在审核中
                        jConfirm(data.verifyMsg, null, function (flag) {
                            if (!flag) {
                                /*                 var user = kdAppSet.getUserInfo();
                                 var phone = user.receiverPhone || user.servicePhone || "";*/
                                var phone = '';
                                var user = kdAppSet.getUserInfo();
                                if (user.serviceOption == 0) {
                                    phone = user.receiverPhone;
                                } else if (user.serviceOption == 1) {
                                    var service = OptMsg.getMsgServiceList();
                                    if (service.length > 0) {
                                        phone = service[0].servicePhone;
                                    }
                                }
                                if (!phone) {
                                    jAlert("很抱歉,客服的电话号码为空!");
                                    return;
                                }
                                window.location.href = 'tel://' + phone;
                            }
                        }, { ok: '确定', no: '联系客服' });
                        break;
                    default: {
                        var errMsg = data.verifyMsg;
                        errMsg = errMsg.replace('Invalid phone', '无效的手机号码');
                        jAlert(errMsg);
                    }

                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(kdAppSet.getAppMsg.workError);
            });
    }


    function freshSendCodeBtn() {
        var itotalCount = 90;
        itimeCount = itimeCount + 1;
        if (itimeCount >= itotalCount) {
            bcodeSendind = false;
            clearInterval(timeEvent);
            viewPage.find(".sendCode")[0].innerHTML = '获取验证码';
        } else {
            viewPage.find(".sendCode")[0].innerHTML = '剩余 ' + (itotalCount - itimeCount) + " 秒";
        }
    }

    //验证注册信息
    function checkRegisterInfo() {

        var mobile = viewPage.find("#phoneNumber")[0].value;
        if (!isMobileNumber(mobile)) {
            return;
        }
        var checkCode = viewPage.find("#checkNumber")[0].value;
        if (!isVerifyCode(checkCode)) {
            return;
        }
        kdAppSet.setKdLoading(true, "验证注册信息..");
        var openid = kdAppSet.getAppParam().openid;
        Lib.API.get('CheckVerifyCode', {
            para: { mobile: mobile, openid: openid, verifyCode: kdAppSet.ReplaceJsonSpecialChar(checkCode) }
        },
            function (data, json) {
                kdAppSet.setKdLoading(false);
                var status = parseInt(data.status);
                var userinfo = kdAppSet.getUserInfo();
                if (status == 0) {//验证码正确
                    var toview = config.toview;
                    if (data.caninvited == 1 && userinfo.cmpInfo.allowshareprice == 1) {//可以被邀请
                        InvitePop.showInvite({
                            invite: function () {
                                if (toview) {
                                    toViewPage(toview);
                                } else {
                                    reloadWebApp();
                                }
                            }
                        });
                    } else {
                        if (toview) {
                            toViewPage(toview);
                        } else {
                            reloadWebApp();
                        }
                    }

                } else {
                    jAlert(data.verifymsg);
                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(kdAppSet.getAppMsg.workError);
            });
    }



    //如果openid为空,重新获取,这里需要用户授权
    function reloadWebApp(firstview) {
        var eid = kdAppSet.getAppParam().eid;
        var linkurl = window.location.href.split('?')[0] || "kdurl_error";
        if (!firstview) {
            firstview = config.fromView || 'home';
        }
        linkurl = linkurl + "?source=service&eid=" + eid + '&firstview=' + firstview;
        reloadApp(linkurl);
    }

    function reloadApp(linkurl) {
        var eid = kdAppSet.getAppParam().eid;
        linkurl = linkurl.replace("start.html", "index.html");
        linkurl = encodeURIComponent(linkurl);
        window.location.href = "http://mob.cmcloud.cn/ServerCloud/WeiXin/KisApp?from=" + linkurl + "&type=1&focus=0&eid=" + eid;
    }

    //登录后 跳转到指定页面
    function toViewPage(toview) {
        //view:'OrderDetail',id: guideBillId
        var view = toview.view;
        var id = toview.id;
        var eid = kdAppSet.getAppParam().eid;
        var linkurl = window.location.href.split('?')[0] || "kdurl_error";
        if (view == 'OrderDetail') {
            linkurl = linkurl + "?source=service&eid=" + eid + '&guideBillId=' + id;
            reloadApp(linkurl);
        }
    }


    function isMobileNumber(phoneNumber) {
        var check = /^(1[0-9]{10})$/;
        if (!check.test(phoneNumber)) {
            jAlert("请输入正确的手机号!");
            return false;
        }
        return true;
    }

    function isVerifyCode(verifyCode) {
        if (verifyCode == "请输入验证码") {
            jAlert("请输入验证码!");
            return false;
        }
        return true;
    }

    function bindEvents() {

        viewPage.delegate('.sendCode', {
            'click': function () {
                sendRegisterCode();
            },
            'touchstart': function () {
                $(this).addClass('code_touched');
            },
            'touchend': function () {
                $(this).removeClass('code_touched');
            }
        });

        viewPage.delegate(".check", {
            'click': function () {
                checkRegisterInfo();
            },
            'touchstart': function () {
                $(this).addClass('code_touched');
            },
            'touchend': function () {
                $(this).removeClass('code_touched');
            }
        });

        viewPage.delegate(".helpBtn", {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: 'http://club.kisdee.com/forum.php?mod=forumdisplay&fid=900' }]);
            },
            'touchstart': function () {
                $(this).attr('src', 'img/kingdee_s.png');
            },
            'touchend': function () {
                $(this).attr('src', 'img/kingdee.png');
            }
        });

        //去网上商城
        viewPage.delegate(".retailCust", {
            'click': function () {
                if (shopurl) {
                    window.location.href = shopurl;
                }
            },
            'touchstart': function () {
                $(this).addClass('retailCust_touched');
            },
            'touchend': function () {
                $(this).removeClass('retailCust_touched');
            }
        });

        viewPage.delegate('#phoneNumber', {
            'keyup': function () {
                checkInputInfo();
            },
            'focus': function () {
                $(this).addClass('textFocus');
            },
            'blur': function () {
                var val = kdShare.trimStr($(this).val());
                if (!isNumber(val)) {
                    $(this).removeClass('textFocus');
                }
            }
        });

        viewPage.delegate('#checkNumber', {
            'keyup': function () {
                checkInputInfo();
            },
            'focus': function () {
                $(this).addClass('textFocus');
            },
            'blur': function () {
                var val = kdShare.trimStr($(this).val());
                if (!isNumber(val)) {
                    $(this).removeClass('textFocus');
                }
            }
        });
    }

    function isNumber(value) {
        var check = /^[0-9]{1,11}$/;
        if (check.test(value)) {
            return true;
        } else {
            return false;
        }
    }

    function checkInputInfo() {
        var mobile = viewPage.find("#phoneNumber")[0].value;
        mobile = kdShare.getPureNumber(mobile);
        var check = /^(1[0-9]{10})$/;
        if (!check.test(mobile)) {
            viewPage.find(".sendCode").css("background-color", "#CCCCCC");
            return false;
        } else {
            viewPage.find(".sendCode").css("background-color", "#F57325");
            return true;
        }
    }

    function render(configp) {
        bcodeSendind = false;
        initView();
        config = configp || {};
        var sharePhoneNum = config.sharePhoneNum || 0;
        var inviteSpan = viewPage.find(".inviteDiv span");
        if (sharePhoneNum > 0) {
            viewPage.find("#phoneNumber").val(sharePhoneNum);
            viewPage.find(".sendCode").css("background-color", "#F57325");
            var msg = kdAppSet.getAppParam().sharePhoneMsg + "加入微商城平台";
            inviteSpan.text(msg);
            inviteSpan.parent().show();
        } else {
            inviteSpan.parent().hide();
        }
        show();
        var openid = kdAppSet.getAppParam().openid;
        if (!openid) {
            //判断openid是否为空
            reloadWebApp('Register');
            return;
        }
    }

    function show() {
        $(div).show();
        OptAppMenu.showKdAppMenu(false);
        kdAppSet.setAppTitle('登录');
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
            kdAppSet.setAppTitle('');
        }
    };


})();