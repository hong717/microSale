
var GoodsDetail_Api=(function(){

    //在字符串中 提取包含特定 子字符串的信息
    function matchString(httpStr, httpFlag, httpEndFlag, flagNum) {
        var httpList = [];
        var httpTemplate = '';
        var str = '';
        var start = httpStr.indexOf(httpFlag);
        if (start < 0) {
            httpTemplate = httpStr;
        }
        var end;
        while (start >= 0) {
            httpTemplate = httpTemplate + httpStr.substring(0, start);
            httpStr = httpStr.substring(start);
            end = httpStr.indexOf(httpEndFlag);
            flagNum = flagNum + 1;
            if (end >= 0) {
                str = httpStr.substring(0, end);
                httpList.push(str);
                httpTemplate = httpTemplate + '{httpLink' + (flagNum - 1) + '}';
                httpStr = httpStr.substring(end);
            } else {
                str = httpStr.substring(0);
                httpList.push(str);
                httpTemplate = httpTemplate + '{httpLink' + (flagNum - 1) + '}';
                httpStr = '';
            }
            start = httpStr.indexOf(httpFlag);
            if (start < 0) {
                httpTemplate = httpTemplate + httpStr;
            }
        }
        return {
            list: httpList,
            template: httpTemplate
        };
    }


    function getHttpList(httpStr) {
        var httpFlag = 'http://';
        var httpFlag2 = 'https://';
        var httpEndFlag = ' ';
        var http1 = matchString(httpStr, httpFlag, httpEndFlag, 0);
        if (http1.list.length > 0) {
            httpStr = http1.template;
        }
        var http2 = matchString(httpStr, httpFlag2, httpEndFlag, http1.list.length);
        var list3 = http1.list.concat(http2.list);
        return {
            list: list3,
            template: http2.template
        };
    }

    function getDesc(httpStr) {
        if (httpStr) {
            var httpInfo = getHttpList(httpStr);
            var list = httpInfo.list;
            httpStr = httpInfo.template;
            if (list.length > 0) {
                for (var i in list) {
                    var linkflag = '{httpLink' + i + '}';
                    var strOrg = list[i];
                    var str = encodeURIComponent(list[i]);
                    var str2 = '<a href=#' + str + ' >' + strOrg + '</a>';
                    httpStr = httpStr.replace(new RegExp(linkflag, 'gm'), str2);
                }
            }
        }
        return httpStr;
    }

    function getQrcode(itemid) {
        var appParam = kdAppSet.getAppParam();
        var userInfo = kdAppSet.getUserInfo();
        //是否是主管分享
        var data = {
            'shareGoodsId': itemid
        };
        if (userInfo.optid) {
            data.shareManagerId = userInfo.optid;
        }
        var datastr = MiniQuery.Object.toQueryString({
            eid: appParam.eid,
            data: MiniQuery.Object.toQueryString(data)
        });
        var link = 'http://mob.cmcloud.cn/ServerCloud/wdh/genGoodsUrl?' + datastr;
        return link;
    }

    return {
        getQrcode:getQrcode,
        getDesc:getDesc
    }


})();