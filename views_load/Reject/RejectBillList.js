/* 退货单列表页面*/


var RejectBillList = (function () {
    var div, sample, scroller, ul, ullist, divlist, hasInit, viewpage,
        totalPageCount, currentPage, itemsOfPage, orderlistdata,  // 列表数据控制
        searchCondition, keywordhint;  // 搜索条件控制

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectBillList');
            viewpage = $(div);
            divlist = document.getElementById('RejectBillDiv');
            FastClick.attach(divlist);
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            keywordhint = "支持名称/规格/退货单号";
            searchCondition = {};
            initScroll(divlist);
            bindEvents();
            hasInit = true;
        }
        initUlList();
    }

    // 初始化列表相关数据,清空记录
    function initUlList() {
        //页数控制
        currentPage = 1;
        totalPageCount = 0;
        itemsOfPage = 10;
        orderlistdata = [];
        ullist.html('');
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
                getBillList();
            },
            hintbottom: 1

        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 配置查询信息对象
    function setSearchCondition() {

        var endTime = " 23:59:59";
        var startDatav = viewpage.find('.dateBegin').val();
        var endDatev = viewpage.find('.dateEnd').val() + endTime;
        var keywordv = kdShare.trimStr(viewpage.find('.txtSearch').val());
        var optOpenid = kdAppSet.getUserInfo().optid;

        var ketwordstr = keywordv != keywordhint ? keywordv : '';
        searchCondition.optOpenid = optOpenid;
        searchCondition.Option = 0;
        searchCondition.KeyWord = kdAppSet.ReplaceJsonSpecialChar(ketwordstr);
        searchCondition.BeginDate = startDatav;
        searchCondition.EndDate = endDatev;
    }

    // 初始化查询信息
    function initSearchCondition() {
        var now = $.Date.now();
        now.setDate(now.getDate() - 90);
        kdctrl.initDate($(".view_RejectBillList .kdcDate"));
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

    // 设置当前总页数
    function setTotalPage(json) {
        totalPageCount = parseInt(json['TotalPage']);
    }

    // 获取退款单列表接口函数
    function GetOrderListAPI(fn, para) {
        Lib.API.get('GetSEOutStockList', para,
            function (data, json, root) {
                removeHint();
                setTotalPage(json);
                var list = $.Array.keep(data['SEOutStockList'] || [], function (item, index) {
                    return {
                        index: (currentPage - 1) * itemsOfPage + index,
                        interid: item.FInterID,
                        status: getStatus(Number(item.FRemark)),
                        billno: item.FBillNo,
                        date: item.FDate,
                        num: item.FAuxQty,
                        expressnumber: item.FWLNumber || '',
                        expresscom: item.FWLCompany || '',
                        showExpressBtn: item.FWLNumber ? '' : 'showBtn',
                        showViewBtn: item.FWLNumber ? 'showBtn' : '',
                        showRemindBtn: item.FRemark == '1' ? '' : 'showBtn'
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

    function getStatus(istatus) {
        var status = '待审核';
        if (istatus == 1) {
            status = '已同意';
        } else if (istatus == 3) {
            status = '已关闭';
        }
        return status;
    }

    // 获取参数列表
    function getBillList() {
        // 配置参数
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
        }
        // 将数据填入模板
        var htmlstr = $.Array.keep(data, function (item, index) {
            return $.String.format(sample, {
                index: item.index,
                interid: item.interid,
                status: item.status,
                billno: item.billno,
                date: item.date,
                num: item.num,
                showExpressBtn: item.showExpressBtn,
                showViewBtn: item.showViewBtn,
                showRemindBtn: item.showRemindBtn
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
            scroller.isPageEnd = (currentPage - 1 >= totalPageCount);
        }
    }

    function bindEvents() {
        initSearchCondition();
        //刷新退货单列表
        MiniQuery.Event.bind(window, {
            'FreshRejectBill': function (data) {
                getRefreshData();
            }
        });

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
                    $(this).val(keywordhint);
                }
            }
        });

        // 清空图标点击事件
        viewpage.find('.imgClear').delegate('', {
            'click': function () {
                viewpage.find('.txtSearch').val('');
                viewpage.find('.txtSearch').focus();

            },
            'touchstart': function (event) {
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
                MiniQuery.Event.trigger(window, 'toview', ['EditRejectBill', { billid: billid }]);
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 填写物流信息点击事件
        viewpage.delegate('.expresstBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                MiniQuery.Event.trigger(window, 'toview', ['RejectBillExpress', { data: orderlistdata[index] }]);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }
        });

        // 提醒厂家处理点击事件
        viewpage.delegate('.remindBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billNo = orderlistdata[index].FBillNo;
                OptMsg.RejectBillRemind(billNo);
            },
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });

        // 申请退款点击事件
        viewpage.find('.rejectBtn').delegate('', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectSelectList', {}]);
            },
            'touchstart': function () {
                $(this).addClass('rejectBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('rejectBtn_touched');
            }
        });

        // 联系客服点击事件
        viewpage.find('.serviceBtn').delegate('', {
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
                var phone = $(".serviceBtn").attr("href");
                if (phone == "tel:") {
                    jAlert("很抱歉,客服的电话号码为空!");
                    return false;
                }
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });

        // 查看进度点击事件
        viewpage.delegate('.viewBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var item = orderlistdata[index];
                OptExpress.ShowExpress(item.expressnumber);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }

        })
    }

    // 刷新列表数据
    function getRefreshData() {

        // 初始化列表数据
        initUlList();
        loadingHint();
        // 获取数据
        getBillList();
    }

    function render() {
        initView();
        show();

        getRefreshData();
        // 添加客服电话
        //var servicePhone = kdAppSet.getUserInfo().servicePhone;
        var phone = '';
        var service = OptMsg.getMsgServiceList();
        if (service.length > 0) {
            phone = service[0].servicePhone;
        }
        viewpage.find('.serviceBtn').attr("href", "tel:" + phone);

        var minHeight = viewpage.height();  // 设置最小高度，确保底部不被顶起
        viewpage.css('min-height', minHeight);
        scroller.refresh();
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
        kdAppSet.setAppTitle('退货');
        viewpage.show();
        scroller.refresh();
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