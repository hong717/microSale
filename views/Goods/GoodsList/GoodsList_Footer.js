

/*底部模块*/
var GoodsList_Footer = (function () {

    var $div,hasInit,listWrap,listviewobj;

    function render(config) {
        init(config);

        if (CacheList.getGoodsListCount() > 0) {
            $(listWrap).addClass('hasBottom');
        }
        else {
            $(listWrap).removeClass('hasBottom');
        }
        var span = $div.find('.span-cart-count');
        var count = CacheList.getGoodsListCount();
        var moneyBox = $div.find('.money');
        if (!listviewobj || !listviewobj.scroller) {
            return;
        }
        if (count > 0) {
            $div.css('display', '-webkit-box');
            span.text(count < 100 ? count : 99);
            span.show();
            var money = kdAppSet.formatMoneyStr(CacheList.getOrderMoney(), 2); //防止测试数据为0
            if (!money) {
                return;
            }
            var arr = money.split('.');
            $div.find('.money-integer').text(kdAppSet.getRmbStr + arr[0]);
            $div.find('.money-decimal').text('.' + arr[1]);
            moneyBox.show();
            listviewobj.scroller.noticebottom = 65;
            //listviewobj.scroller.refresh();//防止刷回顶部--2016、3、24
        }
        else {
            span.text('');
            span.hide();
            moneyBox.hide();
            hide();
            listviewobj.scroller.noticebottom = 0;
            //listviewobj.scroller.refresh();//防止刷回顶部--2016、3、24
        }
    }

    function init(config) {
        if (!hasInit) {
            $div = $('#div-category-footer');
            listWrap=config.listWrap;
            listviewobj=config.listviewobj;
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        $div.delegate('.left', 'click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['CacheList', {}]);
            kdAppSet.h5Analysis('goodsList_shopCart');
        })
            .delegate('.input-submit', {
                'click': function () {
                    CacheList.goodsSubmitBill();
                    kdAppSet.h5Analysis('goodsList_submitBill');
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215' });
                },
                'touchend': function () {
                    $(this).css({ background: '#ff6427' });
                }
            });

    }

    function hide() {
        //listviewobj.scroller.refresh();//防止刷回顶部--2016、3、24
        $div.hide();
    }

    return {
        render: render,
        hide: hide
    }
})();