var Mkd100 = (function () {

    var div , diviframe , iframehtml, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view_kd100');
            diviframe = document.getElementById('div_kd100iframe');
            iframehtml = '<iframe style="display: none;border: none;" scrolling="no"  class="kd100" name="kd100frame" id="kd100frame"  width="100%" height="100%" src=""></iframe>';
            bindEvents();
            hasInit = true;
        }
    }


    function render(config) {
        initView();

        $("#kd100frame").attr("width", window.screen.width);
        $("#kd100frame").attr("height", window.screen.height);
        var kd100url = config.url;

        show();
        $(diviframe).append(iframehtml);
        var kd100frame = document.getElementById('kd100frame');
        kd100frame.scrolling = "auto";
        $("#kd100frame").attr("src", kd100url);
        $("#kd100frame").show();

    }

    function bindEvents() {
        $("#hideback_kd100").bind("click", function () {
            return false;
        });
    }

    function show() {
        $(div).show();
    }


    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
            $("#kd100frame").remove();
        }
    };

})();