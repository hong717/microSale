/**
 * Created by ziki on 2015-07-07.
 */
var BuyerList = (function () {
    var $view,
        div,
        ul,
        samples,
        hasInit,
        nextPage,
        keyword,
        userGUID,
        totalPage,
        pageSize,
        recordCount,
        TotalAmount,
        scroller,
        searchBoxTxt,
        btnClear,
        list = [],
        iheight;

    function render() {
        if (!hasInit) {
            initView();
            renderList();
            hasInit = true;
        }
        show();
    }

    function show() {
        $view.show();
    }

    function hide() {
        $view.hide();
    }

    function initView() {

        $view = $('#view_buyerList');
        div = document.getElementById('template-buyer-List');
        ul = $(div).find('.list')[0];
        list = [];
        nextPage = 1;
        pageSize = 10;
        keyword = '';
        iheight = $(div).height();
        userGUID = kdAppSet.getUserInfo().optid;
        samples = $.String.getTemplates(div.innerHTML, [
            {
                name: 'li',
                begin: '<!--',
                end: '-->'
            }
        ]);
        searchBoxTxt = $('#buyerList-searchBox');
        replaceImg();
        initScroll(div);
        bindEvents();
        toggleHint(true);
    }

    function bindEvents() {

        initDate();

        $('#buyerList-searchBtn').on('click', function () {
            search();
        }).on(kdShare.clickfn());

        btnClear = $view.find('.clear-icon');
        searchBoxTxt.on({
            'click': function () {
            },
            'focus': function () {
                searchBoxTxt.val() ? btnClear.show() : btnClear.hide();
            },
            'blur': function () {

            },
            'input': function () {
                btnClear.show();
            }
        });

        searchBoxTxt.on('keyup', function (event) {
            if (event.keyCode == '13') {
                search();
            }
        });

        $view.find('.clear-icon').on('click', function () {
            searchBoxTxt.val('');
            searchBoxTxt.focus();
        });


        $("#view_buyerList .btnDate").bind("click", function () {
            var searchView = $("#view_buyerList .search");
            var btnDateImg = $(this).find("img");
            var bview = searchView.css("display");
            var itop = '126px';
            if (bview == "none") {
                scroller.noticetop = 86;
                btnDateImg.removeClass("sprite-downext downext");
                btnDateImg.addClass("sprite-upext upext");
            } else {
                itop = '86px';
                scroller.noticetop = 126;
                btnDateImg.removeClass("sprite-upext upext");
                btnDateImg.addClass("sprite-downext downext");
            }
            scroller.refresh();
            $("#view_buyerList .div-list").animate({top: itop}, "normal");
            searchView.animate({height: 'toggle', opacity: 'toggle'}, "normal");
        });

        //买家订单事件绑定--mayue
        $view.delegate('[data-cmd="buyer"]', {
            'click': function () {
                var index = $(this).attr('data-index');
                var curitem = list[index];
                var data = {
                    buyerId: curitem.UUID,
                    beginDate: $("#buyerlist_dateBegin").val(),
                    endDate: $("#buyerlist_dateEnd").val()
                };
                MiniQuery.Event.trigger(window, 'toview', ['BuyerOrderList', {
                    data: data
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

    function search() {
        scroller.isPageEnd = false;
        nextPage = 1;
        list = [];
        ul.innerHTML = '';
        scroller.refresh();
        keyword = kdAppSet.ReplaceJsonSpecialChar($('#buyerList-searchBox').val());
        toggleHint(true);
        renderList();
    }

    function replaceImg() {
        $view.find('.search-icon').attr('src', 'img/search.png');
        $view.find('.clear-icon').attr('src', 'img/clear.png');
    }

    function renderHeader() {
        var str = recordCount > 0 ? '(' + recordCount + ')' : '(0)';
        $('#span-buyer-count')[0].innerText = str;
    }

    function initDate() {

        kdctrl.initDate($(".buyerList .kdcDate"));

        var endDate = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var now = $.Date.now();
        now.setDate(now.getDate() - 30);
        var startDate = $.Date.format(now, "yyyy-MM-dd");
        $("#buyerlist_dateBegin").val(startDate);
        $("#buyerlist_dateEnd").val(endDate);

        var dateCtrl = $('#buyerlist_dateBegin,#buyerlist_dateEnd');
        dateCtrl.bind('change',
            function () {
                search();
            }
        );
    }

    function renderList() {

        var startDatav = $("#buyerlist_dateBegin").val();
        var endDatev = $("#buyerlist_dateEnd").val() + " 23:59:59";

        loadData(function (data) {
            toggleHint(false);
            if (recordCount == 0) { //无数据
                nextPage = 1;
                ul.innerHTML = kdAppSet.getEmptyMsg(iheight);
                scroller.refresh();
                scroller.isPageEnd = true;
                return;
            }

            var dateShow = '';
            var moneyShow = 'show';
            if (!kdAppSet.getIsShowPrice()) {
                moneyShow = '';
                dateShow = 'show';
            }

            var listHead = '';
            if (nextPage == 1 && moneyShow != '') {
                listHead = $.String.format(samples.li, {
                    index: -1,
                    name: '',
                    'date-show': dateShow,
                    'money-show': moneyShow,
                    desc: '订单总金额:',
                    money: kdAppSet.formatMoneyStr(TotalAmount),
                    total: 'total'
                });
            }

            var HTMLPart = listHead + $.Array.keep(data, function (item, index) {
                var j = pageSize * (nextPage - 1) + index;
                return $.String.format(samples.li, {
                    index: j,
                    desc: '',
                    name: item.FName,
                    'date-show': dateShow,
                    'money-show': moneyShow,
                    money: kdAppSet.formatMoneyStr(item.Amount),
                    time: item.CreateDate
                });
            }).join('');

            ul.innerHTML = nextPage == 1 ? HTMLPart : ul.innerHTML + HTMLPart;
            nextPage++;
            if (nextPage > totalPage) {
                scroller.isPageEnd = true;
            }
            scroller.refresh();
        }, {
            ownerGUID: userGUID,
            keyword: keyword,
            begindate: startDatav,
            enddate: endDatev
        });
    }

    /**
     * @param param 买家列表接口需传入参数，包括：
     * ownerGUID {string} 分享者 GUID，
     * index {number} 请求的页码，
     * keyword {string} 查询条件
     */
    function loadData(fn, param) {
        Lib.API.get('GetRetailList', {
                currentPage: nextPage,
                ItemsOfPage: pageSize,
                para: param
            },
            function (data, json) {
                totalPage = json.TotalPage;
                list = list.concat(data.RetailList);
                recordCount = data.recordcount;
                TotalAmount = data.TotalAmount;
                renderHeader();
                fn && fn(data.RetailList);
            },
            function (code, msg) {
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">' + msg + '</li>');
                scroller.isPageEnd = true;
                scroller.refresh();
            },
            function () {
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">网络错误，请稍候再试</li>');
                scroller.isPageEnd = true;
                scroller.refresh();
            });
    }

    function initScroll(div) {
        scroller = Lib.Scroller.create(div);
        var options = {
            fnfresh: function (reset) {
                scroller.isPageEnd = false;
                nextPage = 1;
                list = [];
                renderList();
                reset();
            },
            fnmore: function (reset) {
                if (nextPage <= totalPage) {
                    toggleHint(true);
                    renderList();
                }
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, options);
    }

    function toggleHint(isShow) {
        if (isShow) {
            $(ul).children().filter('.hintflag').remove();
            $(ul).append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            scroller.refresh();
            return;
        }
        $(ul).children().filter('.hintflag').remove();
        $(ul).children().filter('.spacerow').remove();
    }

    return{
        render: render,
        show: show,
        hide: hide
    }
})();