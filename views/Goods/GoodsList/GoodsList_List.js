var GoodsList_List = (function () {

    var hasInit;
    var hintText;
    var listWrap;
    var listviewobj;
    var iheight;
    //商品查找条件
    var searchKey;
    var sample;
    var sample2;
    //页签 0 全部 1新品 2 促销
    var curTabIndex;
    var itemsOfPage;
    var lastCalled;
    //列表排序
    var sortInfo;
    //大小图模式切换
    var listType;
    var Api;


    //需要直接加入购物车模式 的 企业号，特别处理
    var eidList = [ '2467638','4148788','326919','2276683','4547956'];

    //初始化列表视图数据
    function init() {
        if (!hasInit) {
            sortInfo = {};
            searchKey = {};
            curTabIndex = -1;
            itemsOfPage = 10;
            lastCalled = 0;
            Api = GoodsList_Api;
            listType = 0;
            listWrap = document.getElementById('goodslist_listwrap');
            $(listWrap).addClass('list-bgcolor');
            hintText = "商品名称/规格型号/商品代码";
            var samples = document.getElementById('goodslist_list').innerHTML;

            var eid = kdAppSet.getAppParam().eid;
            var qInput = (eidList.indexOf(eid) >= 0);
            //qInput=kdAppSet.getUserInfo().quickInput;
            sample = qInput ? $.String.between(samples, '<!--3', '3-->') : $.String.between(samples, '<!--1', '1-->');

            sample2 = $.String.getTemplates(samples, [
                {
                    name: 'li',
                    begin: '<!--2',
                    end: '2-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                }
            ]);
            listviewobj = {
                listv: document.getElementById('goodslist_list'),
                scroller: Lib.Scroller.create(listWrap),
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh: false
            };
            iheight = $(window).height() - 44;

            initScroll(listviewobj);
            bindEvents(listviewobj.listv);
            sortInfo={
                'SortType':5,
                'SortDirect':'desc'
            };
            hasInit = true;
        }
    }


    function showGoodsDetail(index) {
        var item = listviewobj.listdata[index];
        kdAppSet.stopEventPropagation();
        MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: item }]);
    }

    function getGoods($this) {
        var pctrl = $this.parent();
        var index = pctrl.attr('data-index');
        var data = listviewobj.listdata[index];
        return  Api.format(data);
    }

    function bindEvents(listv) {

        $(listv).delegate('.infoDiv', {
            'touchstart': function () {
                $(this).parent().css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).parent().css('background', '#fff');
            }
        })
            .delegate('.infoDiv', 'click', function () {
                var index = $(this).parents('li').attr('data-index');
                showGoodsDetail(index);
                return false;
            })
            .delegate('.imgbox', 'click', function () {
                var index = $(this).attr('data-index');
                showGoodsDetail(index);
                return false;
            })

            .delegate('[data-cmd="-"]', 'click', function () {

                var pctrl = $(this).parent();
                var goods = getGoods($(this));
                var num = Number(pctrl.find('[data-cmd="input"]')[0].innerText || 0);
                if (num >= 1) {
                    num = num - 1;
                    goods.num = num;
                    num >= 1 ? GoodsList_Opt.update(goods) : GoodsList_Opt.del(goods);
                    pctrl.find('[data-cmd="input"]')[0].innerText = num ? num : '';
                    num == 0 ? $(this).addClass('hide') : '';
                    refreshFooter();

                }
            })
            .delegate('[data-cmd="+"]', 'click', function () {

                var pctrl = $(this).parent();
                var goods = getGoods($(this));
                var num = Number(pctrl.find('[data-cmd="input"]')[0].innerText || 0);
                num = num + 1;
                goods.num = num;
                GoodsList_Opt.update(goods);
                pctrl.find('[data-cmd="input"]')[0].innerText = num;
                var li = pctrl.find('[data-cmd="-"]');
                num >= 0 ? li.removeClass('hide') : '';
                refreshFooter();

            })
            .delegate('[data-cmd="input"]', 'click', function () {
                var pctrl = $(this).parent();
                var goods = getGoods($(this));
                var num = Number(pctrl.find('[data-cmd="input"]')[0].innerText || 0);

                var config = {
                    name: '',
                    input: num,
                    allowZero: true,
                    hint: "无效数据!",
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            kvalue = 0;
                        }
                        goods.num = kvalue;
                        kvalue == 0 ? GoodsList_Opt.del(goods) : GoodsList_Opt.update(goods);
                        pctrl.find('[data-cmd="input"]')[0].innerText = (kvalue == 0 ? '' : kvalue);
                        var li = pctrl.find('[data-cmd="-"]');
                        kvalue == 0 ? li.addClass('hide') : li.removeClass('hide');
                        refreshFooter();
                    }
                };
                kdShare.keyBoard.autoshow(config);

            })

            .delegate('.addBtn, .icon-buy', {
                'click': function (e) {
                    //加入购物车
                    var index = $(this).parents('li').attr('data-index') || $(this).parents('.imgbox').attr('data-index');
                    var data = listviewobj.listdata[index];
                    var goodsinfo = Api.format(data);
                    e.stopPropagation(); //防止冒泡,区别下方法
                    kdAppSet.stopEventPropagation();
                    AddGoods.showAttr({ goods: goodsinfo, buytype: 'list' });
                    kdAppSet.h5Analysis('goodsList_add');
                },
                'touchstart': function () {
                    $(this).addClass('sprite-buy');
                    $(this).removeClass('sprite-buy_s');
                },
                'touchend': function () {
                    $(this).addClass('sprite-buy_s');
                    $(this).removeClass('sprite-buy');
                }
            }
        );
    }


    function refreshFooter() {

        /*        var eid = kdAppSet.getAppParam().eid;
         if (eidList.indexOf(eid) >= 0 && data.auxcount == 0) {
         GoodsList_Opt.update(goodsinfo);
         OptMsg.ShowMsg('已加入购物车');
         GoodsList.renderFooter();
         } else {

         }*/
        GoodsList.renderFooter();
    }

    function initScroll(listview) {
        var option = {
            hinttop: 1.8,
            fnfresh: function (reset) {
                listview.currentPage = 1;
                listview.listdata = [];
                getItemlist('', reset);
            },
            fnmore: function (reset) {
                getItemlist('', reset);
            }
        };
        listview.scroller.fnscroll = fnscroll;
        kdctrl.initkdScroll(listview.scroller, option);
    }

    function fnscroll(bfresh) {
        var now = new Date,
            wait = 250,
            remaining = wait - (now - lastCalled);
        if (remaining <= 0 || bfresh) {
            lastCalled = now;
            freshImgList();
        }
    }


    function render(searchInfo) {

        var taglist = searchKey.TagList || [];
        var skey = searchInfo.tabindex + searchInfo.keyword + searchInfo.ItemType + searchInfo.TagList.join('');
        var curkey = searchKey.tabindex + searchKey.keyword + searchKey.ItemType + taglist.join('');

        kdAppSet.setAppTitle(searchInfo.title);
        if (curkey != skey || searchInfo.reload) {
            searchKey = searchInfo;
            $('#txtSearch').val(searchKey.keyword || hintText);
            clear();
            curTabIndex = searchKey.tabindex;
            listviewobj.currentPage = 1;
            listviewobj.totalPageCount = 1;
            listviewobj.listdata.length = 0;
            getItemlist();
            listviewobj.fresh = true;
        }
        listviewobj.scroller.refresh();
    }


    function clear() {
        listviewobj.currentPage = 1;
        listviewobj.totalPageCount = 1;
        listviewobj.listdata.length = 0;
        var scroll = listviewobj.scroller;
        scroll.scrollTo(0, 0);
        listviewobj.listv.innerHTML = '';
        scroll.refresh();
    }


    //错误刷新
    function errorRefresh(tabindex) {
        listviewobj.currentPage = 1;
        listviewobj.listdata = [];
        getItemlist(tabindex);
    }

    //获取下一页参数
    function getQueryParam(index) {
        var listview = listviewobj;
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            return;
        }
        return {
            currentPage: listview.currentPage,
            ItemsOfPage: itemsOfPage,
            para: {
                keyword: kdAppSet.ReplaceJsonSpecialChar(searchKey.keyword || ''),
                option: index,
                SortType: sortInfo.SortType || 0,
                SortDirect: sortInfo.SortDirect || 'desc',
                ItemType: searchKey.ItemType,
                TagList: searchKey.TagList || []
            }
        };
    }


    function getItemlist(index, fnReset) {
        if (index == undefined || index == '') {
            index = curTabIndex;
        }
        var para = getQueryParam(index);
        //达到最后一页
        if (!para) {
            fnReset && fnReset();
            return;
        }
        var ullist = $(listviewobj.listv);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        }

        //填充数据列表--mayue
        GoodsList_Api.get(
            {
                listviewobj: listviewobj,
                tabIndex: curTabIndex,
                itemsOfPage: itemsOfPage,
                errorRefresh: errorRefresh
            },
            function (data) {
                var listview = listviewobj;
                setListData(data, listview.listdata);
                var listStr = '';
                if (listType == 0) {
                    listStr = getDatalistRow(data);
                } else if (listType == 1) {
                    listStr = getDatalistImg(data);
                }

                if (listview.currentPage > 1) {
                    listview.listv.innerHTML += listStr;
                } else {
                    listview.listv.innerHTML = listStr;
                    if (listStr == "") {
                        listview.listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
                    }
                }
                GoodsList_Opt.refresh();
                listview.scroller.refresh();
                listview.currentPage += 1;
                setPriceVisiable();
                freshImgList();
                kdAppSet.setKdLoading(false);
            }, para, fnReset);
    }


    function setListData(data, listData) {
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            listData.push(data[i]);
        }
    }

    //列表排序 以及做 刷新列表使用
    function sort(sort) {
        listviewobj.currentPage = 1;
        listviewobj.listdata = [];
        if (sort) {
            sortInfo = {
                SortType: sort.key || '0',
                SortDirect: sort.asc ? 'asc' : 'desc'
            };
            kdAppSet.setKdLoading(true, '正在排序数据...');
        }
        listviewobj.scroller.scrollTo(0, 0);
        getItemlist('');
        /*
         SortType --- 排序类型：-1--默认排序（按商品上架时间）；
         0--商品上架时间；1--按价格；2--按销量；3--商品名称；4--物料代码
         SortDirect ---排序方向："desc"--降序，“asc”--升序
         */
    }


    //刷新列表信息

    function refresh(config) {
        listType = config.listType;
        var listview = listviewobj;

        var listStr = '';
        if (listType == 0) {
            listStr = getDatalistRow(listview.listdata);
        } else if (listType == 1) {
            listStr = getDatalistImg(listview.listdata);
        }

        listview.listv.innerHTML = listStr;
        //mayue 原来是用 listStr == "" 作为条件，导致先出现了空数据页面
        if (listview.totalPageCount == 0) {
            listview.listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
        }
        var scroll = listview.scroller;
        scroll.refresh();
        setPriceVisiable();
        //刷新图片
        freshImgList();
    }


    //获取小图列表html
    function getDatalistRow(data) {
        return $.Array.keep(data, function (item) {
            return getStrByTemplate(item);
        }).join('');
    }

    //获取大图列表html
    function getDatalistImg(data) {
        var listdata = [];
        var rowlist = null;
        for (var i = 0, inum = data.length; i < inum; i++) {
            var knum = i % 2;
            if (knum == 0) {
                rowlist = [];
                rowlist.push(data[i]);
                listdata.push(rowlist);
            } else {
                rowlist.push(data[i]);
            }
        }
        return $.Array.keep(listdata, function (itemArr) {
            return getStrByTemplate2(itemArr);
        }).join('');
    }


    //获取小图模板数据
    function getStrByTemplate(item) {

        var priceStr = kdAppSet.getPriceStr(item);
        var stockinfo = kdAppSet.getStockStr(item.num, item.unitname);
        var stockmsg = stockinfo.stockStr;
        var colormsg = stockinfo.color;

        if (!sample) {
            var samples = document.getElementById('goodslist_list0').innerHTML;
            sample = $.String.between(samples, '<!--', '-->');
        }

        var strHtml = $.String.format(sample, {
            index: item.index,
            img: item.imgThumbnail,
            number: item.number,
            name: item.name,
            itemid: item.itemid,
            price: priceStr,
            model: item.model,
            stockmsg: stockmsg,
            colormsg: colormsg,
            cuxiao: item.note,
            //积分
            oldprice: item.maxprice + '/' + item.unitname,
            "xcust-old-price": (!item.expoint && item.maxprice == item.price) ? "xcust-old-price" : "",
            expoint: item.expoint,
            priceshow: item.onlyexpoint == 1 ? 'hide' : '',
            orshow: item.onlyexpoint == 1 ? 'hide' : '',
            pointshow: item.expoint ? '' : 'hide',
            "input-view": item.auxcount == 0 ? '' : 'hide-input'
        });
        return strHtml;
    }


    //获取大图模板数据
    function getStrByTemplate2(list) {
        return $.String.format(sample2['li'], {
            'rows': $.Array.map(list, function (item, index) {
                    //item.maxprice = 0;
                    //var priceStr = kdAppSet.getPriceStr(item);
                    var stockinfo = kdAppSet.getStockStr(item.num, item.unitname);
                    var stockmsg = stockinfo.stockStr;
                    var colormsg = stockinfo.color;
                    return $.String.format(sample2['row'], {
                        'data-index': item.index,
                        img: 'img/loading.png',
                        imgsrc: item.img,
                        number: item.number,
                        name: item.name,
                        //price: priceStr,
                        price: "￥" + item.price,
                        model: item.model,
                        stockmsg: stockmsg,
                        colormsg: colormsg,
                        cuxiao: item.note
                    });
                }
            ).join('')
        });
    }


    //根据滚动位置动态加载图片
    function freshImgList() {

        if (listType == 1) {
            var listview = listviewobj;
            var scroll = listview.scroller;
            var scrollTop = Math.abs(scroll.y);
            var scrollBottom = scrollTop + scroll.wrapperHeight;
            $(listview.listv).find('.imgrow').each(function () {
                var itop = this.offsetTop;
                var ibom = itop + this.clientHeight;
                if ((itop >= scrollTop && itop <= scrollBottom) || (ibom >= scrollTop && ibom <= scrollBottom)) {
                    $(this).find('.imgbox img').each(function () {
                        var curthis = $(this);
                        var imgsrc = curthis.attr('imgsrc');
                        if (imgsrc != '') {
                            curthis.attr('src', imgsrc);
                            curthis.attr('imgsrc', '');
                        }
                    });
                }
            });
        }
    }


    //设置价格是否显示  直接在列表渲染时 处理更好
    function setPriceVisiable() {
        var $price = $("#viewid_goodslist").find(".price");
        kdAppSet.getIsShowPrice() ? $price.show() : $price.hide();
    }


    return {
        init: init,
        render: render,
        refresh: refresh,
        sort: sort,
        clear: clear,
        getItemlist: getItemlist,
        searchKey: function () {
            return searchKey;
        },
        listWrap: function () {
            return listWrap;
        },
        listviewobj: function () {
            return listviewobj;
        }
    }

})();