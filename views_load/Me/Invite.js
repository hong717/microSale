/*门店选择列表*/


var Invite = (function () {
    var viewpage, hasInit, sample, scroller,
        content, noticelist;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-invite');
            viewpage = $(div);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        viewpage.delegate('[data-cmd="ipt"]', {
            'keyup': function () {
                checkInputInfo();
            }
        });


        viewpage.delegate('[data-cmd="btn"]', {
            'click': function () {
                if (this.className == 'on') {
                    bindCode();
                }
            },
            'touchstart': function () {
            },
            'touchend': function () {
            }
        });
    }

    function bindCode() {
        var str = kdShare.trimStr(viewpage.find('[data-cmd="ipt"]')[0].value);
        if (str == "") {
            kdAppSet.showMsg("请输入验证码");
            return;
        }
        //输入邀请码，绑定邀请人
        Lib.API.get('BindInviteCode', { para: { inviteCode: str } },
            function (data, json) {
                var status = data.status;
                if (status == 0) {
                    location.reload();
                    //TODO
                    //綁定成功，是否刷新界面
                    //    var msg = "请刷新商城，获取最新价格信息";
                    //    jConfirm(msg, null, function (flag) {
                    //        if (flag) {
                    //            location.reload();
                    //        } else {
                    //            kdShare.backView();
                    //        }
                    //    }, { ok: "是", no: "否" });
                } else {
                    jAlert(data.Msg);
                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(kdAppSet.getAppMsg.workError);
            });
    }

    function checkInputInfo(dom) {
        var str = kdShare.trimStr(viewpage.find('[data-cmd="ipt"]')[0].value);
        if (str.length > 3) {
            viewpage.find('[data-cmd="btn"]').addClass('on');
        } else {
            viewpage.find('[data-cmd="btn"]').removeClass('on');
        }

    }

    function render(config) {
        debugger;
        initView();
        show();
    }

    function show() {
        kdAppSet.setAppTitle('输入邀请码');
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