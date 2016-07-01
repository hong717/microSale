/*微信卡券*/
var WXCard = (function () {

    var errEnum = {
        '0': 'invalid serial code', // 无效优惠券，不存在
        '1': 'invalid user-card status', // 可能是过期的
        '2': 'invalid code, this code has consumed.' // 已被使用的
    };

    function getErrorMsg(str) {
        str = str || '';
        var msg = str.indexOf(errEnum[0]) != -1 ? '无效的序列号' :
                str.indexOf(errEnum[1]) != -1 ? '该优惠券无效或已过期' :
                str.indexOf(errEnum[2]) != -1 ? '该优惠券已被使用过' : '无效的优惠券';
        return  msg;
    }

    //调用url接口
    function getJSON(caller) {
        //url,  fnSuccess, fnFail
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', caller.url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        caller.fnSuccess && caller.fnSuccess(json);
                    } else {
                        caller.fnFail && caller.fnFail(json.msg);
                    }
                }
                else {
                    caller.fnFail && caller.fnFail("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }

    //获取用户卡券选择列表
    function getCardList(fnSuccess, fnFail, billMoney) {
        try {
            wx.chooseCard({
                timestamp: kdCardPay.timestamp,
                nonceStr: kdCardPay.nonceStr,
                cardSign: kdCardPay.signature,
                success: function (res) {
                    var card = JSON.parse(res.cardList);
                    var url = 'http://mob.cmcloud.cn/servercloud/weixin/GetCardInfoByCode?encrypt=Y&eid=' + kdAppSet.getAppParam().eid + '&cardCode=' + encodeURIComponent(card[0].encrypt_code);
                    kdAppSet.setKdLoading(true, "正获取卡券信息..");
                    getJSON({
                        'url': url,
                        'fnSuccess': function (json) {
                            kdAppSet.setKdLoading(false);
                            var cardCode = json.msg;
                            var data = JSON.parse(decodeURIComponent(json.data || '{}'));
                            var cardInfo = format(data, cardCode, billMoney);
                            if (cardInfo.type == '') {
                                fnFail && fnFail(cardInfo.msg);
                            } else {
                                fnSuccess && fnSuccess(cardInfo);
                            }
                        },
                        'fnFail': function (msg) {
                            kdAppSet.setKdLoading(false);
                            msg = getErrorMsg(msg);
                            fnFail && fnFail(msg);
                        }
                    });
                }
            });
        } catch (e) {
            OptMsg.ShowMsg('获取卡券信息出错!' + e.message);
        }
    }


    function format(data, card, billMoney) {

        var result = {
            'code': card
        };
        var discount = null;
        if (data.card_type == 'CASH') {
            discount = data.cash || {};
            // lest_count, reduce_cost都是按1毛钱算的，要除100换算成元
            $.extend(result, {
                'limit': (discount.least_cost || 0) / 100,
                'value': (discount.reduce_cost || 0) / 100,
                'type': 'cash'
            });
            if (result.limit > 0 && result.limit > billMoney) {
                $.extend(result, {
                    'type': '',
                    'msg': '此优惠券要求最低消费金额 ' + result.limit + ' 元'
                });
                return result;
            } else {
                result.freeMoney = result.value;
            }
        } else if (data.card_type == 'DISCOUNT') {
            discount = data.discount || {};
            var disValue = discount.discount || 0;
            $.extend(result, {
                'limit': 0,
                'value': disValue,
                'freeMoney': disValue * billMoney / 100,
                'type': 'discount'
            });
        } else {
            $.extend(result, {
                'type': '',
                'msg': '此优惠券微商城不支持!'
            });
            return result;
        }

        var baseInfo = discount.base_info || {};
        var advancedInfo = discount.advanced_info || {};
        var dateBegin = baseInfo.date_info && baseInfo.date_info['begin_timestamp'];
        var dateEnd = baseInfo.date_info && baseInfo.date_info['end_timestamp'];

        //日期限制
        $.extend(result, {
            'name': baseInfo.title,
            'beginDate': dateBegin ? dateBegin * 1000 : 0,
            'endDate': dateEnd ? dateEnd * 1000 : 0
        });

        result = checkCard(result, advancedInfo, billMoney);

        // 折扣类型: cash-代金券， discount-折扣券
        return result;
    }

    //检查卡券是否符合条件使用  日期 星期 金额限制等
    function checkCard(result, advancedInfo, billMoney) {
        var serverDate = '';
        var curDate = new Date();
        var curTime = curDate.getTime();

        //判断日期是否合适
        if (result.beginDate > 0) {
            if (curTime < result.beginDate || curTime > result.endDate) {
                $.extend(result, {
                    'type': '',
                    'msg': '此优惠券不能在今天使用!(生效日期范围不对)'
                });
                return result;
            }
        }

        try {
            var timeLimit = advancedInfo.time_limit || [];
            timeLimit = getWeekDay(timeLimit);
            $.extend(result, {
                'timeLimit': timeLimit
            });

            //判断日期是否合适
            if (result.timeLimit.length > 0) {
                var wday = curDate.getDay();
                if (timeLimit.indexOf(wday) < 0) {
                    $.extend(result, {
                        'type': '',
                        'msg': '此优惠券不能在今天使用!(生效星期范围不对)'
                    });
                }
            }
        }
        catch (e) {
        }

        return result;
    }

    function getWeekDay(timeLimit) {
        var days = [];
        var num;
        var weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        for (var d in timeLimit) {
            num = weekDays.indexOf(timeLimit[d].type);
            days.push(num);
        }
        return days;
    }

    function consumeCard(cardCode, fnSuccess, fnFail) {
        var url = 'http://mob.cmcloud.cn/servercloud/weixin/ConsumeCardByCode?eid=' + kdAppSet.getAppParam().eid + '&cardCode=' + cardCode;
        getJSON({
            'url': url,
            'fnSuccess': function () {
                fnSuccess && fnSuccess();
            },
            'fnFail': function (msg) {
                fnFail && fnFail(msg);
            }
        });
    }

    function checkApi(fnCheck){
        wx.checkJsApi({
            jsApiList: ['chooseCard'],
            success: function(res) {
                var  check=res.checkResult.chooseCard;
                fnCheck && fnCheck(check);
            }
        });
    }

    return {
        getCardList: getCardList,
        consumeCard: consumeCard,
        checkApi: checkApi
    };
})
();

