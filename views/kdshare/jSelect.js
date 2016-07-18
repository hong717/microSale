/**
 * 选择界面
 * Create by Mayue
 * Date 2015-11-11
 * */
var jSelect = (function () {
    var hasInit,
        div,
        $viewpage,
        scroller,
        sample;
    var config = [];
    var dataList = [];
    var selectList = [];
    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('select-way');
            $viewpage = $(div);
            scroller = Lib.Scroller.create($viewpage.find('article')[0]);
            sample = $.String.between(document.getElementById('select-list').innerHTML, '<!--', '-->');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        //取消事件
        $viewpage.delegate('[data-cmd="cancel"]', {
            'click': function () {
                hide();
            },
            'touchstart': function () {
                $(this).css('color', '#646464');
            },
            'touchend': function () {
                $(this).css('color', 'gray');
            }
        }
        );

        //确定事件
        $viewpage.delegate('[data-cmd="sure"]', {
            'click': function () {
                var list = $viewpage.find(".on");
                dataList = [];
                for (i = 0; i < list.length; i++) {
                    var index = $viewpage.find(".on")[i].getAttribute("data-index");
                    dataList.push(config.data[index]);
                }
                hide();
                config.fnselect(dataList);
            },
            'touchstart': function () {
                $(this).css('color', '#fc7452');
            },
            'touchend': function () {
                $(this).css('color', '#ff6427');
            }
        }
        );

        //列表选择事件
        $viewpage.delegate('[data-cmd="li"]', {
            'click': function () {
                var index = this.getAttribute("data-index");
                selectStyle(index);
            }
        }
        );
    }

    //记忆上次选择样式
    function initStyle(onSelect) {
        var li = $viewpage.find('[data-cmd="li"]');
        if (onSelect.length == 0) {
            li.eq(0).addClass("on");//没有传值，则默认勾选第一个
        } else {
            for (i = 0; i < onSelect.length; i++) {
                li.eq(onSelect[i]).addClass("on");
            }
        }
    }

    //列表选中效果 --单选/多选
    function selectStyle(index) {
        var li = $viewpage.find('[data-cmd="li"]');
        if (config.type == "checkbox") {
            li.eq(index).addClass("on");
        } else {
            li.removeClass("on");
            li.eq(index).addClass("on");
        }
    }

    function showSelect(cfg) {
        initView();
        config = MiniQuery.Object.clone(cfg);
        fillTitle();
        fillList();
        initStyle(cfg.onselect);
        show();
    }

    //选择界面标题
    function fillTitle() {
        $viewpage.find('header')[0].innerHTML = config.title;
    }

    //数据列表
    function fillList() {
        var list = document.getElementById("select-list");
        list.innerHTML = $.Array.keep(config.data, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                index: index
            });
        }).join('');
    }


    function show() {
        $(div).show();
        scroller.refresh();
    }

    function hide() {
        $(div).hide();
    }

    return {
        show: show,
        hide: hide,
        showSelect: showSelect
    };
})();