var ChatList = (function () {

    var xApi = (function () {

        //url 接口url，param  接口参数， fnCall 回调
        function post(caller) {
            var xhr = new window.XMLHttpRequest();
            xhr.open('post', caller.url, true);
            xhr.withCredentials = "true";
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var data = xhr.responseText;
                        var json = (new Function('return ' + data))();
                        caller.fnCall && caller.fnCall(json);
                        //随机延迟服务端响应

                        /*                         var itime=Math.random()*10*500;
                         setTimeout(function(){
                         caller.fnCall && caller.fnCall(json);
                         },itime);*/
                    }
                }
            };
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(caller.param);
        }

        return {
            post: post
        }
    })();

    var xApp = (function () {
        var param;
        var isIphone = 0;

        function init(config) {
            if (!param && config) {
                param = config;
                if (param.nick == "WX用户") {
                    var openid = param.openid;
                    param.nick = "零售客户" + openid.substring(openid.length - 3);
                }
            }
            return param;
        }

        function update(info) {
            if (param) {
                param.groupid = info.groupid || 0;
            }
        }

        //是否iphone flag=1 iphone微信浏览器 flag=2
        function checkIphoneSeries() {
            var userAgentInfo = navigator.userAgent.toLowerCase();
            var Agents = ["iphone", "ipad", "ipod"];
            var wxchat = ["micromessenger"];
            var flag = 0;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = 1;
                    if (userAgentInfo.indexOf(wxchat) > 0) {
                        flag = 2;
                    }
                    break;
                }
            }
            return flag;
        }

        init();
        isIphone = checkIphoneSeries();

        return {
            init: init,
            update: update,
            isIphone: isIphone
        }
    })();

    var xDate = (function () {


        //格式化日期 把2015-1-8 20:5:22  格式化成 2015-01-08 20:05:22
        function xformat(date) {

            if (!date) {
                return '';
            }

            function fmt(num) {
                num = num + '';
                return num.length > 1 ? num : '0' + num;
            }

            try {
                var dateStr = '';
                var d = date.split(' ');
                var day = d[0];
                var d1 = day.split('-');
                for (var i in d1) {
                    dateStr = (i == 0 ? dateStr + fmt(d1[i]) : dateStr + '-' + fmt(d1[i]));
                }
                dateStr = dateStr + ' ';
                var time = d[1];
                var t1 = time.split(':');
                for (var j in t1) {
                    dateStr = (j == 0 ? dateStr + fmt(t1[j]) : dateStr + ':' + fmt(t1[j]));
                }
                return dateStr;
            } catch (e) {
                return date;
            }
        }

        //day 是在当前日期上进行加减
        function getDay(iday, dateStr) {
            var date = new Date();
            if (dateStr) {
                date = new Date(dateStr);
            }
            date.setDate(date.getDate() + iday);
            var month = date.getMonth() + 1;
            var day = date.getDate();
            return date.getFullYear() + "-" + (month < 10 ? "0" : "")
                + month + "-" + (day < 10 ? "0" : "") + day;
        }

        //把日期转换成时间戳
        function parseitime(datestr) {
            var isIphone = xApp.isIphone;
            var itime = 0;
            if (isIphone > 0) {
                var msgtime = datestr.replace(/-/g, "/");
                itime = Date.parse(new Date(msgtime));
            } else {
                itime = Date.parse(new Date(datestr));
            }
            return Number(itime);

        }


        function format(date, fmt) { //author: meizz
            var o = {
                "M+": date.getMonth() + 1, //月份
                "d+": date.getDate(), //日
                "H+": date.getHours(), //小时
                "m+": date.getMinutes(), //分
                "s+": date.getSeconds(), //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        return {
            parseitime: parseitime,
            format: format,
            xformat: xformat,
            getDay: getDay
        }
    })();

    var xUtils = (function () {
        function throttle(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function () {
                var now = Date.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }

        function timestamp() {
            return parseInt(new Date().getTime() / 1000) + '';
        }

        return {
            throttle: throttle,
            timestamp: timestamp
        }
    })();

    var xString = (function () {

        /**
         * 获取位于两个标记子串之间的子字符串。
         * @param {String} string 要进行获取的大串。
         * @param {String} tag0 区间的开始标记。
         * @param {String} tag1 区间的结束标记。
         * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
         * @example
         $.String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello'
         */

        function between(string, tag0, tag1) {
            var startIndex = string.indexOf(tag0);
            if (startIndex < 0) {
                return '';
            }

            startIndex += tag0.length;

            var endIndex = string.indexOf(tag1, startIndex);
            if (endIndex < 0) {
                return '';
            }

            return string.substr(startIndex, endIndex - startIndex);
        }


        /*
         *
         * @dom {string} dom节点的id标识 或者jquery 包裹的对象
         * @returns 返回这个节点的默认模板
         *
         * */
        function template(domId) {
            var htmlStr = (typeof domId == 'string') ? document.getElementById(domId).innerHTML : domId[0].innerHTML;
            return between(htmlStr, '<!--', '-->');
        }


        /**
         * 产生指定格式或长度的随机字符串。
         * @param {string|int} [formater=12] 随机字符串的格式，或者长度（默认为12个字符）。
         格式中的每个随机字符用 'x' 来占位，如 'xxxx-1x2x-xx'
         * @return {string} 返回一个指定长度的随机字符串。
         * @example
         $.String.random();      //返回一个 12 位的随机字符串
         $.String.random(64);    //返回一个 64 位的随机字符串
         $.String.random('xxxx-你好xx-xx'); //类似 'A3EA-你好B4-DC'
         */
        function random(formater) {
            if (formater === undefined) {
                formater = 12;
            }

            //如果传入的是数字，则生成一个指定长度的格式字符串 'xxxxx...'
            if (typeof formater == 'number') {
                var size = formater + 1;
                if (size < 0) {
                    size = 0;
                }
                formater = [];
                formater.length = size;
                formater = formater.join('x');
            }

            return formater.replace(/x/g, function (c) {
                var r = Math.random() * 16 | 0;
                return r.toString(16);
            }).toUpperCase();
        }


        /**
         * 用指定的值去填充一个字符串。
         * 当不指定字符串的填充标记时，则默认为 {}。
         * @param {String} string 要进行格式填充的字符串模板。
         * @param {Object} obj 要填充的键值对的对象。
         * @return 返回一个用值去填充后的字符串。
         * @example
         * 用法：
         $.String.format('{id}{type}', {id: 1, type: 'app'});
         $.String.format('{2}{0}{1}', 'a', 'b', 'c');
         */
        function format(string, obj, arg2) {
            var s = string;
            if (typeof obj == 'object') {
                for (var key in obj) {
                    s = replaceAll(s, '{' + key + '}', obj[key]);
                }
            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = args.length; i < len; i++) {
                    s = replaceAll(s, '{' + i + '}', args[i]);
                }
            }
            return s;
        }

        /**
         * 对字符串进行全局替换。
         * @param {String} target 要进行替换的目标字符串。
         * @param {String} src 要进行替换的子串，旧值。
         * @param {String} dest 要进行替换的新子串，新值。
         * @return {String} 返回一个替换后的字符串。
         * @example
         $.String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
         */
        function replaceAll(target, src, dest) {
            return target.split(src).join(dest);
        }

        // 金额千分位格式化
        function formatMoney(money, digit) {
            if (money == undefined) {
                money = 0;
            }
            var moneystr = money + "";
            if (digit == undefined) {
                digit = moneystr.indexOf(".");
                if (digit < 0) {
                    digit = 0;
                } else {
                    digit = moneystr.length - 1 - digit;
                }
            }
            return formatM(moneystr, digit);
        }

        // 金额千分位格式化
        function formatM(money, digit) {
            try {
                var minusFlag = false;
                if (money < 0) {
                    money = -money;
                    minusFlag = true;
                }
                digit = digit >= 2 ? 2 : digit;
                money = parseFloat((money + "").replace(/[^\d\.-]/g, "")).toFixed(digit) + "";
                var intPart = "";
                var fraction = "";
                if (digit > 0) {
                    intPart = money.split(".")[0].split("").reverse();
                    fraction = money.split(".")[1];
                } else {
                    intPart = money.split("").reverse();
                }
                var temp = "";
                var inum = intPart.length;
                for (var i = 0; i < inum; i++) {
                    temp += intPart[i] + ((i + 1) % 3 == 0 && (i + 1) != inum ? "," : "");
                }
                var digitStr = '';
                if (digit > 0) {
                    digitStr = temp.split("").reverse().join("") + "." + fraction;
                } else {
                    digitStr = temp.split("").reverse().join("");
                }
                if (minusFlag) {
                    digitStr = '-' + digitStr;
                }
                return digitStr;
            }
            catch (ex) {
                return money;
            }

        }


        return {
            formatMoney: formatMoney,
            random: random,
            between: between,
            format: format,
            template: template
        }
    })();

    var xObject = (function () {
        function extend(target, obj1, obj2) {

            //针对最常用的情况作优化
            if (obj1 && typeof obj1 == 'object') {
                for (var key in obj1) {
                    target[key] = obj1[key];
                }
            }

            if (obj2 && typeof obj2 == 'object') {
                for (var key in obj2) {
                    target[key] = obj2[key];
                }
            }

            var startIndex = 3;
            var len = arguments.length;
            if (startIndex >= len) {
                return target;
            }

            //更多的情况
            for (var i = startIndex; i < len; i++) {
                var obj = arguments[i];
                for (var name in obj) {
                    target[name] = obj[name];
                }
            }

            return target;
        }

        function clone(obj) {
            var o, i, j;
            if (typeof(obj) != "object" || obj === null)return obj;
            if (obj instanceof(Array)) {
                o = [];
                i = 0;
                j = obj.length;
                for (; i < j; i++) {
                    if (typeof(obj[i]) == "object" && obj[i] != null) {
                        o[i] = arguments.callee(obj[i]);
                    }
                    else {
                        o[i] = obj[i];
                    }
                }
            }
            else {
                o = {};
                for (i in obj) {
                    if (typeof(obj[i]) == "object" && obj[i] != null) {
                        o[i] = arguments.callee(obj[i]);
                    }
                    else {
                        o[i] = obj[i];
                    }
                }
            }

            return o;
        }


        function toQueryStr(obj) {
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

        function isEmpty(obj) {
            if (obj) {
                for (var i in obj) {
                    return false;
                }
                return true;
            }
            return true;
        }

        return {
            isEmpty: isEmpty,
            toQueryStr: toQueryStr,
            extend: extend,
            clone: clone
        }
    })();

    var Param = (function () {


        var param;
        var pagesize = 50;

        function init() {
            param = xApp.init();
            return param;
        }

        /*eid	Y		企业号
         appid	Y		应用ID
         openid	Y		用户标识 微信、云之家
         method	Y		调用API名称
         ts*/
        /*Nick	Y		用户昵称
         isKisUser	0		登陆用户类型，从微信登陆0，云家之家1 默认0
         Imgurl			用户图像URL
         ServicersPhone*/

        function login() {
            init();
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.login',
                ts: xUtils.timestamp(),
                Nick: param.nick,
                isKisUser: param.appflag,
                Imgurl: param.img,
                ServicersPhone: param.phone
            }
        }

        /*
         * groupid	Y		对话组ID
         talktime			如没有值，取最新10条对话记录，
         返回指定时间后的对话记录
         pageindex	N	1	当前页码
         pagesize	N	1	页码数
         * */

        function talklist(imsg) {
            init();
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.talklist',
                ts: xUtils.timestamp(),
                groupid: imsg.groupid,
                talktime: imsg.talktime,
                pageindex: 1,
                pagesize: pagesize
            }
        }

        function sendmsg(imsg) {
            init();
            var msg = {
                msg: imsg.msg
            };
            if (imsg.other) {
                msg.other = imsg.other;
            }
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.sendmsg',
                ts: xUtils.timestamp(),
                groupid: imsg.groupid,
                msgid: imsg.msgid || 0,
                msg: JSON.stringify(msg)
            }


        }

        function talkgroup() {
            init();
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.talkgroup',
                ts: xUtils.timestamp(),
                pageindex: 1,
                pagesize: pagesize
            }
        }

        return {
            init: init,
            login: login,
            talklist: talklist,
            talkgroup: talkgroup,
            sendmsg: sendmsg
        }

    })();

    var Api = (function () {

        var Api = xApi;

        var url = 'http://kismob.kingdee.com/cs/rest';

        /*        //以下2个参数 微信用户使用。云之家不需要
         var groupid;
         var talktime = '';*/

        function login(fnCall) {
            var parm = xObject.toQueryStr(Param.login());
            Api.post({
                url: url,
                param: parm,
                fnCall: fnCall
            });
        }

        function talkList(imsg, fnCall) {

            if (Param.init().appflag == 0) {
                //微信用户
                if (imsg.talktime) {
                    getTalk(fnCall, {
                        groupid: imsg.groupid,
                        talktime: imsg.talktime
                    });
                } else {
                    //微信首次加载要登录
                    login(function (json) {
                        if (json.Result == 200) {
                            var data = json.Data || {};
                            var groupid = data.groupid || 0;
                            //把会话组信息 存起来
                            xApp.update({groupid: groupid});
                            getTalk(fnCall, {
                                groupid: groupid,
                                talktime: ''
                            });
                        }

                    });
                }
            } else {
                getTalk(fnCall, {
                    groupid: imsg.groupid,
                    talktime: imsg.talktime
                });
            }

        }

        function getTalk(fnCall, imsg) {
            var parm = xObject.toQueryStr(Param.talklist({
                groupid: imsg.groupid,
                talktime: imsg.talktime
            }));

            Api.post({
                url: url,
                param: parm,
                fnCall: function (json) {
                    var data;
                    if (json.Result == 200) {
                        /*                        data = json.Data || {};
                         groupid = data.GroupID || 0;
                         talktime = data.getTime || '';*/
                        fnCall && fnCall(json);
                    }
                }
            });
        }


        function sendMsg(imsg, fnCall) {

            var vmsg;
            var vgroupid;
            //微信
            vmsg = imsg.msg;
            vgroupid = imsg.groupid;

            var parm = xObject.toQueryStr(Param.sendmsg({
                other: imsg.other,
                msgid: imsg.msgid,
                msg: vmsg,
                groupid: vgroupid
            }));
            Api.post({
                url: url,
                param: parm,
                fnCall: fnCall
            });
        }


        return {
            talkList: talkList,
            sendMsg: sendMsg
        }

    })();

    var Chat = (function () {

        //格式化数据
        function format(uList, msgs, groupid, talktime) {
            var defaultImg = 'img/chatweixin.png';

            function getImg(openid) {
                var iuser = user[openid];
                if (iuser) {
                    return iuser.img || defaultImg;
                }
                for (var i in uList) {
                    if (uList[i].openid == openid) {
                        user[openid] = {
                            img: uList[i].imgurl,
                            nick: uList[i].nick
                        };
                        return user[openid].img || defaultImg;
                    }
                }
                return '';
            }

            function getNick(openid) {
                var iuser = user[openid];
                if (iuser) {
                    return iuser.nick || '';
                }
                for (var i in uList) {
                    if (uList[i].openid == openid) {
                        user[openid] = {
                            img: uList[i].imgurl,
                            nick: uList[i].nick
                        };
                        return user[openid].nick;
                    }
                }
                return '';
            }

            var user = {};
            var param = Param.init();
            var openid = param.openid;
            var list = [];
            var vOpenid;
            var msgid;
            var msgObj;
            var msg;
            var other;
            var itime;
            var msgtime;

            var len = msgs.length - 1;
            for (var i = len; i >= 0; i--) {
                vOpenid = msgs[i].openID;
                msgid = msgs[i].fid;

                //解析消息格式
                try {
                    msgObj = JSON.parse(msgs[i].message);
                    msg = msgObj.msg || '';
                    other = msgObj.other || '';
                } catch (e) {
                    msg = msgs[i].message;
                    other = '';
                }

                //把消息时间 转换成时间戳 方便比较大小
                msgtime = msgs[i].createTime;
                try {
                    itime = xDate.parseitime(msgtime);
                    itime = itime / 1000;
                } catch (e) {
                }

                //console.log(msgtime+'*'+itime);
                list.push({
                        msgid: msgid,
                        msg: msg,
                        other: other,
                        time: msgtime,
                        itime: itime,
                        me: openid == vOpenid,
                        img: getImg(vOpenid),
                        nick: getNick(vOpenid)
                    }
                );
            }

            return {
                list: list,
                talktime: talktime,
                msgid: msgid,
                groupid: groupid
            };


        }

        //获取聊天记录
        function get(imsg, fnCall) {
            Api.talkList(imsg, function (json) {
                var data;
                if (json.Result == 200) {
                    data = json.Data || {};
                    var user = data.msgUsers || [];
                    var msgs = data.msgs || [];
                    var groupid = data.GroupID || 0;
                    var talktime = data.getTime || '';
                    fnCall && fnCall(format(user, msgs, groupid, talktime));
                }
                // console.log(JSON.stringify(json));
            });
        }

        function send(imsg, fnCall) {
            Api.sendMsg(imsg, function (json) {
                if (json.Result == 200) {
                    fnCall && fnCall(json);
                } else {
                    var ErrMsg = json.ErrMsg;
                    jAlert(ErrMsg);
                }
            });
        }

        return {
            get: get,
            send: send
        };


    })();


    var viewPage;
    var chatList;
    var chatView;
    var me_li;
    var other_li;
    var time_li;
    var goods_li;
    var msgText;

    var msgTxtId = 'viewid-chat-msg';

    var config;
    //消息重复获取标志
    var repeat = 1;
    //消息获取间隔时间
    var repeatTime = 1000;
    //消息id最大值
    var maxMsgId = 0;
    //用来做发送消息成功与否的判断
    var msgId = 0;
    //用来记录消息发送时间
    var msgSendList = {};
    //最后一条消息的时间
    var lastMsgTime = 0;
    //微商城商品信息
    var goodsInfo;
    //消息时间显示 默认间隔5分钟
    var timeApart = 60 * 5;
    var today = xDate.getDay(0);
    var scroller;
    var hasInit;
    //已经查看过的最大消息id
    var msgIdVisited = 0;
    //当前页面是否显示
    var isView = true;


    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid-chat');
            chatView = document.getElementById('viewid-chat-list');
            chatList = $(chatView);
            var chatHtml = chatView.innerHTML;
            me_li = xString.between(chatHtml, '<!--me', 'me-->');
            other_li = xString.between(chatHtml, '<!--other', 'other-->');
            time_li = xString.between(chatHtml, '<!--time', 'time-->');
            goods_li = xString.between(chatHtml, '<!--goods', 'goods-->');
            chatView.innerHTML = '';
            msgText = $('#' + msgTxtId);
            var scrolldiv = document.getElementById('viewid-chat-wrap');
            scroller = Lib.Scroller.create(scrolldiv);
            window.iscroller = scroller;
            kdctrl.initkdScroll(scroller, {});
            bindEvents();
            hasInit = true;
        }
    }


    //获取消息框的内容行数
    function getTxtRow() {
        var msg = document.getElementById(msgTxtId).value;
        var row = msg.split("\n").length;
        return row < 4 ? row : 4;
    }

    //监控消息框的内容
    function txtChange() {
        initTxt();
        var irow = getTxtRow();
        msgText.addClass('msgH' + irow);
    }

    //初始化消息发送框
    function initTxt() {
        for (var i = 1; i <= 4; i++) {
            msgText.removeClass('msgH' + i);
        }
    }

    //处理聊天消息中的回车符号
    function dealSpecialChar(msg) {
        return msg.replace(/\n/g, '<br />');
    }

    function bindEvents() {

        viewPage.delegate('[data-cmd="send"]', {
            'click': function () {
                var msg = msgText.val();
                if (msg != '') {
                    var groupid = xApp.init().groupid;
                    msgText.val('');
                    initTxt();
                    var other = '';
                    if (!xObject.isEmpty(goodsInfo)) {
                        other = JSON.stringify(goodsInfo);
                        msgId += 1;
                        sendMsg({
                            other: other,
                            msgid: msgId,
                            msg: '',
                            groupid: groupid
                        });
                        goodsInfo = {};
                        other = '';
                        //延迟一点点 免得消息的先后顺序区分不开
                        setTimeout(function () {
                            msgId += 1;
                            sendMsg({
                                other: other,
                                msgid: msgId,
                                msg: msg,
                                groupid: groupid
                            });
                        }, 10);
                    } else {
                        msgId += 1;
                        sendMsg({
                            other: other,
                            msgid: msgId,
                            msg: msg,
                            groupid: groupid
                        });
                    }
                }
                document.getElementById(msgTxtId).focus();

            },
            'touchstart': function () {
                $(this).addClass('on');
            },
            'touchend': function () {
                $(this).removeClass('on');
            }

        })
            .on('input propertychange', '#' + msgTxtId, xUtils.throttle(txtChange, 500));
        /*            .on('focus', '#' + msgTxtId, function () {
         refresh();
         });*/
        //.on('keyup', '#' + msgTxtId, xUtils.throttle(txtChange, 500));

        var resizeTimer = null;
        $(window).on('resize', function () {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                    resizeTimer = null;
                }
                resizeTimer = setTimeout(function () {
                    refresh();
                }, 120);
            }
        );
    }

    function sendMsg(imsg) {

        Chat.send(imsg, sendMsgCallBack);
        var itime = (new Date().getTime());
        var time = xDate.format(new Date(), "yyyy-MM-dd HH:mm:ss");
        msgSendList[imsg.msgid] = itime;
        window.itest = msgSendList;
        var img = xApp.init().img || 'img/chatweixin.png';
        iSay({
            other: imsg.other,
            msg: imsg.msg,
            sendid: imsg.msgid,
            img: img,
            time: time,
            itime: itime / 1000
        });

    }


    //刷新聊天窗口，滚动条置底
    function refresh() {
        // document.body.scrollTop = document.body.scrollHeight;
        scroller.refresh();
        scroller.scrollTo(0, -(scroller.scrollerHeight - scroller.wrapperHeight));
    }


    //显示消息时间
    function showTime(time) {
        var t = time.substring(0, time.length - 3);
        if (t.indexOf(today) >= 0) {
            t = t.replace(today, '');
        } else {
            t = t.substring(5);
        }
        var msgli = xString.format(time_li, {time: t});
        chatList.append(msgli);
        //refresh();
    }

    //显示商品信息
    function showGoods(other) {
        var goods = JSON.parse(other);
        var msgli = xString.format(goods_li, goods);
        chatList.append(msgli);
        //refresh();
    }

    //发送聊天信息
    function iSay(imsg, nofresh) {
        if (imsg.other) {
            if (imsg.itime - lastMsgTime > timeApart) {
                showTime(imsg.time);
                lastMsgTime = imsg.itime;
            }
            showGoods(imsg.other);
        }

        if (imsg.msg != '') {
            if (imsg.itime - lastMsgTime > timeApart) {
                showTime(imsg.time);
                lastMsgTime = imsg.itime;
            }
            var msgli = xString.format(me_li, {
                'sendid': imsg.sendid || '-1',
                'img': imsg.img,
                'msg': dealSpecialChar(imsg.msg)
            });
            chatList.append(msgli);
        }
        if (!nofresh) {
            refresh();
        }
    }

    //其它人发送的消息显示
    function otherSay(imsg, nofresh) {
        if (imsg.other) {
            showGoods(imsg.other);
        }
        if (imsg.msg != '') {
            if (imsg.itime - lastMsgTime > timeApart) {
                showTime(imsg.time);
                lastMsgTime = imsg.itime;
            }
            var msgli = xString.format(other_li, {
                'nick': imsg.nick,
                'img': imsg.img,
                'msg': dealSpecialChar(imsg.msg)
            });
            chatList.append(msgli);
        }
        if (!nofresh) {
            refresh();
        }
    }

    function firstMsg(msg) {
        viewPage.find('[data-cmd="send"]').show();
        hisList(msg);
        repeatCall();
    }

    //聊天历史
    function hisList(msg) {
        var list = msg.list;
        if (list.length > 0) {
            if (isView) {
                for (var i in list) {
                    if (list[i].msgid > maxMsgId) {
                        list[i].me ? (!config.talktime ? iSay(list[i], true) : '')
                            : otherSay(list[i], true);
                    }
                }
            }
            maxMsgId = msg.msgid;
            checkMsg();
            refresh();
        }
        if (msg.talktime) {
            config.talktime = msg.talktime;
            config.groupid = msg.groupid;
        }
    }

    function checkMsg() {
        if (!isView && maxMsgId > msgIdVisited) {
            setMsgAlert(true);
        }
    }

    function setMsgAlert(bview) {
        var bmsg = $('#view-itemdetail').find('[data-cmd="alert"]');
        bview ? bmsg.addClass('alert') : bmsg.removeClass('alert');
    }

    //检查消息是否发送成功 根据超时来判断
    function checkMsgSend() {
        var checktime = (new Date().getTime());
        var diff = 2000;
        var failList = [];
        for (var i in msgSendList) {
            if (checktime - msgSendList[i] >= diff) {
                failList.push(i);
            }
        }
        for (var j in failList) {
            chatList.find('[data-id="' + failList[j] + '"]').removeClass('hide');
        }

    }


    //消息发送成功后 由消息对象检查列表中删除
    function sendMsgCallBack(json) {
        if (json.Result == 200) {
            var Data = json.Data;
            var msgid = Data.msgid;
            delete msgSendList[msgid];
            var msgv = chatList.find('[data-id="' + msgid + '"]');
            msgv.addClass('hide');
        }
    }


    //循环检测是否有消息
    function repeatCall() {
        setTimeout(function () {
            if (repeat) {
                checkMsgSend();
                var groupid = xApp.init().groupid;
                Chat.get({
                    groupid: groupid,
                    talktime: config.talktime
                }, function (msg) {
                    hisList(msg);
                    repeatCall();
                });
            }
        }, repeatTime);
    }

    //检测是否携带浏览商品信息
    function checkGoods(init) {
        if (init.goodsName) {
            goodsInfo = {
                'img': init.goodsImg,
                'name': init.goodsName,
                'price': init.goodsPrice,
                'model': init.goodsModel
            }
        }
    }


    function render(init) {
        xApp.init(init);
        initView();
        show();
        viewPage.find('[data-cmd="send"]').hide();
        repeat = 1;
        maxMsgId = 0;
        lastMsgTime = 0;
        chatList.empty();
        config = {};
        Chat.get({
            groupid: 0,
            talktime: ''
        }, firstMsg);

        checkGoods(init || {});
    }

    function show() {
        viewPage.show();
        isView = true;
        setMsgAlert(false);
    }

    function hide() {
        //repeat = 0;
        msgIdVisited = maxMsgId;
        isView = false;
        viewPage.hide();
    }


    return {
        render: render,
        show: show,
        hide: hide
    }

})();