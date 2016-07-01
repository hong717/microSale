
var OptUtils = (function () {


    function getImgQrcodeUrl(link) {
        link=link || {};
        var url = link.url;
        var logourl = link.logourl || '';
        var discribe = link.discribe || '';

        var timestamp = Math.round(new Date().getTime() / 1000);
        var token = Lib.MD5.encrypt(discribe + "kingdee_xxx" + timestamp);

        var qrImg = 'http://mob.cmcloud.cn/ServerCloud/WDH/genGoodsQRcode?';
        qrImg = qrImg + 'discribe=' + encodeURIComponent(discribe) + '&url=' + encodeURIComponent(url)
            + '&logourl=' + encodeURIComponent(logourl) + '&timestamp=' + timestamp + '&token=' + token;
        return qrImg;
    }


    return {
        getImgQrcodeUrl: getImgQrcodeUrl
    };


})();


