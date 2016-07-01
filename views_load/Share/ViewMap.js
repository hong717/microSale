/**
 *alert by mayue on 2015-12-22 重新改写定位
 */
var ViewMap = (function () {
    var viewPage,
        config,
        listdata,
        hasInit,
        mapObj;
    var mapjsurl = 'http://webapi.amap.com/maps?v=1.3&key=b3e668b7441992532613810c7dda3072';

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = document.getElementById('viewid_map');
            listdata = {};
            bindEvents();
            hasInit = true;
        }
    }



    MiniQuery.Event.bind(window, {
        'ViewMapLoadJs': function () {
            kdAppSet.loadScriptFile(mapjsurl);
        }
    });

    function bindEvents() {
        //选择地址
        $('#view_maplist').delegate('li', {
            'click': function () {
                var index = this.getAttribute('index');
                var addressh = listdata.regeocode.addressComponent;
                var list = listdata.regeocode.pois;
                var item = list[index];
                //对四个直辖市特殊处理
                var cityname = new Array('北京市', '上海市', '重庆市', '天津市');
                if (cityname.indexOf(addressh.province) != -1) {
                    addressh.city = addressh.province;
                    addressh.province = addressh.province.substring(0, addressh.province.length - 1);
                }
                var addressInfo = {
                    province: addressh.province,
                    city: addressh.city,
                    district: addressh.district,
                    address: item.address + item.name
                };
                config.selectAddress && config.selectAddress(addressInfo);
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('li_touched');
            },
            'touchend': function () {
                $(this).removeClass('li_touched');
            }
        });

    }

    //    function getLocation() {
    //        if (navigator.geolocation) {
    //            kdAppSet.setKdLoading(true, '获取地理位置...');
    //            navigator.geolocation.getCurrentPosition(showPosition,showError);
    //        }
    //        else {
    //            OptMsg.ShowMsg('您的浏览器不支持地理定位');
    //        }
    //        function showPosition(position) {
    //            kdAppSet.setKdLoading(false);
    //            Gaode.geocoder({
    //                    location: {
    //                        lat: position.coords.latitude,
    //                        long: position.coords.longitude
    //                    },
    //                    callback: setListData}
    //            );
    //        }
    //        function showError(error)
    //        {
    //            kdAppSet.setKdLoading(false);
    //            switch(error.code)
    //            {
    //                case error.PERMISSION_DENIED:
    //                    OptMsg.ShowMsg('用户拒绝获取地理位置','',3000);
    //                    break;
    //                case error.POSITION_UNAVAILABLE:
    //                    OptMsg.ShowMsg('获取不到用户地理位置','',3000);
    //                    break;
    //                case error.TIMEOUT:
    //                    OptMsg.ShowMsg('获取地理位置超时','',3000);
    //                    break;
    //                case error.UNKNOWN_ERROR:
    //                    OptMsg.ShowMsg('获取地理位置,出现未知错误','',3000);
    //                    break;
    //            }
    //        }
    ///*        Gaode.geocoder({
    //            location:{
    //                lat: 22.533938,
    //                long: 113.955391
    //            },
    //            callback:setListData
    //        });*/
    //    }

    function getLocation() {
        try {

            mapObj = new AMap.Map('viewMapKingdee', {
                resizeEnable: true,
                zoom: 13
            });

            kdAppSet.setKdLoading(true, '获取地理位置...');
            mapObj.plugin('AMap.Geolocation', function () {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    //zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    buttonPosition: 'RB'
                });
                //mapObj.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
            });
        } catch (e) {
            OptMsg.ShowMsg('获取地理位置失败，请手动选择收货地址', function () { kdShare.backView() }, 2000);

        }
    }

    function onComplete(data) {
        kdAppSet.setKdLoading(false);
        Gaode.geocoder({
            mapObj: mapObj,
            location: {
                long: data.position.getLng(),
                lat: data.position.getLat()
            },
            callback: setListData
        }
                );
    }

    function onError(data) {
        OptMsg.ShowMsg('获取地理位置,定位错误', '', 3000);
    }

    function setListData(data) {
        listdata = data;
    }

    function render(initconfig) {
        config = initconfig;
        initView();
        show();
        getLocation();
    }

    function show() {
        $(viewPage).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(viewPage).hide();
        }
    };
})();