/**
 * Created by ziki on 2015-07-18.
 */
var Setting = (function () {
    var $view,
        hasInit;

    function render() {
        init();
        initImgState();
        show();
    }

    function show() {
        kdAppSet.setAppTitle('我的设置');
        $view.show();
    }

    function hide() {
        $view.hide();
    }

    function init() {
        if (!hasInit) {
            $view = $('#view-setting');
            var userinfo = kdAppSet.getUserInfo();
            var identity = userinfo.identity;
            if (identity == "manager" || identity == "buyer") {
                operationsurl = "http://www.xingdongliu.com/h5preview/U20e08afcd3266674de217e62248665dbfe91240e";
            }
            else {
                operationsurl = "http://www.xingdongliu.com/h5preview/U04d7bf334b8662fcfe04f538aab8fc5d00d6d3bc";
            }
            //debugger;
            var buildDate=$('[kdbuilddate]');
            $view.find('[data-cmd="build-date"]')[0].innerText=buildDate.length==0?'':'('+buildDate.attr('kdbuildDate')+')';

            bindEvents();
            setCustPhoneInfo();
            initScroller();
            hasInit = true;
        }
    }

    function initImgState() {
        //初始化图标
        var iconstate = $view.find('[data-cmd="imgState"]');
        var imgState = kdAppSet.getImgMode();
        if (imgState) {
            iconstate.removeClass('noImgState_touched');

        } else {
            iconstate.addClass('noImgState_touched');
        }
    }

    function bindEvents() {
        $('#view-setting').delegate('.row', {
            'touchstart': function () {
                $(this).addClass('me_touched');
                $(this).children().addClass('me_touchedBottom');
            },
            'touchend': function () {
                $(this).removeClass('me_touched');
                $(this).children().removeClass('me_touchedBottom');
            }
        });

        $('#view-setting #noimg-div').bind('click', function () {
            var imgKey = kdAppSet.getNoimgModeCacheKey();
            var state = kdShare.cache.getCacheDataObj(imgKey);
            var icon = $(this).find('.noImgState');
            if (state === '0') {

                icon.removeClass('noImgState_touched');
                kdShare.cache.setCacheDataObj(1, imgKey);
                OptMsg.ShowMsg("您已取消无图模式", "", 3000);
            } else {
                icon.addClass('noImgState_touched');
                kdShare.cache.setCacheDataObj(0, imgKey);
                OptMsg.ShowMsg("您已开启无图模式，不会下载商品图片", "", 3000);
            }
            kdAppSet.h5Analysis('setting_noimg');
        });

        $('#view-setting').delegate('#refresh-span', {
            'click': function () {
                jConfirm("您确定刷新页面?\n(将重新加载微商城)", null, function (flag) {
                    if (flag) {
                        //刷新页面
                        window.location.reload(true);
                        kdAppSet.h5Analysis('setting_refresh');
                    }
                }, { ok: "是", no: "否" });
            },
            'touchstart': function () {
                var refresh = $('.view_Me .refreshIcon');
                refresh.removeClass('sprite-refresh');
                refresh.addClass('sprite-refresh_s');
            },
            'touchend': function () {
                var refresh = $('.view_Me .refreshIcon');
                refresh.removeClass('sprite-refresh_s');
                refresh.addClass('sprite-refresh');
            }
        });

        // 电话点击事件
        $('#view-setting #me_Phone').bind('click', function () {
            kdAppSet.h5Analysis('setting_Phone');
            var phone = $("#me_Phone").attr("href");
            if (phone == "tel:") {
                jAlert("很抱歉,客服的电话号码为空!");
                return false;
            }
        }).on(kdShare.clickfnIcon($('.view_Me .serverItem .phone'), 'tel', 'tel_p'));

        // 关于微商城
        $('#view-setting #about-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['aboutPage']);
            kdAppSet.h5Analysis('setting_about');
        });

        //版本更新说明
        $('#view-setting #update-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['UpdateList']);
            kdAppSet.h5Analysis('setting_update');
        });

        // 意见反馈点击事件
        $('#view-setting #feedback-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: 'http://club.kisdee.com/forum.php?mod=forumdisplay&fid=900' }]);
            kdAppSet.h5Analysis('setting_feedback');
        });

        //操作指南
        $('#view-setting #operations-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: operationsurl }]);
            kdAppSet.h5Analysis('setting_operations');
        });
    }

    function setCustPhoneInfo() {
        /*        var user = kdAppSet.getUserInfo();
         var phone = user.receiverPhone || "";
         var name = user.empName || "";
         if (!phone) {
         phone = user.servicePhone || "";
         name = user.serviceName || "";
         }*/
        var phone = '';
        var name = '';
        var user = kdAppSet.getUserInfo();
        /*        serviceOption  ---0：表示要时使用专营业务员作为“客服”显示；
         1--表示直接使用“客服”列表中的主负责人作为“客服”显示*/
        if (user.serviceOption == 0) {
            name = user.empName;
            phone = user.receiverPhone;
        } else {
            var service = OptMsg.getMsgServiceList();
            if (service.length > 0) {
                phone = service[0].servicePhone;
                name = service[0].serviceName;
            }
        }
        $("#me_Phone").attr("href", "tel:" + phone);
        $("#view-setting .serviceName").text(name);
    }


    function initScroller() {
        var scroller = Lib.Scroller.create($view[0]);
    }

    return {
        render: render,
        show: show,
        hide: hide
    }
})();
