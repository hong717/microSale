/*微订货界面操作日志*/
var OptLog = (function () {
    var optUrlHead = "http://mob.cmcloud.cn/ServerCloud/DataReport/NewVisitRecode";
    /*1	首页
   */

    var optLogEnum = {
        index: 1
    };

    //允许记录验证次数
    var logList = [];


    function writeLog(eid, openid, operateid, identify) {
        var param = '?'
            + 'eid=' + eid + '&'
            + 'openid=' + openid + '&'
            + 'operateid=' + operateid + '&'
            + 'identify=0';
        getJSON(optUrlHead + param);
    }


    function getJSON(url, fnSuccess, fnFail) {
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    fnSuccess && fnSuccess();
                }
                else {
                    fnFail && fnFail("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }


    function writePageLog(optid) {
        var logkey = "" + optid;
        if (logList.indexOf(logkey) >= 0) {
            return;
        }
        logList.push(logkey);
        var eid = kdAppSet.getAppParam().eid;
        var openid = kdAppSet.getAppParam().openid;
        writeLog(eid, openid, optid);
    }

    function debug(msg){
        var logUrl='http://mob.cmcloud.cn/ServerCloud/selftest/writelog?msgid=1&msg='+msg;
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', logUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {

            }
        };
        xhr.send(null);
    }

    return {
        debug: debug,
        writePageLog: writePageLog,
        getLogType: function () {
            return optLogEnum;
        }
    };


})();


