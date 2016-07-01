;
var Buyer = (function () {
    //采购员列表div视图
    var div,
        divlist, ul , sample, scroller,
        ullist,
    //微信云之家接口url头部
        urlHeadwx,
    //mob采购员信息存储头部
        urlHead,
        corpid,
    //微信企业号账号ID
        wxinid,
    //连接100调用id
        lianjie100,
        managerDeptid,
        list, hasInit,
    //标示 是服务号（service），还是企业号
        sourceType, typeName, apiType;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-buyer');
            divlist = document.getElementById('div-buyer-List');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            corpid = kdAppSet.getAppParam().corpid;
            wxinid = kdAppSet.getAppParam().openid;
            managerDeptid = 0;
            list = [];
            urlHeadwx = kdAppSet.getUrlInfo().urlHeadwx;
            lianjie100 = kdAppSet.getUrlInfo().lianjie100;
            urlHead = kdAppSet.getUrlInfo().urlHead;
            apiType = kdAppSet.getUrlInfo().apiType;
            typeName = "企业号";
            sourceType = kdAppSet.getAppParam().source;
            if (sourceType == "service") {
                typeName = "服务号";
            }
            initScroll();
            bindEvents();
            hasInit = true;
        }
    }

    function initScroll(){
        scroller = Lib.Scroller.create(divlist);
        var option = {
            hinttop: 1.2,
            fnfresh: function (reset) {
                getBuyerList();
                reset();
            },
            hintbottom: -0.4
        };
        kdctrl.initkdScroll(scroller, option);
    }

    //获取采购员列表
    function getBuyerList() {
        loadingHint();
        getServiceBuyerList();
    }

    function getServiceBuyerList() {

        Lib.API.get('GetBuyerList', {para: {}},
            function (data, json) {
                list = data;
                $(".buyernum #buyernum").text(data.length);
                fill(data);
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }


    function fill(datalist) {

        var listStr = $.Array.keep(datalist, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                phone: item.mobile,
                verify: item.verifyFlag == 0 ? "邀请加入" : "已激活",
                classname: item.verifyFlag == 0 ? "invitebuyer" : "invitedbuyer",
                style: sourceType == "service" ? "" : "display:none",
                index: index
            });
        }).join('');

        removeHint();

        if (datalist.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        scroller.refresh();
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }



    function bindEvents() {

        //刷新采购员列表
        MiniQuery.Event.bind(window, {
            'freshBuyerListInfo': function () {
                getBuyerList();
            }
        });

        $(ul).delegate('li[index]', {
            'click': function (event) {
                if (event.target.className == "invitebuyer") {
                    return;
                }
                var index = $(this).attr("index");
                var objclick = list[index];
                var eid = kdAppSet.getAppParam().eid;
                var objPara = {corpid: corpid, wxinid: wxinid, eid: eid, managerDeptid: managerDeptid};
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['EditBuyer', {para: objPara, objclick: objclick}]);
            },
            'touchstart': function (event) {
                if (event.target.className == "invitebuyer") {
                    return;
                }
                $(this).addClass('onclick');
            },
            'touchend': function (event) {
                if (event.target.className == "invitebuyer") {
                    return;
                }
                $(this).removeClass('onclick');
            }
        });

        $(".addbuyer").bind("click", function () {
            var eid = kdAppSet.getAppParam().eid;
            var objPara = {corpid: corpid, wxinid: wxinid, eid: eid, managerDeptid: managerDeptid};
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['AddBuyer', {para: objPara}]);
        }).on(kdShare.clickfn());


        $("#div-buyer-List").delegate('.invitebuyer', {
            'click': function (event) {
                var index = $(this).parent().parent().attr("index");
                var mobile = list[index].mobile;
                var name = list[index].name;
                if (mobile == "") {
                    mobile = -1;
                }
                wxInviteBuyer(name, mobile);
                showWxShare();
                return true;
            },
            'touchstart': function () {
                $(this).addClass('invitebuyer_touched');
            },
            'touchend': function () {
                $(this).removeClass('invitebuyer_touched');
            }
        });
    }

    function wxInviteBuyer(name, mobile) {
        var desc = "(待验证)手机号码: " + mobile;
        var inviteMsg = kdAppSet.getUserInfo().contactName + "邀请" + name;
        var phoneUrl = "&sharePhoneNum=" + mobile + "&sharePhoneMsg=" + encodeURI(inviteMsg);
        var title = inviteMsg + "加入" + kdAppSet.getUserInfo().cmpInfo.name + "微订货平台";

        kdAppSet.wxShareInfo({
            title: title,
            desc: desc,
            link: phoneUrl,
            imgUrl: ""
        });
    }

    function showWxShare() {
        var wxShareMark = $("#wxShareMark");
        wxShareMark.addClass('sprite-share_prompt');
        wxShareMark.one("click", function () {
            $(this).hide();
        });
        wxShareMark.show();
    }

    function render() {
        initView();
        show();
        getBuyerList();
    }


    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');
    }


    function show(back) {
        $(div).show();
        if (back != undefined) {
            getBuyerList();
        }
    }

    return {
        render: render,
        show: show,
        hide: function (back) {
            $(div).hide();
            kdAppSet.wxShareInfo({});
            $("#wxShareMark").click();
        },
        wxInviteBuyer: wxInviteBuyer
    };


})();