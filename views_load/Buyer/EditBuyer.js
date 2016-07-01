var EditBuyer = (function () {

    //编辑采购员div视图
    var div,
    //微信云之家接口url头部
        urlHeadwx,
    //mob采购员信息存储头部
        urlHead,
    //微信企业号标示
        corpid,
        wxinid,
        managerDeptid,
        config, hasInit,
        sourceType, apiType, lianjie100,
    //0 企业号 1服务号;
        mode;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-editbuyer');
            urlHeadwx = kdAppSet.getUrlInfo().urlHeadwx;
            lianjie100 = kdAppSet.getUrlInfo().lianjie100;
            urlHead = kdAppSet.getUrlInfo().urlHead;
            apiType = kdAppSet.getUrlInfo().apiType;
            sourceType = kdAppSet.getAppParam().source;
            corpid = "";
            wxinid = "";
            managerDeptid = 0;
            config = null;
            mode = 0;
            bindEvents();
            hasInit = true;
        }
    }


    function updateCorpBuyer() {

        var name = kdShare.trimStr($(".editbuyer .new #name").val());
        var mobile = kdShare.trimStr($(".editbuyer .new #mobile").val());
        var weixin = "";
        var position = "";

        var paradata = config.para;
        var wxinid = paradata.wxinid;
        var guid = config.objclick.ID;

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
                updateWxUser(paraObj, function () {
                    updateServiceBuyer(0);
                });
            });
        } else {
            updateWxUser(paraObj, function () {
                updateServiceBuyer(0);
            });
        }
    }

    function updateServiceBuyer(showHint) {

        var name = kdShare.trimStr($(".editbuyer .new #name").val());
        var mobile = kdShare.trimStr($(".editbuyer .new #mobile").val());
        var id = config.objclick.ID;
        if (showHint == undefined) {
            addCtrlHint();
        }

        Lib.API.get('SetBuyer', {
                para: {
                    "mobile": mobile,
                    "name": kdAppSet.ReplaceJsonSpecialChar(name),
                    "mode": mode,
                    "id": id,
                    "opttype": 2}
            },
            function (data, json) {
                removeCtrlHint();
                var Status = data.status;
                if (Status == 0) {
                    MiniQuery.Event.trigger(window, 'backview');
                } else {
                    var Msg = data.msg;
                    OptMsg.ShowMsg(Msg);
                }
            }, function (code, msg) {
                removeCtrlHint();
                jAlert(msg, 1000);
            }, function () {
                removeCtrlHint();
                jAlert(kdAppSet.getAppMsg.workError);
            });
    }


    function updateBuyer() {

        if (sourceType == "service") {
            mode = 1;
            updateServiceBuyer();
        } else {
            mode = 0;
            updateCorpBuyer();
        }
    }


    //删除微信服务号添加的采购员
    function deleteServiceBuyer(showhint) {

        var id = config.objclick.ID;
        if (showhint == undefined) {
            addCtrlHint();
        }

        Lib.API.get('SetBuyer', {
                para: {
                    "id": id,
                    "opttype": 0}
            },
            function (data, json) {
                removeCtrlHint();
                var Status = data.status;
                if (Status == 0) {
                    MiniQuery.Event.trigger(window, 'backview');
                } else {
                    var Msg = data.msg;
                    OptMsg.ShowMsg(Msg);
                }
            }, function () {
                removeCtrlHint();
            }, function () {
                removeCtrlHint();
            });
    }

    //删除微信企业号添加的采购员
    function deleteCorpBuyer() {
        var account = config.objclick.ID;
        deleteWxUser(account, function () {
            deleteServiceBuyer(0);
        });
    }

    function deleteBuyer() {
        if (sourceType == "service") {
            deleteServiceBuyer();
        } else {
            deleteCorpBuyer();
        }
    }


    function deleteWxUser(account, fn) {
        //新增部门成员
        var deleteUserUrl = urlHeadwx + '/weixin/user/delete';
        if (apiType == 1) {
            deleteUserUrl = urlHeadwx + 'member/del' + lianjie100;
        }
        var userid = config.objclick.ID;
        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '"}';
        $.ajax({
            type: "POST",
            async: true,
            url: deleteUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                removeCtrlHint();
                if (jsonObj.errcode != 0) {
                    jAlert(jsonObj.errmsg);
                } else {
                    fn & fn();
                }
            },
            error: function (errMsg) {
                removeCtrlHint();
                alert(JSON.stringify(errMsg));
            }
        });

    }

    function checkUserInput() {

        var name = kdShare.trimStr($(".editbuyer .new #name").val());
        if (name == "") {
            jAlert("姓名不能为空!");
            return false;
        }
        var mobile = kdShare.trimStr($(".editbuyer .new #mobile").val());

        mobile = kdShare.getPureNumber(mobile);
        $(".editbuyer .new #mobile").val(mobile);

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

        var objclick = config.objclick;
        $(".editbuyer .new #name").val(objclick.name);
        $(".editbuyer .new #mobile").val(objclick.mobile);
    }


    function addCtrlHint() {
        setInputReadOnly(true);
        var hintstr = '<div class="hintflag">' + Lib.LoadingTip.get() + '</div>';
        $(".editbuyer .ctrlpan").append(hintstr);
        $(".editbuyer .hintflag .loading-text").text("正在提交数据...");
    }

    function removeCtrlHint() {
        setInputReadOnly(false);
        $(".editbuyer .ctrlpan .hintflag").remove();
    }

    function isCommitting() {
        var inum = $(".editbuyer .ctrlpan .hintflag").length;
        if (inum > 0) {
            OptMsg.ShowMsg('正在提交数据，请稍后!');
            return true;
        } else {
            return false;
        }
    }

    function setInputReadOnly(bflag) {
        if (bflag) {
            $(".editbuyer .new #name").attr("readonly", "readonly");
            $(".editbuyer .new #mobile").attr("readonly", "readonly");
        } else {
            $(".editbuyer .new #name").removeAttr("readonly");
            $(".editbuyer .new #mobile").removeAttr("readonly");
        }
    }


    function bindEvents() {


        $(".editbuyer .btndelete ").bind("click", function () {

            if (!isCommitting()) {
                deleteBuyerInfo();
            }

        }).on(kdShare.clickfnCss(null, {color: '#DF1515'}, {color: '#FF3F3F'}));

        $(".editbuyer .btnok ").bind("click", function () {

            if (!isCommitting()) {
                updateBuyerInfo();
            }
        }).on(kdShare.clickfnCss(null, {background: '#EF5215'}, {background: '#FF6427'}));

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

    function updateBuyerInfo() {

        if (checkUserInput()) {
            updateBuyer();
        }

    }

    function deleteBuyerInfo() {

        jConfirm("你确定要删除当前采购员?", null, function (flag) {
            if (flag) {
                deleteBuyer();
            }
        }, {ok: "确定", no: "取消"});
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
        initInput();

        if (sourceType == "service") {
            var mobile = config.objclick.mobile;
            var name = config.objclick.name;
            Buyer.wxInviteBuyer(name, mobile);
        }
    }


    function updateWxUser(paraObj, fn) {
        //更新部门成员
        var updateUserUrl = urlHeadwx + '/weixin/user/update';
        var email = "";
        if (apiType == 1) {
            updateUserUrl = urlHeadwx + 'member/update' + lianjie100;
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
            url: updateUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                if (jsonObj.errcode != 0) {

                    removeCtrlHint();

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
                alert(JSON.stringify(errMsg));
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
            error: function (errMsg) {
                removeCtrlHint();
                if (bhint) {
                    jAlert("调用采购员主管部门信息出错");
                }
            }
        });
    }


    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();