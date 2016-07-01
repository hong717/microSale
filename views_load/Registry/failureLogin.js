var failureLogin = (function () {
    var div, hasInit, scroller;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_failureLogin');
            scroller = Lib.Scroller.create($(div)[0]);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        $(div).delegate('.phoneDiv a', {
            'touchstart': function () {
                $(this).addClass('button_touched');
            },
            'touchend': function () {
                $(this).removeClass('button_touched');
            }
        });
        $(div).delegate('.joinDiv .button', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['registerDetail',
                    {mobile: $(div).find('#phone').html()}]);
            },
            'touchstart': function () {
                $(this).addClass('button_touched');
            },
            'touchend': function () {
                $(this).removeClass('button_touched');
            }
        })
    }

    function render(config) {
        initView();
        show();
        scroller.refresh();
        $(div).find('#phone').html(config.mobile);
        var servicePhone='';
        var service=OptMsg.getMsgServiceList();
        if(service.length>0){
            servicePhone=service[0].servicePhone;
        }
        // var servicePhone = kdAppSet.getUserInfo().servicePhone;
        $(div).find('.phoneDiv a').attr("href", "tel:" + servicePhone);
    }

    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();