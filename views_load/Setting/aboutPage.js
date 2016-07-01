var aboutPage = (function () {
    var div, scroller, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_aboutPage');
            scroller = Lib.Scroller.create($(div)[0]);
            $(div).find('.logo').attr('src', 'img/register_logo.png');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        $('#aboutPage_Production').bind('click', function () {
            $(this).addClass('btn_touched');
            $('#aboutPage_Client').removeClass('btn_touched');
        });
        $('#aboutPage_Client').bind('click', function () {
            $(this).addClass('btn_touched');
            $('#aboutPage_Production').removeClass('btn_touched');
        });
        $('#aboutPage_Call').delegate('', {
            'touchstart': function () {
                $(this).addClass('call_touched');
            },
            'touchend': function () {
                $(this).removeClass('call_touched');
            }
        });
    }

    function render() {
        initView();
        show();
        scroller.refresh();
    }

    function show() {
        kdAppSet.setAppTitle('关于');
        $(div).show();
        $('.afterRegisterDiv').hide();
    }

    function hide() {
        $('.afterRegisterDiv').hide();
        $(div).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();