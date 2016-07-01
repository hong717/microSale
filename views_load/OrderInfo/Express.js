var Express = (function () {

    var div, orderexpressarea, expressul, orderul, orderultemp,
        scroller, Targetorder, expressnumber, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-express');
            orderexpressarea = document.getElementById('express-scrollarea');
            expressul = document.getElementById('expressul');
            orderul = document.getElementById('orderul');
            orderultemp = $.String.between(orderul.innerHTML, '<!--', '-->');
            scroller = null;
            Targetorder = {};
            expressnumber = '';
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        //物流信息查询
        $(div).delegate('.express-query', {
            'click': function () {
                OptExpress.ShowExpress(expressnumber);
            }
        });
    }

    function removeHint() {
        $(orderul).children().filter('.hintflag').remove();
        $(orderul).children().filter('.spacerow').remove();
    }

    function render(config) {
        initView();
        show();
        $('#kdloading').hide();
        if (config != undefined) {
            Targetorder = config.item;
        }
        $('#express-billno').html(Targetorder.billno);
        $('#express-date').html(Targetorder.date);
        $('.express-express').hide();
        getOrderDetaildata();
    }

    function getExpressDuration() {
        var billdata = $('#express-date').html();
        var startTime = billdata.substr(0, 10);
        var startTimes = startTime.split('-');
        var startDate = new Date();
        startDate.setFullYear(startTimes[0], startTimes[1] - 1, startTimes[2]);
        var endDate = new Date();
        var endTd = $('#orderul');
        var endItem = endTd.parent().find('.second-td');
        if (endTd.length != 0 && endItem.length != 0) {
            for (var i = 0; i < endItem.length; i++) {
                var state = endItem[i].children[0].innerHTML;
                state = state.match('已发货');
                if (state) {
                    var endTime = endItem[i].children[1].innerHTML;
                    var endTimes = endTime.split('-');
                    endDate.setFullYear(endTimes[0], endTimes[1] - 1, endTimes[2]);
                    break;
                }
            }
        }
        var oneDay = 1000 * 60 * 60 * 24;
        var duration = Math.floor(Math.abs((endDate - startDate) / oneDay));
        duration = !isNaN(duration) ? duration : '--';
        $('#express-duration').html(duration);
    }


    function getOrderDetaildata() {

        var reload = arguments.callee;
        orderul.innerHTML = '';
        $(orderul).children().filter('.hintflag').remove();
        $(orderul).append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        $(orderul).children().filter('.spacerow').remove();
        $(orderul).append('<li class="spacerow"></li>');
        var para = {};
        para.currentPage = 1;
        para.ItemsOfPage = 50;
        para.para = { Interid: Targetorder.interid };

        getOrderTrackAPI(function (data) {

            var list = data;
            if (list.reverse) {
                list.reverse();
            }
            var endstyle = 'express-table-end sprite-linebottom';
            var normalstyle = 'express-table-normal sprite-line';
            orderul.innerHTML = $.Array.keep(list, function (item, index) {
                var expressQuery = '';

                var outbillno = item.foutbillno || '';
                if (outbillno) {
                    outbillno = '出库单：' + outbillno;
                }

                //var express = item.fwlnumber || '';
                //if (express) {
                //    expressnumber = express;
                //    express = '物流单：' + express;
                //}
                //var expressCmp = kdShare.StrNumToPhone(item.fwlcompay) || '';
                //if (expressCmp) {
                //    express = express + '(' + expressCmp + ')';
                //}
                //if (express) {
                //    express = express + '    ';
                //    expressQuery = '[物流查询]';
                //}


                var expressCmp = kdShare.StrNumToPhone(item.fwlcompay) || '';
                if (expressCmp) {
                    expressCmp = '物流公司：' + expressCmp;
                }

                var wlnumber = item.fwlnumber || '';
                if (wlnumber) {
                    expressnumber = wlnumber;
                    wlnumber = '物流单号：' + wlnumber + '    ';
                    expressQuery = '[物流查询]';
                }

                return $.String.format(orderultemp, {
                    'status': item.ftitle,
                    'time': item.fdate,
                    'out-bill': outbillno,
                    'wlcompay': expressCmp,
                    'wlnumber': wlnumber,
                    'express-query': expressQuery,
                    'style': index == '0' ? endstyle : normalstyle
                });
            }).join('');

            getExpressDuration();
            if (!scroller) {
                scroller = Lib.Scroller.create(orderexpressarea);
                var option = {
                    hinttop: 1.5,
                    fnfresh: function (reset) {
                        orderul.innerHTML = '';
                        reload();
                        reset();
                    },
                    hintbottom: -0.4
                };
                kdctrl.initkdScroll(scroller, option);
            }
            else {
                scroller.refresh();
            }
            $('#kdloading').hide();
        }, para);
    }

    function getOrderTrackAPI(fn, para) {
        Lib.API.get('GetOrderTrack', para,
            function (data, json) {
                fn && fn(data['statuslist']);
            }, function (code, msg, json, root, userflag) {
                removeHint();
                $(orderul).append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                $(orderul).append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    function show() {
        $(div).show();
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

