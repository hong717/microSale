/*门店选择列表*/


var Inform = (function () {
    var viewpage, hasInit, sample, scroller,
        content, noticelist;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('view_inform');
            viewpage = $(div);
            scroller = Lib.Scroller.create(div);
            content = document.getElementById('inform-content');
            sample = $.String.getTemplates(content.innerHTML, [
                {
                    name: 'container',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'item',
                    begin: '#--item.begin--#',
                    end: '#--item.end--#',
                    outer: '{items}'
                },
                {
                    name: 'desc',
                    begin: '#--desc.begin--#',
                    end: '#--desc.end--#'
                },
                {
                    name: 'img',
                    begin: '#--img.begin--#',
                    end: '#--img.end--#'
                },
                {
                    name: 'li',
                    begin: '#--li.begin--#',
                    end: '#--li.end--#'

                }
            ]);
            fillcontent(noticelist);
            hasInit = true;
        }
    }


    function fillcontent(arr) {
        if (arr.length == 0) {
            content.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>暂无公告</span></div>';
            return;
        }
        content.innerHTML = $.String.format(sample.container, {
            'items': $.Array.keep(arr, function (item, index) {
                var descStr = $.String.format(sample.desc, {
                    'title': item.title,
                    'content': item.content
                });

                var imgStr = $.Array.keep(item.imglist, function (imglist, index) {
                    return $.String.format(sample.img, {
                        'url': imglist.url
                    });
                }).join('');

                var liStr = sample.li;

                return descStr + imgStr + liStr;
            }).join('')
        });

        //等待图片加载完成刷新滑动组件
        setTimeout(function () {
            var imgs = $(content).find('img');
            imgs.on('load', function () {
                scroller.refresh();
            });
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].complete) {
                    scroller.refresh();
                }
            }
        }, 250);
        scroller.refresh();
    }

    function render(config) {
        debugger;
        noticelist = config.noticelist;
        initView();
        show();
        scroller.refresh(500);
    }

    function show() {
        kdAppSet.setAppTitle('公告');
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();