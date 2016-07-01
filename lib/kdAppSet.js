var kdAppSet = (function () {

    var noimg_mode_default = "img/no_img_mode.png";
    var noimg_mode_cacheKey = "noimg_mode_cacheKey";
    var rmb = "￥";

    //是否显示价格
    var isShowPrice = true;
    //是否显示库存
    var isShowStock = true;
    var stockStrategy = [];

    //透明遮罩，阻碍事件传播，处理点透
    var divMask = $("#divMask");
    //微信链接参数
    var appParam = {};
    //用户信息
    var userInfo = {};

    //针对特别手机端处理
    var phoneNumber = 0;
    //进度加载圈
    var kdloading = $("#kdloading");

    //云之家与连接100接口
    var urlInfo = {
        apiType: 1,    //微信通讯录 api接口 0 云之家， 1 连接100
        urlHeadwx: "http://cloud.kingdee.com/openapi/lianjie100/",//连接100接口
        lianjie100: "?client_id=200147&client_secret=38a903ddcb0e2715987b64033dc68df6",//连接100接口
        urlHead: 'http://mob.cmcloud.cn/webapptest'//mob接口
    };


    //统一系统提示信息
    var AppMsg = {
        workError: "网络错误，请稍候再试",
        getVerifyCode: "获取验证码...",
        checkVerifyCode: "验证注册信息...",
        netWorkError: 'phoneNetWorkError'
    };


    var logImgUrl = "";
    //用户身份信息 是否是主管
    // identity:   manager  buyer  unknow

    var emptyMsg = '<div class="emptySearch" style="height:{height}px"><img src="img/empty.png"/><span>没有符合条件的数据</span></div>';

    var isPCBrower = getPcBrowerType();
    var isIphoneSeries = checkIphoneSeries();

    //获取封装后的控件
    var AppCtrl = kdctrl;

    function getAppParamObj(key) {
        if (window.localStorage) {
            var storage = window.localStorage;
            var keyv = storage.getItem(key);
            if (keyv == null) {
                return {};
            } else {
                var keyv = keyv.replace('\r', '').replace('\n', '');
                return eval('(' + keyv + ')');
            }
        }
        return {};
    }

    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            var qstr = r[2];
            if (qstr == "null") {
                qstr = "";
            }
            return qstr
        }
        return "";
    }


    //设置手机端的特别标志
    function setPhoneNumFlag() {
        var flagStr = "huaweig750-t00";
        if (hasSomeSpecial(flagStr)) {
            phoneNumber = 1;
        }
    }

    //判断某些手机型号 是否要特别处理
    function hasSomeSpecial(specialFlag) {
        var ua = navigator.userAgent.toLowerCase();
        return (ua.indexOf(specialFlag) > 0);
    }

    //获取图片显示模式  有图 无图
    function getImgMode() {
        var noimg_modeV = kdShare.cache.getCacheDataObj(noimg_mode_cacheKey);
        return (noimg_modeV == "" || noimg_modeV == 1);
    }

    //获取购物车缓存标示
    function getGoodslistFlag() {
        return 'goodslist2' + appParam.eid + userInfo.database;
    }

    //获取编辑订单缓存标示
    function getOrderlistFlag() {
        return 'orderlist2' + appParam.eid + userInfo.database;
    }


    //获取手机浏览器信息
    function getPhoneInfo() {
        var phoneInfo = [];
        phoneInfo.push(JSON.stringify(window.navigator.userAgent));
    }

    //显示遮罩框
    function showMark(showObj, bvisiable) {
        if (phoneNumber > 0) {
            //针对不支持透明度的手机浏览器 特别处理
            var kbm = $("#keyboardMarkImg");
            bvisiable ? kbm.show() : kbm.hide();
        } else {
            bvisiable ? showObj.show() : showObj.hide();
        }
    }


    //阻止点击事件传播
    function stopEventPropagation() {
        divMask.show();
        setTimeout(function () {
            divMask.hide();
        }, 500);
    }


    // 金额千分位格式化
    function formatMoney(money, digit) {
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

    // 金额千分位格式化
    function formatMoneyStr(money, digit) {
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
        return formatMoney(moneystr, digit);
    }

    //清除小数点后的 0
    function clearZero(num) {
        var numStr = '' + num;
        if (numStr.indexOf('.') >= 0) {
            var arr = numStr.split('.');
            if (Number(arr[1]) == 0) {
                return Number(arr[0]);
            }
        }
        return num;
    }

    //获取 价格显示字符串
    function getPriceStr(item) {
        var price = item.price;
        var maxprice = item.maxprice;
        var priceStr = "";
        if (maxprice > 0 && maxprice > price) {
            priceStr = rmb + formatMoneyStr(price) + " ~" + rmb + formatMoneyStr(maxprice);
        } else {
            priceStr = rmb + formatMoneyStr(price);
        }

        return priceStr;
    }

    //根据仓库策略显示 库存信息
    function getStockStr(stockNum, unitName) {
        var stockstatus = 0;
        var stockStr = stockNum;
        if (unitName) {
            stockStr = stockNum + " " + unitName;
        }

        if (!isShowStock) {
            var num = Number(stockNum);
            var inum = stockStrategy.length;
            for (var i = 0; i < inum; i++) {
                var item = stockStrategy[i];
                var min = item.min;
                var max = 1000000000;
                if (item.max != undefined) {
                    max = item.max;
                }
                if (num >= min && num <= max) {
                    stockStr = item.stockmsg;
                    break;
                }
            }

            var color = "#FF6427";
            if (stockStr == "缺货") {
                color = "red";
                stockstatus = -1;
            } else if (stockStr == "num") {
                color = "#FF6427";
                stockstatus = 0;
            } else if (stockStr == "有货") {
                color = "#34a82c";
                stockstatus = 1;
            }
        }

        if (stockStr == "num") {
            stockStr = stockNum;
            if (unitName) {
                stockStr = stockNum + " " + unitName;
            }
        }

        return {
            stockStr: stockStr,
            color: "color:" + color,
            stockstatus: stockstatus
        };
    }

    //初始化 webapp 应用信息
    function initApp() {
        getAppParamFromWx();
        setPhoneNumFlag();
        $("#divMask").bind("click", function () {
            $(this).hide();
        });
        useFastClick();
        var url = window.location.href.split('?')[0] || "";
        logImgUrl = url.replace("start.html", "img/share_logo.png");
    }

    //使用fast click 库
    function useFastClick() {
        var viewlist = ["keyboard", "goodsitemlist", "view-addgoods", "view-itemdetail",
            "viewid_goodslist", "view_Me", "orderlistview", "orderlisthead", "orderSearch",
            "view_orderdetail", "viewid_home"];
        var inum = viewlist.length;
        for (var i = 0; i < inum; i++) {
            try {
                var viewid = document.getElementById(viewlist[i]);
                FastClick.attach(viewid);
            } catch (e) {
            }

        }
    }


    //获取由微信链接传过来的参数信息
    function getAppParamFromWx() {

        var eid = GetQueryString("eid") || 0;
        var keyv = "wdhlogininfo" + eid;
        //还要加上时效性判断
        appParam = getAppParamObj(keyv);
        var isdebug = appParam.isdebug || GetQueryString("isdebug") || "";
        var openidv = GetQueryString("openid");
        if (!appParam.openid) {
            var openid = "";
            if (isdebug && openidv != "") {
                openid = openidv;
            }
            appParam = { openid: openid, eid: eid };
        } else {
            if (isdebug && openidv != "") {
                appParam.openid = openidv;
            }
        }

        appParam.isdebug = isdebug;
        appParam.source = "service";

        //单品分享
        //appParam.shareGoodsId = GetQueryString("shareGoodsId") || "";
        //邀请采购员加入
        //appParam.sharePhoneNum = GetQueryString("sharePhoneNum") || "";
        //var phonemsg = GetQueryString("sharePhoneMsg") || "";
        //appParam.sharePhoneMsg = decodeURI(phonemsg);

        //1 要创建付款单
        appParam.createPayBill = GetQueryString("createPayBill") || "";
        //跳转页面到哪里
        appParam.toviewflag = GetQueryString("toviewflag") || "";

        //订单导购测试
        //appParam.guideBillId =1488 || "";

        var wxinfo = "wdhlogininfo" + appParam.openid;
        var appParam2 = getAppParamObj(wxinfo);
        if (appParam2.headimgurl != '') {
            appParam.headimgurl = appParam2.headimgurl;
        }

    }

    //获取提示信息
    function getLoadingHint(msg) {
        var loadingHint = '<div class="hintflag">' + Lib.LoadingTip.get(msg) + '</div>';
        return loadingHint;
    }

    //移除提示信息
    function removeLoadingHint(ctrlObj) {
        ctrlObj.innerHTML = "";
    }

    //提示信息
    function showMsg(content, itime) {
        document.getElementById('kdnoticecontent').innerHTML = content;
        $('#kdnotice').show();
        var stime = itime || 1000;
        setTimeout(function () {
            $('#kdnotice').hide();
        }, stime);
    }

    //用户退出账号
    function logout() {
        $.Object.extend(userInfo, {
            usertype: -1,
            userid: 0,
            //contactName: "",
            identity: "retail",
            //companyName: "",
            senderMobile: "",
            senderName: "",
            custName: "",
            receiverOids: "",
            receiveAddress: "",
            empName: "",
            receiverPhone: "",
            vipPoints: "",
            viplevelname: "",
            vipAmount: ""
        });
    }


    function setAppParam(para) {
        $.Object.extend(appParam, para);
    }

    //自动添加采购员时，更新用户信息
    function updateUserInfo(user) {
        $.Object.extend(userInfo, user);
    }

    //根据接口 设置用户信息
    function setUserInfo(user) {
        //usertype  -1  什么权限都没有  0 能看能下单, 1 只能查看商品 userid=0 没获取到用户id
        userInfo = $.extend(user, {
            custName: user.senderName,
            identity: user.identify,
            allowpayway: sortPayType(user.allowpayway)
        });

        if (userInfo.cmpInfo.img == "") {
            userInfo.cmpInfo.img = logImgUrl;
        }
        //是否显示价格
        isShowPrice = (user.showprice != 1);
        //是否显示库存
        isShowStock = (user.showstock != 1);
    }

    function sortPayType(pay) {
        var list = [];
        var sortList = ['wx', 'alipay', 'zjt', 'prepay','vipcard', 'offline'];
        for (var i in sortList) {
            if (pay.indexOf(sortList[i]) >= 0) {
                list.push(sortList[i]);
            }
        }
        return list;
    }

    //设置用户的 云之家openid
    function setUserCloudOpenid(openid) {
        userInfo.cloudOpenid = openid || "";
    }


    //初始化app控件信息
    function initAppCtrl() {
        AppCtrl.initDate($(".kdcDate"));
        AppCtrl.dateClick(".kdcDateParent");
        AppCtrl.imageClick(".kdcImage");
        AppCtrl.inputHint(".kdcHint");
    }

    //是否PC浏览器  true 表示pc端 false表示手机端
    function getPcBrowerType() {
        var userAgentInfo = navigator.userAgent.toLowerCase();
        var Agents = ["android", "iphone", "ipad", "ipod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    //是否iphone系列产品
    function checkIphoneSeries() {
        var userAgentInfo = navigator.userAgent.toLowerCase();
        var Agents = ["iphone", "ipad", "ipod"];
        var flag = false;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    //是否支持微信通聊天
    function isEnableChat() {
        return false;
    }

    //设置滚动加载信息
    function setKdLoading(bview, msg) {
        if (bview) {
            if (msg == undefined) {
                msg = "正在努力加载...";
            }
            kdloading.find(".loading-text")[0].innerHTML = msg;
            kdloading.show();
        } else {
            kdloading.hide();
        }
    }

    //保存pc端返回的库存显示策略
    function setStockStrategy(stocklist) {
        if (stocklist == undefined) {
            stockStrategy = [
                { "stockmsg": "缺货", "min": 0, "max": 0 },
                { "stockmsg": "num", "min": 1, "max": 20 },
                { "stockmsg": "有货", "min": 21 }
            ];
        } else {
            stockStrategy = stocklist;
        }
    }

    //获取列表为空信息
    function getEmptyMsg(height) {
        if (height == undefined) {
            height = 1012;
        }
        return $.String.format(emptyMsg, { height: height });
    }


    //获取图片的缩略图
    function getImgThumbnail(imgSrc, isOriginal) {
        if (imgSrc.indexOf("http") < 0) {
            return imgSrc;
        }
        if (isOriginal) {
            return imgSrc.replace("&needthumb=1", "");
        } else {
            imgSrc = imgSrc.replace("&needthumb=1", "");
            return imgSrc + "&needthumb=1";
        }
    }

    //获取经销商商品链接
    function getShareLink() {
        var link = userInfo.wdhurl;
        //分享者信息
        if (userInfo.optid) {
            var shareStr = '{"shareManagerId":"' + userInfo.optid + '"}';
            link = link + '&extData=' + encodeURIComponent(encodeURIComponent(shareStr));
        }
        link = link.replace("start.html", "index.html");
        return link;
    }

    function wxShare(share) {

        var title = share.title;
        var desc = share.desc;
        var link = share.link;
        var imgUrl = share.imgUrl || logImgUrl;
        var qqlink = share.qqlink;
        var fnCallBack = share.fnCallBack;

        function sharemsg() {
            $("#wxShareMark").click();
        }

        //分享给朋友
        wx.onMenuShareAppMessage({
            title: title,
            desc: desc,
            link: link,
            imgUrl: imgUrl,
            complete: function () {
                sharemsg();
                fnCallBack && fnCallBack();
            },
            trigger: function () {
            },
            success: function () {
            },
            cancel: function () {
            },
            fail: function () {
            }
        });

        //分享到朋友圈
        wx.onMenuShareTimeline({
            title: title,
            link: link,
            imgUrl: imgUrl,
            complete: function () {
                sharemsg();
                fnCallBack && fnCallBack();
            }
        });
        //分享到QQ
        wx.onMenuShareQQ({
            title: title,
            desc: desc,
            link: qqlink,
            imgUrl: imgUrl,
            complete: function () {
                sharemsg();
                fnCallBack && fnCallBack();
            }
        });
    }

    //设置微信分享信息
    function wxShareInfo(shareinfo) {
        try {
            var shareUrl = window.location.href.split('?')[0] || "kdurl_error";
            shareUrl = shareUrl + "?eid=" + appParam.eid;
            //分享者信息
            if (userInfo.optid) {
                shareUrl = shareUrl + '&shareManagerId=' + userInfo.optid;
                shareUrl = shareUrl + '&oid=kd1' + appParam.openid;
            }
            if (shareinfo.link) {
                shareinfo.link = shareUrl + shareinfo.link;
            }
            var cmpName = "金蝶KIS";
            var imglog = logImgUrl;
            if (userInfo.cmpInfo) {
                cmpName = userInfo.cmpInfo.name;
                if (userInfo.cmpInfo.img) {
                    imglog = userInfo.cmpInfo.img;
                }
            }
            var shareDesc = '\n移动营销协作平台';
            var title = shareinfo.title || cmpName + "微商城";
            var desc = shareinfo.desc || shareDesc;
            var link = shareinfo.link || shareUrl;
            var imgUrl = shareinfo.imgUrl || imglog;
            if (imgUrl.indexOf("http:") < 0) {
                imgUrl = logImgUrl;
            }
            var qqlink = link;
            link = link.replace("start.html", "index.html");

            wxShare({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                qqlink: qqlink
            });
        } catch (ex) {
        }
    }

    //微信扫描条码
    function wxScanQRCode() {
        wx.scanQRCode({
            needResult: 1,
            scanType: ["qrCode", "barCode"],
            success: function (res) {
                var urlOrg = res.resultStr;
                var posi = urlOrg.indexOf('shareGoodsId=');
                if (posi >= 0) {
                    var url = '?' + urlOrg.substr(posi);
                    getGoodsById(url);
                } else {
                    OptMsg.ShowMsg('没有找到商品信息', '', 3000);
                }
            }
        });
    }

    function getGoodsById(url) {
        var shareGoodsId = $.Url.getQueryString(url, 'shareGoodsId') || '';
        if (shareGoodsId) {
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: { itemid: shareGoodsId } }]);
        } else {
            OptMsg.ShowMsg('没有找到商品信息', '', 3000);
        }


    }

    //微信获取网络状态
    function wxGetNetWork(fnOk, fnErr) {
        if (isPCBrower) {
            fnOk && fnOk();
        } else {
            wx.getNetworkType({
                success: function (res) {
                    // 返回网络类型2g，3g，4g，wifi
                    fnOk && fnOk(res.networkType);
                },
                fail: function () {
                    fnErr && fnErr();
                }
            });
        }
    }

    //加载js文件
    function loadScriptFile(url) {
        document.write("<scri" + "pt src=" + url + "></sc" + "ript>");
    }

    //处理引起Json异常的字符串
    var ReplaceJsonSpecialChar = function (input) {
        input = input.replace(/\\/g, "\\\\");
        input = input.replace(/"/g, "\\\"");
        return input;
    };


    //错误页面展示
    function showErrorView(msg, fnCallBack, fnParam) {
        MiniQuery.Event.trigger(window, 'toview', ['ViewError', { fn: fnCallBack, fnParam: fnParam, errMsg: msg }]);
    }

    //设置标题
    function setAppTitle(title) {
        try {
            var apptitle = userInfo.cmpInfo.name;
            title = title || apptitle || "微商城";
            document.title = title;
            if (isIphoneSeries) {
                // hack在微信等webview中无法修改document.title的情况
                var _body = $('body');
                var _iframe = $('<iframe src="img/kdpx.gif" style="display: none;"></iframe>').on('load', function () {
                    setTimeout(function () {
                        _iframe.off('load').remove()
                    }, 0)
                }).appendTo(_body);
            }
        } catch (ex) {
        }
    }

    function delayLoad(name, fn, itime) {
        setTimeout(function () {
            MiniQuery.Event.trigger(window, 'loadview', [
                {
                    name: name,
                    nohint: true,
                    isview: true,
                    fnSuccess: function () {
                        fn && fn();
                    }
                }
            ]);
        }, itime);
    }

    function h5Analysis(key) {
        H5Analysis.btnClick(key);
    }

    initApp();

    return {
        stopEventPropagation: stopEventPropagation,
        showMark: showMark,
        getPhoneNumber: phoneNumber,
        getAppParam: function () {
            return appParam;
        },
        getUserInfo: function () {
            return userInfo;
        },
        getUrlInfo: function () {
            return urlInfo;
        },
        setAppParam: setAppParam,
        setUserInfo: setUserInfo,
        updateUserInfo: updateUserInfo,
        setUserCloudOpenid: setUserCloudOpenid,
        logout: logout,
        getPhoneInfo: getPhoneInfo,
        getImgMode: getImgMode,
        getGoodslistFlag: getGoodslistFlag,
        getOrderlistFlag: getOrderlistFlag,
        getEmptyMsg: getEmptyMsg,
        getRmbStr: rmb,
        getPriceStr: getPriceStr,
        formatMoneyStr: formatMoneyStr,
        clearZero: clearZero,
        getStockStr: getStockStr,
        getIsShowPrice: function () {
            return isShowPrice;
        },
        getAppMsg: function () {
            return AppMsg;
        },
        GetQueryString: GetQueryString,
        getNoimgModeDefault: function () {
            return noimg_mode_default;
        },
        getNoimgModeCacheKey: function () {
            return noimg_mode_cacheKey;
        },
        getLoadingHint: getLoadingHint,
        removeLoadingHint: removeLoadingHint,
        setKdLoading: setKdLoading,
        setStockStrategy: setStockStrategy,
        showMsg: showMsg,
        isEnableChat: isEnableChat,
        initAppCtrl: initAppCtrl,
        isPcBrower: function () {
            return isPCBrower;
        },
        isIPhoneSeries: function () {
            return isIphoneSeries;
        },
        ReplaceJsonSpecialChar: ReplaceJsonSpecialChar,
        getImgThumbnail: getImgThumbnail,
        loadScriptFile: loadScriptFile,
        showErrorView: showErrorView,
        wxScanQRCode: wxScanQRCode,
        wxGetNetWork: wxGetNetWork,
        setAppTitle: setAppTitle,
        delayLoad: delayLoad,
        h5Analysis: h5Analysis,
        wxShare: wxShare,
        wxShareInfo: wxShareInfo,
        getShareLink: getShareLink
    }
})();
