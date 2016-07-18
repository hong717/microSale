/*添加商品到购物车 共用api与数据*/

var AddGoods_Api = (function () {

    var ullist, divList, scroller, config,
    //是否正在调用api
        bloadind,
    //辅助属性数据列表
        dlist,
    //采购清单中的商品
        addGoodsList,
    // 0  无辅助属性  1 组合物料  2 有辅助属性 3套装商品
        attrType = {
            noAttr: 0,
            cmbAttr: 1,
            soleAttr: 2,
            groupAttr: 3
        },
    //当前商品ID
        curGoodsId,
        splitChar,
        auxType,
    //属性1列表
        attrList1,
    //属性1标题
        attrName1,
    //属性2列表
        attrList2,
    //属性2标题
        attrName2,
    //属性1列表 所有值
        attrList1All,
    //属性2列表 所有值
        attrList2All;

    //套装商品列表
    var groupList;

    //初始化视图
    function initView(param) {
        divList = document.getElementById('addgoodsbody');
        scroller = param;
        ullist = $(divList.firstElementChild);
        config = {};
        dlist = {};
        addGoodsList = [];//采购清单列表
        splitChar = "*|*";
        auxType = -1;
        attrName1 = ""; //属性1标题
        attrList1 = []; //属性1列表
        attrName2 = "";//属性2标题
        attrList2 = [];//属性2列表
        attrList1All = []; //属性1列表 所有值
        attrList2All = []; //属性2列表 所有值
        groupList = [];
        curGoodsId = 0;
    }

    //获取商品辅助属性
    function getItemAuxInfo(configp, fn) {
        config = configp;
        if (curGoodsId == config.goods.itemid) {
            fn & fn(dlist, config);
            return;
        }
        reSetAddGoodsList();
        addLoadingHint();
        bloadind = true;
        Lib.API.get('GetItemAuxInfo', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { Itemid: config.goods.itemid }
        }, function (data) {
            bloadind = false;
            dlist = data || {};
            setData(dlist);
            curGoodsId = config.goods.itemid;
            fn & fn(dlist, config);
            removeLoadingHint();
        }, function (code, msg) {
            bloadind = false;
            removeLoadingHint();
            ullist.append('<li class="hintflag">' + msg + '</li>');
            scroller.refresh();
        }, function () {
            bloadind = false;
            removeLoadingHint();
            ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            scroller.refresh();
        }, "");
    }

    //获取某个商品的积分兑换信息
    function getItemPoint(itemid) {
        var expoint = dlist.expoint || 0;
        var onlyexpoint = dlist.onlyexpoint || 0;
        var unitid = dlist.unitid || 0;
        var unitname = dlist.unitname || '';
        if (auxType == attrType.cmbAttr) {
            //如果是合并商品
            var auxlist = dlist.auxlist || [];
            for (var i = 0, len = auxlist.length; i < len; i++) {
                if (itemid == auxlist[i].fitemid) {
                    expoint = auxlist[i].expoint || 0;
                    onlyexpoint = auxlist[i].onlyexpoint || 0;
                    unitid = auxlist[i].funitid || 0;
                    unitname = auxlist[i].funitname || '';
                    break;
                }
            }
        }
        return {
            expoint: expoint,
            onlyexpoint: onlyexpoint,
            unitid: unitid,
            unitname: unitname
        };
    }

    //获取商品辅助属性详情 比如 库存信息 图片 单位
    function getGoodsAuxDetail(itemid, auxid, fn) {
        var flagid = itemid;
        if (auxid) {
            flagid = itemid + auxid;
        }
        fn & fn();
        Lib.API.get('GetItemDetailInfo', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { Itemid: itemid, Auxid: auxid }
        }, function (data) {
            var auxlist = data || [];
            fn & fn(auxlist, flagid);
        }, null, null, flagid);
    }

    //移除加载中的提示
    function removeLoadingHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    //添加加载中的提示
    function addLoadingHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
    }

    function apiLoading() {
        return bloadind;
    }

    function reSetAddGoodsList() {
        attrList1 = [];
        attrName1 = "";
        attrList2 = [];
        attrName2 = "";
        attrList1All = [];
        attrList2All = [];
        groupList = [];
    }


    function addAttrList(attrList, keyv) {
        var inum = attrList.length;
        var bexist = false;
        for (var i = 0; i < inum; i++) {
            if (attrList[i].name == keyv) {
                bexist = true;
                break;
            }
        }
        if (!bexist) {
            attrList.push({ name: keyv });
        }
    }

    //按名字排序
    function NameAsc(x, y) {
        if (x.name > y.name) {
            return 1;
        } else if (x.name < y.name) {
            return -1;
        }
        return 0;
    }

    function setData(datalist) {

        auxType = datalist.auxType; // 0  无辅助属性  1 组合物料  2 有辅助属性 3套装商品
        var auxName = datalist.auxName || [];
        if (auxName.length == 1) {
            attrName1 = auxName[0].FName;
        } else if (auxName.length == 2) {
            attrName1 = auxName[0].FName;
            attrName2 = auxName[1].FName;
        }
        if (auxType == attrType.noAttr) {
        } else if (auxType == attrType.cmbAttr) {//合并商品
            var auxlist = datalist.auxlist || [];
            var inum = auxlist.length;
            for (var i = 0; i < inum; i++) {
                var item = auxlist[i];
                addAttrList(attrList1, item.fnameaftermerge);
                //批量录入缓存用
                attrList1All.push(item.fnameaftermerge);
            }
        } else if (auxType == attrType.soleAttr) {//商品有辅助属性
            //拆分处理 辅助属性
            var auxName = datalist.auxName || [];
            var auxUsed = datalist.auxUsed || [];
            var auxTypeNum = auxName.length;
            var iauxNum = auxUsed.length;
            for (var i = 0; i < iauxNum; i++) {
                var item = auxUsed[i];
                if (auxTypeNum == 1) {
                    //有1个辅助属性
                    addAttrList(attrList1, item.fvalue);
                    attrList1All.push(item.fvalue);
                } else {
                    //有2个以上辅助属性
                    var fattrStr = item.fvalue;
                    var attrlist = fattrStr.split(splitChar);
                    var jnum = attrlist.length;
                    addAttrList(attrList1, attrlist[0]);
                    attrList1All.push(attrlist[0]);
                    var attrStr2 = "";
                    for (var j = 1; j < jnum; j++) {
                        if (attrStr2 == "") {
                            attrStr2 = attrlist[j];
                        } else {
                            attrStr2 = attrStr2 + "/" + attrlist[j];
                        }
                    }
                    addAttrList(attrList2, attrStr2);
                    attrList2All.push(attrStr2);
                }
            }
        } else if (auxType == attrType.groupAttr) {//套装商品
            groupList = formatList(datalist);
        }

        if (attrList1.length > 1) {
            attrList1.sort(NameAsc);
        }
        if (attrList2.length > 1) {
            attrList2.sort(NameAsc);
        }
    }

    //分组套装商品
    function formatList(dlist) {
        var auxlist = dlist.auxlist || [];
        var glist = [];
        var len = auxlist.length;
        for (var i = 0; i < len; i++) {
            pushItem(auxlist[i], glist);
        }
        return glist;
    }

    function pushItem(item, list) {

        var len = list.length;
        for (var i = 0; i < len; i++) {
            if (list[i].groupId == item.fgroupid) {
                list[i].attrList.push(item);
                return;
            }
        }
        list.push({
            groupId: item.fgroupid,
            groupName: item.fgroupname,
            attrList: [item]
        });
    }

    //获取商品原价
    function getOldPrice(datakey) {
        var Price = config.goods.price;
        if (auxType > 0) {//非单商品
            var dataKey = datakey;
            if (dataKey != "") {
                //获取某个辅助属性的价格策略
                var priceList = getKeyValueInfo(3, dataKey);
                var auxPrice = getOldPriceByStrategy(priceList);
                if (auxPrice >= 0) {
                    return auxPrice;
                }
            }
        }

        //获取某个商品的价格策略
        var priceList2 = dlist || [];
        var goodsPrice = getOldPriceByStrategy(priceList2);
        if (goodsPrice >= 0) {
            return goodsPrice;
        }
        return Price;
    }

    //根据对应商品获取原价
    function getOldPriceByStrategy(priceList) {
        var oldrice;
        var inum = priceList.fstrategy.length;
        if (inum == 0) {
            oldrice = priceList.fmaxprice;
        } else {
            oldrice = priceList.fstrategy[inum - 1].price;
        }
        return oldrice;
    }


    //如果有针对辅助属性，设置价格策略，则获取价格信息
    function getGoodsAuxPrice(datakey, attrnum) {
        var Price = config.goods.price;
        var attrNum = attrnum;
        if (auxType > 0) {
            var dataKey = datakey;
            if (dataKey != "") {
                //获取某个辅助属性的价格策略
                var priceList = getKeyValueInfo(2, dataKey);
                var auxPrice = getPriceByStrategy(priceList, attrNum);
                if (auxPrice >= 0) {
                    return auxPrice;
                }
            }
        }

        //获取某个商品的价格策略
        var priceList2 = dlist.fstrategy || [];
        var goodsPrice = getPriceByStrategy(priceList2, attrNum);
        if (goodsPrice >= 0) {
            return goodsPrice;
        }
        return Price;
    }


    //根据关键字 获取选中的辅助属性 各种关键值
    function getKeyValueInfo(keyType, dataKey) {
        //keyType 1 辅助属性ID ,  2 辅助属性 价格策略,  keyType  3（马跃）辅助属性商品信息
        if (auxType == attrType.soleAttr) { //有辅助属性
            var inum = attrList1All.length;
            var jnum = attrList2All.length;
            for (var i = 0; i < inum; i++) {
                var cmpv = attrList1All[i];
                if (jnum > 0) {
                    cmpv = cmpv + "/" + attrList2All[i];
                }
                if (dataKey == cmpv) {
                    if (keyType == 1) {
                        return dlist.auxUsed[i].fitemid;
                    } else if (keyType == 2) {
                        return dlist.auxUsed[i].fstrategy || [];
                    } else if (keyType == 3) {
                        return dlist.auxUsed[i] || [];
                    }
                }
            }
        } else if (auxType == attrType.cmbAttr) {  //合并商品
            var auxlist = dlist.auxlist;
            var knum = auxlist.length;
            for (var k = 0; k < knum; k++) {
                if (dataKey == auxlist[k].fnameaftermerge) {
                    if (keyType == 1) {
                        return auxlist[k].fitemid;
                    } else if (keyType == 2) {
                        return auxlist[k].fstrategy || [];
                    } else if (keyType == 3) {
                        return auxlist[k] || [];
                    }
                }
            }
        }
        return 0;
    }


    //根据价格策略，以及数量 返回单价
    function getPriceByStrategy(priceList, num) {
        var inum = priceList.length;
        for (var i = 0; i < inum; i++) {
            var min = priceList[i].min || 0;
            if (priceList[i].max != undefined) {
                max = priceList[i].max;
            } else {
                max = 1000000000;
            }
            if (num >= min && num <= max) {
                return priceList[i].price;
            }
        }
        return -1;
    }


    //加入购物清单 数据缓存
    function addGoodsDataToCache(dataKey, numAdd, price, bAnimation) {
        var inum = addGoodsList.length - 1;
        var isum = 0;
        var isummoney = 0;
        var itmp = 0;
        for (var i = inum; i >= 0; i--) {
            if (addGoodsList[i].name == dataKey) {
                addGoodsList.splice(i, 1);
            } else {
                isum = isum + Number(addGoodsList[i].num);
                itmp = kdShare.calcMul(Number(addGoodsList[i].num), Number(addGoodsList[i].price));
                isummoney = kdShare.calcAdd(isummoney, itmp);
            }
        }

        isum = isum + numAdd;
        isummoney = kdShare.calcAdd(isummoney, kdShare.calcMul(numAdd, price));
        if (numAdd > 0) {
            var auxid = 0;
            var itemid = 0;
            if (auxType == attrType.soleAttr) {//有辅助属性
                auxid = getKeyid(dataKey);
            } else if (auxType == attrType.cmbAttr) {
                itemid = getKeyid(dataKey);
            }
            var pointsInfo = getItemPoint(itemid);
            var addObj = {
                name: dataKey, num: numAdd, fauxid: auxid, fitemid: itemid,
                price: price, expoint: pointsInfo.expoint, onlyexpoint: pointsInfo.onlyexpoint,
                unitid:pointsInfo.unitid,unitname:pointsInfo.unitname
            };
            addGoodsList.push(addObj);
        }
        return {
            numAdd: numAdd,
            isum: isum,
            isummoney: isummoney
        }
    }

    //套装商品 加入购物清单 数据缓存
    function addGroupData(numAdd) {
        var inum = addGoodsList.length - 1;
        var knum = groupList.length - 1;
        var item;
        var gindex;
        var price;
        for (var k = 0; k <= knum; k++) {
            gindex = groupList[k].selIndex;
            item = groupList[k].attrList[gindex];
            for (var i = inum; i >= 0; i--) {
                if (addGoodsList[i].fitemid == item.fitemid) {
                    addGoodsList.splice(i, 1);
                }
            }
            price=getPriceByStrategy(item.fstrategy,numAdd);
            var addObj = {
                name: item.fnameaftermerge, num: numAdd, fauxid: 0, fitemid: item.fitemid,
                price: price, expoint: item.expoint, onlyexpoint: item.onlyexpoint,
                groupid: item.fgroupid, parentid: item.fparentid, unitid: item.funitid, unitname: item.funitname
            };
            addGoodsList.push(addObj);
        }
    }

    //根据关键字 获取选中的 辅助属性ID
    function getKeyid(dataKey) {
        return getKeyValueInfo(1, dataKey);
    }

    return {
        initView: initView,
        getItemAuxInfo: getItemAuxInfo,
        getGoodsAuxDetail: getGoodsAuxDetail,
        getGoodsAuxPrice: getGoodsAuxPrice,
        getKeyid: getKeyid,
        addGoodsDataToCache: addGoodsDataToCache,
        addGroupData: addGroupData,
        apiLoading: apiLoading,
        getOldPrice: getOldPrice,//获取原价
        getPriceByStrategy: getPriceByStrategy,
        getOldPriceByStrategy: getOldPriceByStrategy,
        getDatalist: function () {
            return dlist;
        },
        getAddGoodsList: function () {
            return addGoodsList;
        },
        getData: function () {
            return {
                auxType: auxType,
                attrType: attrType,
                attrName1: attrName1,
                attrList1: attrList1,
                attrName2: attrName2,
                attrList2: attrList2,
                attrList1All: attrList1All,
                attrList2All: attrList2All,
                groupList: groupList
            };
        }
    };

})();