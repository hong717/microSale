var InvitePop = (function () {
    var viewpage, hasInit, sample, scroller,
       config;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-invitepop');
            viewpage = $(div);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        //取消
        viewpage.delegate('[data-cmd="close"]', {
            'click': function () {
                hide();
                config.invite();
            }
        });


        //确定
        viewpage.delegate('[data-cmd="btn"]', {
            'click': function () {
                bindCode();
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
                    hide();
                    config.invite();
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

    function showInvite(configs) {
        config = configs;
        initView();
        show();
    }


    function render(config) {
        debugger;
        initView();
        show();
    }

    function show() {
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide,
        showInvite: showInvite
    };
})();