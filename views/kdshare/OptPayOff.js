var OptPayOff = (function () {
    var optUrlHead = "http://mob.cmcloud.cn/ServerCloud/WeiXin/NewOrderRequest";
    // 获取prepay_id接口请求测试参数
    var prePayPara = {
        "appid": "",//wxeb3d2a1ffd94caf1
        "mch_id": null,
        "paySignkey": null,
        "item_body": "",
        "item_detail": "",
        "item_attach": "支付测试",
        "order_no": "",
        "total_fee": "",
        "spbill_create_ip": "",
        "goods_tag": "",
        "openid": ""
    };

    // 获取随机码
    function get32_RandomNumber(len) {
        len = len || 32;
        var charstr = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = charstr.length;
        var randomStr = '';
        for (var i = 0; i < len; i++) {
            randomStr += charstr.charAt(Math.floor(Math.random() * maxPos));
        }
        return randomStr;
    }


    // 调用微信支付接口函数
    function wxPayOff(para,fnSuccessPayOff) {
        if (typeof para != 'object') {
            return;
        }
        wx.chooseWXPay({
            timestamp: Number(para.timestamp),
            nonceStr: para.nonceStr,
            package: para.package,
            signType: para.signType,
            paySign: para.paySign,
            success: function (res) {
                fnSuccessPayOff & fnSuccessPayOff(res);
            }
        });
    }

    // 设置微信支付接口参数
    function setPayInfo(payInfo) {
        prePayPara.openid = kdAppSet.getAppParam().openid;
        prePayPara.order_no = get32_RandomNumber(10);
        prePayPara.item_body = payInfo.name || "";
        prePayPara.total_fee = Number(payInfo.money)*100;
    }

    // 调用后台接口 获取微信支付参数
    function wxPayment(payInfo,fnSuccessPay,fnFail) {
        kdAppSet.setKdLoading(true, '跳转到支付页面...');
        // 更新获取参数
        setPayInfo(payInfo);
        var eid=kdAppSet.getAppParam().eid;
        var currentUrl = optUrlHead + '?data=' + JSON.stringify(prePayPara)+'&eid='+eid;
        var xhr = new window.XMLHttpRequest();
        xhr.open('post', currentUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                kdAppSet.setKdLoading(false);
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        wxPayOff(json.data,fnSuccessPay);
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

    return {
        wxPayment: wxPayment
    }
}());