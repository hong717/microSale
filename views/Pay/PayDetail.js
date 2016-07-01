/* 付款单编辑与详情页面*/

var PayDetail = (function () {
    var viewPage, scroller, hasInit, sample, payOrder, payBillId,
        bankItemSample = '', accountItem = '',
        payNo = '',
        payType = '';
    var constStr = {
        'textarea': '请输入需告知供应商的信息',
        'moneyMsg': '请输入金额',
        'bankName': ['工商银行', '建设银行', '农业银行', '中国银行', '交通银行', '招商银行']
    };

    var srcList = [], isEditBill, maxImgNum,
        uploadImageNum, serverIds, banksName,
        bankList;
    var srcMeidaKey = [];
    var footer;

    // 初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('.view_payDetail');
            scroller = Lib.Scroller.create(viewPage.find('.content')[0]);
            var bankUl = viewPage.find('.pay_selectDiv .bankList')[0];
            bankItemSample = $.String.between(bankUl.innerHTML, '<!--', '-->');
            var accountList = viewPage.find('.pay_selectDiv .accountList')[0];
            accountItem = $.String.between(accountList.innerHTML, '<!--', '-->');
            sample = $.String.between(viewPage.find('.imgListDiv').html(), '<!--', '-->');
            isEditBill = false;
            maxImgNum = 3;
            uploadImageNum = 0;
            payOrder = '';
            serverIds = [];
            bankList = [];
            bindEvents();
            footer = $('.view_payDetail .footer');
            hasInit = true;
        }
    }


    // 获取要提交的付款信息
    function getPayBillInfo() {
        var payMsg = kdShare.trimStr(viewPage.find('.pay_Msg').val());
        var srcListNew = [];
        var inum = srcList.length;
        for (var i = 0; i < inum; i++) {
            srcListNew.push({ "imgSrc": srcList[i].serverId });
        }

        var pmsg = payMsg != constStr.textarea ? payMsg : '';
        var pTargetBank = kdShare.trimStr(viewPage.find('#bankName').val());
        var pTargetBankNo = kdShare.trimStr(viewPage.find('.account').val());
        return  payinfo = {
            payWay: 0,
            payNo: payNo || '',
            paySubOffline: payType,
            payMoney: Number(viewPage.find('#pay_Money').val()),
            payDate: viewPage.find('.kdcDate').val(),
            payMsg: kdAppSet.ReplaceJsonSpecialChar(pmsg),
            payOrder: payOrder,
            payTargetBank: kdAppSet.ReplaceJsonSpecialChar(pTargetBank),
            payTargetBankNo: kdAppSet.ReplaceJsonSpecialChar(pTargetBankNo),
            payImgList: srcListNew
        };
    }

    //提交付款单据信息
    function submitPaybill() {
        var para = getPayBillInfo();
        if (!para.payMoney) {
            OptMsg.ShowMsg('请输入正确的金额');
            return;
        }
        saveBankName();
        kdAppSet.setKdLoading(true, "正在提交单据...");
        Lib.API.get('setPayOrderInfo', {
                para: para
            },
            function (data) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(data.Msg);
                if (data.status == '0') {
                    //刷新待付款列表
                    MiniQuery.Event.trigger(window, 'freshPaymentListInfo', []);
                    //刷新订单详情的支付按钮
                    var payno = data.payNo || '';
                    MiniQuery.Event.trigger(window, 'freshOrderPayNo', [
                        {payno: payno, billid: payBillId}
                    ]);
                    //通知支付页面回退
                    MiniQuery.Event.trigger(window, 'PayListBackView', [
                        {billid: payBillId}
                    ]);
                    OptMsg.PayBillMsg({
                        money: para.payMoney,
                        orderno: payOrder,
                        billno: payno
                    });
                    setTimeout(function () {
                        kdShare.backView();
                    }, 500);
                }
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('提交单据出错!');
            });
    }

    // 保存银行信息到手机
    function saveBankName() {
        var bankName = viewPage.find('.pay_selectDiv input').val();
        var bankAccount = viewPage.find('.pay_selectDiv .account').val();
        bankName = kdShare.trimStr(bankName);
        bankAccount = kdShare.trimStr(bankAccount);
        if (!bankName || !bankAccount) {
            return;
        }
        var accountsTmp = [];
        var bexist = false;
        var inum = bankList.length;
        for (var i = 0; i < inum; i++) {
            if (bankList[i].name == bankName) {
                var accounts = bankList[i].accounts;
                for (var j = 0; j < accounts.length; j++) {
                    if (accounts[j] == bankAccount) {
                        bexist = true;
                        break;
                    }
                }
                accountsTmp = bankList[i].accounts;
                break;
            }
        }
        if (!bexist) {
            if (accountsTmp.length > 0) {
                accountsTmp.push(bankAccount);
            } else {
                accountsTmp.push(bankAccount);
                bankList.push({
                    name: bankName,
                    accounts: accountsTmp
                });
            }
        }
        kdShare.cache.setCacheData(JSON.stringify(bankList), kdAppSet.getGoodslistFlag() + 'paybanks');
        initBankList();
    }


    // 获取手机上保留的银行帐号信息
    function initBankList() {
        var bankListStr = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag() + 'paybanks');
        if (bankListStr != "") {
            bankList = JSON.parse(bankListStr);
        }
        banksName = [];
        var inum = bankList.length;
        for (var i = 0; i < inum; i++) {
            var name = bankList[i].name;
            if (banksName.indexOf(name) < 0) {
                banksName.push(name);
            }
        }
        if (banksName.length == 0) {
            banksName = constStr.bankName;
        } else {
            var inum = banksName.length;
            var bankNames = constStr.bankName;
            for (var j = 0; j < bankNames.length; j++) {
                var bexist = false;
                for (var k = 0; k < inum; k++) {
                    if (bankNames[j] == banksName[k]) {
                        bexist = true;
                    }
                }
                if (!bexist) {
                    banksName.push(bankNames[j]);
                }
            }
        }
        var bankUl = viewPage.find('.pay_selectDiv .bankList');
        var listStr = $.Array.keep(banksName,
            function (item, index) {
                return $.String.format(bankItemSample, {
                    item: item,
                    index: index
                });
            }
        ).join(' ');
        bankUl.html(listStr);
    }


    function bindEvents() {

        //提交付款单据
        viewPage.delegate('.submit', {
            'click': function () {
                if (uploadImageNum > 0) {
                    OptMsg.ShowMsg("正在上传图片,请稍后...", '', 1500);
                    return;
                }
                var payMoney = kdShare.trimStr(viewPage.find('#pay_Money').val());
                if (payMoney == '' || payMoney == constStr.moneyMsg) {
                    OptMsg.ShowMsg(constStr.moneyMsg);
                    return;
                }
                jConfirm("您确定要提交付款信息?", null, function (flag) {
                    if (flag) {
                        submitPaybill();
                    }
                }, {ok: "确定", no: "取消"});
            },
            'touchstart': function () {
                $(this).css({background: '#ef5215'});
            },
            'touchend': function () {
                $(this).css({background: '#FF6427'});
            }
        });


        //关联订单
        viewPage.delegate('.pay_Order', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['Orderlist',
                    {
                        tabindex: 0,
                        KeyWord: this.innerText,
                        afterRefresh: true
                    }
                ]);
            },
            'touchstart': function () {
                $(this).addClass('order_Touching');
            },
            'touchend': function () {
                $(this).removeClass('order_Touching');
            }
        });


        //更多录入
        viewPage.delegate('.moreBtn span', {
            'click': function () {
                showMoreInfo(true);
            }
        });

        //关闭更多
        viewPage.delegate('.moreDiv .closeBtn', {
            'click': function () {
                viewPage.find('.moreDiv').addClass('hideModule');
                viewPage.find('.moreBtn').removeClass('hideModule');
                scroller.refresh();
            }
        });

        viewPage.find('.moreDiv .closeBtn').on(kdShare.clickfnIcon(viewPage.find('.moreDiv .closeBtn'), 'closeMore', 'closeMore_s'));

        viewPage.delegate('.pay_selectDiv .showUl', {
            'click': function () {
                if (!isEditBill) {
                    return;
                }
                $(this).parent().find('ul').toggleClass('hideModule');
                if (this == viewPage.find('.bank .pay_selectDiv .showUl')[0]) {
                    viewPage.find('.bank_Account .accountList').addClass('hideModule');
                }
                viewPage.find('.moreDiv .closeBtn').addClass('hideModule');
                return false;
            },
            'touchstart': function () {
                $(this).addClass('order_Touching');
            },
            'touchend': function () {
                $(this).removeClass('order_Touching');
            }
        });

        viewPage.delegate('.pay_selectDiv li', {
            'click': function (event) {
                $(this).parents('.pay_selectDiv').find('input').val($(this).html());
                $(this).parent().addClass('hideModule');
                if ($(this).attr('class') == 'bankItem') {
                    viewPage.find('.pay_selectDiv #bankName').change();
                }
                event.stopPropagation();
                return false;
            },
            'touchstart': function () {
                $(this).addClass('order_Touching');
            },
            'touchend': function () {
                $(this).removeClass('order_Touching');
            }
        });

        viewPage.find('.pay_selectDiv option').bind('click', function () {
            viewPage.find('.pay_selectDiv input').val($(this).html());
            return false;
        });

        viewPage.delegate('.pay_selectDiv input', {
            'click': function () {
                $(this).parent().find('ul').addClass('hideModule');
                viewPage.find('.moreDiv .closeBtn').addClass('hideModule');
                return false;
            },
            'focus': function () {
                $(this).parent().addClass('touched_border');
            },
            'blur': function () {
                $(this).parent().removeClass('touched_border');
            }
        });

        viewPage.delegate('.pay_selectDiv #bankName', {
            'change': function () {
                if (bankList.length == 0) {
                    return;
                }
                var bankName = $(this).val();
                var accounts = [];
                var inum = bankList.length;
                for (var i = 0; i < inum; i++) {
                    if (bankList[i].name == bankName) {
                        accounts = bankList[i].accounts;
                        break;
                    }
                }
                if (accounts.length == 0) {
                    viewPage.find('.bank_Account .accountList').addClass('hideModule');
                } else {
                    viewPage.find('.bank_Account .accountList').removeClass('hideModule');
                }
                var listStr = $.Array.keep(accounts,
                    function (item, index) {
                        return $.String.format(accountItem, {
                            item: item
                        });
                    }
                ).join(' ');
                viewPage.find('.pay_selectDiv .accountList').html(listStr);
                scroller.refresh();
            }
        });

        viewPage.delegate('textarea', {
            'click': function () {
                if ($(this).val() == constStr.textarea) {
                    $(this).val('');
                }
                $(this).addClass('textFocus');
                $(this).parent().addClass('touched_border');
            },
            'blur': function () {
                if (kdShare.trimStr($(this).val()) == '' || $(this).val() == constStr.textarea) {
                    $(this).val(constStr.textarea);
                    $(this).removeClass('textFocus');
                }
                $(this).parent().removeClass('touched_border');
            }
        });

        //付款金额录入
        viewPage.delegate('.money', {
            'click': function () {
                if (!isEditBill) {
                    return;
                }

                var target = $(this).children('input');
                var value = kdShare.trimStr(target.val());
                if (value == '' || value == constStr.moneyMsg) {
                    target.val('');
                }
                var config = {
                    name: '付款金额',
                    input: target.val(),
                    hint: "无效数据!",
                    allowZero: true,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.val(constStr.moneyMsg);
                        }
                        else {
                            target.val(kvalue);
                        }
                    },
                    hidefn: function () {
                        var value = kdShare.trimStr(target.val());
                        if (value == '') {
                            target.val(constStr.moneyMsg);
                        }
                    }
                };
                kdShare.keyBoard.autoshow(config);
            },
            'focus': function () {
                $(this).addClass('moneyFocus');
                $(this).parent().addClass('touched_border');
            },
            'blur': function () {
                if (kdShare.trimStr($(this).val()) == '' || $(this).val() == constStr.moneyMsg) {
                    $(this).val(constStr.moneyMsg);
                }
                $(this).parent().removeClass('touched_border');
                $(this).removeClass('moneyFocus');
                $(this).onkeyup = null;
                $(this).onkeydown = null;
            }
        });

        // 添加图片事件
        viewPage.delegate('.addImgBtn', {
            'click': function () {
                if (isEditBill) {
                    getPhotoFromWX();
                }
            },
            'touchstart': function () {
                if (isEditBill) {
                    $(this).removeClass('sprite-addImg');
                    $(this).addClass('sprite-addImg_s');
                }
            },
            'touchend': function () {
                if (isEditBill) {
                    $(this).removeClass('sprite-addImg_s');
                    $(this).addClass('sprite-addImg');
                }
            }
        });

        //图片删除
        viewPage.delegate('.deleteImg', {
            'click': function () {
                if (isEditBill) {
                    var parent = $(this).parents('.imgBox');
                    var imgList = viewPage.find('.imgListDiv');
                    var src = parent.find('img').attr('src');
                    imgList[0].removeChild(parent[0]);
                    refreshSrcList(src);
                }
            }
        });
    }

    //录入更多信息
    function showMoreInfo(bshow) {
        if (bshow) {
            viewPage.find('.moreDiv').removeClass('hideModule');
            viewPage.find('.moreBtn').addClass('hideModule');
            viewPage.find('.moreDiv .closeBtn').removeClass('hideModule');
            $('.view_payDetail .closeBtn').show();
        } else {
            viewPage.find('.moreDiv').addClass('hideModule');
            viewPage.find('.moreBtn').removeClass('hideModule');
            viewPage.find('.moreDiv .closeBtn').addClass('hideModule');
            $('.view_payDetail .closeBtn').hide();
        }
        scroller.refresh();
    }

    //调用微信接口获取图片
    function getPhotoFromWX() {
        wx.chooseImage({
            success: function (res) {
                //待上传的img列表
                serverIds = [];
                srcMeidaKey = [];
                var localIds = res.localIds;
                var imgNum = localIds.length;
                //可上传图片数
                var canUploadImgNum = maxImgNum - srcList.length;
                if (canUploadImgNum <= 0) {
                    return;
                }
                uploadImageNum = imgNum;
                if (uploadImageNum > canUploadImgNum) {
                    uploadImageNum = canUploadImgNum;
                }
                //如果是iphone系统则一次只传一个图片
                if (kdAppSet.isIPhoneSeries()) {
                    uploadImageNum = 1;
                }

                // 控制提交按键此时无效
                viewPage.find('.submit').addClass('invalid_Btn');

                for (var i = 0; i < uploadImageNum; i++) {
                    var imgSrc = localIds[i];
                    // 创建图片
                    createImgElement(viewPage.find('.imgListDiv'), imgSrc);
                    uploadWXImg(imgSrc);
                }
            },
            fail: function () {
                uploadImageNum = 0;
            }
        });
    }


    function getImgWx(meida_id) {
        var inum = srcMeidaKey.length;
        for (var i = 0; i < inum; i++) {
            if (srcMeidaKey[i].serverId == meida_id) {
                return srcMeidaKey[i].localId;
            }
        }
        return '';
    }


    // 上传微信图片
    function uploadWXImg(imgSrc) {

        wx.uploadImage({
            localId: imgSrc, // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function (res) {
                uploadImageNum = uploadImageNum - 1;
                // 提交给服务器端
                var serverId = res.serverId;
                // 返回图片的服务器端ID
                serverIds.push(serverId);
                srcMeidaKey.push({
                    localId: imgSrc,
                    serverId: serverId
                });
                // 显示上传图片到服务器
                if (uploadImageNum <= 0) {
                    //图片上传完毕
                    kdAppSet.setKdLoading(true, '上传中...');
                    try {
                        var eid = kdAppSet.getAppParam().eid;
                        OptImage.upLoadWxImageMultiple(eid, serverIds,
                            function (json) {
                                var imglist = json.data || [];
                                for (var i = 0; i < imglist.length; i++) {
                                    var imgwx = getImgWx(imglist[i].meida_id);
                                    if (imglist[i].suc == 1) {
                                        srcList.push({ 'imgSrc': imgwx, 'serverId': imglist[i].url});
                                    } else {
                                        deleteImgElement(viewPage.find('.imgListDiv'), imgwx);
                                    }
                                }
                                kdAppSet.setKdLoading(false);
                                viewPage.find('.submit').removeClass('invalid_Btn');
                            }, function () {
                                kdAppSet.setKdLoading(false);
                                viewPage.find('.submit').removeClass('invalid_Btn');
                            });
                    }
                    catch (ex) {
                        jAlert('调用接口出错' + ex)
                    }
                }

            },
            fail: function () {
                uploadImageNum = uploadImageNum - 1;
                if (uploadImageNum <= 0) {
                    kdAppSet.setKdLoading(false);
                    viewPage.find('.submit').removeClass('invalid_Btn');
                }
                OptMsg.ShowMsg('上传失败', '', 1500);
                deleteImgElement(viewPage.find('.imgListDiv'), imgSrc);
            }
        });
    }


    // 删除图片
    function deleteImgElement(parent, imgSrc) {
        var imgDivs = parent.children();
        for (var i = 0; i < imgDivs.length; i++) {
            if ($(imgDivs[i]).find('img').attr('src') == imgSrc) {
                parent[0].removeChild(imgDivs[i]);
                break;
            }
        }
        var temp = [];
        for (var j = 0; j < srcList.length; j++) {
            if (srcList[j].imgSrc != imgSrc) {
                temp.push(srcList[j]);
            }
        }
        srcList = temp;
        if (parent.find('.imgDiv').length < maxImgNum) {
            viewPage.find('.addImgBtn').show();
        }
    }

    // 根据src创建一个img元素插入显示列表
    function createImgElement(jqObj, src) {
        var imgBox = $.String.format(sample, {
            src: src
        });
        jqObj.append(imgBox);
        if (jqObj.find('.imgBox').length >= maxImgNum) {
            viewPage.find('.addImgBtn').hide();
        } else {
            viewPage.find('.addImgBtn').show();
        }
    }

    // 更新需要上传的图片信息
    function refreshSrcList(imgSrc) {
        var temp = [];
        for (var j = 0; j < srcList.length; j++) {
            if (srcList[j].imgSrc != imgSrc) {
                temp.push(srcList[j]);
            }
        }
        srcList = temp;
        viewPage.find('.addImgBtn').show();
    }


    //显示上传的图片
    function freshImgInfo(list) {
        viewPage.find('.imgListDiv').html('');
        var imgList = list.payImgList || [];
        var inum = imgList.length;
        srcList = [];
        for (var i = 0; i < inum; i++) {
            createImgElement(viewPage.find('.imgListDiv'), imgList[i]);
            srcList.push({ "imgSrc": imgList[i], "serverId": imgList[i] });
        }
        if (isEditBill) {
            viewPage.find(".imgDiv .deleteImg").show();
        } else {
            viewPage.find(".imgDiv .deleteImg").hide();
        }
        if (viewPage.find('.imgListDiv').innerText == '' && (!isEditBill)) {
            viewPage.find('.imgDiv').hide();
        } else {
            viewPage.find('.imgDiv').show();
        }
    }


    // 页面渲染
    function render(config) {
        initView();
        payNo = config.payNo || '';
        payType = config.payType || '';
        payOrder = config.payOrder || '';
        payBillId = config.payBillId || '';
        if (payOrder) {
            viewPage.find('.order').show();
            viewPage.find('.pay_Order').html(payOrder);
        } else {
            viewPage.find('.order').hide();
            viewPage.find('.pay_Order').html('');
        }
        var newbill = config.newbill || false;
        initBankList();
        isEditBill = false;
        initBillInfo();
        if (newbill) {
            isEditBill = true;
            var paymoney = config.paymoney || '';
            if (paymoney != '') {
                viewPage.find('#pay_Money').val(paymoney);
            }
            viewPage.find('.payNoDiv').hide();
            showMoreInfo(false);
            freshBillStatus();
        } else {
            viewPage.find('.payNoDiv').show();
            viewPage.find('.payNoDiv .payno').html(payNo);
            showPayDetail();
        }
        show();
        var minHeight = $('.view_payDetail .content').height();  // 设置最小高度，确保底部不被顶起
        $('.view_payDetail .content').css('min-height', minHeight);
        scroller.refresh();
    }


    //初始化单据信息
    function initBillInfo() {
        viewPage.find('#pay_Money').val(constStr.moneyMsg);
        viewPage.find('.pay_DateDiv input').val($.Date.format($.Date.now(), "yyyy-MM-dd"));
        viewPage.find('.pay_Msg').val(constStr.textarea);
        viewPage.find('#bankName').val('');
        viewPage.find('.account').val('');
        viewPage.find('.bankMsg').val('');
        viewPage.find('.check_logo').addClass('hideModule');
        viewPage.find('.imgListDiv').html('');
        uploadImageNum = 0;
        serverIds = [];
        srcList.length = 0;
        freshBillStatus();
    }

    function freshBillStatus() {
        var readonly = true;
        $('.view_payDetail .closeBtn').hide();
        var content = $('.view_payDetail .content');
        if (isEditBill) {
            readonly = false;
            viewPage.find('.addImgBtn').show();
            viewPage.find(".imgDiv .deleteImg").show();
            content.css('bottom', '45px');
            footer.show();
            if ($('.pay_Msg').val() == constStr.textarea) {
                $('.pay_Msg').removeClass('textFocus');
            }
            else {
                $('.pay_Msg').addClass('textFocus');
            }
        } else {
            viewPage.find('.addImgBtn').hide();
            viewPage.find(".imgDiv .deleteImg").hide();
            content.css('bottom', '0');
            footer.hide();
            $('.pay_Msg').removeClass('textFocus');
        }
        viewPage.find('#pay_Money').attr("readonly", "true");
        viewPage.find('.pay_DateDiv input').attr("disabled", readonly);
        viewPage.find('.pay_Msg').attr("disabled", readonly);
        viewPage.find('#bankName').attr("disabled", readonly);
        viewPage.find('.account').attr("disabled", readonly);
        viewPage.find('.bankMsg').attr("disabled", readonly);
    }

    // 详情页信息
    function showPayDetail() {
        kdAppSet.setKdLoading(true, "正在加载数据...");
        Lib.API.get('GetPayDetailInfo', {
                para: {  'payNo': payNo }
            },
            function (data, json, root) {
                kdAppSet.setKdLoading(false);
                var payWay = data.payWay || 0;
                isEditBill = false;
                if (payWay == 0 && data.payStatus == 0) {
                    //线下支付 并且未确认
                    isEditBill = true;
                }
                viewPage.find('.pay_DateDiv input').val(data.payDate);
                viewPage.find('#pay_Money').val(data.payMoney);
                viewPage.find('.check_logo').removeClass('hideModule');
                viewPage.find('.check_logo').attr('class', 'check_logo sprite-' + getStatus(data.payStatus));
                viewPage.find('#bankName').val(data.payTargetBank);
                viewPage.find('.account').val(data.payTargetBankNo);
                var payMsg = data.payMsg.replace('捎句话：', '');
                viewPage.find('.pay_Msg').val(payMsg || '');
                payOrder = data.payOrder || '';
                if (payOrder) {
                    viewPage.find('.order').show();
                    viewPage.find('.pay_Order').html(payOrder);
                }
                showMoreInfo(true);
                freshBillStatus();
                freshImgInfo(data);
                scroller.refresh();
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                msg = msg || '无法加载';
                OptMsg.ShowMsg(msg);
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                msg = msg || '无法加载';
                OptMsg.ShowMsg(msg);
            });
    }

    // 付款通知状态检查
    function getStatus(status) {
        if (status == '-1') {
            return 'failure'
        }
        if (status == '1') {
            return 'checked'
        }
        return 'checking';
    }

    function show() {
        viewPage.show();
    }

    function hide() {
        viewPage.hide();
        $('.view_payDetail .pay_selectDiv ul').addClass('hideModule');
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();