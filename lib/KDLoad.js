/*
 * author:yaohong_zhou
 * date:2015-12-29
 * desc:动态加载某个模块
 *
 * */
var KDLoad = (function () {

    var $body = $(document.body);
    var href = window.location.href;
    var host = window.location.host || '';
    var vpath = 'build/';
    var isdebug = host.indexOf('localhost') >= 0 || host.indexOf('172.20') >= 0 || host.indexOf('127.0') >= 0 || (host == '');
    if (href.indexOf(vpath) >= 0) {
        isdebug = false;
    }
    var path = isdebug ? vpath+'debug/' : '';
    var View_Load = 'views_load/';
    var View_Html = path + 'View_Html/';
    var View_Script = path + 'View_Script/';
    var View_Css = path + 'View_Css/';
    var microSaleCust = isdebug ? 'build/' : '../microSaleCust/';
    var domver = document.getElementById('kdbuildDate');
    var verNum = Math.random();
    if (domver) {
        verNum = domver.getAttribute('kdbuildDate');
    }

    function getHtml(caller) {
        //name,fnSuccess,fnError
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', View_Html + caller.name + '.html?v=' + verNum, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    $body.append(data);
                    loadCss({
                        name: caller.name,
                        fnSuccess: function () {
                            caller.fnSuccess && caller.fnSuccess();
                        }
                    });
                }
                else {
                    caller.fnError && caller.fnError("加载模块" + caller.name + '出错');
                }
            }
        };
        xhr.send(null);
    }

    //调试时使用
    function loadView_debug(caller) {
        var name = caller.name;
        var nav = caller.nav;
        getHtml({
            name: name,
            fnSuccess: function () {
                loadScript({
                    name: name,
                    fnSuccess: function () {
                        caller.app.setKdLoading(false);
                        if (caller.isview) {
                            nav.push(name, window[name]);
                        }
                        caller.fnSuccess && caller.fnSuccess();
                    }
                });
            }
        });
    }

    function LoadView(caller) {
        if (isdebug) {
            loadView_debug(caller);
            return;
        }
        //name,fnSuccess,fnError
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', View_Load + caller.name + '.html?v=' + verNum, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    $body.append(data);
                    caller.fnSuccess && caller.fnSuccess();
                }
                else {
                    caller.fnError && caller.fnError("加载模块" + caller.name + '出错');
                }
            }
        };
        xhr.send(null);
    }

    function loadScript(caller) {
        //name,fnSuccess,fnError

        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                caller.fnSuccess && caller.fnSuccess();
                script.onload = script.onreadystatechange = null;
            }
        };
        script.src = View_Script + caller.name + '.js?v=' + verNum;
        head.appendChild(script);
    }


    function loadCss(caller) {
        //name,fnSuccess,fnError
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.onload = link.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                caller.fnSuccess && caller.fnSuccess();
                link.onload = link.onreadystatechange = null;
            }
        };
        link.href = View_Css + caller.name + '.css?v=' + verNum;
        head.appendChild(link);
    }

    function loadCssCust(caller) {
        //name,fnSuccess,fnError
        if (isdebug) {
            return;
        }
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.onload = link.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                caller.fnSuccess && caller.fnSuccess();
                link.onload = link.onreadystatechange = null;
            }
        };
        link.href = microSaleCust + caller.eid + '/cust.css?v=' + verNum;
        head.appendChild(link);
    }


    return {
        getHtml: getHtml,
        LoadView: LoadView,
        loadScript: loadScript,
        loadCssCust: loadCssCust
    };

})();


