/*
 * author:yaohong_zhou
 * date:2015-12-30
 * desc:动态加载web模块
 *
 * */
 (function () {

     var buildDate=document.getElementById('kdbuildDate');
     var version='';
     if(buildDate){
         version=buildDate.getAttribute('kdbuildDate');
     }
     var cssList=['../microSaleBase/css/kdimgBase64.css?v=20160705','css/other.min.css?v='+version];
     var jsList=['../microSaleBase/b.min.js?v=20160705','o.min.js?v='+version,'http://webapi.amap.com/maps?v=1.3&key=b3e668b7441992532613810c7dda3072'];

    function loadScript(jsName) {
        if(jsList.length==0){
            return;
        }
        var fn=arguments.callee;
        fn.args=arguments;
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        //用于保证script脚本按顺序执行
        script.async = false;
        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
               /* jlist.splice(0,1);
                if(jlist.length>0){
                    fn.apply(null,fn.args);
                }*/
                script.onload = script.onreadystatechange = null;
            }
        };
        script.src =jsName;
        head.appendChild(script);
    }


    function loadCss(cssName) {
        if(cssList.length==0){
            return;
        }
        var fn=arguments.callee;
        fn.args=arguments;
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.onload = link.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                link.onload = link.onreadystatechange = null;
            }
        };
        link.href = cssName;
        head.appendChild(link);
    }

     for(var i in cssList){
         loadCss(cssList[i]);
     }

     for(var j in jsList){
         loadScript(jsList[j]);
     }
     //loadScript(jsList);

})();


