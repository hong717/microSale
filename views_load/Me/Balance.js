/**
 * 往来应付界面
 * Create by Mayue
 * Date 2016-1-8
 * */
var Balance = (function () {
    var $viewpage,
        hasInit,
        listviews,
        curTabIndex,
        itemsOfPage,
        tabNum,
        iheight,
        changetab = true;
    var samples = [];

    function initView() {
        if (!hasInit) {
            tabNum = 3;
            $viewpage = $('.view-business-outline');
            for (var i = 0; i < tabNum; i++) {
                var div = document.getElementById('business-outline-listwarp' + i);
                var sample = $.String.between(div.innerHTML, '<!--', '-->');
                samples.push(sample);
            }
            curTabIndex = 0;
            itemsOfPage = 10;
            initListView();
            bindEvents();
            bindScrollEvents();
            iheight = $(window).height() - 83;
            hasInit = true;
        }
    }

    //初始化列表视图数据
    function initListView() {
        listviews = [];
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('business-outline-listwarp' + i);
            var listv = document.getElementById('business-outline-list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            scroller.noticetop = 1.72;
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
    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }

    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {
                reSearch('',reset);
            },
            fnmore: function (reset) {
                GetCheckList('', reset);
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    //绑定事件
    function bindEvents() {
        initdate();
        //订单页签切换事件
        $viewpage.delegate('[data-cmd="li"]', {
            'click': function () {
                //if(changetab){
                var dataindex = this.getAttribute("data-index");
                changePageView(dataindex);//导航栏样式
                GetCheckListByCondition(dataindex);
                //} else {
                //     OptMsg.ShowMsg('数据加载中，请稍后操作...');
                //     return;
                // }
            }
        }
        );
    }

    //订单页签切换
    function changePageView(dataindex) {
        curTabIndex = dataindex;
        var li = $viewpage.find('[data-cmd="li"]');
        li.removeClass("on");
        li.eq(dataindex).addClass("on");
    }

    //刷新
    function reSearch(bfresh,fnReset) {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.scroller.isPageEnd = false;
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        if (bfresh) {
            listview.scroller.scrollTo(0, 0, 500);
            listview.listv.innerHTML = '';
        }
        GetCheckList('', fnReset);//mayue
    }

    //根据条件获取列表数据
    function GetCheckListByCondition(index, bfresh) {//mayue
        curTabIndex = index;
        var listview = listviews[index];
        var bReload = false;
        var dkey = listview.dataKey;
        var cmpkey = getCurDataKey();
        if (dkey != cmpkey) {
            bReload = true;
        }
        for (var i = 0; i < tabNum; i++) {
            $('#business-outline-listwarp' + i).hide();
        }
        if (!listview.scroller || bfresh || bReload) {
            listview.listv.innerHTML = '';
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            GetCheckList();
        }
        listview.listwrap.show();
    }

    //获取传入的条件
    function getCurDataKey() {
        var startdate = $viewpage.find('[data-cmd="kdcbegDate"]').val();
        var enddate = $viewpage.find('[data-cmd="kdcendDate"]').val();
        var key = startdate + enddate;
        return key;
    }

    //获取数据列表
    function GetCheckList(index, fnReset) {
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
            ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }

        var startdate = $viewpage.find('[data-cmd="kdcbegDate"]').val();
        var enddate = $viewpage.find('[data-cmd="kdcendDate"]').val();
        //传参
        para.para = {
            Option: parseInt(curTabIndex) + 1,
            Year: stringSplit(startdate)[0],
            BeginMonth: stringSplit(startdate)[1],
            EndMonth: stringSplit(enddate)[1]
            //Year: 2016,
            //BeginMonth: 01,
            //EndMonth: 01
        };


        //通过借口获取数据
        GetCheckListAPI(function (data, dindex) {
            var billMoney = $viewpage.find('[data-type="money"]');
            var listview2 = listviews[dindex];

            if (dindex == 0) {//概要信息
                var htmlstr = filllist(data, listview2.listdata, dindex);
            }

            if (dindex == 1) {//订单明细
                var htmlstr = fillOrderlist(data.orderlist, listview2.listdata, dindex);
                billMoney[0].innerText = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.billmoney));
            }

            if (dindex == 2) {//付款明细
                var htmlstr = fillRealpaylist(data.realpaylist, listview2.listdata, dindex);
                billMoney[1].innerText = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.realpaymoney));
            }

            var listv = listview2.listv;
            if (htmlstr == "" && listview2.currentPage == 1) {
                listview2.listwrap.find(".total-num").hide();
                listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
            } else {
                listview2.listwrap.find(".total-num").show();
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

    //概要信息
    function filllist(data, listdata, tadindex) {

        var htmlstr = $.String.format(samples[tadindex], {
            billmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.billmoney)),
            notoutmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.notoutmoney)),
            initbalance: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.initbalance)),
            trademoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.trademoney)),
            realpaymoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.realpaymoney)),
        });
        return htmlstr;
    }

    //订单明细
    function fillOrderlist(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = $.String.format(samples[tabindex], {
                billmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.billmoney)),
                statusname: item.statusname,
                billno: item.billno,
                billdate: stringSplit(item.billdate)[1] + '-' + stringSplit(item.billdate)[2],
                billclass: getBillClass(item.statusname)
            });
            htmlstr += listr;
        }
        return htmlstr;
    }

    function getBillClass(statusname) {
        var statusClass;
        switch (statusname) {
            case "待确认":
                statusClass = "time status-1"
                break;
            case "待发货":
                statusClass = "time status-2"
                break;
            case "部分发货":
                statusClass = "time status-3"
                break;
            case "已发货":
                statusClass = "time status-4"
                break;
        }
        return statusClass;
    }

    //付款明细
    function fillRealpaylist(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = $.String.format(samples[tabindex], {
                billmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.billmoney)),
                billdate: stringSplit(item.billdate)[1] + '-' + stringSplit(item.billdate)[2],
                billno: item.billno
            });
            htmlstr += listr;
        }
        return htmlstr;
    }

    //调用订单列表API
    function GetCheckListAPI(fn, para, fnReset) {
        //changetab = false;
        Lib.API.get('GetCheckStatement', para,
            function (data, json, root, userflag) {
                var index = userflag;
                removeHint(index);
                setTotalPage(index, data, json);
                var pageNum = (listviews[index].currentPage - 1) * itemsOfPage;
                fn && fn(data, userflag);
                //changetab = true;
                setScrollPageEnd(userflag);
                fnReset && fnReset();
            }, function (code, msg, json, root, userflag) {
                var index = userflag || curTabIndex;
                removeHint(index);
                kdAppSet.showErrorView(msg, errorRefresh, curTabIndex);
                fnReset && fnReset();
            }, function (errCode) {
                removeHint(curTabIndex);
                kdAppSet.showErrorView(errCode, errorRefresh, curTabIndex);
                fnReset && fnReset();
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
        GetCheckList(index);
    }

    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);

    }

    //设置list首页
    function setTotalPage(index, data, json) {
        //由于接口中总页数共用，所以端处理数据为空情况下总页数
        if (index == 0) {
            json['TotalPage'] = 0;
        }
        if (listviews[index].currentPage == 1 && index == 1 && data['orderlist'].length == 0) {
            json['TotalPage'] = 0;
        }
        if (listviews[index].currentPage == 1 && index == 2 && data['realpaylist'].length == 0) {
            json['TotalPage'] = 0;
        }
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    //设置日期
    function initdate() {
        var startdate = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var date = stringSplit(startdate);
        //初始化为当前年月，结束日期锁定当前年
        kdctrl.initDateNoDay($viewpage.find('[data-cmd="kdcbegDate"]'));//初始化开始日期插件
        kdctrl.initDateNoDay($viewpage.find('[data-cmd="kdcendDate"]'), date);//初始化结束日期插件
        $viewpage.find('[data-cmd="kdcbegDate"]').val(date[0] + '-' + date[1]);
        $viewpage.find('[data-cmd="kdcendDate"]').val(date[0] + '-' + date[1]);
        var datebegCtrl = $viewpage.find('[data-cmd="kdcbegDate"]');
        var dateendCtrl = $viewpage.find('[data-cmd="kdcendDate"]');

        datebegCtrl.bind('change', function () {
            var startdate = $viewpage.find('[data-cmd="kdcbegDate"]').val();
            var endyear = stringSplit(startdate);
            kdctrl.initDateNoDay($viewpage.find('[data-cmd="kdcendDate"]'), endyear);//锁定结束年份不可变，和开始年份一致
            $viewpage.find('[data-cmd="kdcendDate"]').val(startdate);//结束日期显示和开始一致
            reSearch(true);
        });

        dateendCtrl.bind('change', function () {
            var enddate = $viewpage.find('[data-cmd="kdcendDate"]').val();
            reSearch(true);
        }
        );
    }

    //拆分“-”
    function stringSplit(data) {
        return data.split("-");
    }

    function show() {
        $viewpage.show();
        kdAppSet.setAppTitle('交易对账');
    }

    function hide() {
        $viewpage.hide();
    }

    function render(config) {
        initView();
        changePageView(0);
        GetCheckListByCondition(0, true);//默认取全部，并刷新页面
        show();

    }
    return {
        render: render,
        show: show,
        hide: hide
    }
})();