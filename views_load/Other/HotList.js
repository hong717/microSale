/*商品导购页面*/

var HotList = (function () {

    var div, divList , ul , sample , scroller , list , currentPage, itemsOfPage, TotalPage,
        ullist, areaSel, dateSel,title,
    //0 按金额 1 按数量 2 按库存
        orderType,
        maxNumber, imgname10, imgname05, imgname00, endTime, hasInit, iheight;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-hotgoods');
            divList = document.getElementById('hotlistdiv');
            FastClick.attach(divList);
            ul = divList.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            scroller = null;
            list = [];
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            areaSel = {name: "全部区域", id: -1};
            dateSel = {BeginDate: "2014-01-01", EndDate: "2014-01-01"};
            orderType = 1; //0 按金额 1 按数量 2 按库存
            maxNumber = 100;
            imgname10 = "start10";
            imgname05 = "start05";
            imgname00 = "start00";
            endTime = " 23:59:59";
            bindEvents();
            iheight = $(window).height() - 44 - 40 - 55;
            initScroll();
            hasInit = true;
        }
    }

    function initScroll() {
        scroller = Lib.Scroller.create(divList);
        var option = {
            fnfresh: function (reset) {
                reset();
                reSearch();
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                render();
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    function load(fn) {
        Lib.API.get('GetSalesRanking', {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: {
                BeginDate: dateSel.BeginDate,
                EndDate: dateSel.EndDate + endTime,
                Area: areaSel.id,
                CountType: orderType
            }
        }, function (data, json) {
            TotalPage = json.TotalPage ? json.TotalPage : 0;
            var inum = list.length;
            if (currentPage == 1) {
                maxNumber = Number(data.MaxAmount);
            }
            var imgMode = kdAppSet.getImgMode();
            var noimgModeDefault = kdAppSet.getNoimgModeDefault();
            var datalist = $.Array.keep(data.List || [], function (item, index) {
                    var pw = 1;
                    var imgname1 = imgname00;
                    var imgname2 = imgname00;
                    var imgname3 = imgname00;
                    var imgname4 = imgname00;
                    var imgname5 = imgname00;

                    if (maxNumber > 0) {
                        pw = Math.floor(item.FtotalQty / maxNumber * 10);
                        switch (pw) {
                            case 1:
                                imgname1 = imgname05;
                                break;
                            case 2:
                                imgname1 = imgname10;
                                break;
                            case 3:
                                imgname1 = imgname10;
                                imgname2 = imgname05;
                                break;
                            case 4:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                break;
                            case 5:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname05;
                                break;
                            case 6:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                break;
                            case 7:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname05;
                                break;
                            case 8:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname10;
                                break;
                            case 9:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname10;
                                imgname5 = imgname05;
                                break;
                            case 10:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname10;
                                imgname5 = imgname10;
                                break;
                        }
                    }

                    var imgUrl=item.FImgUrl || '';
                    return {
                        index: inum + index,
                        name: item.FName,
                        itemid: item.FItemID,
                        money: item.FTotalAmount,
                        num: item.FtotalQty,
                        imgurl: imgUrl != '' ? (imgMode ? kdAppSet.getImgThumbnail(imgUrl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                        stocknum: (item.FQty == null) ? 0 : item.FQty,
                        model: item.FModel,
                        note: item.FNote || "",
                        newflag: item.NewFlag,
                        cuxiaoflag: item.CuXiaoFlag,
                        unitid: item.FUnitID,
                        price: item.FPrice || 0,
                        unitname: item.FUnitName,
                        imgname1: imgname1,
                        imgname2: imgname2,
                        imgname3: imgname3,
                        imgname4: imgname4,
                        imgname5: imgname5
                    };
                }
            );
            var jnum = datalist.length;
            for (var j = 0; j < jnum; j++) {
                list.push(datalist[j]);
            }
            fn && fn(datalist);
            scroller.isPageEnd = (currentPage >= TotalPage);

        }, function (code, msg) {
            removeHint();
            ullist.append('<li class="hintflag">' + msg + '</li>');

        }, function () {
            removeHint();
            ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
        }, "");
    }


    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    function fill(a) {
        var listStr = $.Array.keep(a, function (item) {
            var stockinfo = kdAppSet.getStockStr(item.stocknum, item.unitname);
            var stocknum = stockinfo.stockStr;
            var colormsg = stockinfo.color;

            return $.String.format(sample, {
                index: item.index,
                name: item.name,
                money: item.money,
                num: item.num + " " + item.unitname,
                imgurl: item.imgurl,
                stocknum: stocknum,
                colormsg: colormsg,
                pwidth: item.pwidth,
                newflag: (item.newflag == 1) ? "display:block;" : "display:none;",
                cuxiaoflag: (item.cuxiaoflag == 1) ? "display:block;" : "display:none;",
                imgname1: item.imgname1,
                imgname2: item.imgname2,
                imgname3: item.imgname3,
                imgname4: item.imgname4,
                imgname5: item.imgname5
            });
        }).join('');

        removeHint();
        if (currentPage > 1) {
            ullist.append(listStr);
        } else {
            ul.innerHTML = listStr;
            if (a.length == 0) {
                ul.innerHTML = kdAppSet.getEmptyMsg(iheight);
            }
        }
        scroller.refresh();
    }


    function bindEvents() {

        $(".hotlist").delegate('.rightinfo', {
            'click': function () {
                var index = $(this).attr('index');
                var curitem = list[index];
                var item = {
                    num: curitem.stocknum,
                    cuxiaoflag: curitem.cuxiaoflag,
                    img: curitem.imgurl,
                    index: 0,
                    itemid: curitem.itemid,
                    price: curitem.price,
                    model: curitem.model,
                    name: curitem.name,
                    newflag: curitem.newflag,
                    note: curitem.note,
                    unitid: curitem.unitid,
                    unitname: curitem.unitname
                };
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', {
                    item: item
                }]);
                return false;
            },
            'touchstart': function () {
                $(this).parents('li').css('background', '#d9dadb');
                $(this).parent().find(".hotimg").css('background', '#fff');
            },
            'touchend': function () {
                $(this).parents('li').css('background', '#fff');
            }
        });


        $("#hotorder1,#hotorder2").bind("click", function () {
            var idclick = $(this).context.id;
            if (idclick == "hotorder1") {
                if (orderType != 1) {
                    tabclick(1);
                    reSearch(true);
                }
            } else if (idclick == "hotorder2") {
                if (orderType != 2) {
                    tabclick(2);
                    reSearch(true);
                }
            }
        });

        $(".datePan2 #btnArea").bind("click", function () {
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {selobj: areaSel,
                api: 'GetAreaInfo',
                para: {},
                callBack: function (selObj) {
                    if (areaSel.id == selObj.id) {
                    } else {
                        areaSel.id = selObj.id;
                        areaSel.name = selObj.name;
                        $("#btnArea")[0].innerText = areaSel.name;
                        reSearch();
                    }
                }}]);
        });
        tabclick(1);
        dateSel.EndDate = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var now = $.Date.now();
        now.setDate(now.getDate() - 30);
        dateSel.BeginDate = $.Date.format(now, "yyyy-MM-dd");
    }


    function tabclick(index) {
        $(".hotTab .tab").css({"color": "#686F76"});
        $(".hotTab .bline").hide();
         if (index == 1) {
            orderType = 1;
            $("#hotorder1").css({"color": "#FF6427"});
            $("#hotorder1 .bline").css({"display": "inline-block"});
        } else if (index == 2) {
            orderType = 2;
            $("#hotorder2").css({"color": "#FF6427"});
            $("#hotorder2 .bline").css({"display": "inline-block"});
        }
    }


    function render(config) {
        initView();
        if (config) {
            title = config.title;
        }
        show();
        if (currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        }
        (function (fn) {
            load(function (data) {
                fill(data);
                fn && fn();
            });
        })();

    }

    function reSearch(bchange) {
        currentPage = 1;
        TotalPage = 1;
        if (bchange) {
            scroller.scrollTo(0, 0, 500);
            ul.innerHTML = '';
        }
        list.length = 0;
        render();
    }

    function show() {
        $(div).show();
        kdAppSet.setAppTitle(title);
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };

})();