/*选择页面*/

var SingleSelectList = (function () {

    var viewdiv, div, ul, sample, hasBind, scroller, list, hintTxt,
        ullist, currentPage, itemsOfPage, configParam, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewdiv = document.getElementById('view-select');
            div = document.getElementById('div-selectList');
            ul = div.firstElementChild;
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            hasBind = false;
            scroller = null;
            list = [];
            hintTxt = '关键字搜索';
            ullist = $(ul);
            currentPage = 1;
            itemsOfPage = 500;
            configParam = null;
            hasInit = true;
        }
    }


    function load(fn, api, para) {

        Lib.API.get(api, {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: para
        }, function (data, json) {
            removeHint();
            if (api == 'GetAreaInfo') {
                zoneSelect(data, json, fn);
            } else if (api == 'GetAreaList') {
                citySelect(data, json, fn);
            } else if (api == 'GetWLCompany') {
                getWLCompany(data, json, fn);
            }
        }, function (code, msg, json) {
            removeHint();
            ullist.append('<li class="hintflag">' + msg + '</li>');

        }, function () {
            removeHint();
            ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
        }, "");
    }

    function zoneSelect(data, json, fn) {
        list = $.Array.keep(data || [], function (item, index) {
            return {
                name: item.FName,
                id: item.FInterID,
                index: index,
                bselect: (item.FInterID == configParam.selobj.id) ? 'sprite-area_select' : ''
            };
        });
        fn && fn(list);
    }

    function citySelect(data, json, fn) {
        data = data.arealist;
        list = $.Array.keep(data || [], function (item, index) {
            return {
                name: item.areaname,
                id: item.areanumber,
                index: index,
                bselect: (item.areanumber == configParam.selobj.id) ? 'sprite-area_select' : ''
            };
        });
        fn && fn(list);

    }

    function getWLCompany(data, json, fn) {
        data = data.WLCompanyList;
        list = $.Array.keep(data || [], function (item, index) {
            return {
                name: item.name,
                id: item.code,
                index: index,
                bselect: (item.code == configParam.selobj.id) ? 'sprite-area_select' : ''
            }
        });
        fn && fn(list);
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
    }

    function fill(a) {
        if (scroller) {
            scroller.scrollTo(0, 0, 500);
        }
        ul.innerHTML = "";
        var listStr = $.Array.keep(a, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                index: item.index,
                bselect: item.bselect
            });
        }).join('');
        removeHint();
        if (currentPage > 1) {
            $(ul).append(listStr);
        } else {
            ul.innerHTML = listStr;
            if (a.length == 0) {
                ul.innerHTML = '<li class="empty  hintflag">没有查询到相关数据</li>';
            }
        }
        if (scroller) {
            scroller.refresh();
        }
    }


    function bindEvents() {
        $(ul).delegate("li[index]", {
            'click': function () {
                var curli = $(this);
                var index = curli.attr("index");
                var selobj = list[index];
                configParam.callBack && configParam.callBack({ name: selobj.name, id: selobj.id });
                kdAppSet.stopEventPropagation();
            },
            'touchstart': function () {
                $(this).addClass('checked');
            },
            'touchend': function () {
                $(this).removeClass('checked');
            }
        });

        $(viewdiv).delegate('#singleSelect_SearchBtn', {
            'click': function () {
                searchResult();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        $(viewdiv).delegate('#singleSelect_SearchTxt', {
            'focus': function () {
                $(this).addClass('textFocus');
                $('#singleSelect_SearchClear').show();
            },
            'blur': function () {
                var searchKey = kdShare.trimStr($(this).val());
                if (searchKey == '' || searchKey == hintTxt) {
                    $(this).removeClass('textFocus');
                    $('#singleSelect_SearchClear').hide();
                }
            },
            'input': function () {
                searchResult();
            }
        });
        $(viewdiv).delegate('#singleSelect_SearchClear', {
            'click': function () {
                $(viewdiv).find('#singleSelect_SearchTxt').val('');
                $(viewdiv).find('#singleSelect_SearchTxt').focus();
            }
        })
    }


    function searchResult() {
        var resultKey = kdShare.trimStr($(viewdiv).find('#singleSelect_SearchTxt').val());
        resultKey = kdAppSet.ReplaceJsonSpecialChar(resultKey);
        if (resultKey == '' || resultKey == hintTxt) {
            fill(list);
        }
        else {
            var temp = [];
            // 获取符合要求的临时列表
            for (var i = 0; i < list.length; i++) {
                var name = list[i].name.toLowerCase() || '';
                if (name.match(resultKey.toLowerCase())) {
                    temp.push(list[i]);
                }
            }
            // 填充列表
            fill(temp);
        }
    }

    function render(config) {
        initView();
        configParam = config;
        ullist.html('');
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        $('#singleSelect_SearchTxt').val('');
        show();
        if (!hasBind) {
            bindEvents();
            hasBind = true;
        }
        (function () {
            load(function (data) {
                if (!scroller) {
                    scroller = Lib.Scroller.create(div);
                    scroller.refresh();
                }
                fill(data);
            }, configParam.api, configParam.para);
        })();
    }

    function show() {
        $(viewdiv).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(viewdiv).hide();
        }
    };

})();