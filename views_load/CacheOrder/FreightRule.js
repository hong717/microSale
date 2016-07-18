/**
 * Created by pc on 2015-08-04.
 */
var FreightRule = (function () {
    var hasinit = true;
    var viewPage;
    function render() {
        initview();
        show();
    }

    function initview() {
        if (hasinit) {
            viewPage = $('#view-freightRule');
            var sendlist = kdAppSet.getUserInfo().sendList;
            for (i = 0; i < sendlist.length; i++) {
                if (sendlist[i].name == "门店配送") {
                    viewPage.find('[data-cmd="send"]').show();
                }
            }
            var freight = kdAppSet.getUserInfo().sendPara;
            viewPage.find('[data-cmd="beginamount"]')[0].innerHTML = freight.beginamount;
            viewPage.find('[data-cmd="freightforamount"]')[0].innerHTML = freight.freightforamount;
            viewPage.find('[data-cmd="beginrang"]')[0].innerHTML = freight.beginrang;
            viewPage.find('[data-cmd="freightforrang"]')[0].innerHTML = freight.freightforrang;
            hasinit = false;
        }
    }

    function show() {
        viewPage.show();
    }

    function hide() {
        viewPage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    }
})();