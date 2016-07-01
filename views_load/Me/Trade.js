var Trade = (function () {

    var div , tradearea , div_bar_1, div_bar_2 , div_bar_3 , div_bar_4 , div_bar_5,
        hasBind , scroller, ullist, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-trade');
            tradearea = document.getElementById('trade-detail-bar');
            div_bar_1 = '<li class="trade-bar" style="';
            div_bar_2 = '"><p>';
            div_bar_3 = '<em>￥';
            div_bar_4 = '</em></p><div class="trade-Div"><div class="trade-rect" style="';
            div_bar_5 = '"></div></di></li>';
            hasBind = false;
            scroller = null;
            ullist = $('#trade-datail');
            hasInit = true;
        }
    }

    function load(fn) {

        para = {};
        para_data = {};
        para_data.ContactGUID = kdAppSet.getAppParam().openid;
        para.para = para_data;

        Lib.API.get('GetTradeRecord', para,
            function (data, json) {
                fn && fn(data);
            }, function (code, msg) {
                removeHint();
                ullist[0].innerHTML = '';
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist[0].innerHTML = '';
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    function bindEvents() {

    }

    function roundFun(numberRound, roundDigit) {
        var str = String(numberRound);
        var strarr = str.split(".");
        if (parseInt(strarr[1].charAt[roundDigit]) >= 6) {
            return Math.round(sum * 100) / 100
        }
        else {
            return strarr[0] + "." + strarr[1].substring(0, roundDigit);
        }
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    function render() {
        initView();
        show();
        ullist[0].innerHTML = '';
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');

        load(function (data) {

            removeHint();
            var record = data.traderecord;
            var record_div = document.getElementById('trade-datail');
            var div_htmls = "";
            var total_amount = 0.0;
            for (var i = 0; i < record.length; i++) {
                (total_amount < parseFloat(record[i].amount)) && (total_amount = parseFloat(record[i].amount));
            }

            total_amount == 0 && (total_amount = 1);

            for (var i = 0; i < record.length; i++) {
                var div_html = "";
                var amount_p = record[i].amount / total_amount * 95.0;
                (amount_p <= 0.0) && (amount_p = 0);

                div_html += div_bar_1;
                div_html += div_bar_2;
                div_html += record[i].itemid + "月";
                div_html += div_bar_3;
                div_html += kdAppSet.formatMoneyStr(roundFun(record[i].amount, 2));
                div_html += div_bar_4;
                div_html += "width:" + amount_p + "%";
                div_html += div_bar_5;

                div_htmls += div_html;
            }
            div_htmls += "<div style='height:8px;'></div>";
            record_div.innerHTML = div_htmls;

            scroller.refresh();
            setTimeout(function () {
                if (scroller) {
                    scroller.refresh();
                }
            }, 500);
        });

        if (!hasBind) {
            bindEvents();
            hasBind = true;
        }

        (function (fn) {
            var reload = arguments.callee;
            if (!scroller) {
                scroller = Lib.Scroller.create(tradearea);
                scroller.pulldown({
                    selector: '#divPulldown',
                    start: 10,
                    end: 65,
                    top: 55,
                    fn: function (reset) {
                        reload(function () {
                            reset();
                        });
                    }
                });
            }
            else {
                scroller.refresh();
            }
            fn && fn(render());
        })();


    }

    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();