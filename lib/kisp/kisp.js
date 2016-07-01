;
(function (global, Array, Boolean, Date, Error, Function, Math, Number, Object, RegExp, String, undefined) {


    MiniQuery.use('$');

    var MD5 = (function () {


        /*md5 生成算法*/
        var hexcase = 0;
        var chrsz = 8;


        function core_md5(x, len) {
            x[len >> 5] |= 0x80 << ((len) % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;

                a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return Array(a, b, c, d);
        }

        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
        }

        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        function str2binl(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
            }
            return bin;
        }

        function binl2hex(binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
            }
            return str;
        }


        return {

            //md5加密主方法
            encrypt: function (s) {

                if (arguments.length > 1) {
                    s = Array.prototype.slice.call(arguments, 0).join('');
                }

                return binl2hex(core_md5(str2binl(s), s.length * chrsz));
            }

        };


    })();


    var ServerConfig = (function () {


        var cache = (function () {

            var key = '__ServerConfig__';
            var storage = window.sessionStorage;

            return function (data) {

                //return null;

                if (arguments.length == 0) { //get
                    data = storage.getItem(key);
                    data = $.Object.parseJson(data);
                    return data;
                }
                else { //set
                    data = $.Object.toJson(data);
                    storage.setItem(key, data);
                }

            };

        })();


        function GetQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                var qstr = r[2];
                if (qstr == "null") {
                    qstr = "";
                }
                return qstr;
            }
            return "";
        }

        var eid = GetQueryString('eid');
        var keyv = "wdhlogininfo" + eid;
        var appParam = {};
        if (window.localStorage) {
            var storage = window.localStorage;
            var objstr = storage.getItem(keyv);
            appParam = JSON.parse(objstr) || {};
        }
        var isdebug = appParam.isdebug || '';
        if (isdebug != 2) {
            isdebug = GetQueryString("isdebug") || '';
        }

        function ajax(fn) {

            var url = 'http://mob.cmcloud.cn/kisplus/kisplusconfig.aspx?callback=?';
            //var url = 'http://mob.cmcloud.cn/kisplus/kisplusconfig_test.aspx?callback=?';

            $.getJSON(url, function (json) {

                var data = null;
                try {

                    var host = json['kisplusServerS'];
                    var path = json['kisplusAppsecret'];
                    //isdebug =2 表示走旗舰版4.2的测试环境
                    host = isdebug == 2 ? (host + ':8080') : host;
                    data = {
                        version: json['ver'],
                        fromTag: json['fromtag'],
                        key: json['AccKey'],
                        secret: json['AccSecret'],
                        host: host,
                        path: path,
                        route: json['kisplusApiRouter'],
                        url: host + path,
                    };

                }
                catch (ex) {
                    data = null;
                }

                console.log('ServerConfig (ajax):');
                console.dir(data);

                fn && fn(data);
            });
        }


        function get(fn) {

            var data = cache();
            if (data) {
                console.log('ServerConfig (cache):');
                console.dir(data);
                fn && fn(data);
                return;
            }


            ajax(function (data) {
                cache(data);
                fn && fn(data);
            });
        }


        return {
            get: get
        };


    })();


    var ServerUrl = (function (ServerConfig, MD5) {


        var Cache = (function () {

            var key = '__ServerUrl__';
            //var storage = window.localStorage;
            var storage = window.sessionStorage;

            var all = storage.getItem(key);
            all = all ? $.Object.parseJson(all) || {} : {};


            function get(eid) {
                //return null;
                return all[eid];
            }

            function set(eid, data) {
                all[eid] = data;

                var json = $.Object.toJson(all);
                storage.setItem(key, json);
            }

            function remove(eid) {
                if (eid) { //指定了 eid, 则移除该项
                    if (eid in all) {
                        delete all[eid];
                        var json = $.Object.toJson(all);
                        storage.setItem(key, json);
                    }
                }
                else { //否则全部移除
                    all = {};
                    storage.setItem(key, '{}');
                }
            }

            return {
                get: get,
                set: set,
                remove: remove
            };

        })();


        function ajax(config, fnSucess, fnFail, fnError) {

            config = config || {
                eid: '',
                appid: '',
                secret: '',
                key: '',
                url: ''
            };

            var eid = config['eid'];
            var timestamp = $.Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var random = $.String.random(16); //16位随机数
            var data = {
                'EID': eid,
                'NetID': -1,
                'AppID': config['appid'],
                'AccKey': config['key'],
                'Timestamp': timestamp,
                'State': random,
                'Sign': MD5.encrypt(eid, config['secret'], timestamp, random)
            };

            var url = config['url'] + '?callback=?';
            $.getJSON(url, data, function (json) {

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
                            window.kis$NetID = item['NetID'];
                        } catch (e) {
                        }
                        fnSucess && fnSucess(data, json);
                    }
                    else if (code == 200) {
                        data = {
                            url: json['ServerUrl'],
                            secret: json['AppSecret'],
                            NetID: json['NetID']
                        };
                        try {
                            window.kis$NetID = json['NetID'];
                        } catch (e) {
                        }
                        fnSucess && fnSucess(data, json);
                    }
                    else {
                        fnFail && fnFail(code, json['ErrMsg'], json);
                    }

                }
                else {
                    fnError && fnError();
                }

            });
        }


        function get(config, fnSucess, fnFail, fnError) {

            config = config || {
                eid: '',
                appid: ''
            };

            var eid = config['eid'];

            var data = Cache.get(eid);

            if (data) {
                //console.log('ServerUrl (cache):');
                //console.dir(data);
                fnSucess && fnSucess(data);
                try{
                    window.kis$NetID = data['NetID'];
                }catch(e){}
                return;
            }


            ServerConfig.get(function (server) {

                if (!server) {
                    fnError && fnError();
                    return;
                }


                ajax({
                    eid: eid,
                    appid: config['appid'],

                    secret: server['secret'],
                    key: server['key'],
                    url: server['url']

                }, function (data, json) { //成功

                    var url = data['url'] || '';
                    if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
                        url = url + server['route'];
                    }
                    else {
                        url = 'http://' + url + server['route'];
                    }

                    var obj = {
                        secret: data['secret'],
                        version: server['version'],
                        fromTag: server['fromTag'],
                        url: url,
                        NetID: data['NetID'],
                        //url: 'http://xx.oo.com/Webapi/Router',
                    };

                    Cache.set(eid, obj);

                    fnSucess && fnSucess(obj, json);

                }, fnFail, fnError);

            });
        }


        return {
            get: get,
            removeCache: Cache.remove
        };


    })(ServerConfig, MD5);


    var API = (function (ServerUrl, MD5) {


        function parseJSON(data) {

            try {
                return window.JSON.parse(data);
            }
            catch (ex) {
                try {
                    data = data.replace(/^(\r\n)+/g, '');
                    return (new Function('return ' + data))();
                }
                catch (ex) {
                    return null;
                }
            }

            return null;

        }


        function ajax(config, fnSuccess, fnFail, fnError) {

            config = config || {
                name: '',
                eid: '',
                secret: '',
                version: '',
                fromTag: '',
                url: '',
                openid: '',
                appid: '',

                pubacckey: '',
                timestamp: '',
                nonce: '',
                pubaccid: '',

                data: {}
            };


            var eid = config['eid'];
            var name = config['name'];

            var timestamp = $.Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var random = $.String.random(16); //16位随机数
            var data = {
                'EID': eid,
                'Method': name,
                'Timestamp': timestamp,
                'Ver': config['version'],
                'FromTag': config['fromTag'],
                'AppID': config['appid'],
                'IsNewJson': 'Y',
                'IsEncrypt': 'N',
                //签名，值为md5(EID + AppSecret + Method + Timetamp + State )
                'Sign': MD5.encrypt(eid, config['secret'], name, timestamp, random),
                'State': random,
                'CustData': encodeURIComponent($.Object.toJson(config['data']))
            };


            var url = $.Url.setQueryString(config['url'], {
                eid: eid,
                openid: config['openid'],

                pubacckey: config['pubacckey'],
                timestamp: config['timestamp'],
                nonce: config['nonce'],
                pubaccid: config['pubaccid'],
                NetID: config['NetID']
            });

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);


            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var json = parseJSON(xhr.responseText);
                        if (!json) {
                            fnError && fnError();
                            return;
                        }
                        var code = json['Result'];
                        if (code == 200) {
                            fnSuccess && fnSuccess(json['DataJson'] || {}, json);
                        }
                        else {
                            fnFail && fnFail(code, json['ErrMsg'], json);
                        }
                    }
                    else {
                        fnError && fnError(xhr.status + ':' + xhr.statusText);
                    }
                }
            };


            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            data = $.Object.toQueryString(data);
            xhr.send(data);

        }


        function post(config, fnSuccess, fnFail, fnError) {


            config = config || {
                name: '',
                eid: '',
                openid: '',
                appid: '',

                pubacckey: '',
                timestamp: '',
                nonce: '',
                pubaccid: '',

                data: {}
            };


            var eid = config['eid'];

            ServerUrl.get({
                eid: eid,
                appid: config['appid'] || '',

            }, function (data, json) {//成功

                ajax({
                    //必选的
                    name: config['name'],
                    eid: eid,
                    openid: config['openid'],

                    //可选的
                    appid: config['appid'] || '',
                    pubacckey: config['pubacckey'] || '',
                    timestamp: config['timestamp'] || '',
                    nonce: config['nonce'] || '',
                    pubaccid: config['pubaccid'] || '',
                    data: config['data'] || {},

                    //来自 ServerUrl 的
                    secret: data['secret'],
                    version: data['version'],
                    fromTag: data['fromTag'],
                    url: data['url'],
                    NetID: data['NetID'],

                }, fnSuccess, fnFail, function (errCode) {

                    ServerUrl.removeCache(eid);
                    fnError && fnError(errCode);

                });

            }, fnFail, fnError);

        }

        return {
            post: post,

        };


    })(ServerUrl, MD5);


    var Scroller = (function (MiniQuery, IScroll) {


        document.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);


        //重载 IScroll.prototype 中的一些方法
        var on = IScroll.prototype.on;
        var refresh = IScroll.prototype.refresh;


        $.Object.extend(IScroll.prototype, {
            on: function (name, fn) {

                var self = this;

                if ($.Object.isPlain(name)) { // on({ name: fn })
                    $.Object.each(name, function (name, fn) {
                        var args = [name, fn];
                        on.apply(self, args);
                    });
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 0);
                    on.apply(self, args);
                }
            },

            //原来的刷新后会出现滚动条，这里使用钩子函数覆盖原实现
            refresh: function () {

                var args = Array.prototype.slice.call(arguments, 0);
                refresh.apply(this, args);

                //隐藏滚动条
                if (this.indicators != undefined) {
                    $.Array.each(this.indicators, function (item, index) {
                        $(item.indicator).hide();
                    });
                }
            },


            //下拉刷新
            pulldown: function (config) {

                var start = config.start;
                var end = config.end;
                var fn = config.fn;

                var el = $(config.selector);

                //避免重重复复执行

                //state 采用 3 bit 来表示 2-1-0，最多只有一个位为 1，因此有 001、010、100 三种情况
                //即对应的值为 1、2、4，采用与操作即可判断第几位为 1
                var state = 0;


                this.on({

                    'scrollStart': function () {
                        state = 0;
                        this.isWaitingForManualReset = false;
                    },

                    'scroll': function () { //该事件会给频繁触发，要注意性能控制

                        var y = this.y;
                        //console.log(y >> 0);

                        if (y < 0) { //向上拉，忽略
                            return;
                        }


                        if (y < start) {
                            if ((state & 1) == 0) { //第 0 位为 0
                                el.hide();
                                state = 1;  //001
                            }
                        }
                        else if (start <= y && y < end) {
                            if ((state & 2) == 0) { //第 1 位为 0
                                el.html('下拉刷新').show().css({
                                    top: (config.top || 10) + 'px'
                                });
                                state = 2; //010
                            }
                        }
                        else if (y >= end) {
                            if ((state & 4) == 0) { //第 2 位为 0
                                el.html('释放立即刷新');
                                state = 4; //100
                            }
                        }
                    },

                    'beforeScrollEnd': function () {

                        if ((state & 4) == 4) { //第 2 位为 1
                            this.isWaitingForManualReset = true;
                            el.html('正在刷新...');

                            var self = this;

                            fn && fn(function () {

                                el.html('刷新成功');

                                setTimeout(function () { //reset
                                    el.hide();
                                    self.scrollTo(0, 0, 500, self.options.bounceEasing);
                                }, 250);
                            });
                        }
                        else {
                            el.hide();
                        }
                    }
                });


            },


            pullup: function (config) {

                var start = config.start;
                var end = config.end;
                var fn = config.fn;
                var scroller = config.scroll;
                var el = $(config.selector);

                this.on({

                    'scrollStart': function () {
                        this.isWaitingForManualReset = false;
                    },

                    'scroll': function () {

                        var y = this.y;
                        if (y > 0) { //向下拉，忽略
                            return;
                        }
                        var maxy = scroller.maxScrollY;

                        var ih = y - maxy;

                        if (ih > 50) {
                            el.hide();
                        } else if (ih < -start && ih > -end) {
                            el.html('上拉加载更多').show().css({
                                bottom: (config.bottom || 10) + 'px'
                            });
                        } else if (ih < -end) {
                            el.html('释放立即刷新');
                        }
                    },

                    'beforeScrollEnd': function () {
                        el.hide();
                        var ih = this.y - scroller.maxScrollY;
                        if (ih < -end) {
                            //el.html('正在刷新...');
                            fn && fn(function () {
                                //el.html('刷新成功');
                                setTimeout(function () {
                                    el.hide();
                                    //scroller.scrollTo(0, 0, 500, scroller.options.bounceEasing);
                                }, 250);
                            });
                        } else {
                            el.hide();
                        }

                    }
                });
            }

        });


        function create(el, config) {

            var obj = $.Object.extend({
                scrollbars: true,
                //fadeScrollbars: true,
                shrinkScrollbars: 'scale',
                preventDefault: false, /**默认为 true*/
                probeType: 2, //设置了此值， scroll 事件才会触发，可取的值为 1，2，3

            }, config);

            var self = new IScroll(el, obj);


            var indicators = $.Array.keep(self.indicators || [], function (item, index) {
                var indicator = item.indicator;
                $(indicator).hide();
                return indicator;
            }) || [];


            //有延迟，要实时获取
            var hasScrollBar = function () {
                var hasX = self.hasHorizontalScroll;
                var hasY = self.hasVerticalScroll;
                var len = indicators.length;
                return (len == 1 && (hasX || hasY)) ||
                    (len == 2 && (hasX && hasY));
            };


            self.on('scroll', function () {
                /*            if (this.hasHorizontalScroll) {
                 }else{
                 //hong 去掉了 允许横向滚动，但会导致 垂直方向数据不够时，不能滚动
                 this._translate(0, (this.distY * 0.5) >> 0);
                 }*/
                if (this.hasHorizontalScroll) {
                } else if (!this.hasVerticalScroll) {
                    this._translate(0, (this.distY * 0.5) >> 0);
                }
            });


            var timeoutId = null;
            var isScrolling = false;

            //按下时并开始滚动时触发
            self.on('scrollStart', function () {

                isScrolling = true;
                clearTimeout(timeoutId);

                if (hasScrollBar()) {
                    $.Array.each(indicators, function (item, index) {
                        $(item).show();
                    });
                }
            });

            self.on('scrollEnd', function () {

                isScrolling = false;

                //当第一个 scrollEnd 中的 fadeOut 还没执行完就又开始第二个 beforeScrollStart 时，
                //就会有时间先后的竞争关系。 这会导致第二个 beforeScrollStart 中的 show 失效
                timeoutId = setTimeout(function () {
                    if (hasScrollBar()) {
                        $.Array.each(indicators, function (item, index) {
                            $(item).fadeOut('fast', function () {
                                if (isScrolling) {
                                    $(item).show();
                                }
                            });
                        });
                    }
                }, 100);
            });

            return self;
        }


        return {
            create: create
        };


    })(MiniQuery, IScroll);


//扩展 jQuery
    $.Object.extend(jQuery.fn, {

        touch: function (selector, fn) {

            var isMoving = false;

            //是否PC浏览器
            function isPcBrower() {
                var userAgentInfo = navigator.userAgent;
                var Agents = new Array("Android", "iPhone", "iPad", "iPod");
                var flag = true;
                for (var v = 0; v < Agents.length; v++) {
                    if (userAgentInfo.indexOf(Agents[v]) > 0) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            }

            if (typeof selector == 'function') { //$(div).touch(fn)

                fn = selector;

                if (isPcBrower()) {
                    return $(this).on({
                        'click': function (e) {
                            var args = Array.prototype.slice.call(arguments, 0);
                            fn.apply(this, args);
                        }
                    });
                } else {

                    return $(this).on({
                        'touchmove': function () {
                            isMoving = true;
                        },

                        'touchend': function (e) {
                            if (isMoving) {
                                isMoving = false;
                                return;
                            }

                            var args = Array.prototype.slice.call(arguments, 0);
                            fn.apply(this, args);
                        }
                    });
                }
            }

            //此时为 $(div).touch(selector, fn)
            if (isPcBrower()) {
                return $(this).on({
                    'click': function (e) {
                        var args = Array.prototype.slice.call(arguments, 0);
                        fn.apply(this, args);
                    }
                });
            } else {
                return $(this).delegate(selector, {

                    'touchmove': function () {
                        isMoving = true;
                    },

                    'touchend': function (e) {
                        if (isMoving) {
                            isMoving = false;
                            return;
                        }

                        var args = Array.prototype.slice.call(arguments, 0);
                        fn.apply(this, args);
                    }
                });
            }
        }
    });


    var KISP = {
        API: API,
        Scroller: Scroller,
        MD5: MD5
    };


//暴露
    if (typeof define == 'function' && define.amd) { //amd
        define(function (require) {
            return KISP;
        });
    }
    else { //browser
        global.KISP = KISP;
    }


})(
    this,
    Array,
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String
    /*, undefined */
);
