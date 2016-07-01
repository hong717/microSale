/*商品列表页面*/

var GoodsList = (function () {
    //商品列表div视图
    var viewPage,
        hasInit,
        firstLoad,
        tabNum,
    //列表显示 0 小图列表 1大图列表
        listType,
        fromPage, //记录从哪个页面跳转来的
        List,
        Category,
        Footer;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid_goodslist');
            tabNum = 1;
            listType = 0;
            PopMenu.bindWithBtn('goodsList_popMenu');
            viewPage.find('.headtab img').addClass('sprite-list_img');
            bindEvents();
            var moneySum = viewPage.find('[data-cmd="money"]');
            kdAppSet.getIsShowPrice() ? moneySum.show() : moneySum.hide();
            List = GoodsList_List;
            List.init();
            Category = GoodsList_Category;
            Footer = GoodsList_Footer;
            hasInit = true;

        }
    }


    //事件绑定
    function bindEvents() {

        //刷新商品列表
        MiniQuery.Event.bind(window, {
            'GoodsList_refresh': function () {
                List && List.sort();
            }
        });

        viewPage.delegate('#toClassSearch', {
            'click': function () {
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['GoodsSearch', { noBack: true }]);
                kdAppSet.h5Analysis('goodsList_search');
            }
        })
            .delegate('#listviewtype', {
                'click': function () {
                    //切换列表显示模式
                    listType = (listType + 1) % 2;
                    List.refresh({ listType: listType });
                    var tabimg = viewPage.find('.listviewtype img');
                    if (listType == 0) {
                        tabimg.removeClass('sprite-list_row');
                        $(List.listWrap()).addClass('list-bgcolor');
                        tabimg.addClass('sprite-list_img');
                    } else if (listType == 1) {
                        tabimg.removeClass('sprite-list_img');
                        $(List.listWrap()).removeClass('list-bgcolor');
                        tabimg.addClass('sprite-list_row');
                    }
                    kdAppSet.h5Analysis('goodsList_bigImg');
                }
            })
            .delegate('.goodsListBox', {
                //去购物车
                'click': function () {
                    kdAppSet.stopEventPropagation();
                    MiniQuery.Event.trigger(window, 'toview', ['CacheList']);
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215', color: '#fff' });
                },
                'touchend': function () {
                    $(this).css({ background: '#fff', color: '#ff6427' });
                }
            }
        )
            .delegate('#back-div', {
                'click': function () {
                    switch (fromPage) {
                        case 0:
                            kdShare.backView();
                            break;
                        case 1:
                            kdShare.backView();
                            break;
                    }
                }
            })
            .delegate('[data-cmd="order"]', {
                'click': function () {
                    MiniQuery.Event.trigger(window, 'toview', ['GoodsListSort', { callBack: List.sort }]);
                }
            });
    }


    function isEmpty(obj) {
        for (var i in obj) {
            return false;
        }
        return true;
    }

    function render(config) {
        initView();
        config = config || {};
        if (isEmpty(config) && List.searchKey().tabindex != 0) {
            //如果是新品或者促销 则刷新商品
            config.reload = true;
        }
        config.ItemType = 1099;
        config.MiddleType = '';
        config.ChildType = '';
        var cItemType = config.ItemType;
        var cChildType = config.ChildType;

        show();
        if (!firstLoad || config.reload) {
            renderBackButton(config.fromPage);
            Footer.render({
                listWrap: List.listWrap(),
                listviewobj: List.listviewobj()
            });
            var hideCategory = config.hideCategory;

            if (config.MiddleType) {
                hideCategory = true;
                config.ItemType = config.MiddleType;
            }
            config.ItemType = config.ChildType || config.MiddleType || config.ItemType;
            var categoryType = kdAppSet.getUserInfo().cmpInfo.categoryType;
            if (hideCategory) {
                Category.hide();
                getGoodsListData(config);
            }
            else {
                //横排菜单显示
                if (categoryType == 1) {
                    Category.render({
                        ItemType: cItemType,
                        ChildType: cChildType,
                        fn: function () {
                            getGoodsListData(config);
                        }
                    });
                } else {
                    getGoodsListData(config);
                }
            }
            firstLoad = true;
        }

    }

    function getGoodsListData(config) {

        /*        getItemListData({
         //搜索类型 0 全部 1促销 2新品
         tabindex: config.tabindex || 0,
         //搜索关键字
         keyword: config.keyword || '',
         //标题
         title: config.title || '',
         ItemType: config.ItemType || -1,
         TagList: config.taglist || []
         });*/
        List.render({
            //搜索类型 0 全部 1促销 2新品
            tabindex: config.tabindex || 0,
            //搜索关键字
            keyword: config.keyword || '',
            //标题
            title: config.title || '',
            ItemType: config.ItemType || -1,
            TagList: config.taglist || []
        });


    }

    /*
     * 处理回退按钮，不同入口显示不同样式
     * param index {number}: 入口值, 0 为主页，1 为类目，其他值为搜索
     * */
    function renderBackButton(index) {
        fromPage = +index;
        var $div = $('#back-div');
        var $title = $div.find('.title');
        var $searchBox = $('#toClassSearch');
        switch (fromPage) {
            case 0:
                $div.show();
                togglerBack('sprite-main');
                $searchBox.addClass('hasBackDiv');
                $title.text('主页');
                break;
            case 1:
                $div.show();
                togglerBack('sprite-order');
                $searchBox.addClass('hasBackDiv');
                $title.text('商品');
                break;
            default:
                $searchBox.removeClass('hasBackDiv');
                $div.hide();
        }
    }

    function togglerBack(className) {
        var $icon = $('#back-div .icon-category');
        $icon.removeClass('sprite-order');
        $icon.removeClass('sprite-order');
        $icon.addClass(className);
    }

    function renderFooter() {
        return Footer ? Footer.render({
            listWrap: List.listWrap(),
            listviewobj: List.listviewobj()
        }) : function () {
        };
    }

    function show() {
        viewPage.show();
        kdAppSet.setKdLoading(false);
        renderFooter();
        GoodsList_Opt.refresh();
    }

    function hide() {
        PopMenu.hideElem();
        viewPage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide,
        renderFooter: renderFooter
    };

})();

