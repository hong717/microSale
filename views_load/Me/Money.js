var Money = (function () {
    var div , moneyarea , moneyPiechart, moneyDetail, scroller, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-Money');
            moneyarea = document.getElementById('div-money-top');
            moneyPiechart = document.getElementById('money-piechart');
            moneyDetail = document.getElementById('div-money-detail');
            scroller = Lib.Scroller.create(moneyarea);
            hasInit = true;
        }
    }


    function showPiechartDetail() {
        if (moneyPiechart && moneyDetail) {
            moneyPiechart.style.display = 'block';
            moneyDetail.style.display = 'block';
        }
    }

    function hidePiechartDetail() {
        if (moneyPiechart && moneyDetail) {
            moneyPiechart.style.display = 'none';
            moneyDetail.style.display = 'none';
        }
    }

    function removeHint() {
        $(moneyarea).children().filter('.hintflag').remove();
    }

    function load(fn) {
        var para = {};
        var para_data = {};
        para_data.ContactGUID = kdAppSet.getAppParam().openid;
        para.para = para_data;

        Lib.API.get('QueryArByCustomer', para,
            function (data, json) {
                fn && fn(data);
            }, function (code, msg) {
                removeHint();
                hidePiechartDetail();
                $(moneyarea).append('<div class="hintflag">' + msg + '</div>');
            }, function () {
                removeHint();
                hidePiechartDetail();
                $(moneyarea).append('<div class="hintflag">网络错误，请稍候再试</div>');
            });
    }

    function drawpie(a, b, c) {
        removeHint();
        showPiechartDetail();

        if (a == b == c == 0) {
            a = 100;
        }
        var color = ["#fbb517", "#ff4c50", "#0069ba"];
        var cen_x = $(document.body).width() / 2;
        var cen_y = 145;

        var data = [a, b, c];
        var canvas = document.getElementById("div-money-piechart");
        canvas.setAttribute("width", $(document.body).width());
        var ctx = canvas.getContext("2d");
        var startPoint = 1.5 * Math.PI;

        ctx.fillStyle = "#efefef";
        ctx.strokeStyle = "#efefef";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 131, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 130, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();

        for (var i = 0; i < data.length; i++) {
            ctx.fillStyle = color[i];
            ctx.strokeStyle = color[i];
            ctx.beginPath();
            ctx.moveTo(cen_x, cen_y);
            ctx.arc(cen_x, cen_y, 124, startPoint, startPoint - Math.PI * 2 * (data[i] / 100), true);
            ctx.fill();
            ctx.stroke();
            startPoint -= Math.PI * 2 * (data[i] / 100);
        }


        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 55, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 50, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();

    }

    function deal_num(sum) {
        return Math.round(sum * 100) / 100
    }

    function render() {
        initView();
        show();
        hidePiechartDetail();
        $(moneyarea).children().filter('.hintflag').remove();
        $(moneyarea).append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');

        load(function (data) {
            var datail = data.ardetail;
            var beforemon = parseFloat(datail[0].amount);
            var mon = parseFloat(datail[1].amount);
            var aftermon = parseFloat(datail[2].amount);
            var total_amount = deal_num(beforemon + mon + aftermon);
            var total_amount_p = deal_num(Math.abs(beforemon) + Math.abs(mon) + Math.abs(aftermon));

            var mon_p = total_amount_p == 0 ? 0 : deal_num(Math.abs(mon) / total_amount_p * 100.0);
            var aftermon_p = total_amount_p == 0 ? 0 : deal_num(Math.abs(aftermon) / total_amount_p * 100.0);
            var beforemon_p = total_amount_p == 0 ? 0 : deal_num(Math.abs(beforemon) / total_amount_p * 100.0);

            drawpie(mon_p, beforemon_p, aftermon_p);
            document.getElementById("div-money-amount").innerHTML = "总计<br />￥" + kdAppSet.formatMoneyStr(total_amount);

            document.getElementById("money-mon").innerHTML = "￥" + kdAppSet.formatMoneyStr(mon) + " (" + mon_p + "%)";
            document.getElementById("money-beforemon").innerHTML = "￥" + kdAppSet.formatMoneyStr(beforemon) + " (" + beforemon_p + "%)";
            document.getElementById("money-aftermon").innerHTML = "￥" + kdAppSet.formatMoneyStr(aftermon) + " (" + aftermon_p + "%)";
            scroller.refresh();

            setTimeout(function () {
                scroller.refresh();
            }, 500);
        });
        scroller.refresh();
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