/**
 * 版本更新说明
 * Created by pc on 2015-07-31.
 */

var UpdateList = (function(){
    var $view,
        hasInit,
		scroller,
		div;
    function render(){
        init();
        show();
		scroller.refresh();
    }
    function init(){
        if (!hasInit) {
            var data = UpdateContentList;
            $view = $('#view-update');
            var s = $.Array.keep(data, function (item, index) {
                return '<li class="item">' + item + '</li>'
            }).join('');
            $view.find('#update-ul').html(s);
            div = document.getElementById('view-update');
            scroller = Lib.Scroller.create(div);
            hasInit = true;
        }
    }

    function show(){
        kdAppSet.setAppTitle('版本更新说明');
        $view.show();
    }

    function hide(){
        $view.hide();
    }

    return{
        render: render,
        show: show,
        hide: hide
    }
})();