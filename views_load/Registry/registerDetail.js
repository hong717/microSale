/*提交商机 主页页面*/

var registerDetail = (function () {
    var div, scroller, hasInit, gender,shopurl;
    var constStr = {
        name: '您的称呼',
        mobile: '您的手机',
        company: '您的公司'
    };

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_registerDetail');
            scroller = Lib.Scroller.create(div);
            shopurl=kdAppSet.getUserInfo().shopurl;
            if(shopurl==''){
                $('#viewid_registerDetail .retailCust').hide();
                $('#registerDetail_submit').css('width','100%');
            }
            bindEvents();
            gender = 1;
            hasInit = true;
        }
        initPrompt();
    }

    function initPrompt() {
        selectGender(false);
        $('#registerDetail_Name').html(constStr.name);
        $('#registerDetail_Mobile').html(constStr.mobile);
        $('#registerDetail_Company').html(constStr.company);
    }

    function selectGender(isLady) {

        var female = $('#registerDetail_Gender').find('.female');
        var man = $('#registerDetail_Gender').find('.man');

        if (isLady) {
            female.addClass('sprite-check_green');
            female.addClass('gender_touched');
            man.removeClass('sprite-check_green');
            man.removeClass('gender_touched');
            gender = 0;
        } else {
            female.removeClass('sprite-check_green');
            female.removeClass('gender_touched');
            man.addClass('sprite-check_green');
            man.addClass('gender_touched');
            gender = 1;
        }
    }

    function isPrompt(htmlStr, prompt) {

        return !!(kdShare.trimStr(htmlStr) == prompt || kdShare.trimStr(htmlStr) == '');

    }

    function inputFocus(obj, prompt) {
        if (isPrompt($(obj).val(), prompt)) {
            $(obj).val('');
        }
        $(obj).addClass('input_touched');
        $(obj).parent().addClass('input_li_touched');
    }

    function inputBlur(obj, prompt) {
        if (isPrompt($(obj).val(), prompt)) {
            $(obj).val(prompt);
            $(obj).removeClass('input_touched');
        }
        $(obj).parent().removeClass('input_li_touched');
    }

    function submitCheck() {
        var name = kdShare.trimStr($('#registerDetail_Name').val());
        if (name == constStr.name || name == '') {
            jAlert("请输入姓名!");
            return false;
        }

        var mobile = kdShare.trimStr($('#registerDetail_Mobile').val());
        mobile = kdShare.getPureNumber(mobile);

        if (mobile == constStr.mobile || mobile == '') {
            jAlert("请输入手机号码!");
            return false;
        }
        if (!kdShare.isMobileNumber(mobile)) {
            jAlert("请输入正确的手机号码!");
            return false;
        }
        return true;
    }

    function getRegisterData() {
        var data = {};
        data.Name = kdAppSet.ReplaceJsonSpecialChar(kdShare.trimStr($('#registerDetail_Name').val()));
        data.Phone = kdAppSet.ReplaceJsonSpecialChar(kdShare.trimStr($('#registerDetail_Mobile').val()));
        var company = kdShare.trimStr($('#registerDetail_Company').val());
        if (company == constStr.company || company == '') {
            data.ComName = '';
        } else {
            data.ComName = kdAppSet.ReplaceJsonSpecialChar(company);
        }
        data.Sex = gender;
        var appParam=kdAppSet.getAppParam();
        if(appParam.crmOpenid){
            data.Source=2;
        }
        data.openid=appParam.crmOpenid || '';
        return data;
    }

    function sendRegisterData(custdata) {
        Lib.API.post('SubmitIntention', {
            para: custdata
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
            afterSubmitSccess();
            //意向客户ID
            custdata.custid=data.ID || '';
            OptMsg.SendBusinessMsgToManager(custdata);
        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            jAlert(msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            jAlert('网络错误，请稍候再试');
        });
    }

    function afterSubmitSccess() {
        $('#registerDetail_Img').attr('class', 'sprite-success_face');
        $('.afterRegisterDiv').show();

        var retBtn=$('.view_registerDetail .afterRegisterDiv .returnBtn');
        var userinfo=kdAppSet.getUserInfo();
        if(!userinfo.cmpInfo.allowRetail  && userinfo.identity=='retail'){
            //不允许零售用户访问
            retBtn.hide();
        }else{
            retBtn.show();
        }
		autoback();
    }
	
	function autoback() {
        var s = document.getElementById("autoback");
        s.innerHTML = 3;
        var autoback = window.setInterval(function () {
            if (s.innerHTML <= 1) {
				clearInterval(autoback);
				MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
            }
            s.innerHTML = s.innerHTML * 1 - 1;
        }, 1000);
    }

    function initComponyInfo() {
        var cmpInfo = kdAppSet.getUserInfo().cmpInfo;
        $('#registerDetail_logo').attr('src', cmpInfo.img);
        $('#registerDetail_CName').html(cmpInfo.name);
        $(div).find('.footer .phone').html(cmpInfo.phone);
        $(div).find('#welcomeMsg').html(cmpInfo.welcome);
        $(div).find('.footer .address').html(cmpInfo.address);
        $(div).find('.footer a').attr('href', 'tel:' + cmpInfo.phone);
    }

    function bindEvents() {
        $('#viewid_registerDetail').delegate('#registerDetail_Name', {
            'focus': function () {
                inputFocus(this, constStr.name);
            },
            'blur': function () {
                inputBlur(this, constStr.name);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Mobile', {
            'focus': function () {
                inputFocus(this, constStr.mobile);
            },
            'blur': function () {
                inputBlur(this, constStr.mobile);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Company', {
            'focus': function () {
                inputFocus(this, constStr.company);
            },
            'blur': function () {
                inputBlur(this, constStr.company);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Gender .female', {
            'click': function () {
                selectGender(true);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Gender .man', {
            'click': function () {
                selectGender(false);
            }
        });

        //提交注册
        $('#viewid_registerDetail').delegate('#registerDetail_submit', {
            'click': function () {
                if (!submitCheck()) {
                    return false;
                }
                kdAppSet.setKdLoading(true, '正在注册...');
                var data = getRegisterData();
                sendRegisterData(data);
            },
            'touchstart': function () {
                $(this).addClass('submit_touched');
            },
            'touchend': function () {
                $(this).removeClass('submit_touched');
            }
        });

        //去商城
        $('#viewid_registerDetail').delegate('.retailCust', {
            'click': function () {
                if(shopurl!=''){
                    window.location.href=shopurl;
                }
            },
            'touchstart': function () {
                $(this).addClass('retailCust_touched');
            },
            'touchend': function () {
                $(this).removeClass('retailCust_touched');
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_ReturnBtn', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {}]);
            },
            'touchstart': function () {
                $(this).addClass('submit_touched');
            },
            'touchend': function () {
                $(this).removeClass('submit_touched');
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Curtain', {
            'touchstart': function (event) {
                event.stopPropagation();
                return false;
            }
        });
        $('#viewid_registerDetail').delegate('.footer .phone', {
            'touchstart': function () {
                $(this).addClass('a_touched');
            },
            'touchend': function () {
                $(this).removeClass('a_touched');
            }
        })
    }

    function render(config) {
        initView();
        show();
        if (config.mobile) {
            $("#registerDetail_Mobile").val(config.mobile);
            $("#registerDetail_Mobile").addClass('input_touched');
        }

        var name = kdAppSet.getUserInfo().contactName;
        if(name){
            $('#registerDetail_Name').val(name);
            $('#registerDetail_Name').addClass('input_touched');
        }
        initComponyInfo();
        scroller.refresh();
    }

    function show() {
        $(div).show();
        OptAppMenu.showKdAppMenu(false);
    }

    function hide() {
        $('.afterRegisterDiv').hide();
        $(div).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();