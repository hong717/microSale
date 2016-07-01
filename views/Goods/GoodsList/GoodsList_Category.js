/*类目模块*/

var GoodsList_Category = (function () {
    var list;
    var tree = [];
    var hasInit;
    var hasconfig = true;
    var List;
    var Api;
    var $wrap = $('#div-category-wrap');
    var lisamples, ItemSamples;
    var hasInitlevel = 1;//总级数
    var liListView = [];//类目
    var currlevel = 1;//当前级别 从1算起

    function render(config) {
        //初始化
        load(function (arr) {
            init(config);
            if (arr.length < 1) {
                hide();
                return;
            }
            $wrap.show();
            fillCategory(-1, arr, currlevel);
            setCategorySelected(config);
            config.fn && config.fn();
        });
    }

    function getIndex(ItemType) {
        for (var i in list) {
            if (ItemType == list[i].Id) {
                return list[i].index;
            }
        }
        return -2;
    }

    //设置选中某个一级类目 根据FItemID的值来判断--暂时保留--mayue
    function setCategorySelected(config) {

        //TODO 根据level计算
        config = config || {};
        var ItemType = config.ItemType || '';
        var findli = $('#div-category-1 li[data-index="' + getIndex(ItemType) + '"]');
        var licate = $('#div-category-1 li');
        var elem = findli.length > 0 ? findli[0] : licate[0];
        selectCategory($(elem), config);

        //是否需要选中2级菜单
        if (config) {
            var ChildType = config.ChildType || '';
            if (ChildType) {
                family(ChildType);
                var a = 2;
                for (var i = alist.length - 1; i > 0; i--) {
                    var findli = $('#div-category-' + a + ' li[data-index="' + getIndex(alist[i - 1]) + '"]');
                    var licate = $('#div-category-' + a + ' li');
                    var elem = findli.length > 0 ? findli[0] : licate[0];
                    selectCategory($(elem), config);
                    a = a + 1;
                    console.log(alist[i - 1]);
                }
            }
        }
        List.clear();
    }

    //生成树
    var alist = [];
    function family(ChildType) {
        var child = [];
        for (i = 0; i < list.length; i++) {
            if (ChildType == list[i].Id) {
                child = list[i];
            }
        }
        alist.push(ChildType);
        for (i = 0; i < list.length; i++) {
            if (child.parent == list[i].Id) {
                family(list[i].Id);
            }
        }
    }


    //加载数据 获取类目数据
    function load(fn) {
        if (list !== undefined) {
            fn && fn(tree);
            return;  //类目更新频率低，启用缓存数据
        }
        Lib.API.get('GetItemClass', {
            currentPage: 1,
            ItemsOfPage: 1000,
            para: {}
        }, function (data, json) {
            hasInitlevel = data.totallevel;
            list = MiniQuery.Array.keep(data.itemlist, function (item, index) {
                return {
                    Id: item.FItemID,
                    name: item.FName,
                    number: item.FNumber,
                    parent: item.FParentID,
                    level: item.FLevel,
                    index: index,
                }
            });
            toTree(list);
            fn && fn(tree);
        }, function (code, msg) {

        }, function () {

        });
    }

    //获取一级类目
    function toTree(list) {
        MiniQuery.Array.each(list, function (item, index) {
            if (item.parent == 0) {
                tree.push(item);
            }
        });
    }
    //mayue--获取子类目
    function getChildNodeByID(id) {
        var childeNode = [];
        for (i = 0; i < list.length; i++) {
            if (id == list[i].parent) {
                childeNode.push(list[i]);
            }
        }
        return childeNode;
    }

    //填充横排类目
    function fillCategory(id, list, currlevel) {
        if (currlevel > liListView.length) {
            return;
        }
        liListView[currlevel - 1].ItemList.innerHTML = $.String.format(ItemSamples.ul, {
            'all': $.String.format(ItemSamples.all, {
                'ItemId': id
            }),
            'item': MiniQuery.Array.keep(list, function (item, index) {
                return $.String.format(ItemSamples.item, {
                    'index': item.index,
                    'name': item.name,
                    'ItemId': item.Id,//可无
                    'dataindex': index + 1
                });
            }).join('')
        });

        setTimeout(function () {
            var last = $(liListView[currlevel - 1].ItemList).find('li[data-index]').last()[0];
            $(liListView[currlevel - 1].ItemList).width(last.offsetLeft + last.clientWidth);
        }, 0);
        setTimeout(function () {
            liListView[currlevel - 1].scroller.refresh();
        }, 1000);
    }

    function init() {
        if (!hasInit) {
            List = GoodsList_List;
            Api = GoodsList_Api;
            lisamples = $.String.getTemplates($wrap[0].innerHTML, [
                {
                    name: 'liList',
                    begin: '#--li.begin--#',
                    end: '#--li.end--#'
                }
            ]);

            ItemSamples = $.String.getTemplates($wrap[0].innerHTML, [
                 {
                     'name': 'ul',
                     'begin': '#--ul.begin--#',
                     'end': '#--ul.end--#'
                 },
               {
                   'name': 'all',
                   'begin': '#--all.begin--#',
                   'end': '#--all.end--#',
                   'outer': '{all}'
               },
               {
                   'name': 'item',
                   'begin': '#--item.begin--#',
                   'end': '#--item.end--#',
                   'outer': '{item}'
               },
            ]);
            initHtml();
            initLiListView();
            bindEvents();
            hasInit = true;
        }
    }

    //初始化类目列表页面容器
    function initHtml() {
        $wrap[0].innerHTML = "";
        for (i = 1; i <= hasInitlevel; i++) {
            $wrap[0].innerHTML += $.String.format(lisamples.liList, {
                'liId': 'div-category-' + i,
                'level': i
            });
        }
    }

    //创建类目列表滑动组件
    function initLiListView() {
        for (i = 1; i <= hasInitlevel; i++) {
            var ItemList = $('#div-category-' + i).find('ul')[0];
            var scroller = KISP.Scroller.create('#div-category-' + i, { scrollX: true, scrollY: false, scrollbars: false });
            var listview = {
                ItemList: ItemList,
                scroller: scroller,
            };
            liListView.push(listview);
        }
    }

    //绑定类目列表事件 
    function bindEvents() {
        for (i = 1; i <= hasInitlevel; i++) {
            $('#div-category-' + i).delegate('li', 'click', function () {
                if (Api.apiLock()) {
                    OptMsg.ShowMsg('数据加载中，请稍后操作...');
                    return;
                }
                selectCategory($(this));
                List.clear();
                List.getItemlist();
            });
        }
    }

    //选择类目
    function selectCategory($click, config) {
        currlevel = parseInt($click.parent().parent().attr('data-level'));//获取当前level
        var index = $click.attr('data-index')
        var id = $click.attr('data-ItemId');
        var childNode = getChildNodeByID(id);
        if (childNode.length > 0 && index > -1) {
            if (currlevel < liListView.length) {
                currlevel = currlevel + 1;
                fillCategory(id, childNode, currlevel);
            }
        }
        toggleChild(currlevel);
        changeActive($click);
        List.searchKey().ItemType = id;
    }

    //子目錄
    function toggleChild(index) {
        $('div-ategory-' + index).css('-webkit-transform', 'translate(0,0)');
        var Listtop = 1.72 + 0.82 * (index - 1);
        $(List.listWrap()).css('top', Listtop + 'rem');//顶部
        var Listscroller = 1.82 + 0.82 * (index - 1);
        List.listviewobj().scroller.noticetop = Listscroller;
        List.listviewobj().scroller.refresh();
    }

    //选中样式
    function changeActive($click) {
        var dataindex = $click.attr('data-dataindex')
        var li = $click.parent().find('[data-cmd="li"]');
        li.removeClass("active");
        li.eq(dataindex).addClass("active");
    }

    function hide() {
        $wrap.hide();
        if (List) {
            $(List.listWrap()).css('top', 0.9 + 'rem');//顶部
            List.listviewobj().scroller.noticetop = 1.1;
        }
    }

    return {
        render: render,
        hide: hide
    }
})();