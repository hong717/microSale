//微订货打开快递信息
var OptExpress = (function () {

    function ShowExpress(num) {
        var kd100url = "http://m.kuaidi100.com/index_all.html?postid=" + num + "&callbackurl=" + "";
        kdAppSet.stopEventPropagation();
        MiniQuery.Event.trigger(window, 'toview', ['Mkd100', { url: kd100url }]);
    }

    return {
        ShowExpress: ShowExpress
    };
})();


