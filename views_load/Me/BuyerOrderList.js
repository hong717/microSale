/**
 * 我的买家--订单列表页面
 * Create by Mayue
 * Date 2015-11-11
 * */
var BuyerOrderList = (function () {
    var div,
        $viewpage,
        sample,
        tabNum,
        listviews,
        curTabIndex,
        itemsOfPage,
        liDateHead,
        iheight,
        hasInit,
        startDatev,
        endDatev,
        buyerId;

    //初始化视图
    function initView() {
        if (!hasInit) {
            tabNum = 3;
            div = document.getElementById('view-buyer-order-list');
            $viewpage = $(div);
            sample = $.String.getTemplates(document.getElementById('buyerorderlist_list0').innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                }
            ]);
            initListView();
            itemsOfPage = 10;
            curTabIndex = 0;
            liDateHead = '<li lindex={index} class="lidatehead" status="1">{date}</li>';
            iheight = $(window).height() - 41;
            bindEvents();
            bindScrollEvents();
            hasInit = true;
        }
    }

    //初始化列表视图数据
    function initListView() {
        listviews = [];
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('buyerorderlist_listwrap' + i);
            var listv = document.getElementById('buyerorderlist_list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            scroller.noticetop = 50;
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

    //绑定事件
    function bindEvents() {


        //订单页签切换事件
        $viewpage.delegate('[data-cmd="li"]', {
                'click': function () {
                    var dataindex = this.getAttribute("data-index");
                    changePageView(dataindex);//导航栏样式
                    getOrderListByCondition(dataindex);
                }
            }
        );

        //订单状态
        $viewpage.delegate('[data-cmd="buyer-orderliststate"]', {
            'click': function () {
                var index = $(this).attr('index');
                var item = listviews[curTabIndex].listdata[index];

                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['Express', {
                    item: item
                }]);
            },
            'touchstart': function () {
                $(this).addClass("pressed");
            },
            'touchend': function () {
                $(this).removeClass("pressed");
            }
        });
        //订单详情
        $viewpage.delegate('[data-cmd="buyer-orderlistdetail"]', {
            'click': function () {
                var index = this.getAttribute("index");
                var item = listviews[curTabIndex].listdata[index];
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                    billId: item.interid, from: 'buyerOrderList'
                }]);
            },
            'touchstart': function () {
                $(this).addClass("touched");

            },
            'touchend': function () {
                $(this).removeClass("touched");


            }
        });
    }

    //订单页签切换
    function changePageView(dataindex) {
        curTabIndex = dataindex;
        var li = $viewpage.find('[data-cmd="li"]');
        li.removeClass("on");
        li.eq(dataindex).addClass("on");
    }

    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }

    //设置iscroll滚动组件
    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {

                reSearch();
                reset();
            },
            fnmore: function (reset) {
                GetOrderList();
                reset();
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    //刷新
    function reSearch() {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        listview.scroller.scrollTo(0, 0, 500);
        listview.listv.innerHTML = '';
        GetOrderList();
    }

    //获取传入的条件
    function getCurDataKey() {
        var key = buyerId + startDatev + endDatev;
        return key;
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
        for (var i = 0; i < tabNum; i++) {
            $('#buyerorderlist_listwrap' + i).hide();
        }
        if (!listview.scroller || bfresh || bReload) {
            listview.listv.innerHTML = '';
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            GetOrderList();
        }
        listview.listwrap.show();
    }

    //订单列表
    function GetOrderList(index) {
        if (index == undefined) {
            index = curTabIndex;
        }
        var listview = listviews[index];
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
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
        //mayue传参获取我的买家订单列表 optOpenid需要确定 Option具体对应需要再问
        para.para = {
            optOpenid: kdAppSet.getUserInfo().optid,
            Option: getOptionIndex(curTabIndex),
            KeyWord: "",
            BeginDate: startDatev,
            EndDate: endDatev,
            retailOpenid: buyerId //buyerID
        };
        //通过借口获取数据
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
        }, para);
    }

    //调用订单列表API
    function GetOrderListAPI(fn, para) {
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
                        status: item.FRemark, // 订单状态  //0全部 1待审核 2待发货 3已发货 4 已收货 5待付款  6.已支付
                        consigndate: item.fconsigndate,
                        billno: item.FBillNo,
                        billmoney: item.FBillMoney || 0,
                        date: item.FDate,
                        settle: item.fsettlename,
                        num: item.FAuxQty,
                        paystatus: item.paystatus || 0,//mayue
                        expressnumber: item.FWLNumber,
                        expresscom: item.FWLCompany,
                        freight: item.freight || 0,
                        payType: item.PayType || '',//mayue
                        sendType: item.SendType || 0
                    };
                });
                fn && fn(list, userflag);
                setScrollPageEnd(userflag);
            }, function (code, msg, json, root, userflag) {
                var index = userflag || curTabIndex;
                removeHint(index);
                kdAppSet.showErrorView(msg, errorRefresh, userflag);

            }, function (errCode) {
                removeHint(curTabIndex);
                kdAppSet.showErrorView(errCode, errorRefresh, curTabIndex);

            }, curTabIndex);

        var listview = listviews[curTabIndex];
        var cmpkey = getCurDataKey();
        if (listview.dataKey != cmpkey) {
            listview.dataKey = cmpkey;
        }
    }

    //获取当前list操作
    function getOptlist(index) {
        return $(listviews[index].listv);
    }

    //移除加载数据效果
    function removeHint(tabindex) {
        ullist = getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    //错误刷新
    function errorRefresh(index) {
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        GetOrderList(index);
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = getTemplateStr(item);
            htmlstr += listr;
        }
        return htmlstr;
    }

    //根据模板获取列表字符串信息  显示
    function getTemplateStr(item) {
        var identity = kdAppSet.getUserInfo().identity;
        //mayue 填充数据，支付方式选择
        var listr = $.String.format(sample.li, {
            index: item.index,
            billid: item.interid,
            billno: item.billno,
            money: kdAppSet.formatMoneyStr(item.billmoney),
            status: getStatusName(item.status),
            num: item.num,
            time: item.date,
            paystyle: getPayStyle(item.paystatus)
        });
        return listr;
    }

    //根据item.paystatus获取支付方式
    function getPayStyle(paystatus) {
        var paystyle = "sprite-none-pay";//默认无
        if (paystatus == 1) {//微信支付
            paystyle = "sprite-wechat-pay";
        } else if (paystatus == 2) {//线下支付
            paystyle = "sprite-lineoff-pay";
        } else if (paystatus == 3) {//存储卡支付
            paystyle = "sprite-card-pay";
        }
        return paystyle;
    }

    //根据item.status获取状态名称(传回的FRemark)
    function getStatusName(status) {
        index = status || 0;
        var statusList = ["", "待确认", "待发货", "已发货", "已收货", "待付款", "已支付"];
        return statusList[status];
    }

    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);
    }

    //设置list首页
    function setTotalPage(index, json) {
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    //根据页面标签获取 option值 0全部 6已支付 5未支付待确定
    function getOptionIndex(index) {
        var optionlist = [0, 6, 5];
        return optionlist[index];
    }


    function show() {
        $(div).show();
        kdAppSet.setAppTitle('我的买家');
    }

    function hide() {
        $(div).hide();
    }

    function render(config) {
        var data = config.data;
        startDatev = data.beginDate;
        endDatev = data.endDate + " 23:59:59";
        buyerId = data.buyerId;
        initView();
        curTabIndex = 0;
        changePageView(0);
        show();
        getOrderListByCondition(0);//默认取全部
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();