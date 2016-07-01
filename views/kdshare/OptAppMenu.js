/*页面主菜单*/
var OptAppMenu = (function () {

    var kdcMenuBar = $(".kdcMenuBar");
    //主菜单点击事件
    function menuClickEvent(clickId) {

        switch (clickId) {
            case "homeId":
                MiniQuery.Event.trigger(window, 'toview', ['Home', { }]);
                break;
            case "typeId":
                MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', { }]);
                break;
            case "goodsBoxId":
                MiniQuery.Event.trigger(window, 'toview', ['CacheList', {}]);//noBack:true
                break;
            case "meId":
                MiniQuery.Event.trigger(window, 'toview', ['Me', { }]);
                break;
        }
        return false;
    }

    //初始化菜单状态
    function initMenuStatus() {
        $(".kdcMenuBar span").each(function () {
            $(this).removeClass("selected");
            var menuid = this.id;
            switch (menuid) {
                case "homeId":
                    kdShare.changeClassOfTouch($(this), 'main_s', 'main', true);
                    break;
                case "typeId":
                    kdShare.changeClassOfTouch($(this), 'order_s', 'order', true);
                    break;
                case "goodsBoxId":
                    kdShare.changeClassOfTouch($(this), 'hcart_s', 'hcart', true);
                    break;
                case "meId":
                    kdShare.changeClassOfTouch($(this), 'person_s', 'person', true);
                    break;
            }
        });
    }

    //选中某个菜单
    function selectMenu(menuid) {
        initMenuStatus();
        var menu = kdcMenuBar.find("#" + menuid);
        menu.addClass("selected");
        switch (menuid) {
            case "homeId":
                kdShare.changeClassOfTouch(menu, 'main', 'main_s', true);
                break;
            case "typeId":
                kdShare.changeClassOfTouch(menu, 'order', 'order_s', true);
                break;
            case "goodsBoxId":
                kdShare.changeClassOfTouch(menu, 'hcart', 'hcart_s', true);
                break;
            case "meId":
                kdShare.changeClassOfTouch(menu, 'person', 'person_s', true);
                break;
        }
    }

    //设置选中某个菜单
    function selectKdAppMenu(menuid) {
        selectMenu(menuid);
    }

    //是否显示主菜单
    function showKdAppMenu(bvisiable) {
        if (bvisiable) {
            kdcMenuBar.show();
        } else {
            kdcMenuBar.hide();
        }
    }

    //初始化app底部菜单
    function initAppMenu() {
        kdcMenuBar.find("#homeId,#typeId,#goodsBoxId,#meId").bind("click", function () {
            var clickId = this.id;
            menuClickEvent(clickId);
        });
    }

    return {
        initAppMenu: initAppMenu,
        showKdAppMenu: showKdAppMenu,
        selectKdAppMenu: selectKdAppMenu
    }

})();


