var PayCode = (function () {
    var viewPage, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid-pay-code');

            hasInit = true;
        }
    }

    function render(config) {
        config = config || {};
        initView();
        show();
        setPayCode(config);
        setWxShare(config.pay);
    }


    //在pc端使用 自己去获取微信appid
    function setAppid() {

        if(kdAppSet.getAppParam().appid){
           return;
        }

        function createTimestamp() {
            return parseInt(new Date().getTime() / 1000) + '';
        }

        var eid = kdAppSet.getAppParam().eid;
        var timestamp = createTimestamp();
        var token = timestamp + "kingdee" + eid;
        token = Lib.MD5.encrypt(token);
        var param = {
            "eid": eid,
            "timestamp": timestamp,
            "token": token
        };

        var url = 'http://mob.cmcloud.cn/serverCloud/Weixin/GetServerInfo_Api';
        var xhr = new window.XMLHttpRequest();
        xhr.open('post', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        var appInfo = json.data;
                        kdAppSet.setAppParam({
                            'appid': appInfo.appid
                        });
                    } else {
                        OptMsg.ShowMsg(json.msg);
                    }
                }
            }
        };
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(toQueryString(param));
    }


    function toQueryString(obj) {
        if (obj == null) {
            return String(obj);
        }
        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return obj;
        }
        if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
            return obj.valueOf();
        }
        if (obj instanceof Array) {
            return '[' + obj.join(', ') + ']';
        }
        var fn = arguments.callee;
        var pairs = [];
        for (var name in obj) {
            pairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(fn(obj[name])));
        }
        return pairs.join('&');
    }


    function setPayCode(config) {
        viewPage.find('img').attr('src', 'img/kdpx.gif');
        var url = OptUtils.getImgQrcodeUrl({
            url: config.url
        });
        viewPage.find('img').attr('src', url);
    }




    //设置微信代付链接
    function setWxShare(pay) {
        /*billmoney: 0.01
         billno: "SEORD002209"
         freight: 0
         interid: "3385"
         payType: ""
         sendType: 0*/

        var link = OrderPay.getWxPayUrl({
            billno: pay.billno,
            freight: pay.freight,
            billmoney: pay.billmoney
        });
        var sumMoney = Number(pay.billmoney) + Number(pay.freight);
        var title = '邀请好友代付';
        var desc = '您的好友 ' + kdAppSet.getUserInfo().contactName
            + ' ，邀请您代付一笔金额为' + sumMoney + '元的微商城订单';

        kdAppSet.wxShare(
            {
                title: title,
                desc: desc,
                link: link,
                imgUrl: '',
                qqlink: link,
                fnCallBack: function () {
                    kdShare.backView();
                }
            }
        );
    }

    function show() {
        kdAppSet.setAppTitle('微信代付');
        viewPage.show();
    }

    function hide() {
        viewPage.hide();
    }

    return {
        render: render,
        setWxShare: setWxShare,
        setAppid: setAppid,
        show: show,
        hide: hide
    };


})();