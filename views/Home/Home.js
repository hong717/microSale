var Home = (function () {
    var div,
        viewPage,
        scroller,
        SwipeWrap,
        sampleImg,
        sampleImgli,
        sampleImgList,
        sampleNameList,
        nameList,
        SliderPosi,
        imageViewList,
        firstLoad,
        noImage,
        imglistSwipe,
        hasInit,
        config,
        iX,
        iY,
        homeDataList;


    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_home');
            viewPage = $(div);
            if (kdAppSet.getAppParam().isSubscribe == 1 || kdAppSet.getUserInfo().wxservicenumberurl == "" || kdAppSet.isPcBrower()) {
                viewPage.find('[data-cmd="followme"]').removeClass();
            }
            var scrollList = document.getElementById('homeViewList');
            scroller = Lib.Scroller.create(scrollList, { scrollbars: false });
            SwipeWrap = document.getElementById('homeSwipeWrap');
            sampleImg = $.String.between(SwipeWrap.innerHTML, '<!--', '-->');
            SliderPosi = document.getElementById('homeSliderPosi');
            sampleImgli = $.String.between(SliderPosi.innerHTML, '<!--', '-->');
            imageViewList = $('#homeSwipeWrap');
            nameList = document.getElementById('nameList');
            sampleNameList = $.String.getTemplates(nameList.innerHTML, [
                {
                    name: 'nameList',
                    begin: '#--nameList.begin--#',
                    end: '#--nameList.end--#'
                }
            ]);
            sampleImgList = $.String.getTemplates(nameList.innerHTML, [
                {
                    name: 'imgList',
                    begin: '#--ImgList.begin--#',
                    end: '#--ImgList.end--#'
                }
            ]);
            noImage = 'img/no_img.png';
            bindEvents();
            firstLoad = true;
            hasInit = true;
        }
    }

    function showView(viewName, config) {
        kdAppSet.stopEventPropagation();
        config = config || {};
        MiniQuery.Event.trigger(window, 'toview', [viewName, config]);
    }



    function bindEvents() {


        //刷新商品列表
        MiniQuery.Event.bind(window, {
            'Home_refresh': function () {
                getGoodsList();
            }
        });


        viewPage.delegate('.search', {
            //搜索
            'click': function () {
                showView('GoodsSearch');
            }
        })
            .delegate('.more', {
                'touchstart': function () {
                    $(this).addClass('touched');
                },
                'touchend': function () {
                    $(this).removeClass('touched');
                }
            })
            .delegate('#home_hotlist  .more', {
                //推荐 导购
                'click': function () {
                    var tiltleName = viewPage.find('#home_hotlist .title')[0].innerHTML;
                    showView('HotList', { title: tiltleName, fromPage: 0 });
                }
            })
            .delegate('#home_newlist  .more', {
                //新品
                'click': function () {
                    var tiltleName = viewPage.find('#home_newlist .title')[0].innerHTML;
                    showView('GoodsList', { tabindex: 1, title: tiltleName, fromPage: 0, hideCategory: true, reload: true });
                }
            })
            .delegate('#home_cxlist .more', {
                //促销
                'click': function () {
                    var tiltleName = viewPage.find('#home_cxlist .title')[0].innerHTML;
                    showView('GoodsList', { tabindex: 2, title: tiltleName, fromPage: 0, hideCategory: true, reload: true });
                }
            })
            .delegate('#homeSwipeWrap img', {
                //首页广告图片
                'click': function () {
                    var optid = this.getAttribute('data-optid');
                    switch (optid) {
                        case 'xp':
                            showView('GoodsList', { tabindex: 1, fromPage: 0, hideCategory: true, reload: true });
                            break;
                        case 'cx':
                            showView('GoodsList', { tabindex: 2, fromPage: 0, hideCategory: true, reload: true });
                            break;
                        case 'tj':
                            showView('HotList', { fromPage: 0 });
                            break;
                    }
                }
            })
            .delegate('.imgList2 li', {
                //商品详情
                'click': function () {
                    var goodsid = this.getAttribute('data-goodsid');
                    showView('GoodsDetail', { item: { itemid: goodsid } });
                }
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
            })
            .delegate('[data-cmd="followme"]', {
                //关注我
                'click': function () {
                    var userInfo = kdAppSet.getUserInfo();
                    MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                        { imgobj: userInfo.wxservicenumberurl, imgname: userInfo.wxservicenumber, type: 'followme' }]);
                },
                'touchstart': function (event) {
                    iX = event.originalEvent.changedTouches[0].clientX - this.offsetLeft;
                    iY = event.originalEvent.changedTouches[0].clientY - this.offsetTop;
                    //return false;
                },
                'touchmove': kdShare.throttle(ImgMove, 20),
                'touchend': function (e) {
                    //dragging = false;

                }
            })
        ;
    }

    function ImgMove(event) {
        var sizerate = document.documentElement.style.fontSize;
        sizerate = sizerate.substring(0, sizerate.length - 2);//适应屏幕处理
        var event = event || window.event;
        var oX = (event.originalEvent.changedTouches[0].clientX - iX) / sizerate;
        if (oX <= 0) {
            oX = 0;
        }
        if (oX >= (document.documentElement.clientWidth / sizerate - 1.12)) {
            oX = document.documentElement.clientWidth / sizerate - 1.12;
        }
        var oY = (event.originalEvent.changedTouches[0].clientY - iY) / sizerate;
        if (oY <= 0) {
            oY = 0;
        }
        if (oY >= (document.documentElement.clientHeight / sizerate - 2.16)) {
            oY = document.documentElement.clientHeight / sizerate - 2.16;
        }

        this.style.left = oX + 'rem';
        this.style.top = oY + 'rem';
    }

    //显示图片墙信息
    function freshWrapImgList(imglist) {
        if (!imglist) {
            return;
        }
        var imgls = imglist;

        if (imgls.length == 0) {
            imgls.push(noImage);
        }
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();

        SwipeWrap.innerHTML = $.Array.keep(imgls, function (item, i) {
            var imgsrc = item.img != '' ? (imgMode ? item.img : noimgModeDefault) : noImage;
            return $.String.format(sampleImg, {
                index: i,
                img: imgsrc,
                optid: item.optid
            });
        }).join('');


        setTimeout(function () {
            $("#homeSwipeWrap img").load(function () {
                scroller && scroller.refresh();
            })
        }, 250);


        if (imgls.length <= 1) {
            imgls = [];
        }
        SliderPosi.innerHTML = $.Array.keep(imgls, function () {
            return $.String.format(sampleImgli, {});
        }).join('');
        if (imgls.length > 1) {
            $('#viewid_home  nav .position li:first').addClass('on')
        }
        initSwipe();
    }

    function initSwipe() {
        var bullets = document.getElementById('homeSliderPosi').getElementsByTagName('li');
        Swipe(document.getElementById('homeSlider'), {
            startSlide: 0,
            auto: 3000,
            continuous: false,
            disableScroll: false,
            stopPropagation: false,
            allowVerticalMove: false,
            callback: function (pos) {
            },
            transitionEnd: function (index) {
                var i = bullets.length;
                if (i > 0) {
                    while (i--) {
                        bullets[i].className = ' ';
                    }
                    bullets[index].className = 'on';
                }
            }
        });
    }

    //刷新指定列表数据
    function freshListView(dataList, domList) {
        domList.innerHTML = $.Array.keep(dataList, function (item, index) {
            return $.String.format(sampleImgList.imgList, {
                img: item.img,
                name: item.name,
                goodsid: item.goodsid,
                price: kdAppSet.formatMoneyStr(item.price)
            });
        }).join('');
    }


    //请求api 获取首页数据
    function getGoodsList() {
        kdAppSet.setKdLoading(true);
        var para = { para: {} };
        Lib.API.get('GetHomePageList', para,
            function (data, json) {
                homeDataList = data;
                kdAppSet.setKdLoading(false);
                Home_Icon.render(data);
                freshGoodsList(data);
                config.fn && config.fn(); //首页加载完后 再回调
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showErrorView(msg);
            }, function (errCode) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showErrorView(errCode);
            });
    }


    //处理后台返回的数据
    function getDataList(data, liststr) {
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        return $.Array.keep(data[liststr] || [], function (item) {
            return {
                goodsid: item.fitemid,
                price: item.fprice,
                maxprice: item.fmaxprice,
                name: item.fname,
                img: item.fimageurl != '' ? (imgMode ? item.fimageurl : noimgModeDefault) : (imgMode ? noImage : noimgModeDefault)
            };
        });
    }

    //菜单列表支持自定义
    function AddNameList(data) {

        var user = kdAppSet.getUserInfo().cmpInfo;
        var style = user.homeImgStyle;
        var imgClass = 'img3';
        style == 1 ? (imgClass = 'img1') : (style == 2 ? (imgClass = 'img2') : '');
        nameList.innerHTML = "";
        nameList.innerHTML += $.Array.keep(data, function (item) {
            return $.String.format(sampleNameList.nameList, {
                nameListId: getListName(item.id),
                imgClass: imgClass,
                name: item.name
            });
        }).join('');
    }

    function getListName(name) {
        var nameList = {
            'cx': 'home_cxlist',
            'xp': 'home_newlist',
            'tj': 'home_hotlist'
        };
        return nameList[name];
    }

    //刷新首页数据
    function freshGoodsList(data) {

        AddNameList(data.namelist);

        var tjListData = getDataList(data, 'tjlist');
        var xpListData = getDataList(data, 'xplist');
        var cxListData = getDataList(data, 'cxlist');

        if (xpListData.length > 0) {
            $('#home_newlist').show();
        }
        if (cxListData.length > 0) {
            $('#home_cxlist').show();
        }
        if (tjListData.length > 0) {
            $('#home_hotlist').show();
        }

        var xplist = $('#home_newlist .imgList2')[0];
        if (xplist) {
            freshListView(xpListData, xplist);
        }

        var cxlist = $('#home_cxlist .imgList2')[0];
        if (cxlist) {
            freshListView(cxListData, cxlist);
        }
        var tjlist = $('#home_hotlist .imgList2')[0];
        if (tjlist) {
            freshListView(tjListData, tjlist);
        }

        setTimeout(function () {
            var imgs = $(".view_home .imgList2 .imgBox img");
            imgs.on('load', function () {
                scroller && scroller.refresh();
            });
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].complete) {
                    scroller && scroller.refresh();
                }
            }
        }, 500);

        var isShowPrice = kdAppSet.getIsShowPrice();
        if (!isShowPrice) {
            $(viewPage).find('.price').css('visibility', 'hidden');
        }
        else {
            viewPage.find('.price').css('visibility', 'visible');
        }

        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        var imglist = $.Array.keep(data['imglist'] || [], function (item) {
            return {
                optid: item.id,
                img: item.imgurl != '' ? (imgMode ? item.imgurl : noimgModeDefault) : (imgMode ? noImage : noimgModeDefault)
            };
        });
        imglistSwipe = imglist;
        if (imglist.length == 0) {
            $('#homeSlider').hide();
        } else {
            freshWrapImgList(imglist);
        }
        scroller && scroller.refresh();
        setTimeout(function () {
            scroller && scroller.refresh();
        }, 2500);
    }


    function render(configp) {
        config = configp;

        initView();
        if (config && config.isHide) {
        } else {
            show();
        }
        if (firstLoad) {
            getGoodsList();
            firstLoad = false;
        }
    }

    //在首个页面 显示不是首页的情况下 ，要刷新一下轮播组件
    function freshSwipeImg() {
        var firstview = kdAppSet.getAppParam().firstview;
        if (firstview) {
            freshWrapImgList(imglistSwipe);
            kdAppSet.getAppParam().firstview = '';
        }
    }

    function show() {
        viewPage.show();
        OptAppMenu.selectKdAppMenu("homeId");
        OptAppMenu.showKdAppMenu(true);
        freshSwipeImg();
        scroller && scroller.refresh();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            viewPage.hide();
            OptAppMenu.showKdAppMenu(false);
        }
    };


})();