/*商品列表排序页面*/

var GoodsListSort = (function () {

    var viewPage;
    var config;
    var sortInfo = {};
    /*false  表示降序 true 表示升序*/
    var sortList = {
        '0': false,
        '1': false,
        '2': false,
        '3': false,
        '4': false,
        '5': false
    };


    function initView() {
        if (!viewPage) {
            viewPage = $('#viewid-goodslist-sort');
            sortInfo = {
                key: 5,
                asc: false
            };
            bindEvents();
        }
    }

    function bindEvents() {

        viewPage.on('click', '[data-cmd="order-ul"] li', function () {
            //选中某一行
            var key = this.getAttribute('data-cmd');
            sortInfo = {
                key: key,
                asc: sortList[key]
            };
            setSelect($(this));


        }).on('click', '[data-cmd="order"]', function () {
            //切换排序方式
            setOrder($(this));

        }).on({
            'click': function () {
                kdShare.backView();
                setTimeout(function () {
                    config.callBack && config.callBack(sortInfo);
                }, 250);

            }, 'touchstart': function () {
                $(this).addClass('touched');
            },
            'touchend': function () {
                $(this).removeClass('touched');
            }

        }, '[data-cmd="ok"]');

    }

    function setOrder($this) {

        var $li = $this.parent();
        var key = $li.attr('data-cmd');
        $li.find('span').removeClass('on');

        sortList[key] = !sortList[key];
        sortList[key] ? $this.find('.up').addClass('on') : $this.find('.down').addClass('on');
        sortInfo = {
            key: key,
            asc: sortList[key]
        };
    }

    function setSelect($this) {
        var $li = viewPage.find('[data-cmd="order-ul"] li');
        $li.removeClass('default-icon-chose');
        $li.find('[data-cmd="order"]').addClass('hide');
        $this.addClass('default-icon-chose');
        $this.find('[data-cmd="order"]').removeClass('hide');
    }


    function render(args) {
        config = args;
        initView(config);
        show();
    }


    function show() {
        viewPage.show();

    }

    function hide() {

        viewPage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide,
    };

})();

