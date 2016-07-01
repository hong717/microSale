/*退货单 已选择退货商品详情页面*/


var RejectGoodsSelectList = (function () {
    var div, samples, scroller, listdata, ul, ullist, config, viewpage, divlist, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectGoodsSelectList');
            viewpage = $(div);
            divlist = document.getElementById('RejectGoodsSelectListDiv');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            samples = $.String.getTemplates(ul.innerHTML, [
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
            listdata = {};
            bindEvents();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {};
        kdctrl.initkdScroll(scroller, option);
    }


    function bindEvents() {

        //修改退货商品
        viewpage.delegate('.change', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelect', {data: listdata}]);
            },
            'touchstart': function () {
                $(this).addClass('change_touched');
            },
            'touchend': function () {
                $(this).removeClass('change_touched');
            }
        });
    }

    //刷新页面头部信息
    function freshHeaddata(data) {
        var head = viewpage.find(".header");
        head.find(".billno span").text(data.billno);
        head.find(".billdate span").text(data.billdate);
    }

    //刷新页面列表数据
    function freshListdata(datalist) {

        ul.innerHTML = $.Array.map(datalist, function (item, pindex) {

            if (!item.selected) {
                return "";
            }

            var attrList = item.attrList;
            var attrsum = 0;
            var inum = attrList.length;
            for (var i = 0; i < inum; i++) {
                attrsum = kdShare.calcAdd(attrsum, Number(attrList[i].num));
            }

            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : kdAppSet.getImgThumbnail(item.img),
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                attrsum: attrsum,
                'rows': $.Array.map(attrList, function (row, index) {
                        if (!row.selected) {
                            return "";
                        }
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            attrprice: kdAppSet.getRmbStr + row.price,
                            stocknum: 0,
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

    function render(configp) {
        initView();
        config = configp || {};
        listdata = config.data || {};
        //mode 0 查看 1编辑
        var mode = config.mode || 0;
        show();
        if (mode == 1) {
            viewpage.find(".footer").show();
            viewpage.find(".content").css("bottom", "45px");
        } else {
            viewpage.find(".footer").hide();
            viewpage.find(".content").css("bottom", "0");
        }
        freshHeaddata(listdata);
        freshListdata(listdata.list);
    }

    function show() {
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();