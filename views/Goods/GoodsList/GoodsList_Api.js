var GoodsList_Api = (function () {

    var apiLock, listviewobj; //防止用户快速点击

    //获取商品数据
    function get(config, fn, para, fnReset) {
        apiLock = true;
        listviewobj = config.listviewobj;
        var tabIndex = config.tabIndex;
        var itemsOfPage = config.itemsOfPage;
        var errorRefresh = config.errorRefresh;
        Lib.API.get('GetItemInfor', para,
            function (data, json, root, userflag) {
                removeHint();
                listviewobj.totalPageCount = parseInt(json['TotalPage']);
                var imgMode = kdAppSet.getImgMode();
                var noimgModeDefault = kdAppSet.getNoimgModeDefault();
                var pagenum = (listviewobj.currentPage - 1) * itemsOfPage;
                var list = $.Array.keep(data['itemlist'] || [], function (item, index) {
                    return {
                        index: pagenum + index,
                        name: item.fname,
                        img: item.fimageurl != '' ? (imgMode ? item.fimageurl : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                        imgThumbnail: item.fimageurl != '' ? (imgMode ? kdAppSet.getImgThumbnail(item.fimageurl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                        number: item.fnumber,
                        itemid: item.fitemid,
                        auxcount: item.auxcount,
                        price: item.fprice || 0,
                        maxprice: item.fmaxprice || 0,
                        model: item.fmodel,
                        isoverseas: item.foverseas || 0,
                        unitid: item.funitid,
                        unitname: item.funitname,
                        note: item.fnote,
                        num: parseInt(item.fqty),
                        newflag: item.frecommend,
                        cuxiaoflag: item.fpromotion,
                        expoint: item.expoint,
                        onlyexpoint: item.onlyexpoint
                    };
                });
                fn && fn(list, userflag);
                listviewobj.scroller.isPageEnd = (listviewobj.currentPage - 1 >= listviewobj.totalPageCount);

                apiLock = false;
                fnReset && fnReset();
            },
            function (code, msg) {
                removeHint();
                apiLock = false;
                kdAppSet.showErrorView(msg, errorRefresh);
                fnReset && fnReset();
            },
            function (errCode) {
                removeHint();
                apiLock = false;
                kdAppSet.showErrorView(errCode, errorRefresh);
                fnReset && fnReset();
            }, tabIndex);
    }


    function removeHint() {
        var ullist = $(listviewobj.listv);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    function format(data) {
        return {
            expoint: data.expoint,
            onlyexpoint: data.onlyexpoint,
            itemid: data.itemid,
            auxcount: data.auxcount,
            model: data.model,
            note: data.note,
            price: data.price,
            maxprice: data.maxprice,
            isoverseas: data.isoverseas,
            unitid: data.unitid,
            unitname: data.unitname,
            stocknum: data.num,
            goodsName: data.name,
            goodsImg: data.img,
            newflag: (data.newflag == 1) ? "display:block;" : "display:none;",
            cuxiaoflag: (data.cuxiaoflag == 1) ? "display:block;" : "display:none;"
        };
    }


    return {
        apiLock: function () {
            return apiLock
        },
        format: format,
        get: get
    }

})();