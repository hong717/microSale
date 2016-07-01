

/*图标*/
var Home_Icon = (function () {

    var hasInit, sampleIconList, iconimgList, viewPage,
        homeDataList;
    viewList = [];//点击事件


    function init(config) {
        if (!hasInit) {
            var div = document.getElementById('viewid_home');
            viewPage = $(div);
            iconimgList = document.getElementById('homeIconList');
            sampleIconList = $.String.between(iconimgList.innerHTML, '<!--', '-->');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        viewPage.delegate('.iconList li', {
            'click': function () {
                var name = this.getAttribute('data-name');
                if (name == "物流查询" || name == "再次购买" || name == "我要提货") {//联系客服不需要登录判断
                    if (kdAppSet.getUserInfo().usertype != 0) {
                        MiniQuery.Event.trigger(window, 'toview', ['Register', {}]);
                        return;
                    }
                }

                switch (name) {
                    case '物流查询':
                        showView('Orderlist', { tabindex: 4 });
                        kdAppSet.h5Analysis('home_logistics');
                        break;
                    case '再次购买':
                        showView('Orderlist', { tabindex: 0 });
                        kdAppSet.h5Analysis('home_buyagain');
                        break;
                    case '我要提货':
                        showView('PickUpList');
                        kdAppSet.h5Analysis('home_storelist');
                        break;
                    case '我的客服':
                        callPhone();
                        kdAppSet.h5Analysis('home_service');
                        break;
                    case '新品':
                        var tiltleName = viewPage.find('#home_newlist .title')[0].innerHTML;
                        showView('GoodsList', { tabindex: 1, title: tiltleName, fromPage: 0, hideCategory: true, reload: true, reload: true });
                        break;
                    case '门店':
                        showView('StoreViewList');
                        break;
                    case '促销':
                        var tiltleName = viewPage.find('#home_cxlist .title')[0].innerHTML;
                        showView('GoodsList', { tabindex: 2, title: tiltleName, fromPage: 0, hideCategory: true, reload: true, reload: true });
                        break;
                    case '公告':
                        showView('Inform', { noticelist: homeDataList.noticelist });
                        break;
                }
            },
            'touchstart': function () {
                var index = this.getAttribute('data-index');
                $(this).find('img').attr('src', viewList[index].iconimgClick);
            },
            'touchend': function () {
                var index = this.getAttribute('data-index');
                $(this).find('img').attr('src', viewList[index].iconimg);
            }
        })

    }

    function showView(viewName, config) {
        kdAppSet.stopEventPropagation();
        config = config || {};
        MiniQuery.Event.trigger(window, 'toview', [viewName, config]);
    }

    function callPhone() {
        var phone = '';
        var service = OptMsg.getMsgServiceList();
        if (service.length > 0) {
            phone = service[0].servicePhone;
        }
        var phoneUrl = "tel:" + phone;
        if (phoneUrl == "tel:") {
            jAlert("很抱歉,客服的电话号码为空!");
            return false;
        }
        window.location.href = phoneUrl;
    }

    //处理图标
    function iconList(iconlist) {
        //每次清空
        viewList = [];
        for (i = 0; i < iconlist.length; i++) {
            switch (iconlist[i]) {
                case 'logistics'://物流查询
                    viewList.push({
                        iconimg: 'img/iconlogistics.png',
                        iconimgClick: 'img/iconlogistics_click.png',
                        iconName: '物流查询'
                    });
                    break;
                case 'buyagain'://再次购买
                    viewList.push({
                        iconimg: 'img/iconbuy.png',
                        iconimgClick: 'img/iconbuy_click.png',
                        iconName: '再次购买'
                    });
                    break;
                case 'outinstore'://门店自提
                    viewList.push({
                        iconimg: 'img/iconSelfhelp.png',
                        iconimgClick: 'img/iconSelfhelp_click.png',
                        iconName: '我要提货'
                    });
                    break;
                case 'servicephone'://客服电话
                    viewList.push({
                        iconimg: 'img/iconmyservicephone.png',
                        iconimgClick: 'img/iconmyservicephone_click.png',
                        iconName: '我的客服'
                    });
                    break;
                case 'xinpin'://新品推荐
                    viewList.push({
                        iconimg: 'img/iconxinpin.png',
                        iconimgClick: 'img/iconxinpin_click.png',
                        iconName: '新品'
                    });
                    break;
                case 'storelist'://线下门店
                    viewList.push({
                        iconimg: 'img/iconstore.png',
                        iconimgClick: 'img/iconstore_click.png',
                        iconName: '门店'
                    });
                    break;
                case 'cuxiao'://促销
                    viewList.push({
                        iconimg: 'img/iconcuxiao.png',
                        iconimgClick: 'img/iconcuxiao_click.png',
                        iconName: '促销'
                    });
                    break;
                case 'gonggao'://公告
                    viewList.push({
                        iconimg: 'img/icongonggao.png',
                        iconimgClick: 'img/icongonggao_click.png',
                        iconName: '公告'
                    });
                    break;
            }
        }
    }

    //初始化快捷图标菜单--马跃
    function initMenuList() {
        iconimgList.innerHTML = $.Array.keep(viewList, function (item, index) {
            return $.String.format(sampleIconList, {
                index: index,
                //img: iconImgList[index],
                img: item.iconimg,
                imgname: item.iconName
            });
        }).join('');
    }


    function render(config) {
        homeDataList = config;
        init();
        iconList(config.imgbuttonlist);//处理图标
        initMenuList();//显示
    }

    return {
        render: render,
    }
})();