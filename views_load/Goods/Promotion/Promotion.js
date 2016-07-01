/*门店选择列表*/

var Promotion = (function () {
    var viewpage, hasInit, sample, scroller,
        content;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-promotion');
            viewpage = $(div);
            content = document.getElementById('ul-view-promotionlist');
            sample = $.String.getTemplates(content.innerHTML, [
                {
                    name: 'container',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'item',
                    begin: '#--item.begin--#',
                    end: '#--item.end--#',
                    outer: '{items}'
                },
                {
                    name: 'lih',
                    begin: '#--lih.begin--#',
                    end: '#--lih.end--#'
                },
                {
                    name: 'buyh',
                    begin: '#--buyh.begin--#',
                    end: '#--buyh.end--#'
                },
                {
                    name: 'buylist',
                    begin: '#--buylist.begin--#',
                    end: '#--buylist.end--#'

                },
                {
                    name: 'buyf',
                    begin: '#--buyf.begin--#',
                    end: '#--buyf.end--#'

                },
                {
                    name: 'gifth',
                    begin: '#--gifth.begin--#',
                    end: '#--gifth.end--#'

                },
                {
                    name: 'giftlist',
                    begin: '#--giftlist.begin--#',
                    end: '#--giftlist.end--#'

                },
                {
                    name: 'giftf',
                    begin: '#--giftf.begin--#',
                    end: '#--giftf.end--#'

                },
                {
                    name: 'lif',
                    begin: '#--lif.begin--#',
                    end: '#--lif.end--#'
                }
            ]);
            scroller = Lib.Scroller.create(div);
            hasInit = true;
        }
    }

    function fillList(arr) {
        var lih = "";
        var buyh = "";
        var buylist = "";
        var buyf = "";
        var gifth = "";
        var giftlist = "";
        var giftf = "";
        var lif = "";
        content.innerHTML = $.String.format(sample.container, {
            'items': $.Array.keep(arr, function (item, index) {
                lih = $.String.format(sample.lih, {
                    //'protitle': item.protitle + "(" + item.proExt + ")",
                    'style': styles(item.itemlist.length, item.giftlist.length),
                    'protitle': item.protitle,
                    'proExt': proExt(item.protitle, item.proExt),
                    'discountInfo': dicount(item.discountInfo),
                    'show': isshow(dicount(item.discountInfo))
                });

                //购买
                if (item.itemlist.length > 0) {
                    buyh = sample.buyh;
                    buylist = $.Array.keep(item.itemlist, function (itemlist, index) {
                        return $.String.format(sample.buylist, {
                            'name': itemlist.name,
                            'num': itemlist.num
                        });
                    }).join('');
                    buyf = sample.buyf;
                } else {
                    buyh = "";
                    buylist = "";
                    buyf = "";
                }

                //赠品
                if (item.giftlist.length > 0) {
                    gifth = sample.gifth;
                    giftlist = $.Array.keep(item.giftlist, function (giftlist, index) {
                        return $.String.format(sample.giftlist, {
                            'name': giftlist.name,
                            'num': giftlist.num
                        });
                    }).join('');
                    giftf = sample.giftf;
                } else {
                    gifth = "";
                    giftlist = "";
                    giftf = "";
                }
                lif = sample.lif;
                return lih + buyh + buylist + buyf + gifth + giftlist + giftf + lif;
            }).join('')
        });
    }

    function isshow(str) {
        if (str == "") {
            return 'hide';
        } else {
            return "";
        }
    }

    function styles(a, b) {
        if (a == 0 && b > 0) {
            return 'one';
        } else if (a > 0 && b == 0) {
            return 'one';
        } else {
            return "";
        }

    }

    function proExt(protitle, proExt) {
        if (protitle.indexOf('全场') > -1) {
            return "";
        } else {
            return proExt;
        }

    }

    function dicount(discountInfo) {
        var condition = "";
        var discount = "";
        var disrate = "";
        if (discountInfo.condition == "0.00" || discountInfo.condition == 0) {
            condition = ""
        } else {
            condition = "满" + discountInfo.condition;
        }
        if (discountInfo.discount == "0.00" || discountInfo.discount == 0) {
            discount = ""
        } else {
            discount = "减" + discountInfo.discount;
        }
        if (discountInfo.disrate == "0.00" || discountInfo.disrate == 0) {
            disrate = ""
        } else {
            disrate = discountInfo.disrate + "折";
        }
        return condition + discount + disrate;
    }

    function render(config) {
        initView();
        fillList(config);
        show();
        scroller.refresh(500);
    }

    function show() {
        kdAppSet.setAppTitle('促销');
        viewpage.show();
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