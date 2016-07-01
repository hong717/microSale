/**
 * 弹出菜单
 * Created by pc on 2015-07-06.
 */
var PopMenu = (function(){
    var hasBind,
        isShow,
        w, h,
        A, B, C, D, E,
        elems,
        hasInit;

    /*
    * 将弹出菜单与按钮绑定
    * @param {string | DOM Element} elem 要绑定的按钮的 ID 或者 DOM 节点
    */
    function bindWithBtn(elem){
        var btn = typeof elem === 'string' ? document.getElementById(elem) : btn;

        if(!hasInit){
            init();
            hasInit = true;
        }
        $(btn).on('click', function(){
            if(isShow){
                hideElem(true);
                return;
            }
            showElem();
        });

        $('#keyboardMark').on('click', function(){
            if(isShow){
                hideElem(true);
            }
        });

    }

    function init(){
        w = window.innerWidth;
        h = window.innerHeight;

        A = document.getElementById('nemu1');
        B = document.getElementById('nemu2');
        C = document.getElementById('nemu3');
        D = document.getElementById('nemu4');
        E = document.getElementById('nemu5');
        elems = [A, B, C, D, E];
        repalceImg();
        if(!hasBind){
            bindEvents();
        }
    }

    function repalceImg(){
        $(A).find('img').attr('src', 'img/menu_01.png');
        $(B).find('img').attr('src', 'img/menu_02.png');
        $(C).find('img').attr('src', 'img/menu_03.png');
        $(D).find('img').attr('src', 'img/menu_04.png');
        $(E).find('img').attr('src', 'img/menu_05.png');
    }

    function bindEvents(){
        $(A).on('click', function(){
            hideElem(false);
            MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
        });
        $(B).on('click', function(){
            hideElem(false);
            MiniQuery.Event.trigger(window, 'toview', ['CacheList']);
        });
        $(C).on('click', function(){
            hideElem(false);
            MiniQuery.Event.trigger(window, 'toview', ['Me']);
        });
        $(D).on('click', function(){
            hideElem(false);
            MiniQuery.Event.trigger(window, 'toview', ['GoodsSearch']);
        });
        $(E).on('click', function(){
            hideElem(false);
            MiniQuery.Event.trigger(window, 'toview', ['Home']);
        });
        hasBind = true;
    }

    function hideElem(isanimaion){
        if(!isShow){
            return;
        }
        var delayTime = 500;
        if(!isanimaion){
            $('.popMenu').removeClass('animation');
            delayTime = 0;
        }
        for(var i = elems.length; i--;){
            var elem = elems[i];
            elem.style.opacity = 0;
            elem.style.right = '-32px';
            elem.style.bottom = '-32px';
        }
        setTimeout("$('#keyboardMark').fadeOut()", delayTime);

        isShow = false;
    }

    function showElem(){
        $('.popMenu').addClass('animation');
        $('#keyboardMark').fadeIn();

        for(var i = elems.length; i--;){
            var elem = elems[i];
            elem.style.opacity = 1;
        }
        A.style.right = w/2 + 'px';
        A.style.bottom = h/2 + 75 + 'px';
        B.style.right = w/2 - 55 + 'px';
        B.style.bottom = 30 + h/2 + 'px';
        C.style.right = w/2 - 40 + 'px';
        C.style.bottom = h/2 -35 + 'px';
        D.style.right = w/2 + 40 + 'px';
        D.style.bottom = h/2 -35 +'px';
        E.style.right = w/2 + 55 + 'px';
        E.style.bottom = 30 + h/2 + 'px';

        isShow = true;
    }

    return{
        bindWithBtn: bindWithBtn,
        hideElem: hideElem
    }
})();
