/*添加商品辅助属性勾选*/

var AddGoods_Attr = (function () {

    var auxType, config,
        divList, ul, ullist, scroller,
        goodAttrList1, sampleAttrList1,
        goodAttrList2, sampleAttrList2,
    //属性选中值
        addSelAttr,
        stockNumList,
    //商品辅助属性详情数据集
        dlist,
        addGoodsList,
        shareData,
        attrType,
        attrName1,
        attrList1,
        attrName2,
        attrList2,
        attrList1All,
        attrList2All;

    function initView(param) {
        divList = document.getElementById('addgoodsbody');
        scroller = param;
        ul = divList.firstElementChild;
        ullist = $(ul);
        goodAttrList1 = document.getElementById('goodAttrList1');
        sampleAttrList1 = $.String.between(goodAttrList1.innerHTML, '<!--', '-->');
        goodAttrList2 = document.getElementById('goodAttrList2');
        sampleAttrList2 = $.String.between(goodAttrList2.innerHTML, '<!--', '-->');
        addSelAttr = { attr1: "", attr2: "" }; //属性选中值
        addGoodsList = AddGoods_Api.getAddGoodsList();
        stockNumList = [];
        bindEvents();
    }

    function bindEvents() {
        //辅助属性1选中
        $("#goodAttrList1").delegate('.attr', {
            'click': function () {
                attr1Selected($(this));
            }
        });

        $("#goodAttrList2").delegate('.attr2', {
            'click': function () {
                attr2Selected($(this));
            }
        });


        $(".divNum").delegate("#divNumLeft", {
            'click': function () {
                divNumLeftFunc();
            }
        });

        $(".divNum").delegate("#divNumRight", {
            'click': function () {
                divNumRightFunc();
            }
        });

        $(".divNum").delegate(".numText2", {
            'click': function () {
                var target = this;
                var config = {
                    name: '购买数量',
                    input: target.innerText,
                    hint: "无效数据!",
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.innerText = 1;
                        }
                        else {
                            target.innerText = kvalue;
                        }
                        updateGoodsAuxPrice();
                        freshSumInfoNoAttr();
                    },
                    hidefn: function () {
                    }
                };
                kdShare.keyBoard.autoshow(config);
            }
        });
    }

    //数字键 减号函数
    function divNumLeftFunc() {
        var numInput = $(".divNum .numText2")[0];
        var numAdd = Number(numInput.innerText);
        if (numAdd > 1) {
            numAdd--;
        }
        numInput.innerText = numAdd;
        updateGoodsAuxPrice();
        freshSumInfoNoAttr();
    }

    //数字键 加号函数
    function divNumRightFunc() {
        var numInput = $(".divNum .numText2")[0];
        var numAdd = Number(numInput.innerText);
        numAdd++;
        numInput.innerText = numAdd;
        updateGoodsAuxPrice();
        freshSumInfoNoAttr();
    }

    //加入采购清单
    function addGoodsToList() {
        var bloadind = AddGoods_Api.apiLoading();
        if (bloadind) {
            OptMsg.ShowMsg("数据正在加载中,请稍后...");
            return;
        }
        var dataKey = getAuxDataKey(true);
        if (dataKey != "") {
            return addGoodsDataToList(dataKey);
        }
    }


    //加入购物清单函数处理
    function addGoodsDataToList(dataKey) {
        var numAdd = Number($(".divNum .numText2")[0].innerText);
        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, numAdd);
        var dataAdd = AddGoods_Api.addGoodsDataToCache(dataKey, numAdd, price, true);
        initAttrListInfo();

        if (auxType != 0) {//0 无辅助属性
            $(".addgoods .btnok").css("background", "#FF6427");
            $(".addgoods .selectAttrs").css("display", "none");
            $(".addgoods .selectAttr1").text('');
            $(".addgoods .selectAttr2").text('');
        }
        return true;
    }


    //初始化辅助属性值
    function initAttrListInfo() {
        var goodAttrList1s = $("#goodAttrList1").children();
        goodAttrList1s.removeClass("attrCheck");
        goodAttrList1s.removeClass("attrUnCheck");
        var goodAttrList2s = $("#goodAttrList2").children();
        goodAttrList2s.removeClass("attrCheck");
        goodAttrList2s.removeClass("attrUnCheck");
        addSelAttr = { attr1: "", attr2: "" };
        attrListSelected(attrList1, "");
        attrListSelected(attrList2, "");
        stockNumList = [];
    }

    //获取商品属性共享数据
    function getShareData() {
        shareData = AddGoods_Api.getData();
        attrType = shareData.attrType;
        attrName1 = shareData.attrName1;
        attrList1 = shareData.attrList1;
        attrName2 = shareData.attrName2;
        attrList2 = shareData.attrList2;
        attrList1All = shareData.attrList1All;
        attrList2All = shareData.attrList2All;
    }

    //显示商品的辅助属性
    function showItemAuxInfo(datalist) {
        //获取商品辅助属性值
        getShareData();
        auxType = datalist.auxType; // 0  无辅助属性  1 组合物料  2 有辅助属性
        showBtnGoodsList(auxType);
        var goodsAttr1 = $("#goodsAttr1");
        var goodsAttr2 = $("#goodsAttr2");
        goodsAttr1.hide();
        goodsAttr2.hide();

        if (auxType == attrType.noAttr) {
            freshSumInfoNoAttr();
        } else if (auxType == attrType.cmbAttr) {//合并商品
            goodsAttr1.show();
            goodsAttr1.find("p").text("");
            var attrListHtml = $.Array.keep(attrList1, function (item, index) {
                return $.String.format(sampleAttrList1, {
                    attrname: item.name,
                    attrcheck: item.selected == 1 ? "attrCheck" : "attrUnCheck"
                });
            }).join('');
            goodAttrList1.innerHTML = attrListHtml;
        } else if (auxType == attrType.soleAttr) {//商品有辅助属性
            //拆分处理 辅助属性
            var auxName = datalist.auxName || [];
            var auxTypeNum = auxName.length;
            //显示第1个辅助属性
            goodsAttr1.show();
            attrName1 = auxName[0].FName;
            goodsAttr1.find("p").text(attrName1);
            var attrList1Html = $.Array.keep(attrList1, function (item, index) {
                return $.String.format(sampleAttrList1, {
                    attrname: item.name,
                    attrcheck: item.selected == 1 ? "attrCheck" : "attrUnCheck"
                });
            }).join('');
            goodAttrList1.innerHTML = attrList1Html;
            if (auxTypeNum >= 2) {
                goodsAttr2.show();
                attrName2 = auxName[1].FName;
                if (auxTypeNum > 2) {
                    //若是3个辅助属性以上 则合并后面的辅助属性为1个
                    attrName2 = "";
                    for (var k = 1; k < auxTypeNum; k++) {
                        if (attrName2 == "") {
                            attrName2 = auxName[k].FName;
                        } else {
                            attrName2 = attrName2 + "/" + auxName[k].FName;
                        }
                    }
                }
                //显示第2个辅助属性
                goodsAttr2.find("p").text(attrName2);
                freshAttrList2(attrList2);
            }
        }
        autoSelGoods();
        scroller.refresh();
    }


    //刷新显示辅助属性2 列表
    function freshAttrList2(list) {
        var attrList2Html = $.Array.keep(list, function (item, index) {
            return $.String.format(sampleAttrList2, {
                attrname: item.name,
                attrcheck: item.selected == 1 ? "attrCheck" : "attrUnCheck"
            });
        }).join('');
        goodAttrList2.innerHTML = attrList2Html;
    }

    //获取被选中的辅助属性
    function getSelectedAttr(list) {
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected == 1) {
                return list[i].name;
            }
        }
        return "";
    }

    //辅助属性被选中时，处理函数
    function getGoodsAuxDetailInfo(attrName) {

        var fparentid = config.goods.itemid;
        var auxid = 0;
        if (auxType == attrType.noAttr) {
        } else if (auxType == attrType.cmbAttr) {
            auxid = AddGoods_Api.getKeyid(attrName);
            AddGoods_Api.getGoodsAuxDetail(fparentid, auxid, freshAuxInfo);
        } else if (auxType == attrType.soleAttr) {
            var attrname1 = "";
            var attrname2 = "";
            var attrNum = attrList2All.length;
            if (attrNum == 0) { //只有1个辅助属性
                attrname1 = getSelectedAttr(attrList1);
                auxid = AddGoods_Api.getKeyid(attrname1);
                AddGoods_Api.getGoodsAuxDetail(fparentid, auxid, freshAuxInfo);
            } else {
                attrname1 = getSelectedAttr(attrList1);
                attrname2 = getSelectedAttr(attrList2);
                if (attrname1 != "" && attrname2 != "") {
                    attrName = attrname1 + "/" + attrname2;
                    auxid = AddGoods_Api.getKeyid(attrName);
                    AddGoods_Api.getGoodsAuxDetail(fparentid, auxid, freshAuxInfo);
                }
            }
        }
        updateGoodsAuxPrice();
    }


    //如果有针对辅助属性，设置价格策略，则更新对应的价格信息
    function updateGoodsAuxPrice() {
        var dataKey = getAuxDataKey(false);
        if (dataKey == "") {
            return;
        }
        var attrNum = Number($(".divNum .numText2")[0].innerText);
        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, attrNum);
        var oldPrice = AddGoods_Api.getOldPrice(dataKey, attrNum);//马跃

        $("#view-addgoods").find('[data-cmd="price"]').text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price));
        if (auxType != 0) {//非单商品，修改原价 积分--马跃
            $("#view-addgoods").find('[data-cmd="preprice"]').text( kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(oldPrice));
        }

    }

    //根据选中辅助属性 更新库存数量 以及图片信息显示
    function freshAuxInfo(auxlist, flagid) {

        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        if (auxlist) {
            if (auxlist.FImageUrl == "") {
                auxlist.FImageUrl = config.goods.goodsImg;
            }

            var stockinfo = kdAppSet.getStockStr(parseInt(auxlist.FQty), config.goods.unitname);
            var stockmsg = stockinfo.stockStr;
            var stockcolor = stockinfo.color;
            var stockctrl = $(".addgoods .stocknum").find("span");
            stockctrl[0].innerText = stockmsg;
            var color = stockcolor.replace("color:", "");
            stockctrl.css("color", color);
            $(".addgoods #addgoodshead").find("img")[0].src = auxlist.FImageUrl != '' ? (imgMode ? kdAppSet.getImgThumbnail(auxlist.FImageUrl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault);
        } else {
            $(".addgoods .stocknum").find("span")[0].innerText = "";
            $(".addgoods #addgoodshead").find("img")[0].src = imgMode ? 'img/loading.png' : noimgModeDefault;
        }

        if (auxlist) {//接口访问成功，积分情况显示隐藏--马跃
            pointShow(auxlist)
        }

    }

    //积分显示
    function pointShow(auxlist) {
        //价格
        var price = $("#view-addgoods").find('[data-cmd="price"]');
        //orshow
        var orshow = $("#view-addgoods").find('[data-cmd="orshow"]');
        //积分
        var expoint = $("#view-addgoods").find('[data-cmd="expoint"]');
        //原价
        var preprice = $("#view-addgoods").find('[data-cmd="preprice"]');

        //填充积分
        $("#view-addgoods").find('[data-cmd="point"]').text(auxlist.expoint);
        //仅积分兑换
        if (auxlist.onlyexpoint == 1) {
            price.hide();
            orshow.hide();
            expoint.show();
            //preprice.show();
        } else {
            //preprice.hide();
            if (auxlist.expoint == 0) {
                price.show();
                orshow.hide();
                expoint.hide()
            } else {
                price.show();
                orshow.show();
                expoint.show();
            }
        }
    }

    //自动选中辅助属性值
    function autoSelGoods() {
        //只有一个属性值时 自动选中
        if (auxType == attrType.cmbAttr) {
            if (attrList1.length >= 1) {
                var item = $($("#goodAttrList1 .attr")[0]);
                attr1Selected(item);
            }
        } else if (auxType == attrType.soleAttr) {
            if (attrList1.length >= 1 && attrList2.length >= 1) {
                var item = $($("#goodAttrList1 .attr")[0]);
                attr1Selected(item);
                var item2 = $($("#goodAttrList2 .attr2")[0]);
                attr2Selected(item2);
            } else if (attrList1.length >= 1 && attrList2.length == 0) {
                var item = $($("#goodAttrList1 .attr")[0]);
                attr1Selected(item);
            }
        }
    }

    //辅助属性1 选中
    function attr1Selected(selItem) {
        attrChecked(selItem, 1);
        var addgoods = $(".addgoods");
        addgoods.find(".selectAttrs").css("display", "block");
        addgoods.find(".selectAttr1").text('"' + selItem.text() + '"');
        var attrName = selItem.text();
        attrClick(attrName);
        addSelAttr.attr2 = "";
        getGoodsAuxDetailInfo(attrName);
    }

    //辅助属性2 选中
    function attr2Selected(selItem) {
        attrChecked(selItem, 2);
        var addgoods = $(".addgoods");
        addgoods.find(".selectAttrs").css("display", "block");
        addgoods.find(".selectAttr2").text('"' + selItem.text() + '"');
        getGoodsAuxDetailInfo();
    }

    //属性选中 标记
    function attrClick(attrName) {
        if (auxType == attrType.soleAttr) {
            var auxName = dlist.auxName || [];
            var auxTypeNum = auxName.length;
            if (auxTypeNum >= 2) { //有2个辅助属性以上
                var keyvList = [];
                var inum = attrList1All.length;
                //过滤出 存在的辅助属性组合
                for (var i = 0; i < inum; i++) {
                    if (attrName == attrList1All[i]) {
                        keyvList.push(attrList2All[i]);
                    }
                }
                //刷新辅助属性列表2
                var newlist2 = getAttrList2(keyvList);
                freshAttrList2(newlist2);
            }
        }
    }

    //判断之前被选中的 辅助属性2 是否还在新列表中
    function getAttrList2(list) {
        var ikeynum = list.length;
        var jnum = attrList2.length;
        var newlist = [];
        //被选中的辅助属性
        var checkName = "";
        for (var i = 0; i < ikeynum; i++) {
            var item = { name: list[i] };
            for (var j = 0; j < jnum; j++) {
                if (attrList2[j].selected == 1 && list[i] == attrList2[j].name) {
                    item.selected = 1;
                    checkName = attrList2[j].name;
                }
            }
            newlist.push(item);
        }
        attrListSelected(attrList2, checkName);
        if (newlist.length > 1) {
            newlist.sort(NameAsc);
        }
        return newlist;
    }

    //按名字排序
    function NameAsc(x, y) {
        if (x.name > y.name) {
            return 1;
        } else if (x.name < y.name) {
            return -1;
        }
    }

    //辅助属性 列表属性选中
    function attrListSelected(list, attrname) {
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (attrname != "" && list[i].name == attrname) {
                list[i].selected = 1;
            } else {
                list[i].selected = 0;
            }
        }
    }


    //属性选中 css设置,type 1 表示 列表1， 2 表示 列表2
    function attrChecked(attrCtrl, type) {
        attrCtrl.siblings().removeClass("attrCheck");
        attrCtrl.siblings().addClass("attrUnCheck");
        attrCtrl.removeClass("attrUnCheck");
        attrCtrl.addClass("attrCheck");
        var attrname = attrCtrl[0].innerText;
        var list = attrList1;
        if (type == 2) {
            list = attrList2;
        }
        attrListSelected(list, attrname);
    }

    //是否显示加入购物清单
    function showBtnGoodsList(auxtype) {
        /*        //auxtype  0  无辅助属性  1 组合物料  2 有辅助属性
         var addgoods = $(".addgoods");
         var btnAddGoods = addgoods.find("#btnAddGoods");
         var sumlist = addgoods.find("#flySumlist");
         if (auxtype == attrType.noAttr) {
         btnAddGoods.hide();
         sumlist.hide();
         addgoods.find(".btnok").css("background", "#FF6427");
         addgoods.find(".divbody").css({"bottom": "50px"});
         } else {
         btnAddGoods.show();
         sumlist.show();
         addgoods.find(".btnok").css("background", "#aaaaaa");
         addgoods.find(".divbody").css({"bottom": "90px"});
         }*/
    }

    //在没有辅助属性时，打开界面时，汇总信息要自动计算更新
    function freshSumInfoNoAttr() {
        /*        if (auxType == attrType.noAttr) {
         var dataKey = getAuxDataKey(false);
         if (dataKey == "") {
         return;
         }
         var attrNum = Number($(".divNum .numText2")[0].innerText);
         var price = AddGoods_Api.getGoodsAuxPrice(dataKey, attrNum);
         var ctrlp = $(".addgoods .sumlist");
         ctrlp.find("#sum_num").text(attrNum);
         ctrlp.find("#sum_money").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(attrNum, price)));
         $(".addgoods .divhead .price ")[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price);
         }*/
    }

    //获取选中的辅助属性值 , bhint 是否提示选取辅助属性
    function getAuxDataKey(bhint) {
        var dataKey = "";
        var attrNum = 0;
        if (attrList1.length > 0) {
            attrNum += 1;
        }
        if (attrList2.length > 0) {
            attrNum += 1;
        }
        if (!checkSelInfo(attrNum, bhint)) {
            return dataKey;
        }
        switch (attrNum) {
            case 0:
                dataKey = config.goods.goodsName;
                break;
            case 1:
                dataKey = addSelAttr.attr1;
                break;
            case 2:
                dataKey = addSelAttr.attr1 + "/" + addSelAttr.attr2;
                break;
        }
        return dataKey;
    }

    //获取被选中的辅助属性值
    function getAttrNameSelected(list) {
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected == 1) {
                return list[i].name;
            }
        }
        return "";
    }

    //辅助属性 未选择提醒
    function checkSelInfo(auxtype, bhint) {
        switch (auxtype) {
            case attrType.noAttr:
                break;
            case attrType.cmbAttr:
                addSelAttr.attr1 = getAttrNameSelected(attrList1);
                if (addSelAttr.attr1 == "") {
                    var hintstr = attrName1;
                    if (hintstr == "") {
                        hintstr = " 属性值";
                    }
                    if (bhint) {
                        OptMsg.ShowMsg('请选择 ' + hintstr);
                    }
                    return false;
                }
                break;
            case attrType.soleAttr:
                addSelAttr.attr1 = getAttrNameSelected(attrList1);
                if (addSelAttr.attr1 == "") {
                    var hintstr = attrName1;
                    if (hintstr == "") {
                        hintstr = " 属性值";
                    }
                    if (bhint) {
                        OptMsg.ShowMsg('请选择 ' + hintstr);
                    }
                    return false;
                }
                addSelAttr.attr2 = getAttrNameSelected(attrList2);
                if (addSelAttr.attr2 == "") {
                    var hintstr = attrName2;
                    if (hintstr == "") {
                        hintstr = " 属性值";
                    }
                    if (bhint) {
                        OptMsg.ShowMsg('请选择 ' + hintstr);
                    }
                    return false;
                }
                break;
        }
        return true;
    }

    //显示商品的辅助属性
    function showGoodsAttrInfo(datalist, configp) {
        config = configp;
        dlist = AddGoods_Api.getDatalist();
        addGoodsList = AddGoods_Api.getAddGoodsList();
        showItemAuxInfo(datalist);
    }

    function reSetAddGoodsList() {
        addSelAttr = { attr1: "", attr2: "" };
        addGoodsList.length = 0;
    }

    return {
        initView: initView,
        showGoodsAttrInfo: showGoodsAttrInfo,
        addGoodsToList: addGoodsToList,
        reSetAddGoodsList: reSetAddGoodsList
    };

})();