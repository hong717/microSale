/**
 * Created by pc on 2015-08-04.
 */
var FreightRule = (function(){
    function render(){
        show();
    }

    function show(){
        $('#view-freightRule').show();
    }

    function hide(){
        $('#view-freightRule').hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    }
})();