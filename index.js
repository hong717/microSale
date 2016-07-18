;
(function () {

    /*    (function () {
            if (!kdAppSet.getAppParam().isdebug) {
                var url = document.referrer;
                if (url.indexOf('/index.html') < 0) {
                    var link = window.location.href;
                    link = link.replace("start.html", "index.html");
                    window.location.replace(link);
                }
            }
        })();*/

    //开始
    (function () {

        if (kdAppSet.isPcBrower()) {
            $('html').addClass('isPC_Html');
        } else {
            $('html').removeClass('isPC_Html');
        }
        var nav;

        function initCategory(categoryType) {
            nav = new Lib.Navigation({
                'Home': Home,
                'GoodsList': GoodsList,
                'GoodsListSort': GoodsListSort,
                'GoodsSearch': GoodsSearch,
                'GoodsDetail': GoodsDetail,
                'Me': Me,
                'Register': Register,
                'CacheList': CacheList,
                'CacheOrderList': CacheOrderList,
                'PayList': PayList,
                'PayCode': PayCode,
                'PayDetail': PayDetail,
                'Orderlist': Orderlist,
                'OrderDetail': OrderDetail,
                'GoodsCategory': categoryType == 0 ? GoodsCategory : GoodsList //该模式下类目和商品列表整合，类目直接跳商品列表
            });

            function loadview(caller) {
                var name = caller.name;
                if (caller.nohint) {
                } else {
                    kdAppSet.setKdLoading(true, "正在加载...");
                }
                KDLoad.LoadView({
                    //下面2个参数 给debug代码时 使用
                    nav: nav,
                    app: kdAppSet,
                    name: name,
                    fnSuccess: function () {
                        if (caller.nohint) {
                        } else {
                            kdAppSet.setKdLoading(false);
                        }
                        if (caller.isview) {
                            nav.push(name, window[name]);
                        }
                        caller.fnSuccess && caller.fnSuccess();
                    }
                });
            }

            MiniQuery.Event.bind(window, {
                'toview': function (name) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var noBack = (args && args.length > 0) ? !!args[0].noBack : false;
                    //先判断视图是否存在 不存在则先load进来
                    if (nav.views[name]) {
                        nav.to(name, true, args);
                        if (!noBack) {
                            OptHash.pushHash(name, args);
                        }
                    } else {
                        loadview({
                            name: name,
                            fnSuccess: function () {
                                nav.push(name, window[name]);
                                nav.to(name, true, args);
                                if (!noBack) {
                                    OptHash.pushHash(name, args);
                                }
                            }
                        });
                    }
                },
                'loadview': loadview,
                'backview': function () {
                    nav.back(true);
                },
                //回退页面 并且不刷新
                'backviewkeep': function () {
                    OptHash.popHash();
                    nav.back(false);
                },
                //删除回退页面个数
                'clearbackview': function (step) {
                    nav.clear(step);
                }
            });

        }


        var custCssEidList = ['2467638', '2193738', '4391056','4547956'];
        //var custJsEidList = ['4391056'];

        function loadCustFile(eid) {

            if (custCssEidList.indexOf(eid) >= 0) {
                KDLoad.loadCssCust({ eid: eid });
            }

        }

        function getUserInfo() {

            var AppParam = kdAppSet.getAppParam();
            var appid = AppParam.appid;
            var eid = AppParam.eid;
            //微信签名
            wxSign.wx_init({ appid: appid, eid: eid });
            showAppHint();
            getUserInfoApi();

            function getUserInfoApi() {
                kdAppSet.setKdLoading(true);
                var para = {
                    para: {
                        ownerGUID: AppParam.shareManagerId || '',
                        NickName: AppParam.nickname || '',
                        headimgurl: AppParam.headimgurl || ''
                    }
                };

                Lib.API.get('GetUserInfos', para,
                    function (data, json) {
                        kdAppSet.setKdLoading(false);
                        checkVersion(data.apiversion);
                        dealUserInfo(data);

                        var categoryType = kdAppSet.getUserInfo().cmpInfo.categoryType;
                        initCategory(categoryType);
                        //设置web app title
                        var userinfo = kdAppSet.getUserInfo();
                        kdAppSet.setAppTitle('');
                        //设置默认分享页面
                        kdAppSet.wxShareInfo({});
                        //初始化控件
                        kdAppSet.initAppCtrl();

                        if (!userinfo.cmpInfo.allowRetailLogin && !userinfo.senderMobile) {
                            //不允许零售客户访问
                            MiniQuery.Event.trigger(window, 'toview', ['Register', {}]);
                        }
                        else {
                            initAppView();
                        }
                        //加载客户个性化文件
                        loadCustFile(eid);
                        PayCode.setAppid();

                    }, function (code, msg, json) {
                        kdAppSet.setKdLoading(false);
                        initCategory(0);
                        kdAppSet.showErrorView(msg, getUserInfoApi, '');
                    }, function (errCode) {
                        kdAppSet.setKdLoading(false);
                        initCategory(0);
                        kdAppSet.showErrorView(errCode, getUserInfoApi, '');
                    });
            }

            /*
             * 检查版本
             * */
            function checkVersion(version) {
                var url = window.location.href;
                var reg = /microSaleV(\d+)/;
                var vers = url.match(reg);
                if (vers) {
                    if (kdAppSet.getAppParam().isdebug || vers[1] == 10 || version == vers[1]) {
                        return true;
                    }
                    window.location.href = url.replace(vers[0], 'microSaleV' + version);
                }
            }

            //显示界面信息
            function initAppView() {
                showApp();
                //初始化菜单
                OptAppMenu.initAppMenu();
                //通知购物车刷新数量
                MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
            }

            //处理用户以及系统设置信息
            function dealUserInfo(data) {
                var otherPara = data.otherPara || {};
                var address = data.address || {};
                var fidentify = data.fidentify || "";

                var user = {
                    userid: data.userid,
                    usertype: data.usertype,
                    apiversion: data.apiversion,
                    headimgurl: data.headimgurl,
                    database: data.database,
                    contactName: data.fcontact || kdAppSet.getAppParam().nickname || '',
                    senderMobile: data.fmobilephone,
                    senderName: data.fname,
                    companyName: data.fcompanyname,
                    receiverOids: data.fopenids,
                    receiveAddress: data.faddress,
                    empName: data.fempname,
                    receiverPhone: data.fempmobilephone,
                    msgOption: data.msgoption,
                    serviceOption: data.serviceoption,
                    serviceList: MiniQuery.Object.clone(data.serviceList) || [],
                    showprice: data.showprice,
                    showstock: data.showstock,
                    identify: fidentify.toLowerCase(),
                    optid: data.foptid,
                    shopurl: data.shopurl || '',
                    corpid: data.corpid || "kingdee",
                    ueversion: data.ueversion,
                    storeid: data.storeid,
                    vipid: data.vipID,
                    vipAmount: data.vipAmount,
                    vipcardAmount: data.vipcardAmount,
                    vipPoints: data.vipPoints,
                    viplevelname: data.viplevelname,
                    wdhurl: data.wdhurl,
                    wxservicenumber: data.wxservicenumber, //微信服务号
                    wxservicenumberurl: data.wxservicenumberurl,//微信服务号关注二维码图片地址
                    allowoutinstore: data.allowoutinstore || 0,//是否允许门店自提
                    invitecode: data.invitecode,//邀请码
                    caninvited: data.caninvited,//是否允许被邀请（0：不允许；1：允许）
                    sharesum: data.sharesum,//我的好友数量
                    shareordersum: data.shareordersum,//已下单的好友数量
                    //支付方式
                    allowpayway: MiniQuery.Object.clone(data.allowpayway) || [],
                    //线下支付方式
                    offlinesubpay: MiniQuery.Object.clone(data.offlinesubpay) || [],
                    fetchstylelist: MiniQuery.Object.clone(data.fetchstylelist) || [],
                    taglist: MiniQuery.Object.clone(data.taglist) || [],
                    //商品列表快速录入
                    quickInput:1,
                    //订单发货方式
                    sendList: MiniQuery.Object.clone(data.sendList) || [],
                    sendPara: MiniQuery.Object.clone(data.sendpara),
                    cmpInfo: {
                        name: otherPara.signshortname,
                        phone: otherPara.signtel,
                        address: otherPara.signaddress,
                        welcome: otherPara.signwelcome,
                        img: otherPara.signlogo,
                        homeImgStyle: otherPara.homepageimagestyle || 3,
                        //是否显示销售数量
                        showSaleNum: (otherPara.showsalevolumn == 1) || false,
                        //是否显示发票
                        allowChooseInvoice: (otherPara.allowchooseinvoice == 1) || false,
                        //允许零售用户访问
                        allowRetailLogin: (otherPara.allowretaillogon == 1) || false,
                        //允许零售用户下单
                        allowRetailSubmit: (otherPara.allowretailsubmit == 1) || false,
                        //是否允许积分
                        allowRetailPoint: (otherPara.allowvantageforretail == 1) || false,
                        //是否允许使用微信卡券
                        allowWxCard: (otherPara.allowwxcardcoupons == 1) || false,
                        categoryType: otherPara.goodsonlinetypestyle,
                        outinstoretakedelaydate: parseInt(otherPara.outinstoretakedelaydate) || 0,
                        allowshareprice: parseInt(otherPara.allowshareprice) || 0
                    },
                    addressInfo: {
                        receiverid: address.receiverid || "",
                        receiveraddress: address.receiveraddress,
                        address: address.address,
                        receivername: address.receivername,
                        provincenumber: address.provincenumber || "",
                        citynumber: address.citynumber || "",
                        districtnumber: address.districtnumber || "",
                        mobile: address.mobile
                    }
                };

                debugfn(user);

                if (user.identify == 'retail' && user.senderMobile == '') {
                    user.usertype = -1;
                }

                kdAppSet.setUserInfo(user);
                var stockStrategy = data.StockStrategy;
                kdAppSet.setStockStrategy(stockStrategy);
                kdAppSet.delayLoad('StoreList', function () {
                    StoreList.getOnlyOneStore(getOneStore);
                }, 1000);

            }

            function debugfn(user){
                //用来调试使用
 /*               var host = window.location.host || '';
                var isdebug = host.indexOf('localhost') >= 0 || host.indexOf('172.20') >= 0 || host.indexOf('127.0') >= 0 || (host == '');
                if(isdebug){
                    user.identify='manager';
                    user.senderMobile='138';
                    user.contactName='test';
                    user.usertype=0;
                }*/
            }
        }

        function getOneStore(store) {
            kdAppSet.updateUserInfo({
                oneStore: store
            });
        }

        function showApp() {
            //分享页面过来
            if (isShareView()) {
                showShareView();
            } else {
                var firstview = kdAppSet.getAppParam().firstview;
                showAppView(firstview, false);
            }
            OptLog.writePageLog(OptLog.getLogType().index);
        }


        //提示是否开启无图模式
        function showAppHint() {
            var imgKey = kdAppSet.getNoimgModeCacheKey();
            var state = kdShare.cache.getCacheDataObj(imgKey);
            if (state === '0') {
                OptMsg.ShowMsg("您已开启无图模式,商品图片不会下载", "", 3000);
            }
        }

        //显示对应页面
        function showAppView(view, ishide) {
            function tohome(config) {
                MiniQuery.Event.trigger(window, 'toview', ['Home', config]);
            }

            switch (view) {
                case "person":
                    nav.to('Me', true);
                    OptHash.pushHash('Me');
                    break;

                case "goods":
                    nav.to('GoodsCategory', true);
                    OptHash.pushHash('GoodsCategory');
                    break;

                case "Register":
                    nav.to('Register', true);
                    OptHash.pushHash('Register');
                    break;

                case "cachelist":
                    nav.to('CacheList', true);
                    OptHash.pushHash('CacheList');
                    break;

                case "newlist":
                    //直接跳转到 新品页面
                    tohome({
                        isHide: true, fn: function () {
                            //由于新品标题是在首页动态加载的，所以需要等首页接口完成后才能显示
                            var tiltleName = $('#home_newlist .title')[0].innerHTML;
                            MiniQuery.Event.trigger(window, 'toview', ['GoodsList', { tabindex: 1, title: tiltleName, fromPage: 0, hideCategory: true }]);
                        }
                    });
                    break;

                case "cxlist":
                    //直接跳转到 促销页面
                    tohome({
                        isHide: true, fn: function () {
                            var tiltleName = $('#home_cxlist .title')[0].innerHTML;
                            MiniQuery.Event.trigger(window, 'toview', ['GoodsList', { tabindex: 2, title: tiltleName, fromPage: 0, hideCategory: true }]);
                        }
                    });
                    break;

                case "hotlist":
                    //直接跳转到 推荐页面
                    tohome({
                        isHide: true, fn: function () {
                            var tiltleName = $('#home_hotlist .title')[0].innerHTML;
                            MiniQuery.Event.trigger(window, 'toview', ['HotList', { title: tiltleName, fromPage: 0 }]);
                        }
                    });
                    break;

                case "pointlist":
                    //直接跳转到 商品列表的积分商品页面
                    tohome({ isHide: true });
                    setTimeout(function () {
                        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', { ItemType: 999999999 }]);
                    }, 200);
                    break;

                case "goodslist":
                    //直接跳转到 商品列表的某个类目
                    tohome({ isHide: true });
                    var app = kdAppSet.getAppParam();
                    setTimeout(function () {
                        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {
                            ItemType: app.ItemType,
                            MiddleType: app.MiddleType,
                            ChildType: app.ChildType
                        }]);
                    }, 200);
                    break;

                default:
                    if (view) {
                        MiniQuery.Event.trigger(window, 'toview', [view, {}]);
                    } else {
                        if (!dealHashView()) {
                            tohome({});
                        }
                    }
                    break;
            }

        }


        //处理hash 值跳转
        function dealHashView() {
            //不允许首次显示的视图
            var vlist = ['CacheOrderList', 'PayList', 'ViewError'];
            var hash = kdAppSet.getAppParam().hash || '';
            hash = hash.substring(1);
            var config = {};
            if (hash != '') {
                var args = hash.split('/');
                if (args.length > 0) {
                    var view = args[0];
                    if (vlist.indexOf(view) < 0) {
                        var param = args.length > 1 ? args[1] : '';
                        param = decodeURIComponent(param);
                        if (param != '') {
                            try {
                                config = JSON.parse(param);
                            } catch (e) {
                            }
                        }
                        //先进入首页，再进入hash页面
                        MiniQuery.Event.trigger(window, 'toview', ['Home', {
                            isHide: true,
                            fn: function () {
                                MiniQuery.Event.trigger(window, 'toview', [view, config[0]]);
                            }
                        }]);
                        return true;
                    }
                }
            }
            return false;
        }

        //是否需要进入分享页面
        function isShareView() {
            //导购订单分享
            var app = kdAppSet.getAppParam();
            var guideBillId = app.guideBillId;
            if (guideBillId) {
                return true;
            }
            //微信支付后 跳转到指定页面
            var toviewflag = app.toviewflag;
            if (toviewflag) {
                return true;
            }
            //商品详情分享
            var shareGoodsId = app.shareGoodsId;
            //采购员邀请
            var sharePhoneNum = app.sharePhoneNum;
            if (shareGoodsId) {
                return true;
            } else if (sharePhoneNum) {
                if (kdAppSet.getUserInfo().usertype != 0) {
                    return true;
                }
            }
            return false;
        }

        //检测是否已验证过身份
        function checkLogin(config) {
            var userinfo = kdAppSet.getUserInfo();
            if (userinfo.usertype != 0 || userinfo.senderMobile == '') {
                MiniQuery.Event.trigger(window, 'toview', ['Register', { toview: config }]);
                return false;
            }
            return true;
        }

        //微信分享跳转页面
        function showShareView() {
            var app = kdAppSet.getAppParam();
            //导购订单分享
            var guideBillId = app.guideBillId;

            //微信支付后 跳转到指定页面
            var toviewflag = app.toviewflag;
            if (toviewflag) {
                var arrList = toviewflag.split('|');
                var key = '';
                var value = '';
                if (arrList.length >= 1) {
                    key = arrList[0];
                }
                if (arrList.length >= 2) {
                    value = arrList[1];
                }
                if (key == 'OrderDetail') {
                    guideBillId = value;
                }
            }

            if (guideBillId) {
                if (checkLogin({ view: 'OrderDetail', id: guideBillId })) {

                    if (kdAppSet.isIPhoneSeries()) {
                        //处理微信支付后,点击回退再次回到支付页面
                        MiniQuery.Event.trigger(window, 'toview', ['Home', { isHide: true }]);
                        setTimeout(function () {
                            MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                                billId: guideBillId
                            }]);
                        }, 250);
                    } else {
                        MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                            billId: guideBillId
                        }]);
                    }

                }
                return;
            }

            //单品分享
            var shareGoodsId = app.shareGoodsId;
            //邀请采购员加入
            var sharePhoneNum = app.sharePhoneNum;
            if (shareGoodsId) {
                MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', {
                    shareGoodsId: shareGoodsId
                }]);
            } else if (sharePhoneNum) {
                if (kdAppSet.getUserInfo().usertype != 0) {
                    //没有身份信息才跳转到登录验证页面
                    MiniQuery.Event.trigger(window, 'toview', ['Register', {
                        sharePhoneNum: sharePhoneNum
                    }]);
                }
            }
        }

        if (!kdAppSet.isPcBrower() && !kdAppSet.getAppParam().isdebug) {
            if (!kdShare.is_weixinbrower()) {
                jConfirm("请在微信中使用微商城,否则只能简单浏览", null, function (flag) {
                    if (flag) {
                        //获取用户以及设置信息
                        getUserInfo();
                    } else {
                        kdAppSet.setKdLoading(false);
                    }
                }, { ok: "继续浏览", no: "退出" });
            } else {
                //获取用户以及设置信息
                getUserInfo();
            }
        } else {
            if (!kdShare.is_chromebrower() && !kdAppSet.getAppParam().isdebug) {
                jAlert("请在谷歌浏览器中使用微商城轻应用!", "", function () {
                    var chromeUrl = 'http://rj.baidu.com/soft/detail/14744.html';
                    window.location.href = chromeUrl;
                });
                kdAppSet.setKdLoading(false);
                return;
            } else {
                //获取用户以及设置信息
                getUserInfo();
            }
        }

    })();
})();
