var AddBuyer = (function () {

    //新增采购员div视图
    var div,
    //微信云之家接口url头部
        urlHeadwx,
    //mob采购员信息存储头部
        urlHead,
    //微信企业号标示
        corpid,
        wxinid,
        managerDeptid,
        list,
        config, hasInit, apiType, lianjie100, guid,
        mode;//0 企业号 1服务号

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-newbuyer');
            var urlinfo=kdAppSet.getUrlInfo();
            urlHeadwx = urlinfo.urlHeadwx;
            lianjie100 = urlinfo.lianjie100;
            urlHead = urlinfo.urlHead;
            apiType = urlinfo.apiType;
            corpid = "";
            wxinid = "";
            managerDeptid = 0;
            mode = 0;
            list = [];
            config = null;
            bindEvents();
            hasInit = true;
        }
    }


    function addNewBuyer() {
        var sourceType = kdAppSet.getAppParam().source;
        if (sourceType == "service") {
            mode = 1;
            addServiceNewBuyer();
        } else {
            mode = 0;
            addCorpNewBuyer();
        }
    }


    //在业务系统中 添加采购员
    function addServiceNewBuyer(showHint) {

        var name = kdShare.trimStr($("#view-newbuyer-name").val());
        var mobile = kdShare.trimStr($("#view-newbuyer-mobile").val());
        if (showHint == undefined) {
            addCtrlHint();
        }

        Lib.API.get('SetBuyer', {para: {
                "mobile": mobile,
                "name": kdAppSet.ReplaceJsonSpecialChar(name),
                "mode": mode,
                "id": guid,
                "opttype": 1}
            },
            function (data, json) {
                removeCtrlHint();
                var Status = data.status;
                var Msg = "";
                if (Status == 0) {
                    //Msg="保存成功";
                    if (mode == 1 && !kdAppSet.isPcBrower()) {
                        //弹出分享指示页面
                        var wxShareMark = $("#wxShareMark");
                        wxShareMark.one("click", function () {
                            $(this).hide();
                            kdShare.backView();
                        });
                        wxShareMark.show();
                        Buyer.wxInviteBuyer(name, mobile);

                    } else if (mode == 0 || kdAppSet.isPcBrower()) {
                        kdShare.backView();
                    }
                    //通知订单列表刷新
                    MiniQuery.Event.trigger(window, 'freshBuyerListInfo', []);
                } else {
                    Msg = data.msg;
                    OptMsg.ShowMsg(Msg);
                }

            }, function (code, msg) {
                removeCtrlHint();
            }, function () {
                removeCtrlHint();
                jAlert(kdAppSet.getAppMsg.workError);
            });

    }


    //在微信企业号以及mob云服务上 添加采购员
    function addCorpNewBuyer() {

        var name = kdShare.trimStr($("#view-newbuyer-name").val());
        var mobile = kdShare.trimStr($("#view-newbuyer-mobile").val());
        var weixin = "";
        var position = "";
        var paradata = config.para;
        var wxinid = paradata.wxinid;

        addCtrlHint();
        var paraObj = {
            name: name,
            department: managerDeptid,
            position: position,
            mobile: mobile,
            weixinid: weixin,
            userid: guid
        };

        if (managerDeptid == 0) {
            getWxUserDeptid(wxinid, true, function () {
                paraObj.department = managerDeptid;
                addWxUser(paraObj, function () {
                    addServiceNewBuyer(0);
                });
            });
        } else {
            addWxUser(paraObj, function () {
                addServiceNewBuyer(0);
            });
        }
    }


    function checkUserInput() {

        var name = kdShare.trimStr($("#view-newbuyer-name").val());
        if (name == "") {
            jAlert("姓名不能为空!");
            return false;
        }
        var mobile = kdShare.trimStr($("#view-newbuyer-mobile").val());
        mobile = kdShare.getPureNumber(mobile);
        $("#view-newbuyer-mobile").val(mobile);

        if (mobile == "") {
            jAlert("手机号不能为空!");
            return false;
        } else {
            var check = /^(1[0-9]{10})$/;
            if (!check.test(mobile)) {
                jAlert("请输入正确手机号!");
                return false;
            }
        }
        return true;
    }

    function initInput() {
        $("#view-newbuyer-name").val("");
        $("#view-newbuyer-mobile").val("");
    }

    function bindEvents() {
        $("#view-newbuyer").delegate('.btnadd span', {
            'click': function () {
                if (!isCommitting()) {
                    if (checkUserInput()) {
                        addNewBuyer();
                    }
                }
                return false;
            },
            'touchstart': function () {
                $(this).addClass('kd_fullRedBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('kd_fullRedBtn_touched');
            }
        });
        textFill($(".new input"));
    }

    function textFill(input) {
        input.focus(function () {
            $(this).parent().css({border: '1px solid #FF753E'});
        });
        input.blur(function () {
            $(this).parent().css({border: '1px solid #d3d5d8'});
        });
    }


    function addCtrlHint() {
        setInputReadOnly(true);
        var hintstr = '<div class="hintflag">' + Lib.LoadingTip.get() + '</div>';
        $(".newbuyer .btnadd").append(hintstr);
        $(".newbuyer .hintflag .loading-text").text("正在提交数据...");
    }

    function removeCtrlHint() {
        setInputReadOnly(false);
        $(".newbuyer .btnadd .hintflag").remove();
    }

    function isCommitting() {
        var inum = $(".newbuyer .btnadd .hintflag").length;
        if (inum > 0) {
            OptMsg.ShowMsg('正在提交数据，请稍后!');
            return true;
        } else {
            return false;
        }
    }

    function setInputReadOnly(bflag) {
        if (bflag) {
            $("#view-newbuyer-name").attr("readonly", "readonly");
            $("#view-newbuyer-mobile").attr("readonly", "readonly");
        } else {
            $("#view-newbuyer-name").removeAttr("readonly");
            $("#view-newbuyer-mobile").removeAttr("readonly");
        }
    }

    function render(pconfig) {
        initView();
        config = pconfig;
        corpid = config.para.corpid;
        wxinid = config.para.wxinid;
        managerDeptid = config.para.managerDeptid;
        if (managerDeptid == 0) {
            getWxUserDeptid(wxinid, false, null);
        }
        show();
        guid = kdShare.guid();
        initInput();
        // 动态加载分享提示图片
        var wxShareMark = $("#wxShareMark");
        wxShareMark.addClass('sprite-share_prompt');
        var minHeight = $(div).height();  // 设置最小高度，确保底部不被顶起
        $(div).css('min-height', minHeight);
    }


    function addWxUser(paraObj, fn) {
        //新增部门成员

        var addUserUrl = urlHeadwx + '/weixin/user/create';
        var email = "";
        if (apiType == 1) {
            addUserUrl = urlHeadwx + 'member/create' + lianjie100;
            email = $.String.random(12) + "kdemail@qq.com";
        }

        var userid = paraObj.userid;
        var name = paraObj.name;
        var department = "[" + paraObj.department + "]";
        var position = paraObj.position;
        var mobile = paraObj.mobile;
        var weixinid = paraObj.weixinid;
        var gender = "0";
        var tel = "";

        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '","name":"' + name + '","department":' + department
            + ',"position":"' + position + '","mobile":"' + mobile + '","gender":"' + gender + '","tel":"' + tel
            + '","email":"' + email + '","weixinid":"' + weixinid + '"' + '}';

        $.ajax({
            type: "POST",
            async: true,
            url: addUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                removeCtrlHint();
                if (jsonObj.errcode != 0) {

                    if (jsonObj.errcode == 60104) {
                        jAlert("手机号已被使用!");
                    } else if (jsonObj.errcode == 60108) {
                        jAlert("微信号已被使用!");
                    } else {
                        var errmsg = jsonObj.errmsg;
                        if (apiType == 1) {
                            errmsg = jsonObj.description;
                        }
                        jAlert(errmsg);
                    }

                } else {
                    fn & fn();
                }
            },
            error: function (errMsg) {
                removeCtrlHint();
                jAlert(JSON.stringify(errMsg));
            }
        });

    }


    function getWxUserDeptid(userid, bhint, fn) {

        var addUserUrl = urlHeadwx + '/weixin/user/get';
        if (apiType == 1) {
            addUserUrl = urlHeadwx + 'member/get' + lianjie100;
        }

        var userid = config.para.wxinid;
        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '"' + '}';

        $.ajax({
            type: "POST",
            async: true,
            url: addUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                if (jsonObj.errcode == 0) {
                    var deptid = 0;
                    if (apiType == 1) {
                        deptid = jsonObj.data.groupid[0] || 0;
                    } else {
                        deptid = jsonObj.department["0"];
                    }
                    managerDeptid = deptid;
                    if (bhint) {
                        fn & fn();
                    }
                } else {
                    var errMsg = jsonObj.errmsg;
                    removeCtrlHint();
                    if (bhint) {
                        fn & fn();
                        jAlert("获取采购员主管部门信息出错" + errMsg);
                    }
                }
            },
            error: function () {
                removeCtrlHint();
                if (bhint) {
                    jAlert("调用采购员主管部门信息出错");
                }
            }
        });
    }

    function show() {
        $(div).show();
        var sourceType = kdAppSet.getAppParam().source;
        if (sourceType == "service") {
            var phoneUrl = "&sharePhoneNum=-1";
            kdAppSet.wxShareInfo({link: phoneUrl});
        }
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
            $("#wxShareMark").click();
        }
    };


})();