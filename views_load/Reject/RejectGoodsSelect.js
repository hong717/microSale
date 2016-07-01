/*退货单 退货商品选择页面*/

var RejectGoodsSelect = (function () {
    var div, samples, scroller, ul, ullist, config, viewpage, listdata, hasInit,
        selectedImg, unselectedImg, finishEditRejectBill;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectGoodsSelect');
            FastClick.attach(div);
            viewpage = $(div);
            var divlist = document.getElementById('RejectGoodsSelectDiv');
            ul = divlist.firstElementChild;
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
            selectedImg = "img/selected.png";
            unselectedImg = "img/select.png";
            listdata = {};
            bindEvents();
            initScroll(divlist);
            finishEditRejectBill = false;
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, {});
    }


    //调用接口获取订单详情
    function getOrderDetail(interID) {

        kdAppSet.setKdLoading(true, "获取订单信息...");
        Lib.API.get('GetOrderDetailForSEOutStock', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: {InterID: interID}
        }, function (data, json) {
            listdata = {
                list: data.list,
                billid: interID,
                billno: data.BillNo,
                billdate: data.FDate
            };
            setListdataMaxnum();
            freshHeaddata(data);
            freshListdata(listdata.list);
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            OptMsg.ShowMsg("获取订单信息出错," + msg, '', 1100);
            kdAppSet.setKdLoading(false);
        }, function () {
            kdAppSet.setKdLoading(false);
        }, "");
    }

    //设置退货商品可退货的最大值
    function setListdataMaxnum() {
        var inum = listdata.list.length;
        for (var i = 0; i < inum; i++) {
            var jnum = listdata.list[i].attrList.length;
            for (var j = 0; j < jnum; j++) {
                listdata.list[i].attrList[j].maxnum = listdata.list[i].attrList[j].num;
            }
        }
    }

    //刷新页面头部信息
    function freshHeaddata(data) {
        var head = viewpage.find(".header");
        head.find(".billNo span").text(data.BillNo);
        head.find(".billDate span").text(data.FDate);
        head.find(".billRec span").text(data.receiveDate);
        var status = "已发货";
        if (data.status == 4) {
            status = "已收货";
        }
        head.find(".Status").text(status);
    }

    //刷新退货列表
    function freshListdata(datalist) {

        ul.innerHTML = $.Array.map(datalist, function (item, pindex) {
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
                imgselect: item.imgselect == 1 ? selectedImg : unselectedImg,
                'rows': $.Array.map(attrList, function (row, index) {
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            attrprice: kdAppSet.getRmbStr + row.price,
                            stocknum: 0,
                            attrIndex: index,
                            attrPindex: pindex,
                            stockunit: item.unitname,
                            attrimgselect: item.imgselect == 1 ? selectedImg : unselectedImg,
                            attrnum: row.num
                        });
                    }
                ).join('')
            });
        }).join('');
        scroller.refresh();
    }

    //判断是否有选择商品
    function checkCanSubmit() {
        var selectNum = 0;
        var list = listdata.list;
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected) {
                var jnum = list[i].attrList.length;
                for (var j = 0; j < jnum; j++) {
                    if (list[i].attrList[j].selected) {
                        selectNum += list[i].attrList[j].num;
                    }
                }
            }
        }
        return selectNum > 0;

    }

    function bindEvents() {

        //刷新退货商品列表
        MiniQuery.Event.bind(window, {
            'finishEditRejectBill': function () {
                finishEditRejectBill = true;
                listdata = [];
                freshListdata(listdata);
            }
        });

        //申请退货
        viewpage.delegate('.ok', {
            'click': function () {
                if (checkCanSubmit()) {
                    MiniQuery.Event.trigger(window, 'toview', ['EditRejectBill', {data: listdata}]);
                } else {
                    OptMsg.ShowMsg("请勾选需要退货的商品<br>并填写数量", '', 1100);
                }
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        //取消退货
        viewpage.delegate('.cancel', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        //修改退货商品数量
        $(ul).delegate(".attrnum", {
            'click': function () {

                var target = $(this).children('input');
                var iindex = Number($(this).parent().attr("attrindex"));
                var pindex = Number($(this).parent().attr("attrpindex"));
                var attrname = listdata.list[pindex].attrList[iindex].name;
                var attrListCtrl = $(ul).find("li[index=" + pindex + "]");

                var list = listdata.list;
                var config = {
                    name: attrname,
                    input: target.val(),
                    maxnum: list[pindex].attrList[iindex].maxnum,
                    maxhint: "退货数量不能超过 ",
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.val(1);
                            list[pindex].attrList[iindex].num = 1;
                        }
                        else {
                            target.val(kvalue);
                            list[pindex].attrList[iindex].num = Number(kvalue);
                        }
                        var attrList = list[pindex].attrList;
                        var isum = 0;
                        for (var attr in attrList) {
                            isum = kdShare.calcAdd(isum, Number(attrList[attr].num));
                        }
                        attrListCtrl.find(".attrSum span").text(isum);
                    },
                    hidefn: function () {
                    }
                };
                kdShare.keyBoard.autoshow(config);
                return false;
            }
        });

        //商品选择
        $(ul).delegate(".imgselect", {
            'click': function () {

                var pindex = Number($(this).parent().attr("index"));
                if (listdata.list[pindex].selected) {
                    listdata.list[pindex].selected = 0;
                    freshImgSelect(pindex, false);
                } else {
                    listdata.list[pindex].selected = 1;
                    freshImgSelect(pindex, true);
                }
            }
        });

        //商品明细选择
        $(ul).delegate(".attrimgselect", {
            'click': function () {
                var iindex = Number($(this).parent().attr("attrindex"));
                var pindex = Number($(this).parent().attr("attrpindex"));
                if (listdata.list[pindex].attrList[iindex].selected) {
                    listdata.list[pindex].attrList[iindex].selected = 0;
                    freshChildImgSelect(pindex, iindex, false);
                } else {
                    listdata.list[pindex].attrList[iindex].selected = 1;
                    freshChildImgSelect(pindex, iindex, true);
                }
            }
        });

    }

    //刷新商品选中状态
    function freshImgSelect(index, selected) {
        var attrListCtrl = $(ul).find("li[index=" + index + "]");
        var img = unselectedImg;
        var inum = listdata.list[index].attrList.length;
        var flag = 0;
        if (selected) {
            flag = 1;
            img = selectedImg;
        }
        for (var i = 0; i < inum; i++) {
            listdata.list[index].attrList[i].selected = flag;
        }
        attrListCtrl.find(".imgselect img").attr("src", img);
        attrListCtrl.find(".attrimgselect img").attr("src", img);
    }


    //刷新商品明细选中状态
    function freshChildImgSelect(pindex, iindex, selected) {

        var attrListCtrl = $(ul).find("li[index=" + pindex + "]");
        var attrRow = attrListCtrl.find("[attrindex=" + iindex + "]");
        var img = unselectedImg;
        if (selected) {
            img = selectedImg;
        }
        attrRow.find(".attrimgselect img").attr("src", img);

        //判断parent选择状态
        var iselectnum = 0;
        var inum = listdata.list[pindex].attrList.length;
        for (var i = 0; i < inum; i++) {
            if (listdata.list[pindex].attrList[i].selected) {
                iselectnum += 1;
            }
        }

        if (iselectnum == 0) {
            //一个子项都没有选中
            attrListCtrl.find(".imgselect img").attr("src", unselectedImg);
            listdata.list[pindex].selected = 0;

        } else if (iselectnum == inum) {
            //子项全部选中
            attrListCtrl.find(".imgselect img").attr("src", selectedImg);
            listdata.list[pindex].selected = 1;
        } else {
            //子项部分选中
            attrListCtrl.find(".imgselect img").attr("src", unselectedImg);
            listdata.list[pindex].selected = 1;
        }

    }


    function render(configp) {
        config = configp || {};
        initView();
        finishEditRejectBill = false;
        var billid = configp.billid || 0;
        var listdata = configp.listdata;

        if (billid > 0) {
            //新增退货单
            getOrderDetail(billid);
        }
        if (listdata != undefined) {
            //编辑退货单
            freshListdata(listdata);
        }
        show();
    }


    function show() {
        viewpage.show();
        //退货单已经提交 自动退到上一个也页面
        if (finishEditRejectBill) {
            history.back();
        }
    }

    function hide() {
        viewpage.hide();
        kdAppSet.setKdLoading(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();