/*浏览器hash事件处理*/
var OptHash = (function () {
    var viewNameList = [];
    var viewHashList = [];
    window.addEventListener("hashchange", hashDeal, false);
    function hashDeal() {
        var hash = window.location.hash;
        hash = hash.substr(1, hash.length - 1);
        var len = viewHashList.length - 1;
        if (len >= 0 && hash != viewHashList[len]) {
            MiniQuery.Event.trigger(window, 'backviewkeep');
        }
    }

    function pushHash(viewName, args) {
        var hash_para = '/' + encodeURIComponent(args ? JSON.stringify(args) : '');

        //var inum = viewHashList.length;
        //var hash = $.String.random(7) + inum;
        //viewHashList.push(hash);
        var hashView = viewName + hash_para;
        viewHashList.push(hashView);
        viewNameList.push(viewName);
        window.location.hash = hashView;
        console.log(viewNameList.join(','));
        console.log(viewHashList.join(','));
    }

    function popHash() {
        viewHashList.pop();
        viewNameList.pop();
        //隐藏键盘
        document.activeElement.blur();
        kdShare.keyBoard.hide();
        //隐藏加载中
        kdAppSet.setKdLoading(false);
        PopMenu.hideElem();
        // 隐藏快速购买
        AddGoods.hideAttr();
        JHide();
        console.log(viewNameList.join(','));
        console.log(viewHashList.join(','));
    }

    function get() {
        var hash = window.location.hash;
        var posi = hash.indexOf('/');
        return (posi >= 0) ? hash.substring(1, posi) : hash.substring(1);
    }

    return {
        pushHash: pushHash,
        popHash: popHash,
        get: get
    }

})();


