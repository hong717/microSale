var OptView = (function () {

    // 获取选中的某一个省/市/区信息
    // areaSel: 省/市/区内容缓存，areaObj: 地址页面对象，para：参数，fn: 回调函数
    function getAreaInfo(areaSel, areaObj, para, fn) {
        MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {selobj: areaSel,
            api: 'GetAreaList',
            para: para,
            callBack: function (selObj) {
                if (areaSel.id == selObj.id) {
                    return;
                } else {
                    areaSel.id = selObj.id;
                    areaSel.name = selObj.name;
                    areaObj.innerText=areaSel.name;
                }
                fn && fn();
            }}]);
    }

    return {
        getAreaInfo:getAreaInfo
    };

})();


