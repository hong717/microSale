;
var ViewError = (function () {
    var viewPage,
        config,
        errImg,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage=document.getElementById('viewid_error');
            errImg=$('.view_error .errImage');
            errImg.addClass('sprite-systemError');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents(){
        var scroller = Lib.Scroller.create(viewPage);
        var option = {
            fnfresh: function (reset) {
                kdAppSet.wxGetNetWork(
                    function(){
                        freshErrorInfo();
                        reset();
                    },
                    function(){
                     //手机端网络异常
                    }
                );
            },
            hintbottom: -0.4
        };
        kdctrl.initkdScroll(scroller, option);

        $('#viewid_error').delegate('.errFresh',{
            'click':function(){
                freshErrorInfo();
            },
            'touchstart':function(){
                $(this).addClass('errFresh_touched');
            },
            'touchend':function(){
                $(this).removeClass('errFresh_touched');
            }
        });
    }

    function freshErrorInfo(){
        config.fn && config.fn(config.fnParam);
        history.back();
    }

    function render(configp) {
        initView();
        config=configp;
        var errMsg=configp.errMsg || '';
        //手机端网络错误
        var err=$('.view_error .err')[0];
        var errHint=$('.view_error .errHint');
        var errInfo=$('#viewid_error .errInfo');
        if(errMsg==kdAppSet.getAppMsg().netWorkError){
            errInfo.hide();
            errImg.removeClass('sprite-systemError');
            errImg.addClass('sprite-newworkError');
            err.innerHTML='亲,你的手机网络不给力哦!';
            errHint.hide();
        }else{
            errInfo.show();
            errInfo[0].innerHTML=errMsg;
            errImg.removeClass('sprite-newworkError');
            errImg.addClass('sprite-systemError');
            err.innerHTML='系统正在维护中';
            errHint.show();
        }
        show();
    }


    function show() {
        $(viewPage).show();
    }

    function hide() {
        $(viewPage).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();