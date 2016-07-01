/* 可退货的订单列表页*/
var RejectSelectList = (function () {
    var div, sample, scroller, ul, ullist, divlist, hasInit, viewpage,
        totalPageCount, currentPage, itemsOfPage, orderlistdata,  // 列表数据控制
        searchCondition, keywordhint;  // 搜索条件控制;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectSelectList');
            viewpage = $(div);
            divlist = document.getElementById('RejectSelectDiv');
            FastClick.attach(divlist);
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            keywordhint = "支持名称/规格/订单号";
            searchCondition = {};
            initScroll(divlist);
            bindEvents();
            hasInit = true;
        }
        initUlList();
    }

    // 初始化列表信息，清空数据
    function initUlList() {
        //页数控制
        currentPage = 1;
        totalPageCount = 0;
        itemsOfPage = 10;
        orderlistdata = [];
        ullist.html('');
    }

    // 初始化列表相关数据,清空记录
    function setSearchCondition() {
        var endTime = " 23:59:59";
        var startDatav = viewpage.find('.dateBegin').val();
        var endDatev = viewpage.find('.dateEnd').val() + endTime;
        var keywordv = kdShare.trimStr(viewpage.find('.txtSearch').val());
        var optOpenid = kdAppSet.getUserInfo().optid;
        var keywordStr=(keywordv != keywordhint ? keywordv : '');
        searchCondition.optOpenid = optOpenid;
        searchCondition.Option = 4;
        searchCondition.KeyWord = kdAppSet.ReplaceJsonSpecialChar(keywordStr);
        searchCondition.BeginDate = startDatav;
        searchCondition.EndDate = endDatev;
    }


    // 初始化查询信息
    function initSearchCondition() {
        var now = $.Date.now();
        now.setDate(now.getDate() - 90);
        kdctrl.initDate($(".view_RejectSelectList .kdcDate"));
        viewpage.find('[data-cmd="kdcbegDate"]').val($.Date.format(now, "yyyy-MM-dd"));
        viewpage.find('[data-cmd="kdcendDate"]').val($.Date.format($.Date.now(), "yyyy-MM-dd"));

        viewpage.find('.txtSearch').val(keywordhint);
        viewpage.find('.txtSearch').blur();
        // 折叠时间栏
        var dateCtrl = $('[data-cmd="kdcbegDate"],[data-cmd="kdcendDate"]');
        dateCtrl.bind('change',
            function () {
                getRefreshData();
            }
        );
        foldTheBar();
    }

    // 折叠时间栏
    function foldTheBar() {
        var selectDiv = viewpage.find('.RejectSelectDiv');
        var datePan = viewpage.find('.datePan');
        var imgBox = viewpage.find('.btnDate img');
        imgBox.removeClass('sprite-upext');
        imgBox.addClass('sprite-downext');
        selectDiv.removeClass('unfoldDate');
        datePan.css('display', 'none');
        scroller.noticetop = 50;
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 1,
            fnfresh: function (reset) {
                reset();
                getRefreshData();
            },
            fnmore: function (reset) {
                reset();
                //加载下一页
                getBillList();
            },
            hintbottom: 0.2

        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 设置总页数
    function setTotalPage(json) {
        totalPageCount = parseInt(json['TotalPage']);
    }

    // 获取列表接口函数
    function GetOrderListAPI(fn, para) {
        Lib.API.get('GetSEOrderList', para,
            function (data, json, root) {
                removeHint();
                setTotalPage(json);
                var list = $.Array.keep(data['SEOrderList'] || [], function (item, index) {
                    return {
                        index: (currentPage - 1) * itemsOfPage + index,
                        interid: item.FInterID,
                        amount: item.famount,
                        status: item.FRemark == 3 ? '已发货' : item.FRemark == 4 ? '已收货' : '',
                        consigndate: item.fconsigndate,
                        billno: item.FBillNo,
                        date: item.FDate,
                        settle: item.fsettlename,
                        expressnumber: item.FWLNumber,
                        expresscom: item.FWLCompany
                    };
                });
                fn && fn(list);
                currentPage++;
                setScrollPageEnd();
            }, function (code, msg, json, root, userflag) {

                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {

                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            }
        );
    }

    // 获取列表信息
    function getBillList() {
        var para = {};
        para.currentPage = currentPage;
        para.ItemsOfPage = itemsOfPage;

        setSearchCondition();
        para.para = searchCondition;

        // 获取列表数据
        GetOrderListAPI(function (data) {
            getListHtml(data, orderlistdata);
        }, para);
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata) {
        var inum = data.length;

        // 首页刷新为空显示
        if (currentPage == 1 && inum == 0) {
            var iheight = viewpage.find('.RejectSelectList').height();
            ullist.html(kdAppSet.getEmptyMsg(iheight));
            return;
        }

        for (var i = 0; i < inum; i++) {

            // 将对应index的单项保存到listdata中
            listdata[data[i].index] = data[i];
            var item = data[i];
        }
        // 将数据填入模板
        var htmlstr = $.Array.keep(data, function (item, index) {
            return $.String.format(sample, {
                index: item.index,
                interid: item.interid,
                status: item.status,
                billno: item.billno,
                date: item.date,
                num: item.num
            });
        }).join('');

        // 列表中显示数据
        if (currentPage > 1) {

            ullist.append(htmlstr);
        } else {
            ullist.html(htmlstr);
        }
        scroller.refresh();
    }

    // 最后一页设置
    function setScrollPageEnd() {
        if (scroller) {
            scroller.isPageEnd = currentPage - 1 >= totalPageCount;
        }
    }

    // 事件绑定
    function bindEvents() {
        initSearchCondition();
        // 输入框焦点事件
        viewpage.find('.txtSearch').delegate('', {
            'focus': function () {
                viewpage.find('.imgClear').css('display', 'block');
                $(this).addClass('search_touched');

                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == keywordhint) {
                    $(this).val('');
                }
            },
            'blur': function () {
                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == '' || searchVal == keywordhint) {
                    viewpage.find('.imgClear').css('display', 'none');
                    $(this).removeClass('search_touched');
                    //$(this).val(keywordhint);
                }
            }
        });

        // 清空图标点击事件
        viewpage.find('.imgClear').delegate('', {
            'click': function () {
                viewpage.find('.txtSearch').val('');
                viewpage.find('.txtSearch').focus();
                event.stopPropagation();
            },
            'touchstart': function (event) {
                event.stopPropagation();
            }
        });

        // 搜索按键点击事件
        viewpage.find('.btnSearch').delegate('', {
            'click': function () {
                initUlList();
                loadingHint();
                getBillList();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 展开按键点击事件
        viewpage.find('.btnDate').delegate('', {
            'click': function () {
                var selectDiv = viewpage.find('.RejectSelectDiv');
                var datePan = viewpage.find('.datePan');
                var imgBox = $(this).find('img');

                var classStr = imgBox.attr('class');

                if (classStr.match('sprite-downext')) {
                    imgBox.removeClass('sprite-downext');
                    imgBox.addClass('sprite-upext');

                    selectDiv.addClass('unfoldDate');
                    datePan.css('display', 'block');
                    scroller.noticetop = 100;
                } else {
                    foldTheBar();
                }
                scroller.refresh();
            }
        });

        // 订单项点击事件
        viewpage.delegate('li .ItemInfo', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billid = orderlistdata[index].interid;
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', { billId: billid, isReject: true }]);
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 退款按键事件
        viewpage.delegate('.rejectBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billid = orderlistdata[index].interid;
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelect', { billid: billid }]);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }
        });
    }

    // 刷新列表
    function getRefreshData() {

        // 初始化列表数据
        initUlList();
        loadingHint();
        // 获取数据
        getBillList();
    }

    function render(configp) {
        config = configp || {};
        initView();
        getRefreshData();
        show();
    }

    // 加载提示
    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');
    }

    // 清除加载提示
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
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