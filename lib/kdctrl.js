var kdctrl = (function () {

    var maxDate = new Date(2030, 11, 31, 23, 59, 59);//最大日期2030.12.31
    var minDate = new Date(1949, 0, 01, 00, 00, 00);//最小日期1949.1.1
    function initDate(dateCtrl) {
        //初始化日期控件
        dateCtrl.mobiscroll().date({
            theme: 'android-ics',
            lang: 'zh',
            maxDate: maxDate,
            minDate: minDate,
            display: 'bottom',
            mode: 'scroller',
            dateFormat: "yy-mm-dd",
            inputDateFormat: "yy-mm-dd",
            showLabel: false,
            dateOrder: 'yymmdd',
            cancelText: "取消",
            setText: "确定",
            rows: 5
        });
    }

    //date Array(年，月)
    function initDateNoDay(dateCtrl, date) {
        //初始化日期控件，只有年月
        if (date) {
            var maxtime = new Date(date[0], 11, 31, 23, 59, 59);//12月
            var mintime = new Date(date[0], date[1]-1, 01, 00, 00, 00);//1号
        }
        else {
            var maxtime = maxDate;
            var mintime = minDate;
        }
        dateCtrl.mobiscroll().date({
            theme: 'android-ics',
            lang: 'zh',
            maxDate: maxtime,
            minDate: mintime,
            display: 'bottom',
            mode: 'scroller',
            dateFormat: "yy-mm",
            inputDateFormat: "yy-mm",
            showLabel: false,
            dateOrder: 'yymm',
            cancelText: "取消",
            setText: "确定",
            rows: 5
        });
    }

    //日期控件按下效果
    function dateClick(classCtrl) {
        $(document).delegate(classCtrl, {
            'touchstart': function () {
                $(this).css('border-color', '#FF6427');
                $(this).children().css('color', '#FF6427');
            },
            'touchend': function () {
                $(this).css('border-color', '#C2C8CD');
                $(this).children().css('color', '#343434');
            }
        });
    }

    //图片按下放大效果
    function imageClick(classCtrl) {
        $(document).delegate(classCtrl, 'click', function () {
            kdShare.Image.setBigImage($(this));
        });
    }

    //输入框提示
    function inputHint(classCtrl) {
        $(document).delegate(classCtrl, {
            'focus': function () {
                var txtHint = $(this).attr("hint");
                if ($.trim($(this).val()) == txtHint) {
                    $(this).val('');
                }
            },
            'blur': function () {
                var txtHint = $(this).attr("hint");
                if ($.trim($(this).val()) == '') {
                    $(this).val(txtHint);
                }
            }
        })
    }

    function initkdScroll(scroll, option) {
        option.notice = option.notice || {};
        option.notice.down = option.notice.down || $('#divPulldown');
        option.notice.up = option.notice.up || $('#divPullup');

        var wrapper = scroll.wrapper;
        if (!option.hinttop) {
            var itop = $(wrapper).css("top").replace("rem", "");
            option.hinttop = Number(itop) + 0.07;
        }

        if (!option.hintbottom) {
            var ibottom = $(wrapper).css("bottom").replace("rem", "");
            option.hintbottom = Number(ibottom) + 0.07;
        }

        if (!option.fnfresh) {
            option.hinttop = -1;
        }
        if (!option.fnmore) {
            option.hintbottom = -1;
        }
        initScroll(scroll, option);
    }

    function initScroll(scroll, option) {
        var fnfresh = option.fnfresh;
        var fnmore = option.fnmore;
        var notice = option.notice;
        var itop = option.hinttop;
        var ibottom = option.hintbottom;
        var state = 0;
        var msgAllDataShow = "已是最后一页";
        scroll.on(
            {
                'scrollStart': function () {
                    state = 0;
                    this.isWaitingForManualReset = false;

                },
                'scroll': function () {

                    var y = this.y;
                    if (y > 0) {
                        if (y < 25) {
                            if ((state & 1) == 0) {
                                state = 1;
                            }
                        }
                        else if (25 <= y && y < 60) {
                            if ((state & 2) == 0) {
                                var top = scroll.noticetop || itop;
                                notice.down.html('下拉刷新').show().css({ top: top + 'rem' });
                                state = 2;
                            }
                        }
                        else if (y >= 60) {
                            if ((state & 4) == 0) {
                                notice.down.html('松开立即刷新');
                                state = 4;
                            }
                        }
                    }
                    else if (y < 0) {
                        var Y = Math.abs(this.y);
                        var MaxY = Math.abs(this.maxScrollY);
                        if ((Y - MaxY) < 10) {
                            if ((state & 1) == 0) {
                                state = 1;
                            }
                        }
                        else if (25 <= (Y - MaxY) && (Y - MaxY) < 50) {
                            if ((state & 2) == 0) {
                                if (fnmore) {
                                    var msghint = '上拉刷新';
                                    if (scroll.isPageEnd) {
                                        msghint = msgAllDataShow;
                                    }
                                    var bottom = scroll.noticebottom || ibottom;
                                    notice.up.html(msghint).show().css({  bottom: bottom / 50 + 'rem'});
									
                                }
                                state = 2;
                            }
                        }
                        else if (Y - MaxY >= 50) {
                            if ((state & 4) == 0) {
                                if (fnmore) {
                                    if (scroll.isPageEnd) {
                                        notice.up.html(msgAllDataShow);
                                    } else {
                                        notice.up.html('松开加载更多');
                                    }
                                }
                                state = 4;
                            }
                        }
                    }
                    scroll.fnscroll && scroll.fnscroll();
                },
                'beforeScrollEnd': function () {

                    if ((state & 4) == 4) {
                        this.isWaitingForManualReset = true;
                        var self = this;
                        if (this.y > 0) {
                            if (fnfresh) {
                                notice.down.html('正在刷新...');
                                if (this.y > 60) {
                                    fnfresh && fnfresh(function () {
                                        notice.down.html('刷新成功！');
                                        setTimeout(function () {
                                            notice.down.hide();
                                            self.scrollTo(0, 0, 500, self.options.bounceEasing);
                                        }, 250);
                                    });
                                }
                            } else {
                                notice.down.hide();
                                self.scrollTo(0, 0, 500);
                            }
                        } else {
                            var Y = Math.abs(this.y);
                            var MaxY = Math.abs(this.maxScrollY);
                            if (scroll.isPageEnd) {
                                self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                            } else {
                                //notice.up.html('正在加载...');
                                notice.up.html('');
                            }
                            if (Y - MaxY >= 50) {
                                fnmore && fnmore(function () {
                                    setTimeout(function () {
                                        notice.up.hide();
                                        //self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                                    }, 250);
                                });
                                if (!fnmore) {
                                    setTimeout(function () {
                                        notice.up.hide();
                                        self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                                    }, 250);
                                }
                            } else {
                                notice.up.hide();
                                //self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                            }
                        }
                    } else {
                        notice.down.hide();
                        notice.up.hide();
                    }
                },

                'inertiaScrollEnd':function(){
                    scroll.fnscroll && scroll.fnscroll(true);
                    //console.log('inertiaScrollEnd');
                }

            });
    }

    //是否PC浏览器
    function isPcBrower() {
        var userAgentInfo = navigator.userAgent.toLowerCase();
        var Agents = ["android", "iphone", "ipad", "ipod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    function ShowMsg(msg){
        try{
            OptMsg.ShowMsg(msg);
        }catch(ex){
        }
    }

    //键盘控件处理
    var KeyBoard = (function () {

        var keyb = $(".keyboard");
        var name = keyb.find(".name");
        var input = keyb.find(".input");
        var config = {};
        var firstInput = false;
        var index = 0;
        var indexNext = 0;
        var maxnum = 999999999;
        var allowZero = false;
        var canHideKeyboard = false;
        var pcBrower = isPcBrower();
        var maxhint = "";
        bindEvent();

        function getMaxNum(num){
            if(num!=undefined){
                return num;
            }
            return 999999999;
        }

        function initKeyBoard(kbconfig) {
            config = kbconfig;
            index = kbconfig.index;
            maxhint = kbconfig.maxhint || "数字不能超过最大值 ";
            indexNext = index + 1;
            maxnum = getMaxNum(kbconfig.maxnum);
            allowZero = kbconfig.allowZero || false;
            keyb.css({bottom: "-163px"});
            name.text(kbconfig.name || "");
            var keyinput = $(".keyboard .row .input");
            if (kbconfig.name == "") {
                keyinput.css({"width": "88%", "text-align": "center"});
            } else {
                keyinput.css({"width": "38%", "text-align": "left"});
                $("#keyboardMark").show();
            }
            input.text(kbconfig.input || "");
            firstInput = true;
            canHideKeyboard = false;
        }

        function setKeyBoard(kbconfig) {
            index = kbconfig.index;
            indexNext = index + 1;
            maxnum = getMaxNum(kbconfig.maxnum);
            name.text(kbconfig.name || "");
            input.text(kbconfig.input || "");
            firstInput = true;
            canHideKeyboard = false;
        }

        function freshKeyBoard(kbconfig) {
            input.text(kbconfig.input || "");
        }

        function hideKeyBoard() {
            $("#divMask").show();
            keyViewShow(false);
            config.hidefn && config.hidefn();
            setTimeout(function () {
                $("#divMask").hide();
            }, 500);
            $("#keyboardMark").hide();
        }


        function clickEffect(curclick, keyv, flag) {

            switch (keyv) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "0":
                case "point":
                    if (flag == 1) {
                        curclick.css("background", "#B9B9C4");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;

                case "clear":
                    if (flag == 1) {
                        curclick.css("background", "#EC2B2B");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;
                case "clear1":
                    if (flag == 1) {
                        curclick.css("background", "#6c6c6c");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;
                case "ok":
                    if (flag == 1) {
                        curclick.css("background", "#B9B9C4");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;
            }

        }

        //数字键盘响应事件
        function dealNumKeyEvent(objclick) {
            var curclick = objclick;
            var keyv = curclick.attr("key");
            var curv = input.text();
            if (!pcBrower) {
                clickEffect(objclick, keyv, 1);
            }
            switch (keyv) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "0":
                    var newv = null;
                    var len = curv.length;
                    if (firstInput || (curv == 0 && len == 1)) {
                        newv = keyv;
                    } else {
                        newv = curv + keyv;
                    }
                    var newvInt = newv;
                    if (newvInt > maxnum) {
                        ShowMsg(maxhint + maxnum, "", 1500);
                        return;
                    }
                    var lencmp = newvInt.length;
                    if (lencmp > 4) {
                        var ipoint = newvInt.indexOf(".");
                        if (ipoint > 0) {
                            if (lencmp - ipoint > 3) {
                                ShowMsg("小数位数最多只能2位");
                                return;
                            }
                        }
                    }
                    input.text(newvInt);
                    break;
            }
        }

        //功能键盘响应事件
        function dealOtherKeyEvent(objclick) {
            var curclick = objclick;
            var keyv = curclick.attr("key");
            switch (keyv) {
                case "ok":
                    var newvInt = input.text();
                    if (newvInt == 0 && !allowZero) {
                        ShowMsg("数量不能为0");
                    } else {
                        var ilen = newvInt.length;
                        if (ilen >= 2) {
                            var lastChar = newvInt.substring(ilen - 1);
                            if (lastChar == ".") {
                                newvInt = newvInt.substring(0, ilen - 1);
                            }
                        }
                        config.fn && config.fn(newvInt, index);
                        hideKeyBoard();
                    }
                    break;

                case "clear1":
                    var curv = input.text();
                    var len = curv.length;
                    if (len == 0) {
                        return;
                    } else if (len == 1) {
                        newvInt = "";
                    } else {
                        newvInt = curv.substring(0, len - 1);
                    }
                    input.text(newvInt);
                    break;

                case "clear":
                    newvInt = "";
                    input.text(newvInt);
                    break;

                case "point":
                    var curv = input.text();
                    var len = curv.length;
                    if (len == 0) {
                        return;
                    }
                    if (curv.indexOf(".") > 0) {
                        return;
                    }
                    input.text(curv + ".");
                    break;
            }
            firstInput = false;

        }

        function bindEvent() {
            $("#keyboardMark").bind('click', function () {
                if (canHideKeyboard) {
                    hideKeyBoard();
                    canHideKeyboard = false;
                }
            });


            if (pcBrower) {
                $(".keyboard span").delegate('', {
                    'click': function () {
                        dealNumKeyEvent($(this));
                        dealOtherKeyEvent($(this));
                    }
                });

            } else {
                $(".keyboard span").delegate('', {
                    'touchstart': function () {
                        dealNumKeyEvent($(this));
                    },
                    'touchend': function () {
                        var curclick = $(this);
                        var keyv = curclick.attr("key");
                        clickEffect($(this), keyv, 0);
                    },
                    'click': function () {
                        dealOtherKeyEvent($(this));
                    }
                });
            }

        }

        function keyViewShow(bview) {
            if (bview) {
                keyb.show();
                keyb.animate({bottom: "0px"}, 200, function () {
                    setTimeout(function () {
                        canHideKeyboard = true;
                    }, 200);
                });
            } else {
                keyb.animate({bottom: "-163px"}, 200, function () {
                    keyb.hide();
                    canHideKeyboard = false;
                });
            }
        }

        return {
            show: function () {
                keyb.show();
            },
            hide: function () {
                hideKeyBoard();
            },
            autoshow: function (config) {
                initKeyBoard(config);
                keyViewShow(true);
            },
            freshKeyBoard: freshKeyBoard,
            setKeyBoard: setKeyBoard
        }

    })();


    return {
        keyBoard: KeyBoard,
        initDate: initDate,
        initDateNoDay:initDateNoDay,
        dateClick: dateClick,
        inputHint: inputHint,
        imageClick: imageClick,
        initkdScroll: initkdScroll
    };
})();