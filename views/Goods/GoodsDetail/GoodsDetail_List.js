var GoodsDetail_List = (function () {

    var hasInit;
    var viewPage;
    var config;
    var scroller;
    var isCollected;
    var itemdetailarea;
    var loadingHint;
    var MoreInfo;
    var sampleGoodsInfo;
    var sampleMore;

    var Api;
    var Head;


    //初始化视图
    function initView(vPage, param) {
        if (!hasInit) {
            viewPage = vPage;
            config = param;
            itemdetailarea = document.getElementById('itemdetailarea');
            scroller = Lib.Scroller.create(itemdetailarea, { scrollbars: false });
            loadingHint = $("#view-itemdetail").find("#loadingHint");
            MoreInfo = document.getElementById('item-more');
            var goodsinfoList = document.getElementById('goodsinfoList');
            sampleGoodsInfo = $.String.between(goodsinfoList.innerHTML, '<!--', '-->');
            sampleMore = $.String.getTemplates(MoreInfo.innerHTML, [
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
                    name: 'desc',
                    begin: '#--desc.begin--#',
                    end: '#--desc.end--#'
                },
                {
                    name: 'img',
                    begin: '#--img.begin--#',
                    end: '#--img.end--#'
                }
            ]);


            bindEvents();
            initScroll();
            Api = GoodsDetail_Api;
            Head = GoodsDetail_Head;
            hasInit = true;
        }

        $(MoreInfo).hide();
        scroller.isPageEnd = false;
    }

    function bindEvents() {
        viewPage.delegate('[data-cmd="promotionlist"]', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['Promotion', config.item.promotionlist]);
            }
        });
    }

    function initScroll() {
        kdctrl.initkdScroll(scroller, {});
    }


    //加载数据
    function loadData(data) {

        //价格上限
        var maxPrice = data.maxprice + '' || '0';
        var arrMax = maxPrice.split('.');
        var maxPriceObj = {
            front: arrMax[0],   //小数点前
            end: arrMax[1] || '00'      //小数点后
        };

        var price = data.price ? data.price + '' : '0';
        var arrPrice = price.split('.');
        var priceObj = {
            front: arrPrice[0],
            end: arrPrice[1] || '00'
        };

        var rate = '10';
        var saleprice = data.saleprice || 0;
        if (saleprice > 0) {
            var ratev = price / saleprice * 10;
            rate = ratev >= 1 ? (rate > 10 ? 10 : ratev.toFixed(1)) : ratev.toFixed(2);
        }
        var datanum = data.num || 0;
        var unitname = data.unitname || '';
        var stockinfo = kdAppSet.getStockStr(datanum, unitname);
        var stockmsg = stockinfo.stockStr;
        var stockstatus = stockinfo.stockstatus;
        if (datanum <= 0) {
            stockstatus = -1;
        }
        var salenum = data.salenum || 0;
        var dataname = data.name || '';
        var onlyexpoint = data.onlyexpoint || 0;
        var point = data.expoint || 0;

        var prolist = data.promotionlist || [];

        var showSaleNum = kdAppSet.getUserInfo().cmpInfo.showSaleNum;
        document.getElementById('goodsinfoList').innerHTML = $.String.format(sampleGoodsInfo, {
            name: dataname,
            pricehLow: priceObj.front,
            pricedLow: priceObj.end,
            pricehHigh: maxPriceObj.front,
            pricedHigh: maxPriceObj.end,
            rate: rate,
            point: point,
            stock: stockmsg,
            saleinfo: salenum + unitname,
            stockcolor: stockstatus == -1 ? 'lowstock' : '',
            oldprice: saleprice,
            sizeinfo: data.model || "",
            lisizecss: data.model == "" ? 'display:none' : '',
            showsalenum: showSaleNum ? '' : 'display:none',
            'pro-show': (prolist.length == 0 || onlyexpoint == 1) ? 'hide' : '',
            'protitle': prolist.length > 0 ? prolist[0].protitle : '',
            'limit-show': data.limitedinfo == '' ? 'hide' : '',
            'limit-title': data.limitedinfo
        });

        var rateView = $('#goodsDetail_rate');
        if (rate > 0 && rate != 10) {
            rateView.css('visibility', 'visible');
        } else {
            rateView.css('visibility', 'hidden');
        }

        var priceInterval = $('#itemdetail-priceInterval');
        if (maxPrice > 0 && +maxPrice > price) {//区间价，最高价显示
            priceInterval.show();
        }
        else {//非区间价，最高价隐藏
            priceInterval.hide();
        }


        //仅限积分兑换onlyexpoint == 1，不显示价格--mayue
        var itemPrice = $('#itemdetail-price');
        var orFlag = viewPage.find('[data-cmd="orshow"]');
        var onlyexpoint = data.onlyexpoint;
        if (onlyexpoint == 1) {
            itemPrice.hide();
            priceInterval.hide();
            orFlag.hide();
        } else {
            itemPrice.show();
            orFlag.show();
        }

        //如果可以积分兑换显示--mayue
        var pointView = viewPage.find('[data-cmd="point"]');
        if (point == 0) {
            pointView.hide();
        } else {
            pointView.show();
            rateView.css('visibility', 'hidden');
        }

        renderFreight(data.freightInfo);
        scroller.refresh();
        setPriceVisiable();
    }


    function initGoodsMore(arr) {

        MoreInfo.innerHTML = $.String.format(sampleMore.container, {
            'items': $.Array.keep(arr, function (item, index) {
                var descStr = item.desc == '' ? '' : $.String.format(sampleMore.desc, { 'desc': Api.getDesc(item.desc) });
                var imgStr = item.img == '' ? '' : $.String.format(sampleMore.img, { 'img': item.img });
                return descStr + imgStr;
            }).join('')
        });

        arr.length > 0 ?$(MoreInfo).show():$(MoreInfo).hide();

        if(arr.length>0){
            setTimeout(function () {
                var imgs = $(MoreInfo).find('img');
                imgs.on('load', function () {
                    scroller.refresh();
                });
                for (var i = 0; i < imgs.length; i++) {
                    if (imgs[i].complete) {
                        scroller.refresh();
                    }
                }
            }, 250);
        }
        scroller.refresh();
    }


    function renderFreight(freightInfo) {
        var $li = viewPage.find('.lifreight');
        if (!kdAppSet.getIsShowPrice()) {    // 旗舰版版本过低或者不显示价格不支持运费
            $li.hide();
            return;
        }
        $li.show();
        if (freightInfo == "") {//没有设置运费，默认显示0
            $li.find('span').text("0");
        } else {
            $li.find('span').text(freightInfo);
        }
    }

    //设置是否显示价格
    function setPriceVisiable() {
        if (kdAppSet.getIsShowPrice()) return;
        $('#itemdetail-price').css('display', 'none');
        $('#itemdetail-priceInterval').css('display', 'none');
        $('#item-originalprice').css('display', 'none');
        $('#goodsDetail_rate').css('display', 'none');
    }


    //获取商品价格 库存 辅助属性
    function getItemAuxInfo(itemid,config) {

        showHint(true);
        Lib.API.get('GetGoodsDetail', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { Itemid: itemid }
        }, function (data, json) {
            showHint(false);
            config.hasLoaded = true;
            var dlist = data || {};
            isCollected = !!data.isfavorite;

            $.Object.extend(config.item, {
                auxcount: dlist.auxcount,
                auxType: dlist.auxType,
                itemid: itemid,
                isoverseas: dlist.isoverseas || 0,
                model: dlist.model,
                note: dlist.note,
                price: dlist.fprice,
                saleprice: dlist.fsaleprice || '',
                maxprice: dlist.fmaxprice,
                unitid: dlist.unitid,
                unitname: dlist.unitname,
                num: dlist.num,
                name: dlist.name,
                img: dlist.img,
                salenum: dlist.salevolumnpermonth,
                noteimg: dlist.noteimg,
                freightInfo: dlist.freightinfo,
                expoint: dlist.expoint,
                onlyexpoint: dlist.onlyexpoint,
                limitedinfo: dlist.limitedinfo,
                promotionlist: data.promotionlist   //促销方案
            });

            loadData(config.item);
            var url = !!isCollected ? 'img/menuCollected.png' : 'img/menuCollect.png';
            $('.collect img').attr('src', url);
            Head.freshImgList(config.item.img);
            scroller.refresh();
            var imglink = config.item.img;
            if (imglink instanceof Array) {
                imglink = imglink[0];
            }
            wxShareGoodsInfo({
                itemid: config.item.itemid,
                name: config.item.name,
                img: imglink
            });


            scroller.refresh();
            initGoodsMore(config.item.noteimg);
        }, function (code, msg) {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">' + msg + '</div>';
            scroller.refresh();
        }, function () {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">网络错误，请稍候再试</div>';
            scroller.refresh();
        }, "");
    }


    //显示 正在调用接口的提示信息
    function showHint(bshow) {
        if (bshow) {
            loadingHint[0].innerHTML = "";
            loadingHint.find('.hintflag').remove();
            loadingHint.append('<li class="hintflag" style="background: #fff">' + Lib.LoadingTip.get() + '</li>');
        } else {
            loadingHint[0].innerHTML = "";
        }
    }


    function postCollectInfo(img) {

        Lib.API.get('SetMyfavorite', {
            para: {
                FItemID: config.item.itemid,
                OptType: !isCollected ? 1 : 0
            }
        }, function (data, json) {
            isCollected = !isCollected;
            if (isCollected) {
                $(img).attr('src', 'img/menuCollected.png');
            }
            else {
                $(img).attr('src', 'img/menuCollect.png');
            }
            var msg = isCollected ? '商品已收藏' : '已取消商品收藏';
            OptMsg.ShowMsg(msg);
        }, function (code, msg) {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">' + msg + '</div>';
            scroller.refresh();
        }, function () {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">网络错误，请稍候再试</div>';
            scroller.refresh();
        });
    }


    function wxShareGoodsInfo(item) {
        //如果是分享过来的 则晚一点设置分享信息
        if (config.shareGoodsId != "") {
            setTimeout(function () {
                wxShareGoods(item);
            }, 1000);
        } else {
            wxShareGoods(item);
        }
    }

    //设置微信分享内容
    function wxShareGoods(item) {
        var goodsUrl = "&shareGoodsId=" + item.itemid;
        var user = kdAppSet.getUserInfo();
        var cmpName = user.cmpInfo.name;
        var desc = '';
        if (user.identity != 'retail') {
            desc = '亲, ' + cmpName + ' 的这件商品真值得拥有，还可享受 ' + user.contactName + ' 的优惠价哟，快来收了去吧！';
        } else {
            desc = '亲, ' + cmpName + ' 的这件商品真值得拥有，快来和我一起购吧！';
        }
        kdAppSet.wxShareInfo({
            title: item.name,
            desc: desc,
            link: goodsUrl,
            imgUrl: item.img
        });
    }

    function refresh() {
        scroller && scroller.refresh();
    }

    function render(param){
        config = param;
    }

    return {
        initView: initView,
        render: render,
        loadData: loadData,
        initGoodsMore: initGoodsMore,
        getItemAuxInfo: getItemAuxInfo,
        postCollectInfo: postCollectInfo,
        refresh: refresh
    }

})();