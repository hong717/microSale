/**
 * Created by ziki on 2015-07-09.
 */
var CollectionList = (function(){
    var $view,
        div,
        ul,
        samples,
        hasBind,
        hasInit,
        nextPage,
        userGUID,
        totalPage,
        pageSize,
        recordCount,
        scroller,
        list,
        iHeight;

    function render(){
        if(!hasInit){
            $view = $('#view-collectionList');
            div = document.getElementById('div-collectionList');
            ul = document.getElementById('ul-collectionList');
            nextPage = 1;
            pageSize = 10;
            list = [];
            initView();
            hasInit = true;
        }
        ul.innerHTML = '';
        toggleHint(true);
        renderFirst();
        show();
    }

    function show(){
        $view.show();
    }

    function hide(){
        toggleHint(false);
        $view.hide();
    }

    function initView(){
        iHeight = $(div).height();
        userGUID = kdAppSet.getUserInfo().optid;
        samples = $.String.getTemplates(ul.innerHTML, [
            {
                name: 'li',
                begin: '<!--',
                end: '-->'
            }
        ]);
        initScroll(div);
        if(!hasBind){
            bindEvents();
            hasBind = true;
        }
    }

    function renderFirst(fn){
        scroller.isPageEnd = false;
        nextPage = 1;
        list = [];
        renderList(fn);
    }

    function bindEvents(){
        $(ul)
            .delegate('>li', {
                'click': function(){
                    var i = $(this).attr('data-index');
                    var item = list[i];
                    var goodsinfo = {
                        itemid: item.fitemid,
                        model: item.fmodel,
                        note: item.note,
                        price: item.fprice,
                        maxprice: item.fmaxprice,
                        unitid: item.funitid,
                        unitname: item.funitname,
                        name: item.fname,
                        img: item.fimageurl
                    };
                    MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: goodsinfo }]);
                },
                'touchstart': function () {
                    $(this).css('background', '#d9dadb');
                },
                'touchend': function () {
                    $(this).css('background', '#fafafa');
                }
            });
    }

    function renderHeader(){
        var str = recordCount > 0 ? '(' + recordCount + ')' :'(0)';
        $('#span-collection-count')[0].innerText = str;
    }

    function renderList(fn){
        loadData(function(data){
            //toggleHint(false);
            if(recordCount == 0) { //无数据
                nextPage = 1;
                ul.innerHTML = kdAppSet.getEmptyMsg(iHeight);
                fn && fn();
                scroller.refresh();
                scroller.isPageEnd = true;
                return;
            }

            var HTMLPart = $.Array.keep(data, function(item, index){
                var j = pageSize * (nextPage - 1) + index ;
                var imgS = 'img/no_img.png';
                if(kdAppSet.getImgMode()){
                    imgS = kdAppSet.getImgThumbnail(item.fimageurl) || imgS;
                }
                var priceStr = !kdAppSet.getIsShowPrice() ? '' : kdAppSet.getPriceStr({
                    price: item.fprice,
                    maxprice: item.fmaxprice
                });

                var stockInfo = kdAppSet.getStockStr(item.fqty, item.funitname);

                return $.String.format(samples.li, {
                    index: j,
                    img: imgS,
                    number: item.fnumber,
                    name: item.fname,
                    price: priceStr,
                    stockmsg: stockInfo.stockStr,
                    colormsg: stockInfo.color,
                    newflag: (item.newflag == 1) ? "display:block;" : "display:none;",
                    cuxiaoflag: (item.cuxiaoflag == 1) ? "display:block;" : "display:none;"
                });
            }).join('');

            ul.innerHTML = nextPage ==1 ? HTMLPart : ul.innerHTML + HTMLPart;
            nextPage++;
            if(nextPage > totalPage){
                scroller.isPageEnd = true;
            }
            fn && fn();
            setTimeout(function(){
                scroller.refresh();
            }, 200);
        }, {
            ownerGUID: userGUID,
            option: 3,
            ItemType: -1
        }, fn);
    }

    /**
     * @param param 买家列表接口需传入参数，包括：
     * ownerGUID {string} 分享者 GUID，
     * index {number} 请求的页码,
     * option {number} 请求数据的种类，1:新品 2：促销 3：收藏
     */
    function loadData(fn, param, reset){
        Lib.API.get('GetItemInfor', {
                currentPage: nextPage,
                ItemsOfPage: pageSize,
                para: param
            },
            function(data, json){
                toggleHint(false);
                totalPage = json.TotalPage;
                list = list.concat(data.itemlist);
                recordCount = data.total;
                renderHeader();
                fn && fn(data.itemlist);
            },
            function (code, msg){
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">' + msg + '</li>');
                reset();
                scroller.isPageEnd = true;
                scroller.refresh();
            },
            function () {
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">网络错误，请稍候再试</li>');
                reset();
                scroller.isPageEnd = true;
                scroller.refresh();
            });
    }

    function initScroll(div){
        scroller = Lib.Scroller.create(div);
        var options = {
            hinttop: 1,
            fnfresh: function(reset){
                renderFirst(reset);
            },
            fnmore: function(reset){
                if(nextPage <= totalPage){
                    renderList(reset);
                }
            }
        };
        kdctrl.initkdScroll(scroller, options);
    }

    function toggleHint(isShow){
        if(isShow){
            $('#divPulldown').html(Lib.LoadingTip.get()).show();
            $('#divPulldown').css('top', '41px');
            scroller.refresh();
            return;
        }
        $('#divPulldown').hide();
    }

    return{
        render: render,
        show: show,
        hide: hide
    }
})();
