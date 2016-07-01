/*消息发送模块*/

var OptMsg = (function () {

    var urlGetCloudOpenId = "http://mob.cmcloud.cn/ServerCloud/KDWeibo/GetOpenIDByPhoneAndEID?pwd=&";
    var urlSendCloudMsg = "http://mob.cmcloud.cn/ServerCloud/Message/SendMessage";
    //var urlCrmLink='http://mob.cmcloud.cn/webapptest/crm/htdocs/index.html';
    var urlCrmLink='http://mob.cmcloud.cn/ServerCloud/KDWeibo/GenVCRMUrl';
    var kdMsgHint = $(".kdMsgHint");

    //订单下单提醒
    function OrderBillRemind(billno) {
        var user = kdAppSet.getUserInfo();
        var custname = user.companyName + "  " + user.contactName;
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var msg = custname + '于' + dTime + "进行了催单,请尽快处理订单 " + billno;
        ShowMsg("已提醒厂家进行业务处理！", "", 1100);
        SendCloudMsg(msg);
    }

    //退货单提醒
    function RejectBillRemind(billno) {
        var msg = "你好,我是 " + kdAppSet.getUserInfo().custName + ",请尽快处理退货单 " + billno;
        ShowMsg("已提醒厂家进行业务处理！", "", 1100);
        SendCloudMsg(msg);
    }

    //新的退货单消息
    function NewRejectBill(billno) {
        var user = kdAppSet.getUserInfo();
        var custname = user.companyName + "  " + user.contactName;
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var msg = custname + "于 " + dTime + " 提交了退货申请，单号： " + billno + " ,请及时跟进并处理!";
        SendCloudMsg(msg);
    }

    //新的订单消息
    function NewOrderBill(billno, billid,isNewBill) {
        var user = kdAppSet.getUserInfo();
        var custname = user.companyName + "  " + user.contactName;
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var opttype = " 提交了";
        if (!isNewBill) {
            opttype = " 修改了";
        }
        var msg = custname + "于 " + dTime + opttype + "订单 " + billno + " ,请及时跟进并处理!";
        var data={
            msg:1002,
            billid:billid
        };
        var linkurl=encodeURIComponent(urlCrmLink+'?data=' + encodeByTimes((JSON.stringify(data)), 2));
        SendCloudMsg(msg,'',linkurl);
    }

    //多次encode，云之家不支持json
    function encodeByTimes(str, number){
        var s = str;
        while(number--){
            s = encodeURIComponent(s);
        }
        return s;
    }

    //订单确认收货消息
    function ReceiveOrderGoods(billno) {
        var user = kdAppSet.getUserInfo();
        var custname = user.companyName + "  " + user.contactName;
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var msg = "确认收货啦!" + custname + "于" + dTime + "对订单 " + billno + " 进行了确认收货!";
        SendCloudMsg(msg);
    }

    //退货单物流信息
    function RejectBillExpress(billno, express, expressno) {
        var user = kdAppSet.getUserInfo();
        var custname = user.companyName + "  " + user.contactName;
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var msg = custname + "于 " + dTime + " 已进行退货，单号： " + billno + ",物流信息:" + express + " " + expressno;
        SendCloudMsg(msg);
    }


    //付款单 发送消息
    function PayBillMsg(config) {
        var user = kdAppSet.getUserInfo();
        var userName = user.companyName + "  " + user.contactName;
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var money = config.money;
        var orderno = config.orderno;
        var payno = config.billno;
        var sendmsg = userName + "于 " + dTime+'支付 '+money+'元，对应订单:'+orderno+',生成收款单:'+payno;
        SendCloudMsg(sendmsg);
    }


    //根据手机号码 获取云之家消息
    function GetCloudOpenIdByPhone(mobile) {
        var eid = kdAppSet.getAppParam().eid;
        var param = 'eid=' + eid
            + '&phone=' + mobile;
        var url = urlGetCloudOpenId + param;
        getJSON({url: url,
            fnSuccess: function (json) {
                if (json.code == 200) {
                    var data = json.data || {};
                    kdAppSet.setUserCloudOpenid(data.openid);
                }
            }
        });
    }

    //动态显示消息提醒
    function ShowMsg(msg, fn, itime) {
        kdMsgHint.find("span").html(msg);
        kdMsgHint.show();
        itime = itime || 1300;
        setTimeout(function () {
            if (fn) {
                fn()
            }
            kdMsgHint.hide();
        }, itime);
    }


    //调用url接口
    function getJSON(caller) {
        //url,  fnSuccess, fnFail,fnError
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
                    caller.fnError && caller.fnError("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }

    //获取发送消息的接收者列表
    function  getMsgServiceList(){
        var serviceList=[];
        var user=kdAppSet.getUserInfo();
        /* --云之家消息发送选项：2; --发给微商城客服；1;--发给专营业务员；0--两个都发*/
        if(user.msgOption==2 || user.msgOption==0){
            serviceList=serviceList.concat(user.serviceList);
        }
        if(user.msgOption==1 || user.msgOption==0){
            if(user.receiverPhone!='')
            {
                serviceList.push({
                    serviceName:user.empName,
                    servicePhone:user.receiverPhone
                });
            }
        }
        return serviceList;
    }

    //获取发送消息的电话列表
    function getPhoneList(){
        var phoneList=[];
        var list=getMsgServiceList();
        if(list.length>0){
           for(var i= 0,len=list.length;i<len;i++){
               phoneList.push(list[i].servicePhone);
           }
        }
        return phoneList;
    }

    //发送云之家待办消息

    function SendCloudMsg(msg, title,linkurl) {
        var eid = kdAppSet.getAppParam().eid;
        // var openid = kdAppSet.getUserInfo().cloudOpenid;
        var phoneList=getPhoneList();
        var datestr = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var sendData = {
            pub: "",
            to: [
                {no: eid, user: phoneList} //[openid]
            ],
            list: [
                {
                    date: datestr,
                    title: title || '',
                    text: msg,
                    zip: "",
                    url: linkurl || '',
                    name: "",
                    pic: ""
                }
            ],
            todo: 1  //1 待办 0 推送消息
        };

        var paramDataStr = JSON.stringify(sendData);
        var paramData = {eid: eid, type: 2, data: paramDataStr};//type: 1 改为2
        $.ajax({
            type: "POST",
            async: true,
            url: urlSendCloudMsg,
            data: paramData,
            dataType: 'json',
            success: function () {
            },
            error: function () {
            }
        });
    }


    //批量发送云之家待办消息
    function SendCloudMsgmultiple(msg, phonelist, register) {
        var eid = kdAppSet.getAppParam().eid;
        var datestr = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var custid=encodeURIComponent(encodeURIComponent(register.custid));
        var mobilePhone=kdAppSet.getAppParam().mobilePhone;
        if(mobilePhone){
            phonelist = [];
            phonelist.push(mobilePhone);
        }
        var data={
            msg:1000,
            custid:custid
        };
        var url_crm=encodeURIComponent(urlCrmLink+'?data='+ encodeByTimes((JSON.stringify(data)), 2));
        var sendData = {
            pub: "",
            to: [
                {no: eid, user: phonelist}
            ],
            list: [
                {
                    date: datestr,
                    title: '',
                    text: msg,
                    zip: "",
                    url: url_crm,
                    name: "",
                    pic: ""
                }
            ],
            todo: 1  //1 待办 0 推送消息
        };

        var paramDataStr = JSON.stringify(sendData);
        var paramData = {eid: eid, type: 2, data: paramDataStr};

        $.ajax({
            type: "POST",
            async: true,
            url: urlSendCloudMsg,
            data: paramData,
            dataType: 'json',
            success: function () {
            },
            error: function () {
            }
        });
    }


    //根据手机号 获取用户云之家openid
    function GetUserOpenid() {
        //业务员手机号
        var phone = kdAppSet.getUserInfo().receiverPhone;
        GetCloudOpenIdByPhone(phone);
    }



    //给主管发送商家
    function SendBusinessMsgToManager(custmer) {
        var dTime = $.Date.format($.Date.now(), "yyyy-MM-dd HH:mm");
        var sex = (custmer.Sex == 0) ? "女士" : "先生";
        var msg = custmer.ComName + custmer.Name + "(" + sex + ")于" + dTime + " 提交了意向信息，电话：" + custmer.Phone + "，请及时跟进此商机！";
        var apiname = 'kis.APP003177.uecrm.CRMController.GetMangerList';
        var para = {};
        Lib.API.get(apiname, para,
            function (data, json) {
                var list = data.manager || [];
                var inum = list.length;
                var phonelist = [];
                for (var i = 0; i < inum; i++) {
                    phonelist.push(list[i].mobile);
                }
                if (phonelist.length > 0) {
                    SendCloudMsgmultiple(msg, phonelist, {
                        name:custmer.Name || '',
                        phone:custmer.Phone || '',
                        cmpname:custmer.ComName || '',
                        custid:custmer.custid || ''
                    });
                }
            }, function (code, msg, json) {
            }, function () {
        });
    }

    /*
     $("#view-hotgoods .title").bind("click",function(){
     });*/

    return {
        OrderBillRemind: OrderBillRemind,
        RejectBillRemind: RejectBillRemind,
        NewRejectBill: NewRejectBill,
        NewOrderBill: NewOrderBill,
        GetUserOpenid: GetUserOpenid,
        PayBillMsg: PayBillMsg,
        ReceiveOrderGoods: ReceiveOrderGoods,
        RejectBillExpress: RejectBillExpress,
        SendBusinessMsgToManager: SendBusinessMsgToManager,
        getMsgServiceList: getMsgServiceList,
        getPhoneList: getPhoneList,
        ShowMsg: ShowMsg
    };

})();


