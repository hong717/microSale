/*商品详情页面*/

var GoodsDetail = (function () {
    var viewPage,
        itemdetailarea,
        cartListData,
        cartList,
        config,
        hasInit,
    //在商品详情页中，多次跳转不同商品，并且要回退到上一个商品
        itemIdList,
        Head,
        List;

    //初始化视图
    function initView(param) {
        if (!hasInit) {
            viewPage = $('#view-itemdetail');
            cartListData = {};
            cartList = '';
            bindEvents();

            PopMenu.bindWithBtn('pop-menu-btn');
            $('#pop-menu-btn').find('img').attr('src', 'img/menubtn_normal.png');
            $('.view_itemdetail .menu_share img').attr('src', 'img/menuShare.png');
            $('.view_itemdetail .goodsinfoList .collect img').attr('src', 'img/menuCollect.png');

            itemIdList = [];

            Head = GoodsDetail_Head;
            Head.initView(viewPage, param);
            List = GoodsDetail_List;
            List.initView(viewPage, param);


            hasInit = true;
        }


    }


    function render(param) {
        config = param || {};
        initView(config);
        config.hasLoaded = false;
        Head.render(config);
        List.render(config);
        show(true);
        Head.freshImgList([]);
        var itemTop = viewPage.find('.itemdetail-top');
        var itemReturn = viewPage.find('#itemdetail_Return');
        var itemArea = viewPage.find('#itemdetailarea');

        //是否商品分享
        if (!config.shareGoodsId) {
            itemTop.hide();
            itemReturn.hide();
            itemArea.css("top", "0");
            var data = config.item;
            List.initGoodsMore([]);
            List.loadData(data);
            List.getItemAuxInfo(data.itemid, config);
        } else {
            //微信商品分享页面过来
            config.item = {};
            List.getItemAuxInfo(config.shareGoodsId, config);
            itemTop.show();
            itemReturn.show();
            itemArea.css("top", "45px");
            OptAppMenu.showKdAppMenu(false);
        }
    }

    /*
     //回退时重定向商品
     function redirectGoods(itemid) {
     Head.freshImgList([]);
     config = { item: {} };
     config.shareGoodsId = "";
     List.loadData({});
     List.getItemAuxInfo(itemid);
     }*/


    function AddGoodsToCart(buytype) {
        var goodsimg = config.item.img;
        if (goodsimg instanceof Array) {
            goodsimg = config.item.img[0];
        }
        var goodsinfo = {
            expoint: config.item.expoint,
            onlyexpoint: config.item.onlyexpoint,
            auxcount: config.item.auxcount,
            itemid: config.item.itemid,
            isoverseas: config.item.isoverseas || 0,
            model: config.item.model,
            note: config.item.note,
            price: config.item.price,
            maxprice: config.item.maxprice,
            unitid: config.item.unitid,
            unitname: config.item.unitname,
            stocknum: config.item.num,
            goodsName: config.item.name,
            goodsImg: goodsimg,
            newflag: "display:none;",
            cuxiaoflag: "display:none;"
        };

        AddGoods.showAttr({ goods: goodsinfo, buytype: buytype });

    }

    function bindEvents() {

        viewPage.delegate('.addToCart', { //加入购物车 处理
                'click': function () {
                    if (!config.hasLoaded) {
                        OptMsg.ShowMsg('数据加载中，请稍后操作...');
                        return;
                    }
                    AddGoodsToCart('add');
                    kdAppSet.h5Analysis('goodsDetail_add');
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215', color: '#fff' });
                },
                'touchend': function () {
                    $(this).css({ background: '#fff', color: '#ff6427' });
                }
            }
        )
            .delegate('#itemdetail_buy', {         //立即购买处理
                'click': function () {
                    if (!config.hasLoaded) {
                        OptMsg.ShowMsg('数据加载中，请稍后操作...');
                        return;
                    }
                    AddGoodsToCart('buy');
                    kdAppSet.h5Analysis('goodsDetail_buy');
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215' });
                },
                'touchend': function () {
                    $(this).css({ background: '#FF6427' });
                }
            }
        )
            .delegate('#itemdetail_Return', { //商品分享时  回到微订货主页显示
                'click': function () {
                    MiniQuery.Event.trigger(window, 'toview', ['Home', {}]);
                },
                'touchstart': function () {
                    $(this).find('.triangle').css('border-right-color', "#EF5215");
                },
                'touchend': function () {
                    $(this).find('.triangle').css('border-right-color', "#FF6427");
                }
            })
            .delegate('.collect', 'click', function () {
                var _this = this;
                var img = $(_this).find('img')[0];
                List.postCollectInfo(img);
                kdAppSet.h5Analysis('goodsDetail_collect');
            })
            .delegate('.pre a', 'click', function () {
                /*                var href = this.hash;
                 href = decodeURIComponent(href.substring(1));
                 // MiniQuery.Event.trigger(window, 'toview', ['commonIframe', {src: href}]);
                 itemIdList.push(config.item.itemid);
                 MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', {item: {itemid: 549}}]);*/
                return false;
            })
            .delegate('#menu_share_btn', 'click', function () {
                kdShare.openChat(config.item || {});
            });

    }


    function show(forward) {
        CacheList.hide();
        viewPage.show();
        if ($('#view-addgoods').css('display') == 'block') {
            $('#divlistMark').show();
        }
        /*        if (!forward) {
         if (itemIdList.length > 0) {
         redirectGoods(itemIdList.pop());
         }
         }*/
    }

    function hide() {
        viewPage.hide();
        kdAppSet.wxShareInfo({});
        $("#wxShareMark").click();
        $('#divlistMark').hide();
    }


    return {
        render: render,
        show: show,
        hide: hide
    };
})();

