/**
 * Created by clover_wu on 2015-01-21
 *
 * alter by hong on 2015-04-27
 *
 *alert by mayue on 2015-12-22 重新改写定位
 */

var Gaode = (function () {
    var config;
    var mapObj;

    var scroller,
        listwrap,
        maplist,
        sample;
    //function mapInit(location) {
    //    if(mapObj){
    //        return;
    //    }
    //    mapObj = new AMap.Map("viewMapKingdee", {
    //        view: new AMap.View2D({
    //            //center:new AMap.LngLat(113.955391,22.533938),//地图中心点
    //            center:new AMap.LngLat(location.long,location.lat),//地图中心点
    //            zoom:50 //地图显示的缩放级别
    //        })
    //    });
    //}


    //已知点坐标--地址
    function geocoder(initconfig) {
        config = initconfig;
        var location = config.location;
        mapObj = config.mapObj;
        mapObj.setZoomAndCenter(18, [location.long, location.lat]);
        //mapInit(location);
        var MGeocoder;
        //加载地理编码插件
        mapObj.plugin(["AMap.Geocoder"], function () {
            MGeocoder = new AMap.Geocoder({
                radius: 2000,
                extensions: "all"
            });
            //返回地理编码结果
            AMap.event.addListener(MGeocoder, "complete", geocoder_CallBack);
            //逆地理编码
            var lnglatXY = new AMap.LngLat(location.long, location.lat);
            MGeocoder.getAddress(lnglatXY);
        });
    }



    //回调函数--显示地址列表
    function geocoder_CallBack(data) {
        config.callback(data);
        if (!maplist) {
            listwrap = document.getElementById('view_mapdiv');
            maplist = document.getElementById('view_maplist');
            sample = $.String.between(maplist.innerHTML, '<!--', '-->');
        }

        var addressh = data.regeocode.addressComponent;
        var addressinfo = addressh.province + addressh.city + addressh.district;
        maplist.innerHTML = $.Array.map(data.regeocode.pois, function (item, i) {
            if (i % 4 == 0) {
                setView(i + 1, item.location.toString());
            }
            return $.String.format(sample, {
                index: i,
                name: item.name,
                address: addressinfo + item.address
            });
        }).join('');

        if (!scroller) {
            scroller = Lib.Scroller.create(listwrap);
        } else {
            scroller.refresh();
        }
    }

    //设置标记点
    function setView(index, e) {
        var coor = e.split(','),
            lnglat = new AMap.LngLat(coor[0], coor[1]);
        var kk = "http://webapi.amap.com/images/" + index + ".png";
        new AMap.Marker({
            map: mapObj,
            // icon: kk,
            position: lnglat,
            offset: new AMap.Pixel(-10, -34)
        });

        mapObj.setFitView();


        //测试
        //var marker = new AMap.Marker({
        //    map: mapObj,
        //    // icon: kk,
        //    position: lnglat,
        //    offset: new AMap.Pixel(-10, -34)
        //});

        //mapObj.setFitView();

        //marker.on('click', function (e) {
        //    infowindow.open(mapObj, e.target.getPosition());
        //})
        //AMap.plugin('AMap.AdvancedInfoWindow', function () {
        //    infowindow = new AMap.AdvancedInfoWindow({
        //        offset: new AMap.Pixel(0, -30)
        //    });
        //})

    }



    //地址--坐标
    function regeocoder(address, fn) {
        kdAppSet.setKdLoading(true, '获取地址信息...');
        AMap.service(["AMap.Geocoder"], function () {
            geocoder = new AMap.Geocoder({
                radius: 1000 //范围，默认：500
            });

            //地理编码,返回地理编码结果
            geocoder.getLocation(address, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    kdAppSet.setKdLoading(false);
                    fn && fn({
                        result: status,
                        lng: result.geocodes[0].location.getLng(),
                        lat: result.geocodes[0].location.getLat()
                    });
                };
                if (status == 'error') {
                    kdAppSet.setKdLoading(false);
                    fn && fn({
                        result: status
                    });
                };
                if (status == 'no_data') {
                    kdAppSet.setKdLoading(false);
                    fn && fn({
                        result: status
                    });
                };

            });
        }); //加载地理编码
    }

    //获取坐标
    function getlocation(fn) {
        try {
            AMap.service(["AMap.Geolocation"], function () {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    //zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    buttonPosition: 'RB'
                });
                //mapObj.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', function (data) {
                    fn && fn(data);
                });//返回定位信息
                AMap.event.addListener(geolocation, 'error', function (data) {
                    fn && fn(data);
                });//返回定位出错信息
            });
        } catch (e) {
            fn && fn({});
        }

    }

    //计算两点之间距离
    //传入开始经纬度   结束地址经纬度 object{lng,lat}
    //返回距离 单位 米
    function pointdistance(begin, end) {
        var lnglat = new AMap.LngLat(begin.lng, begin.lat);
        var distance = lnglat.distance([end.lng, end.lat]);
        return distance;
    }

    return {
        geocoder: geocoder,//坐标--地址
        regeocoder: regeocoder,//地址-坐标
        getlocation: getlocation,//获取当前坐标
        pointdistance: pointdistance,//两点之间距离
    }
})();
