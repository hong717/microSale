var PaymentList = (function () {
    var div , viewpage,
        sample,
        tabNum,
        itemsOfPage,
        listviews,
         //0待付款 1微信支付 2线下支付
        listStatus={
            all:0,
            wxpay:1,
            offline:2
        },
        curTabIndex,
        itemsOfPage ,
        iheight, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            tabNum = 3;
            div = document.getElementById('viewid_paymentList');
            viewpage = $(div);
            sample = $.String.between(document.getElementById('paymentlist_list0').innerHTML, '<!--', '-->');
            listviews = [];
            initListView();
            itemsOfPage = 10;
            curTabIndex = 0;
            iheight = $(window).height() - 44 - 40;
            bindEvents();
            bindScrollEvents();
            hasInit = true;
        }
    }

    //初始化列表视图数据
    function initListView() {
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('paymentlist_listwrap' + i);
            var listv = document.getElementById('paymentlist_list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            var listview = {
                listv: listv,
                listwrap: $(listwrap),
                scroller: scroller,
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh:false
            };
            listviews.push(listview);
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

    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }


    //根据条件获取列表数据 bfresh 是否要求强制刷新
    function getOrderListByCondition(index, bfresh) {
        curTabIndex = index;
        var listview = listviews[index];
        $('.paymentlist').hide();
        changePageView(index);
        listview.listwrap.show();
        if (!listview.fresh || bfresh ) {
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            listview.fresh=true;
            GetOrderList();
        }
    }

    function removeHint(tabindex) {
        var ullist= getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    //获取当前list操作
    function getOptlist(index){
        return $(listviews[index].listv);
    }

    //根据模板获取列表字符串信息
    function getTemplateStr(item,tabindex) {
        var listr = $.String.format(sample, {
            billno: item.billno,
            status: getStatusName(item.status),
            statuscolor: getStatusColor(item.status),
            money: kdAppSet.getRmbStr+kdAppSet.formatMoneyStr(item.money),
            time: item.date,
            index: item.index,
            tabindex: tabindex
        });
        return listr;
    }

    function getStatusColor(status) {
        //status -1 已失效 0 待确认 1已确认
        var colors=['lost','checking','checked'];
        return colors[status+1];
    }

    function getStatusName(status) {
        //status -1 已失效 0 待确认 1已确认
        var s=['已失效','待确认','已确认'];
        return s[status+1];
    }


    //获取数据列表html字符串
    function getListHtml(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = getTemplateStr(item,tabindex);
            htmlstr += listr;
        }
        return htmlstr;
    }

    //获取订单列表
    function GetOrderList() {
        var index = curTabIndex;
        var listview = listviews[index];
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            return;
        }
        var para = {
            currentPage:listview.currentPage,
            ItemsOfPage:itemsOfPage
        };
        var ullist=getOptlist(index);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }
        var optOpenid = kdAppSet.getUserInfo().optid;
        var parax = {
            optOpenid: optOpenid,
            Option: getOption(curTabIndex)
        };
        para.para = parax;
        GetListAPI(function (data, indexflag) {
            var listview2 = listviews[indexflag];
            var htmlstr = getListHtml(data, listview2.listdata, indexflag);
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


    function getOption(tabindex){
       // -1：全部； 0：线下支付； 1：微信支付
        var options=[-1,1,0];
        return options[tabindex];
    }

    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);
    }

    function setTotalPage(index, json) {
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    function getListData(data,tabindex){
        var pageNum=(listviews[tabindex].currentPage - 1) * itemsOfPage;
        list= $.Array.keep(data['saledlist'] || [], function (item, index) {
            return {
                index: pageNum+ index,
                interid: item.payorderinterid,
                money: item.paymoney,
                status: Number(item.paystatus),
                billno: item.payno,
                date: item.paydate,
                orderno: item.payorder || '',
                payno: item.payno
            };
        });
        return list;
    }

    //调用付款单列表api
    function GetListAPI(fn, para) {
        Lib.API.get('GetPayListInfo', para,
            function (data, json, root, tabindex) {
                removeHint(tabindex);
                setTotalPage(tabindex, json);
                var list=getListData(data,tabindex);
                fn && fn(list, tabindex);
                setScrollPageEnd(tabindex);
            }, function (code, msg, json, root, tabindex) {
                var index = tabindex || curTabIndex;
                removeHint(index);
                var ullist =getOptlist(index);
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint(curTabIndex);
                var ullist = getOptlist(curTabIndex);
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            }, curTabIndex);
    }

    //订单页签切换
    function changePageView(tabindex) {
        var headtab = viewpage.find(".headtab");
        var tabs = headtab.find('.tab');
        var listviews = viewpage.find(".paymentlist");
        var linebs = headtab.find('.lineb');
        tabs.css('color', '#686f76');
        linebs.hide();
        listviews.hide();
        $(linebs[tabindex]).show();
        $(listviews[tabindex]).show();
        $(tabs[tabindex]).css('color', '#FF753E');
    }


    function bindEvents() {

        MiniQuery.Event.bind(window, {
            'freshPaymentListInfo': function () {
                freshPaymentList();
            }
        });

        $("#viewid_paymentList .headtab .tab").bind('click', function () {
            var dataindex = this.getAttribute("data-index");
            getOrderListByCondition(dataindex);
        });

        for (var i = 0; i < tabNum; i++) {
            ListBindEvents(listviews[i].listv);
        }

        viewpage.delegate('.add_PayOrder',{
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                    {
                        newbill:true,
                        payNo: '',
                        payOrder: ''
                    }
                ]);
            },
            'touchstart': function () {
                $(this).addClass('addNo_Touched');
            },
            'touchend': function () {
                $(this).removeClass('addNo_Touched');
            }
        });
    }

    function ListBindEvents(ulobj) {

        $(ulobj).delegate('li', {
            'click': function () {
                var tabindex = this.getAttribute('tabindex');
                var index=this.getAttribute('index');
                var item=listviews[tabindex].listdata[index];
                MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                    {
                        payNo: item.payno,
                        payOrder: item.orderno
                    }
                ]);

            },
            'touchstart': function () {
                $(this).parents('li').css('background', '#fff');
                $(this).css('background-color', '#d9dadb');
            }, 'touchend': function () {
                $(this).css('background-color', '#fff');
            }
        });
    }


    function freshPaymentList() {
        if(hasInit){
            getOrderListByCondition(curTabIndex, true);
        }
    }

    function reSearch(bsearch) {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.currentPage = 1;
        listview.listdata.length = 0;
        if (bsearch) {
            listview.scroller.scrollTo(0, 0, 500);
            listview.listv.innerHTML = '';
        }
        GetOrderList();
    }

    function render(config) {
        initView();
        show();
        kdAppSet.setKdLoading(false);
        var tabindex = config.tabindex || 0;
        getOrderListByCondition(tabindex);
    }

    function show() {
        $(div).show();
        kdAppSet.setAppTitle('我的付款');
        kdAppSet.setKdLoading(false);
        listviews[curTabIndex].scroller.refresh();
    }

    function hide() {
        $(div).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();

