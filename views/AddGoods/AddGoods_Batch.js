/*商品批量录入*/

var AddGoods_Batch = (function () {
    var
        batchUlList, scrollerBatchList, sampleBatch, batchListData, screenWidth,
        addGoodsList,
        config,
        shareData,
        attrName1,
        attrName2,
        attrList1All,
        attrList2All;

    function initView() {
        var batchUlListdiv = document.getElementById('batchUlListdiv');
        scrollerBatchList = Lib.Scroller.create(batchUlListdiv);
        batchUlList = $("#view-addgoods").find(".batchUlList");
        sampleBatch = $.String.between(batchUlList[0].innerHTML, '<!--', '-->');
        screenWidth = $(window).width();
        if (kdAppSet.isPcBrower()) {
            if (screenWidth > 640) {
                screenWidth = 640;
            }
        }
        config = {};
        addGoodsList = AddGoods_Api.getAddGoodsList();
        bindEvents();
        $('.addgoods .close img').attr('src','img/close.png');
    }

    //初始化数据集
    function reSetAddGoodsList() {
        batchListData = [];
        scrollerBatchList.scrollTo(0, 0, 500);
        batchUlList.empty();
        scrollerBatchList.refresh();
    }


    function bindEvents() {

        if (kdAppSet.isPcBrower()) {
            // PC端输入框无效,将事件添加到其父框
            //批量录入列表  输入框
            $(".batchUlList").delegate(".num", {
                'click': function () {
                    dealBatchNumInput($(this).find('#numInput'));
                }
            });

        } else {
            //批量录入列表  输入框
            $(".batchUlList").delegate("#numInput", {
                'touchstart': function () {
                    dealBatchNumInput($(this));
                }
            });
        }

        $(batchUlList).delegate('li', {
            'touchstart': function (event) {
                if (event.target.id == "numInput") {
                    return;
                }
                $(this).css('background', '#d9dadb');
            },
            'touchend': function (event) {
                if (event.target.id == "numInput") {
                    return;
                }
                $(this).css('background', '#fff');
            }
        });

    }


    //处理批量录入
    function dealBatchNumInput(objclick) {

        var target = objclick;
        var iindex = Number(objclick.attr("index"));
        var attrName = batchListData[iindex].attr1;
        if (batchListData[iindex].attr2) {
            attrName = attrName + "/" + batchListData[iindex].attr2;
        }

        var config = {
            name: attrName,
            input: target.val(),
            allowZero: true,
            fn: function (kvalue, index) {
                if (kvalue == '' || kvalue == 0) {
                    target.val("");
                    batchListData[iindex].num = 0;
                }
                else {
                    target.val(kvalue);
                    batchListData[iindex].num = Number(kvalue);
                }
                var dataKey = attrName;
                var price = AddGoods_Api.getGoodsAuxPrice(dataKey, batchListData[iindex].num);
                //显示金额而不是单价。当初量更改时重新计算金额
                batchUlList.find('li[index=' + iindex + ']').find(".price")[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(price, batchListData[iindex].num));
                batchListData[iindex].price = price;
                AddGoods_Api.addGoodsDataToCache(dataKey, batchListData[iindex].num, price);
                if (addGoodsList.length > 0) {
                    $(".addgoods .btnok").css("background", "#FF6427");
                } else {
                    $(".addgoods .btnok").css("background", "#aaaaaa");
                }
                calcBatchSumInfo();
            },
            hidefn: function () {
            }
        };
        kdShare.keyBoard.autoshow(config);
    }


    //获取商品属性共享数据
    function getShareData() {
        shareData = AddGoods_Api.getData();
        attrName1 = shareData.attrName1;
        attrName2 = shareData.attrName2;
        attrList1All = shareData.attrList1All;
        attrList2All = shareData.attrList2All;
    }


    //获取购物清单中的数据
    function getCacheData(dataKey) {
        var inum = addGoodsList.length;
        for (var i = 0; i < inum; i++) {
            if (addGoodsList[i].name == dataKey) {
                return addGoodsList[i];
            }
        }
    }


    //构造批量录入界面
    function showBatchList(configp) {
        config = configp;
        $('.addgoods .batchMode .goodsname').find('span')[0].innerHTML = configp.goods.goodsName;
        getShareData();
        getBatchListData();
        var listAttr = getBatchlistAttr();
        var lihead = listAttr.lihead;
        var attrstrSample = listAttr.liAttr;
        var htmlList = [];
        $('.addgoods .batchMode .itemHead')[0].innerHTML = lihead;
        batchUlList.empty();

        var inum = batchListData.length;
        for (var i = 0; i < inum; i++) {
            var item = batchListData[i];
            var attrstr = $.String.format(attrstrSample, {attr1: item.attr1, attr2: item.attr2});
            var listr = $.String.format(sampleBatch, {
                index: i,
                attrinfo: attrstr,
                price: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(item.price, item.num)), //使用总金额而不是单价
                num: item.num
            });
            htmlList.push(listr);
        }
        var htmlStr = htmlList.join("");
        batchUlList.append(htmlStr);

        //根据屏幕宽度 动态计算列宽

        var widthleft = screenWidth - 80 - 75 - 5; //5 右边边框 80 金额  75 数量
        if (!kdAppSet.getIsShowPrice()) {
            widthleft = widthleft + 40; //如果单价隐藏
        }
        var iwidth = widthleft + "px";
        $('.addgoods .batchMode').find(".attrli").css({width: iwidth});
        if (!kdAppSet.getIsShowPrice()) {
            $('.addgoods .batchMode').find(".price").css({"visibility": "hidden"});
        }
        calcBatchSumInfo();
        scrollerBatchList.refresh();
    }


    // 在批量模式中显示合计信息
    function calcBatchSumInfo() {
        var inum = addGoodsList.length;
        var isum = 0;
        var isummoney = 0;
        for (var i = 0; i < inum; i++) {
            isum = isum + Number(addGoodsList[i].num);
            isummoney = isummoney + Number(addGoodsList[i].num) * Number(addGoodsList[i].price);
        }
        var sumDiv = $('.batchMode .sumDiv');
        sumDiv.find('.price')[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(isummoney);
        sumDiv.find('.num')[0].innerHTML = isum;
    }


    //获取批量录入数据
    function getBatchListData() {

        batchListData = [];
        var inum = attrList1All.length;
        var jnum = attrList2All.length;
        var price = config.goods.price;
        var num = "";
        var dataKey = "";

        for (var i = 0; i < inum; i++) {
            var item = {attr1: attrList1All[i]};
            if (jnum > 0) {
                item.attr2 = attrList2All[i];
                dataKey = attrList1All[i] + "/" + attrList2All[i];
            } else {
                dataKey = attrList1All[i];
            }
            var cdata = getCacheData(dataKey);

            if (cdata) {
                price = cdata.price;
                num = cdata.num;
            } else {
                price = config.goods.price;
                num = "";
            }
            item.price = price;
            item.num = num;
            batchListData.push(item);
        }
        if (batchListData.length > 1) {
            batchListData.sort(NameAsc);
        }
    }

    //按名字排序
    function NameAsc(x, y) {
        if (x.attr1 > y.attr1) {
            return 1;
        } else if (x.attr1 < y.attr1) {
            return -1;
        } else if (x.attr1 == y.attr1) {
            if (x.attr2 > y.attr2) {
                return 1;
            } else if (x.attr2 < y.attr2) {
                return -1;
            }
        }
    }

    //构造批量录入 列表动态部分
    function getBatchlistAttr() {
        var headstr = '';
        var liAttr = '';
        var attrWidth = "";
        if (attrList2All.length == 0) {
            attrWidth = "width:100%";
        }

        var attrName1Str=attrName1 || '属性';
        if (attrList1All.length > 0) {
            headstr = '<div style=' + attrWidth + '>' + attrName1Str + '</div>';
            liAttr = '<div style=' + attrWidth + '>{attr1}</div>';
        }

        if (attrList2All.length > 0) {
            headstr = headstr + '<div style=' + attrWidth + '>' + attrName2 + '</div>';
            liAttr = liAttr + '<div style=' + attrWidth + '>{attr2}</div>';
        }

        var lihead = '<div class="attrli">' + headstr + '</div>' +
            ' <div class="price attrHead">金额</div><div class="num">数量</div>';

        return {
            lihead: lihead,
            liAttr: liAttr
        };
    }


    return {
        initView: initView,
        reSetAddGoodsList: reSetAddGoodsList,
        showBatchList: showBatchList
    };

})();