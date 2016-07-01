/*添加商品到采购清单*/

var AddGoods_AddList = (function () {
    var
    //采购清单列表
        divGoodslist,
        addgoodsullist,
        sample,
        addGoodsList,
        scrollerList;

    function initView() {
/*        divGoodslist = document.getElementById('addgoodslist');
        addgoodsullist = document.getElementById('addgoodsullist');
        sample = $.String.between(addgoodsullist.innerHTML, '<!--', '-->');
        scrollerList = Lib.Scroller.create(divGoodslist);
        addGoodsList = AddGoods_Api.getAddGoodsList();
        bindEvents();*/
    }

    function reSetAddGoodsList() {
/*        addGoodsList.length = 0;
        goodsListSumInfo();*/
    }


    //购物清单 商品数量汇总
    function goodsListSumInfo() {
        var inum = addGoodsList.length;
        var isum = 0;
        var isummoney = 0;
        for (var i = 0; i < inum; i++) {
            isum = isum + Number(addGoodsList[i].num);
            isummoney = isummoney + kdShare.calcMul(Number(addGoodsList[i].num), Number(addGoodsList[i].price));
        }
        var ctrlp = $(".addgoods .sumlist");
        ctrlp.find("#sum_num").text(isum);
        ctrlp.find("#sum_money").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(isummoney));
    }


    function bindEvents() {


        //刷新购物车商品数
        MiniQuery.Event.bind(window, {
            'addGoodsListSumInfo': function () {
                goodsListSumInfo();
            }
        });


        //采购清单点击
        $(".addgoods .sumlist").delegate('', {
            'click': function () {
                if (addGoodsList.length > 0) {
                    showAddGoodsList();
                }
            },
            'touchstart': function () {
                $(this).css({"background-color": '#D9DADB'});
            },
            'touchend': function () {
                $(this).css({"background-color": '#ffffff'});
            }
        });




        //列表中 数字键 减号函数
        $("#addgoodsullist").delegate("#divNumLeft", {
            'click': function () {
                var iindex = this.getAttribute("index");
                divNumLeftFunc(iindex);
            }
        });

        //列表中 输入框
        $("#addgoodsullist").delegate(".numText2", {
            'click': function () {
                var target = this;
                var iindex =this.getAttribute("index");
                var config = {
                    name: addGoodsList[iindex].name,
                    input: target.innerText,
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.innerText = 1;
                            addGoodsList[iindex].num = 1;
                        }
                        else {
                            target.innerText = kvalue;
                            addGoodsList[iindex].num = Number(kvalue);
                        }
                        var dataKey = addGoodsList[iindex].name;
                        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, addGoodsList[iindex].num);
                        addGoodsList[iindex].price = price;
                        goodsListSumInfo();
                    },
                    hidefn: function () {

                    }
                };
                kdShare.keyBoard.autoshow(config);
            }
        });

        //列表中 数字键 加号函数
        $("#addgoodsullist").delegate("#divNumRight", {
            'click': function () {
                divNumRightFunc(this.getAttribute("index"));
            }
        });

        //列表中 删除按钮函数
        $("#addgoodsullist").delegate(".rowDelete", {
            'click': function () {
                var index=this.getAttribute("index");
                var ctrlp = $("#addgoodsullist").find(".lirow[index="+index+"]");
                var goodName = ctrlp.find(".name")[0].innerHTML;
                var inum = addGoodsList.length-1;
                for(var i=inum;i>=0;i--){
                    if (addGoodsList[i].name == goodName) {
                        addGoodsList.splice(i,1);
                    }
                }
                ctrlp.animate({left: "-320px"}, 300, function () {
                    showAddGoodsList();
                    goodsListSumInfo();
                });
            }
        });

    }


    //数字键 减号函数
    function divNumLeftFunc(index) {
        var numInput = $("#addgoodsullist").find(".numText2[index="+index+"]")[0];
        var numAdd = Number(numInput.innerText);
        if (numAdd > 1) {
            numAdd--;
        }
        numInput.innerText = numAdd;
        addGoodsList[index].num = Number(numAdd);
        var dataKey = addGoodsList[index].name;
        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, numAdd);
        addGoodsList[index].price = price;
        goodsListSumInfo();
    }

    //数字键 加号函数
    function divNumRightFunc(index) {
        var numInput = $("#addgoodsullist").find(".numText2[index="+index+"]")[0];
        var numAdd = Number(numInput.innerText);
        numAdd++;
        numInput.innerText = numAdd;
        addGoodsList[index].num = Number(numAdd);
        var dataKey = addGoodsList[index].name;
        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, numAdd);
        addGoodsList[index].price = price;
        goodsListSumInfo();
    }


    //显示采购清单
    function showAddGoodsList() {
        var divlist_addgoods = $("#divlist_addgoods");
        var inum = addGoodsList.length;
        if (inum == 0) {
            $(".addgoods .btnok").css("background", "#aaaaaa");
            $("#flySumlist").attr("style", "");
            return;
        }

        var toplist = ["100px", "260px", "200px", "140px"];
        if (inum > 3) {
            inum = 0;
        }
        var itop = toplist[inum];
        divlist_addgoods.css({"top": itop});
        $("#divlistMark").show();
        divlist_addgoods.show();
        freshAddGoodsList();
    }


    //购物清单 展开显示
    function freshAddGoodsList() {

        var goodsListHtml = $.Array.keep(addGoodsList, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                num: item.num,
                index: index
            });
        }).join('');
        addgoodsullist.innerHTML = goodsListHtml;
        scrollerList.refresh();
    }


    return {
        initView: initView,
        reSetAddGoodsList: reSetAddGoodsList,
        getAddGoodsList: function () {
          /*  return addGoodsList;*/
        }
    };

})();