var commonIframe = (function () {
    var div, iframe, hasInit;

    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_commonIframe');
            iframe = $(div).find('iframe');
            hasInit = true;
        }
    }

    function render(obj) {
        initView();
        show();
        if (obj.src) {
            iframe.attr('src', obj.src);
        }
    }

    function show() {
        $(div).show();
    }

    function hide() {
        $(div).hide();
        iframe.attr('src', '');
        document.getElementById('viewid_iframe').innerHTML='';
    }


    return {
        render: render,
        show: show,
        hide: hide
    }
})();