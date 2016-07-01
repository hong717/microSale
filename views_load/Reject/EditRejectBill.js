/*退货单编辑页面*/


var EditRejectBill = (function () {
    var div, scroller, divContent, hasInit, config, listdata, bsummiting, viewpage, sample,
        rejectType, keywordhint, mode,
        srcList = [], isNewBill, maxImgNum, finishEditRejectBill,
        uploadImageNum, serverIds;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_EditRejectBill');
            viewpage = $(div);
            divContent = document.getElementById('editRejectContent');
            listdata = {};
            bindEvents();
            sample = $.String.between(viewpage.find('.imgListDiv').html(), '<!--', '-->');
            keywordhint = '请输入您要备注的信息';
            initScroll(divContent);
            bsummiting = false;
            isNewBill = true;
            maxImgNum = 3;
            //是否回退
            finishEditRejectBill = false;
            uploadImageNum = 0;
            serverIds = [];
            hasInit = true;
        }
    }

    //初始化 按钮状态
    function initRejectBill() {
        rejectType = -1;
        btnUnSelected();
        viewpage.find('.refundBtn').addClass('typeBtn_touched');
        viewpage.find('.refundBtn').addClass('sprite-attr_select');
        viewpage.find('#rejectRemark').removeClass('textFocus');
        viewpage.find('#rejectRemark').val(keywordhint);
        viewpage.find('.imgListDiv').html('');
        viewpage.find('.addImgBtn').show();
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, {});
    }

    //获取已上传的图片
    function getImgList() {
        var imglist = [];
        var inum = srcList.length;
        for (var i = 0; i < inum; i++) {
            imglist.push(srcList[i].serverId);
        }
        return imglist;
    }

    // 绑定事件
    function bindEvents() {

        //查看退货详情
        viewpage.delegate('.rightInfoDiv', {
            'click': function () {
                if (mode == 1) {
                    //新增退货单
                    listdata.payImgList = getImgList();
                    listdata.moneytype = rejectType;
                }
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelectList', { data: listdata, mode: mode }]);
            },
            'touchstart': function () {
                $(this).parents('.contentTop').addClass('onclick');
            },
            'touchend': function () {
                $(this).parents('.contentTop').removeClass('onclick');
            }
        });

        // 退款类型点击事件
        viewpage.delegate('.refundBtn', {
            'click': function () {
                if (isNewBill) {
                    btnUnSelected();
                    btnSelected($(this));
                    rejectType = 0;
                }
            }
        });
        viewpage.delegate('.advanceBtn', {
            'click': function () {
                if (isNewBill) {
                    btnUnSelected();
                    btnSelected($(this));
                    rejectType = 1;
                }
            }
        });
        viewpage.delegate('.otherBtn', {
            'click': function () {
                if (isNewBill) {
                    btnUnSelected();
                    btnSelected($(this));
                    rejectType = 2;
                }
            }
        });

        // 备注焦点事件
        viewpage.delegate('.msgDiv textarea', {
            'focus': function () {
                $(this).addClass('textFocus');
            },
            'blur': function () {
                var valueStr = kdShare.trimStr($(this).val());
                if (valueStr == keywordhint || valueStr == '') {
                    $(this).removeClass('textFocus');
                }
            }
        });

        //提交退货单
        viewpage.delegate('.submitBtn', {
            'click': function () {
                if (uploadImageNum > 0) {
                    OptMsg.ShowMsg("正在上传图片,请稍后...", '', 1500);
                    return;
                }
                submitRejectBill();
            },
            'touchstart': function () {
                $(this).addClass('submitBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('submitBtn_touched');
            }
        });

        //取消提交退货单
        viewpage.delegate('.cancelBtn', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });

        //删除退货单
        viewpage.delegate('.deleteBtn', {
            'click': function () {
                var billid = config.billid;
                deleteBill(billid);
            },
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });


        // 添加图片事件
        viewpage.delegate('.addImgBtn', {
            'click': function () {
                if (isNewBill) {
                    getPhotoFromWX();
                }
            },
            'touchstart': function () {
                if (isNewBill) {
                    $(this).removeClass('sprite-addImg');
                    $(this).addClass('sprite-addImg_s');
                }
            },
            'touchend': function () {
                if (isNewBill) {
                    $(this).removeClass('sprite-addImg_s');
                    $(this).addClass('sprite-addImg');
                }
            }
        });

        //图片删除
        viewpage.delegate('.deleteImg', {
            'click': function () {
                if (isNewBill) {
                    var parent = $(this).parents('.imgBox');
                    var imgList = viewpage.find('.imgListDiv');
                    var src = parent.find('img').attr('src');
                    imgList[0].removeChild(parent[0]);
                    refreshSrcList(src);
                }
            }
        })
    }

    //退款类型选中
    function btnSelected(btnclick) {
        btnclick.addClass('typeBtn_touched');
        btnclick.addClass('sprite-attr_select');
    }

    //退款类型取消选中
    function btnUnSelected() {
        viewpage.find('.refundBtn').removeClass('typeBtn_touched');
        viewpage.find('.refundBtn').removeClass('sprite-attr_select');
        viewpage.find('.advanceBtn').removeClass('typeBtn_touched');
        viewpage.find('.advanceBtn').removeClass('sprite-attr_select');
        viewpage.find('.otherBtn').removeClass('typeBtn_touched');
        viewpage.find('.otherBtn').removeClass('sprite-attr_select');

    }

    //调用微信接口获取图片
    function getPhotoFromWX() {
        wx.chooseImage({
            success: function (res) {
                //待上传的img列表
                serverIds = [];
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
                viewpage.find('.submitBtn').addClass('invalid_Btn');

                for (var i = 0; i < uploadImageNum; i++) {
                    var imgSrc = localIds[i];
                    // 创建图片
                    createImgElement(viewpage.find('.imgListDiv'), imgSrc);
                    uploadWXImg(imgSrc);
                }
            },
            fail: function () {
                uploadImageNum = 0;
            }
        });
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
                // 显示上传图片到服务器
                if (uploadImageNum <= 0) {
                    //图片上传完毕
                    try {
                        var eid = kdAppSet.getAppParam().eid;
                        OptImage.upLoadWxImageMultiple(eid, serverIds,
                            function (json) {
                                var imglist = json.data || [];
                                for (var i = 0; i < imglist.length; i++) {
                                    if (imglist[i].suc == 1) {
                                        srcList.push({ 'imgSrc': imglist[i].meida_id, 'serverId': imglist[i].url });
                                    } else {
                                        deleteImgElement(viewpage.find('.imgListDiv'), imglist[i].meida_id);
                                    }
                                }
                                kdAppSet.setKdLoading(false);
                                viewpage.find('.submitBtn').removeClass('invalid_Btn');
                            }, function () {
                                kdAppSet.setKdLoading(false);
                                viewpage.find('.submitBtn').removeClass('invalid_Btn');
                            });
                    }
                    catch (ex) {
                        jAlert('调用接口出错' + ex)
                    }
                }
                kdAppSet.setKdLoading(true, '上传中...');
            },
            fail: function () {
                uploadImageNum = uploadImageNum - 1;
                if (uploadImageNum <= 0) {
                    kdAppSet.setKdLoading(false);
                    viewpage.find('.submitBtn').removeClass('invalid_Btn');
                }
                OptMsg.ShowMsg('上传失败', '', 1500);
                deleteImgElement(viewpage.find('.imgListDiv'), imgSrc);
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
            viewpage.find('.addImgBtn').show();
        }
    }

    // 根据src创建一个img元素插入显示列表
    function createImgElement(jqObj, src) {
        var imgBox = $.String.format(sample, {
            src: src
        });
        jqObj.append(imgBox);
        if (jqObj.find('.imgBox').length >= maxImgNum) {
            viewpage.find('.addImgBtn').hide();
        } else {
            viewpage.find('.addImgBtn').show();
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
        viewpage.find('.addImgBtn').show();
    }

    //删除退货单
    function deleteBill(billid) {

        jConfirm("你确定要删除此退货单?", null, function (flag) {
            if (flag) {
                var para = { currentPage: 1, ItemsOfPage: 10 };
                para.para = { InterID: billid };

                CancelOrderApi(function (data) {
                    OptMsg.ShowMsg(data[0].result, '', 1500);
                    //通知退货单列表刷新
                    MiniQuery.Event.trigger(window, 'FreshRejectBill', []);
                    setTimeout(function () {
                        kdShare.backView();
                    }, 500);
                }, para);

                function CancelOrderApi(fn, para) {
                    Lib.API.get('DelSEOutStockByBillID', para,
                        function (data) {
                            fn && fn(data['resultlist']);
                        }, function () {
                            kdAppSet.setKdLoading(false);
                        }, function () {
                            kdAppSet.setKdLoading(false);
                        }
                    );
                }
            } else {
            }
        }, { ok: "是", no: "否" });
    }


    //提交退货单
    function submitRejectBill() {

        if (bsummiting) {
            OptMsg.showMsg('单据正在提交，请稍候!');
            return;
        }

        bsummiting = true;
        var data = listdata.list || [];
        var tempdata = [];
        var inum = data.length;

        if (inum <= 0) {
            OptMsg.ShowMsg('请先选择退货商品!');
            return;
        }

        //构造退货商品信息
        for (var i = 0; i < inum; i++) {
            if (!data[i].selected) {
                continue;
            }
            var iauxtype = data[i].auxtype;

            if (iauxtype == 0) {
                //无辅助属性
                var temp = {};
                temp.MaterialID = data[i].itemid;
                temp.UnitID = data[i].unitid;
                temp.AuxID = 0;
                var attrList0 = data[i].attrList;
                if (attrList0[0].selected) {
                    temp.Qty = attrList0[0].num;
                    temp.Price = attrList0[0].price;
                    tempdata.push(temp);
                }

            } else if (iauxtype == 1) {
                //合并商品
                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    if (attrList1[j].selected) {
                        var temp1 = {};
                        temp1.MaterialID = attrList1[j].fitemid;
                        temp1.UnitID = data[i].unitid;
                        temp1.AuxID = 0;
                        temp1.Qty = attrList1[j].num;
                        temp1.Price = attrList1[j].price;
                        tempdata.push(temp1);
                    }
                }

            } else if (iauxtype == 2) {
                //有辅助属性
                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    if (attrList2[k].selected) {
                        var temp2 = {};
                        temp2.MaterialID = data[i].itemid;
                        temp2.UnitID = data[i].unitid;
                        temp2.AuxID = attrList2[k].fauxid;
                        temp2.Qty = attrList2[k].num;
                        temp2.Price = attrList2[k].price;
                        tempdata.push(temp2);
                    }
                }
            }
        }

        var srcListNew = [];
        var inum = srcList.length;
        for (var i = 0; i < inum; i++) {
            srcListNew.push({ "imgSrc": srcList[i].serverId });
        }

        var optOpenid = kdAppSet.getUserInfo().optid;
        var promptTxt = "请输入您要备注的信息";
        var remark = viewpage.find("#rejectRemark").val();
        remark = remark.replace(/'/g, "");
        remark = remark.replace(/"/g, "");
        if (remark == promptTxt) {
            remark = "";
        }
        var userInfo = kdAppSet.getUserInfo();
        //0--退款，1--留作预付款 2其它
        var submitData = {
            optOpenid: optOpenid,
            OrderInterID: listdata.billid,
            OrderBillNo: listdata.billno,
            ReFundType: rejectType,
            Requestion: kdAppSet.ReplaceJsonSpecialChar(remark),
            //Requestion: kdAppSet.ReplaceJsonSpecialChar(remark) + "(退货人：" + userInfo.contactName + "；电话：" + userInfo.senderMobile + "；订单号：" + listdata.billno + ")",
            payImgList: srcListNew,
            SODetail: tempdata
        };


        kdAppSet.setKdLoading(true, "正在提交单据...");
        var para = { para: submitData };
        submitRejectBillApi(function (data) {
            //document.getElementById('popbillno').innerHTML = data;
            kdAppSet.setKdLoading(false);
            jAlert("退货申请已提交，退货单号 " + data);
            finishNewRejectBill();
            //通知退货商品选择页面 刷新数据
            MiniQuery.Event.trigger(window, 'finishEditRejectBill', []);
            MiniQuery.Event.trigger(window, 'toview', ['RejectBillList', {}]);

        }, para);
    }

    //完成新的退货单
    function finishNewRejectBill() {
        //清空单据信息
        finishEditRejectBill = true;
        listdata = [];
        freshHeadInfo(listdata);
        freshImgInfo(listdata);
        viewpage.find('#rejectRemark').val("");
    }

    //调用提交退货单api接口
    function submitRejectBillApi(fn, para) {
        Lib.API.get('SubmitSEOutStock', para,
            function (data, json) {
                bsummiting = false;
                var billno = data['BillNo'] || "";
                fn && fn(billno);
                if (billno != "") {
                    OptMsg.NewRejectBill(billno);
                }
            }, function (code, msg) {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function () {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert("提交单据出错!");
            });
    }


    function render(configp) {
        initView();
        toggleShowPrice();
        initRejectBill();
        config = configp;
        finishEditRejectBill = false;
        if (config.data != undefined) {
            //新增退货单
            isNewBill = true;
            mode = 1;
            listdata = config.data;
            freshHeadInfo(listdata);
            freshImgInfo(listdata);
            freshBillStatus(1);
            viewpage.find('.msgDiv .curtain').hide();
        }
        if (config.billid != undefined) {
            //查看退货单
            isNewBill = false;
            mode = 0;
            getBillDetail(config.billid);
            freshBillStatus(0);
            viewpage.find('.msgDiv .curtain').show();

        }
        show();
        var minHeight = viewpage.find('.content').height();  // 设置最小高度，确保底部不被顶起
        viewpage.find('.content').css('min-height', minHeight);
        scroller.refresh();

    }

    function toggleShowPrice() {
        var isShow = kdAppSet.getIsShowPrice();
        if (isShow) {
            viewpage.find('.money').show();
        }
        else {
            viewpage.find('.money').hide();
        }
    }


    //调用接口获取订单详情
    function getBillDetail(interID) {

        kdAppSet.setKdLoading(true, "获取退货单信息...");
        Lib.API.get('GetSEOutStockDetail', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { InterID: interID }
        }, function (data, json) {
            listdata = {
                list: data.list,
                billid: interID,
                billno: data.OrderBillNo,
                requestion: data.Requestion,
                moneytype: data.ReFundType,
                payImgList: data.payImgList,
                billdate: data.OrderDate
            };
            setListdataSelected();
            freshHeadInfo(listdata);
            freshImgInfo(listdata);
            if (mode == 0) {
                viewpage.find('.addImgBtn').hide();
            }
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            jAlert("获取退货单信息出错," + msg);
            kdAppSet.setKdLoading(false);
        }, function () {
            kdAppSet.setKdLoading(false);
        }, "");
    }

    //设置退货商品选中状态,以及最大值
    function setListdataSelected() {
        var inum = listdata.list.length;
        for (var i = 0; i < inum; i++) {
            listdata.list[i].selected = 1;
            var jnum = listdata.list[i].attrList.length;
            for (var j = 0; j < jnum; j++) {
                listdata.list[i].attrList[j].selected = 1;
                listdata.list[i].attrList[j].maxnum = listdata.list[i].attrList[j].num;
            }
        }
    }

    //刷新头部信息
    function freshHeadInfo(data) {
        var list = data.list || [];
        var inum = list.length;
        //选取第一个退货商品的图片与名称
        if (inum > 0) {
            for (var i = 0; i < inum; i++) {
                if (list[i].selected) {
                    var item = list[i];
                    var ingsrc = 'img/no_img.png';
                    if (item.img) {
                        ingsrc = kdAppSet.getImgThumbnail(item.img);
                    }
                    viewpage.find(".leftImgDiv img").attr("src", ingsrc);
                    viewpage.find(".rightInfoDiv .name").text(item.name);
                    break;
                }
            }
        }

        //计算退货商品数量与金额汇总
        var sumNum = 0;
        var sumMoney = 0;
        var itmp;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected) {
                var attrList = list[i].attrList;
                var jnum = attrList.length;
                for (var j = 0; j < jnum; j++) {
                    if (attrList[j].selected) {
                        sumNum += attrList[j].num;
                        itmp = kdShare.calcMul(Number(attrList[j].num), Number(attrList[j].price));
                        sumMoney = kdShare.calcAdd(sumMoney, itmp);
                    }
                }
            }
        }

        viewpage.find(".rightInfoDiv .numSpan em").text(sumNum);
        viewpage.find(".rightInfoDiv .moneySpan em").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(sumMoney));

        var remark = listdata.requestion || "";
        if (remark && remark != keywordhint) {
            viewpage.find("#rejectRemark").addClass('textFocus');
            viewpage.find("#rejectRemark").val(remark);
        }

        //根据退货单信息 设置退款类型
        btnUnSelected();
        if (listdata.moneytype == 0) {
            rejectType = listdata.moneytype;
            btnSelected(viewpage.find(".refundBtn"));
        } else if (listdata.moneytype == 1) {
            rejectType = listdata.moneytype;
            btnSelected(viewpage.find(".advanceBtn"));
        } else if (listdata.moneytype == 2) {
            rejectType = listdata.moneytype;
            btnSelected(viewpage.find(".otherBtn"));
        }
    }

    //显示上传的图片
    function freshImgInfo(list) {
        var imgList = list.payImgList || [];
        var inum = imgList.length;
        srcList = [];
        for (var i = 0; i < inum; i++) {
            createImgElement(viewpage.find('.imgListDiv'), imgList[i]);
            srcList.push({ "imgSrc": imgList[i], "serverId": imgList[i] });
        }
        if (isNewBill) {
            viewpage.find(".imgDiv .deleteImg").show();
        } else {
            viewpage.find(".imgDiv .deleteImg").hide();
        }
    }

    //刷新单据状态
    function freshBillStatus(isNewBill) {
        if (isNewBill) {
            viewpage.find(".submitBtn").show();
            viewpage.find(".deleteBtn").hide();
        } else {
            viewpage.find(".submitBtn").hide();
            viewpage.find(".deleteBtn").show();
        }
    }

    function show() {
        viewpage.show();
        //如果是回退，并且单据已完成，自动回到上一个页面
        if (finishEditRejectBill) {
            history.back();
        }
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