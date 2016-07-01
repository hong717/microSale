var GoodsCategory = (function () {
    var $view,
        $loading,
        hasInit,
        hasBind,
        $ulLeft,
        $ulRight,
        samplesLeft,
        samplesRight,
        hasLvl2,
        hasLvl3,
        hasCurrentLvl3, //当前激活类目是否有3级类目
        currentGroup, //当前激活一级类目
        scrollerLeft,
        scrollerRight,
        list;

    function render() {
        init();
        BindEvents();
        loadData();
        show();
    }

    function init() {
        if (hasInit) {
            return;
        }
        initVariable();
        scrollerLeft = Lib.Scroller.create('#div-left', {scrollbars: false});
        scrollerRight = Lib.Scroller.create('#div-right');
        hasInit = true;
    }

    function initVariable() {
        $view = $('#view-category');
        $loading = $('#div-loading');
        $ulLeft = $('#ul-left');
        $ulRight = $('#ul-right');
        samplesLeft = $.String.between($ulLeft.html(), '<!--', '-->');
        samplesRight = $.String.getTemplates($ulRight.html(), [
            {
                name: 'ul',
                begin: '<!--',
                end: '-->'
            },
            {
                name: 'item',
                begin: '#--item.begin--#',
                end: '#--item.end--#',
                outer: '{items}'
            }
        ]);
    }

    function BindEvents() {
        if (hasBind) {
            return;
        }
        $view
            .delegate('.search', 'click', function () {
                MiniQuery.Event.trigger(window, 'toview', ['GoodsSearch', {noBack: true}]);
            })
            .delegate('[data-cmd="qrcode"]', {
                //扫一扫
                'click': function () {
                    kdAppSet.stopEventPropagation();
                    kdAppSet.wxScanQRCode();
                },
                'touchstart': function () {
                    $(this).css('color', '#bababa');
                    var img = $(this).find('.code');
                    img.removeClass('sprite-qrcode');
                    img.addClass('sprite-qrcode_s');
                },
                'touchend': function () {
                    $(this).css('color', '#a9a9a9');
                    var img = $(this).find('.code');
                    img.addClass('sprite-qrcode');
                    img.removeClass('sprite-qrcode_s');
                }
            });

        $ulLeft.delegate('li',
            {
                'click': function () {

                    if (hasLvl2) {
                        if (currentGroup == $(this).attr('data-index')) {
                            return;
                        }
                        currentGroup = +$(this).attr('data-index');
                        var index = +$(this).attr('data-index');
                        $ulLeft.find('li').removeClass('active');
                        $ulLeft.find('li[data-index="' + index + '"]').addClass('active');
                        renderRight(list[index].child);
                        return;
                    }
                    var index = +$(this).attr('data-index');
                    gotoList(list[index]);
                },
                'touchstart': function () {
                    if (hasLvl2) {
                        return;
                    }
                    $(this).css('color', '#ff5837');
                },
                'touchend': function () {
                    if (hasLvl2) {
                        return;
                    }
                    $(this).css('color', '#000');
                }
            });

        $ulRight.delegate('li[data-group]',
            {
                'click': function () {
                    if (hasCurrentLvl3) {
                        return;
                    }
                    var i = +$(this).attr('data-group');
                    gotoList(list[currentGroup].child[i]);
                },
                'touchstart': function () {
                    if (hasCurrentLvl3) {
                        return;
                    }
                    $(this).css('background-color', '#ebebeb');
                },
                'touchend': function () {
                    if (hasCurrentLvl3) {
                        return;
                    }
                    $(this).css('background-color', '#fff');
                }
            });

        $ulRight.delegate('.item', 'click', function () {
            var i = $(this).parent().parent().attr('data-group');
            var j = $(this).attr('data-index');
            gotoList(list[currentGroup].child[i].child[j]);
        }).delegate('.category-title', {
            'touchstart': function () {
                $(this).addClass('hover');
            },
            'touchend': function () {
                $(this).removeClass('hover');
            }
        });


        hasBind = true;
    }

    //跳转到列表视图
    function gotoList(item) {
        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {
            title: item.name,
            ItemType: item.itemid,
            tabindex: 0,
            keyword: '',
            reload: true,
            fromPage: 1
        }]);
    }

    function loadData() {
        if (list) {   //读取缓存数据
            fillWithData();
            return;
        }
        toggleLoading(true);

        Lib.API.get('GetItemClass', {
            currentPage: 1,
            ItemsOfPage: 1000,
            para: {}
        }, function (data) {
            var datalistTmp = data['itemlist'] || [];
            list = dealViewData(datalistTmp);
            toggleLoading(false);
            fillWithData();
        }, function (code, msg) {
            toggleLoading(false, msg);
        }, function () {
            toggleLoading(false, '网络错误，请稍候再试');
        }, "");
    }

    function toggleLoading(bool, msg) {
        if (bool) {
            $('#div-left').hide();
            $loading.show();
            $loading.empty();
            $loading.children().filter('.hintflag').remove();
            $loading.append('<div class="hintflag" style="width: 100%;">' + Lib.LoadingTip.get() + '</div>');
            $loading.children().filter('.spacerow').remove();
            $loading.append('<div class="spacerow"></div>');
            return;
        }
        if (msg === undefined) {
            $loading.hide();
        }
        $('#div-left').show();
        $loading.append('<li class="hintflag">' + msg + '</li>');
        $loading.children().filter('.hintflag').remove();
        $loading.children().filter('.spacerow').remove();
    }

    function dealViewData(data) {
        //1 先把数据分层级放开
        var list1 = [];
        var list2 = [];
        var list3 = [];
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var item = data[i];
            var ilevel = Number(item.FLevel);
            var item = {itemid: item.FItemID, name: item.FName, parentid: item.FParentID};
            switch (ilevel) {
                case 1:
                    list1.push(item);
                    break;
                case 2:
                    list2.push(item);
                    break;
                case 3:
                    list3.push(item);
                    break;
            }
        }
        hasLvl2 = !!list2.length;
        hasLvl3 = !!list3.length;
        //处理第2层级数据的节点关系
        inum = list2.length;
        for (var i = 0; i < inum; i++) {
            list2[i].child = getChildList(list3, list2[i].itemid);
        }
        //处理第1层级数据的节点关系
        inum = list1.length;
        for (var i = 0; i < inum; i++) {
            list1[i].child = getChildList(list2, list1[i].itemid);
        }
        return list1;
    }

    function getChildList(list, itemid) {
        var childlist = [];
        var inum = list.length;
        for (var i = inum - 1; i >= 0; i--) {
            if (list[i].parentid == itemid) {
                childlist.push(list[i]);
                list.splice(i, 1);
            }
        }
        if (childlist.length > 0) {
            childlist = childlist.reverse();
        }
        return childlist;
    }

    function fillWithData() {
        if (list.length < 1) {
            $loading.html(kdAppSet.getEmptyMsg());
            $loading.show();
            return;
        }
        renderLeft(list);
        renderRight(list[0].child);
    }

    function renderLeft(data) {
        if (hasLvl2) {
            $ulLeft.parent().removeClass('left-single');
            $ulRight.show();
        }
        else {
            $ulLeft.parent().addClass('left-single');
            $ulRight.hide();
        }

        var s = $.Array.keep(data, function (item, index) {
            return $.String.format(samplesLeft, {
                index: index,
                name: item.name
            });
        }).join('');
        $ulLeft.html(s);
        if (hasLvl2) {
            $ulLeft.find('li[data-index="0"]').addClass('active');
        }
        currentGroup = 0;
        setTimeout(function () {
            scrollerLeft.refresh()
        }, 50);
    }

    function renderRight(data) {
        hasCurrentLvl3 = IsLvl3(data);
        if (!data.length) {
            $ulRight.html(kdAppSet.getEmptyMsg());
            return;
        }
        if (!hasCurrentLvl3) {
            $ulRight.addClass('right-single');
        }
        else {
            $ulRight.removeClass('right-single');
        }
        var s = $.Array.keep(data, function (item, index) {
            return $.String.format(samplesRight.ul, {
                index: index,
                title: item.name,
                items: getLvl3(item.child)
            });
        }).join('');
        $ulRight.html(s);
        setTimeout(scrollerRight.refresh(), 0);
    }

    function getLvl3(data) {
        var s = $.Array.keep(data, function (item, index) {
            return $.String.format(samplesRight.item, {
                index: index,
                name: item.name,
                url: item.url || 'img/no_img_mode.png'
            });
        }).join('');
        return s;
    }

    function IsLvl3(data) {
        for (var i = data.length - 1; i > -1; i--) {
            if (data[i].child.length > 0)
                return true;
        }
        return false;
    }

    function show() {
        kdAppSet.setAppTitle('商品');
        $view.css('display', '-webkit-box');
        scrollerLeft.refresh();
        scrollerRight.refresh();    //未知BUG，从此视图进搜索页面，页面高度变化时回退到此视图scroller滚动失效
        OptAppMenu.selectKdAppMenu("typeId");
        OptAppMenu.showKdAppMenu(true);
    }

    function hide() {
        $view.hide();
        OptAppMenu.showKdAppMenu(false);
    }


    return {
        render: render,
        show: show,
        hide: hide
    }
})();

