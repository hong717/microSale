/*
 *
 * 输入搜索关键字以及点击搜索历史记录查找商品
 * 历史记录保存在客户端
 */

var GoodsSearch = (function () {
    //搜索视图
    var viewPage,
    //搜索历史列表
        historyList,
    //是否已初始化
        hasInit,
    //是否已绑定事件
        hasBind,
    //搜索历史列表滚动scroll
        scroller,
        scrollerFilter,
        ullist,
        ulFilter,
        viewSample,
        sampleFilter,
        searchTxt,
        listFilter,
        selected,
        vheight,
        historyCacheKey;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid_searchPage');
            ullist = viewPage.find(".historyList")[0];
            viewSample = $.String.between(ullist.innerHTML, '<!--', '-->');
            var divList = document.getElementById('viewid_searchPage_content');
            var divFilter = document.getElementById('div_viewid_searchPage_filter');
            scroller = Lib.Scroller.create(divList);
            scrollerFilter = Lib.Scroller.create(divFilter);
            historyCacheKey = "searchHistoryKeyWords";
            historyList = [];
            selected = 'on sprite-btn-filter';
            searchTxt = $('.view_searchPage #inputTxt');
            ulFilter = document.getElementById('viewid_searchPage_filter');
            sampleFilter = $.String.between(ulFilter.innerHTML, '<!--', '-->');
            bindEvents();
            listFilter = kdAppSet.getUserInfo().taglist;
            vheight = $(window).height();
            hasInit = true;
        }
    }

    function resize() {
        //这里会执行2次 以后可优化
        var viewFilter = viewPage.find('.filter');
        if (vheight != $(window).height()) {
            viewFilter.hide();
        } else {
            viewFilter.show();
        }
    }


    //数组排序 key 排序字段 asc 是否升序
    function keySort(key, asc) {
        return function (x, y) {
            if (x[key]) {
                return asc ? 1 : -1;
            } else if (y[key]) {
                return asc ? -1 : 1;
            }
            return 0;
        }
    }

    //填充过滤tag数据
    function fillFilter() {

        listFilter.sort(keySort('selected'));
        ulFilter.innerHTML = $.Array.keep(listFilter, function (item, index) {
            return $.String.format(sampleFilter, {
                id: item.id,
                name: item.name,
                selected: item.selected ? selected : ''
            });
        }).join('');
        var viewFilter = viewPage.find('.filter');
        listFilter.length > 0 ? viewFilter.show() : viewFilter.hide();
        scrollerFilter.scrollTo(0, 0);
        scrollerFilter.refresh();
    }

    function getTaglist() {
        var listid = [];
        var list = listFilter;
        var item;
        for (var i in list) {
            item = list[i];
            if (item.selected) {
                listid.push(item.id);
            }
        }
        return listid;
    }

    // 消除字符串两端空格
    function getTrimStr(str) {
        var reg = new RegExp('(^\\s*)|(\\s*$)', 'g');
        return str.replace(reg, '');
    }

    // 获取localStorage中的历史记录
    function getHistoryList() {
        if (window.localStorage[historyCacheKey]) {
            historyList = window.JSON.parse(window.localStorage[historyCacheKey]);
        }
    }

    // 将 历史记录保存到localStorage中
    function setHistoryList() {
        window.localStorage[historyCacheKey] = window.JSON.stringify(historyList);
    }


    // 保存输入的查询字符串
    function saveSearchTxt() {
        var inputTxt = searchTxt.val();
        var tempList = [];

        inputTxt = getTrimStr(inputTxt);
        if (inputTxt == '') {
            return false;
        }

        // 最新的搜索出现在历史列表的最前面
        tempList.push(inputTxt);
        // 如果输入的文本与历史记录中的相同，将历史记录中的删除
        for (var i = 0; i < historyList.length && i < 3; i++) {
            if (historyList[i] != inputTxt) {
                tempList.push(historyList[i]);
            }
        }
        historyList = tempList;
        setHistoryList();
    }

    // 填充历史记录列表
    function fillList(data) {
        ullist.innerHTML = $.Array.keep(data, function (item, index) {
            return $.String.format(viewSample, {
                historyTxt: item
            });
        }).join('');
        if (data.length == 0) {
            ullist.innerHTML = '';
            displayClearBtn();
        }
    }

    // 显示与隐藏清楚记录按键
    function displayClearBtn() {
        var clearBtn = $('.view_searchPage .clearDiv');
        var emptyDiv = $('.view_searchPage .emptyDiv');
        if (historyList.length > 0) {
            emptyDiv.css('display', 'none');
            clearBtn.css('display', 'block');
        } else {
            clearBtn.css('display', 'none');
            emptyDiv.css('display', 'block');
        }
    }


    function serach() {
        var KeyWord = $(searchTxt).val();
        var newkey = kdShare.ReplaceSChar(KeyWord);

        if (newkey != KeyWord) {
            searchTxt.val(newkey);
        }
        saveSearchTxt();
        var taglist = getTaglist();
        //noRepeat true 回退时 不能重复
        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {noRepeat: true, title: '商品搜索',
            tabindex: 0, keyword: newkey, hideCategory: false, taglist: taglist, reload: true}]);
        searchTxt.val('');
        fillList(historyList);
        displayClearBtn();
    }

    // 绑定事件
    function bindEvents() {

        viewPage.delegate('.searchTxt .imgClear', {
            'click': function () {
                searchTxt.val('');
                searchTxt.focus();
            }
        });

        // 阻断form表单默认事件
        viewPage.delegate('.searchTxt form', {
            'submit': function () {
                serach();
                return false;  //阻断
            }
        });

        //搜索按钮 事件
        viewPage.delegate('.cancelBtn', {
            'click': function () {
                serach();
                return false;  //阻断
            },
            'touchstart': function () {
                $(this).css({ 'background-color': '#ccc' });
            },
            'touchend': function () {
                $(this).css({ 'background-color': '#EFEFEF' });
            }
        });

        viewPage.delegate('.historyList li', {
            'click': function () {
                searchTxt.val(this.innerHTML);
            },
            'touchstart': function () {
                $(this).css({ 'background-color': '#ccc' });
            },
            'touchend': function () {
                $(this).css({ 'background-color': '#f5f5f5' });
            }
        }).delegate('.filter li', {
            'click': function () {
                var id = this.getAttribute('data-id');
                var list = listFilter;
                var item;
                for (var i in list) {
                    item = list[i];
                    if (item.id == id) {
                        item.selected = !!item.selected;
                        item.selected = !item.selected;
                        item.selected ? $(this).addClass(selected) : $(this).removeClass(selected);
                        break;
                    }
                }
            }});

        viewPage.delegate('.clearDiv input', {
            'click': function () {
                historyList = [];
                setHistoryList();
                ullist.innerHTML = '';
                displayClearBtn();
            },
            'touchstart': function () {
                $(this).css({ 'background-color': '#ccc' });
            },
            'touchend': function () {
                $(this).css({ 'background-color': '#f5f5f5' });
            }
        });
    }


    // 页面构建函数
    function render() {
        initView();
        show();
        getHistoryList();
        displayClearBtn();
        fillList(historyList);
        fillFilter();
        searchTxt.val('');
        searchTxt.focus();
    }

    function show() {
        viewPage.show();
        kdAppSet.setAppTitle('商品搜索');
        window.addEventListener('resize', resize);
    }


    return {
        render: render,
        show: show,
        hide: function () {
            viewPage.hide();
            kdAppSet.setAppTitle('');
            window.removeEventListener("resize", resize);
        }
    };
})();
