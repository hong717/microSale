/*库存不足商品列表*/

var LowStock = (function () {

    var viewPage , listitemarea, goodsitemlist, samples;
    var scroller ,
    //库存不足商品列表
        goodsListArr,
        dlist,
        config,
    // 0  无辅助属性  1 组合物料  2 有辅助属性
        attrType = {
            noAttr: 0,
            cmbAttr: 1,
            soleAttr: 2
        },
    //删除的商品
        deleteList,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = document.getElementById('viewid_lowstocklist');
            listitemarea = document.getElementById('lowstocklistdiv');
            scroller = Lib.Scroller.create(listitemarea);
            goodsitemlist = document.getElementById('lowstocklistul');
            samples = $.String.getTemplates(viewPage.innerHTML, [
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
            deleteList = [];
            goodsListArr = [];
            goodsitemlist.innerHTML = '';
            dlist = [];
            bindEvents();
            hasInit = true;
        }
    }


    //获取缓存中的商品列表,并判断是否缺少库存
    function getGoodsData() {
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist != "") {
            goodsListArr = JSON.parse(goodslist);
            var inum = goodsListArr.length;
            var lowlist = config.itemlist;
            for (var i = inum - 1; i >= 0; i--) {
                var attrList = goodsListArr[i].attrList;
                var jnum = attrList.length;
                var auxtype = goodsListArr[i].auxtype;
                for (var j = jnum - 1; j >= 0; j--) {
                    if (auxtype == attrType.noAttr) {
                        getLockStock(attrList, j, goodsListArr[i].itemid, 0, lowlist);
                    } else if (auxtype == attrType.cmbAttr) {
                        //合并商品
                        getLockStock(attrList, j, attrList[j].fitemid, attrList[j].fauxid, lowlist);
                    } else if (auxtype == attrType.soleAttr) {
                        //有辅助属性
                        getLockStock(attrList, j, goodsListArr[i].itemid, attrList[j].fauxid, lowlist);
                    }
                }
                if (attrList.length == 0) {
                    goodsListArr.splice(i, 1);
                }
            }
        }
        refreshdata(goodsListArr);
        scroller.refresh();
    }

    //获取库存不足的商品     lowlist 要检测的数据列表
    function getLockStock(attrList, j, itemid, auxid, lowlist) {
        var check = checkItemLowStock(itemid, auxid, lowlist);
        if (!check.lack) {
            attrList.splice(j, 1);
        } else {
            var num = parseInt(check.qty);
            num = (num <= 0 ? 0 : num);
            attrList[j].maxnum = num;
        }
    }

    //删除库存不足的商品     lowlist 要检测的数据列表
    function deleteLockStock(attrList, j, itemid, auxid, lowlist) {
        var check = checkItemLowStock(itemid, auxid, lowlist);
        if (check.lack) {
            attrList.splice(j, 1);
        }
    }

    //修改库存不足的商品数量     lowlist 要检测的数据列表
    function modidyLockStock(attrListInfo, k, itemid, auxid, lowlist) {
        var list = lowlist;
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            var attrList = list[i].attrList;
            var auxtype = list[i].auxtype;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (auxtype == attrType.noAttr) {
                    if (list[i].itemid == itemid) {
                        attrListInfo[k].num = attrList[j].num;
                        return;
                    }
                } else if (auxtype == attrType.cmbAttr) {
                    //合并商品
                    if (attrList[j].fitemid == itemid && attrList[j].fauxid == auxid) {
                        attrListInfo[k].num = attrList[j].num;
                        return;
                    }
                } else if (auxtype == attrType.soleAttr) {
                    //有辅助属性
                    if (list[i].itemid == itemid && attrList[j].fauxid == auxid) {
                        attrListInfo[k].num = attrList[j].num;
                        return;
                    }
                }
            }
        }
    }

    //判断是否缺少库存 lack=true 标示库存不足 qty 库存剩余数量
    function checkItemLowStock(itemid, auxid, lowlist) {
        var list = lowlist;
        var flag = false;
        var qty = 0;
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].fitemid == itemid && list[i].fauxid == auxid) {
                flag = true;
                qty = list[i].fqty || 0;
                break;
            }
        }
        return {
            lack: flag,
            qty: qty
        };
    }

    //刷新商品列表数据
    function refreshdata(data, pindex) {

        goodsitemlist.innerHTML = $.Array.map(data, function (item, pindex) {
            var attrList = [];
            var listObj = item.attrList;
            var attrsum = 0;
            var itmp;
            for (var attr in listObj) {
                attrList.push(listObj[attr]);
                attrsum = kdShare.calcAdd(attrsum, Number(listObj[attr].num));
                itmp = kdShare.calcMul(Number(listObj[attr].num), Number(listObj[attr].price));
            }
            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : item.img,
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                'rows': $.Array.map(attrList, function (row, index) {
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            maxnum: row.maxnum,
                            attrIndex: index,
                            attrPindex: pindex,
                            stockunit: item.unitname,
                            attrnum: row.num
                        });
                    }
                ).join('')
            });
        }).join('');
        scroller.refresh();
    }


    function bindEvents() {

        //图片点击事件
        $(goodsitemlist).delegate('.itemlist-li-top-left', {
            'click': function () {
                kdShare.Image.setBigImage($(this));
                return false;
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

        //商品删除
        $(goodsitemlist).delegate(".goodsRowDel", {
            'click': function () {
                var iindex = this.getAttribute("index");
                var ctrlP = $("#lowstocklistul li[index=" + iindex + "]");
                ctrlP.animate({left: "-320px"}, 500, function () {
                    setDeleteGoods(0, goodsListArr[iindex], 0);
                    goodsListArr.splice(iindex, 1);
                    refreshdata(goodsListArr);
                });
                hideOptMenu();
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
        $(goodsitemlist).delegate(".attrRowDel", {
            'click': function () {
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var ctrlp = $("#lowstocklistul .attrRow[attrindex=" + iindex + "][attrpindex=" + pindex + "]");
                var attrList = goodsListArr[pindex].attrList;
                setDeleteGoods(1, goodsListArr[pindex], iindex);

                attrList.splice(iindex, 1);
                goodsListArr[pindex].attrList = attrList;
                ctrlp.animate({left: "-320px"}, 500, function () {
                    if (attrList.length == 0) {
                        ctrlp = $("#lowstocklistul li[index=" + pindex + "]");
                        ctrlp.animate({left: "-320px"}, 500, function () {
                            goodsListArr.splice(pindex, 1);
                            refreshdata(goodsListArr);
                        });
                    } else {
                        refreshdata(goodsListArr, pindex);
                    }
                });
                hideOptMenu();
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
        $(goodsitemlist).delegate(".attrnum", {
            'click': function () {
                var target = $(this).children('input');
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var attrList = goodsListArr[pindex].attrList;
                var attrname = attrList[iindex].name;
                var config = {
                    name: attrname,
                    input: target.val(),
                    maxnum: attrList[iindex].maxnum,
                    maxhint: "数量不能超过库存数 ",
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
                    }
                };
                kdShare.keyBoard.autoshow(config);
                hideOptMenu();
                return false;
            }
        });


        $('#lowstock_opt').delegate('',
            {
                'click': function () {
                    var btnlist = $(viewPage).find('.lowstockbtnlist');
                    if (btnlist.css('display') == 'none') {
                        btnlist.show();
                        $(this).addClass('optstock_s');
                        $(this).find('span').removeClass('sprite-open');
                        $(this).find('span').addClass('sprite-open_s');
                    } else {
                        btnlist.hide();
                        $(this).removeClass('optstock_s');
                        $(this).find('span').removeClass('sprite-open_s');
                        $(this).find('span').addClass('sprite-open');
                    }
                },
                'touchstart': function () {
                },
                'touchend': function () {
                }
            }
        );

        $('#lowstock_save').delegate('',
            {
                'click': function () {
                    saveDealInfo();
                    hideOptMenu();
                },
                'touchstart': function () {
                    $(this).css({background: '#ef5215'});
                },
                'touchend': function () {
                    $(this).css({background: '#ff6427'});
                }
            }
        );
        $('.lowstockbtnlist').delegate('li',
            {
                'click': function () {
                    var cname = this.id;
                    //剩多少买多少
                    if (cname == 'lowstock_saleleft') {
                        buyAllStockLeft();
                        //删除库存不足商品
                    } else if (cname == 'lowstock_delete') {
                        deleteAllLowStock();
                    }
                    hideOptMenu();
                },
                'touchstart': function () {
                    $(this).find('span').css({background: '#e3e3e3'});
                },
                'touchend': function () {
                    $(this).find('span').css({background: '#fff'});
                }
            }
        );
    }

    function hideOptMenu() {
        $(viewPage).find('.lowstockbtnlist').hide();
    }

    function deleteGoodsItem(auxtype,goodslistItem,attrListItem){
        var itemid = 0;
        var auxid = 0;
        if (auxtype == attrType.noAttr) {
            itemid = goodslistItem.itemid;
            auxid = 0;
        } else if (auxtype == attrType.cmbAttr) {
            //合并商品
            itemid = attrListItem.fitemid;
            auxid = attrListItem.fauxid;
        } else if (auxtype == attrType.soleAttr) {
            //有辅助属性
            itemid = goodslistItem.itemid;
            auxid = attrListItem.fauxid;
        }
        deleteList.push({
            fitemid: Number(itemid),
            fauxid: Number(auxid)
        });
    }

    //设置 删除商品的 itemid 与 auxid
    function setDeleteGoods(type, goodslistItem, index) {

        var auxtype = goodslistItem.auxtype;
        var attrList = goodslistItem.attrList;
        if (type == 1) {
            //删除明细
            deleteGoodsItem(auxtype,goodslistItem,attrList[index]);
        } else if (type == 0) {
            //删除商品
            var inum = attrList.length;
            for (var i = 0; i < inum; i++) {
                deleteGoodsItem(auxtype,goodslistItem,attrList[i]);
            }
        }
    }

    //库存不足 有多少买多少
    function buyAllStockLeft() {
        var inum = goodsListArr.length;
        for (var i = inum-1; i >=0; i--) {
            var attrList = goodsListArr[i].attrList;
            var auxtype = goodsListArr[i].auxtype;
            var jnum = attrList.length;
            for (var j = jnum-1; j >=0; j--) {
                attrList[j].num = attrList[j].maxnum;
                 if(attrList[j].num==0){
                     deleteGoodsItem(auxtype,goodsListArr[i],attrList[j]);
                     attrList.splice(j, 1);
                 }
            }
            if (attrList.length == 0) {
                goodsListArr.splice(i, 1);
            }
        }
        refreshdata(goodsListArr);
        OptMsg.ShowMsg("商品购买数量已改为库存数<br>并且删除了库存为0的商品", '', 2000);
    }

    //删除库存不足的商品
    function deleteAllLowStock() {
        var inum = goodsListArr.length;
        for (var i = inum - 1; i >= 0; i--) {
            var attrList = goodsListArr[i].attrList;
            var auxtype = goodsListArr[i].auxtype;
            var jnum = attrList.length;
            for (var j = jnum - 1; j >= 0; j--) {
                if (attrList[j].num == 0 || attrList[j].num > attrList[j].maxnum) {
                    deleteGoodsItem(auxtype,goodsListArr[i],attrList[j]);
                    attrList.splice(j, 1);
                }
            }
            if (attrList.length == 0) {
                goodsListArr.splice(i, 1);
            }
        }
        refreshdata(goodsListArr);
        OptMsg.ShowMsg("库存不足的商品已删除", '', 2000);
    }

    //保存商品处理结果 到购物车
    function saveDealInfo() {
        //先检测是否存在库存不足的商品
        if (checkLowGoods()) {
            OptMsg.ShowMsg('存在库存不足的商品，请处理', '', 2000);
            return;
        }

        //再处理被删除的商品
        //获取购物车中的商品
        var goodsListSrc = [];
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist != "") {
            goodsListSrc = JSON.parse(goodslist);
        }
        dealDeleteGoods(goodsListSrc, deleteList);

        //最后处理 修改数量的商品
        dealModifyGoods(goodsListSrc, goodsListArr);

        //保存数据到购物车中
        var newGoodslist = JSON.stringify(goodsListSrc);
        kdShare.cache.setCacheData(newGoodslist, kdAppSet.getGoodslistFlag());

        //通知购物车 以及订单提交页面 刷新
        MiniQuery.Event.trigger(window, 'freshCacheListInfo', []);
        MiniQuery.Event.trigger(window, 'freshCacheOrderListInfo', []);
        kdShare.backView();
    }

    //处理被删除的商品
    function dealDeleteGoods(ListSrc, ListDelete) {
        var inum = ListSrc.length;
        for (var i = inum - 1; i >= 0; i--) {
            var attrList = ListSrc[i].attrList;
            var jnum = attrList.length;
            var auxtype = ListSrc[i].auxtype;
            for (var j = jnum - 1; j >= 0; j--) {
                if (auxtype == attrType.noAttr) {
                    deleteLockStock(attrList, j, ListSrc[i].itemid, 0, deleteList);
                } else if (auxtype == attrType.cmbAttr) {
                    //合并商品
                    deleteLockStock(attrList, j, attrList[j].fitemid, attrList[j].fauxid, deleteList);
                } else if (auxtype == attrType.soleAttr) {
                    //有辅助属性
                    deleteLockStock(attrList, j, ListSrc[i].itemid, attrList[j].fauxid, deleteList);
                }
            }
            if (attrList.length == 0) {
                ListSrc.splice(i, 1);
            }
        }
    }

    //处理 修改数量的商品
    function dealModifyGoods(ListSrc, ListAttr) {
        var inum = ListSrc.length;
        for (var i = inum - 1; i >= 0; i--) {
            var attrList = ListSrc[i].attrList;
            var jnum = attrList.length;
            var auxtype = ListSrc[i].auxtype;
            for (var j = jnum - 1; j >= 0; j--) {
                if (auxtype == attrType.noAttr) {
                    modidyLockStock(attrList, j, ListSrc[i].itemid, 0, ListAttr);
                } else if (auxtype == attrType.cmbAttr) {
                    //合并商品
                    modidyLockStock(attrList, j, attrList[j].fitemid, attrList[j].fauxid, ListAttr);
                } else if (auxtype == attrType.soleAttr) {
                    //有辅助属性
                    modidyLockStock(attrList, j, ListSrc[i].itemid, attrList[j].fauxid, ListAttr);
                }
            }
        }
    }

    //检测库存不足的商品
    function checkLowGoods() {
        var inum = goodsListArr.length;
        for (var i = 0; i < inum; i++) {
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (attrList[j].maxnum == 0 || attrList[j].num > attrList[j].maxnum) {
                    return true;
                }
            }
        }
        return false;
    }


    function render(configp) {
        config = configp;
        deleteList = [];
        initView();
        show();
    }

    function show() {
        $(viewPage).show();
        getGoodsData();
    }

    function hide() {
        $(viewPage).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();

