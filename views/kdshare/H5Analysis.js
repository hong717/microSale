/**
 * 用户按钮行为识别
 *
 */
var H5Analysis=(function(){

    var btnInfo={
        'home_logistics':'首页_物流查询',
        'home_storelist':'首页_线下门店',
        'home_pickup':'首页_我要提货',
        'home_buyagain':'首页_再次购买',
        'home_service':'首页_我的客服',

        'goodsDetail_collect':'商品详情_收藏',
        'goodsDetail_add':'商品详情_加入购物车',
        'goodsDetail_buy':'商品详情_立即购买',
        'goodsDetail_menu':'商品详情_菜单',
        'goodsDetail_share': '商品详情_分享指示',

        'setting_noimg': '我的设置_无图模式',
        'setting_refresh': '我的设置_刷新页面',
        'setting_Phone': '我的设置_我的客服',
        'setting_feedback': '我的设置_意见反馈',
        'setting_operations': '我的设置_操作指南',
        'setting_update': '我的设置_版本更新说明',
        'setting_about': '我的设置_关于微商城',

        'orderlist_btnSearch':'订单列表_搜索',
        'orderlist_remind': '订单列表_催单',
        'orderlist_pay': '订单列表_付款',
        'orderlist_buymore': '订单列表_再次购买',

        'goodsList_add':'商品列表_加入购物车',
        'goodsList_shopCart':'商品列表_购物车',
        'goodsList_submitBill':'商品列表_提交订单',
        'goodsList_bigImg':'商品列表_大图模式',
        'goodsList_search':'商品列表_商品查询',

        'CacheOrderList_editGoods':'订单确认_编辑清单',
        'CacheOrderList_addGoods':'订单确认_添加商品',
        'CacheOrderList_submit':'订单确认_提交订单',

        'me_balance':'我_余额',
        'me_unpay':'我_待付款',
        'me_uncheck':'我_待确认',
        'me_unsend':'我_待发货',
        'me_sended':'我_已发货',
        'me_salesReturn':'我_退货',
        'me_allBill':'我_全部订单',
        'me_payList':'我_我的付款',
        'me_address':'我_我的地址',
        'me_collect':'我_我的收藏',
        'me_myBuyer':'我_我的买家',
        'me_toJoin':'我_我要加盟',
        'me_setting':'我_我的设置',
        'me_loginout':'我_我的注销',
        'me_buyer':'我_我的采购员',
        'me_checkMoney':'我_交易对账'

    };


    function btnClick(key){
        try{
            if(btnInfo[key]){
                //MtaH5.clickStat(btnInfo[key]);
                MtaH5.clickStat(key);
            }
        }catch(e) {
        }
    }

    return{
        btnClick:btnClick
    }

})();