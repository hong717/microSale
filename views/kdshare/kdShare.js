/*公用函数库*/

var kdShare = (function () {
    //click效果
    var clickfn = {
        'touchstart': touchstart,
        'touchend': touchend
    };

    function touchstart() {
        $(this).addClass('onclick');
    }

    function touchend() {
        $(this).removeClass('onclick');
    }

    var Cache = (function () {

        var setCacheDataObj = function (obj, key) {
            if (window.localStorage) {
                var storage = window.localStorage;
                var strJson = JSON.stringify(obj);
                storage.setItem(key, strJson);
            } else {
            }
        };

        var setCacheData = function (obj, key) {
            if (window.localStorage) {
                var storage = window.localStorage;
                storage.setItem(key, obj);
            } else {
            }
        };

        var getCacheDataObj = function (key) {
            if (window.localStorage) {
                var storage = window.localStorage;
                var keyv = storage.getItem(key);
                return keyv == null ? "" : keyv;
            } else {
                return "";
            }
        };

        return {
            setCacheDataObj: setCacheDataObj,
            setCacheData: setCacheData,
            getCacheDataObj: getCacheDataObj
        };

    })();

    var Image = (function () {
        function setBigImage(imgobj) {
            MiniQuery.Event.trigger(window, 'toview', ['ImageView', { imgobj: imgobj }]);
            kdAppSet.stopEventPropagation();
        }

        return {
            setBigImage: setBigImage
        }
    })();

    //替换特殊字符串
    var ReplaceSChar = function (input) {
        input = input.replace(/'/g, "");
        input = input.replace(/"/g, "");
        input = input.replace(/,/g, "");
        return input;
    };

    //去除前后空格
    function trimStr(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    //生成随机数
    function GuidLike() {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    // 提取手机号码
    function getPureNumber(mobile) {
        mobile = mobile.replace(/[^0-9]/g, '');
        return mobile;
    }

    //debug 日志
    function kdlog(str) {
        console.log(str);
    }

    //是否是微信浏览器
    function is_weixinbrower() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    //是否是谷歌浏览器
    function is_chromebrower() {
        var ua = navigator.userAgent.toLowerCase();
        var browerstr = JSON.stringify(ua);
        if (browerstr.indexOf("applewebkit") > 0) {
            return true;
        } else {
            return false;
        }
    }

    //回退到上一页面
    function backView() {
        // MiniQuery.Event.trigger(window, 'backviewkeep');
        history.back();
    }

    //回退到上一页面
    function clearBackView(step) {
        MiniQuery.Event.trigger(window, 'clearbackview', [step]);
    }


    function clickfnImg(objimg, objbg) {
        return {
            'touchstart': function () {

                if (objimg) {
                    var srcimg = objimg.attr("src");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    srcimg = srcimg.replace(orgimg, orgdst);
                    objimg.attr("src", srcimg);
                }
                else if (objbg) {
                    var bgimg = objbg.css("background");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    bgimg = bgimg.replace(orgimg, orgdst);
                    objbg.css("background", bgimg);
                }
            },
            'touchend': function () {

                if (objimg) {
                    var srcimg = objimg.attr("src");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    srcimg = srcimg.replace(orgdst, orgimg);
                    objimg.attr("src", srcimg);
                }
                else if (objbg) {
                    var bgimg = objbg.css("background");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    bgimg = bgimg.replace(orgdst, orgimg);
                    objbg.css("background", bgimg);
                }
            }
        };
    }

    function clickfnIcon(obj, oldStr, newStr) {
        var classValue = '';
        return {
            'touchstart': function () {

                if (obj && obj.attr) {
                    classValue = obj.attr('class');
                    var reg = new RegExp(oldStr, "g");
                    var newClass = classValue.replace(reg, newStr);
                    obj.attr('class', newClass);
                }
            },
            'touchend': function () {
                if (obj && obj.attr) {
                    if (classValue != '') {
                        var reg = new RegExp(newStr, "g");
                        var newClass = classValue.replace(reg, oldStr);   // 防止长按导致的中断
                        obj.attr('class', newClass);
                    }
                }
            }
        };
    }

    function changeClassOfTouch(jqObj, oldLabel, newLabel, isSingle) {
        var oldClass = jqObj.attr('class');
        var reg = new RegExp(oldLabel, 'g');
        var newClass = oldClass.replace(reg, newLabel);
        if (!isSingle && oldClass == newClass) {
            reg = new RegExp(newLabel, 'g');
            newClass = oldClass.replace(reg, oldLabel);
        }
        jqObj.attr('class', newClass);
    }

    function clickfnCss(objcss, css_n, css_p) {
        return {
            'touchstart': function () {
                objcss = objcss || $(this);
                objcss.css(css_n);
            },
            'touchend': function () {
                objcss = objcss || $(this);
                objcss.css(css_p);
            }
        };
    }

    //js小数乘法计算
    function calcMul(arg1, arg2) {
        var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {
        }
        try {
            m += s2.split(".")[1].length
        } catch (e) {
        }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }

    //js小数加法计算
    function calcAdd(num1, num2) {
        var sq1, sq2, m;
        try {
            sq1 = num1.toString().split(".")[1].length;
        } catch (e) {
            sq1 = 0;
        }
        try {
            sq2 = num2.toString().split(".")[1].length;
        } catch (e) {
            sq2 = 0;
        }
        m = Math.pow(10, Math.max(sq1, sq2));
        return (num1 * m + num2 * m) / m;
    }

    function isMobileNumber(phoneNumber, num) {
        var digit = num || 10;
        var check = new RegExp("^(1[0-9]{" + digit + "})$");
        if (!check.test(phoneNumber)) {
            return false;
        }
        return true;
    }


    function setAppTitle(title) {
        try {
            var appTitle = title || "微订货";
            document.title = appTitle;
            if (kdAppSet.isIPhoneSeries()) {
                // hack在微信等webview中无法修改document.title的情况
                var _body = $('body');
                var _iframe = $('<iframe src="img/kdpx.gif"></iframe>').on('load', function () {
                    setTimeout(function () {
                        _iframe.off('load').remove()
                    }, 0)
                }).appendTo(_body);
            }
        } catch (ex) {
        }
    }

    function getToday() {
        var date = new Date();
        var currentdate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate();
        return currentdate;
    }

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

    //将字符串中的数字转换成可点击样式
    function StrNumToPhone(str) {
        if (str) {
            var numArry = str.match(/\d+(\-\d+)?/g);
            var telStr;
            if (numArry) {
                for (i = 0; i < numArry.length; i++) {
                    if (numArry[i].length > 6) {
                        telStr = "<a href= tel:" + numArry[i] + ">" + numArry[i] + "</a>";
                        str = str.replace(numArry[i], telStr)
                    }
                }
            }
        }
        return str;
    }

    //打开客服沟通
    function openChat(item) {
        //改为打开客服联系页面
        var info = kdAppSet.getAppParam();
        var user = kdAppSet.getUserInfo();
        var phoneList = OptMsg.getPhoneList();
        var phoneStr = phoneList.join(',');
        var param = {
            eid: info.eid,
            appflag: 0,
            phone: phoneStr,
            nick: user.contactName,
            img: user.headimgurl,
            openid: info.openid,
            appid: info.appid || '10091',
            'goodsImg': '',
            'goodsName': '',
            'goodsPrice': '',
            'goodsModel': ''
        };
        if (item.name) {
            var imgs = item.img || [];
            $.Object.extend(param, {
                'goodsImg': imgs.length > 0 ? imgs[0] : '',
                'goodsName': item.name,
                'goodsPrice': item.price,
                'goodsModel': item.model
            });
        }
        MiniQuery.Event.trigger(window, 'toview', ['ChatList', param]);
    }

    return {
        Image: Image,
        keyBoard: kdctrl.keyBoard,
        clickfn: function () {
            return clickfn;
        },
        clickfnImg: clickfnImg,
        clickfnIcon: clickfnIcon,
        clickfnCss: clickfnCss,
        changeClassOfTouch: changeClassOfTouch,
        touchstart: touchstart,
        touchend: touchend,
        isMobileNumber: isMobileNumber,
        cache: Cache,
        backView: backView,
        clearBackView: clearBackView,
        trimStr: trimStr,
        getToday: getToday,
        getPureNumber: getPureNumber,
        calcMul: calcMul,
        calcAdd: calcAdd,
        guid: GuidLike,
        ReplaceSChar: ReplaceSChar,
        kdlog: kdlog,
        throttle: throttle,
        setAppTitle: setAppTitle,
        is_weixinbrower: is_weixinbrower,
        is_chromebrower: is_chromebrower,
        StrNumToPhone: StrNumToPhone,
        openChat: openChat
    };

})();

