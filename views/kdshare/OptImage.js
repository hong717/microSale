/*图片上传模块*/

var OptImage = (function () {
    var optUrlHead = "http://mob.cmcloud.cn/ServerCloud/WeiXin/WeixinImageUpload";
    var optUrlHead_multiple = "http://mob.cmcloud.cn/ServerCloud/WeiXin/WeixinImageUpload_multiple";

    function upLoadWxImage(eid, media_id, fnSuccess, fnFail) {
        var param = '?'
            + 'eid=' + eid + '&'
            + 'media_id=' + media_id;
        var url = optUrlHead + param;
        getJSON(url,
            function (data) {
                fnSuccess & fnSuccess(data);
            },
            function (data) {
                fnFail & fnFail(data);
            }
        );
    }

    function getJSON(url, fnSuccess, fnFail) {
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        fnSuccess && fnSuccess(json);
                    } else {
                        fnFail && fnFail(json.msg);
                    }
                }
                else {
                    fnFail && fnFail("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }


    //批量上传图片
    function upLoadWxImageMultiple(eid, mediaids, fnSuccess, fnFail) {
        var paramDataStr = JSON.stringify(mediaids);
        var paramData = {eid: eid, data: paramDataStr};
        $.ajax({
            type: "POST",
            async: true,
            url: optUrlHead_multiple,
            data: paramData,
            dataType: 'json',
            success: function (data) {
                if (data.code == 200) {
                    fnSuccess && fnSuccess(data);
                } else {
                    fnFail && fnFail(data);
                }
            },
            error: function (data) {
                fnFail & fnFail(data);
            }
        });
    }

    return {
        upLoadWxImage: upLoadWxImage,
        upLoadWxImageMultiple: upLoadWxImageMultiple
    };

})();


