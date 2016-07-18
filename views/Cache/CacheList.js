/*购物车列表*/

var CacheList = (function () {

    var div , listitemarea, goodsitemlist, samples;
    var scroller ,
    //购物车商品列表
        goodsListArr,
    //是否正在调用接口 1 正在调用 0 调用结束 2调用结束并且出错
        bloadind,
    //商品价格策略
        dlist,
        config,
        editBillId,
        copyBillId,
    //获取单价的时间标示
        priceItemStr,
        pricetime,
        apitime,
    //相隔多久再次获取价格
        apiTime,
        hasInit,
    //是否是零售用户
        isRetail,
        privilegeInfo;

    //刷新购物车商品数
    MiniQuery.Event.bind(window, {
        'freshListBoxCount': function () {
            freshListBoxCount();
        }
    });

    //刷新购物车列表 处理库存不足
    MiniQuery.Event.bind(window, {
        'freshCacheListInfo': function () {
            getGoodsData();
        }
    });


    //编辑商品清单
    MiniQuery.Event.bind(window, {
        'editCacheListInfo': function (billinfo) {
            initView();
            //编辑订单商品
            editBillId = billinfo.editBillId || 0;
            //编辑订单时要重新获取价格
            pricetime = 0;
            copyBillId = 0;
        }
    });

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-itemlist');
            listitemarea = document.getElementById('list-item-buy');
            scroller = Lib.Scroller.create(listitemarea);
            goodsitemlist = document.getElementById('goodsitemlist');
            samples = $.String.getTemplates(div.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                }
            ]);
            priceItemStr = '';
            goodsListArr = [];
            dlist = [];
            editBillId = 0;
            copyBillId = 0;
            pricetime = 0;
            //默认间隔5分钟获取一次
            apiTime = 300;
            isRetail = (kdAppSet.getUserInfo().identity == 'retail');
            bindEvents();
            if (!kdAppSet.isPcBrower() && !kdShare.is_weixinbrower() && !kdAppSet.getAppParam().isdebug) {
                $('#ordersubmit').hide();
            }
            hasInit = true;
        }
    }

    //获取商品id 列表
    function getItemidStr() {
        var inum = goodsListArr.length;
        var itemlist = [];
        var itemstr = "";
        for (var i = 0; i < inum; i++) {
            if (goodsListArr[i].auxtype == 2 || goodsListArr[i].auxtype == 0) {
                itemlist.push(goodsListArr[i].itemid);
            } else {
                var attrList = goodsListArr[i].attrList;
                var jnum = attrList.length;
                for (var j = 0; j < jnum; j++) {
                    itemlist.push(attrList[j].fitemid);
                }
            }
        }
        if (itemlist.length > 0) {
            itemstr = itemlist.toString(",");
        }
        return itemstr;
    }

    //获取商品列表参数
    function getItemListParam() {
        var inum = goodsListArr.length;
        var itemlist = [];
        var auxtype;
        for (var i = 0; i < inum; i++) {
            auxtype = goodsListArr[i].auxtype;
            if (auxtype == 2 || auxtype == 0) {
                itemlist.push({
                    itemid: goodsListArr[i].itemid,
                    parentid: ''
                });
            } else {
                var attrList = goodsListArr[i].attrList;
                var parentid = (auxtype == 3) ? (attrList[0].parentid || '') : goodsListArr[i].itemid;
                var jnum = attrList.length;
                for (var j = 0; j < jnum; j++) {
                    itemlist.push({
                        itemid: attrList[j].fitemid,
                        parentid: parentid
                    });
                }
            }
        }
        return {itemlist: itemlist};
    }

    //获取商品id 与数量列表，用来判断购物车的东西有没变化
    function getItemidStr2() {
        var inum = goodsListArr.length;
        var itemlist = [];
        var itemstr = "";
        var itemid = '';
        for (var i = 0; i < inum; i++) {
            if (goodsListArr[i].auxtype == 2 || goodsListArr[i].auxtype == 0) {
                itemid = goodsListArr[i].itemid;
            }
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (attrList[j].fitemid != 0) {
                    itemid = attrList[j].fitemid;
                }
                itemlist.push(itemid + '|' + attrList[j].num);
            }
        }
        if (itemlist.length > 0) {
            itemstr = itemlist.toString(",");
        }
        return itemstr;
    }

    //调用接口获取商品价格策略
    function getPriceList() {

        var itemStr = getItemidStr();
        if (itemStr == "") {
            return;
        }
        var needGetPrice = true;
        if (priceItemStr == itemStr) {
            needGetPrice = false;
            freshAllItemPrice(dlist);
        }

        var apiDate = new Date();
        apitime = parseInt(apiDate.getTime() / 1000);
        if (!(apitime - pricetime > apiTime) && !needGetPrice) {
            //不到间隔时间 不获取价格
            return;
        }

        bloadind = 1;
        var listParm = getItemListParam();
        kdAppSet.setKdLoading(true, "获取价格信息...");
        Lib.API.get('GetItemPriceList', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: listParm
        }, function (data, json) {
            privilegeInfo = data.pricemsg || '';
            setPrivilegeInfo(privilegeInfo);
            priceItemStr = itemStr;
            bloadind = 0;
            dlist = data.priceList || {};
            freshAllItemPrice(dlist);

            kdAppSet.setKdLoading(false);
            pricetime = apitime;
        }, function () {
            bloadind = 2;
            kdAppSet.setKdLoading(false);
        }, function () {
            bloadind = 2;
            kdAppSet.setKdLoading(false);
        }, "");
    }

    //根据商品id获取积分兑换信息
    function getPointsByItemid(itemid, pList) {
        var item;
        for (var i in pList) {
            item = pList[i];
            if (itemid == item.fitemid) {
                return {
                    expoint: item.expoint || 0,
                    onlyexpoint: item.onlyexpoint || 0
                }
            }
        }
        return null;
    }

    //刷新商品的积分兑换信息
    function freshAllItemPoints(pointList) {
        var inum = goodsListArr.length;
        for (var i = 0; i < inum; i++) {
            var auxtype = goodsListArr[i].auxtype;
            var itemid = goodsListArr[i].itemid;
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (auxtype == 1) {
                    itemid = attrList[j].fitemid;
                }
                var points = getPointsByItemid(itemid, pointList);
                if (points != null) {
                    goodsListArr[i].attrList[j].expoint = points.expoint;
                    goodsListArr[i].attrList[j].onlyexpoint = points.onlyexpoint;
                }
            }
        }
    }

    /*
     * 设置优惠信息展示
     * */
    function setPrivilegeInfo(value) {
        var $div = $(div).find('.privilegeInfo');
        var confirm = $('.list-item-confirm');
        if (value === "") {
            $div.hide();
            $(listitemarea).css("bottom", "2rem");
            confirm.css("bottom", "1rem");
            return;
        }
        $(listitemarea).css("bottom", "2.6rem");
        confirm.css("bottom", "1.4rem");
        $div.text(value);
        $div.show();
    }

    //刷新所有商品价格
    function freshAllItemPrice(priceList) {
        var inum = goodsListArr.length;
        for (var i = 0; i < inum; i++) {
            var auxtype = goodsListArr[i].auxtype;
            var itemid = goodsListArr[i].itemid;
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            var parentid = '';
            for (var j = 0; j < jnum; j++) {
                if (auxtype == 1) {
                    itemid = attrList[j].fitemid;
                    parentid = goodsListArr[i].itemid || '';
                } else if (auxtype == 3) {
                    parentid = attrList[j].parentid || '';
                }
                var auxid = attrList[j].fauxid;
                var num = attrList[j].num;

                var price = getItemPrice(priceList, itemid, auxid, num, parentid);
                if (price != null) {
                    goodsListArr[i].attrList[j].price = price;
                }
            }
        }
        freshAllItemPoints(dlist);
        var goodslist = JSON.stringify(goodsListArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        refreshdata(goodsListArr);
    }

    //根据策略获取商品价格
    function getItemPrice(priceList, itemid, auxid, num, parentid) {
        var inum = priceList.length;
        for (var i = 0; i < inum; i++) {
            var item = priceList[i];
            if (itemid == item.fitemid && (item.fauxid == 0 || auxid == item.fauxid) && parentid == item.parentid) {
                var priceStrategy = item.fstrategy || [];
                var price = getPriceByStrategy(priceStrategy, num);
                return price;
            }
        }
        return null;
    }

    //根据数量获取商品价格策略
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
                return  priceList[i].price;
            }
        }
        return 0;
    }


    //获取缓存中的商品列表
    function getGoodsData() {
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist != "") {
            goodsListArr = JSON.parse(goodslist);
            //goodsListArr =goodsListArr.reverse;
            refreshdata(goodsListArr);
        }
        else {
            goodsListArr = [];
            goodsitemlist.innerHTML = "";
        }
        isEmptyBox();
        scroller.refresh();
        freshListBoxCount();
    }

    //判断是否显示 商品列表空页面信息
    function isEmptyBox() {
        if (goodsListArr.length > 0) {
            $("#list-item-buy").show();
            $(".emptybox").hide();
            $(".list-item-confirm").show();
        } else {
            $("#list-item-buy").hide();
            $(".emptybox").show();
            $(".list-item-confirm").hide();
        }
    }


    //处理仅限积分的商品价格
    function dealPointPrice(item) {

    }

    //刷新商品列表数据
    function refreshdata(data, pindex) {

        goodsitemlist.innerHTML = $.Array.map(data, function (item, pindex) {
            var attrList = [];
            var listObj = item.attrList;
            var attrsum = 0;
            var attrsumMoney = 0;
            var itmp;
            for (var attr in listObj) {
                attrList.push(listObj[attr]);
                attrsum = kdShare.calcAdd(attrsum, Number(listObj[attr].num));
                //仅限积分兑换 金额为0
                itmp = (listObj[attr].onlyexpoint == 1 && isRetail) ? 0 : kdShare.calcMul(Number(listObj[attr].num), Number(listObj[attr].price));
                attrsumMoney = kdShare.calcAdd(attrsumMoney, itmp);
            }

            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : item.img,
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                attrsum: attrsum,
                attrsumMoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(attrsumMoney),
                'rows': $.Array.map(attrList, function (row, index) {
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            attrprice: kdAppSet.getRmbStr + ((row.onlyexpoint == 1 && isRetail) ? 0 : kdAppSet.formatMoneyStr(row.price)),
                            stocknum: 0,
                            attrIndex: index,
                            attrPindex: pindex,
                            stockunit: item.unitname,
                            attrnum: row.num,
                            canedit: (item.auxtype == 3) ? 'hide-border' : ''
                        });
                    }
                ).join('')
            });
        }).join('');


        if (pindex != undefined) {
            setTimeout(function () {
                var lirow = $("#goodsitemlist").find("[index='" + pindex + "']");
                var btnCtrl = lirow.find(".attrDelete");
                btnCtrl[0].innerText = "完成";
                lirow.find(".attrRowDel").show();
                lirow.find(".attrprice").hide();
                lirow.find(".goodsRowDel").show();
                lirow.find(".itemlist-li-top-center").css({"right": "1.2rem"});
            }, 50);
        }
        scroller && scroller.refresh();
        freshListBoxCount();
        setPriceVisiable();
    }

    //是否显示 商品删除按钮
    function showBtnDelete(attrList, bshow, auxType) {
        if (bshow) {
            var attrRowDel = attrList.find(".attrRowDel");
            if (attrRowDel.length > 1 && auxType != 3) {
                attrRowDel.css("display", "inline-block");
                attrList.find(".attrprice").css("display", "none");
            }
            attrList.find(".goodsRowDel").css("display", "inline-block");
        } else {
            attrList.find(".attrRowDel").css("display", "none");
            if (kdAppSet.getIsShowPrice()) {
                attrList.find(".attrprice").css("display", "inline-block");
            } else {
                attrList.find(".attrprice").css("display", "none");
            }
            attrList.find(".goodsRowDel").css("display", "none");
        }
    }

    //清空缓存中的 商品数据
    function clearCacheGoods() {
        editBillId = 0;
        kdShare.cache.setCacheData("", kdAppSet.getGoodslistFlag());
    }


    function bindEvents() {

        //商品编辑结束 事件处理
        MiniQuery.Event.bind(window, {
            'EditBillFinish': function (data) {
                var billid = data.billid || 0;
                if (billid == 0 || editBillId == billid) {
                    clearCacheGoods();
                }
            }
        });

        //图片点击事件
        $(goodsitemlist).delegate('.itemlist-li-top-left', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).find('img').attr('src'), posi: 0 }]);
                return false;
            }
        });

        //商品列表点击事件  跳到商品详情
        $(goodsitemlist).delegate('.lirow', {
            'click': function () {
                var index = this.getAttribute("index");
                var itemclick = goodsListArr[index];
                var item = {cuxiaoflag: 0, newflag: 0, number: "",
                    img: itemclick.img,
                    itemid: itemclick.itemid,
                    name: itemclick.name,
                    unitid: itemclick.unitid,
                    unitname: itemclick.unitname,
                    num: itemclick.stocknum,
                    price: 0
                };
                MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: item}]);
            }
        });

        //商品列表行 点击视觉效果处理
        $(goodsitemlist).delegate('.itemlist-li-top', {
            'touchstart': function (event) {

                if (event.target.nodeName == "IMG") {
                    return;
                }
                var ctrlp = $(this).parent();
                ctrlp.children('li').css('background', '#fff');
                ctrlp.css('background', '#d9dadb');
                ctrlp.find('.attrRow').css('background', '#d9dadb');
                ctrlp.find(".itemlist-num").css('background', '#fff');
                ctrlp.find(".itemlist-li-top-left").css('background', '#fff');

            }, 'touchend': function (event) {
                if (event.target.nodeName == "IMG") {
                    return;
                }
                var ctrlp = $(this).parent();
                ctrlp.css('background', '#fff');
                ctrlp.find('.attrRow').css('background', '#fff');
            }
        });

        //商品明细 点击视觉效果处理
        $(goodsitemlist).delegate('.attrname', {
            'touchstart': function () {
                var ctrlP = $(this).parent();
                ctrlP.css('background', '#d9dadb');
                ctrlP.find(".attrDelete").css('background', '#fff');
            }, 'touchend': function () {
                $(this).parent().css('background', '#fff');
            }
        });

        //商品编辑
        $("#goodsitemlist").delegate(".attrDelete", {
            'click': function () {
                var index = this.getAttribute("index");
                var ctrlP = $("#goodsitemlist li[index=" + index + "]");
                //var ctrlP=$(this).parent().parent();
                if (this.innerText == "编辑") {
                    this.innerText = "完成";
                    var auxtype = goodsListArr[index].auxtype;
                    showBtnDelete(ctrlP, true, auxtype);
                    ctrlP.find(".itemlist-li-top-center").css({"right": "1.2rem"});
                } else {
                    this.innerText = "编辑";
                    showBtnDelete(ctrlP, false);
                    ctrlP.find(".itemlist-li-top-center").css({"right": "0.2rem"});
                }
                return true
            },
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            }
        });

        //商品删除
        $("#goodsitemlist").delegate(".goodsRowDel", {
            'click': function (ev) {
                var iindex = this.getAttribute("index");
                var ctrlP = $("#goodsitemlist li[index=" + iindex + "]");
                ctrlP.animate({left: "-6.4rem"}, 300, function () {
                    goodsListArr.splice(iindex, 1);
                    var goodslist = JSON.stringify(goodsListArr);
                    kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
                    refreshdata(goodsListArr);
                    isEmptyBox();
                });
                ev.stopPropagation();
                return false;
            },
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            }
        });

        //商品明细删除
        $("#goodsitemlist").delegate(".attrRowDel", {
            'click': function (ev) {
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var ctrlp = $("#goodsitemlist .attrRow[attrindex=" + iindex + "][attrpindex=" + pindex + "]");

                var attrList = goodsListArr[pindex].attrList;
                attrList.splice(iindex, 1);
                goodsListArr[pindex].attrList = attrList;

                ctrlp.animate({left: "-6.4rem"}, 300, function () {
                    if (attrList.length == 0) {
                        ctrlp = $("#goodsitemlist li[index=" + pindex + "]");
                        ctrlp.animate({left: "-6.4rem"}, 300, function () {
                            goodsListArr.splice(pindex, 1);
                            var goodslist = JSON.stringify(goodsListArr);
                            kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
                            refreshdata(goodsListArr);
                            isEmptyBox();
                        });
                    } else {
                        var goodslist2 = JSON.stringify(goodsListArr);
                        kdShare.cache.setCacheData(goodslist2, kdAppSet.getGoodslistFlag());
                        refreshdata(goodsListArr, pindex);
                        isEmptyBox();
                    }
                });
                AddGoods.freshGoodsNum();   //主动立即购买购物车数量，防止用户点返回数量不更新
                ev.stopPropagation();
                return false;
            },
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            }
        });


        //商品数量点击  键盘事件
        $("#goodsitemlist").delegate(".attrnum", {
            'click': function (ev) {
                var pindex = this.getAttribute("attrpindex");
                var auxtype = goodsListArr[pindex].auxtype;
                if (auxtype == 3) {
                    //套装商品不能修改
                    return false;
                }

                var target = $(this).children('input');
                var iindex = this.getAttribute("attrindex");

                var attrList = goodsListArr[pindex].attrList;
                var attrname = attrList[iindex].name;
                var attrListCtrl = $("#goodsitemlist").find("li[index=" + pindex + "]");
                var config = {
                    name: attrname,
                    input: target.val(),
                    hint: "无效数据!",
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.val(1);
                            attrList[iindex].num = 1;
                        }
                        else {
                            target.val(kvalue);
                            attrList[iindex].num = Number(kvalue);
                        }
                        //更新价格
                        var itemid = 0;
                        var parentid = '';
                        var auxtype = goodsListArr[pindex].auxtype;
                        if (auxtype == 2 || auxtype == 0) {
                            itemid = goodsListArr[pindex].itemid;
                        } else {
                            itemid = attrList[iindex].fitemid;
                            if (auxtype == 3) {
                                parentid = attrList[iindex].parentid;
                            } else if (auxtype == 1) {
                                parentid = goodsListArr[pindex].itemid;
                            }
                        }
                        var auxid = attrList[iindex].fauxid;
                        var num = attrList[iindex].num;
                        var price = getItemPrice(dlist, itemid, auxid, num, parentid);
                        attrList[iindex].price = price;
                        var goodslist = JSON.stringify(goodsListArr);
                        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());

                        var isum = 0;
                        var isumMoney = 0;
                        var itmp;
                        for (var attr in attrList) {
                            isum = kdShare.calcAdd(isum, Number(attrList[attr].num));
                            itmp = kdShare.calcMul(Number(attrList[attr].num), Number(attrList[attr].price));
                            isumMoney = kdShare.calcAdd(isumMoney, itmp);
                        }
                        attrListCtrl.find(".attrSum span").text(isum);
                        attrListCtrl.find(".attrSumPrice span").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(isumMoney));
                        attrListCtrl.find(".attrRow[attrindex=" + iindex + "]").find(".attrprice span").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price));
                        freshListBoxCount();
                    }
                };
                kdShare.keyBoard.autoshow(config);
                ev.stopPropagation();
                return false;
            }
        });

        //取消订单
        $('#view-itemlist').delegate('#ordercancel', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['CacheOrderList', {data: goodsListArr, editBillId: editBillId, cancelEdit: true}]);
                clearCacheGoods();
            },
            'touchstart': function () {
                $(this).addClass('btnCancelorder_touched');
            },
            'touchend': function () {
                $(this).removeClass('btnCancelorder_touched');
            }
        });


        //提交订单
        $('#view-itemlist').delegate('#ordersubmit', {
            'click': function () {
                submitOrderClick();
            },
            'touchstart': function () {
                $(this).css({background: '#ef5215'});
            },
            'touchend': function () {
                $(this).css({background: '#ff6427'});
            }
        });

        //购物车为空时， 选购点击 处理
        $("#view-itemlist").delegate('.btnSelGoods span', {
                'click': function () {
                    addGoods();
                },
                'touchstart': function () {
                    $(this).css({background: '#ef5215'});
                },
                'touchend': function () {
                    $(this).css({background: '#ff6427'});
                }
            }
        );
    }

    //添加商品
    function addGoods() {
        MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
    }


    //提交订单的处理函数
    function submitOrderClick() {
        if (checkCanSubmit()) {
            submitBill(true);
        }
    }

    //检测是否有权限提交单据
    function checkCanSubmit() {
        var userinfo = kdAppSet.getUserInfo();
        if (userinfo.usertype != 0 || userinfo.senderMobile == ''
            || (!userinfo.cmpInfo.allowRetailSubmit && userinfo.identity == 'retail')
            ) {
            MiniQuery.Event.trigger(window, 'toview', ['Register', {fnCallBack: submitBill, fromView: 'cachelist'}]);
            return false;
        }
        return true;
    }

    //提交订单
    function submitBill(checkPrice) {
        if (checkPrice) {
            if (bloadind == 1) {
                OptMsg.ShowMsg('正在获取价格策略信息,请稍候!', '', 1500);
                return;
            } else if (bloadind == 2) {
                getPriceList();
                OptMsg.ShowMsg('获取价格策略信息出错,正尝试重新获取,请稍候!', '', 2500);
                return;
            }
        }
        MiniQuery.Event.trigger(window, 'toview', ['CacheOrderList', {data: goodsListArr, editBillId: editBillId, privilegeInfo: privilegeInfo}]);
    }

    //计算购物车中的商品数
    function getGoodsListCount() {
        var goods = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        var goodslist = [];
        if (goods != "") {
            goodslist = JSON.parse(goods);
            var inum = goodslist.length;
            var isum = 0;
            for (var i = 0; i < inum; i++) {
                var attrList = goodslist[i].attrList;
                for (var attr in attrList) {
                    isum = isum + Number(attrList[attr].num);
                }
            }
            return isum;
        }
        else {
            return 0;
        }
    }

    //刷新购物车的数量
    function freshListBoxCount() {
        var num = parseInt(getGoodsListCount());
        var cart = document.getElementById('goodsNum');
        if (num > 99) {
            num = '99';
        }
        cart.innerHTML = num;//更新购物车
        if (Number(num) == 0) {
            $(cart).hide();
        } else {
            $(cart).show();
        }
        calcSumMoney();
    }

    //计算购物车商品总金额
    function calcSumMoney() {
        var sumMoney = 0;
        if (goodsListArr) {
            var inum = goodsListArr.length;
            var itmp;
            for (var i = 0; i < inum; i++) {
                var attrList = goodsListArr[i].attrList;
                for (var attr in attrList) {
                    //仅限积分兑换 金额为0
                    itmp = (attrList[attr].onlyexpoint == 1 && isRetail) ? 0 : kdShare.calcMul(Number(attrList[attr].num), Number(attrList[attr].price));
                    sumMoney = kdShare.calcAdd(sumMoney, itmp);
                }
            }
            $("#cacheSumMoney").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(sumMoney))
        }
    }

    //设置价格信息是否显示
    function setPriceVisiable() {

        var view_itemlist = $("#view-itemlist");
        if (kdAppSet.getIsShowPrice()) {
            view_itemlist.find(".attrprice").show();
            view_itemlist.find(".attrSumPrice").show();
            view_itemlist.find(".cacheSumMoney").show();
        } else {
            view_itemlist.find(".attrprice").hide();
            view_itemlist.find(".attrSumPrice").hide();
            view_itemlist.find(".cacheSumMoney").hide();
        }
    }

    //刷新购物车界面状态
    function freshViewStatus() {
        //editBillId 不等于0 表示是编辑订单
        var view_itemlist = $("#view-itemlist");
        var title = view_itemlist.find(".listTitle #listtitleid");
        var ordercancel = view_itemlist.find("#ordercancel");
        var ordersubmit = view_itemlist.find("#ordersubmit");

        if (editBillId == 0) {
            title.text("购物车");
            ordersubmit.text("提交订单");
            ordercancel.hide();
        } else {
            title.text("商品清单");
            ordersubmit.text("保存");
            ordercancel.show();
        }
    }

    //调用接口获取订单详情
    function getOrderDetail(interID) {

        kdAppSet.setKdLoading(true, "获取订单信息...");
        Lib.API.get('GetOrderDetail', {
            currentPage: 1,
            ItemsOfPage: 9999,
            para: {InterID: interID, optType: 2}
        }, function (data, json) {
            var goodslist = JSON.stringify(data.list);
            kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
            showGoodslistInfo();
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('订单已复制');
            //刷新价格
            getPriceList();
        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            jAlert("获取订单信息出错:" + msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            jAlert(kdAppSet.getAppMsg.workError);
        }, "");
    }

    function render(configp) {
        initView();
        if (typeof configp == 'boolean') {
            dealBillInfo({});
            showGoodslistInfo();
        }
        else {
            config = configp || {};
            dealBillInfo(config);
            show();
        }
        getPriceList();
    }

    //处理单据编辑或者单据复制
    function dealBillInfo(configp) {

        copyBillId = configp.copyBillId || 0;
        //复制订单
        if (copyBillId > 0) {
            pricetime = 0;
            goodsListArr = [];
            clearCacheGoods();
            getOrderDetail(copyBillId);
        }
    }


    //商品详情中 点击立即购买
    function goodsSubmitBill() {
        if (checkCanSubmit()) {
            render(true);
            freshAllItemPrice(dlist);
            submitBill(false);
        }
    }

    //显示商品列表
    function showGoodslistInfo() {
        getGoodsData();
        freshListBoxCount();
        freshViewStatus();
    }

    //获取订单金额
    function getOrderMoney() {
        var sum = 0;
        goodsListArr = JSON.parse(kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag()));
        if (goodsListArr) {
            var len = goodsListArr.length;
            var tmp;
            for (var i = 0; i < len; i++) {
                var attrList = goodsListArr[i].attrList;
                for (var attr in attrList) {
                    //仅限积分兑换 金额为0
                    tmp = (attrList[attr].onlyexpoint == 1 && isRetail) ? 0 : kdShare.calcMul(Number(attrList[attr].num), Number(attrList[attr].price));
                    sum = kdShare.calcAdd(sum, tmp);
                }
            }
        }
        return sum;
    }

    function show() {
        $(div).show();
        OptAppMenu.selectKdAppMenu("goodsBoxId");
        OptAppMenu.showKdAppMenu(true);
        showGoodslistInfo();
        kdAppSet.setAppTitle('购物车');
    }

    function hide() {
        $(div).hide();
        OptAppMenu.showKdAppMenu(false);
    }

    return {
        render: render,
        goodsSubmitBill: goodsSubmitBill,
        getGoodsListCount: getGoodsListCount,
        show: show,
        hide: hide,
        getOrderMoney: getOrderMoney
    };


})();

