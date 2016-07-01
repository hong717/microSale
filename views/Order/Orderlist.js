var Orderlist = (function () {
    var div, viewpage,
        samples,
        tabNum,
        listviews,
    //0全部 1待审核 2待发货 3已发货 4 已收货 5待付款 6已付款 7部分发货
        listStatus = {
            all: 0,
            check: 1,
            unsend: 2,
            sended: 3,
            receive: 4,
            unpay: 5
        },
        curTabIndex,
        itemsOfPage, orderlistfresh, liDateHead, bretail,
        keywordhint, txSearch, endTime, iheight, hasInit, afterRefresh;
    var remindArr = [];

    //初始化视图
    function initView() {
        if (!hasInit) {
            tabNum = 5;
            div = document.getElementById('view_orderlist');
            viewpage = $(div);
            samples = $.String.getTemplates(document.getElementById('orderlist_list0').innerHTML, [
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
            listviews = [];
            initListView();
            itemsOfPage = 10;
            curTabIndex = 0;
            orderlistfresh = false;
            keywordhint = "搜索订单号";
            txSearch = $("#view_orderlist .txtSearch");
            endTime = " 23:59:59";
            bretail = kdAppSet.getUserInfo().identity == 'retail';
            liDateHead = '<li lindex={index} class="lidatehead {buyer-view}" status="1">{date}</li>';
            iheight = $(window).height() - 44 - 40;
            bindEvents();
            bindScrollEvents();
            hasInit = true;
        }
    }


    //初始化列表视图数据
    function initListView() {
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('orderlist_listwrap' + i);
            var listv = document.getElementById('orderlist_list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            scroller.noticetop = 1.8;
            var listview = {
                listv: listv,
                listwrap: $(listwrap),
                scroller: scroller,
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh: false,
                dateCmp: "",
                dataKey: ""
            };
            listviews.push(listview);
        }
    }

    //设置iscroll滚动组件
    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {
                reSearch('', reset);
            },
            fnmore: function (reset) {
                GetOrderList('', reset);
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }

    //获取当前页签的搜索条件
    function getCurDataKey() {
        var startDatav = $("#orderlist_dateBegin").val();
        var endDatev = $("#orderlist_dateEnd").val() + endTime;
        var keywordv = txSearch.val() == keywordhint ? "" : txSearch.val();
        return keywordv + startDatav + endDatev;
    }


    //根据条件获取列表数据
    function getOrderListByCondition(index, bfresh) {
        curTabIndex = index;
        var listview = listviews[index];
        var bReload = false;
        var dkey = listview.dataKey;
        var cmpkey = getCurDataKey();
        if (dkey != cmpkey) {
            bReload = true;
        }
        $('.orderlist').hide();
        changePageView(index);
        listview.listwrap.show();
        if (!listview.scroller || bfresh || bReload) {
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            GetOrderList();
        }
    }

    function removeHint(tabindex) {
        ullist = getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    //获取当前list操作
    function getOptlist(index) {
        return $(listviews[index].listv);
    }

    //根据模板获取列表字符串信息
    function getTemplateStr(item) {
        var isretail = '';
        if (parseInt(item.status) == listStatus.unpay) {
            isretail = 'display:none';
        }

        var itemList = item.itemList;
        var listr = $.String.format(samples['li'], {
            billid: item.interid,
            billno: item.billno,
            status: getStatusName(item.status),
            amount: item.amount,
            num: item.num,
            billmoney: kdAppSet.formatMoneyStr(item.billmoney + item.freight),
            time: item.date,
            index: item.index,
            optname: getOptName(item.status),
            optname2: getOptName2(item.status),
            btnstatus: item.status,
            paystatus: parseInt(item.paystatus) == 0 ? 'display:none;' : '',
            isretail: isretail,
            payimg: getPayImg(item.paystatus),
            receivername: getRecName(item.receivername),
            //直接隐藏已发货的催单键--2015.12.3
            //show: parseInt(item.status) == listStatus.receive ? 'display:none;' : '',
            show: parseInt(item.status) == 4 || parseInt(item.status) == 3 || parseInt(item.status) == 5 ? 'display:none;' : '',
            'store-flag': item.sendType == 1 ? '(门店自提)' : '',
            'buyer-view': bretail ? 'hide' : '',
            'retail-view': bretail ? '' : 'hide',
            'freight-view': item.freight == 0 ? 'hide' : '',
            'freight': item.freight,
            'out-view': parseInt(item.status) == 7 ? '' : 'hide',
            'out-num': item.outNum,
            'rows': $.Array.map(itemList, function (row, index) {
                return $.String.format(samples['row'], {
                    imgurl: row.imgurl == "" ? "img/no_img.png" : row.imgurl,
                    goods: row.name,
                    isgift: row.isgift == 0 ? 'hide' : '',
                    money: kdAppSet.formatMoneyStr(row.summoney),
                    goodsnum: kdAppSet.formatMoneyStr(row.qty)
                });
            }
            ).join('')
        });

        return listr;
    }

    function getRecName(status) {
        var userinfo = kdAppSet.getUserInfo();
        var identity = userinfo.identity;
        if (identity == "manager" || identity == "buyer") {
            return "(" + status + ")";
        }
        else {
            return "";
        }
    }

    function getOptName(status) {
        var optName = '再次购买';
        if (status == listStatus.unpay) {
            optName = '付款';
        }
        return optName;
    }

    function getOptName2(status) {
        var optName = '订单状态';
        if (status == listStatus.unpay) {
            optName = '付款通知';
        }
        return optName;
    }

    //根据页面标签获取 option值
    function getOptionIndex(index) {
        var optionlist = [0, 5, 1, 2, 3];
        return optionlist[index];
    }

    function getPayImg(status) {
        var imgh = 'img/';
        var img = 'kdpx.gif';
        if (status == 1) {
            //微信支付
            img = 'wx_pay.png';
        } else if (status == 2) {
            //线下支付
            img = 'lineoff_pay.png';
        } else if (status == 3) {
            //储值卡支付
            img = 'prepay.png';
        } else if (status == 4) {
            //支付宝支付
            img = 'alipay_list.png';
        } else if (status == 5) {
            //资金通支付
            img = 'zjt_list.png';
        }
        return imgh + img;
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var datestr = item.date.substring(0, 7);
            if (datestr != listview.dateCmp) {
                var datestrh = datestr.replace("-", "年") + "月";
                htmlstr += $.String.format(liDateHead, {
                    date: datestrh, index: item.index,
                    'buyer-view': bretail ? 'hide' : ''
                });
                listview.dateCmp = datestr;
            }
            var listr = getTemplateStr(item);
            htmlstr += listr;
        }
        return htmlstr;
    }

    //获取订单列表
    function GetOrderList(index, fnReset) {
        if (index == undefined || index == '') {
            index = curTabIndex;
        }
        var listview = listviews[index];
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            fnReset && fnReset();
            return;
        }
        var para = {
            currentPage: listview.currentPage,
            ItemsOfPage: listview.itemsOfPage
        };
        var ullist = getOptlist(index);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }

        var startDatav = $("#orderlist_dateBegin").val();
        var endDatev = $("#orderlist_dateEnd").val() + endTime;
        var keywordv = txSearch.val() == keywordhint ? "" : txSearch.val();
        var optOpenid = kdAppSet.getUserInfo().optid;

        para.para = {
            optOpenid: optOpenid,
            Option: getOptionIndex(curTabIndex),
            KeyWord: kdAppSet.ReplaceJsonSpecialChar(keywordv),
            BeginDate: startDatav,
            EndDate: endDatev
        };

        GetOrderListAPI(function (data, dindex) {
            var listview2 = listviews[dindex];
            var htmlstr = getListHtml(data, listview2.listdata, dindex);
            var listv = listview2.listv;
            if (htmlstr == "" && listview2.currentPage == 1) {
                listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
            } else {
                if (listview2.currentPage == 1) {
                    listv.innerHTML = htmlstr;
                } else {
                    listv.innerHTML += htmlstr;
                }
            }
            listview2.scroller.refresh();
            listview2.currentPage += 1;
        }, para, fnReset);
    }


    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);
    }

    function setTotalPage(index, json) {
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    //调用订单列表api
    function GetOrderListAPI(fn, para, fnReset) {
        Lib.API.get('GetSEOrderList', para,
            function (data, json, root, userflag) {
                var index = userflag;
                removeHint(index);
                setTotalPage(index, json);
                var pageNum = (listviews[index].currentPage - 1) * itemsOfPage;
                var list = $.Array.keep(data['SEOrderList'] || [], function (item, index) {
                    return {
                        index: pageNum + index,
                        interid: item.FInterID,
                        amount: item.famount,
                        status: item.FRemark, // 订单状态  //0全部 1待审核 2待发货 3已发货 4 已收货 5待付款
                        consigndate: item.fconsigndate,
                        billno: item.FBillNo,
                        billmoney: item.FBillMoney || 0,
                        date: item.FDate,
                        settle: item.fsettlename,
                        num: item.FAuxQty,
                        outNum: item.OutAuxQty,
                        paystatus: item.paystatus || 0, //支付状态  1微信 2线下支付 3储值卡支付
                        expressnumber: item.FWLNumber,
                        expresscom: item.FWLCompany,
                        freight: item.freight || 0,
                        payType: item.PayType || '',
                        sendType: item.SendType || 0,  //送货方式 配送方式（0--快递；1--门店自提；）
                        itemList: item.itemList || [],
                        receivername: item.receivername
                    };
                });
                fn && fn(list, userflag);
                setScrollPageEnd(userflag);
                fnReset && fnReset();
            }, function (code, msg, json, root, userflag) {
                var index = userflag || curTabIndex;
                removeHint(index);
                fnReset && fnReset();
                kdAppSet.showErrorView(msg, errorRefresh, userflag);
            }, function (errCode) {
                removeHint(curTabIndex);
                fnReset && fnReset();
                kdAppSet.showErrorView(errCode, errorRefresh, curTabIndex);

            }, curTabIndex);

        var listview = listviews[curTabIndex];
        var cmpkey = getCurDataKey();
        if (listview.dataKey != cmpkey) {
            listview.dataKey = cmpkey;
        }
    }

    //错误刷新
    function errorRefresh(index) {
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        GetOrderList(index);
    }

    //订单页签切换
    function changePageView(index) {
        var headtab = viewpage.find(".headtab");
        var tabs = headtab.find('.tab');
        var listviews = viewpage.find(".orderlist");
        var linebs = headtab.find('.lineb');
        tabs.css('color', '#686f76');
        linebs.hide();
        listviews.hide();
        $(linebs[index]).show();
        $(listviews[index]).show();
        $(tabs[index]).css('color', '#FF753E');
    }

    function textFill(input) {
        input.addClass("hintcolor");
        input.focus(function () {
            if ($.trim(input.val()) == keywordhint) {
                input.val('');
            }
            input.removeClass("hintcolor");
        });
        input.blur(function () {
            if ($.trim(input.val()) == '') {
                input.val(keywordhint);
                input.addClass("hintcolor");
            }
        });
    }


    //删除列表中的某个订单
    function deleteListItem(billid, tabindex) {
        var ullist = listviews[tabindex].listv;
        deleteItem(ullist);
        listviews[tabindex].scroller.refresh();
        function deleteItem(ullist) {
            $(ullist).children().filter('[billid=' + billid + ']').remove();
        }
    }

    function bindEvents() {

        MiniQuery.Event.bind(window, {
            'freshListInfo': function () {
                freshListInfo();
            }
        });

        //订单支付 刷新待付款列表信息
        MiniQuery.Event.bind(window, {
            'freshOrderPayNo': function (payinfo) {
                //{payno:data.payNo,billid:order.interid}
                deleteListItem(payinfo.billid, 1);
            }
        });

        $("#view_orderlist .headtab .tab").bind('click', function () {
            var dataindex = this.getAttribute("data-index");
            getOrderListByCondition(dataindex);
        });

        for (var i = 0; i < tabNum; i++) {
            ListBindEvents(listviews[i].listv);
        }

        initDate();
        txSearch.val(keywordhint);
        txSearch.keydown(function (event) {
            if (event.keyCode == 13) {
                reSearch(true);
            }
        });

        textFill(txSearch);
        txSearch.delegate('', {
            'focus': function () {
                $(".divSearch #imgClear").css('display', 'block');
            },
            'blur': function () {
                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == '' || searchVal == keywordhint) {
                    $(".divSearch #imgClear").css('display', 'none');
                }
            }
        });

        $("#view_orderlist .divSearch #imgClear").bind("click", function () {
            txSearch.val("");
            txSearch.val(keywordhint);
            txSearch.addClass("hintcolor");
            $(this).css('display', 'none');
        });

        $("#view_orderlist .btnDate").bind("click", function () {
            var datePan = $("#view_orderlist .datePan");
            var btnDateImg = $(this).find("img");
            var bview = datePan.css("display");
            var itop = "2.68rem";
            if (bview == "none") {
                setScrollerNoticetop(2.78);
                btnDateImg.removeClass("sprite-downext downext");
                btnDateImg.addClass("sprite-upext upext");
            } else {
                itop = "1.8rem";
                setScrollerNoticetop(1.88);
                btnDateImg.removeClass("sprite-upext upext");
                btnDateImg.addClass("sprite-downext downext");
            }
            listviews[curTabIndex].scroller.refresh();
            $("#orderlistview .orderlist").animate({ top: itop }, "normal");
            datePan.animate({ height: 'toggle', opacity: 'toggle' }, "normal");
        });

        $("#view_orderlist .btnDate").on(kdShare.clickfnImg($("#view_orderlist .btnDate img"), null));
        var now = $.Date.now();
        $("#orderlist_dateEnd").val($.Date.format(now, "yyyy-MM-dd"));
        //默认获取最近90天的订单数据
        now.setDate(now.getDate() - 90);
        $("#orderlist_dateBegin").val($.Date.format(now, "yyyy-MM-dd"));
        $("#view_orderlist .btnSearch").bind("click", function () {
            reSearch(true);
            kdAppSet.h5Analysis('orderlist_btnSearch');
        }).on(kdShare.clickfn());
    }

    function setScrollerNoticetop(itop) {
        for (var i = 0; i < tabNum; i++) {
            listviews[i].scroller.noticetop = itop;
        }
    }

    function initDate() {

        kdctrl.initDate($(".view_orderlist .kdcDate"));

        var dateCtrl = $('#orderlist_dateBegin,#orderlist_dateEnd');
        dateCtrl.bind('change',
            function () {
                reSearch(true);
            }
        );
    }

    function getItembyIndex(index) {
        return listviews[curTabIndex].listdata[index];
    }

    function ListBindEvents(ulobj) {

        var $list = $(ulobj);
        $list.delegate('.orderlist_liinfo', {
            'touchstart': function () {

                $(this).parents('li').css('background', '#fff');
                $(this).css('background-color', '#d9dadb');
                $(this).parents('li').find("img").css("visibility", "hidden");

            }, 'touchend': function () {

                $(this).css('background-color', '#fff');
                $(this).parents('li').find("img").css("visibility", "visible");

            }
        }).delegate('div.orderlist_liinfo', 'click', function () {

            var index = this.getAttribute("index");
            var item = getItembyIndex(index);
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                billId: item.interid
            }]);

        });

        //零售用户列表查看详情
        $list.delegate('[data-cmd="detail"]', {
            'click': function () {

                var index = this.getAttribute("index");
                var item = getItembyIndex(index);
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                    billId: item.interid
                }]);

            },
            'touchstart': function () {
                var $this = $(this);
                $this.addClass('pressed');
                $this.find('[data-cmd="li"]').addClass('pressed');
            },
            'touchend': function () {
                var $this = $(this);
                $this.removeClass('pressed');
                $this.find('[data-cmd="li"]').removeClass('pressed');
            }
        });

        //订单状态
        $list.delegate('div.optStatus', {
            'click': function () {

                var index = this.getAttribute("index");
                var item = getItembyIndex(index);
                if (item.status == listStatus.unpay) {
                    //待付款 付款通知
                    MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                        {
                            newbill: true,
                            payNo: '',
                            payOrder: item.billno,
                            paymoney: kdAppSet.getIsShowPrice() ? item.billmoney + Number(item.freight) : null,
                            payBillId: item.interid
                        }
                    ]);

                } else {
                    kdAppSet.stopEventPropagation();
                    MiniQuery.Event.trigger(window, 'toview', ['Express', { item: item }]);
                }
            },
            'touchstart': function () {
                $(this).css({ background: '#8c9093', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#8c9093' });
            }
        });

        //再次购买
        $list.delegate('div.optbutton', {
            'click': function () {
                var index = this.getAttribute("index");
                var item = getItembyIndex(index);
                if (item.status == listStatus.unpay) {
                    //待付款 付款
                    if (!kdAppSet.getIsShowPrice()) {
                        jAlert('暂时无法付款，请联系商家');
                        return;
                    }
                    OrderPay.payBill({
                        interid: item.interid,
                        billno: item.billno,
                        billmoney: item.billmoney,
                        payType: item.payType,
                        sendType: item.sendType,
                        freight: Number(item.freight)
                    });
                    kdAppSet.h5Analysis('orderlist_pay');
                } else {
                    MiniQuery.Event.trigger(window, 'toview', ['CacheList', { copyBillId: item.interid }]);
                    kdAppSet.h5Analysis('orderlist_buymore');
                }
            },
            'touchstart': function () {
                $(this).css({ background: '#ff6427', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#ff6427' });
            }
        });

        //提醒厂家
        $list.delegate('.remind', {
            'click': function () {
                var status = this.getAttribute('status');
                var index = this.getAttribute('index');
                var remindBillno = getItembyIndex(index).billno;//催单单号
                if (remindArr.indexOf(remindBillno) < 0) {
                    remindArr.push(remindBillno);
                    if (status == listStatus.sended) {
                        CheckOrder(this, index);
                    }
                    else if (status == listStatus.receive) {
                    }
                    else {
                        var item = getItembyIndex(index);
                        OptMsg.OrderBillRemind(item.billno);
                    }
                } else {
                    OptMsg.ShowMsg("已提醒厂家进行业务处理！", "", 1100);
                }
                kdAppSet.h5Analysis('orderlist_remind');
            },
            'touchstart': function () {
                $(this).addClass("remind_s");
            },
            'touchend': function () {
                $(this).removeClass("remind_s");
            }
        });

    }


    function CheckOrder(obj, index) {
        var data2 = getItembyIndex(index);
        var para = { currentPage: 1, ItemsOfPage: 10 };
        para.para = { interid: data2.interid };
        checkorderAPI(function (data) {
            if (data == 'ok') {
                if ($(obj).hasClass('optConfirm')) {
                    $(obj).removeClass('optConfirm');
                }
                $(obj).css('display', 'none');
                $(obj).parents('li').find('.pstatus').html('已收货');
                listviews[curTabIndex].listdata[index].status = listStatus.receive;
                OptMsg.ReceiveOrderGoods(data2.billno);
                OptMsg.ShowMsg('收货成功！');
            }
        }, para);
        function checkorderAPI(fn, para) {
            Lib.API.get('CheckOrder', para,
                function (data) {
                    fn && fn(data['Status']);
                }, function (msg) {
                    kdAppSet.setKdLoading(false);
                    if (msg) {
                        jAlert(msg);
                    }
                }, function (errCode) {
                    kdAppSet.setKdLoading(false);
                    if (errCode) {
                        jAlert(kdAppSet.getAppMsg.workError + errCode);
                    }
                });
        }
    }

    function getStatusName(index) {
        index = index || 0;
        var statusList = ["", "待确认", "待发货", "已发货", "已收货", "待付款", "", "部分发货"];
        return statusList[index];
    }


    function freshListInfo() {
        initView();
        getOrderListByCondition(curTabIndex, true);
    }


    function reSearch(bsearch, fnReset) {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        if (bsearch) {
            listview.scroller.scrollTo(0, 0, 500);
            listview.listv.innerHTML = '';
        }
        GetOrderList('', fnReset);
    }

    function render(config) {
        initView();
        show();
        if (orderlistfresh && config.tabindex == undefined) {
            return;
        }
        orderlistfresh = true;
        kdAppSet.setKdLoading(false);
        var tabindex = config.tabindex || 0;
        if (config.KeyWord) {
            txSearch.val(config.KeyWord);
        }
        if (config.afterRefresh) {
            // 付款单页面退出下次需要刷新
            afterRefresh = config.afterRefresh;
        } else {
            if (afterRefresh) {
                txSearch.val('');
                afterRefresh = false;
            }
        }
        getOrderListByCondition(tabindex);//默认取全部
    }

    function show() {
        //viewpage.show();
        OptAnimation.show(viewpage);
        kdAppSet.setKdLoading(false);
        listviews[curTabIndex].scroller.refresh();
    }

    function hide() {
        //viewpage.hide();
        OptAnimation.hide(viewpage);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();

