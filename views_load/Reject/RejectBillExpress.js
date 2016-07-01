/* 退货单物流填写页面*/


var RejectBillExpress = (function () {
    var div, scroller, divContent, hasInit, viewpage, currentData,
        currentWLCompany;  // 当前物流公司信息

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectBillExpress');
            FastClick.attach(div);
            viewpage = $(div);
            divContent = document.getElementById('rejectBillExpressContent');
            currentData = {};
            // 物流公司名与对应编码
            currentWLCompany = { name: '请选择物流公司', id: '' };
            bindEvents();
            initScroll(divContent);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 0.2,
            fnfresh: function (reset) {
                reset();
            },
            fnmore: function (reset) {
                reset();
            },
            hintbottom: 1

        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 初始化物流页面
    function initExpressPage() {
        viewpage.find('.billNo').html(currentData.billno);
        viewpage.find('.rejectDate').html(currentData.date);

        viewpage.find('.expressCompany').html('请选择物流公司');
        viewpage.find('.selectDiv').removeClass('textFocus');
        currentWLCompany.id = '';

        var expressNo = viewpage.find('.expressNo');
        expressNo.val(expressNo.attr('hint'));
        expressNo.removeClass('textFocus');

        var textBox = viewpage.find('.remindMsg');
        textBox.val(textBox.attr('hint'));
        textBox.removeClass('textFocus');
    }

    // 获取物流公司名
    function getWLCompanyList() {
        // 跳转到物流公司列表，返回选择物流公司信息
        MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {
            para: {},
            api: 'GetWLCompany',
            selobj: currentWLCompany,
            callBack: function (data) {
                // 处理选中的物流公司信息
                currentWLCompany.name = data.name;
                currentWLCompany.id = data.id;
                viewpage.find('.expressCompany').html(data.name);
                viewpage.find('.selectDiv').addClass('textFocus');
            }
        }]);
    }

    // 获取物流信息参数集
    function getWLBillInfo() {
        var para = {};
        para.wlCompany = currentWLCompany.id; //公司名内码
        para.wlCName = currentWLCompany.name; //公司名内码
        para.wlNumber = kdAppSet.ReplaceJsonSpecialChar(viewpage.find('.expressNo').val());
        para.InterID = currentData.interid;

        return para;
    }

    // 提交物流信息
    function sendWLInfo() {
        var para = getWLBillInfo();
        Lib.API.get('SetWLForSEOutStock', {
            para: para
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(data.msg, "", 1100);

            //通知退货单列表刷新
            MiniQuery.Event.trigger(window, 'FreshRejectBill', []);
            setTimeout(function () {
                kdShare.backView();
            }, 1200);
            OptMsg.RejectBillExpress(currentData.billno, para.wlCName, para.wlNumber);

        }, function (code, msg, json) {

            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(msg, "", 1100);
        }, function () {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('网络错误，请稍候再试', "", 1100);
        });
    }

    // 检查数据合法性
    function submitCheck() {

/*
        if (currentWLCompany.id == '') {
            OptMsg.ShowMsg('请选择物流公司', "", 1100);
            return false;
        }
*/

        var expressNo = viewpage.find('.expressNo');
        var valueStr = kdShare.trimStr(expressNo.val());
        if (expressNo.attr('hint') == valueStr || valueStr == '') {
            OptMsg.ShowMsg('请输入物流单号', "", 1100);
            return false;
        }

        return true;
    }

    // 事件绑定
    function bindEvents() {
        viewpage.delegate('.selectDiv', {
            'click': function () {
                getWLCompanyList();
            },
            'touchstart': function () {
                $(this).addClass('border_touched');
            },
            'touchend': function () {
                $(this).removeClass('border_touched');
            }
        });
        viewpage.delegate('.expressNo', {
            'focus': function () {
                $(this).addClass('textFocus');
                $(this).parents('.expressNoDiv').addClass('border_touched');
            },
            'blur': function () {
                var hint = $(this).attr('hint');
                var valStr = kdShare.trimStr($(this).val());
                if (valStr == '' || valStr == hint) {
                    $(this).removeClass('textFocus');
                }
                $(this).parents('.expressNoDiv').removeClass('border_touched');
            }
        });
        viewpage.delegate('.remindMsg', {
            'focus': function () {
                $(this).addClass('textFocus');
                $(this).addClass('border_touched');
            },
            'blur': function () {
                var hint = $(this).attr('hint');
                var valStr = kdShare.trimStr($(this).val());
                if (valStr == '' || valStr == hint) {
                    $(this).removeClass('textFocus');
                }
                $(this).removeClass('border_touched');
            }
        });
        viewpage.delegate('.submitBtn', {
            'click': function () {
                if (!submitCheck()) {
                    return;
                }
                jConfirm("您确认提交填写的物流信息?", null, function (flag) {
                    if (flag) {
                        kdAppSet.setKdLoading(true, '正在提交...');
                        sendWLInfo();
                    }
                }, {ok: "是", no: "否"});

            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick')
            }
        });
        viewpage.delegate('.cancelBtn', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick')
            }

        });
    }

    function render(config) {
        initView();
        // 保存当前退款订单信息
        currentData = config ? config.data : {};
        // 重置页面
        initExpressPage();
        show();
        // 设置最小高度，确保底部不被顶起
        var minHeight = viewpage.find('.content').height();
        viewpage.find('.content').css('min-height', minHeight);
        scroller.refresh();
    }


    function show() {
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
        kdAppSet.setKdLoading(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();