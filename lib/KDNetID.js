/*
 * author:yaohong_zhou
 * date:2016-05-18
 * desc:获取通道NetId
 *
 * */
var KDNetID = (function () {


    function get(eid, fncall) {
        kdAppSet.setKdLoading(true, '正在发起支付...');
        var url = 'http://mob.cmcloud.cn/kisplus/kisplusconfig.aspx?callback=?';
        $.getJSON(url, function (json) {
            var data = null;
            try {
                var host = json['kisplusServerS'];
                var path = json['kisplusAppsecret'];
                data = {
                    version: json['ver'],
                    fromTag: json['fromtag'],
                    key: json['AccKey'],
                    secret: json['AccSecret'],
                    host: host,
                    path: path,
                    route: json['kisplusApiRouter'],
                    url: host + path
                };
            }
            catch (ex) {
                data = null;
                kdAppSet.setKdLoading(false);
                jAlert('获取NetID接口报错，请稍后重试');
                return;
            }
            console.log('KDNetID info:');
            console.dir(data);
            getNetId && getNetId(eid, fncall, data);
        });
    }


    function getNetId(eid, fncall, config) {
        var kisNetID = '';
        config = config || {
            eid: eid,
            appid: '',
            secret: '',
            key: '',
            url: ''
        };
        var timestamp = $.Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        var random = $.String.random(16); //16位随机数
        var data = {
            'EID': eid,
            'NetID': -1,
            'AppID': config['appid'],
            'AccKey': config['key'],
            'Timestamp': timestamp,
            'State': random,
            'Sign': Lib.MD5.encrypt(eid, config['secret'], timestamp, random)
        };

        var url = config['url'] + '?callback=?';
        $.getJSON(url, data, function (json) {
            kdAppSet.setKdLoading(false);
            if (json) {
                var code = json['Result'];
                var data = {};
                if (code == 302) {
                    //4.2产品多实例
                    var item = json['NetIDList'][0];
                    data = {
                        url: item['ServerUrl'],
                        secret: item['AppSecret'],
                        NetID: item['NetID']
                    };
                    try {
                        kisNetID = item['NetID'];
                    } catch (e) {
                    }
                    fncall && fncall("ok", {
                        NetID: kisNetID
                    });
                }
                else if (code == 200) {
                    data = {
                        url: json['ServerUrl'],
                        secret: json['AppSecret'],
                        NetID: json['NetID']
                    };
                    try {
                        kisNetID = json['NetID'];
                    } catch (e) {
                    }
                    fncall && fncall("ok", {
                        NetID: kisNetID
                    });
                }
                else {
                    fncall && fncall("fail", {});
                }
            }
            else {
                fncall && fncall("error", {});
            }
        });
    }


    return {
        get: get
    }

})();


