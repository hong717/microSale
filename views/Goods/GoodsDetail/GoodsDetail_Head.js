var GoodsDetail_Head = (function () {

    var hasInit;
    var config;
    var viewPage;
    var SwipeWrap;
    var sampleImgli;
    var SliderPosi;
    var sampleImg;
    var imgSlider;
    var Api;
    var List;
    var imageWidth;
    var imageViewList;


    function initView(vPage,param) {
        if (!hasInit) {
            viewPage=vPage;
            config = param;
            SwipeWrap = document.getElementById('itemDetailSwipeWrap');
            sampleImg = $.String.between(SwipeWrap.innerHTML, '<!--', '-->');
            SliderPosi = document.getElementById('itemDetailSliderPosi');
            sampleImgli = $.String.between(SliderPosi.innerHTML, '<!--', '-->');
            imageWidth = $(window).width() - 20;
            imageViewList = $('.itemdetail-img');
            Api = GoodsDetail_Api;
            List = GoodsDetail_List;
            bindEvents();
            hasInit = true;
        }

    }

    function bindEvents() {

        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                if (!config.hasLoaded) {
                    OptMsg.ShowMsg('数据加载中，请稍后操作...');
                    return;
                }
                var qrcode = Api.getQrcode(config.item.itemid);
                var imgurllist = config.item.img;
                var posi = imgSlider.getPos();
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: imgurllist, qrcodelink: qrcode, goodsname: config.item.name, posi: posi }]);
            }
        });

    }


    function initSwipe() {
        var bullets = document.getElementById('itemDetailSliderPosi').getElementsByTagName('li');
        imgSlider =
            Swipe(document.getElementById('itemDetailSlider'), {
                startSlide: 0,
                auto: 0,
                continuous: false,
                disableScroll: false,
                stopPropagation: false,
                allowVerticalMove: false,
                callback: function (pos) {
                },
                transitionEnd: function (index, element) {
                    var i = bullets.length;
                    if (i > 0) {
                        while (i--) {
                            bullets[i].className = ' ';
                        }
                        bullets[index].className = 'on';
                    }
                }
            });
        $('.itemdetail-img .middiv ').css('width', $(window).width());

        setTimeout(function () {
            var imgs = $(".itemdetail-img .middiv img");
            imgs.on('load', function () {
                List.refresh();
            });
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].complete) {
                    List.refresh();
                }
            }
        }, 250);
    }


    var imgSizeGet = 0;
    var check = function () {
        // 只要任何一方大于0
        // 表示已经服务器已经返回宽高
        // console.log(img.width+'**'+img.height);
        var hbase = 282;
        var imglist = imageViewList.find('.kdcImage2[initview=0]');
        if (imglist.length == 0) {
            clearInterval(imgSizeGet);
        } else {
            for (var i = 0, len = imglist.length; i < len; i++) {
                var img = imglist[i];
                if (img.width || img.height) {
                    var wrate = img.width / imageWidth;
                    var hrate = img.height / hbase;
                    var imgc = $(img);
                    if (wrate > hrate) {
                        imgc.css('max-width', '100%');
                    } else {
                        imgc.css('max-height', '100%');
                    }
                    imgc.attr('initview', 1);
                }
            }
        }
    };


    //显示图片信息
    function freshImgList(imglist) {

        var imgls = [];
        if (imglist instanceof Array) {
            imgls = imglist;
        } else {
            imgls.push(imglist);
        }
        if (imgls.length == 0) {
            imgls.push('img/no_img.png');
        }
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();

        SwipeWrap.innerHTML = $.Array.keep(imgls, function (item, i) {
            var imgsrc = item != '' ? (imgMode ? item : noimgModeDefault) : 'img/no_img.png';
            return $.String.format(sampleImg, {
                index: i,
                img: imgsrc
            });
        }).join('');

        if (imgls.length > 0) {
            // 定时获取图片宽高
            if (imgSizeGet) {
                clearInterval(imgSizeGet);
            }
            imgSizeGet = setInterval(function () {
                check();
            }, 40);
        }

        if (imgls.length <= 1) {
            imgls = [];
        }
        SliderPosi.innerHTML = $.Array.keep(imgls, function (item) {
            return $.String.format(sampleImgli, {});
        }).join('');
        if (imgls.length > 1) {
            $('.view_itemdetail nav .position li:first').addClass('on');
        }
        initSwipe();
    }

    function render(param){
        config = param;
    }

    return {
        render: render,
        initView: initView,
        freshImgList: freshImgList
    }

})();