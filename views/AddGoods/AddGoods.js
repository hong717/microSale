/*添加商品到购物车*/

var AddGoods = (function () {

    var viewPage, config, goodsHead, sampleHead, imgdefault, addGoodsList,
        auxType,
        attrType,
        divList,
        scroller,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#view-addgoods');
            goodsHead = document.getElementById('addgoodshead');
            sampleHead = $.String.between(goodsHead.innerHTML, '<!--', '-->');
            imgdefault = "img/no_img.png";
            divList = document.getElementById('addgoodsbody');
            scroller = Lib.Scroller.create(divList);
            AddGoods_Api.initView(scroller);
            AddGoods_Attr.initView(scroller);
            //AddGoods_AddList.initView();
            AddGoods_Batch.initView();
            addGoodsList = AddGoods_Api.getAddGoodsList();
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        //批量录入
        $(".addgoods").delegate('.btnBatch', {
            'click': function () {
                var bloadind = AddGoods_Api.apiLoading();
                if (bloadind) {
                    OptMsg.ShowMsg("数据正在加载中,请稍后...");
                    return;
                }
                var isBatch = false;
                if (this.innerHTML == "批量录入") {
                    isBatch = true;
                    this.innerHTML = "返回";
                } else {
                    //批量录入模式，点击返回时 要清空数据
                    addGoodsList.length = 0;
                    this.innerHTML = "批量录入";
                }
                changeInputMode(isBatch);
            },
            'touchstart': function () {
                $(this).css({ background: '#FF6427', color: "#ffffff" });
            },
            'touchend': function () {
                $(this).css({ background: '#ffffff', color: "#FF6427" });
            }
        });

        //图片放大
        $(".addgoods .imgview").bind("click", function () {
            kdShare.Image.setBigImage($(this));
        });


        //添加到购物车
        $(".addgoods").delegate('.btnok', {
            'click': function () {
                var bloadind = AddGoods_Api.apiLoading();
                if (bloadind) {
                    OptMsg.ShowMsg("数据正在加载中,请稍后...");
                    return;
                }
                addGoodsToGoodsBox();
            },
            'touchstart': function () {
                $(this).css({ background: '#ef5215' });
            },
            'touchend': function () {
                $(this).css({ background: '#FF6427' });
            }
        })
            .delegate('.close', {
                'click': function () {
                    hideAttr();
                }
            })
            .delegate('.goodsBox', {
                'click': function () {
                    $('#divlistMark').hide();
                    viewPage.hide();
                    MiniQuery.Event.trigger(window, 'toview', ['CacheList']);
                },
                'touchstart': function () {
                    var curthis = $(this);
                    curthis.removeClass('sprite-cart');
                    curthis.addClass('sprite-cart_s');
                    curthis.css('color', '#FF753E');
                },
                'touchend': function () {
                    var curthis = $(this);
                    curthis.removeClass('sprite-cart_s');
                    curthis.addClass('sprite-cart');
                    curthis.css('color', '#686f76');
                }
            })
            .delegate('.btn-add-cart', {
                'click': function () {
                    if (AddGoods_Attr.addGoodsToList()) {
                        OptMsg.ShowMsg("已加入购物车", function () {
                            addToGoodsBox();
                            var identity = kdAppSet.getUserInfo().identity;
                            if (identity == 'retail') {
                                hideAttr();
                            }
                            MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
                        }, 500);
                    }
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215', color: '#fff' });
                },
                'touchend': function () {
                    $(this).css({ background: '#fff', color: '#ff6427' });
                }
            })
            .delegate('.btn-buy-now', {
                'click': function () {
                    if (AddGoods_Attr.addGoodsToList()) {
                        addToGoodsBox();

                        hideAttr();
                        var userInfo = kdAppSet.getUserInfo();
                        var hasLogin = userInfo.usertype != 0 || userInfo.senderMobile == ''
                            || (!userInfo.cmpInfo.allowRetailSubmit && userInfo.identity == 'retail');
                        if (hasLogin) {
                            MiniQuery.Event.trigger(window, 'toview', ['Register', { fromView: 'cachelist' }]);
                            return;
                        }
                        //MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
                        CacheList.goodsSubmitBill();
                    }
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215' });
                },
                'touchend': function () {
                    $(this).css({ background: '#FF6427' });
                }
            });

        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            }
        });

    }


    //把商品加入购物车缓存
    function addGoodsToGoodsBox() {

        //判断是否批量录入
        var btnBatch = $(".addgoods .btnBatch");
        var isBatchMode = (btnBatch[0].innerText == '返回');
        if (isBatchMode && (addGoodsList.length <= 0) && (btnBatch.attr('display') == 'none')) {
            OptMsg.ShowMsg("请录入商品数量");
            return;
        }
        //buy 立即购买 add 加入购物车
        if (config.buytype == 'buy') {
            if (isBatchMode || AddGoods_Attr.addGoodsToList()) {
                addToGoodsBox();
                hideAttr();
                var userInfo = kdAppSet.getUserInfo();
                var hasLogin = userInfo.usertype != 0 || userInfo.senderMobile == ''
                    || (!userInfo.cmpInfo.allowRetailSubmit && userInfo.identity == 'retail');
                if (hasLogin) {
                    MiniQuery.Event.trigger(window, 'toview', ['Register', { fromView: 'cachelist' }]);
                    return;
                }
                CacheList.goodsSubmitBill();
            }
        } else if (config.buytype == 'add') {
            if (isBatchMode || AddGoods_Attr.addGoodsToList()) {
                OptMsg.ShowMsg("已加入购物车", function () {
                    addToGoodsBox();
                    if (isBatchMode) {
                        hideAttr();
                    }
                    MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
                }, 500);
            }
        }

    }


    //保存购物清单的数据到缓存
    function addToGoodsBox() {

        if (addGoodsList.length == 0) {
            return;
        }

        var shareData = AddGoods_Api.getData();
        auxType = shareData.auxType;
        attrType = shareData.attrType;

        var addGoods = {
            itemid: config.goods.itemid,
            isoverseas: config.goods.isoverseas || 0,
            name: config.goods.goodsName,
            unitid: config.goods.unitid,
            unitname: config.goods.unitname,
            img: config.goods.goodsImg,
            stocknum: config.goods.stocknum,
            auxtype: auxType,
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
                                attrList[j].num = kdShare.calcAdd(Number(attrList[j].num), Number(addGoodsList[k].num));
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
        reSetAddGoodsList();
        freshGoodsNum();
    }


    //设置批量录入模式是否显示
    function showBatchMode() {
        var btnBatch = $(".addgoods .btnBatch");
        btnBatch.hide();
        if (config.buytype == 'list' || kdAppSet.getUserInfo().identity == "retail") {
            //列表添加购物车进来的不需要批量录入
            return;
        }
        changeInputMode(false);
        var shareData = AddGoods_Api.getData();
        if (shareData.auxType == shareData.attrType.noAttr) {
        } else {
            if (shareData.attrList1.length > 1 || shareData.attrList2.length > 1) {
                btnBatch.show();
                if (btnBatch[0].innerHTML == "返回") {
                    changeInputMode(true);
                }
            }
        }
    }


    //切换批量录入模式
    function changeInputMode(isBatch) {
        var addgoodsbody = viewPage.find("#addgoodsbody");
        var flySumlist = viewPage.find("#flySumlist");
        var batchMode = viewPage.find(".batchMode");
        var imgSrc = $('.addgoods .imgDiv img').attr('src') || 'img/no_img.png';
        $('.batchMode .batchImg').attr('src', imgSrc);

        if (isBatch) {
            batchMode.show();
            addgoodsbody.hide();
            flySumlist.hide();
            AddGoods_Batch.showBatchList(config);
        } else {
            batchMode.hide();
            addgoodsbody.show();
            flySumlist.show();
        }
    }


    function render(configParam) {
        initView();
        config = configParam;
        $("#goodsAttr1").hide();
        $("#goodsAttr2").hide();
        toggleBtn();
        show();
        reSetAddGoodsList();
        $(".divNum .numText2")[0].innerText = 1;
        fillGoodsHead(config.goods);
        AddGoods_Api.getItemAuxInfo(config, showGoodsAttrInfo);
        setPriceVisiable();
    }

    /*
     * 切换按钮组显示
     * */
    function toggleBtn() {
        if (config.buytype == 'list') {
            viewPage.find('.btnok').hide();
            viewPage.find('.btnBatch').hide();
            viewPage.find('.btn-box-list').show();
        }
        else {
            viewPage.find('.btnok').show();
            viewPage.find('.btn-box-list').hide();
        }
    }


    //设置价格信息是否显示
    function setPriceVisiable() {
        if (kdAppSet.getIsShowPrice()) {
            viewPage.find(".divhead .price").show();
        } else {
            viewPage.find(".divhead .price").hide();
        }
    }


    //显示商品辅助属性&&获取单商品原价
    function showGoodsAttrInfo(datalist, configp) {
        if (datalist.auxType == 0) {//datalist.auxType == 0，单积分商品，填充原价
            fillPreprice(datalist);
        }
        AddGoods_Attr.showGoodsAttrInfo(datalist, configp);
        showBatchMode();
    }

    //非单商品，填充原价--马跃
    function fillPreprice(dlist) {
        var price;
        var dlength = dlist.fstrategy.length;
        if (dlength == 0) {
            price = dlist.fmaxprice;
        } else {
            price = dlist.fstrategy[dlength - 1].price;
        }
        viewPage.find('[data-cmd="preprice"]').text( kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price));
    }


    //填充表头界面
    function fillGoodsHead(head) {
        var priceStr = kdAppSet.getPriceStr(head);
        var headhtml = $.String.format(sampleHead, {
            imgurl: head.goodsImg == "" ? imgdefault : head.goodsImg,
            newflag: head.newflag,
            cuxiaoflag: head.cuxiaoflag,
            price: priceStr,
            goodsname: head.goodsName
        });

        goodsHead.innerHTML = headhtml;
        // $(".batchMode").find("#goodsname span")[0].innerHTML = head.goodsName;
        var stockinfo = kdAppSet.getStockStr(head.stocknum, head.unitname);
        var stockmsg = stockinfo.stockStr;
        var stockcolor = stockinfo.color;
        var stockctrl = $(".addgoods .stocknum").find("span");
        stockctrl[0].innerText = stockmsg || '';
        var color = stockcolor.replace("color:", "");
        stockctrl.css("color", color);

        if (head) {//积分显示情况--马跃
            pointShow(head);
        }
    }

    //积分显示
    function pointShow(head) {
        //价格
        var price = viewPage.find('[data-cmd="price"]');
        //orshow
        var orshow = viewPage.find('[data-cmd="orshow"]');
        //积分
        var expoint = viewPage.find('[data-cmd="expoint"]');
        //原价
        var preprice = viewPage.find('[data-cmd="preprice"]');
        //填充积分
        viewPage.find('[data-cmd="point"]').text(head.expoint);
        //仅积分兑换--2016.3.16原价永远显示 不隐藏
        if (head.onlyexpoint == 1) {
            price.hide();
            orshow.hide();
            expoint.show();
            //preprice.show();
        } else {
            //preprice.hide();
            if (head.expoint == 0) {
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

    //初始化数据
    function reSetAddGoodsList() {
        AddGoods_Attr.reSetAddGoodsList();
        AddGoods_Batch.reSetAddGoodsList();
        changeInputMode(false);
    }

    //刷新购物车数量
    function freshGoodsNum() {
        $('.addgoods .count_tip')[0].innerText = CacheList.getGoodsListCount();
    }

    function show() {
        viewPage.show();
    }

    function showAttr(config) {
        initView();
        setViewSize(config.goods);
        $('#divlistMark').show();
        $('.addgoods .goodsBox').show();
        freshGoodsNum();
        render(config);
    }

    function setViewSize(goods) {
        var btnok = viewPage.find('.divok');
        if (goods.auxcount == 0) {
            viewPage.addClass('addgoods_noAuxTop');
            btnok.addClass('noAuxBottom');
        } else {
            viewPage.removeClass('addgoods_noAuxTop');
            btnok.removeClass('noAuxBottom');
        }
    }

    function hideAttr() {
        initView();
        viewPage.hide();
        $('#divlistMark').hide();
        GoodsList.renderFooter();
    }

    return {
        showAttr: showAttr,
        hideAttr: hideAttr,
        freshGoodsNum: freshGoodsNum
    };

})();