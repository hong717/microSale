/**
 * Created by clover_wu on 2015-01-12.
 *
 * alter by hong on 2015-03-03
 *
 */
var wx_init_kdnum=0;
var wx_init_para={};

//当通过了签名后回回调此方法
wx.ready(function () {
    //设置默认分享页面
    kdAppSet.wxShareInfo({});
});

//访问出错的回调
wx.error(function (res) {
    //签名过期时需要重新签名
    if (res.code == 42001) {
        wxSign.wx_init(wx_init_para);
    }
});


var wxSign = (function () {

    function createNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }

    function createTimestamp() {
        return parseInt(new Date().getTime() / 1000) + '';
    }


    function raw(args) {
        var keys = Object.keys(args);
        keys = keys.sort();
        var newArgs = {};
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        var string = '';
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    }

    function sign(cfg, fnOk) {
        $.ajax({
            type: "get",
            dataType: "JSONP",
            url: "http://mob.cmcloud.cn/servercloud/weixin/Jsapi_Ticket?eid="+cfg.eid,//api_Ticket
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).done(function (data) {
            if (data.code == 200) {
                var url = window.location.href.split('#')[0] || {};
                var signRet = {
                    "jsapi_ticket":decodeURI(data.data) || '',
                    "nonceStr": cfg.nonceStr,
                    "timestamp": cfg.timestamp,
                    "url": url
                };
                var string = raw(signRet);
                var shaObj = new jsSHA(string, 'TEXT');
                var signature = shaObj.getHash('SHA-1', 'HEX');
                fnOk & fnOk(signature);
                signCard(cfg);
            } else {
                //alert("微信认证失败:" + data.msg);
                if(wx_init_kdnum<3){
                    wx_init_kdnum=wx_init_kdnum+1;
                    wx_init(wx_init_para);
                }
            }
        }).fail(function (a) {
           //alert("微信认证失败");
            if(wx_init_kdnum<3){
                wx_init_kdnum=wx_init_kdnum+1;
                wx_init(wx_init_para);
            }
        })

    }
  function signCard(cfg) {
        $.ajax({
            type: "get",
            dataType: "JSONP",
            url: "http://mob.cmcloud.cn/servercloud/weixin/api_Ticket?eid="+cfg.eid,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).done(function (data) {
            if (data.code == 200) {

                var jsapi_ticket=decodeURI(data.data) || '';
                var nonceStr= createNonceStr();
                var timestamp= createTimestamp();
                var app_id= wx_init_para.appid;
                /*app_id、location_id、timestamp、nonce_str、card_id、card_type*/
                var card_id='';
                var location_id='';
                //var card_type='DISCOUNT';
                var alist=[];
                alist.push(jsapi_ticket);
                alist.push(nonceStr);
                alist.push(timestamp);
                alist.push(app_id);
                //alist.push(card_type);
       /*         alist.push(card_id);
                alist.push(location_id);*/
                alist.sort();
                var string = alist.join("");
                var shaObj = new jsSHA(string, 'TEXT');
                var signature = shaObj.getHash('SHA-1', 'HEX');

                kdCardPay={
                    timestamp: timestamp,
                    nonceStr: nonceStr,
                    signature: signature
                };
/*                alert(alist.join(",")+"||"+signature);
                console.log(JSON.stringify(alist));*/
            };
        });

    }

    function wx_init(para) {
        if(para){
            wx_init_para =para;
        }
        para=para || {};
        var config = {
            appid: para.appid,
            eid:para.eid,
            timestamp: createTimestamp(),
            nonceStr: createNonceStr()
        };
        sign(config, function (data) {
            wx.config({
                debug: false,
                appId: config.appid,
                timestamp: config.timestamp,
                nonceStr: config.nonceStr,
                signature: data,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'hideMenuItems',
                    'chooseImage',
                    'uploadImage',
                    'chooseWXPay',
                    'getNetworkType',
                    'scanQRCode',
                    'onMenuShareQQ',
                    'chooseCard',
                    'openCard'
                ]
            });
        });
    }

    return {
        wx_init: wx_init
    }

})();




