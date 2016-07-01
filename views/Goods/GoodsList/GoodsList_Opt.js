var GoodsList_Opt = (function () {


    function del(goods) {
        var bexist = false;
        var itemid = goods.itemid;
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist == "") {
            return;
        }
        var goodslistArr = JSON.parse(goodslist);
        var inum = goodslistArr.length;
        //购物车列表遍历
        for (var i = 0; i < inum; i++) {
            if (itemid == goodslistArr[i].itemid) {
                goodslistArr.splice(i, 1);
                bexist = true;
                break;
            }
        }
        if (bexist) {
            goodslist = JSON.stringify(goodslistArr);
            kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        }
    }


    function update(goods) {

        //保存购物清单的数据到缓存

        var addGoodsList = [];
        addGoodsList.push({
            expoint: goods.expoint,
            fauxid: 0,
            fitemid: goods.itemid,
            name: goods.goodsName,
            num: goods.num || 1,
            onlyexpoint: goods.onlyexpoint,
            price: goods.price
        });

        var addGoods = {
            itemid: goods.itemid,
            isoverseas: goods.isoverseas || 0,
            name: goods.goodsName,
            unitid: goods.unitid,
            unitname: goods.unitname,
            img: goods.goodsImg,
            stocknum: goods.stocknum || 0,
            auxtype: 0,
            attrList: addGoodsList
        };

        var goodslistArr = [];
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist == "") {
            goodslistArr.push(addGoods);
        }
        else {
            goodslistArr = JSON.parse(goodslist);
            var inum = goodslistArr.length;
            var bcheck = false;
            //购物车列表遍历
            for (var i = 0; i < inum; i++) {
                if (addGoods.itemid == goodslistArr[i].itemid) {
                    var attrList = goodslistArr[i].attrList;
                    var attrnum = attrList.length;
                    var newattrnum = addGoodsList.length;
                    //待加商品列表遍历
                    for (var k = 0; k < newattrnum; k++) {
                        var bexist = false;
                        //待加商品明细与购物车商品明细比较（注 购物车商品缓存 使用2层结构）
                        for (var j = 0; j < attrnum; j++) {
                            if (addGoodsList[k].name == attrList[j].name) {
                                bexist = true;
                                //新添加的商品数量加上以前缓存的数量
                                //attrList[j].num = kdShare.calcAdd(Number(attrList[j].num), Number(addGoodsList[k].num));

                                //数量直接覆盖原来的
                                attrList[j].num = Number(addGoodsList[k].num);
                                break;
                            }
                        }
                        if (!bexist) {
                            attrList.push(addGoodsList[k]);
                        }
                    }
                    bcheck = true;
                }
            }
            if (!bcheck) {
                goodslistArr.push(addGoods);
            }
        }
        goodslist = JSON.stringify(goodslistArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
    }


    function refresh() {
        var $list = $('#goodslist_list');
        var qInput = $list.find('.count-bar');
        if (qInput.length<=0) {
            return;
        }

        $list.find('[data-id]').text('');
        $list.find('[data-cmd="-"]').addClass('hide');

        var listStr = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (listStr != "") {
            var list = JSON.parse(listStr);
            var inum = list.length;
            var itemid = '';
            var num = '';

            //购物车列表遍历
            for (var i = 0; i < inum; i++) {
                var attrList = list[i].attrList;
                var attrnum = attrList.length;
                for (var j = 0; j < attrnum; j++) {
                    itemid = attrList[j].fitemid;
                    num = attrList[j].num;
                    var li = $list.find('[data-id="' + itemid + '"]');
                    if (li.length > 0) {
                        li.text(num);
                        li.siblings('[data-cmd="-"]').removeClass('hide');
                    }
                }
            }
        }
    }

    return {
        del: del,
        update: update,
        refresh: refresh
    }

})();