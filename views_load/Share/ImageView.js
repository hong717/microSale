/**
 * 图片大图显示
 * */
var ImageView = (function () {
    var divImgView,
        //imgv,
        elemRect,
        qrcode,
        config,
        SliderPosi,
        sampleImg,
        sampleImgli,
        SwipeWrap,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            divImgView = $(".divImgView");
            elemRect = document.getElementById('ImgViewDetail');
            SwipeWrap=document.getElementById('divImgViewSwipeWrap');
            sampleImg=$.String.between(SwipeWrap.innerHTML, '<!--', '-->');
            SliderPosi=document.getElementById('divImgViewSliderPosi');
            sampleImgli = $.String.between(SliderPosi.innerHTML, '<!--', '-->');
            
            bindEvents();
            hasInit = true;
        }
    }


    //显示图片信息
    function freshImgList(imglist){
        var  imgls=[];
        if(imglist instanceof  Array){
            imgls= imglist;
        }else{
            imgls.push(imglist);
        }
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();

        SwipeWrap.innerHTML = $.Array.keep(imgls, function (item,i) {
            var  imgsrc= item != '' ? (imgMode ?item : noimgModeDefault) : 'img/no_img.png';
            var  imgthumbnail= 'img/no_img.png';
            return $.String.format(sampleImg, {
                index: i,
                img: imgsrc,
                imgthumbnail: imgthumbnail
            });
        }).join('');

        if(imgls.length<=1){
            imgls=[];
        }
        SliderPosi.innerHTML = $.Array.keep(imgls, function (item) {
            return $.String.format(sampleImgli, {});
        }).join('');

        initSwipe(imgls);
    }


    function initSwipe(imgls){
        var bullets = document.getElementById('divImgViewSliderPosi').getElementsByTagName('li');
        Swipe(document.getElementById('ImgViewDetail'), {
                startSlide: config.posi,
                auto: 0,
                continuous: false,
                disableScroll: false,
                stopPropagation: false,
                allowVerticalMove: false,
                callback: function(pos) {
                },
                transitionEnd: function(index, element) {
                    var i = bullets.length;
                    if(i>0){
                        while (i--) {
                            bullets[i].className = ' ';
                        }
                        bullets[index].className = 'on';
                    }
                }
            });
        var iwidth=$(window).width();
        if(iwidth>640){
            iwidth='640px';
        }
        $('#ImgViewDetail .middiv ').css('width',iwidth);
        $('#ImgViewDetail nav ').css('width',iwidth);
        var ImgViewDetailPosi=$('#ImgViewDetail nav .position li')[config.posi];
        if(imgls.length>1){
            $(ImgViewDetailPosi).addClass('on');
        }
    }


    function getImgQrcodeUrl(){
        var discribe=config.goodsname;
        var url=config.qrcodelink;

        var logourl=config.imgobj[0];
        var timestamp=Math.round(new Date().getTime()/1000);
        var token=Lib.MD5.encrypt(discribe + "kingdee_xxx" + timestamp);
        var  qrImg='http://mob.cmcloud.cn/ServerCloud/WDH/genGoodsQRcode?';
        qrImg=qrImg+'discribe='+encodeURIComponent(discribe)+'&url='+encodeURIComponent(url)
            +'&logourl='+encodeURIComponent(logourl)+'&timestamp='+timestamp+'&token='+token;
        return qrImg;
    }

    function bindEvents() {

        $('.divImgView').bind('click',function(ev){
            var curClick=ev.target;
            var cname=curClick.className || '';
            if(cname.indexOf('qrcode')>=0){
                if(curClick.innerHTML=='显示二维码'){
                    curClick.innerHTML='显示图片';
                    var imgview=$('#ImgViewQrcode img');
                    imgview.attr('src','img/loading.png');
                    var imgurl=getImgQrcodeUrl();
                    imgview.attr('src',imgurl);
                    showQrcode(true);
                }else{
                    curClick.innerHTML='显示二维码';
                    showQrcode(false);
                }
            }else{
                setTimeout(function () {
                    $("#divMask").hide();
                }, 500);
                kdShare.backView();
            }
        });
    }


    function deleteLoadingImg() {
        divImgView.find('span').addClass('afterImgLoaded');
        divImgView.find('img').removeClass('hideImg');
    }

    function showImage(imgobj) {
        if (config.type == 'followme') {
            divImgView.find('[data-cmd="focusme"]')[0].innerText = '长按图片关注';
        } else {
            divImgView.find('[data-cmd="focusme"]')[0].innerText = '';
        }
        divImgView.show();
        if (typeof imgobj === "object" &&  !(imgobj  instanceof  Array) ){
            var imgsrc = "";
            if (imgobj[0].tagName.toLowerCase() == "img") {
                imgsrc = kdAppSet.getImgThumbnail(imgobj.attr("src"), true);
            } else {
                imgsrc = kdAppSet.getImgThumbnail(imgobj.find('img').attr("src"), true);
            }
            freshImgList(imgsrc);
        }else{
            freshImgList(imgobj);
        }
    }

    //是否显示二维码
    function showQrcode(bview){
        var imgv=$('#ImgViewDetail');
        var barcode=$('#ImgViewQrcode');
        if(bview){
            imgv.hide();
            barcode.show();
        }else{
            barcode.hide();
            imgv.show();
        }
    }


    function render(configp) {
        config = configp;
        initView();
        $("#divMask").show();
        var btnQrcode=$('.divImgView .qrcode');
        if(config.qrcodelink){
            btnQrcode.show();
            btnQrcode[0].innerHTML='显示二维码';
        }else{
            btnQrcode.hide();
        }
        showQrcode(false);
        showImage(config.imgobj);
    }

    return {
        render: render,
        show: function () {
            divImgView.show();
        },
        hide: function () {
            divImgView.hide();
            deleteLoadingImg();
        }
    };
})();

