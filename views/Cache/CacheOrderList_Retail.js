/*购物车 订单显示界面 零售用户获取促销信息*/
var CacheOrderList_Retail = (function () {

    var samples,
        listData,
        listUl,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            listUl = document.getElementById('cacheOrderList_ul');
            $(listUl).addClass('goodsdetail');
            samples = $.String.getTemplates(listUl.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--2',
                    end: '2-->'
                },
                {
                    name: 'good',
                    begin: '#--good.begin--#',
                    end: '#--good.end--#',
                    outer: '{goods}'
                },
                {
                    name: 'goodli',
                    begin: '#--goodli.begin--#',
                    end: '#--goodli.end--#',
                    outer: '{goodsli}'
                },
                {
                    name: 'gift',
                    begin: '#--gift.begin--#',
                    end: '#--gift.end--#',
                    outer: '{gifts}'
                },
                {
                    name: 'giftli',
                    begin: '#--giftli.begin--#',
                    end: '#--giftli.end--#',
                    outer: '{giftsli}'
                }
            ]);
            hasInit = true;
        }
    }

    //返回商品名称，增加了积分兑换的信息
    function getGoodsPoint(item) {
        var extInfo = '';
        if (item.expoint > 1) {
            if (item.onlyexpoint == 1) {
                extInfo = ' 仅限' + item.expoint + '积分';
            } else {
                extInfo = ' 可用' + item.expoint + '积分';
            }
        }
        return  extInfo;
    }

    //刷新商品列表数据
    function fill(list, scroller) {

        if (list.length == 0) {
            listUl.innerHTML = '';
            scroller.refresh();
            return;
        }

        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        var headTitleHide = '';
        //只有普通商品时  隐藏标题
        if (list.length == 1 && list[0].name == '普通商品') {
            headTitleHide = 'hide';
        }

        listUl.innerHTML = $.Array.map(list, function (item, index) {

            var goodList = item.list;
            var giftList = item.giftList;
            var allPro = item.all || 0; //是否是全场类促销 1表示全场促销
            var moneyStr = kdAppSet.formatMoneyStr(item.money);
            var oldMoneyStr = kdAppSet.formatMoneyStr(item.oldMoney);
            var hideStr = '';
            if (item.money == item.oldMoney) {
                hideStr = 'hide';
            }
            if (allPro == 1) {
                oldMoneyStr = '';
                hideStr = 'hide';
                moneyStr = '-' + kdAppSet.formatMoneyStr(item.rateMoney);
            }

            return $.String.format(samples['li'], {
                'protitle': item.name,
                'sumtitle': item.title,
                'proInfo': item.proInfo,
                'headTitleHide': headTitleHide,
                'titleHide': (item.title == '' || headTitleHide == 'hide' || moneyStr == '-0') ? 'hide' : '',
                'hide': hideStr,
                'sumMoney': oldMoneyStr,
                'sumMoneyDiscount': moneyStr,
                'goods': $.Array.map([""], function () {
                        return $.String.format(samples['good'], {
                            'goodsli': $.Array.map(goodList, function (good) {
                                    return $.String.format(samples['goodli'], {
                                        'goodsname': good.name,
                                        'pointShow': good.expoint == 0 ? 'hide' : '',
                                        'expoint': getGoodsPoint(good),
                                        'goodsimg': good.img == "" ? (imgMode ? "img/no_img.png" : noimgModeDefault) : (imgMode ? kdAppSet.getImgThumbnail(good.img) : noimgModeDefault),
                                        'price': kdAppSet.formatMoneyStr(good.onlyexpoint == 1 ? 0 : good.price),
                                        'num': kdAppSet.clearZero(good.num),
                                        'money': kdAppSet.formatMoneyStr(good.onlyexpoint == 1 ? 0 : good.money)
                                    });
                                }
                            ).join('')
                        });
                    }
                ).join(''),
                'gifts': $.Array.map([""], function () {
                        return $.String.format(samples['gift'], {
                            'gifthide': giftList.length == 0 ? 'hide' : '',
                            'giftsli': $.Array.map(giftList, function (gift) {
                                    return $.String.format(samples['giftli'], {
                                        'giftname': gift.name,
                                        'giftnum': kdAppSet.clearZero(gift.num)
                                    });
                                }
                            ).join('')
                        });
                    }
                ).join('')
            });
        }).join('');
        scroller.refresh(250);
    }


    //调用促销接口的商品列表数据
    function getListData(data) {
        var tempdata = [];
        var inum = data.length;
        var recDate = '';
        for (var i = 0; i < inum; i++) {
            var iauxtype = data[i].auxtype;
            if (iauxtype == 0) {
                var temp = {};
                temp.itemid = data[i].itemid;
                var attrList0 = data[i].attrList;
                temp.qty = attrList0[0].num;
                temp.price = attrList0[0].price;
                temp.orgPrice = attrList0[0].price;

                temp.IsOverseas = data[i].isoverseas;
                temp.UnitID = data[i].unitid;
                temp.AuxID = 0;
                temp.DeliverDate = recDate;

                temp.img = data[i].img;
                temp.name = data[i].name;
                temp.unitname = data[i].unitname;

                temp.expoint = data[i].expoint || 0;
                temp.onlyexpoint = data[i].onlyexpoint || 0;

                var attrListg = data[i].attrList || [];
                if (attrListg.length > 0) {
                    temp.expoint = attrListg[0].expoint || 0;
                    temp.onlyexpoint = attrListg[0].onlyexpoint || 0;
                }
                temp.ParentID = '';
                temp.GroupID = '';
                tempdata.push(temp);
            } else if (iauxtype == 1) {
                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    var temp1 = {};
                    temp1.itemid = attrList1[j].fitemid;
                    temp1.qty = attrList1[j].num;
                    temp1.price = attrList1[j].price;
                    temp1.orgPrice = attrList1[j].price;

                    temp1.IsOverseas = data[i].isoverseas;
                    temp1.UnitID = attrList1[j].unitid;
                    temp1.unitname = attrList1[j].unitname;
                    temp1.AuxID = 0;
                    temp1.DeliverDate = recDate;

                    temp1.img = data[i].img;
                    temp1.name = MiniQuery.Object.clone(data[i].name + ' - ' + attrList1[j].name);

                    temp1.expoint = attrList1[j].expoint || 0;
                    temp1.onlyexpoint = attrList1[j].onlyexpoint || 0;
                    temp1.ParentID = data[i].itemid;
                    temp1.GroupID = '';
                    tempdata.push(temp1);
                }
            } else if (iauxtype == 2) {
                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    var temp2 = {};
                    temp2.itemid = data[i].itemid;
                    temp2.qty = attrList2[k].num;
                    temp2.price = attrList2[k].price;
                    temp2.orgPrice = attrList2[k].price;

                    temp2.IsOverseas = data[i].isoverseas;
                    temp2.UnitID = data[i].unitid;
                    temp2.AuxID = attrList2[k].fauxid;
                    temp2.DeliverDate = recDate;

                    temp2.img = data[i].img;
                    temp2.name = MiniQuery.Object.clone(data[i].name + ' - ' + attrList2[k].name);
                    temp2.unitname = data[i].unitname;

                    temp2.expoint = attrList2[k].expoint || 0;
                    temp2.onlyexpoint = attrList2[k].onlyexpoint || 0;
                    temp2.ParentID = '';
                    temp2.GroupID = '';
                    tempdata.push(temp2);
                }
            } else if (iauxtype == 3) {

                var attrList3 = data[i].attrList;
                var hnum = attrList3.length;
                for (var h = 0; h < hnum; h++) {
                    var temp3 = {};
                    temp3.itemid = attrList3[h].fitemid;
                    temp3.qty = attrList3[h].num;
                    temp3.price = attrList3[h].price;
                    temp3.orgPrice = attrList3[h].price;

                    temp3.IsOverseas = data[i].isoverseas;
                    temp3.UnitID = attrList3[h].unitid;
                    temp3.AuxID = 0;
                    temp3.DeliverDate = recDate;
                    temp3.img = data[i].img;
                    temp3.name = MiniQuery.Object.clone(data[i].name + ' - ' + attrList3[h].name);
                    temp3.unitname = MiniQuery.Object.clone(attrList3[h].unitname);

                    temp3.expoint = attrList3[h].expoint || 0;
                    temp3.onlyexpoint = attrList3[h].onlyexpoint || 0;

                    temp3.ParentID = attrList3[h].parentid;
                    temp3.GroupID = attrList3[h].groupid;
                    tempdata.push(temp3);
                }

            }
        }
        return tempdata;
    }

    /*
     //合并相同itemid的商品
     function unionGoods(list) {
     var inum = list.length;
     var tempdata = [];
     for (var i = 0; i < inum; i++) {
     var item = list[i];
     var jnum = tempdata.length;
     var bcheck = false;
     for (var j = 0; j < jnum; j++) {
     if (item.itemid == tempdata[j].itemid) {
     tempdata[j].qty = tempdata[j].qty + item.qty;
     bcheck = true;
     break;
     }
     }
     if (!bcheck) {
     tempdata.push({
     itemid: item.itemid,
     qty: item.qty,
     price: item.price,
     expoint: item.expoint,
     onlyexpoint: item.onlyexpoint
     });
     }
     }
     return tempdata;
     }
     */

/*
    //当同一个商品在不同 auxtype 类型中，出现时，取最高价
    function getMaxPrice(list){
        var inum = list.length;
        var maxPrice = 0;
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            var jnum = tempdata.length;
            var bcheck = false;
            for (var j = 0; j < jnum; j++) {
                if (item.itemid == tempdata[j].itemid && item.ParentID == tempdata[j].ParentID) {
                    tempdata[j].qty = tempdata[j].qty + item.qty;
                    bcheck = true;
                    break;
                }
            }

        }
        return tempdata;
    }
*/



    //合并相同itemid的商品
    function unionGoods(list) {
        var inum = list.length;
        var tempdata = [];
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            var jnum = tempdata.length;
            var bcheck = false;
            for (var j = 0; j < jnum; j++) {
                if (item.itemid == tempdata[j].itemid && item.ParentID == tempdata[j].ParentID) {
                    tempdata[j].qty = tempdata[j].qty + item.qty;
                    bcheck = true;
                    break;
                }
            }
            if (!bcheck) {
                tempdata.push({
                    ParentID: item.ParentID,
                    itemid: item.itemid,
                    qty: item.qty,
                    price: item.price,
                    expoint: item.expoint,
                    onlyexpoint: item.onlyexpoint
                });
            }
        }
        return tempdata;
    }

    //构造类似促销接口返回的数据结构
    function getGoodsList(list) {

        var goodslist = setPromotionData(list);
        var iteminfo = {
            discount: [],
            gift: [],
            gifttypecount: 0,
            list: goodslist,
            promotionid: "0",
            promotionname: "普通商品",
            row: 0
        };
        var itemlist = [iteminfo];
        var moeny = getSumMoney(goodslist);
        var para = {
            amount: moeny,
            discountamount: moeny
        };
        return  {
            alllist: [],
            itemlist: itemlist,
            para: para
        };
    }

    //当有仅限积分兑换时 计算金额总计
    function getSumMoney(aData) {
        var sumMoney = 0;
        for (var i in aData) {
            var item = aData[i];
            sumMoney += item.onlyexpoint == 1 ? 0 : item.price * item.qty;
        }
        return sumMoney;
    }

    //不调用促销接口时，设置商品折后价格
    function setPromotionData(data) {
        var aData = MiniQuery.Object.clone(data);
        var list = [];
        for (var i in aData) {
            var item = aData[i];
            item.promotionID = 0;
            item.discountprice = item.price;
            /*            if (item.onlyexpoint == 1) {
             //仅限积分兑换 价格设置为0
             item.discountprice = 0;
             item.price = 0;
             } else {
             item.discountprice = item.price;
             }*/
            list.push(item);
        }
        return list;
    }

    function getDataByAuxType(data) {
        var tempdata = [];
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var iauxtype = data[i].auxtype;
            if (iauxtype == 0) {
                tempdata.push({
                    itemid: data[i].itemid,
                    auxtype: iauxtype
                });
            } else if (iauxtype == 1) {
                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    tempdata.push({
                        itemid: attrList1[j].fitemid,
                        auxtype: iauxtype
                    });
                }
            } else if (iauxtype == 2) {
                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    tempdata.push({
                        itemid: data[i].itemid,
                        auxtype: iauxtype
                    });
                    break;
                }
            } else if (iauxtype == 3) {
                var attrList3 = data[i].attrList;
                var hnum = attrList3.length;
                for (var h = 0; h < hnum; h++) {
                    tempdata.push({
                        itemid: attrList3[h].fitemid,
                        auxtype: iauxtype
                    });
                }
            }
        }
        return tempdata;
    }

    //检测商品类型auxtype是否重复
    function checkAuxTypeRepeat(data) {
        var tdata = getDataByAuxType(data);
        var len = tdata.length;
        for (var i = 0; i < len; i++) {
            for (var j = i+1; j < len; j++) {
                if(tdata[i].itemid==tdata[j].itemid  && tdata[i].auxtype!=tdata[j].auxtype ){
                    return true;
                }
            }
        }
        return false;
    }

    //expoints  商品的兑换积分   fn回调函数
    function getPromotion(list, scroller, fn, billInfo, expoints) {
        initView();
        kdAppSet.setKdLoading(true, "获取促销信息...");
        var user = kdAppSet.getUserInfo();
        listData = getListData(list);
        var listData2 = unionGoods(listData);
        //1 使用积分兑换,不走促销流程
        //2 当同一个商品在， 同时出现在 单品，合并商品，套装商品中的任意2个时，不允许使用促销策略
         var bRepeat = checkAuxTypeRepeat(list);

        if (expoints > 0 || bRepeat) {
            var data = getGoodsList(listData2);
            freshViewList(data, scroller, fn, billInfo);
            setTimeout(2000, function () {
                scroller.refresh();
            });
            return;
        }

        var paraData = {
            'shopid': user.storeid,
            'vipid': user.vipid,
            'list': listData2
        };
        var para = {para: paraData};
        var apiname = 'GetPromotionForOrder';
        Lib.API.get(apiname, para,
            function (data, json) {
                freshViewList(data, scroller, fn, billInfo);
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function (errcode) {
                kdAppSet.setKdLoading(false);
                jAlert(kdAppSet.getAppMsg.workError + "!错误编码 " + errcode);
            });
    }

    function freshViewList(data, scroller, fn, billInfo) {
        try {
            var para = data.para || {};
            var billPoint = para.points || 0;
            if (billPoint < 0) {
                billPoint = 0;
            }
            ;
        } catch (e) {
        }
        kdAppSet.setKdLoading(false);
        $('#summitOrder').show();
        listData = DataHelp.formatList(listData, data);
        fill(listData, scroller);
        var sum = DataHelp.formatSum(data);
        billInfo.money = sum.proMoney;
        var totalMoney = '￥' + kdAppSet.formatMoneyStr(sum.proMoney);
        $('.view_cacheOrderList [data-cmd="totalMoney"]')[0].innerText = totalMoney;
        var totalMoneyOrg = '';
        if (sum.proMoney != sum.oldMoney) {
            totalMoneyOrg = '￥' + kdAppSet.formatMoneyStr(sum.oldMoney);
        }
        $('.view_cacheOrderList [data-cmd="totalMoneyOrg"]')[0].innerText = totalMoneyOrg;
        $("#viewid_cacheOrderList").find(".divbillmoney span").text(totalMoney);
        fn && fn(billPoint);
    }

    function getSubmitData() {
        var tempdata = [];
        var data = listData;
        var inum = data.length;
        for (var i = 0; i < inum; i++) {

            var item = data[i];
            var goodList = item.list;
            var giftList = item.giftList;

            var alist = getSubmitDataList(goodList);
            if (alist.length > 0) {
                tempdata = tempdata.concat(alist);
            }
            var alist2 = getSubmitDataList(giftList);
            if (alist2.length > 0) {
                tempdata = tempdata.concat(alist2);
            }
        }
        return tempdata;
    }

    function getFreightData() {
        var tempdata = [];
        var data = listData;
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var item = data[i];
            var goodList = item.list;
            var alist = getFreightDataList(goodList);
            if (alist.length > 0) {
                tempdata = tempdata.concat(alist);
            }
        }
        return tempdata;
    }

    function getFreightDataList(list) {
        var tempdata = [];
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            tempdata.push({
                ParentID: item.ParentID || '',
                ItemID: item.itemid,
                Qty: item.qty,
                Price: item.discountPrice
            });
        }
        return tempdata;
    }

    function getSubmitDataList(list) {
        var tempdata = [];
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            var temp = {};
            temp.MaterialID = item.itemid;
            temp.IsOverseas = item.IsOverseas;
            temp.UnitID = item.UnitID;
            temp.AuxID = item.AuxID;
            temp.Qty = item.num;
            temp.Price = item.orgPrice;
            temp.DiscountPrice = item.discountPrice;
            temp.IsGift = item.gift || 0;
            temp.ActivityID = item.promotionid;
            temp.DeliverDate = '';
            //前端计算金额使用
            temp.expoint = item.expoint || 0;
            temp.onlyexpoint = item.onlyexpoint || 0;
            temp.GroupID = item.GroupID || '';
            temp.ParentID = item.ParentID || '';
            tempdata.push(temp);
        }
        return tempdata;
    }


    //对促销返回的数据进行格式化
    var DataHelp = (function () {

        var Object = MiniQuery.Object;

        //获取一般促销方案商品列表
        function getProList1(list, itemlist) {
            var listdata = [];
            for (var i = 0, len = itemlist.length; i < len; i++) {
                var item = itemlist[i];
                var extInfo = '';
                var list2 = getList(item.list, item.gift, list);
                var giftCount = item.gifttypecount || 0;
                var giftList = [];
                if (item.gift.length > 0) {
                    giftList = getGiftList(item.gift);
                }
                var sum = getListSum(list2);
                var money = getMoney(sum.money, item.discount);
                if (item.discount && item.discount.length > 0) {
                    var disitem = item.discount[0];
                    if (disitem.type == 0) {
                        extInfo = ' (' + kdAppSet.clearZero(disitem.value) + '折优惠)';
                    } else if (disitem.type == 1) {
                        extInfo = ' (优惠' + kdAppSet.clearZero(disitem.value) + '元)';
                    }
                }
                var promotion = {
                    'name': item.promotionname || '',
                    'giftCount': giftCount, //赠品数量
                    'giftList': giftList, //赠品列表
                    'money': money, //优惠后金额
                    'oldMoney': sum.money, //优惠前金额
                    'rateMoney': sum.money - money, //优惠金额
                    'title': '小计:',
                    'proInfo': extInfo,
                    'list': list2
                };
                listdata.push(promotion);
            }
            return listdata;
        }


        //获取全场促销方案商品列表  money商品列表的总优惠价
        function getProList2(money, itemlist) {

            var listdata = [];
            var money2 = 0;
            var money3 = 0;
            for (var i = 0, len = itemlist.length; i < len; i++) {
                var item = itemlist[i];
                var list2 = getList([], item.gift, []);
                var disList = item.discount || [];
                var disItem = {};
                var onlyGift = 1;
                if (disList.length > 0) {
                    disItem = disList[0];
                    onlyGift = 0;
                }
                var title = getTitle(disItem);
                if (i == 0) {
                    money2 = money;
                } else {
                    money2 = money3;
                }
                money3 = getRateMoney(money2, disItem);
                var giftCount = item.gifttypecount || 0;
                var giftList = [];
                if (item.gift.length > 0) {
                    giftList = getGiftList(item.gift);
                }
                var promotion = {
                    'name': item.promotionname || '',
                    'giftCount': giftCount, //赠品数量
                    'giftList': giftList, //赠品列表
                    'money': money3, //优惠后金额
                    'oldMoney': money2, //优惠前金额
                    'all': 1, //表示属于全场促销 的赠品类  计算金额 不要重复加
                    'rateMoney': money2 - money3, //优惠金额
                    'title': '小计:',
                    'proInfo': title,
                    'onlyGift': onlyGift,
                    'list': list2
                };
                listdata.push(promotion);
            }
            return listdata;
        }


        //计算所有促销方案的合计 优惠金额
        function getAllMoney(list) {
            var money = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                money = money + list[i].money;
            }
            return money;
        }

        //计算某个促销方案的小计 优惠金额
        function getMoney(money, list) {
            for (var i = 0, len = list.length; i < len; i++) {
                money = getRateMoney(money, list[i]);
            }
            return money;
        }

        //计算某个优惠方案的 优惠金额
        function getRateMoney(money, item) {
            if (item.type == 0) {
                money = money * item.value / 10;
            } else if (item.type == 1) {
                money = money - item.value;
            }
            return money;
        }

        //获取小计标题头
        function getTitle(item) {
            var title = '';
            if (item.type == 0) {
                title = '(' + kdAppSet.clearZero(item.value) + '折)';
            } else if (item.type == 1) {
                title = '(优惠' + kdAppSet.clearZero(item.value) + '元)';
            }
            return title;
        }

        //itemlist  按促销分类的商品列表  gift 赠品列表  list 原商品列表
        function getList(itemlist, gift, list) {
            var listdata = [];
            var item = {};
            for (var i = 0, len = itemlist.length; i < len; i++) {
                item = getGoodsItem(list, itemlist[i]);
                if (item) {
                    if (item instanceof  Array) {
                        listdata = listdata.concat(item);
                    } else {
                        listdata.push(item);
                    }
                }
            }
            return listdata;
        }

        //如果商品是仅限积分兑换 要把金额去掉
        function setItem(item) {
            /*            if (item.onlyexpoint == 1) {
             item.price = 0;
             item.money = 0;
             item.discountPrice = 0;
             item.discountMoney = 0;
             }*/
            return item;
        }

        //list 原商品列表 ,item 促销方案商品
        function getGoodsItem(list, item) {
            var itemid = item.itemid;
            var proNum = item.qty;
            if (item.discountprice < 0) {
                item.discountprice = 0;
            }
            var aitem = null;
            //商品id跟数量刚好匹配
            for (var j = 0, len2 = list.length; j < len2; j++) {
                if (itemid == list[j].itemid && list[j].hasMatch != 1 && proNum == list[j].qty) {
                    list[j].hasMatch = 1;
                    list[j].num = item.qty;
                    list[j].promotionid = item.promotionID;
                    list[j].money = list[j].price * list[j].num;
                    list[j].discountMoney = item.discountprice * list[j].num;
                    list[j].discountPrice = item.discountprice;
                    aitem = Object.clone(list[j]);
                    return setItem(aitem);
                }
            }
            //商品id跟数量,能找到原商品数量大于促销方案数量的
            for (var j = 0, len2 = list.length; j < len2; j++) {
                if (itemid == list[j].itemid && list[j].hasMatch != 1) {
                    if (list[j].qty > proNum) {
                        list[j].num = item.qty;
                        list[j].promotionid = item.promotionID;
                        list[j].money = list[j].price * list[j].num;
                        list[j].discountMoney = item.discountprice * list[j].num;
                        list[j].discountPrice = item.discountprice;
                        aitem = Object.clone(list[j]);
                        list[j].qty = list[j].qty - proNum; //减去已经匹配的数量
                        return setItem(aitem);
                    }
                }
            }
            //商品id跟数量,需要多个原商品数量相加才能等于促销方案数量
            var sumNum = 0;
            var alist = [];
            for (var j = 0, len2 = list.length; j < len2; j++) {
                if (itemid == list[j].itemid && list[j].hasMatch != 1) {
                    sumNum = sumNum + list[j].qty;
                    if (sumNum >= proNum) {
                        if (sumNum == proNum) {
                            list[j].hasMatch = 1;
                            list[j].num = list[j].qty;
                        } else {
                            list[j].num = list[j].qty - (sumNum - proNum);
                        }
                        list[j].promotionid = item.promotionID;
                        list[j].money = list[j].price * list[j].num;
                        list[j].discountMoney = item.discountprice * list[j].num;
                        list[j].discountPrice = item.discountprice;
                        aitem = Object.clone(list[j]);
                        alist.push(setItem(aitem));
                        return alist;
                    } else {
                        list[j].hasMatch = 1;
                        list[j].num = list[j].qty;
                        list[j].promotionid = item.promotionID;
                        list[j].money = list[j].price * list[j].num;
                        list[j].discountMoney = item.discountprice * list[j].num;
                        list[j].discountPrice = item.discountprice;
                        aitem = Object.clone(list[j]);
                        alist.push(setItem(aitem));
                    }
                }
            }

            return null;
        }

        // gift 赠品列表
        function getGiftList(gift) {
            var listdata = [];
            var item = {};
            for (var i = 0, len = gift.length; i < len; i++) {
                item = formatItem(gift[i]);
                if (item.default == 1) {
                    item.money = 0;
                    item.num = item.qty;
                    item.discountPrice = 0;
                    item.discountMoney = 0;
                    listdata.push(Object.clone(item));
                }
            }
            return listdata;
        }

        //格式化赠品数据
        function formatItem(item) {
            return {
                'itemid': item.itemid,
                'promotionid': item.promotionID,
                'qty': item.qty,
                'model': item.model,
                'price': item.saleprice,
                'orgPrice': item.saleprice,
                'money': item.qty * item.saleprice,
                'name': item.name,
                'UnitID': item.unitid,
                'unitname': item.unitname,
                'default': item.isdefault,
                'gift': 1,
                'AuxID': 0,
                'DeliverDate': '',
                'img': '',
                'IsOverseas': 0
            };

        }

        //获取某个促销方案 商品的原价总金额与数量
        function getListSum(listdata) {
            var len = listdata.length;
            var money = 0;
            var num = 0;
            for (var i = 0; i < len; i++) {
                if (!listdata[i].gift) {
                    money = money + listdata[i].num * listdata[i].price;
                    num = num + listdata[i].num;
                }
            }
            return {
                'money': money,
                'num': num
            };
        }


        //按优先级排序
        function PriorAsc(x, y) {
            if (x.fullorall > y.fullorall) {
                return 1;
            } else if (x.fullorall < y.fullorall) {
                return -1;
            }
            return 0;
        }


        //格式化返回商品列表数据
        function formatList(list, listNew) {

            if (list.length == 0) {
                return [];
            }

            //先按优先级排序
            var discountList = listNew.discount || [];
            if (discountList.length > 1) {
                discountList.sort(PriorAsc);
            }

            var giftList = listNew.gift || [];
            if (giftList.length > 1) {
                giftList.sort(PriorAsc);
            }

            var listdata = [];
            //一般促销方案商品列表
            var list1 = getProList1(list, listNew.itemlist);
            listdata = listdata.concat(list1);

            //全场促销方案商品列表
            var money = getAllMoney(listdata);
            var list2 = getProList2(money, listNew.alllist);
            listdata = listdata.concat(list2);

            return listdata;
        }

        //格式化返回商品总计数据
        function formatSum(list) {
            var total = list.para || {};
            var proMoney = total.discountamount || 0;
            var calc = getFreeMoney(proMoney);
            return $.extend({}, {
                'oldMoney': total.amount || 0,//商品原价总计
                'proMoney': proMoney > 0 ? proMoney : 0,//商品优惠后总计
                'freeMoney': calc.free,//抹零金额
                'payMoney': calc.pay//应付金额
            });
        }

        //获取抹零金额
        function getFreeMoney(money) {
            return  {
                'pay': money,
                'free': 0
            };
        }

        return {
            'formatList': formatList,
            'formatSum': formatSum
        }


    })();

    return {
        getPromotion: getPromotion,
        getFreightData: getFreightData,
        getSubmitData: getSubmitData
    };


})();

