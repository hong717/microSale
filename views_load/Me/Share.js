/*分享有礼*/


var Share = (function () {
    var viewpage, hasInit, sample, scroller,
        userinfo;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-share');
            userinfo = kdAppSet.getUserInfo();
            viewpage = $(div);
            scroller = Lib.Scroller.create(div);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        viewpage.delegate('[data-cmd="sendmsg"]', {
            'click': function () {
                var msg = '使用邀请码' + userinfo.invitecode + "可享受" + (userinfo.contactName || userinfo.senderName) + "的价格优惠,到" + userinfo.cmpInfo.name + "任性买买买！ ";
                if (kdAppSet.isIPhoneSeries()) {
                    var msgUrl = "sms:&body=" + msg;
                } else {
                    var msgUrl = "sms:?body=" + msg;
                }
                window.location.href = msgUrl;
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });

        viewpage.delegate('[data-cmd="code"]', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });

        viewpage.delegate('[data-cmd="buyer"]', {
            'click': function () {
                var user = kdAppSet.getUserInfo();
                if (user.identity == "manager") {
                    kdAppSet.stopEventPropagation();
                    MiniQuery.Event.trigger(window, 'toview', ['BuyerList']);
                    kdAppSet.h5Analysis('me_myBuyer');
                }
                else {
                    showRightHint();
                }
            }
        });
    }

    function showRightHint() {
        OptMsg.ShowMsg('您不是采购主管,没有权限!', "", 1500);
    }

    function filltext() {
        viewpage.find('[data-cmd="shareinfo"]')[0].innerHTML = "已分享给" + userinfo.sharesum + "个好友," + userinfo.shareordersum + "个好友已购买";
        viewpage.find('[data-cmd="invite-code"]')[0].innerHTML = userinfo.invitecode;
        viewpage.find('[data-cmd="address"]')[0].innerHTML = kdAppSet.getShareLink();

        viewpage.find('[data-cmd="code"]').attr('src', OptUtils.getImgQrcodeUrl({
            url: kdAppSet.getShareLink()
        }));
    }


    function render() {
        debugger;
        initView();
        filltext();
        show();
    }

    function show() {
        kdAppSet.setAppTitle('分享有奖');
        viewpage.show();
        scroller.refresh(500);
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