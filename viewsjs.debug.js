/*地址列表页*/


var AddressList = (function () {
    var div, sample, scroller, addressList, ul, ullist, config, viewpage, mode, receiveidSel, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_addressList');
            viewpage = $(div);
            var divlist = document.getElementById('addressList_select');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            addressList = [];
            receiveidSel = '';
            bindEvents();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 0.2,
            fnfresh: function (reset) {
                reset();
                getAddressList();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 获取地址列表
    function getAddressList(fnCallBack) {
        loadingHint();
        Lib.API.get('GetReceiverAddressList', {para: {}},
            function (data, json) {
                data = data.ReceiverList;
                addressList = $.Array.keep(data || [], function (item, index) {
                    return {
                        receiverid: item.receiverid,
                        name: item.name,
                        address: item.address,
                        mobile: item.mobile,
                        isdefault: item.isdefault,
                        provincenumber: item.provincenumber,
                        citynumber: item.citynumber,
                        districtnumber: item.districtnumber,
                        provincename: item.provincename,
                        cityname: item.cityname,
                        districtname: item.districtname,
                        addressdetail: item.provincename + item.cityname + item.districtname + item.address
                    };
                });

                // 填充模板
                freshList(addressList);
                fnCallBack && fnCallBack();
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    // 填充地址列表
    function freshList(datalist) {
        var listStr = $.Array.keep(datalist, function (item, index) {
            return $.String.format(sample, {
                index: index,
                name: item.name,
                phone: item.mobile,
                address: item.addressdetail,
                defaultFlag: item.isdefault ? 'inline-block;color:#FF662B' : 'none'
            });
        }).join('');
        removeHint();
        if (datalist.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        freshListStatus();
        showSelectAddress();
        scroller.refresh();
    }


    // 设置选择项
    function showSelectAddress() {
        var addrSel = config.addressInfo;
        if (addrSel) {
            var inum = addressList.length;
            var selInfo = addrSel.name + addrSel.mobile + addrSel.addressdetail;
            for (var i = 0; i < inum; i++) {
                var item = addressList[i];
                var tmp = item.name + item.mobile + item.addressdetail;
                if (selInfo == tmp) {
                    receiveidSel = item.receiverid;
                    $('#addressList_select ').find('li[index=' + i + '] .info img').attr('src', 'img/selected.png');
                    break;
                } else if ((receiveidSel != '') && (receiveidSel == item.receiverid)) {
                    $('#addressList_select ').find('li[index=' + i + '] .info img').attr('src', 'img/selected.png');
                    break;
                }
            }
        }
    }

    // 移除加载提示信息
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }

    function selectAddress(item) {
        if ((item.provincenumber == '0') || (item.citynumber == '0') || (item.provincenumber == '') || (item.citynumber == '')) {
            jAlert("收货地址中 省,市,区都不能为空,请修改!");
            return false;
        }
        config.fnselect(item);
        receiveidSel = item.receiverid;
        kdShare.backView();
    }

    // 绑定事件
    function bindEvents() {

        viewpage.delegate('.addBtn', {
            'click': function () {
                // 添加地址操作标识
                MiniQuery.Event.trigger(window, 'toview', ['EditAddress',
                    { addressInfo: '',
                        optType: 1,
                        addressNum: addressList.length,
                        fn: function () {
                            getAddressList(function () {
                                if ((mode == 'select') && (addressList.length == 1)) {
                                    selectAddress(addressList[0]);
                                }
                            });
                        }
                    }]);
            },
            'touchstart': function () {
                $(this).addClass('addBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('addBtn_touched');
            }
        });

        //选择收货地址
        $(ul).delegate('.info', {
            'click': function () {
                var index = this.getAttribute('index');
                if (mode == 'select') {
                    // 回调函数，返回当前选中的地址信息
                    var item = addressList[index];
                    selectAddress(item);
                } else {
                    editAddressInfo(index);
                }
            },
            'touchstart': function (event) {
                $(this).addClass('li_touched');
                $(this).find('img').attr('src', 'img/selected.png');
            },
            'touchend': function (event) {
                $(this).removeClass('li_touched');
                var index = this.getAttribute('index');
                var item = addressList[index];
                if (receiveidSel != item.receiverid) {
                    $(this).find('img').attr('src', 'img/select.png');
                }
            }
        });

        //编辑
        $(ul).delegate('.edit', {
            'click': function (event) {
                var iindex = this.getAttribute('index');
                editAddressInfo(iindex);
            },
            'touchstart': function (event) {
                $(this).addClass('li_touched');
            },
            'touchend': function (event) {
                $(this).removeClass('li_touched');
            }
        });

        //删除
        $(ul).delegate('.delete', {
            'click': function (event) {
                var iindex = this.getAttribute('index');
                jConfirm("您确定要删除选中的地址?", null, function (flag) {
                    if (flag) {
                        var ctrlP = $("#viewid_addressList  li[index=" + iindex + "]");
                        ctrlP.animate({left: "-320px"}, 500, function () {
                            deleteAddressInfo(addressList[iindex]);
                            addressList.splice(iindex, 1);
                            freshList(addressList);
                        });
                    }
                }, {ok: "确定", no: "取消"});
            },
            'touchstart': function (event) {
                $(this).addClass('li_touched');
            },
            'touchend': function (event) {
                $(this).removeClass('li_touched');
            }
        });
    }

    //编辑收货地址
    function editAddressInfo(iindex) {
        MiniQuery.Event.trigger(window, 'toview', ['EditAddress', {
            addressInfo: addressList[iindex],
            optType: 2,
            addressNum: addressList.length,
            fn: function () {
                getAddressList(function () {
                    if ((mode == 'select') && (addressList.length==1)) {
                        selectAddress(addressList[0]);
                    }
                });
            }
        }]);
    }

    //删除收货地址
    function deleteAddressInfo(addressItem) {
        Lib.API.get('SetReceiverAddress', {
            para: getAddressPara(addressItem)
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('网络错误删除地址失败，请稍候再试', '', 3000);
        });
    }

    function getAddressPara(addressItem) {
        var para = {};
        para.ReceiverID = addressItem.receiverid;
        para.OptType = 0;
        return para;
    }

    function render(configp) {
        config = configp || {};
        mode = config.mode || '';
        initView();
        show();
        getAddressList();
    }


    //刷新地址列表状态
    function freshListStatus() {
        if (mode == 'select') {
        } else {
            $('.view_addressList li .img').hide();
            $('.view_addressList li .infoDiv').css('margin-left', '20px');
        }
    }

    // 显示加载提示信息
    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<div class="spacerow"></div>');
    }


    function show() {
        kdAppSet.setAppTitle('我的地址');
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
/*编辑地址页面*/

var EditAddress = (function () {
    var viewPage, scroller,isdefault, hasInit,
        provinceSel,  // 身份信息 {name:"广东省",id:-1};
        citySel,      // 城市信息 {name:"深圳市",id:-1};
        districtSel,   // 区域信息 {name:"南山区",id:-1};
        optType,      // 操作类型 0:删除，1:添加，2:修改
        callBack,     // 回调函数
        addressInfo,  // 地址信息对象
        addressNum,
        receiverid;

    // 默认地址信息
    var constStr = {
        name: '',
        mobile: '',
        provincename: '省',
        cityname: '市',
        districtname: '区',
        address: '',
        provincenumber: '-1',  // 地址内码
        citynumber: '-1',
        districtnumber: '-1',
        receiverid: ''
    };

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = document.getElementById('viewid_editAddress');
            var divlist = document.getElementById('addressList_edit');
            provinceSel = {name: "广东省", id: -1};
            citySel = {name: "深圳市", id: -1};
            districtSel = {name: "南山区", id: -1};
            isdefault=0;
            bindEvents();
            initScroll(divlist);
            var iwidth=$(window).width()-80;
            $('#viewid_editAddress .detailAddress').css('width',iwidth);
            $('.view_editAddress .AutoLocate img').attr('src','img/location.png');
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, { hinttop: -0.6});
    }

    // 初始化编辑页面
    function initEditPage(config) {

        // 判断是否为新增页面或编辑/查看页面
        if (!config) {
            config = constStr;
        }
        //设置默认的收货人跟手机
        constStr.name=kdAppSet.getUserInfo().contactName;
        constStr.mobile=kdAppSet.getUserInfo().senderMobile;

        $(viewPage).find('.name').val(config.name);
        $(viewPage).find('.phone').val(config.mobile);
        $(viewPage).find('#province').html(config.provincename || '省');
        $(viewPage).find('.detailAddress').val(config.address);
        // 更新省信息
        provinceSel.name = config.provincename;
        provinceSel.id = config.provincenumber;
        // 设置市信息
        initCity(config);
        // 设置区信息
        initDistrict(config);
        receiverid = config.receiverid;
        isdefault=config.isdefault || 0;

        var optObj=$('.view_editAddress .addressDefaultState');
        if (isdefault == 0) {
            optObj.removeClass('addressDefaultState_touched');
        } else {
            optObj.addClass('addressDefaultState_touched');
        }
        var defaultCtrl=$('.view_editAddress .setDefaultDiv');
        if(isdefault==1 || addressNum==0){
            defaultCtrl.hide();
        }else{
            defaultCtrl.show();
        }

        if(optType==1){
            //增加
            $('.view_editAddress .deleteBtn').hide();
        }else{
            $('.view_editAddress .deleteBtn').show();
        }
    }

    // 初始化市内容
    function initCity(config) {
        $(viewPage).find('#city').html(config.cityname || '市');
        citySel.name = config.cityname;
        citySel.id = config.citynumber;
    }

    // 初始化区内容
    function initDistrict(config) {
        if (config.districtnumber == '') {
            $(viewPage).find('#district').html('');
        } else {
            $(viewPage).find('#district').html(config.districtname || '区');
        }
        districtSel.name = config.districtname;
        districtSel.id = config.districtnumber;
    }

    // 获取选中的某一个省/市/区信息
    // areaSel: 省/市/区内容缓存，areaObj: 地址页面对象，para：参数，fn: 回调函数 
    function getAreaInfo(areaSel, areaObj, para, fn) {
        MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {selobj: areaSel,
            api: 'GetAreaList',
            para: para,
            callBack: function (selObj) {
                if (areaSel.id == selObj.id) {
                    kdShare.backView();
                    return;
                } else {
                    areaSel.id = selObj.id;
                    areaSel.name = selObj.name;
                    $(areaObj).html(areaSel.name);
                }
                fn && fn();
        }}]);
    }

    // 获取当前要提交的地址页面信息
    function getAddressInfo() {
        var nameStr=kdAppSet.ReplaceJsonSpecialChar(checkHint($(viewPage).find('.name').val(), 'name'));
        var addressStr=kdAppSet.ReplaceJsonSpecialChar(checkHint($(viewPage).find('.detailAddress').val(), 'address'));
        return {
            ReceiverID:receiverid,
            Name:nameStr,
            Mobile:checkHint($(viewPage).find('.phone').val(), 'mobile'),
            Address: addressStr,
            ProvinceNumber:provinceSel.id,
            CityNumber:citySel.id,
            DistrictNumber:(districtSel.id != '-1') ? districtSel.id : '',
            OptType:optType,
            IsDefault:isdefault,
            provincename :provinceSel.name,
            cityname :citySel.name,
            districtname : (districtSel.id != '-1') ? districtSel.name : ''
        };
    }

    // 检查内容是否为提示文字
    function checkHint(value, property) {
        return kdShare.trimStr(value);
    }

    // 更新当前地址信息
    function updateAddressInfo() {
        $.Object.extend(addressInfo, getAddressInfo());
        // 调用回调函数
        callBack(addressInfo);
    }

    // 检查是否符合提交条件
    function checkSubmit() {

        var  item=getAddressInfo();
        if (item.Name == '') {
            OptMsg.ShowMsg('请输入姓名');
            return false;
        }

        var phone = kdShare.trimStr($(viewPage).find('.phone').val());
        phone = kdShare.getPureNumber(phone);
        if (checkHint(phone, 'mobile') == '') {
            OptMsg.ShowMsg('请输入手机号码');
            return false;
        }
        $(viewPage).find('.phone').val(phone);

        if (provinceSel.id == '-1' || citySel.id == '-1') {
            OptMsg.ShowMsg('请先选择省、市、区');
            return false;
        }

        if (item.Address == '') {
            OptMsg.ShowMsg('请输入详细地址');
            return false;
        }
        return true;
    }

    //设置默认收货地址
    function setDefaultAddress(optObj){
        if (isdefault == 0) {
            isdefault = 1;
            optObj.addClass('addressDefaultState_touched');
        } else {
            isdefault = 0;
            optObj.removeClass('addressDefaultState_touched');
        }
    }

    // 绑定事件
    function bindEvents() {

        $(viewPage).delegate('.selectItem', {
            'touchstart': function () {
                $(this).addClass('li_touched');
            },
            'touchend': function () {
                $(this).removeClass('li_touched');
            }
        });

        $(viewPage).delegate('input, textarea', {
            'focus': function () {

            },
            'blur': function () {
                var hint = $(this).attr('hint');
                var value = kdShare.trimStr($(this).val());
                if (value == '' || value == hint) {
                    $(this).removeClass('text_focus');
                }
                scroller.refresh();
            }
        });

        // 默认地址事件
        $(viewPage).delegate('#addressDefaultState', {
            'click': function () {
                setDefaultAddress($(this));
            }
        });
        //选择 省
        $(viewPage).delegate('#province', {
            'click': function () {
                callProvinceInfo();
            }
        });
        //选择 市
        $(viewPage).delegate('#city', {
            'click': function () {
                callCityInfo();
            }
        });
        //选择 区
        $(viewPage).delegate('#district', {
            'click': function () {
                callDistrictInfo();
            }
        });


        //保存地址
        $(viewPage).delegate('.saveBtn', {
            'click': function () {

                if (!checkSubmit()) {
                    return;
                }
                kdAppSet.setKdLoading(true, '正在添加...');
                Lib.API.post('SetReceiverAddress', {
                        para: getAddressInfo()
                    }, function (data, json, root, userflag) {
                        kdAppSet.setKdLoading(false);
                        OptMsg.ShowMsg('保存成功');
                        kdShare.backView();
                        updateAddressInfo();

                    }, function (code, msg, json, root, userflag) {
                        kdAppSet.setKdLoading(false);
                        OptMsg.ShowMsg(msg);
                    }, function () {
                        kdAppSet.setKdLoading(false);
                        OptMsg.ShowMsg('网络错误，请稍候再试', '', 3000);
                    }
                );
            },
            'touchstart': function () {
                $(this).addClass('saveBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('saveBtn_touched');
            }
        });

        //删除地址
        $(viewPage).delegate('.deleteBtn', {
            'click': function () {
                jConfirm("您确定要删除选中的地址?", null, function (flag) {
                    if (flag) {
                            deleteAddressInfo();
                    }
                }, {ok: "确定", no: "取消"});

            },
            'touchstart': function () {
                $(this).addClass('deleteBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('deleteBtn_touched');
            }
        });

        //打开自动定位地图
        $(viewPage).delegate('.AutoLocate', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ViewMap', {selectAddress:selectAddress}]);
            },
            'touchstart': function () {
                $(this).addClass('saveBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('saveBtn_touched');
            }
        });
    }

    function deleteAddressInfo(){
        kdAppSet.setKdLoading(true, '正在删除...');
        Lib.API.get('SetReceiverAddress', {
            para: getAddressPara(addressInfo)
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('删除成功');
            setTimeout(function () {
                kdShare.backView();
            }, 500);

        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('网络错误，请稍候再试', '', 3000);
        });
    }

    function getAddressPara(addressItem) {
        var para = {};
        para.ReceiverID = addressItem.receiverid;
        para.OptType = 0;
        return para;
    }

    function callProvinceInfo(){
        var curThis=$('#viewid_editAddress #province');
        var oldProvince = curThis.html();
        getAreaInfo(provinceSel, curThis, {parentnumber: ''}, function () {
            // 但内容改变时初始化市区内容
            if (oldProvince != curThis.html()) {
                initCity(constStr);
                initDistrict(constStr);
                callCityInfo();
                kdShare.clearBackView(1);
            }
        });
    }

    function callCityInfo(){
        var curThis=$('#viewid_editAddress #city');
        var oldCity = curThis.html();
        var _that = curThis;
        getAreaInfo(citySel, curThis, {parentnumber: provinceSel.id},
            function () {
                // 内容改变时初始化区内容
                if (oldCity != curThis.html()) {
                    initDistrict(constStr);
                    callDistrictInfo();
                    kdShare.clearBackView(1);
                }
            });
    }

    function callDistrictInfo(){
        var curThis=$('#viewid_editAddress #district');
        getAreaInfo(districtSel, curThis, {parentnumber: citySel.id},function(){
            kdShare.backView();
        });
    }

    function selectAddress(addressInfo){
        var view=$(viewPage);
        view.find('#province').html(addressInfo.province);
        view.find('#city').html(addressInfo.city);
        view.find('#district').html(addressInfo.district);
        view.find('.detailAddress').val(addressInfo.address);
        getAddressCode({
            province:addressInfo.province,
            city:addressInfo.city,
            district:addressInfo.district
        });
    }

    function getLocationPara(address){
        //{"citynumber":440300,"districtnumber":110101,"provincenumber":440000}
        return {
            provincename:address.province,
            provincenumber:"",
            cityname:address.city,
            citynumber:"",
            districtname:address.district,
            districtnumber:""
        };
    }


    function dealLocationCode(data){
        provinceSel.id=data.provincenumber;
        citySel.id=data.citynumber;
        districtSel.id=data.districtnumber;
    }

    //获取定位地址编码
    function getAddressCode(address){

        kdAppSet.setKdLoading(true, '获取地址编码...');

        Lib.API.post('GetAddressNumber', {
                para: getLocationPara(address)
            }, function (data, json, root, userflag) {
                kdAppSet.setKdLoading(false);
                dealLocationCode(data);
            }, function (code, msg, json, root, userflag) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('网络错误，请稍候再试', '', 3000);
            }
        );
    }

    function render(config) {
        callBack = config.fn || function () {};
        addressInfo = config.addressInfo;
        optType = config.optType;
        addressNum=config.addressNum || 0;
        initView();
        initEditPage(config.addressInfo);
        show();
        var minHeight = $(viewPage).find('.content').height();  // 设置最小高度，确保底部不被顶起
        $(viewPage).find('.content').css('min-height', minHeight);
        scroller.refresh();
    }


    function show() {
        $(viewPage).show();
    }

    function hide() {
        $(viewPage).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();
var AddBuyer = (function () {

    //新增采购员div视图
    var div,
    //微信云之家接口url头部
        urlHeadwx,
    //mob采购员信息存储头部
        urlHead,
    //微信企业号标示
        corpid,
        wxinid,
        managerDeptid,
        list,
        config, hasInit, apiType, lianjie100, guid,
        mode;//0 企业号 1服务号

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-newbuyer');
            var urlinfo=kdAppSet.getUrlInfo();
            urlHeadwx = urlinfo.urlHeadwx;
            lianjie100 = urlinfo.lianjie100;
            urlHead = urlinfo.urlHead;
            apiType = urlinfo.apiType;
            corpid = "";
            wxinid = "";
            managerDeptid = 0;
            mode = 0;
            list = [];
            config = null;
            bindEvents();
            hasInit = true;
        }
    }


    function addNewBuyer() {
        var sourceType = kdAppSet.getAppParam().source;
        if (sourceType == "service") {
            mode = 1;
            addServiceNewBuyer();
        } else {
            mode = 0;
            addCorpNewBuyer();
        }
    }


    //在业务系统中 添加采购员
    function addServiceNewBuyer(showHint) {

        var name = kdShare.trimStr($("#view-newbuyer-name").val());
        var mobile = kdShare.trimStr($("#view-newbuyer-mobile").val());
        if (showHint == undefined) {
            addCtrlHint();
        }

        Lib.API.get('SetBuyer', {para: {
                "mobile": mobile,
                "name": kdAppSet.ReplaceJsonSpecialChar(name),
                "mode": mode,
                "id": guid,
                "opttype": 1}
            },
            function (data, json) {
                removeCtrlHint();
                var Status = data.status;
                var Msg = "";
                if (Status == 0) {
                    //Msg="保存成功";
                    if (mode == 1 && !kdAppSet.isPcBrower()) {
                        //弹出分享指示页面
                        var wxShareMark = $("#wxShareMark");
                        wxShareMark.one("click", function () {
                            $(this).hide();
                            kdShare.backView();
                        });
                        wxShareMark.show();
                        Buyer.wxInviteBuyer(name, mobile);

                    } else if (mode == 0 || kdAppSet.isPcBrower()) {
                        kdShare.backView();
                    }
                    //通知订单列表刷新
                    MiniQuery.Event.trigger(window, 'freshBuyerListInfo', []);
                } else {
                    Msg = data.msg;
                    OptMsg.ShowMsg(Msg);
                }

            }, function (code, msg) {
                removeCtrlHint();
            }, function () {
                removeCtrlHint();
                jAlert(kdAppSet.getAppMsg.workError);
            });

    }


    //在微信企业号以及mob云服务上 添加采购员
    function addCorpNewBuyer() {

        var name = kdShare.trimStr($("#view-newbuyer-name").val());
        var mobile = kdShare.trimStr($("#view-newbuyer-mobile").val());
        var weixin = "";
        var position = "";
        var paradata = config.para;
        var wxinid = paradata.wxinid;

        addCtrlHint();
        var paraObj = {
            name: name,
            department: managerDeptid,
            position: position,
            mobile: mobile,
            weixinid: weixin,
            userid: guid
        };

        if (managerDeptid == 0) {
            getWxUserDeptid(wxinid, true, function () {
                paraObj.department = managerDeptid;
                addWxUser(paraObj, function () {
                    addServiceNewBuyer(0);
                });
            });
        } else {
            addWxUser(paraObj, function () {
                addServiceNewBuyer(0);
            });
        }
    }


    function checkUserInput() {

        var name = kdShare.trimStr($("#view-newbuyer-name").val());
        if (name == "") {
            jAlert("姓名不能为空!");
            return false;
        }
        var mobile = kdShare.trimStr($("#view-newbuyer-mobile").val());
        mobile = kdShare.getPureNumber(mobile);
        $("#view-newbuyer-mobile").val(mobile);

        if (mobile == "") {
            jAlert("手机号不能为空!");
            return false;
        } else {
            var check = /^(1[0-9]{10})$/;
            if (!check.test(mobile)) {
                jAlert("请输入正确手机号!");
                return false;
            }
        }
        return true;
    }

    function initInput() {
        $("#view-newbuyer-name").val("");
        $("#view-newbuyer-mobile").val("");
    }

    function bindEvents() {
        $("#view-newbuyer").delegate('.btnadd span', {
            'click': function () {
                if (!isCommitting()) {
                    if (checkUserInput()) {
                        addNewBuyer();
                    }
                }
                return false;
            },
            'touchstart': function () {
                $(this).addClass('kd_fullRedBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('kd_fullRedBtn_touched');
            }
        });
        textFill($(".new input"));
    }

    function textFill(input) {
        input.focus(function () {
            $(this).parent().css({border: '1px solid #FF753E'});
        });
        input.blur(function () {
            $(this).parent().css({border: '1px solid #d3d5d8'});
        });
    }


    function addCtrlHint() {
        setInputReadOnly(true);
        var hintstr = '<div class="hintflag">' + Lib.LoadingTip.get() + '</div>';
        $(".newbuyer .btnadd").append(hintstr);
        $(".newbuyer .hintflag .loading-text").text("正在提交数据...");
    }

    function removeCtrlHint() {
        setInputReadOnly(false);
        $(".newbuyer .btnadd .hintflag").remove();
    }

    function isCommitting() {
        var inum = $(".newbuyer .btnadd .hintflag").length;
        if (inum > 0) {
            OptMsg.ShowMsg('正在提交数据，请稍后!');
            return true;
        } else {
            return false;
        }
    }

    function setInputReadOnly(bflag) {
        if (bflag) {
            $("#view-newbuyer-name").attr("readonly", "readonly");
            $("#view-newbuyer-mobile").attr("readonly", "readonly");
        } else {
            $("#view-newbuyer-name").removeAttr("readonly");
            $("#view-newbuyer-mobile").removeAttr("readonly");
        }
    }

    function render(pconfig) {
        initView();
        config = pconfig;
        corpid = config.para.corpid;
        wxinid = config.para.wxinid;
        managerDeptid = config.para.managerDeptid;
        if (managerDeptid == 0) {
            getWxUserDeptid(wxinid, false, null);
        }
        show();
        guid = kdShare.guid();
        initInput();
        // 动态加载分享提示图片
        var wxShareMark = $("#wxShareMark");
        wxShareMark.addClass('sprite-share_prompt');
        var minHeight = $(div).height();  // 设置最小高度，确保底部不被顶起
        $(div).css('min-height', minHeight);
    }


    function addWxUser(paraObj, fn) {
        //新增部门成员

        var addUserUrl = urlHeadwx + '/weixin/user/create';
        var email = "";
        if (apiType == 1) {
            addUserUrl = urlHeadwx + 'member/create' + lianjie100;
            email = $.String.random(12) + "kdemail@qq.com";
        }

        var userid = paraObj.userid;
        var name = paraObj.name;
        var department = "[" + paraObj.department + "]";
        var position = paraObj.position;
        var mobile = paraObj.mobile;
        var weixinid = paraObj.weixinid;
        var gender = "0";
        var tel = "";

        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '","name":"' + name + '","department":' + department
            + ',"position":"' + position + '","mobile":"' + mobile + '","gender":"' + gender + '","tel":"' + tel
            + '","email":"' + email + '","weixinid":"' + weixinid + '"' + '}';

        $.ajax({
            type: "POST",
            async: true,
            url: addUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                removeCtrlHint();
                if (jsonObj.errcode != 0) {

                    if (jsonObj.errcode == 60104) {
                        jAlert("手机号已被使用!");
                    } else if (jsonObj.errcode == 60108) {
                        jAlert("微信号已被使用!");
                    } else {
                        var errmsg = jsonObj.errmsg;
                        if (apiType == 1) {
                            errmsg = jsonObj.description;
                        }
                        jAlert(errmsg);
                    }

                } else {
                    fn & fn();
                }
            },
            error: function (errMsg) {
                removeCtrlHint();
                jAlert(JSON.stringify(errMsg));
            }
        });

    }


    function getWxUserDeptid(userid, bhint, fn) {

        var addUserUrl = urlHeadwx + '/weixin/user/get';
        if (apiType == 1) {
            addUserUrl = urlHeadwx + 'member/get' + lianjie100;
        }

        var userid = config.para.wxinid;
        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '"' + '}';

        $.ajax({
            type: "POST",
            async: true,
            url: addUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                if (jsonObj.errcode == 0) {
                    var deptid = 0;
                    if (apiType == 1) {
                        deptid = jsonObj.data.groupid[0] || 0;
                    } else {
                        deptid = jsonObj.department["0"];
                    }
                    managerDeptid = deptid;
                    if (bhint) {
                        fn & fn();
                    }
                } else {
                    var errMsg = jsonObj.errmsg;
                    removeCtrlHint();
                    if (bhint) {
                        fn & fn();
                        jAlert("获取采购员主管部门信息出错" + errMsg);
                    }
                }
            },
            error: function () {
                removeCtrlHint();
                if (bhint) {
                    jAlert("调用采购员主管部门信息出错");
                }
            }
        });
    }

    function show() {
        $(div).show();
        var sourceType = kdAppSet.getAppParam().source;
        if (sourceType == "service") {
            var phoneUrl = "&sharePhoneNum=-1";
            kdAppSet.wxShareInfo({link: phoneUrl});
        }
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
            $("#wxShareMark").click();
        }
    };


})();
;
var Buyer = (function () {
    //采购员列表div视图
    var div,
        divlist, ul , sample, scroller,
        ullist,
    //微信云之家接口url头部
        urlHeadwx,
    //mob采购员信息存储头部
        urlHead,
        corpid,
    //微信企业号账号ID
        wxinid,
    //连接100调用id
        lianjie100,
        managerDeptid,
        list, hasInit,
    //标示 是服务号（service），还是企业号
        sourceType, typeName, apiType;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-buyer');
            divlist = document.getElementById('div-buyer-List');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            corpid = kdAppSet.getAppParam().corpid;
            wxinid = kdAppSet.getAppParam().openid;
            managerDeptid = 0;
            list = [];
            urlHeadwx = kdAppSet.getUrlInfo().urlHeadwx;
            lianjie100 = kdAppSet.getUrlInfo().lianjie100;
            urlHead = kdAppSet.getUrlInfo().urlHead;
            apiType = kdAppSet.getUrlInfo().apiType;
            typeName = "企业号";
            sourceType = kdAppSet.getAppParam().source;
            if (sourceType == "service") {
                typeName = "服务号";
            }
            initScroll();
            bindEvents();
            hasInit = true;
        }
    }

    function initScroll(){
        scroller = Lib.Scroller.create(divlist);
        var option = {
            hinttop: 1.2,
            fnfresh: function (reset) {
                getBuyerList();
                reset();
            },
            hintbottom: -0.4
        };
        kdctrl.initkdScroll(scroller, option);
    }

    //获取采购员列表
    function getBuyerList() {
        loadingHint();
        getServiceBuyerList();
    }

    function getServiceBuyerList() {

        Lib.API.get('GetBuyerList', {para: {}},
            function (data, json) {
                list = data;
                $(".buyernum #buyernum").text(data.length);
                fill(data);
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }


    function fill(datalist) {

        var listStr = $.Array.keep(datalist, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                phone: item.mobile,
                verify: item.verifyFlag == 0 ? "邀请加入" : "已激活",
                classname: item.verifyFlag == 0 ? "invitebuyer" : "invitedbuyer",
                style: sourceType == "service" ? "" : "display:none",
                index: index
            });
        }).join('');

        removeHint();

        if (datalist.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        scroller.refresh();
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }



    function bindEvents() {

        //刷新采购员列表
        MiniQuery.Event.bind(window, {
            'freshBuyerListInfo': function () {
                getBuyerList();
            }
        });

        $(ul).delegate('li[index]', {
            'click': function (event) {
                if (event.target.className == "invitebuyer") {
                    return;
                }
                var index = $(this).attr("index");
                var objclick = list[index];
                var eid = kdAppSet.getAppParam().eid;
                var objPara = {corpid: corpid, wxinid: wxinid, eid: eid, managerDeptid: managerDeptid};
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['EditBuyer', {para: objPara, objclick: objclick}]);
            },
            'touchstart': function (event) {
                if (event.target.className == "invitebuyer") {
                    return;
                }
                $(this).addClass('onclick');
            },
            'touchend': function (event) {
                if (event.target.className == "invitebuyer") {
                    return;
                }
                $(this).removeClass('onclick');
            }
        });

        $(".addbuyer").bind("click", function () {
            var eid = kdAppSet.getAppParam().eid;
            var objPara = {corpid: corpid, wxinid: wxinid, eid: eid, managerDeptid: managerDeptid};
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['AddBuyer', {para: objPara}]);
        }).on(kdShare.clickfn());


        $("#div-buyer-List").delegate('.invitebuyer', {
            'click': function (event) {
                var index = $(this).parent().parent().attr("index");
                var mobile = list[index].mobile;
                var name = list[index].name;
                if (mobile == "") {
                    mobile = -1;
                }
                wxInviteBuyer(name, mobile);
                showWxShare();
                return true;
            },
            'touchstart': function () {
                $(this).addClass('invitebuyer_touched');
            },
            'touchend': function () {
                $(this).removeClass('invitebuyer_touched');
            }
        });
    }

    function wxInviteBuyer(name, mobile) {
        var desc = "(待验证)手机号码: " + mobile;
        var inviteMsg = kdAppSet.getUserInfo().contactName + "邀请" + name;
        var phoneUrl = "&sharePhoneNum=" + mobile + "&sharePhoneMsg=" + encodeURI(inviteMsg);
        var title = inviteMsg + "加入" + kdAppSet.getUserInfo().cmpInfo.name + "微订货平台";

        kdAppSet.wxShareInfo({
            title: title,
            desc: desc,
            link: phoneUrl,
            imgUrl: ""
        });
    }

    function showWxShare() {
        var wxShareMark = $("#wxShareMark");
        wxShareMark.addClass('sprite-share_prompt');
        wxShareMark.one("click", function () {
            $(this).hide();
        });
        wxShareMark.show();
    }

    function render() {
        initView();
        show();
        getBuyerList();
    }


    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');
    }


    function show(back) {
        $(div).show();
        if (back != undefined) {
            getBuyerList();
        }
    }

    return {
        render: render,
        show: show,
        hide: function (back) {
            $(div).hide();
            kdAppSet.wxShareInfo({});
            $("#wxShareMark").click();
        },
        wxInviteBuyer: wxInviteBuyer
    };


})();
var EditBuyer = (function () {

    //编辑采购员div视图
    var div,
    //微信云之家接口url头部
        urlHeadwx,
    //mob采购员信息存储头部
        urlHead,
    //微信企业号标示
        corpid,
        wxinid,
        managerDeptid,
        config, hasInit,
        sourceType, apiType, lianjie100,
    //0 企业号 1服务号;
        mode;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-editbuyer');
            urlHeadwx = kdAppSet.getUrlInfo().urlHeadwx;
            lianjie100 = kdAppSet.getUrlInfo().lianjie100;
            urlHead = kdAppSet.getUrlInfo().urlHead;
            apiType = kdAppSet.getUrlInfo().apiType;
            sourceType = kdAppSet.getAppParam().source;
            corpid = "";
            wxinid = "";
            managerDeptid = 0;
            config = null;
            mode = 0;
            bindEvents();
            hasInit = true;
        }
    }


    function updateCorpBuyer() {

        var name = kdShare.trimStr($(".editbuyer .new #name").val());
        var mobile = kdShare.trimStr($(".editbuyer .new #mobile").val());
        var weixin = "";
        var position = "";

        var paradata = config.para;
        var wxinid = paradata.wxinid;
        var guid = config.objclick.ID;

        var paraObj = {
            name: name,
            department: managerDeptid,
            position: position,
            mobile: mobile,
            weixinid: weixin,
            userid: guid
        };

        if (managerDeptid == 0) {
            getWxUserDeptid(wxinid, true, function () {
                paraObj.department = managerDeptid;
                updateWxUser(paraObj, function () {
                    updateServiceBuyer(0);
                });
            });
        } else {
            updateWxUser(paraObj, function () {
                updateServiceBuyer(0);
            });
        }
    }

    function updateServiceBuyer(showHint) {

        var name = kdShare.trimStr($(".editbuyer .new #name").val());
        var mobile = kdShare.trimStr($(".editbuyer .new #mobile").val());
        var id = config.objclick.ID;
        if (showHint == undefined) {
            addCtrlHint();
        }

        Lib.API.get('SetBuyer', {
                para: {
                    "mobile": mobile,
                    "name": kdAppSet.ReplaceJsonSpecialChar(name),
                    "mode": mode,
                    "id": id,
                    "opttype": 2}
            },
            function (data, json) {
                removeCtrlHint();
                var Status = data.status;
                if (Status == 0) {
                    MiniQuery.Event.trigger(window, 'backview');
                } else {
                    var Msg = data.msg;
                    OptMsg.ShowMsg(Msg);
                }
            }, function (code, msg) {
                removeCtrlHint();
                jAlert(msg, 1000);
            }, function () {
                removeCtrlHint();
                jAlert(kdAppSet.getAppMsg.workError);
            });
    }


    function updateBuyer() {

        if (sourceType == "service") {
            mode = 1;
            updateServiceBuyer();
        } else {
            mode = 0;
            updateCorpBuyer();
        }
    }


    //删除微信服务号添加的采购员
    function deleteServiceBuyer(showhint) {

        var id = config.objclick.ID;
        if (showhint == undefined) {
            addCtrlHint();
        }

        Lib.API.get('SetBuyer', {
                para: {
                    "id": id,
                    "opttype": 0}
            },
            function (data, json) {
                removeCtrlHint();
                var Status = data.status;
                if (Status == 0) {
                    MiniQuery.Event.trigger(window, 'backview');
                } else {
                    var Msg = data.msg;
                    OptMsg.ShowMsg(Msg);
                }
            }, function () {
                removeCtrlHint();
            }, function () {
                removeCtrlHint();
            });
    }

    //删除微信企业号添加的采购员
    function deleteCorpBuyer() {
        var account = config.objclick.ID;
        deleteWxUser(account, function () {
            deleteServiceBuyer(0);
        });
    }

    function deleteBuyer() {
        if (sourceType == "service") {
            deleteServiceBuyer();
        } else {
            deleteCorpBuyer();
        }
    }


    function deleteWxUser(account, fn) {
        //新增部门成员
        var deleteUserUrl = urlHeadwx + '/weixin/user/delete';
        if (apiType == 1) {
            deleteUserUrl = urlHeadwx + 'member/del' + lianjie100;
        }
        var userid = config.objclick.ID;
        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '"}';
        $.ajax({
            type: "POST",
            async: true,
            url: deleteUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                removeCtrlHint();
                if (jsonObj.errcode != 0) {
                    jAlert(jsonObj.errmsg);
                } else {
                    fn & fn();
                }
            },
            error: function (errMsg) {
                removeCtrlHint();
                alert(JSON.stringify(errMsg));
            }
        });

    }

    function checkUserInput() {

        var name = kdShare.trimStr($(".editbuyer .new #name").val());
        if (name == "") {
            jAlert("姓名不能为空!");
            return false;
        }
        var mobile = kdShare.trimStr($(".editbuyer .new #mobile").val());

        mobile = kdShare.getPureNumber(mobile);
        $(".editbuyer .new #mobile").val(mobile);

        if (mobile == "") {
            jAlert("手机号不能为空!");
            return false;
        } else {
            var check = /^(1[0-9]{10})$/;
            if (!check.test(mobile)) {
                jAlert("请输入正确手机号!");
                return false;
            }
        }

        return true;
    }

    function initInput() {

        var objclick = config.objclick;
        $(".editbuyer .new #name").val(objclick.name);
        $(".editbuyer .new #mobile").val(objclick.mobile);
    }


    function addCtrlHint() {
        setInputReadOnly(true);
        var hintstr = '<div class="hintflag">' + Lib.LoadingTip.get() + '</div>';
        $(".editbuyer .ctrlpan").append(hintstr);
        $(".editbuyer .hintflag .loading-text").text("正在提交数据...");
    }

    function removeCtrlHint() {
        setInputReadOnly(false);
        $(".editbuyer .ctrlpan .hintflag").remove();
    }

    function isCommitting() {
        var inum = $(".editbuyer .ctrlpan .hintflag").length;
        if (inum > 0) {
            OptMsg.ShowMsg('正在提交数据，请稍后!');
            return true;
        } else {
            return false;
        }
    }

    function setInputReadOnly(bflag) {
        if (bflag) {
            $(".editbuyer .new #name").attr("readonly", "readonly");
            $(".editbuyer .new #mobile").attr("readonly", "readonly");
        } else {
            $(".editbuyer .new #name").removeAttr("readonly");
            $(".editbuyer .new #mobile").removeAttr("readonly");
        }
    }


    function bindEvents() {


        $(".editbuyer .btndelete ").bind("click", function () {

            if (!isCommitting()) {
                deleteBuyerInfo();
            }

        }).on(kdShare.clickfnCss(null, {color: '#DF1515'}, {color: '#FF3F3F'}));

        $(".editbuyer .btnok ").bind("click", function () {

            if (!isCommitting()) {
                updateBuyerInfo();
            }
        }).on(kdShare.clickfnCss(null, {background: '#EF5215'}, {background: '#FF6427'}));

        textFill($(".new input"));
    }

    function textFill(input) {

        input.focus(function () {
            $(this).parent().css({border: '1px solid #FF753E'});
        });

        input.blur(function () {
            $(this).parent().css({border: '1px solid #d3d5d8'});
        });
    }

    function updateBuyerInfo() {

        if (checkUserInput()) {
            updateBuyer();
        }

    }

    function deleteBuyerInfo() {

        jConfirm("你确定要删除当前采购员?", null, function (flag) {
            if (flag) {
                deleteBuyer();
            }
        }, {ok: "确定", no: "取消"});
    }


    function render(pconfig) {
        initView();
        config = pconfig;
        corpid = config.para.corpid;
        wxinid = config.para.wxinid;
        managerDeptid = config.para.managerDeptid;
        if (managerDeptid == 0) {
            getWxUserDeptid(wxinid, false, null);
        }
        show();
        initInput();

        if (sourceType == "service") {
            var mobile = config.objclick.mobile;
            var name = config.objclick.name;
            Buyer.wxInviteBuyer(name, mobile);
        }
    }


    function updateWxUser(paraObj, fn) {
        //更新部门成员
        var updateUserUrl = urlHeadwx + '/weixin/user/update';
        var email = "";
        if (apiType == 1) {
            updateUserUrl = urlHeadwx + 'member/update' + lianjie100;
            email = $.String.random(12) + "kdemail@qq.com";
        }

        var userid = paraObj.userid;
        var name = paraObj.name;
        var department = "[" + paraObj.department + "]";
        var position = paraObj.position;
        var mobile = paraObj.mobile;
        var weixinid = paraObj.weixinid;
        var gender = "0";
        var tel = "";


        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '","name":"' + name + '","department":' + department
            + ',"position":"' + position + '","mobile":"' + mobile + '","gender":"' + gender + '","tel":"' + tel
            + '","email":"' + email + '","weixinid":"' + weixinid + '"' + '}';

        $.ajax({
            type: "POST",
            async: true,
            url: updateUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                if (jsonObj.errcode != 0) {

                    removeCtrlHint();

                    if (jsonObj.errcode == 60104) {
                        jAlert("手机号已被使用!");
                    } else if (jsonObj.errcode == 60108) {
                        jAlert("微信号已被使用!");
                    } else {
                        var errmsg = jsonObj.errmsg;
                        if (apiType == 1) {
                            errmsg = jsonObj.description;
                        }
                        jAlert(errmsg);
                    }
                } else {
                    fn & fn();
                }
            },
            error: function (errMsg) {
                removeCtrlHint();
                alert(JSON.stringify(errMsg));
            }
        });
    }


    function getWxUserDeptid(userid, bhint, fn) {

        var addUserUrl = urlHeadwx + '/weixin/user/get';
        if (apiType == 1) {
            addUserUrl = urlHeadwx + 'member/get' + lianjie100;
        }
        var userid = config.para.wxinid;
        var paramData = '{"corpid":"' + corpid + '","userid":"' + userid + '"' + '}';

        $.ajax({
            type: "POST",
            async: true,
            url: addUserUrl,
            data: paramData,
            dataType: 'json',
            success: function (jsonObj) {
                if (jsonObj.errcode == 0) {
                    var deptid = 0;
                    if (apiType == 1) {
                        deptid = jsonObj.data.groupid[0] || 0;
                    } else {
                        deptid = jsonObj.department["0"];
                    }
                    managerDeptid = deptid;
                    if (bhint) {
                        fn & fn();
                    }
                } else {
                    var errMsg = jsonObj.errmsg;
                    removeCtrlHint();
                    if (bhint) {
                        fn & fn();
                        jAlert("获取采购员主管部门信息出错" + errMsg);
                    }
                }
            },
            error: function (errMsg) {
                removeCtrlHint();
                if (bhint) {
                    jAlert("调用采购员主管部门信息出错");
                }
            }
        });
    }


    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();
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
var Invoice = (function () {
    var div ,sample, invoice_list,config, viewPage,invoiceInfo,hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_invoice');
            invoice_list=document.getElementById('invoice_list');
            sample= $.String.between(invoice_list.innerHTML, '<!--', '-->');
            viewPage=$(div);
            bindEvents();
            hasInit = true;
        }
    }

    //刷新页面
    function freshInvoice(info){
        invoice_list.innerHTML= $.String.format(sample, {
            name: info.name,
            mobile: info.mobile,
            address: info.address
        });
        $('#invoice_head').val(invoiceInfo.invoiceHead);
    }

    function bindEvents() {

        viewPage.delegate('.address ul', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['AddressList', {
                    mode: 'select',
                    //addressInfo: addressInfo,
                    fnselect: function (data) {
                        invoiceInfo = {
                            name: data.name,
                            mobile: data.mobile,
                            address: data.addressdetail
                        };
                        invoiceInfo.invoiceHead=$('#invoice_head').val();
                        freshInvoice(invoiceInfo);
                    }
                }]);
            },
            'touchstart': function () {
                $(this).addClass('touched');
            },
            'touchend': function () {
                $(this).removeClass('touched');
            }
        });

        viewPage.delegate('#invoice_ok', {
            'click': function () {
                invoiceInfo.invoiceHead=$('#invoice_head').val();
                config.fnselect && config.fnselect(invoiceInfo);
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('');
            },
            'touchend': function () {
                $(this).removeClass('');
            }
        });


    }


    function render(configp) {
        initView();
        config=configp;
        invoiceInfo=configp.Invoice;
        freshInvoice(invoiceInfo);
        show();
    }

    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();
/*库存不足商品列表*/

var LowStock = (function () {

    var viewPage , listitemarea, goodsitemlist, samples;
    var scroller ,
    //库存不足商品列表
        goodsListArr,
        dlist,
        config,
    // 0  无辅助属性  1 组合物料  2 有辅助属性
        attrType = {
            noAttr: 0,
            cmbAttr: 1,
            soleAttr: 2
        },
    //删除的商品
        deleteList,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = document.getElementById('viewid_lowstocklist');
            listitemarea = document.getElementById('lowstocklistdiv');
            scroller = Lib.Scroller.create(listitemarea);
            goodsitemlist = document.getElementById('lowstocklistul');
            samples = $.String.getTemplates(viewPage.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                }
            ]);
            deleteList = [];
            goodsListArr = [];
            goodsitemlist.innerHTML = '';
            dlist = [];
            bindEvents();
            hasInit = true;
        }
    }


    //获取缓存中的商品列表,并判断是否缺少库存
    function getGoodsData() {
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist != "") {
            goodsListArr = JSON.parse(goodslist);
            var inum = goodsListArr.length;
            var lowlist = config.itemlist;
            for (var i = inum - 1; i >= 0; i--) {
                var attrList = goodsListArr[i].attrList;
                var jnum = attrList.length;
                var auxtype = goodsListArr[i].auxtype;
                for (var j = jnum - 1; j >= 0; j--) {
                    if (auxtype == attrType.noAttr) {
                        getLockStock(attrList, j, goodsListArr[i].itemid, 0, lowlist);
                    } else if (auxtype == attrType.cmbAttr) {
                        //合并商品
                        getLockStock(attrList, j, attrList[j].fitemid, attrList[j].fauxid, lowlist);
                    } else if (auxtype == attrType.soleAttr) {
                        //有辅助属性
                        getLockStock(attrList, j, goodsListArr[i].itemid, attrList[j].fauxid, lowlist);
                    }
                }
                if (attrList.length == 0) {
                    goodsListArr.splice(i, 1);
                }
            }
        }
        refreshdata(goodsListArr);
        scroller.refresh();
    }

    //获取库存不足的商品     lowlist 要检测的数据列表
    function getLockStock(attrList, j, itemid, auxid, lowlist) {
        var check = checkItemLowStock(itemid, auxid, lowlist);
        if (!check.lack) {
            attrList.splice(j, 1);
        } else {
            var num = parseInt(check.qty);
            num = (num <= 0 ? 0 : num);
            attrList[j].maxnum = num;
        }
    }

    //删除库存不足的商品     lowlist 要检测的数据列表
    function deleteLockStock(attrList, j, itemid, auxid, lowlist) {
        var check = checkItemLowStock(itemid, auxid, lowlist);
        if (check.lack) {
            attrList.splice(j, 1);
        }
    }

    //修改库存不足的商品数量     lowlist 要检测的数据列表
    function modidyLockStock(attrListInfo, k, itemid, auxid, lowlist) {
        var list = lowlist;
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            var attrList = list[i].attrList;
            var auxtype = list[i].auxtype;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (auxtype == attrType.noAttr) {
                    if (list[i].itemid == itemid) {
                        attrListInfo[k].num = attrList[j].num;
                        return;
                    }
                } else if (auxtype == attrType.cmbAttr) {
                    //合并商品
                    if (attrList[j].fitemid == itemid && attrList[j].fauxid == auxid) {
                        attrListInfo[k].num = attrList[j].num;
                        return;
                    }
                } else if (auxtype == attrType.soleAttr) {
                    //有辅助属性
                    if (list[i].itemid == itemid && attrList[j].fauxid == auxid) {
                        attrListInfo[k].num = attrList[j].num;
                        return;
                    }
                }
            }
        }
    }

    //判断是否缺少库存 lack=true 标示库存不足 qty 库存剩余数量
    function checkItemLowStock(itemid, auxid, lowlist) {
        var list = lowlist;
        var flag = false;
        var qty = 0;
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].fitemid == itemid && list[i].fauxid == auxid) {
                flag = true;
                qty = list[i].fqty || 0;
                break;
            }
        }
        return {
            lack: flag,
            qty: qty
        };
    }

    //刷新商品列表数据
    function refreshdata(data, pindex) {

        goodsitemlist.innerHTML = $.Array.map(data, function (item, pindex) {
            var attrList = [];
            var listObj = item.attrList;
            var attrsum = 0;
            var itmp;
            for (var attr in listObj) {
                attrList.push(listObj[attr]);
                attrsum = kdShare.calcAdd(attrsum, Number(listObj[attr].num));
                itmp = kdShare.calcMul(Number(listObj[attr].num), Number(listObj[attr].price));
            }
            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : item.img,
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                'rows': $.Array.map(attrList, function (row, index) {
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            maxnum: row.maxnum,
                            attrIndex: index,
                            attrPindex: pindex,
                            stockunit: item.unitname,
                            attrnum: row.num
                        });
                    }
                ).join('')
            });
        }).join('');
        scroller.refresh();
    }


    function bindEvents() {

        //图片点击事件
        $(goodsitemlist).delegate('.itemlist-li-top-left', {
            'click': function () {
                kdShare.Image.setBigImage($(this));
                return false;
            }
        });

        //商品列表行 点击视觉效果处理
        $(goodsitemlist).delegate('.itemlist-li-top', {
            'touchstart': function (event) {
                if (event.target.nodeName == "IMG") {
                    return;
                }
                var ctrlp = $(this).parent();
                ctrlp.children('li').css('background', '#fff');
                ctrlp.css('background', '#d9dadb');
                ctrlp.find('.attrRow').css('background', '#d9dadb');
                ctrlp.find(".itemlist-num").css('background', '#fff');
                ctrlp.find(".itemlist-li-top-left").css('background', '#fff');

            }, 'touchend': function (event) {
                if (event.target.nodeName == "IMG") {
                    return;
                }
                var ctrlp = $(this).parent();
                ctrlp.css('background', '#fff');
                ctrlp.find('.attrRow').css('background', '#fff');
            }
        });

        //商品明细 点击视觉效果处理
        $(goodsitemlist).delegate('.attrname', {
            'touchstart': function () {
                var ctrlP = $(this).parent();
                ctrlP.css('background', '#d9dadb');
                ctrlP.find(".attrDelete").css('background', '#fff');
            }, 'touchend': function () {
                $(this).parent().css('background', '#fff');
            }
        });

        //商品删除
        $(goodsitemlist).delegate(".goodsRowDel", {
            'click': function () {
                var iindex = this.getAttribute("index");
                var ctrlP = $("#lowstocklistul li[index=" + iindex + "]");
                ctrlP.animate({left: "-320px"}, 500, function () {
                    setDeleteGoods(0, goodsListArr[iindex], 0);
                    goodsListArr.splice(iindex, 1);
                    refreshdata(goodsListArr);
                });
                hideOptMenu();
                return false;
            },
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            }
        });

        //商品明细删除
        $(goodsitemlist).delegate(".attrRowDel", {
            'click': function () {
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var ctrlp = $("#lowstocklistul .attrRow[attrindex=" + iindex + "][attrpindex=" + pindex + "]");
                var attrList = goodsListArr[pindex].attrList;
                setDeleteGoods(1, goodsListArr[pindex], iindex);

                attrList.splice(iindex, 1);
                goodsListArr[pindex].attrList = attrList;
                ctrlp.animate({left: "-320px"}, 500, function () {
                    if (attrList.length == 0) {
                        ctrlp = $("#lowstocklistul li[index=" + pindex + "]");
                        ctrlp.animate({left: "-320px"}, 500, function () {
                            goodsListArr.splice(pindex, 1);
                            refreshdata(goodsListArr);
                        });
                    } else {
                        refreshdata(goodsListArr, pindex);
                    }
                });
                hideOptMenu();
                return false;
            },
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            }
        });


        //商品数量点击  键盘事件
        $(goodsitemlist).delegate(".attrnum", {
            'click': function () {
                var target = $(this).children('input');
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var attrList = goodsListArr[pindex].attrList;
                var attrname = attrList[iindex].name;
                var config = {
                    name: attrname,
                    input: target.val(),
                    maxnum: attrList[iindex].maxnum,
                    maxhint: "数量不能超过库存数 ",
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.val(1);
                            attrList[iindex].num = 1;
                        }
                        else {
                            target.val(kvalue);
                            attrList[iindex].num = Number(kvalue);
                        }
                    }
                };
                kdShare.keyBoard.autoshow(config);
                hideOptMenu();
                return false;
            }
        });


        $('#lowstock_opt').delegate('',
            {
                'click': function () {
                    var btnlist = $(viewPage).find('.lowstockbtnlist');
                    if (btnlist.css('display') == 'none') {
                        btnlist.show();
                        $(this).addClass('optstock_s');
                        $(this).find('span').removeClass('sprite-open');
                        $(this).find('span').addClass('sprite-open_s');
                    } else {
                        btnlist.hide();
                        $(this).removeClass('optstock_s');
                        $(this).find('span').removeClass('sprite-open_s');
                        $(this).find('span').addClass('sprite-open');
                    }
                },
                'touchstart': function () {
                },
                'touchend': function () {
                }
            }
        );

        $('#lowstock_save').delegate('',
            {
                'click': function () {
                    saveDealInfo();
                    hideOptMenu();
                },
                'touchstart': function () {
                    $(this).css({background: '#ef5215'});
                },
                'touchend': function () {
                    $(this).css({background: '#ff6427'});
                }
            }
        );
        $('.lowstockbtnlist').delegate('li',
            {
                'click': function () {
                    var cname = this.id;
                    //剩多少买多少
                    if (cname == 'lowstock_saleleft') {
                        buyAllStockLeft();
                        //删除库存不足商品
                    } else if (cname == 'lowstock_delete') {
                        deleteAllLowStock();
                    }
                    hideOptMenu();
                },
                'touchstart': function () {
                    $(this).find('span').css({background: '#e3e3e3'});
                },
                'touchend': function () {
                    $(this).find('span').css({background: '#fff'});
                }
            }
        );
    }

    function hideOptMenu() {
        $(viewPage).find('.lowstockbtnlist').hide();
    }

    function deleteGoodsItem(auxtype,goodslistItem,attrListItem){
        var itemid = 0;
        var auxid = 0;
        if (auxtype == attrType.noAttr) {
            itemid = goodslistItem.itemid;
            auxid = 0;
        } else if (auxtype == attrType.cmbAttr) {
            //合并商品
            itemid = attrListItem.fitemid;
            auxid = attrListItem.fauxid;
        } else if (auxtype == attrType.soleAttr) {
            //有辅助属性
            itemid = goodslistItem.itemid;
            auxid = attrListItem.fauxid;
        }
        deleteList.push({
            fitemid: Number(itemid),
            fauxid: Number(auxid)
        });
    }

    //设置 删除商品的 itemid 与 auxid
    function setDeleteGoods(type, goodslistItem, index) {

        var auxtype = goodslistItem.auxtype;
        var attrList = goodslistItem.attrList;
        if (type == 1) {
            //删除明细
            deleteGoodsItem(auxtype,goodslistItem,attrList[index]);
        } else if (type == 0) {
            //删除商品
            var inum = attrList.length;
            for (var i = 0; i < inum; i++) {
                deleteGoodsItem(auxtype,goodslistItem,attrList[i]);
            }
        }
    }

    //库存不足 有多少买多少
    function buyAllStockLeft() {
        var inum = goodsListArr.length;
        for (var i = inum-1; i >=0; i--) {
            var attrList = goodsListArr[i].attrList;
            var auxtype = goodsListArr[i].auxtype;
            var jnum = attrList.length;
            for (var j = jnum-1; j >=0; j--) {
                attrList[j].num = attrList[j].maxnum;
                 if(attrList[j].num==0){
                     deleteGoodsItem(auxtype,goodsListArr[i],attrList[j]);
                     attrList.splice(j, 1);
                 }
            }
            if (attrList.length == 0) {
                goodsListArr.splice(i, 1);
            }
        }
        refreshdata(goodsListArr);
        OptMsg.ShowMsg("商品购买数量已改为库存数<br>并且删除了库存为0的商品", '', 2000);
    }

    //删除库存不足的商品
    function deleteAllLowStock() {
        var inum = goodsListArr.length;
        for (var i = inum - 1; i >= 0; i--) {
            var attrList = goodsListArr[i].attrList;
            var auxtype = goodsListArr[i].auxtype;
            var jnum = attrList.length;
            for (var j = jnum - 1; j >= 0; j--) {
                if (attrList[j].num == 0 || attrList[j].num > attrList[j].maxnum) {
                    deleteGoodsItem(auxtype,goodsListArr[i],attrList[j]);
                    attrList.splice(j, 1);
                }
            }
            if (attrList.length == 0) {
                goodsListArr.splice(i, 1);
            }
        }
        refreshdata(goodsListArr);
        OptMsg.ShowMsg("库存不足的商品已删除", '', 2000);
    }

    //保存商品处理结果 到购物车
    function saveDealInfo() {
        //先检测是否存在库存不足的商品
        if (checkLowGoods()) {
            OptMsg.ShowMsg('存在库存不足的商品，请处理', '', 2000);
            return;
        }

        //再处理被删除的商品
        //获取购物车中的商品
        var goodsListSrc = [];
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist != "") {
            goodsListSrc = JSON.parse(goodslist);
        }
        dealDeleteGoods(goodsListSrc, deleteList);

        //最后处理 修改数量的商品
        dealModifyGoods(goodsListSrc, goodsListArr);

        //保存数据到购物车中
        var newGoodslist = JSON.stringify(goodsListSrc);
        kdShare.cache.setCacheData(newGoodslist, kdAppSet.getGoodslistFlag());

        //通知购物车 以及订单提交页面 刷新
        MiniQuery.Event.trigger(window, 'freshCacheListInfo', []);
        MiniQuery.Event.trigger(window, 'freshCacheOrderListInfo', []);
        kdShare.backView();
    }

    //处理被删除的商品
    function dealDeleteGoods(ListSrc, ListDelete) {
        var inum = ListSrc.length;
        for (var i = inum - 1; i >= 0; i--) {
            var attrList = ListSrc[i].attrList;
            var jnum = attrList.length;
            var auxtype = ListSrc[i].auxtype;
            for (var j = jnum - 1; j >= 0; j--) {
                if (auxtype == attrType.noAttr) {
                    deleteLockStock(attrList, j, ListSrc[i].itemid, 0, deleteList);
                } else if (auxtype == attrType.cmbAttr) {
                    //合并商品
                    deleteLockStock(attrList, j, attrList[j].fitemid, attrList[j].fauxid, deleteList);
                } else if (auxtype == attrType.soleAttr) {
                    //有辅助属性
                    deleteLockStock(attrList, j, ListSrc[i].itemid, attrList[j].fauxid, deleteList);
                }
            }
            if (attrList.length == 0) {
                ListSrc.splice(i, 1);
            }
        }
    }

    //处理 修改数量的商品
    function dealModifyGoods(ListSrc, ListAttr) {
        var inum = ListSrc.length;
        for (var i = inum - 1; i >= 0; i--) {
            var attrList = ListSrc[i].attrList;
            var jnum = attrList.length;
            var auxtype = ListSrc[i].auxtype;
            for (var j = jnum - 1; j >= 0; j--) {
                if (auxtype == attrType.noAttr) {
                    modidyLockStock(attrList, j, ListSrc[i].itemid, 0, ListAttr);
                } else if (auxtype == attrType.cmbAttr) {
                    //合并商品
                    modidyLockStock(attrList, j, attrList[j].fitemid, attrList[j].fauxid, ListAttr);
                } else if (auxtype == attrType.soleAttr) {
                    //有辅助属性
                    modidyLockStock(attrList, j, ListSrc[i].itemid, attrList[j].fauxid, ListAttr);
                }
            }
        }
    }

    //检测库存不足的商品
    function checkLowGoods() {
        var inum = goodsListArr.length;
        for (var i = 0; i < inum; i++) {
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (attrList[j].maxnum == 0 || attrList[j].num > attrList[j].maxnum) {
                    return true;
                }
            }
        }
        return false;
    }


    function render(configp) {
        config = configp;
        deleteList = [];
        initView();
        show();
    }

    function show() {
        $(viewPage).show();
        getGoodsData();
    }

    function hide() {
        $(viewPage).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();


var ChatList = (function () {

    var xApi = (function () {

        //url 接口url，param  接口参数， fnCall 回调
        function post(caller) {
            var xhr = new window.XMLHttpRequest();
            xhr.open('post', caller.url, true);
            xhr.withCredentials = "true";
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var data = xhr.responseText;
                        var json = (new Function('return ' + data))();
                        caller.fnCall && caller.fnCall(json);
                        //随机延迟服务端响应

                        /*                         var itime=Math.random()*10*500;
                         setTimeout(function(){
                         caller.fnCall && caller.fnCall(json);
                         },itime);*/
                    }
                }
            };
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(caller.param);
        }

        return {
            post: post
        }
    })();

    var xApp = (function () {
        var param;
        var isIphone = 0;

        function init(config) {
            if (!param && config) {
                param = config;
                if (param.nick == "WX用户") {
                    var openid = param.openid;
                    param.nick = "零售客户" + openid.substring(openid.length - 3);
                }
            }
            return param;
        }

        function update(info) {
            if (param) {
                param.groupid = info.groupid || 0;
            }
        }

        //是否iphone flag=1 iphone微信浏览器 flag=2
        function checkIphoneSeries() {
            var userAgentInfo = navigator.userAgent.toLowerCase();
            var Agents = ["iphone", "ipad", "ipod"];
            var wxchat = ["micromessenger"];
            var flag = 0;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = 1;
                    if (userAgentInfo.indexOf(wxchat) > 0) {
                        flag = 2;
                    }
                    break;
                }
            }
            return flag;
        }

        init();
        isIphone = checkIphoneSeries();

        return {
            init: init,
            update: update,
            isIphone: isIphone
        }
    })();

    var xDate = (function () {


        //格式化日期 把2015-1-8 20:5:22  格式化成 2015-01-08 20:05:22
        function xformat(date) {

            if (!date) {
                return '';
            }

            function fmt(num) {
                num = num + '';
                return num.length > 1 ? num : '0' + num;
            }

            try {
                var dateStr = '';
                var d = date.split(' ');
                var day = d[0];
                var d1 = day.split('-');
                for (var i in d1) {
                    dateStr = (i == 0 ? dateStr + fmt(d1[i]) : dateStr + '-' + fmt(d1[i]));
                }
                dateStr = dateStr + ' ';
                var time = d[1];
                var t1 = time.split(':');
                for (var j in t1) {
                    dateStr = (j == 0 ? dateStr + fmt(t1[j]) : dateStr + ':' + fmt(t1[j]));
                }
                return dateStr;
            } catch (e) {
                return date;
            }
        }

        //day 是在当前日期上进行加减
        function getDay(iday, dateStr) {
            var date = new Date();
            if (dateStr) {
                date = new Date(dateStr);
            }
            date.setDate(date.getDate() + iday);
            var month = date.getMonth() + 1;
            var day = date.getDate();
            return date.getFullYear() + "-" + (month < 10 ? "0" : "")
                + month + "-" + (day < 10 ? "0" : "") + day;
        }

        //把日期转换成时间戳
        function parseitime(datestr) {
            var isIphone = xApp.isIphone;
            var itime = 0;
            if (isIphone > 0) {
                var msgtime = datestr.replace(/-/g, "/");
                itime = Date.parse(new Date(msgtime));
            } else {
                itime = Date.parse(new Date(datestr));
            }
            return Number(itime);

        }


        function format(date, fmt) { //author: meizz
            var o = {
                "M+": date.getMonth() + 1, //月份
                "d+": date.getDate(), //日
                "H+": date.getHours(), //小时
                "m+": date.getMinutes(), //分
                "s+": date.getSeconds(), //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        return {
            parseitime: parseitime,
            format: format,
            xformat: xformat,
            getDay: getDay
        }
    })();

    var xUtils = (function () {
        function throttle(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function () {
                var now = Date.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }

        function timestamp() {
            return parseInt(new Date().getTime() / 1000) + '';
        }

        return {
            throttle: throttle,
            timestamp: timestamp
        }
    })();

    var xString = (function () {

        /**
         * 获取位于两个标记子串之间的子字符串。
         * @param {String} string 要进行获取的大串。
         * @param {String} tag0 区间的开始标记。
         * @param {String} tag1 区间的结束标记。
         * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
         * @example
         $.String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello'
         */

        function between(string, tag0, tag1) {
            var startIndex = string.indexOf(tag0);
            if (startIndex < 0) {
                return '';
            }

            startIndex += tag0.length;

            var endIndex = string.indexOf(tag1, startIndex);
            if (endIndex < 0) {
                return '';
            }

            return string.substr(startIndex, endIndex - startIndex);
        }


        /*
         *
         * @dom {string} dom节点的id标识 或者jquery 包裹的对象
         * @returns 返回这个节点的默认模板
         *
         * */
        function template(domId) {
            var htmlStr = (typeof domId == 'string') ? document.getElementById(domId).innerHTML : domId[0].innerHTML;
            return between(htmlStr, '<!--', '-->');
        }


        /**
         * 产生指定格式或长度的随机字符串。
         * @param {string|int} [formater=12] 随机字符串的格式，或者长度（默认为12个字符）。
         格式中的每个随机字符用 'x' 来占位，如 'xxxx-1x2x-xx'
         * @return {string} 返回一个指定长度的随机字符串。
         * @example
         $.String.random();      //返回一个 12 位的随机字符串
         $.String.random(64);    //返回一个 64 位的随机字符串
         $.String.random('xxxx-你好xx-xx'); //类似 'A3EA-你好B4-DC'
         */
        function random(formater) {
            if (formater === undefined) {
                formater = 12;
            }

            //如果传入的是数字，则生成一个指定长度的格式字符串 'xxxxx...'
            if (typeof formater == 'number') {
                var size = formater + 1;
                if (size < 0) {
                    size = 0;
                }
                formater = [];
                formater.length = size;
                formater = formater.join('x');
            }

            return formater.replace(/x/g, function (c) {
                var r = Math.random() * 16 | 0;
                return r.toString(16);
            }).toUpperCase();
        }


        /**
         * 用指定的值去填充一个字符串。
         * 当不指定字符串的填充标记时，则默认为 {}。
         * @param {String} string 要进行格式填充的字符串模板。
         * @param {Object} obj 要填充的键值对的对象。
         * @return 返回一个用值去填充后的字符串。
         * @example
         * 用法：
         $.String.format('{id}{type}', {id: 1, type: 'app'});
         $.String.format('{2}{0}{1}', 'a', 'b', 'c');
         */
        function format(string, obj, arg2) {
            var s = string;
            if (typeof obj == 'object') {
                for (var key in obj) {
                    s = replaceAll(s, '{' + key + '}', obj[key]);
                }
            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = args.length; i < len; i++) {
                    s = replaceAll(s, '{' + i + '}', args[i]);
                }
            }
            return s;
        }

        /**
         * 对字符串进行全局替换。
         * @param {String} target 要进行替换的目标字符串。
         * @param {String} src 要进行替换的子串，旧值。
         * @param {String} dest 要进行替换的新子串，新值。
         * @return {String} 返回一个替换后的字符串。
         * @example
         $.String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
         */
        function replaceAll(target, src, dest) {
            return target.split(src).join(dest);
        }

        // 金额千分位格式化
        function formatMoney(money, digit) {
            if (money == undefined) {
                money = 0;
            }
            var moneystr = money + "";
            if (digit == undefined) {
                digit = moneystr.indexOf(".");
                if (digit < 0) {
                    digit = 0;
                } else {
                    digit = moneystr.length - 1 - digit;
                }
            }
            return formatM(moneystr, digit);
        }

        // 金额千分位格式化
        function formatM(money, digit) {
            try {
                var minusFlag = false;
                if (money < 0) {
                    money = -money;
                    minusFlag = true;
                }
                digit = digit >= 2 ? 2 : digit;
                money = parseFloat((money + "").replace(/[^\d\.-]/g, "")).toFixed(digit) + "";
                var intPart = "";
                var fraction = "";
                if (digit > 0) {
                    intPart = money.split(".")[0].split("").reverse();
                    fraction = money.split(".")[1];
                } else {
                    intPart = money.split("").reverse();
                }
                var temp = "";
                var inum = intPart.length;
                for (var i = 0; i < inum; i++) {
                    temp += intPart[i] + ((i + 1) % 3 == 0 && (i + 1) != inum ? "," : "");
                }
                var digitStr = '';
                if (digit > 0) {
                    digitStr = temp.split("").reverse().join("") + "." + fraction;
                } else {
                    digitStr = temp.split("").reverse().join("");
                }
                if (minusFlag) {
                    digitStr = '-' + digitStr;
                }
                return digitStr;
            }
            catch (ex) {
                return money;
            }

        }


        return {
            formatMoney: formatMoney,
            random: random,
            between: between,
            format: format,
            template: template
        }
    })();

    var xObject = (function () {
        function extend(target, obj1, obj2) {

            //针对最常用的情况作优化
            if (obj1 && typeof obj1 == 'object') {
                for (var key in obj1) {
                    target[key] = obj1[key];
                }
            }

            if (obj2 && typeof obj2 == 'object') {
                for (var key in obj2) {
                    target[key] = obj2[key];
                }
            }

            var startIndex = 3;
            var len = arguments.length;
            if (startIndex >= len) {
                return target;
            }

            //更多的情况
            for (var i = startIndex; i < len; i++) {
                var obj = arguments[i];
                for (var name in obj) {
                    target[name] = obj[name];
                }
            }

            return target;
        }

        function clone(obj) {
            var o, i, j;
            if (typeof(obj) != "object" || obj === null)return obj;
            if (obj instanceof(Array)) {
                o = [];
                i = 0;
                j = obj.length;
                for (; i < j; i++) {
                    if (typeof(obj[i]) == "object" && obj[i] != null) {
                        o[i] = arguments.callee(obj[i]);
                    }
                    else {
                        o[i] = obj[i];
                    }
                }
            }
            else {
                o = {};
                for (i in obj) {
                    if (typeof(obj[i]) == "object" && obj[i] != null) {
                        o[i] = arguments.callee(obj[i]);
                    }
                    else {
                        o[i] = obj[i];
                    }
                }
            }

            return o;
        }


        function toQueryStr(obj) {
            if (obj == null) {
                return String(obj);
            }
            switch (typeof obj) {
                case 'string':
                case 'number':
                case 'boolean':
                    return obj;
            }
            if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
                return obj.valueOf();
            }
            if (obj instanceof Array) {
                return '[' + obj.join(', ') + ']';
            }
            var fn = arguments.callee;
            var pairs = [];
            for (var name in obj) {
                pairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(fn(obj[name])));
            }
            return pairs.join('&');
        }

        function isEmpty(obj) {
            if (obj) {
                for (var i in obj) {
                    return false;
                }
                return true;
            }
            return true;
        }

        return {
            isEmpty: isEmpty,
            toQueryStr: toQueryStr,
            extend: extend,
            clone: clone
        }
    })();

    var Param = (function () {


        var param;
        var pagesize = 50;

        function init() {
            param = xApp.init();
            return param;
        }

        /*eid	Y		企业号
         appid	Y		应用ID
         openid	Y		用户标识 微信、云之家
         method	Y		调用API名称
         ts*/
        /*Nick	Y		用户昵称
         isKisUser	0		登陆用户类型，从微信登陆0，云家之家1 默认0
         Imgurl			用户图像URL
         ServicersPhone*/

        function login() {
            init();
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.login',
                ts: xUtils.timestamp(),
                Nick: param.nick,
                isKisUser: param.appflag,
                Imgurl: param.img,
                ServicersPhone: param.phone
            }
        }

        /*
         * groupid	Y		对话组ID
         talktime			如没有值，取最新10条对话记录，
         返回指定时间后的对话记录
         pageindex	N	1	当前页码
         pagesize	N	1	页码数
         * */

        function talklist(imsg) {
            init();
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.talklist',
                ts: xUtils.timestamp(),
                groupid: imsg.groupid,
                talktime: imsg.talktime,
                pageindex: 1,
                pagesize: pagesize
            }
        }

        function sendmsg(imsg) {
            init();
            var msg = {
                msg: imsg.msg
            };
            if (imsg.other) {
                msg.other = imsg.other;
            }
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.sendmsg',
                ts: xUtils.timestamp(),
                groupid: imsg.groupid,
                msgid: imsg.msgid || 0,
                msg: JSON.stringify(msg)
            }


        }

        function talkgroup() {
            init();
            return {
                eid: param.eid,
                appid: param.appid,
                openid: param.openid,
                method: 'kingdee.kis.customservice.talkgroup',
                ts: xUtils.timestamp(),
                pageindex: 1,
                pagesize: pagesize
            }
        }

        return {
            init: init,
            login: login,
            talklist: talklist,
            talkgroup: talkgroup,
            sendmsg: sendmsg
        }

    })();

    var Api = (function () {

        var Api = xApi;

        var url = 'http://kismob.kingdee.com/cs/rest';

        /*        //以下2个参数 微信用户使用。云之家不需要
         var groupid;
         var talktime = '';*/

        function login(fnCall) {
            var parm = xObject.toQueryStr(Param.login());
            Api.post({
                url: url,
                param: parm,
                fnCall: fnCall
            });
        }

        function talkList(imsg, fnCall) {

            if (Param.init().appflag == 0) {
                //微信用户
                if (imsg.talktime) {
                    getTalk(fnCall, {
                        groupid: imsg.groupid,
                        talktime: imsg.talktime
                    });
                } else {
                    //微信首次加载要登录
                    login(function (json) {
                        if (json.Result == 200) {
                            var data = json.Data || {};
                            var groupid = data.groupid || 0;
                            //把会话组信息 存起来
                            xApp.update({groupid: groupid});
                            getTalk(fnCall, {
                                groupid: groupid,
                                talktime: ''
                            });
                        }

                    });
                }
            } else {
                getTalk(fnCall, {
                    groupid: imsg.groupid,
                    talktime: imsg.talktime
                });
            }

        }

        function getTalk(fnCall, imsg) {
            var parm = xObject.toQueryStr(Param.talklist({
                groupid: imsg.groupid,
                talktime: imsg.talktime
            }));

            Api.post({
                url: url,
                param: parm,
                fnCall: function (json) {
                    var data;
                    if (json.Result == 200) {
                        /*                        data = json.Data || {};
                         groupid = data.GroupID || 0;
                         talktime = data.getTime || '';*/
                        fnCall && fnCall(json);
                    }
                }
            });
        }


        function sendMsg(imsg, fnCall) {

            var vmsg;
            var vgroupid;
            //微信
            vmsg = imsg.msg;
            vgroupid = imsg.groupid;

            var parm = xObject.toQueryStr(Param.sendmsg({
                other: imsg.other,
                msgid: imsg.msgid,
                msg: vmsg,
                groupid: vgroupid
            }));
            Api.post({
                url: url,
                param: parm,
                fnCall: fnCall
            });
        }


        return {
            talkList: talkList,
            sendMsg: sendMsg
        }

    })();

    var Chat = (function () {

        //格式化数据
        function format(uList, msgs, groupid, talktime) {
            var defaultImg = 'img/chatweixin.png';

            function getImg(openid) {
                var iuser = user[openid];
                if (iuser) {
                    return iuser.img || defaultImg;
                }
                for (var i in uList) {
                    if (uList[i].openid == openid) {
                        user[openid] = {
                            img: uList[i].imgurl,
                            nick: uList[i].nick
                        };
                        return user[openid].img || defaultImg;
                    }
                }
                return '';
            }

            function getNick(openid) {
                var iuser = user[openid];
                if (iuser) {
                    return iuser.nick || '';
                }
                for (var i in uList) {
                    if (uList[i].openid == openid) {
                        user[openid] = {
                            img: uList[i].imgurl,
                            nick: uList[i].nick
                        };
                        return user[openid].nick;
                    }
                }
                return '';
            }

            var user = {};
            var param = Param.init();
            var openid = param.openid;
            var list = [];
            var vOpenid;
            var msgid;
            var msgObj;
            var msg;
            var other;
            var itime;
            var msgtime;

            var len = msgs.length - 1;
            for (var i = len; i >= 0; i--) {
                vOpenid = msgs[i].openID;
                msgid = msgs[i].fid;

                //解析消息格式
                try {
                    msgObj = JSON.parse(msgs[i].message);
                    msg = msgObj.msg || '';
                    other = msgObj.other || '';
                } catch (e) {
                    msg = msgs[i].message;
                    other = '';
                }

                //把消息时间 转换成时间戳 方便比较大小
                msgtime = msgs[i].createTime;
                try {
                    itime = xDate.parseitime(msgtime);
                    itime = itime / 1000;
                } catch (e) {
                }

                //console.log(msgtime+'*'+itime);
                list.push({
                        msgid: msgid,
                        msg: msg,
                        other: other,
                        time: msgtime,
                        itime: itime,
                        me: openid == vOpenid,
                        img: getImg(vOpenid),
                        nick: getNick(vOpenid)
                    }
                );
            }

            return {
                list: list,
                talktime: talktime,
                msgid: msgid,
                groupid: groupid
            };


        }

        //获取聊天记录
        function get(imsg, fnCall) {
            Api.talkList(imsg, function (json) {
                var data;
                if (json.Result == 200) {
                    data = json.Data || {};
                    var user = data.msgUsers || [];
                    var msgs = data.msgs || [];
                    var groupid = data.GroupID || 0;
                    var talktime = data.getTime || '';
                    fnCall && fnCall(format(user, msgs, groupid, talktime));
                }
                // console.log(JSON.stringify(json));
            });
        }

        function send(imsg, fnCall) {
            Api.sendMsg(imsg, function (json) {
                if (json.Result == 200) {
                    fnCall && fnCall(json);
                } else {
                    var ErrMsg = json.ErrMsg;
                    jAlert(ErrMsg);
                }
            });
        }

        return {
            get: get,
            send: send
        };


    })();


    var viewPage;
    var chatList;
    var chatView;
    var me_li;
    var other_li;
    var time_li;
    var goods_li;
    var msgText;

    var msgTxtId = 'viewid-chat-msg';

    var config;
    //消息重复获取标志
    var repeat = 1;
    //消息获取间隔时间
    var repeatTime = 1000;
    //消息id最大值
    var maxMsgId = 0;
    //用来做发送消息成功与否的判断
    var msgId = 0;
    //用来记录消息发送时间
    var msgSendList = {};
    //最后一条消息的时间
    var lastMsgTime = 0;
    //微商城商品信息
    var goodsInfo;
    //消息时间显示 默认间隔5分钟
    var timeApart = 60 * 5;
    var today = xDate.getDay(0);
    var scroller;
    var hasInit;
    //已经查看过的最大消息id
    var msgIdVisited = 0;
    //当前页面是否显示
    var isView = true;


    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid-chat');
            chatView = document.getElementById('viewid-chat-list');
            chatList = $(chatView);
            var chatHtml = chatView.innerHTML;
            me_li = xString.between(chatHtml, '<!--me', 'me-->');
            other_li = xString.between(chatHtml, '<!--other', 'other-->');
            time_li = xString.between(chatHtml, '<!--time', 'time-->');
            goods_li = xString.between(chatHtml, '<!--goods', 'goods-->');
            chatView.innerHTML = '';
            msgText = $('#' + msgTxtId);
            var scrolldiv = document.getElementById('viewid-chat-wrap');
            scroller = Lib.Scroller.create(scrolldiv);
            window.iscroller = scroller;
            kdctrl.initkdScroll(scroller, {});
            bindEvents();
            hasInit = true;
        }
    }


    //获取消息框的内容行数
    function getTxtRow() {
        var msg = document.getElementById(msgTxtId).value;
        var row = msg.split("\n").length;
        return row < 4 ? row : 4;
    }

    //监控消息框的内容
    function txtChange() {
        initTxt();
        var irow = getTxtRow();
        msgText.addClass('msgH' + irow);
    }

    //初始化消息发送框
    function initTxt() {
        for (var i = 1; i <= 4; i++) {
            msgText.removeClass('msgH' + i);
        }
    }

    //处理聊天消息中的回车符号
    function dealSpecialChar(msg) {
        return msg.replace(/\n/g, '<br />');
    }

    function bindEvents() {

        viewPage.delegate('[data-cmd="send"]', {
            'click': function () {
                var msg = msgText.val();
                if (msg != '') {
                    var groupid = xApp.init().groupid;
                    msgText.val('');
                    initTxt();
                    var other = '';
                    if (!xObject.isEmpty(goodsInfo)) {
                        other = JSON.stringify(goodsInfo);
                        msgId += 1;
                        sendMsg({
                            other: other,
                            msgid: msgId,
                            msg: '',
                            groupid: groupid
                        });
                        goodsInfo = {};
                        other = '';
                        //延迟一点点 免得消息的先后顺序区分不开
                        setTimeout(function () {
                            msgId += 1;
                            sendMsg({
                                other: other,
                                msgid: msgId,
                                msg: msg,
                                groupid: groupid
                            });
                        }, 10);
                    } else {
                        msgId += 1;
                        sendMsg({
                            other: other,
                            msgid: msgId,
                            msg: msg,
                            groupid: groupid
                        });
                    }
                }
                document.getElementById(msgTxtId).focus();

            },
            'touchstart': function () {
                $(this).addClass('on');
            },
            'touchend': function () {
                $(this).removeClass('on');
            }

        })
            .on('input propertychange', '#' + msgTxtId, xUtils.throttle(txtChange, 500));
        /*            .on('focus', '#' + msgTxtId, function () {
         refresh();
         });*/
        //.on('keyup', '#' + msgTxtId, xUtils.throttle(txtChange, 500));

        var resizeTimer = null;
        $(window).on('resize', function () {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                    resizeTimer = null;
                }
                resizeTimer = setTimeout(function () {
                    refresh();
                }, 120);
            }
        );
    }

    function sendMsg(imsg) {

        Chat.send(imsg, sendMsgCallBack);
        var itime = (new Date().getTime());
        var time = xDate.format(new Date(), "yyyy-MM-dd HH:mm:ss");
        msgSendList[imsg.msgid] = itime;
        window.itest = msgSendList;
        var img = xApp.init().img || 'img/chatweixin.png';
        iSay({
            other: imsg.other,
            msg: imsg.msg,
            sendid: imsg.msgid,
            img: img,
            time: time,
            itime: itime / 1000
        });

    }


    //刷新聊天窗口，滚动条置底
    function refresh() {
        // document.body.scrollTop = document.body.scrollHeight;
        scroller.refresh();
        scroller.scrollTo(0, -(scroller.scrollerHeight - scroller.wrapperHeight));
    }


    //显示消息时间
    function showTime(time) {
        var t = time.substring(0, time.length - 3);
        if (t.indexOf(today) >= 0) {
            t = t.replace(today, '');
        } else {
            t = t.substring(5);
        }
        var msgli = xString.format(time_li, {time: t});
        chatList.append(msgli);
        //refresh();
    }

    //显示商品信息
    function showGoods(other) {
        var goods = JSON.parse(other);
        var msgli = xString.format(goods_li, goods);
        chatList.append(msgli);
        //refresh();
    }

    //发送聊天信息
    function iSay(imsg, nofresh) {
        if (imsg.other) {
            if (imsg.itime - lastMsgTime > timeApart) {
                showTime(imsg.time);
                lastMsgTime = imsg.itime;
            }
            showGoods(imsg.other);
        }

        if (imsg.msg != '') {
            if (imsg.itime - lastMsgTime > timeApart) {
                showTime(imsg.time);
                lastMsgTime = imsg.itime;
            }
            var msgli = xString.format(me_li, {
                'sendid': imsg.sendid || '-1',
                'img': imsg.img,
                'msg': dealSpecialChar(imsg.msg)
            });
            chatList.append(msgli);
        }
        if (!nofresh) {
            refresh();
        }
    }

    //其它人发送的消息显示
    function otherSay(imsg, nofresh) {
        if (imsg.other) {
            showGoods(imsg.other);
        }
        if (imsg.msg != '') {
            if (imsg.itime - lastMsgTime > timeApart) {
                showTime(imsg.time);
                lastMsgTime = imsg.itime;
            }
            var msgli = xString.format(other_li, {
                'nick': imsg.nick,
                'img': imsg.img,
                'msg': dealSpecialChar(imsg.msg)
            });
            chatList.append(msgli);
        }
        if (!nofresh) {
            refresh();
        }
    }

    function firstMsg(msg) {
        viewPage.find('[data-cmd="send"]').show();
        hisList(msg);
        repeatCall();
    }

    //聊天历史
    function hisList(msg) {
        var list = msg.list;
        if (list.length > 0) {
            if (isView) {
                for (var i in list) {
                    if (list[i].msgid > maxMsgId) {
                        list[i].me ? (!config.talktime ? iSay(list[i], true) : '')
                            : otherSay(list[i], true);
                    }
                }
            }
            maxMsgId = msg.msgid;
            checkMsg();
            refresh();
        }
        if (msg.talktime) {
            config.talktime = msg.talktime;
            config.groupid = msg.groupid;
        }
    }

    function checkMsg() {
        if (!isView && maxMsgId > msgIdVisited) {
            setMsgAlert(true);
        }
    }

    function setMsgAlert(bview) {
        var bmsg = $('#view-itemdetail').find('[data-cmd="alert"]');
        bview ? bmsg.addClass('alert') : bmsg.removeClass('alert');
    }

    //检查消息是否发送成功 根据超时来判断
    function checkMsgSend() {
        var checktime = (new Date().getTime());
        var diff = 2000;
        var failList = [];
        for (var i in msgSendList) {
            if (checktime - msgSendList[i] >= diff) {
                failList.push(i);
            }
        }
        for (var j in failList) {
            chatList.find('[data-id="' + failList[j] + '"]').removeClass('hide');
        }

    }


    //消息发送成功后 由消息对象检查列表中删除
    function sendMsgCallBack(json) {
        if (json.Result == 200) {
            var Data = json.Data;
            var msgid = Data.msgid;
            delete msgSendList[msgid];
            var msgv = chatList.find('[data-id="' + msgid + '"]');
            msgv.addClass('hide');
        }
    }


    //循环检测是否有消息
    function repeatCall() {
        setTimeout(function () {
            if (repeat) {
                checkMsgSend();
                var groupid = xApp.init().groupid;
                Chat.get({
                    groupid: groupid,
                    talktime: config.talktime
                }, function (msg) {
                    hisList(msg);
                    repeatCall();
                });
            }
        }, repeatTime);
    }

    //检测是否携带浏览商品信息
    function checkGoods(init) {
        if (init.goodsName) {
            goodsInfo = {
                'img': init.goodsImg,
                'name': init.goodsName,
                'price': init.goodsPrice,
                'model': init.goodsModel
            }
        }
    }


    function render(init) {
        xApp.init(init);
        initView();
        show();
        viewPage.find('[data-cmd="send"]').hide();
        repeat = 1;
        maxMsgId = 0;
        lastMsgTime = 0;
        chatList.empty();
        config = {};
        Chat.get({
            groupid: 0,
            talktime: ''
        }, firstMsg);

        checkGoods(init || {});
    }

    function show() {
        viewPage.show();
        isView = true;
        setMsgAlert(false);
    }

    function hide() {
        //repeat = 0;
        msgIdVisited = maxMsgId;
        isView = false;
        viewPage.hide();
    }


    return {
        render: render,
        show: show,
        hide: hide
    }

})();
/**
 * 往来应付界面
 * Create by Mayue
 * Date 2016-1-8
 * */
var Balance = (function () {
    var $viewpage,
        hasInit,
        listviews,
        curTabIndex,
        itemsOfPage,
        tabNum,
        iheight,
        changetab = true;
    var samples = [];

    function initView() {
        if (!hasInit) {
            tabNum = 3;
            $viewpage = $('.view-business-outline');
            for (var i = 0; i < tabNum; i++) {
                var div = document.getElementById('business-outline-listwarp' + i);
                var sample = $.String.between(div.innerHTML, '<!--', '-->');
                samples.push(sample);
            }
            curTabIndex = 0;
            itemsOfPage = 10;
            initListView();
            bindEvents();
            bindScrollEvents();
            iheight = $(window).height() - 83;
            hasInit = true;
        }
    }

    //初始化列表视图数据
    function initListView() {
        listviews = [];
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('business-outline-listwarp' + i);
            var listv = document.getElementById('business-outline-list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            scroller.noticetop = 1.72;
            var listview = {
                listv: listv,
                listwrap: $(listwrap),
                scroller: scroller,
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh: false,
                dateCmp: "",
                dataKey: ""
            };
            listviews.push(listview);
        }
    }

    //设置iscroll滚动组件
    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }

    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {
                reSearch('',reset);
            },
            fnmore: function (reset) {
                GetCheckList('', reset);
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    //绑定事件
    function bindEvents() {
        initdate();
        //订单页签切换事件
        $viewpage.delegate('[data-cmd="li"]', {
            'click': function () {
                //if(changetab){
                var dataindex = this.getAttribute("data-index");
                changePageView(dataindex);//导航栏样式
                GetCheckListByCondition(dataindex);
                //} else {
                //     OptMsg.ShowMsg('数据加载中，请稍后操作...');
                //     return;
                // }
            }
        }
        );
    }

    //订单页签切换
    function changePageView(dataindex) {
        curTabIndex = dataindex;
        var li = $viewpage.find('[data-cmd="li"]');
        li.removeClass("on");
        li.eq(dataindex).addClass("on");
    }

    //刷新
    function reSearch(bfresh,fnReset) {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.scroller.isPageEnd = false;
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        if (bfresh) {
            listview.scroller.scrollTo(0, 0, 500);
            listview.listv.innerHTML = '';
        }
        GetCheckList('', fnReset);//mayue
    }

    //根据条件获取列表数据
    function GetCheckListByCondition(index, bfresh) {//mayue
        curTabIndex = index;
        var listview = listviews[index];
        var bReload = false;
        var dkey = listview.dataKey;
        var cmpkey = getCurDataKey();
        if (dkey != cmpkey) {
            bReload = true;
        }
        for (var i = 0; i < tabNum; i++) {
            $('#business-outline-listwarp' + i).hide();
        }
        if (!listview.scroller || bfresh || bReload) {
            listview.listv.innerHTML = '';
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            GetCheckList();
        }
        listview.listwrap.show();
    }

    //获取传入的条件
    function getCurDataKey() {
        var startdate = $viewpage.find('[data-cmd="kdcbegDate"]').val();
        var enddate = $viewpage.find('[data-cmd="kdcendDate"]').val();
        var key = startdate + enddate;
        return key;
    }

    //获取数据列表
    function GetCheckList(index, fnReset) {
        if (index == undefined || index == '') {
            index = curTabIndex;
        }
        var listview = listviews[index];
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            fnReset && fnReset();
            return;
        }
        var para = {
            currentPage: listview.currentPage,
            ItemsOfPage: listview.itemsOfPage
        };
        var ullist = getOptlist(index);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }

        var startdate = $viewpage.find('[data-cmd="kdcbegDate"]').val();
        var enddate = $viewpage.find('[data-cmd="kdcendDate"]').val();
        //传参
        para.para = {
            Option: parseInt(curTabIndex) + 1,
            Year: stringSplit(startdate)[0],
            BeginMonth: stringSplit(startdate)[1],
            EndMonth: stringSplit(enddate)[1]
            //Year: 2016,
            //BeginMonth: 01,
            //EndMonth: 01
        };


        //通过借口获取数据
        GetCheckListAPI(function (data, dindex) {
            var billMoney = $viewpage.find('[data-type="money"]');
            var listview2 = listviews[dindex];

            if (dindex == 0) {//概要信息
                var htmlstr = filllist(data, listview2.listdata, dindex);
            }

            if (dindex == 1) {//订单明细
                var htmlstr = fillOrderlist(data.orderlist, listview2.listdata, dindex);
                billMoney[0].innerText = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.billmoney));
            }

            if (dindex == 2) {//付款明细
                var htmlstr = fillRealpaylist(data.realpaylist, listview2.listdata, dindex);
                billMoney[1].innerText = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.realpaymoney));
            }

            var listv = listview2.listv;
            if (htmlstr == "" && listview2.currentPage == 1) {
                listview2.listwrap.find(".total-num").hide();
                listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
            } else {
                listview2.listwrap.find(".total-num").show();
                if (listview2.currentPage == 1) {
                    listv.innerHTML = htmlstr;
                } else {
                    listv.innerHTML += htmlstr;
                }
            }
            listview2.scroller.refresh();
            listview2.currentPage += 1;
        }, para, fnReset);
    }

    //概要信息
    function filllist(data, listdata, tadindex) {

        var htmlstr = $.String.format(samples[tadindex], {
            billmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.billmoney)),
            notoutmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.notoutmoney)),
            initbalance: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.initbalance)),
            trademoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.trademoney)),
            realpaymoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((data.realpaymoney)),
        });
        return htmlstr;
    }

    //订单明细
    function fillOrderlist(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = $.String.format(samples[tabindex], {
                billmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.billmoney)),
                statusname: item.statusname,
                billno: item.billno,
                billdate: stringSplit(item.billdate)[1] + '-' + stringSplit(item.billdate)[2],
                billclass: getBillClass(item.statusname)
            });
            htmlstr += listr;
        }
        return htmlstr;
    }

    function getBillClass(statusname) {
        var statusClass;
        switch (statusname) {
            case "待确认":
                statusClass = "time status-1"
                break;
            case "待发货":
                statusClass = "time status-2"
                break;
            case "部分发货":
                statusClass = "time status-3"
                break;
            case "已发货":
                statusClass = "time status-4"
                break;
        }
        return statusClass;
    }

    //付款明细
    function fillRealpaylist(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = $.String.format(samples[tabindex], {
                billmoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.billmoney)),
                billdate: stringSplit(item.billdate)[1] + '-' + stringSplit(item.billdate)[2],
                billno: item.billno
            });
            htmlstr += listr;
        }
        return htmlstr;
    }

    //调用订单列表API
    function GetCheckListAPI(fn, para, fnReset) {
        //changetab = false;
        Lib.API.get('GetCheckStatement', para,
            function (data, json, root, userflag) {
                var index = userflag;
                removeHint(index);
                setTotalPage(index, data, json);
                var pageNum = (listviews[index].currentPage - 1) * itemsOfPage;
                fn && fn(data, userflag);
                //changetab = true;
                setScrollPageEnd(userflag);
                fnReset && fnReset();
            }, function (code, msg, json, root, userflag) {
                var index = userflag || curTabIndex;
                removeHint(index);
                kdAppSet.showErrorView(msg, errorRefresh, curTabIndex);
                fnReset && fnReset();
            }, function (errCode) {
                removeHint(curTabIndex);
                kdAppSet.showErrorView(errCode, errorRefresh, curTabIndex);
                fnReset && fnReset();
            }, curTabIndex);

        var listview = listviews[curTabIndex];
        var cmpkey = getCurDataKey();
        if (listview.dataKey != cmpkey) {
            listview.dataKey = cmpkey;
        }
    }

    //获取当前list操作
    function getOptlist(index) {
        return $(listviews[index].listv);
    }

    //移除加载数据效果
    function removeHint(tabindex) {
        ullist = getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    //错误刷新
    function errorRefresh(index) {
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        GetCheckList(index);
    }

    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);

    }

    //设置list首页
    function setTotalPage(index, data, json) {
        //由于接口中总页数共用，所以端处理数据为空情况下总页数
        if (index == 0) {
            json['TotalPage'] = 0;
        }
        if (listviews[index].currentPage == 1 && index == 1 && data['orderlist'].length == 0) {
            json['TotalPage'] = 0;
        }
        if (listviews[index].currentPage == 1 && index == 2 && data['realpaylist'].length == 0) {
            json['TotalPage'] = 0;
        }
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    //设置日期
    function initdate() {
        var startdate = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var date = stringSplit(startdate);
        //初始化为当前年月，结束日期锁定当前年
        kdctrl.initDateNoDay($viewpage.find('[data-cmd="kdcbegDate"]'));//初始化开始日期插件
        kdctrl.initDateNoDay($viewpage.find('[data-cmd="kdcendDate"]'), date);//初始化结束日期插件
        $viewpage.find('[data-cmd="kdcbegDate"]').val(date[0] + '-' + date[1]);
        $viewpage.find('[data-cmd="kdcendDate"]').val(date[0] + '-' + date[1]);
        var datebegCtrl = $viewpage.find('[data-cmd="kdcbegDate"]');
        var dateendCtrl = $viewpage.find('[data-cmd="kdcendDate"]');

        datebegCtrl.bind('change', function () {
            var startdate = $viewpage.find('[data-cmd="kdcbegDate"]').val();
            var endyear = stringSplit(startdate);
            kdctrl.initDateNoDay($viewpage.find('[data-cmd="kdcendDate"]'), endyear);//锁定结束年份不可变，和开始年份一致
            $viewpage.find('[data-cmd="kdcendDate"]').val(startdate);//结束日期显示和开始一致
            reSearch(true);
        });

        dateendCtrl.bind('change', function () {
            var enddate = $viewpage.find('[data-cmd="kdcendDate"]').val();
            reSearch(true);
        }
        );
    }

    //拆分“-”
    function stringSplit(data) {
        return data.split("-");
    }

    function show() {
        $viewpage.show();
        kdAppSet.setAppTitle('交易对账');
    }

    function hide() {
        $viewpage.hide();
    }

    function render(config) {
        initView();
        changePageView(0);
        GetCheckListByCondition(0, true);//默认取全部，并刷新页面
        show();

    }
    return {
        render: render,
        show: show,
        hide: hide
    }
})();
/**
 * Created by ziki on 2015-07-07.
 */
var BuyerList = (function () {
    var $view,
        div,
        ul,
        samples,
        hasInit,
        nextPage,
        keyword,
        userGUID,
        totalPage,
        pageSize,
        recordCount,
        TotalAmount,
        scroller,
        searchBoxTxt,
        btnClear,
        list = [],
        iheight;

    function render() {
        if (!hasInit) {
            initView();
            renderList();
            hasInit = true;
        }
        show();
    }

    function show() {
        $view.show();
    }

    function hide() {
        $view.hide();
    }

    function initView() {

        $view = $('#view_buyerList');
        div = document.getElementById('template-buyer-List');
        ul = $(div).find('.list')[0];
        list = [];
        nextPage = 1;
        pageSize = 10;
        keyword = '';
        iheight = $(div).height();
        userGUID = kdAppSet.getUserInfo().optid;
        samples = $.String.getTemplates(div.innerHTML, [
            {
                name: 'li',
                begin: '<!--',
                end: '-->'
            }
        ]);
        searchBoxTxt = $('#buyerList-searchBox');
        replaceImg();
        initScroll(div);
        bindEvents();
        toggleHint(true);
    }

    function bindEvents() {

        initDate();

        $('#buyerList-searchBtn').on('click', function () {
            search();
        }).on(kdShare.clickfn());

        btnClear = $view.find('.clear-icon');
        searchBoxTxt.on({
            'click': function () {
            },
            'focus': function () {
                searchBoxTxt.val() ? btnClear.show() : btnClear.hide();
            },
            'blur': function () {

            },
            'input': function () {
                btnClear.show();
            }
        });

        searchBoxTxt.on('keyup', function (event) {
            if (event.keyCode == '13') {
                search();
            }
        });

        $view.find('.clear-icon').on('click', function () {
            searchBoxTxt.val('');
            searchBoxTxt.focus();
        });


        $("#view_buyerList .btnDate").bind("click", function () {
            var searchView = $("#view_buyerList .search");
            var btnDateImg = $(this).find("img");
            var bview = searchView.css("display");
            var itop = '126px';
            if (bview == "none") {
                scroller.noticetop = 86;
                btnDateImg.removeClass("sprite-downext downext");
                btnDateImg.addClass("sprite-upext upext");
            } else {
                itop = '86px';
                scroller.noticetop = 126;
                btnDateImg.removeClass("sprite-upext upext");
                btnDateImg.addClass("sprite-downext downext");
            }
            scroller.refresh();
            $("#view_buyerList .div-list").animate({top: itop}, "normal");
            searchView.animate({height: 'toggle', opacity: 'toggle'}, "normal");
        });

        //买家订单事件绑定--mayue
        $view.delegate('[data-cmd="buyer"]', {
            'click': function () {
                var index = $(this).attr('data-index');
                var curitem = list[index];
                var data = {
                    buyerId: curitem.UUID,
                    beginDate: $("#buyerlist_dateBegin").val(),
                    endDate: $("#buyerlist_dateEnd").val()
                };
                MiniQuery.Event.trigger(window, 'toview', ['BuyerOrderList', {
                    data: data
                }]);
            },
            'touchstart': function () {
               $(this).addClass("touched");
            },
            'touchend': function () {
                $(this).removeClass("touched");
            }
        });

    }

    function search() {
        scroller.isPageEnd = false;
        nextPage = 1;
        list = [];
        ul.innerHTML = '';
        scroller.refresh();
        keyword = kdAppSet.ReplaceJsonSpecialChar($('#buyerList-searchBox').val());
        toggleHint(true);
        renderList();
    }

    function replaceImg() {
        $view.find('.search-icon').attr('src', 'img/search.png');
        $view.find('.clear-icon').attr('src', 'img/clear.png');
    }

    function renderHeader() {
        var str = recordCount > 0 ? '(' + recordCount + ')' : '(0)';
        $('#span-buyer-count')[0].innerText = str;
    }

    function initDate() {

        kdctrl.initDate($(".buyerList .kdcDate"));

        var endDate = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var now = $.Date.now();
        now.setDate(now.getDate() - 30);
        var startDate = $.Date.format(now, "yyyy-MM-dd");
        $("#buyerlist_dateBegin").val(startDate);
        $("#buyerlist_dateEnd").val(endDate);

        var dateCtrl = $('#buyerlist_dateBegin,#buyerlist_dateEnd');
        dateCtrl.bind('change',
            function () {
                search();
            }
        );
    }

    function renderList() {

        var startDatav = $("#buyerlist_dateBegin").val();
        var endDatev = $("#buyerlist_dateEnd").val() + " 23:59:59";

        loadData(function (data) {
            toggleHint(false);
            if (recordCount == 0) { //无数据
                nextPage = 1;
                ul.innerHTML = kdAppSet.getEmptyMsg(iheight);
                scroller.refresh();
                scroller.isPageEnd = true;
                return;
            }

            var dateShow = '';
            var moneyShow = 'show';
            if (!kdAppSet.getIsShowPrice()) {
                moneyShow = '';
                dateShow = 'show';
            }

            var listHead = '';
            if (nextPage == 1 && moneyShow != '') {
                listHead = $.String.format(samples.li, {
                    index: -1,
                    name: '',
                    'date-show': dateShow,
                    'money-show': moneyShow,
                    desc: '订单总金额:',
                    money: kdAppSet.formatMoneyStr(TotalAmount),
                    total: 'total'
                });
            }

            var HTMLPart = listHead + $.Array.keep(data, function (item, index) {
                var j = pageSize * (nextPage - 1) + index;
                return $.String.format(samples.li, {
                    index: j,
                    desc: '',
                    name: item.FName,
                    'date-show': dateShow,
                    'money-show': moneyShow,
                    money: kdAppSet.formatMoneyStr(item.Amount),
                    time: item.CreateDate
                });
            }).join('');

            ul.innerHTML = nextPage == 1 ? HTMLPart : ul.innerHTML + HTMLPart;
            nextPage++;
            if (nextPage > totalPage) {
                scroller.isPageEnd = true;
            }
            scroller.refresh();
        }, {
            ownerGUID: userGUID,
            keyword: keyword,
            begindate: startDatav,
            enddate: endDatev
        });
    }

    /**
     * @param param 买家列表接口需传入参数，包括：
     * ownerGUID {string} 分享者 GUID，
     * index {number} 请求的页码，
     * keyword {string} 查询条件
     */
    function loadData(fn, param) {
        Lib.API.get('GetRetailList', {
                currentPage: nextPage,
                ItemsOfPage: pageSize,
                para: param
            },
            function (data, json) {
                totalPage = json.TotalPage;
                list = list.concat(data.RetailList);
                recordCount = data.recordcount;
                TotalAmount = data.TotalAmount;
                renderHeader();
                fn && fn(data.RetailList);
            },
            function (code, msg) {
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">' + msg + '</li>');
                scroller.isPageEnd = true;
                scroller.refresh();
            },
            function () {
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">网络错误，请稍候再试</li>');
                scroller.isPageEnd = true;
                scroller.refresh();
            });
    }

    function initScroll(div) {
        scroller = Lib.Scroller.create(div);
        var options = {
            fnfresh: function (reset) {
                scroller.isPageEnd = false;
                nextPage = 1;
                list = [];
                renderList();
                reset();
            },
            fnmore: function (reset) {
                if (nextPage <= totalPage) {
                    toggleHint(true);
                    renderList();
                }
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, options);
    }

    function toggleHint(isShow) {
        if (isShow) {
            $(ul).children().filter('.hintflag').remove();
            $(ul).append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            scroller.refresh();
            return;
        }
        $(ul).children().filter('.hintflag').remove();
        $(ul).children().filter('.spacerow').remove();
    }

    return{
        render: render,
        show: show,
        hide: hide
    }
})();
/**
 * 我的买家--订单列表页面
 * Create by Mayue
 * Date 2015-11-11
 * */
var BuyerOrderList = (function () {
    var div,
        $viewpage,
        sample,
        tabNum,
        listviews,
        curTabIndex,
        itemsOfPage,
        liDateHead,
        iheight,
        hasInit,
        startDatev,
        endDatev,
        buyerId;

    //初始化视图
    function initView() {
        if (!hasInit) {
            tabNum = 3;
            div = document.getElementById('view-buyer-order-list');
            $viewpage = $(div);
            sample = $.String.getTemplates(document.getElementById('buyerorderlist_list0').innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                }
            ]);
            initListView();
            itemsOfPage = 10;
            curTabIndex = 0;
            liDateHead = '<li lindex={index} class="lidatehead" status="1">{date}</li>';
            iheight = $(window).height() - 41;
            bindEvents();
            bindScrollEvents();
            hasInit = true;
        }
    }

    //初始化列表视图数据
    function initListView() {
        listviews = [];
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('buyerorderlist_listwrap' + i);
            var listv = document.getElementById('buyerorderlist_list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            scroller.noticetop = 50;
            var listview = {
                listv: listv,
                listwrap: $(listwrap),
                scroller: scroller,
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh: false,
                dateCmp: "",
                dataKey: ""
            };
            listviews.push(listview);
        }
    }

    //绑定事件
    function bindEvents() {


        //订单页签切换事件
        $viewpage.delegate('[data-cmd="li"]', {
                'click': function () {
                    var dataindex = this.getAttribute("data-index");
                    changePageView(dataindex);//导航栏样式
                    getOrderListByCondition(dataindex);
                }
            }
        );

        //订单状态
        $viewpage.delegate('[data-cmd="buyer-orderliststate"]', {
            'click': function () {
                var index = $(this).attr('index');
                var item = listviews[curTabIndex].listdata[index];

                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['Express', {
                    item: item
                }]);
            },
            'touchstart': function () {
                $(this).addClass("pressed");
            },
            'touchend': function () {
                $(this).removeClass("pressed");
            }
        });
        //订单详情
        $viewpage.delegate('[data-cmd="buyer-orderlistdetail"]', {
            'click': function () {
                var index = this.getAttribute("index");
                var item = listviews[curTabIndex].listdata[index];
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                    billId: item.interid, from: 'buyerOrderList'
                }]);
            },
            'touchstart': function () {
                $(this).addClass("touched");

            },
            'touchend': function () {
                $(this).removeClass("touched");


            }
        });
    }

    //订单页签切换
    function changePageView(dataindex) {
        curTabIndex = dataindex;
        var li = $viewpage.find('[data-cmd="li"]');
        li.removeClass("on");
        li.eq(dataindex).addClass("on");
    }

    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }

    //设置iscroll滚动组件
    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {

                reSearch();
                reset();
            },
            fnmore: function (reset) {
                GetOrderList();
                reset();
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    //刷新
    function reSearch() {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        listview.scroller.scrollTo(0, 0, 500);
        listview.listv.innerHTML = '';
        GetOrderList();
    }

    //获取传入的条件
    function getCurDataKey() {
        var key = buyerId + startDatev + endDatev;
        return key;
    }


    //根据条件获取列表数据
    function getOrderListByCondition(index, bfresh) {
        curTabIndex = index;
        var listview = listviews[index];
        var bReload = false;
        var dkey = listview.dataKey;
        var cmpkey = getCurDataKey();
        if (dkey != cmpkey) {
            bReload = true;
        }
        for (var i = 0; i < tabNum; i++) {
            $('#buyerorderlist_listwrap' + i).hide();
        }
        if (!listview.scroller || bfresh || bReload) {
            listview.listv.innerHTML = '';
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            GetOrderList();
        }
        listview.listwrap.show();
    }

    //订单列表
    function GetOrderList(index) {
        if (index == undefined) {
            index = curTabIndex;
        }
        var listview = listviews[index];
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            return;
        }
        var para = {
            currentPage: listview.currentPage,
            ItemsOfPage: listview.itemsOfPage
        };
        var ullist = getOptlist(index);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }
        //mayue传参获取我的买家订单列表 optOpenid需要确定 Option具体对应需要再问
        para.para = {
            optOpenid: kdAppSet.getUserInfo().optid,
            Option: getOptionIndex(curTabIndex),
            KeyWord: "",
            BeginDate: startDatev,
            EndDate: endDatev,
            retailOpenid: buyerId //buyerID
        };
        //通过借口获取数据
        GetOrderListAPI(function (data, dindex) {
            var listview2 = listviews[dindex];
            var htmlstr = getListHtml(data, listview2.listdata, dindex);
            var listv = listview2.listv;
            if (htmlstr == "" && listview2.currentPage == 1) {
                listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
            } else {
                if (listview2.currentPage == 1) {
                    listv.innerHTML = htmlstr;
                } else {
                    listv.innerHTML += htmlstr;
                }
            }
            listview2.scroller.refresh();
            listview2.currentPage += 1;
        }, para);
    }

    //调用订单列表API
    function GetOrderListAPI(fn, para) {
        Lib.API.get('GetSEOrderList', para,
            function (data, json, root, userflag) {
                var index = userflag;
                removeHint(index);
                setTotalPage(index, json);
                var pageNum = (listviews[index].currentPage - 1) * itemsOfPage;
                var list = $.Array.keep(data['SEOrderList'] || [], function (item, index) {
                    return {
                        index: pageNum + index,
                        interid: item.FInterID,
                        status: item.FRemark, // 订单状态  //0全部 1待审核 2待发货 3已发货 4 已收货 5待付款  6.已支付
                        consigndate: item.fconsigndate,
                        billno: item.FBillNo,
                        billmoney: item.FBillMoney || 0,
                        date: item.FDate,
                        settle: item.fsettlename,
                        num: item.FAuxQty,
                        paystatus: item.paystatus || 0,//mayue
                        expressnumber: item.FWLNumber,
                        expresscom: item.FWLCompany,
                        freight: item.freight || 0,
                        payType: item.PayType || '',//mayue
                        sendType: item.SendType || 0
                    };
                });
                fn && fn(list, userflag);
                setScrollPageEnd(userflag);
            }, function (code, msg, json, root, userflag) {
                var index = userflag || curTabIndex;
                removeHint(index);
                kdAppSet.showErrorView(msg, errorRefresh, userflag);

            }, function (errCode) {
                removeHint(curTabIndex);
                kdAppSet.showErrorView(errCode, errorRefresh, curTabIndex);

            }, curTabIndex);

        var listview = listviews[curTabIndex];
        var cmpkey = getCurDataKey();
        if (listview.dataKey != cmpkey) {
            listview.dataKey = cmpkey;
        }
    }

    //获取当前list操作
    function getOptlist(index) {
        return $(listviews[index].listv);
    }

    //移除加载数据效果
    function removeHint(tabindex) {
        ullist = getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    //错误刷新
    function errorRefresh(index) {
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        GetOrderList(index);
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = getTemplateStr(item);
            htmlstr += listr;
        }
        return htmlstr;
    }

    //根据模板获取列表字符串信息  显示
    function getTemplateStr(item) {
        var identity = kdAppSet.getUserInfo().identity;
        //mayue 填充数据，支付方式选择
        var listr = $.String.format(sample.li, {
            index: item.index,
            billid: item.interid,
            billno: item.billno,
            money: kdAppSet.formatMoneyStr(item.billmoney),
            status: getStatusName(item.status),
            num: item.num,
            time: item.date,
            paystyle: getPayStyle(item.paystatus)
        });
        return listr;
    }

    //根据item.paystatus获取支付方式
    function getPayStyle(paystatus) {
        var paystyle = "sprite-none-pay";//默认无
        if (paystatus == 1) {//微信支付
            paystyle = "sprite-wechat-pay";
        } else if (paystatus == 2) {//线下支付
            paystyle = "sprite-lineoff-pay";
        } else if (paystatus == 3) {//存储卡支付
            paystyle = "sprite-card-pay";
        }
        return paystyle;
    }

    //根据item.status获取状态名称(传回的FRemark)
    function getStatusName(status) {
        index = status || 0;
        var statusList = ["", "待确认", "待发货", "已发货", "已收货", "待付款", "已支付"];
        return statusList[status];
    }

    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);
    }

    //设置list首页
    function setTotalPage(index, json) {
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    //根据页面标签获取 option值 0全部 6已支付 5未支付待确定
    function getOptionIndex(index) {
        var optionlist = [0, 6, 5];
        return optionlist[index];
    }


    function show() {
        $(div).show();
        kdAppSet.setAppTitle('我的买家');
    }

    function hide() {
        $(div).hide();
    }

    function render(config) {
        var data = config.data;
        startDatev = data.beginDate;
        endDatev = data.endDate + " 23:59:59";
        buyerId = data.buyerId;
        initView();
        curTabIndex = 0;
        changePageView(0);
        show();
        getOrderListByCondition(0);//默认取全部
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();
/**
 * Created by ziki on 2015-07-09.
 */
var CollectionList = (function(){
    var $view,
        div,
        ul,
        samples,
        hasBind,
        hasInit,
        nextPage,
        userGUID,
        totalPage,
        pageSize,
        recordCount,
        scroller,
        list,
        iHeight;

    function render(){
        if(!hasInit){
            $view = $('#view-collectionList');
            div = document.getElementById('div-collectionList');
            ul = document.getElementById('ul-collectionList');
            nextPage = 1;
            pageSize = 10;
            list = [];
            initView();
            hasInit = true;
        }
        ul.innerHTML = '';
        toggleHint(true);
        renderFirst();
        show();
    }

    function show(){
        $view.show();
    }

    function hide(){
        toggleHint(false);
        $view.hide();
    }

    function initView(){
        iHeight = $(div).height();
        userGUID = kdAppSet.getUserInfo().optid;
        samples = $.String.getTemplates(ul.innerHTML, [
            {
                name: 'li',
                begin: '<!--',
                end: '-->'
            }
        ]);
        initScroll(div);
        if(!hasBind){
            bindEvents();
            hasBind = true;
        }
    }

    function renderFirst(fn){
        scroller.isPageEnd = false;
        nextPage = 1;
        list = [];
        renderList(fn);
    }

    function bindEvents(){
        $(ul)
            .delegate('>li', {
                'click': function(){
                    var i = $(this).attr('data-index');
                    var item = list[i];
                    var goodsinfo = {
                        itemid: item.fitemid,
                        model: item.fmodel,
                        note: item.note,
                        price: item.fprice,
                        maxprice: item.fmaxprice,
                        unitid: item.funitid,
                        unitname: item.funitname,
                        name: item.fname,
                        img: item.fimageurl
                    };
                    MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: goodsinfo }]);
                },
                'touchstart': function () {
                    $(this).css('background', '#d9dadb');
                },
                'touchend': function () {
                    $(this).css('background', '#fafafa');
                }
            });
    }

    function renderHeader(){
        var str = recordCount > 0 ? '(' + recordCount + ')' :'(0)';
        $('#span-collection-count')[0].innerText = str;
    }

    function renderList(fn){
        loadData(function(data){
            //toggleHint(false);
            if(recordCount == 0) { //无数据
                nextPage = 1;
                ul.innerHTML = kdAppSet.getEmptyMsg(iHeight);
                fn && fn();
                scroller.refresh();
                scroller.isPageEnd = true;
                return;
            }

            var HTMLPart = $.Array.keep(data, function(item, index){
                var j = pageSize * (nextPage - 1) + index ;
                var imgS = 'img/no_img.png';
                if(kdAppSet.getImgMode()){
                    imgS = kdAppSet.getImgThumbnail(item.fimageurl) || imgS;
                }
                var priceStr = !kdAppSet.getIsShowPrice() ? '' : kdAppSet.getPriceStr({
                    price: item.fprice,
                    maxprice: item.fmaxprice
                });

                var stockInfo = kdAppSet.getStockStr(item.fqty, item.funitname);

                return $.String.format(samples.li, {
                    index: j,
                    img: imgS,
                    number: item.fnumber,
                    name: item.fname,
                    price: priceStr,
                    stockmsg: stockInfo.stockStr,
                    colormsg: stockInfo.color,
                    newflag: (item.newflag == 1) ? "display:block;" : "display:none;",
                    cuxiaoflag: (item.cuxiaoflag == 1) ? "display:block;" : "display:none;"
                });
            }).join('');

            ul.innerHTML = nextPage ==1 ? HTMLPart : ul.innerHTML + HTMLPart;
            nextPage++;
            if(nextPage > totalPage){
                scroller.isPageEnd = true;
            }
            fn && fn();
            setTimeout(function(){
                scroller.refresh();
            }, 200);
        }, {
            ownerGUID: userGUID,
            option: 3,
            ItemType: -1
        }, fn);
    }

    /**
     * @param param 买家列表接口需传入参数，包括：
     * ownerGUID {string} 分享者 GUID，
     * index {number} 请求的页码,
     * option {number} 请求数据的种类，1:新品 2：促销 3：收藏
     */
    function loadData(fn, param, reset){
        Lib.API.get('GetItemInfor', {
                currentPage: nextPage,
                ItemsOfPage: pageSize,
                para: param
            },
            function(data, json){
                toggleHint(false);
                totalPage = json.TotalPage;
                list = list.concat(data.itemlist);
                recordCount = data.total;
                renderHeader();
                fn && fn(data.itemlist);
            },
            function (code, msg){
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">' + msg + '</li>');
                reset();
                scroller.isPageEnd = true;
                scroller.refresh();
            },
            function () {
                renderHeader();
                toggleHint(false);
                $(ul).innerHTML = '';
                $(ul).append('<li class="hintflag">网络错误，请稍候再试</li>');
                reset();
                scroller.isPageEnd = true;
                scroller.refresh();
            });
    }

    function initScroll(div){
        scroller = Lib.Scroller.create(div);
        var options = {
            hinttop: 1,
            fnfresh: function(reset){
                renderFirst(reset);
            },
            fnmore: function(reset){
                if(nextPage <= totalPage){
                    renderList(reset);
                }
            }
        };
        kdctrl.initkdScroll(scroller, options);
    }

    function toggleHint(isShow){
        if(isShow){
            $('#divPulldown').html(Lib.LoadingTip.get()).show();
            $('#divPulldown').css('top', '41px');
            scroller.refresh();
            return;
        }
        $('#divPulldown').hide();
    }

    return{
        render: render,
        show: show,
        hide: hide
    }
})();

/*门店选择列表*/


var Invite = (function () {
    var viewpage, hasInit, sample, scroller,
        content, noticelist;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-invite');
            viewpage = $(div);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        viewpage.delegate('[data-cmd="ipt"]', {
            'keyup': function () {
                checkInputInfo();
            }
        });


        viewpage.delegate('[data-cmd="btn"]', {
            'click': function () {
                if (this.className == 'on') {
                    bindCode();
                }
            },
            'touchstart': function () {
            },
            'touchend': function () {
            }
        });
    }

    function bindCode() {
        var str = kdShare.trimStr(viewpage.find('[data-cmd="ipt"]')[0].value);
        if (str == "") {
            kdAppSet.showMsg("请输入验证码");
            return;
        }
        //输入邀请码，绑定邀请人
        Lib.API.get('BindInviteCode', { para: { inviteCode: str } },
            function (data, json) {
                var status = data.status;
                if (status == 0) {
                    location.reload();
                    //TODO
                    //綁定成功，是否刷新界面
                    //    var msg = "请刷新商城，获取最新价格信息";
                    //    jConfirm(msg, null, function (flag) {
                    //        if (flag) {
                    //            location.reload();
                    //        } else {
                    //            kdShare.backView();
                    //        }
                    //    }, { ok: "是", no: "否" });
                } else {
                    jAlert(data.Msg);
                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(kdAppSet.getAppMsg.workError);
            });
    }

    function checkInputInfo(dom) {
        var str = kdShare.trimStr(viewpage.find('[data-cmd="ipt"]')[0].value);
        if (str.length > 3) {
            viewpage.find('[data-cmd="btn"]').addClass('on');
        } else {
            viewpage.find('[data-cmd="btn"]').removeClass('on');
        }

    }

    function render(config) {
        debugger;
        initView();
        show();
    }

    function show() {
        kdAppSet.setAppTitle('输入邀请码');
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
var Money = (function () {
    var div , moneyarea , moneyPiechart, moneyDetail, scroller, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-Money');
            moneyarea = document.getElementById('div-money-top');
            moneyPiechart = document.getElementById('money-piechart');
            moneyDetail = document.getElementById('div-money-detail');
            scroller = Lib.Scroller.create(moneyarea);
            hasInit = true;
        }
    }


    function showPiechartDetail() {
        if (moneyPiechart && moneyDetail) {
            moneyPiechart.style.display = 'block';
            moneyDetail.style.display = 'block';
        }
    }

    function hidePiechartDetail() {
        if (moneyPiechart && moneyDetail) {
            moneyPiechart.style.display = 'none';
            moneyDetail.style.display = 'none';
        }
    }

    function removeHint() {
        $(moneyarea).children().filter('.hintflag').remove();
    }

    function load(fn) {
        var para = {};
        var para_data = {};
        para_data.ContactGUID = kdAppSet.getAppParam().openid;
        para.para = para_data;

        Lib.API.get('QueryArByCustomer', para,
            function (data, json) {
                fn && fn(data);
            }, function (code, msg) {
                removeHint();
                hidePiechartDetail();
                $(moneyarea).append('<div class="hintflag">' + msg + '</div>');
            }, function () {
                removeHint();
                hidePiechartDetail();
                $(moneyarea).append('<div class="hintflag">网络错误，请稍候再试</div>');
            });
    }

    function drawpie(a, b, c) {
        removeHint();
        showPiechartDetail();

        if (a == b == c == 0) {
            a = 100;
        }
        var color = ["#fbb517", "#ff4c50", "#0069ba"];
        var cen_x = $(document.body).width() / 2;
        var cen_y = 145;

        var data = [a, b, c];
        var canvas = document.getElementById("div-money-piechart");
        canvas.setAttribute("width", $(document.body).width());
        var ctx = canvas.getContext("2d");
        var startPoint = 1.5 * Math.PI;

        ctx.fillStyle = "#efefef";
        ctx.strokeStyle = "#efefef";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 131, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 130, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();

        for (var i = 0; i < data.length; i++) {
            ctx.fillStyle = color[i];
            ctx.strokeStyle = color[i];
            ctx.beginPath();
            ctx.moveTo(cen_x, cen_y);
            ctx.arc(cen_x, cen_y, 124, startPoint, startPoint - Math.PI * 2 * (data[i] / 100), true);
            ctx.fill();
            ctx.stroke();
            startPoint -= Math.PI * 2 * (data[i] / 100);
        }


        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 55, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cen_x, cen_y);
        ctx.arc(cen_x, cen_y, 50, startPoint, startPoint - Math.PI * 2 * 0.9999999, true);
        ctx.fill();
        ctx.stroke();

    }

    function deal_num(sum) {
        return Math.round(sum * 100) / 100
    }

    function render() {
        initView();
        show();
        hidePiechartDetail();
        $(moneyarea).children().filter('.hintflag').remove();
        $(moneyarea).append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');

        load(function (data) {
            var datail = data.ardetail;
            var beforemon = parseFloat(datail[0].amount);
            var mon = parseFloat(datail[1].amount);
            var aftermon = parseFloat(datail[2].amount);
            var total_amount = deal_num(beforemon + mon + aftermon);
            var total_amount_p = deal_num(Math.abs(beforemon) + Math.abs(mon) + Math.abs(aftermon));

            var mon_p = total_amount_p == 0 ? 0 : deal_num(Math.abs(mon) / total_amount_p * 100.0);
            var aftermon_p = total_amount_p == 0 ? 0 : deal_num(Math.abs(aftermon) / total_amount_p * 100.0);
            var beforemon_p = total_amount_p == 0 ? 0 : deal_num(Math.abs(beforemon) / total_amount_p * 100.0);

            drawpie(mon_p, beforemon_p, aftermon_p);
            document.getElementById("div-money-amount").innerHTML = "总计<br />￥" + kdAppSet.formatMoneyStr(total_amount);

            document.getElementById("money-mon").innerHTML = "￥" + kdAppSet.formatMoneyStr(mon) + " (" + mon_p + "%)";
            document.getElementById("money-beforemon").innerHTML = "￥" + kdAppSet.formatMoneyStr(beforemon) + " (" + beforemon_p + "%)";
            document.getElementById("money-aftermon").innerHTML = "￥" + kdAppSet.formatMoneyStr(aftermon) + " (" + aftermon_p + "%)";
            scroller.refresh();

            setTimeout(function () {
                scroller.refresh();
            }, 500);
        });
        scroller.refresh();
    }

    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();
/*分享有礼*/


var Share = (function () {
    var viewpage, hasInit, sample, scroller,
        userinfo;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-share');
            userinfo = kdAppSet.getUserInfo();
            viewpage = $(div);
            scroller = Lib.Scroller.create(div);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        viewpage.delegate('[data-cmd="sendmsg"]', {
            'click': function () {
                var msg = '使用邀请码' + userinfo.invitecode + "可享受" + (userinfo.contactName || userinfo.senderName) + "的价格优惠,到" + userinfo.cmpInfo.name + "任性买买买！ ";
                if (kdAppSet.isIPhoneSeries()) {
                    var msgUrl = "sms:&body=" + msg;
                } else {
                    var msgUrl = "sms:?body=" + msg;
                }
                window.location.href = msgUrl;
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });

        viewpage.delegate('[data-cmd="code"]', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });

        viewpage.delegate('[data-cmd="buyer"]', {
            'click': function () {
                var user = kdAppSet.getUserInfo();
                if (user.identity == "manager") {
                    kdAppSet.stopEventPropagation();
                    MiniQuery.Event.trigger(window, 'toview', ['BuyerList']);
                    kdAppSet.h5Analysis('me_myBuyer');
                }
                else {
                    showRightHint();
                }
            }
        });
    }

    function showRightHint() {
        OptMsg.ShowMsg('您不是采购主管,没有权限!', "", 1500);
    }

    function filltext() {
        viewpage.find('[data-cmd="shareinfo"]')[0].innerHTML = "已分享给" + userinfo.sharesum + "个好友," + userinfo.shareordersum + "个好友已购买";
        viewpage.find('[data-cmd="invite-code"]')[0].innerHTML = userinfo.invitecode;
        viewpage.find('[data-cmd="address"]')[0].innerHTML = kdAppSet.getShareLink();

        viewpage.find('[data-cmd="code"]').attr('src', OptUtils.getImgQrcodeUrl({
            url: kdAppSet.getShareLink()
        }));
    }


    function render() {
        debugger;
        initView();
        filltext();
        show();
    }

    function show() {
        kdAppSet.setAppTitle('分享有奖');
        viewpage.show();
        scroller.refresh(500);
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
var Trade = (function () {

    var div , tradearea , div_bar_1, div_bar_2 , div_bar_3 , div_bar_4 , div_bar_5,
        hasBind , scroller, ullist, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-trade');
            tradearea = document.getElementById('trade-detail-bar');
            div_bar_1 = '<li class="trade-bar" style="';
            div_bar_2 = '"><p>';
            div_bar_3 = '<em>￥';
            div_bar_4 = '</em></p><div class="trade-Div"><div class="trade-rect" style="';
            div_bar_5 = '"></div></di></li>';
            hasBind = false;
            scroller = null;
            ullist = $('#trade-datail');
            hasInit = true;
        }
    }

    function load(fn) {

        para = {};
        para_data = {};
        para_data.ContactGUID = kdAppSet.getAppParam().openid;
        para.para = para_data;

        Lib.API.get('GetTradeRecord', para,
            function (data, json) {
                fn && fn(data);
            }, function (code, msg) {
                removeHint();
                ullist[0].innerHTML = '';
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist[0].innerHTML = '';
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    function bindEvents() {

    }

    function roundFun(numberRound, roundDigit) {
        var str = String(numberRound);
        var strarr = str.split(".");
        if (parseInt(strarr[1].charAt[roundDigit]) >= 6) {
            return Math.round(sum * 100) / 100
        }
        else {
            return strarr[0] + "." + strarr[1].substring(0, roundDigit);
        }
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    function render() {
        initView();
        show();
        ullist[0].innerHTML = '';
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');

        load(function (data) {

            removeHint();
            var record = data.traderecord;
            var record_div = document.getElementById('trade-datail');
            var div_htmls = "";
            var total_amount = 0.0;
            for (var i = 0; i < record.length; i++) {
                (total_amount < parseFloat(record[i].amount)) && (total_amount = parseFloat(record[i].amount));
            }

            total_amount == 0 && (total_amount = 1);

            for (var i = 0; i < record.length; i++) {
                var div_html = "";
                var amount_p = record[i].amount / total_amount * 95.0;
                (amount_p <= 0.0) && (amount_p = 0);

                div_html += div_bar_1;
                div_html += div_bar_2;
                div_html += record[i].itemid + "月";
                div_html += div_bar_3;
                div_html += kdAppSet.formatMoneyStr(roundFun(record[i].amount, 2));
                div_html += div_bar_4;
                div_html += "width:" + amount_p + "%";
                div_html += div_bar_5;

                div_htmls += div_html;
            }
            div_htmls += "<div style='height:8px;'></div>";
            record_div.innerHTML = div_htmls;

            scroller.refresh();
            setTimeout(function () {
                if (scroller) {
                    scroller.refresh();
                }
            }, 500);
        });

        if (!hasBind) {
            bindEvents();
            hasBind = true;
        }

        (function (fn) {
            var reload = arguments.callee;
            if (!scroller) {
                scroller = Lib.Scroller.create(tradearea);
                scroller.pulldown({
                    selector: '#divPulldown',
                    start: 10,
                    end: 65,
                    top: 55,
                    fn: function (reset) {
                        reload(function () {
                            reset();
                        });
                    }
                });
            }
            else {
                scroller.refresh();
            }
            fn && fn(render());
        })();


    }

    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();
var Express = (function () {

    var div, orderexpressarea, expressul, orderul, orderultemp,
        scroller, Targetorder, expressnumber, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-express');
            orderexpressarea = document.getElementById('express-scrollarea');
            expressul = document.getElementById('expressul');
            orderul = document.getElementById('orderul');
            orderultemp = $.String.between(orderul.innerHTML, '<!--', '-->');
            scroller = null;
            Targetorder = {};
            expressnumber = '';
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        //物流信息查询
        $(div).delegate('.express-query', {
            'click': function () {
                OptExpress.ShowExpress(expressnumber);
            }
        });
    }

    function removeHint() {
        $(orderul).children().filter('.hintflag').remove();
        $(orderul).children().filter('.spacerow').remove();
    }

    function render(config) {
        initView();
        show();
        $('#kdloading').hide();
        if (config != undefined) {
            Targetorder = config.item;
        }
        $('#express-billno').html(Targetorder.billno);
        $('#express-date').html(Targetorder.date);
        $('.express-express').hide();
        getOrderDetaildata();
    }

    function getExpressDuration() {
        var billdata = $('#express-date').html();
        var startTime = billdata.substr(0, 10);
        var startTimes = startTime.split('-');
        var startDate = new Date();
        startDate.setFullYear(startTimes[0], startTimes[1] - 1, startTimes[2]);
        var endDate = new Date();
        var endTd = $('#orderul');
        var endItem = endTd.parent().find('.second-td');
        if (endTd.length != 0 && endItem.length != 0) {
            for (var i = 0; i < endItem.length; i++) {
                var state = endItem[i].children[0].innerHTML;
                state = state.match('已发货');
                if (state) {
                    var endTime = endItem[i].children[1].innerHTML;
                    var endTimes = endTime.split('-');
                    endDate.setFullYear(endTimes[0], endTimes[1] - 1, endTimes[2]);
                    break;
                }
            }
        }
        var oneDay = 1000 * 60 * 60 * 24;
        var duration = Math.floor(Math.abs((endDate - startDate) / oneDay));
        duration = !isNaN(duration) ? duration : '--';
        $('#express-duration').html(duration);
    }


    function getOrderDetaildata() {

        var reload = arguments.callee;
        orderul.innerHTML = '';
        $(orderul).children().filter('.hintflag').remove();
        $(orderul).append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        $(orderul).children().filter('.spacerow').remove();
        $(orderul).append('<li class="spacerow"></li>');
        var para = {};
        para.currentPage = 1;
        para.ItemsOfPage = 50;
        para.para = { Interid: Targetorder.interid };

        getOrderTrackAPI(function (data) {

            var list = data;
            if (list.reverse) {
                list.reverse();
            }
            var endstyle = 'express-table-end sprite-linebottom';
            var normalstyle = 'express-table-normal sprite-line';
            orderul.innerHTML = $.Array.keep(list, function (item, index) {
                var expressQuery = '';

                var outbillno = item.foutbillno || '';
                if (outbillno) {
                    outbillno = '出库单：' + outbillno;
                }

                //var express = item.fwlnumber || '';
                //if (express) {
                //    expressnumber = express;
                //    express = '物流单：' + express;
                //}
                //var expressCmp = kdShare.StrNumToPhone(item.fwlcompay) || '';
                //if (expressCmp) {
                //    express = express + '(' + expressCmp + ')';
                //}
                //if (express) {
                //    express = express + '    ';
                //    expressQuery = '[物流查询]';
                //}


                var expressCmp = kdShare.StrNumToPhone(item.fwlcompay) || '';
                if (expressCmp) {
                    expressCmp = '物流公司：' + expressCmp;
                }

                var wlnumber = item.fwlnumber || '';
                if (wlnumber) {
                    expressnumber = wlnumber;
                    wlnumber = '物流单号：' + wlnumber + '    ';
                    expressQuery = '[物流查询]';
                }

                return $.String.format(orderultemp, {
                    'status': item.ftitle,
                    'time': item.fdate,
                    'out-bill': outbillno,
                    'wlcompay': expressCmp,
                    'wlnumber': wlnumber,
                    'express-query': expressQuery,
                    'style': index == '0' ? endstyle : normalstyle
                });
            }).join('');

            getExpressDuration();
            if (!scroller) {
                scroller = Lib.Scroller.create(orderexpressarea);
                var option = {
                    hinttop: 1.5,
                    fnfresh: function (reset) {
                        orderul.innerHTML = '';
                        reload();
                        reset();
                    },
                    hintbottom: -0.4
                };
                kdctrl.initkdScroll(scroller, option);
            }
            else {
                scroller.refresh();
            }
            $('#kdloading').hide();
        }, para);
    }

    function getOrderTrackAPI(fn, para) {
        Lib.API.get('GetOrderTrack', para,
            function (data, json) {
                fn && fn(data['statuslist']);
            }, function (code, msg, json, root, userflag) {
                removeHint();
                $(orderul).append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                $(orderul).append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    function show() {
        $(div).show();
    }

    function hide() {
        $(div).hide();
    }


    return {
        render: render,
        show: show,
        hide: hide
    };


})();


var Mkd100 = (function () {

    var div , diviframe , iframehtml, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view_kd100');
            diviframe = document.getElementById('div_kd100iframe');
            iframehtml = '<iframe style="display: none;border: none;" scrolling="no"  class="kd100" name="kd100frame" id="kd100frame"  width="100%" height="100%" src=""></iframe>';
            bindEvents();
            hasInit = true;
        }
    }


    function render(config) {
        initView();

        $("#kd100frame").attr("width", window.screen.width);
        $("#kd100frame").attr("height", window.screen.height);
        var kd100url = config.url;

        show();
        $(diviframe).append(iframehtml);
        var kd100frame = document.getElementById('kd100frame');
        kd100frame.scrolling = "auto";
        $("#kd100frame").attr("src", kd100url);
        $("#kd100frame").show();

    }

    function bindEvents() {
        $("#hideback_kd100").bind("click", function () {
            return false;
        });
    }

    function show() {
        $(div).show();
    }


    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
            $("#kd100frame").remove();
        }
    };

})();
/*商品导购页面*/

var HotList = (function () {

    var div, divList , ul , sample , scroller , list , currentPage, itemsOfPage, TotalPage,
        ullist, areaSel, dateSel,title,
    //0 按金额 1 按数量 2 按库存
        orderType,
        maxNumber, imgname10, imgname05, imgname00, endTime, hasInit, iheight;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-hotgoods');
            divList = document.getElementById('hotlistdiv');
            FastClick.attach(divList);
            ul = divList.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            scroller = null;
            list = [];
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            areaSel = {name: "全部区域", id: -1};
            dateSel = {BeginDate: "2014-01-01", EndDate: "2014-01-01"};
            orderType = 1; //0 按金额 1 按数量 2 按库存
            maxNumber = 100;
            imgname10 = "start10";
            imgname05 = "start05";
            imgname00 = "start00";
            endTime = " 23:59:59";
            bindEvents();
            iheight = $(window).height() - 44 - 40 - 55;
            initScroll();
            hasInit = true;
        }
    }

    function initScroll() {
        scroller = Lib.Scroller.create(divList);
        var option = {
            fnfresh: function (reset) {
                reset();
                reSearch();
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                render();
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    function load(fn) {
        Lib.API.get('GetSalesRanking', {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: {
                BeginDate: dateSel.BeginDate,
                EndDate: dateSel.EndDate + endTime,
                Area: areaSel.id,
                CountType: orderType
            }
        }, function (data, json) {
            TotalPage = json.TotalPage ? json.TotalPage : 0;
            var inum = list.length;
            if (currentPage == 1) {
                maxNumber = Number(data.MaxAmount);
            }
            var imgMode = kdAppSet.getImgMode();
            var noimgModeDefault = kdAppSet.getNoimgModeDefault();
            var datalist = $.Array.keep(data.List || [], function (item, index) {
                    var pw = 1;
                    var imgname1 = imgname00;
                    var imgname2 = imgname00;
                    var imgname3 = imgname00;
                    var imgname4 = imgname00;
                    var imgname5 = imgname00;

                    if (maxNumber > 0) {
                        pw = Math.floor(item.FtotalQty / maxNumber * 10);
                        switch (pw) {
                            case 1:
                                imgname1 = imgname05;
                                break;
                            case 2:
                                imgname1 = imgname10;
                                break;
                            case 3:
                                imgname1 = imgname10;
                                imgname2 = imgname05;
                                break;
                            case 4:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                break;
                            case 5:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname05;
                                break;
                            case 6:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                break;
                            case 7:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname05;
                                break;
                            case 8:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname10;
                                break;
                            case 9:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname10;
                                imgname5 = imgname05;
                                break;
                            case 10:
                                imgname1 = imgname10;
                                imgname2 = imgname10;
                                imgname3 = imgname10;
                                imgname4 = imgname10;
                                imgname5 = imgname10;
                                break;
                        }
                    }

                    var imgUrl=item.FImgUrl || '';
                    return {
                        index: inum + index,
                        name: item.FName,
                        itemid: item.FItemID,
                        money: item.FTotalAmount,
                        num: item.FtotalQty,
                        imgurl: imgUrl != '' ? (imgMode ? kdAppSet.getImgThumbnail(imgUrl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                        stocknum: (item.FQty == null) ? 0 : item.FQty,
                        model: item.FModel,
                        note: item.FNote || "",
                        newflag: item.NewFlag,
                        cuxiaoflag: item.CuXiaoFlag,
                        unitid: item.FUnitID,
                        price: item.FPrice || 0,
                        unitname: item.FUnitName,
                        imgname1: imgname1,
                        imgname2: imgname2,
                        imgname3: imgname3,
                        imgname4: imgname4,
                        imgname5: imgname5
                    };
                }
            );
            var jnum = datalist.length;
            for (var j = 0; j < jnum; j++) {
                list.push(datalist[j]);
            }
            fn && fn(datalist);
            scroller.isPageEnd = (currentPage >= TotalPage);

        }, function (code, msg) {
            removeHint();
            ullist.append('<li class="hintflag">' + msg + '</li>');

        }, function () {
            removeHint();
            ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
        }, "");
    }


    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    function fill(a) {
        var listStr = $.Array.keep(a, function (item) {
            var stockinfo = kdAppSet.getStockStr(item.stocknum, item.unitname);
            var stocknum = stockinfo.stockStr;
            var colormsg = stockinfo.color;

            return $.String.format(sample, {
                index: item.index,
                name: item.name,
                money: item.money,
                num: item.num + " " + item.unitname,
                imgurl: item.imgurl,
                stocknum: stocknum,
                colormsg: colormsg,
                pwidth: item.pwidth,
                newflag: (item.newflag == 1) ? "display:block;" : "display:none;",
                cuxiaoflag: (item.cuxiaoflag == 1) ? "display:block;" : "display:none;",
                imgname1: item.imgname1,
                imgname2: item.imgname2,
                imgname3: item.imgname3,
                imgname4: item.imgname4,
                imgname5: item.imgname5
            });
        }).join('');

        removeHint();
        if (currentPage > 1) {
            ullist.append(listStr);
        } else {
            ul.innerHTML = listStr;
            if (a.length == 0) {
                ul.innerHTML = kdAppSet.getEmptyMsg(iheight);
            }
        }
        scroller.refresh();
    }


    function bindEvents() {

        $(".hotlist").delegate('.rightinfo', {
            'click': function () {
                var index = $(this).attr('index');
                var curitem = list[index];
                var item = {
                    num: curitem.stocknum,
                    cuxiaoflag: curitem.cuxiaoflag,
                    img: curitem.imgurl,
                    index: 0,
                    itemid: curitem.itemid,
                    price: curitem.price,
                    model: curitem.model,
                    name: curitem.name,
                    newflag: curitem.newflag,
                    note: curitem.note,
                    unitid: curitem.unitid,
                    unitname: curitem.unitname
                };
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', {
                    item: item
                }]);
                return false;
            },
            'touchstart': function () {
                $(this).parents('li').css('background', '#d9dadb');
                $(this).parent().find(".hotimg").css('background', '#fff');
            },
            'touchend': function () {
                $(this).parents('li').css('background', '#fff');
            }
        });


        $("#hotorder1,#hotorder2").bind("click", function () {
            var idclick = $(this).context.id;
            if (idclick == "hotorder1") {
                if (orderType != 1) {
                    tabclick(1);
                    reSearch(true);
                }
            } else if (idclick == "hotorder2") {
                if (orderType != 2) {
                    tabclick(2);
                    reSearch(true);
                }
            }
        });

        $(".datePan2 #btnArea").bind("click", function () {
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {selobj: areaSel,
                api: 'GetAreaInfo',
                para: {},
                callBack: function (selObj) {
                    if (areaSel.id == selObj.id) {
                    } else {
                        areaSel.id = selObj.id;
                        areaSel.name = selObj.name;
                        $("#btnArea")[0].innerText = areaSel.name;
                        reSearch();
                    }
                }}]);
        });
        tabclick(1);
        dateSel.EndDate = $.Date.format($.Date.now(), "yyyy-MM-dd");
        var now = $.Date.now();
        now.setDate(now.getDate() - 30);
        dateSel.BeginDate = $.Date.format(now, "yyyy-MM-dd");
    }


    function tabclick(index) {
        $(".hotTab .tab").css({"color": "#686F76"});
        $(".hotTab .bline").hide();
         if (index == 1) {
            orderType = 1;
            $("#hotorder1").css({"color": "#FF6427"});
            $("#hotorder1 .bline").css({"display": "inline-block"});
        } else if (index == 2) {
            orderType = 2;
            $("#hotorder2").css({"color": "#FF6427"});
            $("#hotorder2 .bline").css({"display": "inline-block"});
        }
    }


    function render(config) {
        initView();
        if (config) {
            title = config.title;
        }
        show();
        if (currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        }
        (function (fn) {
            load(function (data) {
                fill(data);
                fn && fn();
            });
        })();

    }

    function reSearch(bchange) {
        currentPage = 1;
        TotalPage = 1;
        if (bchange) {
            scroller.scrollTo(0, 0, 500);
            ul.innerHTML = '';
        }
        list.length = 0;
        render();
    }

    function show() {
        $(div).show();
        kdAppSet.setAppTitle(title);
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };

})();
var PaymentList = (function () {
    var div , viewpage,
        sample,
        tabNum,
        itemsOfPage,
        listviews,
         //0待付款 1微信支付 2线下支付
        listStatus={
            all:0,
            wxpay:1,
            offline:2
        },
        curTabIndex,
        itemsOfPage ,
        iheight, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            tabNum = 3;
            div = document.getElementById('viewid_paymentList');
            viewpage = $(div);
            sample = $.String.between(document.getElementById('paymentlist_list0').innerHTML, '<!--', '-->');
            listviews = [];
            initListView();
            itemsOfPage = 10;
            curTabIndex = 0;
            iheight = $(window).height() - 44 - 40;
            bindEvents();
            bindScrollEvents();
            hasInit = true;
        }
    }

    //初始化列表视图数据
    function initListView() {
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('paymentlist_listwrap' + i);
            var listv = document.getElementById('paymentlist_list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            var listview = {
                listv: listv,
                listwrap: $(listwrap),
                scroller: scroller,
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh:false
            };
            listviews.push(listview);
        }
    }

    //设置iscroll滚动组件
    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {
                reSearch();
                reset();
            },
            fnmore: function (reset) {
                GetOrderList();
                reset();
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }


    //根据条件获取列表数据 bfresh 是否要求强制刷新
    function getOrderListByCondition(index, bfresh) {
        curTabIndex = index;
        var listview = listviews[index];
        $('.paymentlist').hide();
        changePageView(index);
        listview.listwrap.show();
        if (!listview.fresh || bfresh ) {
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            listview.fresh=true;
            GetOrderList();
        }
    }

    function removeHint(tabindex) {
        var ullist= getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    //获取当前list操作
    function getOptlist(index){
        return $(listviews[index].listv);
    }

    //根据模板获取列表字符串信息
    function getTemplateStr(item,tabindex) {
        var listr = $.String.format(sample, {
            billno: item.billno,
            status: getStatusName(item.status),
            statuscolor: getStatusColor(item.status),
            money: kdAppSet.getRmbStr+kdAppSet.formatMoneyStr(item.money),
            time: item.date,
            index: item.index,
            tabindex: tabindex
        });
        return listr;
    }

    function getStatusColor(status) {
        //status -1 已失效 0 待确认 1已确认
        var colors=['lost','checking','checked'];
        return colors[status+1];
    }

    function getStatusName(status) {
        //status -1 已失效 0 待确认 1已确认
        var s=['已失效','待确认','已确认'];
        return s[status+1];
    }


    //获取数据列表html字符串
    function getListHtml(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var listr = getTemplateStr(item,tabindex);
            htmlstr += listr;
        }
        return htmlstr;
    }

    //获取订单列表
    function GetOrderList() {
        var index = curTabIndex;
        var listview = listviews[index];
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            return;
        }
        var para = {
            currentPage:listview.currentPage,
            ItemsOfPage:itemsOfPage
        };
        var ullist=getOptlist(index);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }
        var optOpenid = kdAppSet.getUserInfo().optid;
        var parax = {
            optOpenid: optOpenid,
            Option: getOption(curTabIndex)
        };
        para.para = parax;
        GetListAPI(function (data, indexflag) {
            var listview2 = listviews[indexflag];
            var htmlstr = getListHtml(data, listview2.listdata, indexflag);
            var listv = listview2.listv;
            if (htmlstr == "" && listview2.currentPage == 1) {
                listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
            } else {
                if (listview2.currentPage == 1) {
                    listv.innerHTML = htmlstr;
                } else {
                    listv.innerHTML += htmlstr;
                }
            }
            listview2.scroller.refresh();
            listview2.currentPage += 1;
        }, para);
    }


    function getOption(tabindex){
       // -1：全部； 0：线下支付； 1：微信支付
        var options=[-1,1,0];
        return options[tabindex];
    }

    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);
    }

    function setTotalPage(index, json) {
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    function getListData(data,tabindex){
        var pageNum=(listviews[tabindex].currentPage - 1) * itemsOfPage;
        list= $.Array.keep(data['saledlist'] || [], function (item, index) {
            return {
                index: pageNum+ index,
                interid: item.payorderinterid,
                money: item.paymoney,
                status: Number(item.paystatus),
                billno: item.payno,
                date: item.paydate,
                orderno: item.payorder || '',
                payno: item.payno
            };
        });
        return list;
    }

    //调用付款单列表api
    function GetListAPI(fn, para) {
        Lib.API.get('GetPayListInfo', para,
            function (data, json, root, tabindex) {
                removeHint(tabindex);
                setTotalPage(tabindex, json);
                var list=getListData(data,tabindex);
                fn && fn(list, tabindex);
                setScrollPageEnd(tabindex);
            }, function (code, msg, json, root, tabindex) {
                var index = tabindex || curTabIndex;
                removeHint(index);
                var ullist =getOptlist(index);
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint(curTabIndex);
                var ullist = getOptlist(curTabIndex);
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            }, curTabIndex);
    }

    //订单页签切换
    function changePageView(tabindex) {
        var headtab = viewpage.find(".headtab");
        var tabs = headtab.find('.tab');
        var listviews = viewpage.find(".paymentlist");
        var linebs = headtab.find('.lineb');
        tabs.css('color', '#686f76');
        linebs.hide();
        listviews.hide();
        $(linebs[tabindex]).show();
        $(listviews[tabindex]).show();
        $(tabs[tabindex]).css('color', '#FF753E');
    }


    function bindEvents() {

        MiniQuery.Event.bind(window, {
            'freshPaymentListInfo': function () {
                freshPaymentList();
            }
        });

        $("#viewid_paymentList .headtab .tab").bind('click', function () {
            var dataindex = this.getAttribute("data-index");
            getOrderListByCondition(dataindex);
        });

        for (var i = 0; i < tabNum; i++) {
            ListBindEvents(listviews[i].listv);
        }

        viewpage.delegate('.add_PayOrder',{
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                    {
                        newbill:true,
                        payNo: '',
                        payOrder: ''
                    }
                ]);
            },
            'touchstart': function () {
                $(this).addClass('addNo_Touched');
            },
            'touchend': function () {
                $(this).removeClass('addNo_Touched');
            }
        });
    }

    function ListBindEvents(ulobj) {

        $(ulobj).delegate('li', {
            'click': function () {
                var tabindex = this.getAttribute('tabindex');
                var index=this.getAttribute('index');
                var item=listviews[tabindex].listdata[index];
                MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                    {
                        payNo: item.payno,
                        payOrder: item.orderno
                    }
                ]);

            },
            'touchstart': function () {
                $(this).parents('li').css('background', '#fff');
                $(this).css('background-color', '#d9dadb');
            }, 'touchend': function () {
                $(this).css('background-color', '#fff');
            }
        });
    }


    function freshPaymentList() {
        if(hasInit){
            getOrderListByCondition(curTabIndex, true);
        }
    }

    function reSearch(bsearch) {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.currentPage = 1;
        listview.listdata.length = 0;
        if (bsearch) {
            listview.scroller.scrollTo(0, 0, 500);
            listview.listv.innerHTML = '';
        }
        GetOrderList();
    }

    function render(config) {
        initView();
        show();
        kdAppSet.setKdLoading(false);
        var tabindex = config.tabindex || 0;
        getOrderListByCondition(tabindex);
    }

    function show() {
        $(div).show();
        kdAppSet.setAppTitle('我的付款');
        kdAppSet.setKdLoading(false);
        listviews[curTabIndex].scroller.refresh();
    }

    function hide() {
        $(div).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();


/*门店待提货列表*/


var PickUpList = (function () {
    var sample, scroller, pickupList, pickul, ullist, config,
        viewPage, showHint, currentPage, itemsOfPage, TotalPage, hasInit, list;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-pickup-list');
            viewPage = $(div);
            var divlist = viewPage.find('[data-cmd="scroll-view"]')[0];
            pickul = document.getElementById('ul-view-pickup-list');
            ullist = $(pickul);
            sample = $.String.between(pickul.innerHTML, '<!--', '-->');
            pickupList = [];
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            bindEvents();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            fnfresh: function (reset) {
                reset();
                pickupList = [];
                currentPage = 1;
                getPickUpList();
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                getPickUpList();
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 获取待提货列表
    function getPickUpList() {

        loadingHint();
        Lib.API.get('GetMyTakingBillList', {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: {}
        },
            function (data, json) {
                TotalPage = json.TotalPage ? json.TotalPage : 0;
                list = getListData(data.TakingBillList);
                // 填充模板
                freshList();
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }


    function getListData(data) {
        showHint = true;
        var listOther = [];
        var list = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            var aitem = {
                billid: item.billid,
                store: item.storename,
                address: item.storeaddress,
                phone: item.storephone,
                money: item.billmoney,
                num: item.qty,
                takecode: item.takecode,
                takedate: item.takedate,
                goodsName: getName(item.itemList),
                lat: item.lat,
                lng: item.lng,
                storename: item.storename
            };
            listOther.push(aitem);
        }
        return (list.length > 0 ? list : listOther)
    }


    function getName(list) {
        var alist = list || [];
        var len = alist.length;
        var name = '';
        if (len == 1) {
            name = alist[0].name;
        }
        if (len > 1) {
            name = alist[0].name;
            name = name + '...';
        }
        return name;
    }

    // 填充待提货列表
    function freshList() {
        pickupList = currentPage == 1 ? list : pickupList.concat(list);
        var listStr = $.Array.keep(list, function (item, index) {
            return $.String.format(sample, {
                index: index + (currentPage - 1) * itemsOfPage,
                store: item.store,
                address: item.address,
                phone: item.phone,
                money: item.money,
                imgurl: getImgQrcodeUrl(item.takecode),
                num: item.num,
                takecode: item.takecode,
                takedate: item.takedate,
                goodsName: item.goodsName
            });
        }).join('');
        removeHint();
        if (pickupList.length == 0) {
            pickul.innerHTML = '<div class="emptySearch">' +
                '<img src="img/empty.png"><span>抱歉,您没有待提货信息</span></div>';
        } else {
            if (currentPage == 1) {
                pickul.innerHTML = listStr;
            } else {
                pickul.innerHTML += listStr;
            }
        }
        scroller.isPageEnd = (currentPage >= TotalPage);
        scroller.refresh();
    }

    function getImgQrcodeUrl(takeCode) {
        var discribe = '';
        var url = takeCode;
        var logourl = '';
        var timestamp = Math.round(new Date().getTime() / 1000);
        var token = Lib.MD5.encrypt(discribe + "kingdee_xxx" + timestamp);
        var qrImg = 'http://mob.cmcloud.cn/ServerCloud/WDH/genGoodsQRcode?';
        qrImg = qrImg + 'discribe=' + encodeURIComponent(discribe) + '&url=' + encodeURIComponent(url)
            + '&logourl=' + encodeURIComponent(logourl) + '&timestamp=' + timestamp + '&token=' + token;
        return qrImg;
    }


    // 移除加载提示信息
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }

    // 绑定事件
    function bindEvents() {
        viewPage.delegate('[data-cmd="detail"]', {
            'click': function (event) {
                var index = this.getAttribute('data-index');
                var target = event.target;
                var node = target.nodeName;
                if (node == 'A' || node == 'IMG') {
                    return;
                }
                if (target.getAttribute('data-cmd') == 'guide') {
                    //导航
                    navigation(index);
                    return;
                }
                var index = this.getAttribute('data-index');
                var billid = pickupList[index].billid;
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                    billId: billid
                }]);

            },
            'touchstart': function () {
                $(this).addClass('pressed');
            },
            'touchend': function () {
                $(this).removeClass('pressed');
            }
        });

        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            }
        });
    }

    //门店导航--2016-4-18 by mayue
    function navigation(index) {
        var address = list[index].address;
        var lng = list[index].lng;
        var lat = list[index].lat;
        if (lat == 0 && lng == 0) {
            Gaode.regeocoder(address, function (location) {
                if (location.result == "complete") {
                    lng = location.lng;
                    lat = location.lat;
                    mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + list[index].storename;
                    MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
                } else {
                    OptMsg.ShowMsg('地址有误，请联系客服', "", 3000);
                    return false;
                }
            });
        } else {
            mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + list[index].storename;
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
        }
    }

    function render(configp) {
        config = configp || {};
        initView();
        show();
        pickul.innerHTML = '';
        getPickUpList();
    }

    // 显示加载提示信息
    function loadingHint() {

        ullist.children().filter('.hintflag').remove();
        ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<div class="spacerow"></div>');
    }


    function show() {
        kdAppSet.setAppTitle('待提货列表');
        viewPage.show();

    }

    function hide() {
        viewPage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();
var failureLogin = (function () {
    var div, hasInit, scroller;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_failureLogin');
            scroller = Lib.Scroller.create($(div)[0]);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        $(div).delegate('.phoneDiv a', {
            'touchstart': function () {
                $(this).addClass('button_touched');
            },
            'touchend': function () {
                $(this).removeClass('button_touched');
            }
        });
        $(div).delegate('.joinDiv .button', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['registerDetail',
                    {mobile: $(div).find('#phone').html()}]);
            },
            'touchstart': function () {
                $(this).addClass('button_touched');
            },
            'touchend': function () {
                $(this).removeClass('button_touched');
            }
        })
    }

    function render(config) {
        initView();
        show();
        scroller.refresh();
        $(div).find('#phone').html(config.mobile);
        var servicePhone='';
        var service=OptMsg.getMsgServiceList();
        if(service.length>0){
            servicePhone=service[0].servicePhone;
        }
        // var servicePhone = kdAppSet.getUserInfo().servicePhone;
        $(div).find('.phoneDiv a').attr("href", "tel:" + servicePhone);
    }

    function show() {
        $(div).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
        }
    };


})();
/*提交商机 主页页面*/

var registerDetail = (function () {
    var div, scroller, hasInit, gender,shopurl;
    var constStr = {
        name: '您的称呼',
        mobile: '您的手机',
        company: '您的公司'
    };

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_registerDetail');
            scroller = Lib.Scroller.create(div);
            shopurl=kdAppSet.getUserInfo().shopurl;
            if(shopurl==''){
                $('#viewid_registerDetail .retailCust').hide();
                $('#registerDetail_submit').css('width','100%');
            }
            bindEvents();
            gender = 1;
            hasInit = true;
        }
        initPrompt();
    }

    function initPrompt() {
        selectGender(false);
        $('#registerDetail_Name').html(constStr.name);
        $('#registerDetail_Mobile').html(constStr.mobile);
        $('#registerDetail_Company').html(constStr.company);
    }

    function selectGender(isLady) {

        var female = $('#registerDetail_Gender').find('.female');
        var man = $('#registerDetail_Gender').find('.man');

        if (isLady) {
            female.addClass('sprite-check_green');
            female.addClass('gender_touched');
            man.removeClass('sprite-check_green');
            man.removeClass('gender_touched');
            gender = 0;
        } else {
            female.removeClass('sprite-check_green');
            female.removeClass('gender_touched');
            man.addClass('sprite-check_green');
            man.addClass('gender_touched');
            gender = 1;
        }
    }

    function isPrompt(htmlStr, prompt) {

        return !!(kdShare.trimStr(htmlStr) == prompt || kdShare.trimStr(htmlStr) == '');

    }

    function inputFocus(obj, prompt) {
        if (isPrompt($(obj).val(), prompt)) {
            $(obj).val('');
        }
        $(obj).addClass('input_touched');
        $(obj).parent().addClass('input_li_touched');
    }

    function inputBlur(obj, prompt) {
        if (isPrompt($(obj).val(), prompt)) {
            $(obj).val(prompt);
            $(obj).removeClass('input_touched');
        }
        $(obj).parent().removeClass('input_li_touched');
    }

    function submitCheck() {
        var name = kdShare.trimStr($('#registerDetail_Name').val());
        if (name == constStr.name || name == '') {
            jAlert("请输入姓名!");
            return false;
        }

        var mobile = kdShare.trimStr($('#registerDetail_Mobile').val());
        mobile = kdShare.getPureNumber(mobile);

        if (mobile == constStr.mobile || mobile == '') {
            jAlert("请输入手机号码!");
            return false;
        }
        if (!kdShare.isMobileNumber(mobile)) {
            jAlert("请输入正确的手机号码!");
            return false;
        }
        return true;
    }

    function getRegisterData() {
        var data = {};
        data.Name = kdAppSet.ReplaceJsonSpecialChar(kdShare.trimStr($('#registerDetail_Name').val()));
        data.Phone = kdAppSet.ReplaceJsonSpecialChar(kdShare.trimStr($('#registerDetail_Mobile').val()));
        var company = kdShare.trimStr($('#registerDetail_Company').val());
        if (company == constStr.company || company == '') {
            data.ComName = '';
        } else {
            data.ComName = kdAppSet.ReplaceJsonSpecialChar(company);
        }
        data.Sex = gender;
        var appParam=kdAppSet.getAppParam();
        if(appParam.crmOpenid){
            data.Source=2;
        }
        data.openid=appParam.crmOpenid || '';
        return data;
    }

    function sendRegisterData(custdata) {
        Lib.API.post('SubmitIntention', {
            para: custdata
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
            afterSubmitSccess();
            //意向客户ID
            custdata.custid=data.ID || '';
            OptMsg.SendBusinessMsgToManager(custdata);
        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            jAlert(msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            jAlert('网络错误，请稍候再试');
        });
    }

    function afterSubmitSccess() {
        $('#registerDetail_Img').attr('class', 'sprite-success_face');
        $('.afterRegisterDiv').show();

        var retBtn=$('.view_registerDetail .afterRegisterDiv .returnBtn');
        var userinfo=kdAppSet.getUserInfo();
        if(!userinfo.cmpInfo.allowRetail  && userinfo.identity=='retail'){
            //不允许零售用户访问
            retBtn.hide();
        }else{
            retBtn.show();
        }
		autoback();
    }
	
	function autoback() {
        var s = document.getElementById("autoback");
        s.innerHTML = 3;
        var autoback = window.setInterval(function () {
            if (s.innerHTML <= 1) {
				clearInterval(autoback);
				MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
            }
            s.innerHTML = s.innerHTML * 1 - 1;
        }, 1000);
    }

    function initComponyInfo() {
        var cmpInfo = kdAppSet.getUserInfo().cmpInfo;
        $('#registerDetail_logo').attr('src', cmpInfo.img);
        $('#registerDetail_CName').html(cmpInfo.name);
        $(div).find('.footer .phone').html(cmpInfo.phone);
        $(div).find('#welcomeMsg').html(cmpInfo.welcome);
        $(div).find('.footer .address').html(cmpInfo.address);
        $(div).find('.footer a').attr('href', 'tel:' + cmpInfo.phone);
    }

    function bindEvents() {
        $('#viewid_registerDetail').delegate('#registerDetail_Name', {
            'focus': function () {
                inputFocus(this, constStr.name);
            },
            'blur': function () {
                inputBlur(this, constStr.name);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Mobile', {
            'focus': function () {
                inputFocus(this, constStr.mobile);
            },
            'blur': function () {
                inputBlur(this, constStr.mobile);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Company', {
            'focus': function () {
                inputFocus(this, constStr.company);
            },
            'blur': function () {
                inputBlur(this, constStr.company);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Gender .female', {
            'click': function () {
                selectGender(true);
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Gender .man', {
            'click': function () {
                selectGender(false);
            }
        });

        //提交注册
        $('#viewid_registerDetail').delegate('#registerDetail_submit', {
            'click': function () {
                if (!submitCheck()) {
                    return false;
                }
                kdAppSet.setKdLoading(true, '正在注册...');
                var data = getRegisterData();
                sendRegisterData(data);
            },
            'touchstart': function () {
                $(this).addClass('submit_touched');
            },
            'touchend': function () {
                $(this).removeClass('submit_touched');
            }
        });

        //去商城
        $('#viewid_registerDetail').delegate('.retailCust', {
            'click': function () {
                if(shopurl!=''){
                    window.location.href=shopurl;
                }
            },
            'touchstart': function () {
                $(this).addClass('retailCust_touched');
            },
            'touchend': function () {
                $(this).removeClass('retailCust_touched');
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_ReturnBtn', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {}]);
            },
            'touchstart': function () {
                $(this).addClass('submit_touched');
            },
            'touchend': function () {
                $(this).removeClass('submit_touched');
            }
        });

        $('#viewid_registerDetail').delegate('#registerDetail_Curtain', {
            'touchstart': function (event) {
                event.stopPropagation();
                return false;
            }
        });
        $('#viewid_registerDetail').delegate('.footer .phone', {
            'touchstart': function () {
                $(this).addClass('a_touched');
            },
            'touchend': function () {
                $(this).removeClass('a_touched');
            }
        })
    }

    function render(config) {
        initView();
        show();
        if (config.mobile) {
            $("#registerDetail_Mobile").val(config.mobile);
            $("#registerDetail_Mobile").addClass('input_touched');
        }

        var name = kdAppSet.getUserInfo().contactName;
        if(name){
            $('#registerDetail_Name').val(name);
            $('#registerDetail_Name').addClass('input_touched');
        }
        initComponyInfo();
        scroller.refresh();
    }

    function show() {
        $(div).show();
        OptAppMenu.showKdAppMenu(false);
    }

    function hide() {
        $('.afterRegisterDiv').hide();
        $(div).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();
/*退货单编辑页面*/


var EditRejectBill = (function () {
    var div, scroller, divContent, hasInit, config, listdata, bsummiting, viewpage, sample,
        rejectType, keywordhint, mode,
        srcList = [], isNewBill, maxImgNum, finishEditRejectBill,
        uploadImageNum, serverIds;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_EditRejectBill');
            viewpage = $(div);
            divContent = document.getElementById('editRejectContent');
            listdata = {};
            bindEvents();
            sample = $.String.between(viewpage.find('.imgListDiv').html(), '<!--', '-->');
            keywordhint = '请输入您要备注的信息';
            initScroll(divContent);
            bsummiting = false;
            isNewBill = true;
            maxImgNum = 3;
            //是否回退
            finishEditRejectBill = false;
            uploadImageNum = 0;
            serverIds = [];
            hasInit = true;
        }
    }

    //初始化 按钮状态
    function initRejectBill() {
        rejectType = -1;
        btnUnSelected();
        viewpage.find('.refundBtn').addClass('typeBtn_touched');
        viewpage.find('.refundBtn').addClass('sprite-attr_select');
        viewpage.find('#rejectRemark').removeClass('textFocus');
        viewpage.find('#rejectRemark').val(keywordhint);
        viewpage.find('.imgListDiv').html('');
        viewpage.find('.addImgBtn').show();
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, {});
    }

    //获取已上传的图片
    function getImgList() {
        var imglist = [];
        var inum = srcList.length;
        for (var i = 0; i < inum; i++) {
            imglist.push(srcList[i].serverId);
        }
        return imglist;
    }

    // 绑定事件
    function bindEvents() {

        //查看退货详情
        viewpage.delegate('.rightInfoDiv', {
            'click': function () {
                if (mode == 1) {
                    //新增退货单
                    listdata.payImgList = getImgList();
                    listdata.moneytype = rejectType;
                }
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelectList', { data: listdata, mode: mode }]);
            },
            'touchstart': function () {
                $(this).parents('.contentTop').addClass('onclick');
            },
            'touchend': function () {
                $(this).parents('.contentTop').removeClass('onclick');
            }
        });

        // 退款类型点击事件
        viewpage.delegate('.refundBtn', {
            'click': function () {
                if (isNewBill) {
                    btnUnSelected();
                    btnSelected($(this));
                    rejectType = 0;
                }
            }
        });
        viewpage.delegate('.advanceBtn', {
            'click': function () {
                if (isNewBill) {
                    btnUnSelected();
                    btnSelected($(this));
                    rejectType = 1;
                }
            }
        });
        viewpage.delegate('.otherBtn', {
            'click': function () {
                if (isNewBill) {
                    btnUnSelected();
                    btnSelected($(this));
                    rejectType = 2;
                }
            }
        });

        // 备注焦点事件
        viewpage.delegate('.msgDiv textarea', {
            'focus': function () {
                $(this).addClass('textFocus');
            },
            'blur': function () {
                var valueStr = kdShare.trimStr($(this).val());
                if (valueStr == keywordhint || valueStr == '') {
                    $(this).removeClass('textFocus');
                }
            }
        });

        //提交退货单
        viewpage.delegate('.submitBtn', {
            'click': function () {
                if (uploadImageNum > 0) {
                    OptMsg.ShowMsg("正在上传图片,请稍后...", '', 1500);
                    return;
                }
                submitRejectBill();
            },
            'touchstart': function () {
                $(this).addClass('submitBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('submitBtn_touched');
            }
        });

        //取消提交退货单
        viewpage.delegate('.cancelBtn', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });

        //删除退货单
        viewpage.delegate('.deleteBtn', {
            'click': function () {
                var billid = config.billid;
                deleteBill(billid);
            },
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });


        // 添加图片事件
        viewpage.delegate('.addImgBtn', {
            'click': function () {
                if (isNewBill) {
                    getPhotoFromWX();
                }
            },
            'touchstart': function () {
                if (isNewBill) {
                    $(this).removeClass('sprite-addImg');
                    $(this).addClass('sprite-addImg_s');
                }
            },
            'touchend': function () {
                if (isNewBill) {
                    $(this).removeClass('sprite-addImg_s');
                    $(this).addClass('sprite-addImg');
                }
            }
        });

        //图片删除
        viewpage.delegate('.deleteImg', {
            'click': function () {
                if (isNewBill) {
                    var parent = $(this).parents('.imgBox');
                    var imgList = viewpage.find('.imgListDiv');
                    var src = parent.find('img').attr('src');
                    imgList[0].removeChild(parent[0]);
                    refreshSrcList(src);
                }
            }
        })
    }

    //退款类型选中
    function btnSelected(btnclick) {
        btnclick.addClass('typeBtn_touched');
        btnclick.addClass('sprite-attr_select');
    }

    //退款类型取消选中
    function btnUnSelected() {
        viewpage.find('.refundBtn').removeClass('typeBtn_touched');
        viewpage.find('.refundBtn').removeClass('sprite-attr_select');
        viewpage.find('.advanceBtn').removeClass('typeBtn_touched');
        viewpage.find('.advanceBtn').removeClass('sprite-attr_select');
        viewpage.find('.otherBtn').removeClass('typeBtn_touched');
        viewpage.find('.otherBtn').removeClass('sprite-attr_select');

    }

    //调用微信接口获取图片
    function getPhotoFromWX() {
        wx.chooseImage({
            success: function (res) {
                //待上传的img列表
                serverIds = [];
                var localIds = res.localIds;
                var imgNum = localIds.length;
                //可上传图片数
                var canUploadImgNum = maxImgNum - srcList.length;
                if (canUploadImgNum <= 0) {
                    return;
                }
                uploadImageNum = imgNum;
                if (uploadImageNum > canUploadImgNum) {
                    uploadImageNum = canUploadImgNum;
                }
                //如果是iphone系统则一次只传一个图片
                if (kdAppSet.isIPhoneSeries()) {
                    uploadImageNum = 1;
                }

                // 控制提交按键此时无效
                viewpage.find('.submitBtn').addClass('invalid_Btn');

                for (var i = 0; i < uploadImageNum; i++) {
                    var imgSrc = localIds[i];
                    // 创建图片
                    createImgElement(viewpage.find('.imgListDiv'), imgSrc);
                    uploadWXImg(imgSrc);
                }
            },
            fail: function () {
                uploadImageNum = 0;
            }
        });
    }


    // 上传微信图片
    function uploadWXImg(imgSrc) {

        wx.uploadImage({
            localId: imgSrc, // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function (res) {
                uploadImageNum = uploadImageNum - 1;
                // 提交给服务器端
                var serverId = res.serverId;
                // 返回图片的服务器端ID
                serverIds.push(serverId);
                // 显示上传图片到服务器
                if (uploadImageNum <= 0) {
                    //图片上传完毕
                    try {
                        var eid = kdAppSet.getAppParam().eid;
                        OptImage.upLoadWxImageMultiple(eid, serverIds,
                            function (json) {
                                var imglist = json.data || [];
                                for (var i = 0; i < imglist.length; i++) {
                                    if (imglist[i].suc == 1) {
                                        srcList.push({ 'imgSrc': imglist[i].meida_id, 'serverId': imglist[i].url });
                                    } else {
                                        deleteImgElement(viewpage.find('.imgListDiv'), imglist[i].meida_id);
                                    }
                                }
                                kdAppSet.setKdLoading(false);
                                viewpage.find('.submitBtn').removeClass('invalid_Btn');
                            }, function () {
                                kdAppSet.setKdLoading(false);
                                viewpage.find('.submitBtn').removeClass('invalid_Btn');
                            });
                    }
                    catch (ex) {
                        jAlert('调用接口出错' + ex)
                    }
                }
                kdAppSet.setKdLoading(true, '上传中...');
            },
            fail: function () {
                uploadImageNum = uploadImageNum - 1;
                if (uploadImageNum <= 0) {
                    kdAppSet.setKdLoading(false);
                    viewpage.find('.submitBtn').removeClass('invalid_Btn');
                }
                OptMsg.ShowMsg('上传失败', '', 1500);
                deleteImgElement(viewpage.find('.imgListDiv'), imgSrc);
            }
        });
    }


    // 删除图片
    function deleteImgElement(parent, imgSrc) {
        var imgDivs = parent.children();
        for (var i = 0; i < imgDivs.length; i++) {
            if ($(imgDivs[i]).find('img').attr('src') == imgSrc) {
                parent[0].removeChild(imgDivs[i]);
                break;
            }
        }

        var temp = [];
        for (var j = 0; j < srcList.length; j++) {
            if (srcList[j].imgSrc != imgSrc) {
                temp.push(srcList[j]);
            }
        }
        srcList = temp;
        if (parent.find('.imgDiv').length < maxImgNum) {
            viewpage.find('.addImgBtn').show();
        }
    }

    // 根据src创建一个img元素插入显示列表
    function createImgElement(jqObj, src) {
        var imgBox = $.String.format(sample, {
            src: src
        });
        jqObj.append(imgBox);
        if (jqObj.find('.imgBox').length >= maxImgNum) {
            viewpage.find('.addImgBtn').hide();
        } else {
            viewpage.find('.addImgBtn').show();
        }
    }

    // 更新需要上传的图片信息
    function refreshSrcList(imgSrc) {
        var temp = [];
        for (var j = 0; j < srcList.length; j++) {
            if (srcList[j].imgSrc != imgSrc) {
                temp.push(srcList[j]);
            }
        }
        srcList = temp;
        viewpage.find('.addImgBtn').show();
    }

    //删除退货单
    function deleteBill(billid) {

        jConfirm("你确定要删除此退货单?", null, function (flag) {
            if (flag) {
                var para = { currentPage: 1, ItemsOfPage: 10 };
                para.para = { InterID: billid };

                CancelOrderApi(function (data) {
                    OptMsg.ShowMsg(data[0].result, '', 1500);
                    //通知退货单列表刷新
                    MiniQuery.Event.trigger(window, 'FreshRejectBill', []);
                    setTimeout(function () {
                        kdShare.backView();
                    }, 500);
                }, para);

                function CancelOrderApi(fn, para) {
                    Lib.API.get('DelSEOutStockByBillID', para,
                        function (data) {
                            fn && fn(data['resultlist']);
                        }, function () {
                            kdAppSet.setKdLoading(false);
                        }, function () {
                            kdAppSet.setKdLoading(false);
                        }
                    );
                }
            } else {
            }
        }, { ok: "是", no: "否" });
    }


    //提交退货单
    function submitRejectBill() {

        if (bsummiting) {
            OptMsg.showMsg('单据正在提交，请稍候!');
            return;
        }

        bsummiting = true;
        var data = listdata.list || [];
        var tempdata = [];
        var inum = data.length;

        if (inum <= 0) {
            OptMsg.ShowMsg('请先选择退货商品!');
            return;
        }

        //构造退货商品信息
        for (var i = 0; i < inum; i++) {
            if (!data[i].selected) {
                continue;
            }
            var iauxtype = data[i].auxtype;

            if (iauxtype == 0) {
                //无辅助属性
                var temp = {};
                temp.MaterialID = data[i].itemid;
                temp.UnitID = data[i].unitid;
                temp.AuxID = 0;
                var attrList0 = data[i].attrList;
                if (attrList0[0].selected) {
                    temp.Qty = attrList0[0].num;
                    temp.Price = attrList0[0].price;
                    tempdata.push(temp);
                }

            } else if (iauxtype == 1) {
                //合并商品
                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    if (attrList1[j].selected) {
                        var temp1 = {};
                        temp1.MaterialID = attrList1[j].fitemid;
                        temp1.UnitID = data[i].unitid;
                        temp1.AuxID = 0;
                        temp1.Qty = attrList1[j].num;
                        temp1.Price = attrList1[j].price;
                        tempdata.push(temp1);
                    }
                }

            } else if (iauxtype == 2) {
                //有辅助属性
                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    if (attrList2[k].selected) {
                        var temp2 = {};
                        temp2.MaterialID = data[i].itemid;
                        temp2.UnitID = data[i].unitid;
                        temp2.AuxID = attrList2[k].fauxid;
                        temp2.Qty = attrList2[k].num;
                        temp2.Price = attrList2[k].price;
                        tempdata.push(temp2);
                    }
                }
            }
        }

        var srcListNew = [];
        var inum = srcList.length;
        for (var i = 0; i < inum; i++) {
            srcListNew.push({ "imgSrc": srcList[i].serverId });
        }

        var optOpenid = kdAppSet.getUserInfo().optid;
        var promptTxt = "请输入您要备注的信息";
        var remark = viewpage.find("#rejectRemark").val();
        remark = remark.replace(/'/g, "");
        remark = remark.replace(/"/g, "");
        if (remark == promptTxt) {
            remark = "";
        }
        var userInfo = kdAppSet.getUserInfo();
        //0--退款，1--留作预付款 2其它
        var submitData = {
            optOpenid: optOpenid,
            OrderInterID: listdata.billid,
            OrderBillNo: listdata.billno,
            ReFundType: rejectType,
            Requestion: kdAppSet.ReplaceJsonSpecialChar(remark),
            //Requestion: kdAppSet.ReplaceJsonSpecialChar(remark) + "(退货人：" + userInfo.contactName + "；电话：" + userInfo.senderMobile + "；订单号：" + listdata.billno + ")",
            payImgList: srcListNew,
            SODetail: tempdata
        };


        kdAppSet.setKdLoading(true, "正在提交单据...");
        var para = { para: submitData };
        submitRejectBillApi(function (data) {
            //document.getElementById('popbillno').innerHTML = data;
            kdAppSet.setKdLoading(false);
            jAlert("退货申请已提交，退货单号 " + data);
            finishNewRejectBill();
            //通知退货商品选择页面 刷新数据
            MiniQuery.Event.trigger(window, 'finishEditRejectBill', []);
            MiniQuery.Event.trigger(window, 'toview', ['RejectBillList', {}]);

        }, para);
    }

    //完成新的退货单
    function finishNewRejectBill() {
        //清空单据信息
        finishEditRejectBill = true;
        listdata = [];
        freshHeadInfo(listdata);
        freshImgInfo(listdata);
        viewpage.find('#rejectRemark').val("");
    }

    //调用提交退货单api接口
    function submitRejectBillApi(fn, para) {
        Lib.API.get('SubmitSEOutStock', para,
            function (data, json) {
                bsummiting = false;
                var billno = data['BillNo'] || "";
                fn && fn(billno);
                if (billno != "") {
                    OptMsg.NewRejectBill(billno);
                }
            }, function (code, msg) {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function () {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert("提交单据出错!");
            });
    }


    function render(configp) {
        initView();
        toggleShowPrice();
        initRejectBill();
        config = configp;
        finishEditRejectBill = false;
        if (config.data != undefined) {
            //新增退货单
            isNewBill = true;
            mode = 1;
            listdata = config.data;
            freshHeadInfo(listdata);
            freshImgInfo(listdata);
            freshBillStatus(1);
            viewpage.find('.msgDiv .curtain').hide();
        }
        if (config.billid != undefined) {
            //查看退货单
            isNewBill = false;
            mode = 0;
            getBillDetail(config.billid);
            freshBillStatus(0);
            viewpage.find('.msgDiv .curtain').show();

        }
        show();
        var minHeight = viewpage.find('.content').height();  // 设置最小高度，确保底部不被顶起
        viewpage.find('.content').css('min-height', minHeight);
        scroller.refresh();

    }

    function toggleShowPrice() {
        var isShow = kdAppSet.getIsShowPrice();
        if (isShow) {
            viewpage.find('.money').show();
        }
        else {
            viewpage.find('.money').hide();
        }
    }


    //调用接口获取订单详情
    function getBillDetail(interID) {

        kdAppSet.setKdLoading(true, "获取退货单信息...");
        Lib.API.get('GetSEOutStockDetail', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { InterID: interID }
        }, function (data, json) {
            listdata = {
                list: data.list,
                billid: interID,
                billno: data.OrderBillNo,
                requestion: data.Requestion,
                moneytype: data.ReFundType,
                payImgList: data.payImgList,
                billdate: data.OrderDate
            };
            setListdataSelected();
            freshHeadInfo(listdata);
            freshImgInfo(listdata);
            if (mode == 0) {
                viewpage.find('.addImgBtn').hide();
            }
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            jAlert("获取退货单信息出错," + msg);
            kdAppSet.setKdLoading(false);
        }, function () {
            kdAppSet.setKdLoading(false);
        }, "");
    }

    //设置退货商品选中状态,以及最大值
    function setListdataSelected() {
        var inum = listdata.list.length;
        for (var i = 0; i < inum; i++) {
            listdata.list[i].selected = 1;
            var jnum = listdata.list[i].attrList.length;
            for (var j = 0; j < jnum; j++) {
                listdata.list[i].attrList[j].selected = 1;
                listdata.list[i].attrList[j].maxnum = listdata.list[i].attrList[j].num;
            }
        }
    }

    //刷新头部信息
    function freshHeadInfo(data) {
        var list = data.list || [];
        var inum = list.length;
        //选取第一个退货商品的图片与名称
        if (inum > 0) {
            for (var i = 0; i < inum; i++) {
                if (list[i].selected) {
                    var item = list[i];
                    var ingsrc = 'img/no_img.png';
                    if (item.img) {
                        ingsrc = kdAppSet.getImgThumbnail(item.img);
                    }
                    viewpage.find(".leftImgDiv img").attr("src", ingsrc);
                    viewpage.find(".rightInfoDiv .name").text(item.name);
                    break;
                }
            }
        }

        //计算退货商品数量与金额汇总
        var sumNum = 0;
        var sumMoney = 0;
        var itmp;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected) {
                var attrList = list[i].attrList;
                var jnum = attrList.length;
                for (var j = 0; j < jnum; j++) {
                    if (attrList[j].selected) {
                        sumNum += attrList[j].num;
                        itmp = kdShare.calcMul(Number(attrList[j].num), Number(attrList[j].price));
                        sumMoney = kdShare.calcAdd(sumMoney, itmp);
                    }
                }
            }
        }

        viewpage.find(".rightInfoDiv .numSpan em").text(sumNum);
        viewpage.find(".rightInfoDiv .moneySpan em").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(sumMoney));

        var remark = listdata.requestion || "";
        if (remark && remark != keywordhint) {
            viewpage.find("#rejectRemark").addClass('textFocus');
            viewpage.find("#rejectRemark").val(remark);
        }

        //根据退货单信息 设置退款类型
        btnUnSelected();
        if (listdata.moneytype == 0) {
            rejectType = listdata.moneytype;
            btnSelected(viewpage.find(".refundBtn"));
        } else if (listdata.moneytype == 1) {
            rejectType = listdata.moneytype;
            btnSelected(viewpage.find(".advanceBtn"));
        } else if (listdata.moneytype == 2) {
            rejectType = listdata.moneytype;
            btnSelected(viewpage.find(".otherBtn"));
        }
    }

    //显示上传的图片
    function freshImgInfo(list) {
        var imgList = list.payImgList || [];
        var inum = imgList.length;
        srcList = [];
        for (var i = 0; i < inum; i++) {
            createImgElement(viewpage.find('.imgListDiv'), imgList[i]);
            srcList.push({ "imgSrc": imgList[i], "serverId": imgList[i] });
        }
        if (isNewBill) {
            viewpage.find(".imgDiv .deleteImg").show();
        } else {
            viewpage.find(".imgDiv .deleteImg").hide();
        }
    }

    //刷新单据状态
    function freshBillStatus(isNewBill) {
        if (isNewBill) {
            viewpage.find(".submitBtn").show();
            viewpage.find(".deleteBtn").hide();
        } else {
            viewpage.find(".submitBtn").hide();
            viewpage.find(".deleteBtn").show();
        }
    }

    function show() {
        viewpage.show();
        //如果是回退，并且单据已完成，自动回到上一个页面
        if (finishEditRejectBill) {
            history.back();
        }
    }

    function hide() {
        viewpage.hide();
        kdAppSet.setKdLoading(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();
/* 退货单物流填写页面*/


var RejectBillExpress = (function () {
    var div, scroller, divContent, hasInit, viewpage, currentData,
        currentWLCompany;  // 当前物流公司信息

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectBillExpress');
            FastClick.attach(div);
            viewpage = $(div);
            divContent = document.getElementById('rejectBillExpressContent');
            currentData = {};
            // 物流公司名与对应编码
            currentWLCompany = { name: '请选择物流公司', id: '' };
            bindEvents();
            initScroll(divContent);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 0.2,
            fnfresh: function (reset) {
                reset();
            },
            fnmore: function (reset) {
                reset();
            },
            hintbottom: 1

        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 初始化物流页面
    function initExpressPage() {
        viewpage.find('.billNo').html(currentData.billno);
        viewpage.find('.rejectDate').html(currentData.date);

        viewpage.find('.expressCompany').html('请选择物流公司');
        viewpage.find('.selectDiv').removeClass('textFocus');
        currentWLCompany.id = '';

        var expressNo = viewpage.find('.expressNo');
        expressNo.val(expressNo.attr('hint'));
        expressNo.removeClass('textFocus');

        var textBox = viewpage.find('.remindMsg');
        textBox.val(textBox.attr('hint'));
        textBox.removeClass('textFocus');
    }

    // 获取物流公司名
    function getWLCompanyList() {
        // 跳转到物流公司列表，返回选择物流公司信息
        MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {
            para: {},
            api: 'GetWLCompany',
            selobj: currentWLCompany,
            callBack: function (data) {
                // 处理选中的物流公司信息
                currentWLCompany.name = data.name;
                currentWLCompany.id = data.id;
                viewpage.find('.expressCompany').html(data.name);
                viewpage.find('.selectDiv').addClass('textFocus');
            }
        }]);
    }

    // 获取物流信息参数集
    function getWLBillInfo() {
        var para = {};
        para.wlCompany = currentWLCompany.id; //公司名内码
        para.wlCName = currentWLCompany.name; //公司名内码
        para.wlNumber = kdAppSet.ReplaceJsonSpecialChar(viewpage.find('.expressNo').val());
        para.InterID = currentData.interid;

        return para;
    }

    // 提交物流信息
    function sendWLInfo() {
        var para = getWLBillInfo();
        Lib.API.get('SetWLForSEOutStock', {
            para: para
        }, function (data, json) {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(data.msg, "", 1100);

            //通知退货单列表刷新
            MiniQuery.Event.trigger(window, 'FreshRejectBill', []);
            setTimeout(function () {
                kdShare.backView();
            }, 1200);
            OptMsg.RejectBillExpress(currentData.billno, para.wlCName, para.wlNumber);

        }, function (code, msg, json) {

            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg(msg, "", 1100);
        }, function () {
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('网络错误，请稍候再试', "", 1100);
        });
    }

    // 检查数据合法性
    function submitCheck() {

/*
        if (currentWLCompany.id == '') {
            OptMsg.ShowMsg('请选择物流公司', "", 1100);
            return false;
        }
*/

        var expressNo = viewpage.find('.expressNo');
        var valueStr = kdShare.trimStr(expressNo.val());
        if (expressNo.attr('hint') == valueStr || valueStr == '') {
            OptMsg.ShowMsg('请输入物流单号', "", 1100);
            return false;
        }

        return true;
    }

    // 事件绑定
    function bindEvents() {
        viewpage.delegate('.selectDiv', {
            'click': function () {
                getWLCompanyList();
            },
            'touchstart': function () {
                $(this).addClass('border_touched');
            },
            'touchend': function () {
                $(this).removeClass('border_touched');
            }
        });
        viewpage.delegate('.expressNo', {
            'focus': function () {
                $(this).addClass('textFocus');
                $(this).parents('.expressNoDiv').addClass('border_touched');
            },
            'blur': function () {
                var hint = $(this).attr('hint');
                var valStr = kdShare.trimStr($(this).val());
                if (valStr == '' || valStr == hint) {
                    $(this).removeClass('textFocus');
                }
                $(this).parents('.expressNoDiv').removeClass('border_touched');
            }
        });
        viewpage.delegate('.remindMsg', {
            'focus': function () {
                $(this).addClass('textFocus');
                $(this).addClass('border_touched');
            },
            'blur': function () {
                var hint = $(this).attr('hint');
                var valStr = kdShare.trimStr($(this).val());
                if (valStr == '' || valStr == hint) {
                    $(this).removeClass('textFocus');
                }
                $(this).removeClass('border_touched');
            }
        });
        viewpage.delegate('.submitBtn', {
            'click': function () {
                if (!submitCheck()) {
                    return;
                }
                jConfirm("您确认提交填写的物流信息?", null, function (flag) {
                    if (flag) {
                        kdAppSet.setKdLoading(true, '正在提交...');
                        sendWLInfo();
                    }
                }, {ok: "是", no: "否"});

            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick')
            }
        });
        viewpage.delegate('.cancelBtn', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick')
            }

        });
    }

    function render(config) {
        initView();
        // 保存当前退款订单信息
        currentData = config ? config.data : {};
        // 重置页面
        initExpressPage();
        show();
        // 设置最小高度，确保底部不被顶起
        var minHeight = viewpage.find('.content').height();
        viewpage.find('.content').css('min-height', minHeight);
        scroller.refresh();
    }


    function show() {
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
        kdAppSet.setKdLoading(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();
/* 退货单列表页面*/


var RejectBillList = (function () {
    var div, sample, scroller, ul, ullist, divlist, hasInit, viewpage,
        totalPageCount, currentPage, itemsOfPage, orderlistdata,  // 列表数据控制
        searchCondition, keywordhint;  // 搜索条件控制

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectBillList');
            viewpage = $(div);
            divlist = document.getElementById('RejectBillDiv');
            FastClick.attach(divlist);
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            keywordhint = "支持名称/规格/退货单号";
            searchCondition = {};
            initScroll(divlist);
            bindEvents();
            hasInit = true;
        }
        initUlList();
    }

    // 初始化列表相关数据,清空记录
    function initUlList() {
        //页数控制
        currentPage = 1;
        totalPageCount = 0;
        itemsOfPage = 10;
        orderlistdata = [];
        ullist.html('');
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 1,
            fnfresh: function (reset) {
                reset();
                getRefreshData();
            },
            fnmore: function (reset) {
                reset();
                getBillList();
            },
            hintbottom: 1

        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 配置查询信息对象
    function setSearchCondition() {

        var endTime = " 23:59:59";
        var startDatav = viewpage.find('.dateBegin').val();
        var endDatev = viewpage.find('.dateEnd').val() + endTime;
        var keywordv = kdShare.trimStr(viewpage.find('.txtSearch').val());
        var optOpenid = kdAppSet.getUserInfo().optid;

        var ketwordstr = keywordv != keywordhint ? keywordv : '';
        searchCondition.optOpenid = optOpenid;
        searchCondition.Option = 0;
        searchCondition.KeyWord = kdAppSet.ReplaceJsonSpecialChar(ketwordstr);
        searchCondition.BeginDate = startDatav;
        searchCondition.EndDate = endDatev;
    }

    // 初始化查询信息
    function initSearchCondition() {
        var now = $.Date.now();
        now.setDate(now.getDate() - 90);
        kdctrl.initDate($(".view_RejectBillList .kdcDate"));
        viewpage.find('[data-cmd="kdcbegDate"]').val($.Date.format(now, "yyyy-MM-dd"));
        viewpage.find('[data-cmd="kdcendDate"]').val($.Date.format($.Date.now(), "yyyy-MM-dd"));

        viewpage.find('.txtSearch').val(keywordhint);
        viewpage.find('.txtSearch').blur();
        // 折叠时间栏
        var dateCtrl = $('[data-cmd="kdcbegDate"],[data-cmd="kdcendDate"]');
        dateCtrl.bind('change',
            function () {
                getRefreshData();
            }
        );
        foldTheBar();
    }

    // 折叠时间栏
    function foldTheBar() {
        var selectDiv = viewpage.find('.RejectSelectDiv');
        var datePan = viewpage.find('.datePan');
        var imgBox = viewpage.find('.btnDate img');

        imgBox.removeClass('sprite-upext');
        imgBox.addClass('sprite-downext');

        selectDiv.removeClass('unfoldDate');
        datePan.css('display', 'none');

        scroller.noticetop = 50;
    }

    // 设置当前总页数
    function setTotalPage(json) {
        totalPageCount = parseInt(json['TotalPage']);
    }

    // 获取退款单列表接口函数
    function GetOrderListAPI(fn, para) {
        Lib.API.get('GetSEOutStockList', para,
            function (data, json, root) {
                removeHint();
                setTotalPage(json);
                var list = $.Array.keep(data['SEOutStockList'] || [], function (item, index) {
                    return {
                        index: (currentPage - 1) * itemsOfPage + index,
                        interid: item.FInterID,
                        status: getStatus(Number(item.FRemark)),
                        billno: item.FBillNo,
                        date: item.FDate,
                        num: item.FAuxQty,
                        expressnumber: item.FWLNumber || '',
                        expresscom: item.FWLCompany || '',
                        showExpressBtn: item.FWLNumber ? '' : 'showBtn',
                        showViewBtn: item.FWLNumber ? 'showBtn' : '',
                        showRemindBtn: item.FRemark == '1' ? '' : 'showBtn'
                    };
                });
                fn && fn(list);
                currentPage++;
                setScrollPageEnd();
            }, function (code, msg, json, root, userflag) {

                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {

                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            }
        );
    }

    function getStatus(istatus) {
        var status = '待审核';
        if (istatus == 1) {
            status = '已同意';
        } else if (istatus == 3) {
            status = '已关闭';
        }
        return status;
    }

    // 获取参数列表
    function getBillList() {
        // 配置参数
        var para = {};
        para.currentPage = currentPage;
        para.ItemsOfPage = itemsOfPage;
        setSearchCondition();
        para.para = searchCondition;

        // 获取列表数据
        GetOrderListAPI(function (data) {
            getListHtml(data, orderlistdata);
        }, para);
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata) {
        var inum = data.length;
        // 首页刷新为空显示
        if (currentPage == 1 && inum == 0) {
            var iheight = viewpage.find('.RejectSelectList').height();
            ullist.html(kdAppSet.getEmptyMsg(iheight));
            return;
        }

        for (var i = 0; i < inum; i++) {
            // 将对应index的单项保存到listdata中
            listdata[data[i].index] = data[i];
        }
        // 将数据填入模板
        var htmlstr = $.Array.keep(data, function (item, index) {
            return $.String.format(sample, {
                index: item.index,
                interid: item.interid,
                status: item.status,
                billno: item.billno,
                date: item.date,
                num: item.num,
                showExpressBtn: item.showExpressBtn,
                showViewBtn: item.showViewBtn,
                showRemindBtn: item.showRemindBtn
            });
        }).join('');

        // 列表中显示数据
        if (currentPage > 1) {
            ullist.append(htmlstr);
        } else {
            ullist.html(htmlstr);
        }
        scroller.refresh();
    }

    // 最后一页设置
    function setScrollPageEnd() {
        if (scroller) {
            scroller.isPageEnd = (currentPage - 1 >= totalPageCount);
        }
    }

    function bindEvents() {
        initSearchCondition();
        //刷新退货单列表
        MiniQuery.Event.bind(window, {
            'FreshRejectBill': function (data) {
                getRefreshData();
            }
        });

        // 输入框焦点事件
        viewpage.find('.txtSearch').delegate('', {
            'focus': function () {
                viewpage.find('.imgClear').css('display', 'block');
                $(this).addClass('search_touched');

                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == keywordhint) {
                    $(this).val('');
                }
            },
            'blur': function () {
                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == '' || searchVal == keywordhint) {
                    viewpage.find('.imgClear').css('display', 'none');
                    $(this).removeClass('search_touched');
                    $(this).val(keywordhint);
                }
            }
        });

        // 清空图标点击事件
        viewpage.find('.imgClear').delegate('', {
            'click': function () {
                viewpage.find('.txtSearch').val('');
                viewpage.find('.txtSearch').focus();

            },
            'touchstart': function (event) {
            }
        });

        // 搜索按键点击事件
        viewpage.find('.btnSearch').delegate('', {
            'click': function () {
                initUlList();
                loadingHint();
                getBillList();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 展开按键点击事件
        viewpage.find('.btnDate').delegate('', {
            'click': function () {
                var selectDiv = viewpage.find('.RejectSelectDiv');
                var datePan = viewpage.find('.datePan');
                var imgBox = $(this).find('img');

                var classStr = imgBox.attr('class');

                if (classStr.match('sprite-downext')) {
                    imgBox.removeClass('sprite-downext');
                    imgBox.addClass('sprite-upext');

                    selectDiv.addClass('unfoldDate');
                    datePan.css('display', 'block');

                    scroller.noticetop = 100;

                } else {
                    foldTheBar();
                }
                scroller.refresh();
            }
        });

        // 订单项点击事件
        viewpage.delegate('li .ItemInfo', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billid = orderlistdata[index].interid;
                MiniQuery.Event.trigger(window, 'toview', ['EditRejectBill', { billid: billid }]);
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 填写物流信息点击事件
        viewpage.delegate('.expresstBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                MiniQuery.Event.trigger(window, 'toview', ['RejectBillExpress', { data: orderlistdata[index] }]);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }
        });

        // 提醒厂家处理点击事件
        viewpage.delegate('.remindBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billNo = orderlistdata[index].FBillNo;
                OptMsg.RejectBillRemind(billNo);
            },
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });

        // 申请退款点击事件
        viewpage.find('.rejectBtn').delegate('', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectSelectList', {}]);
            },
            'touchstart': function () {
                $(this).addClass('rejectBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('rejectBtn_touched');
            }
        });

        // 联系客服点击事件
        viewpage.find('.serviceBtn').delegate('', {
            'touchstart': function () {
                $(this).addClass('grayBtn_touched');
                var phone = $(".serviceBtn").attr("href");
                if (phone == "tel:") {
                    jAlert("很抱歉,客服的电话号码为空!");
                    return false;
                }
            },
            'touchend': function () {
                $(this).removeClass('grayBtn_touched');
            }
        });

        // 查看进度点击事件
        viewpage.delegate('.viewBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var item = orderlistdata[index];
                OptExpress.ShowExpress(item.expressnumber);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }

        })
    }

    // 刷新列表数据
    function getRefreshData() {

        // 初始化列表数据
        initUlList();
        loadingHint();
        // 获取数据
        getBillList();
    }

    function render() {
        initView();
        show();

        getRefreshData();
        // 添加客服电话
        //var servicePhone = kdAppSet.getUserInfo().servicePhone;
        var phone = '';
        var service = OptMsg.getMsgServiceList();
        if (service.length > 0) {
            phone = service[0].servicePhone;
        }
        viewpage.find('.serviceBtn').attr("href", "tel:" + phone);

        var minHeight = viewpage.height();  // 设置最小高度，确保底部不被顶起
        viewpage.css('min-height', minHeight);
        scroller.refresh();
    }

    // 加载提示
    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');
    }

    // 清除加载提示
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    function show() {
        kdAppSet.setAppTitle('退货');
        viewpage.show();
        scroller.refresh();
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
/*退货单 退货商品选择页面*/

var RejectGoodsSelect = (function () {
    var div, samples, scroller, ul, ullist, config, viewpage, listdata, hasInit,
        selectedImg, unselectedImg, finishEditRejectBill;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectGoodsSelect');
            FastClick.attach(div);
            viewpage = $(div);
            var divlist = document.getElementById('RejectGoodsSelectDiv');
            ul = divlist.firstElementChild;
            samples = $.String.getTemplates(ul.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                }
            ]);
            selectedImg = "img/selected.png";
            unselectedImg = "img/select.png";
            listdata = {};
            bindEvents();
            initScroll(divlist);
            finishEditRejectBill = false;
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, {});
    }


    //调用接口获取订单详情
    function getOrderDetail(interID) {

        kdAppSet.setKdLoading(true, "获取订单信息...");
        Lib.API.get('GetOrderDetailForSEOutStock', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: {InterID: interID}
        }, function (data, json) {
            listdata = {
                list: data.list,
                billid: interID,
                billno: data.BillNo,
                billdate: data.FDate
            };
            setListdataMaxnum();
            freshHeaddata(data);
            freshListdata(listdata.list);
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            OptMsg.ShowMsg("获取订单信息出错," + msg, '', 1100);
            kdAppSet.setKdLoading(false);
        }, function () {
            kdAppSet.setKdLoading(false);
        }, "");
    }

    //设置退货商品可退货的最大值
    function setListdataMaxnum() {
        var inum = listdata.list.length;
        for (var i = 0; i < inum; i++) {
            var jnum = listdata.list[i].attrList.length;
            for (var j = 0; j < jnum; j++) {
                listdata.list[i].attrList[j].maxnum = listdata.list[i].attrList[j].num;
            }
        }
    }

    //刷新页面头部信息
    function freshHeaddata(data) {
        var head = viewpage.find(".header");
        head.find(".billNo span").text(data.BillNo);
        head.find(".billDate span").text(data.FDate);
        head.find(".billRec span").text(data.receiveDate);
        var status = "已发货";
        if (data.status == 4) {
            status = "已收货";
        }
        head.find(".Status").text(status);
    }

    //刷新退货列表
    function freshListdata(datalist) {

        ul.innerHTML = $.Array.map(datalist, function (item, pindex) {
            var attrList = item.attrList;
            var attrsum = 0;
            var inum = attrList.length;
            for (var i = 0; i < inum; i++) {
                attrsum = kdShare.calcAdd(attrsum, Number(attrList[i].num));
            }

            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : kdAppSet.getImgThumbnail(item.img),
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                attrsum: attrsum,
                imgselect: item.imgselect == 1 ? selectedImg : unselectedImg,
                'rows': $.Array.map(attrList, function (row, index) {
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            attrprice: kdAppSet.getRmbStr + row.price,
                            stocknum: 0,
                            attrIndex: index,
                            attrPindex: pindex,
                            stockunit: item.unitname,
                            attrimgselect: item.imgselect == 1 ? selectedImg : unselectedImg,
                            attrnum: row.num
                        });
                    }
                ).join('')
            });
        }).join('');
        scroller.refresh();
    }

    //判断是否有选择商品
    function checkCanSubmit() {
        var selectNum = 0;
        var list = listdata.list;
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected) {
                var jnum = list[i].attrList.length;
                for (var j = 0; j < jnum; j++) {
                    if (list[i].attrList[j].selected) {
                        selectNum += list[i].attrList[j].num;
                    }
                }
            }
        }
        return selectNum > 0;

    }

    function bindEvents() {

        //刷新退货商品列表
        MiniQuery.Event.bind(window, {
            'finishEditRejectBill': function () {
                finishEditRejectBill = true;
                listdata = [];
                freshListdata(listdata);
            }
        });

        //申请退货
        viewpage.delegate('.ok', {
            'click': function () {
                if (checkCanSubmit()) {
                    MiniQuery.Event.trigger(window, 'toview', ['EditRejectBill', {data: listdata}]);
                } else {
                    OptMsg.ShowMsg("请勾选需要退货的商品<br>并填写数量", '', 1100);
                }
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        //取消退货
        viewpage.delegate('.cancel', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        //修改退货商品数量
        $(ul).delegate(".attrnum", {
            'click': function () {

                var target = $(this).children('input');
                var iindex = Number($(this).parent().attr("attrindex"));
                var pindex = Number($(this).parent().attr("attrpindex"));
                var attrname = listdata.list[pindex].attrList[iindex].name;
                var attrListCtrl = $(ul).find("li[index=" + pindex + "]");

                var list = listdata.list;
                var config = {
                    name: attrname,
                    input: target.val(),
                    maxnum: list[pindex].attrList[iindex].maxnum,
                    maxhint: "退货数量不能超过 ",
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.val(1);
                            list[pindex].attrList[iindex].num = 1;
                        }
                        else {
                            target.val(kvalue);
                            list[pindex].attrList[iindex].num = Number(kvalue);
                        }
                        var attrList = list[pindex].attrList;
                        var isum = 0;
                        for (var attr in attrList) {
                            isum = kdShare.calcAdd(isum, Number(attrList[attr].num));
                        }
                        attrListCtrl.find(".attrSum span").text(isum);
                    },
                    hidefn: function () {
                    }
                };
                kdShare.keyBoard.autoshow(config);
                return false;
            }
        });

        //商品选择
        $(ul).delegate(".imgselect", {
            'click': function () {

                var pindex = Number($(this).parent().attr("index"));
                if (listdata.list[pindex].selected) {
                    listdata.list[pindex].selected = 0;
                    freshImgSelect(pindex, false);
                } else {
                    listdata.list[pindex].selected = 1;
                    freshImgSelect(pindex, true);
                }
            }
        });

        //商品明细选择
        $(ul).delegate(".attrimgselect", {
            'click': function () {
                var iindex = Number($(this).parent().attr("attrindex"));
                var pindex = Number($(this).parent().attr("attrpindex"));
                if (listdata.list[pindex].attrList[iindex].selected) {
                    listdata.list[pindex].attrList[iindex].selected = 0;
                    freshChildImgSelect(pindex, iindex, false);
                } else {
                    listdata.list[pindex].attrList[iindex].selected = 1;
                    freshChildImgSelect(pindex, iindex, true);
                }
            }
        });

    }

    //刷新商品选中状态
    function freshImgSelect(index, selected) {
        var attrListCtrl = $(ul).find("li[index=" + index + "]");
        var img = unselectedImg;
        var inum = listdata.list[index].attrList.length;
        var flag = 0;
        if (selected) {
            flag = 1;
            img = selectedImg;
        }
        for (var i = 0; i < inum; i++) {
            listdata.list[index].attrList[i].selected = flag;
        }
        attrListCtrl.find(".imgselect img").attr("src", img);
        attrListCtrl.find(".attrimgselect img").attr("src", img);
    }


    //刷新商品明细选中状态
    function freshChildImgSelect(pindex, iindex, selected) {

        var attrListCtrl = $(ul).find("li[index=" + pindex + "]");
        var attrRow = attrListCtrl.find("[attrindex=" + iindex + "]");
        var img = unselectedImg;
        if (selected) {
            img = selectedImg;
        }
        attrRow.find(".attrimgselect img").attr("src", img);

        //判断parent选择状态
        var iselectnum = 0;
        var inum = listdata.list[pindex].attrList.length;
        for (var i = 0; i < inum; i++) {
            if (listdata.list[pindex].attrList[i].selected) {
                iselectnum += 1;
            }
        }

        if (iselectnum == 0) {
            //一个子项都没有选中
            attrListCtrl.find(".imgselect img").attr("src", unselectedImg);
            listdata.list[pindex].selected = 0;

        } else if (iselectnum == inum) {
            //子项全部选中
            attrListCtrl.find(".imgselect img").attr("src", selectedImg);
            listdata.list[pindex].selected = 1;
        } else {
            //子项部分选中
            attrListCtrl.find(".imgselect img").attr("src", unselectedImg);
            listdata.list[pindex].selected = 1;
        }

    }


    function render(configp) {
        config = configp || {};
        initView();
        finishEditRejectBill = false;
        var billid = configp.billid || 0;
        var listdata = configp.listdata;

        if (billid > 0) {
            //新增退货单
            getOrderDetail(billid);
        }
        if (listdata != undefined) {
            //编辑退货单
            freshListdata(listdata);
        }
        show();
    }


    function show() {
        viewpage.show();
        //退货单已经提交 自动退到上一个也页面
        if (finishEditRejectBill) {
            history.back();
        }
    }

    function hide() {
        viewpage.hide();
        kdAppSet.setKdLoading(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();
/*退货单 已选择退货商品详情页面*/


var RejectGoodsSelectList = (function () {
    var div, samples, scroller, listdata, ul, ullist, config, viewpage, divlist, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectGoodsSelectList');
            viewpage = $(div);
            divlist = document.getElementById('RejectGoodsSelectListDiv');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            samples = $.String.getTemplates(ul.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--',
                    end: '-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                }
            ]);
            listdata = {};
            bindEvents();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {};
        kdctrl.initkdScroll(scroller, option);
    }


    function bindEvents() {

        //修改退货商品
        viewpage.delegate('.change', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelect', {data: listdata}]);
            },
            'touchstart': function () {
                $(this).addClass('change_touched');
            },
            'touchend': function () {
                $(this).removeClass('change_touched');
            }
        });
    }

    //刷新页面头部信息
    function freshHeaddata(data) {
        var head = viewpage.find(".header");
        head.find(".billno span").text(data.billno);
        head.find(".billdate span").text(data.billdate);
    }

    //刷新页面列表数据
    function freshListdata(datalist) {

        ul.innerHTML = $.Array.map(datalist, function (item, pindex) {

            if (!item.selected) {
                return "";
            }

            var attrList = item.attrList;
            var attrsum = 0;
            var inum = attrList.length;
            for (var i = 0; i < inum; i++) {
                attrsum = kdShare.calcAdd(attrsum, Number(attrList[i].num));
            }

            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : kdAppSet.getImgThumbnail(item.img),
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                attrsum: attrsum,
                'rows': $.Array.map(attrList, function (row, index) {
                        if (!row.selected) {
                            return "";
                        }
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            attrprice: kdAppSet.getRmbStr + row.price,
                            stocknum: 0,
                            attrIndex: index,
                            attrPindex: pindex,
                            stockunit: item.unitname,
                            attrnum: row.num
                        });

                    }
                ).join('')
            });
        }).join('');
        scroller.refresh();
    }

    function render(configp) {
        initView();
        config = configp || {};
        listdata = config.data || {};
        //mode 0 查看 1编辑
        var mode = config.mode || 0;
        show();
        if (mode == 1) {
            viewpage.find(".footer").show();
            viewpage.find(".content").css("bottom", "45px");
        } else {
            viewpage.find(".footer").hide();
            viewpage.find(".content").css("bottom", "0");
        }
        freshHeaddata(listdata);
        freshListdata(listdata.list);
    }

    function show() {
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
/* 可退货的订单列表页*/
var RejectSelectList = (function () {
    var div, sample, scroller, ul, ullist, divlist, hasInit, viewpage,
        totalPageCount, currentPage, itemsOfPage, orderlistdata,  // 列表数据控制
        searchCondition, keywordhint;  // 搜索条件控制;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_RejectSelectList');
            viewpage = $(div);
            divlist = document.getElementById('RejectSelectDiv');
            FastClick.attach(divlist);
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            keywordhint = "支持名称/规格/订单号";
            searchCondition = {};
            initScroll(divlist);
            bindEvents();
            hasInit = true;
        }
        initUlList();
    }

    // 初始化列表信息，清空数据
    function initUlList() {
        //页数控制
        currentPage = 1;
        totalPageCount = 0;
        itemsOfPage = 10;
        orderlistdata = [];
        ullist.html('');
    }

    // 初始化列表相关数据,清空记录
    function setSearchCondition() {
        var endTime = " 23:59:59";
        var startDatav = viewpage.find('.dateBegin').val();
        var endDatev = viewpage.find('.dateEnd').val() + endTime;
        var keywordv = kdShare.trimStr(viewpage.find('.txtSearch').val());
        var optOpenid = kdAppSet.getUserInfo().optid;
        var keywordStr=(keywordv != keywordhint ? keywordv : '');
        searchCondition.optOpenid = optOpenid;
        searchCondition.Option = 4;
        searchCondition.KeyWord = kdAppSet.ReplaceJsonSpecialChar(keywordStr);
        searchCondition.BeginDate = startDatav;
        searchCondition.EndDate = endDatev;
    }


    // 初始化查询信息
    function initSearchCondition() {
        var now = $.Date.now();
        now.setDate(now.getDate() - 90);
        kdctrl.initDate($(".view_RejectSelectList .kdcDate"));
        viewpage.find('[data-cmd="kdcbegDate"]').val($.Date.format(now, "yyyy-MM-dd"));
        viewpage.find('[data-cmd="kdcendDate"]').val($.Date.format($.Date.now(), "yyyy-MM-dd"));

        viewpage.find('.txtSearch').val(keywordhint);
        viewpage.find('.txtSearch').blur();
        // 折叠时间栏
        var dateCtrl = $('[data-cmd="kdcbegDate"],[data-cmd="kdcendDate"]');
        dateCtrl.bind('change',
            function () {
                getRefreshData();
            }
        );
        foldTheBar();
    }

    // 折叠时间栏
    function foldTheBar() {
        var selectDiv = viewpage.find('.RejectSelectDiv');
        var datePan = viewpage.find('.datePan');
        var imgBox = viewpage.find('.btnDate img');
        imgBox.removeClass('sprite-upext');
        imgBox.addClass('sprite-downext');
        selectDiv.removeClass('unfoldDate');
        datePan.css('display', 'none');
        scroller.noticetop = 50;
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 1,
            fnfresh: function (reset) {
                reset();
                getRefreshData();
            },
            fnmore: function (reset) {
                reset();
                //加载下一页
                getBillList();
            },
            hintbottom: 0.2

        };
        kdctrl.initkdScroll(scroller, option);
    }

    // 设置总页数
    function setTotalPage(json) {
        totalPageCount = parseInt(json['TotalPage']);
    }

    // 获取列表接口函数
    function GetOrderListAPI(fn, para) {
        Lib.API.get('GetSEOrderList', para,
            function (data, json, root) {
                removeHint();
                setTotalPage(json);
                var list = $.Array.keep(data['SEOrderList'] || [], function (item, index) {
                    return {
                        index: (currentPage - 1) * itemsOfPage + index,
                        interid: item.FInterID,
                        amount: item.famount,
                        status: item.FRemark == 3 ? '已发货' : item.FRemark == 4 ? '已收货' : '',
                        consigndate: item.fconsigndate,
                        billno: item.FBillNo,
                        date: item.FDate,
                        settle: item.fsettlename,
                        expressnumber: item.FWLNumber,
                        expresscom: item.FWLCompany
                    };
                });
                fn && fn(list);
                currentPage++;
                setScrollPageEnd();
            }, function (code, msg, json, root, userflag) {

                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {

                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            }
        );
    }

    // 获取列表信息
    function getBillList() {
        var para = {};
        para.currentPage = currentPage;
        para.ItemsOfPage = itemsOfPage;

        setSearchCondition();
        para.para = searchCondition;

        // 获取列表数据
        GetOrderListAPI(function (data) {
            getListHtml(data, orderlistdata);
        }, para);
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata) {
        var inum = data.length;

        // 首页刷新为空显示
        if (currentPage == 1 && inum == 0) {
            var iheight = viewpage.find('.RejectSelectList').height();
            ullist.html(kdAppSet.getEmptyMsg(iheight));
            return;
        }

        for (var i = 0; i < inum; i++) {

            // 将对应index的单项保存到listdata中
            listdata[data[i].index] = data[i];
            var item = data[i];
        }
        // 将数据填入模板
        var htmlstr = $.Array.keep(data, function (item, index) {
            return $.String.format(sample, {
                index: item.index,
                interid: item.interid,
                status: item.status,
                billno: item.billno,
                date: item.date,
                num: item.num
            });
        }).join('');

        // 列表中显示数据
        if (currentPage > 1) {

            ullist.append(htmlstr);
        } else {
            ullist.html(htmlstr);
        }
        scroller.refresh();
    }

    // 最后一页设置
    function setScrollPageEnd() {
        if (scroller) {
            scroller.isPageEnd = currentPage - 1 >= totalPageCount;
        }
    }

    // 事件绑定
    function bindEvents() {
        initSearchCondition();
        // 输入框焦点事件
        viewpage.find('.txtSearch').delegate('', {
            'focus': function () {
                viewpage.find('.imgClear').css('display', 'block');
                $(this).addClass('search_touched');

                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == keywordhint) {
                    $(this).val('');
                }
            },
            'blur': function () {
                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == '' || searchVal == keywordhint) {
                    viewpage.find('.imgClear').css('display', 'none');
                    $(this).removeClass('search_touched');
                    //$(this).val(keywordhint);
                }
            }
        });

        // 清空图标点击事件
        viewpage.find('.imgClear').delegate('', {
            'click': function () {
                viewpage.find('.txtSearch').val('');
                viewpage.find('.txtSearch').focus();
                event.stopPropagation();
            },
            'touchstart': function (event) {
                event.stopPropagation();
            }
        });

        // 搜索按键点击事件
        viewpage.find('.btnSearch').delegate('', {
            'click': function () {
                initUlList();
                loadingHint();
                getBillList();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 展开按键点击事件
        viewpage.find('.btnDate').delegate('', {
            'click': function () {
                var selectDiv = viewpage.find('.RejectSelectDiv');
                var datePan = viewpage.find('.datePan');
                var imgBox = $(this).find('img');

                var classStr = imgBox.attr('class');

                if (classStr.match('sprite-downext')) {
                    imgBox.removeClass('sprite-downext');
                    imgBox.addClass('sprite-upext');

                    selectDiv.addClass('unfoldDate');
                    datePan.css('display', 'block');
                    scroller.noticetop = 100;
                } else {
                    foldTheBar();
                }
                scroller.refresh();
            }
        });

        // 订单项点击事件
        viewpage.delegate('li .ItemInfo', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billid = orderlistdata[index].interid;
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', { billId: billid, isReject: true }]);
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        // 退款按键事件
        viewpage.delegate('.rejectBtn', {
            'click': function () {
                var index = $(this).parents('li').attr('index');
                var billid = orderlistdata[index].interid;
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelect', { billid: billid }]);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }
        });
    }

    // 刷新列表
    function getRefreshData() {

        // 初始化列表数据
        initUlList();
        loadingHint();
        // 获取数据
        getBillList();
    }

    function render(configp) {
        config = configp || {};
        initView();
        getRefreshData();
        show();
    }

    // 加载提示
    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<li class="spacerow"></li>');
    }

    // 清除加载提示
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    function show() {
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
/**
 * Created by ziki on 2015-07-18.
 */
var Setting = (function () {
    var $view,
        hasInit;

    function render() {
        init();
        initImgState();
        show();
    }

    function show() {
        kdAppSet.setAppTitle('我的设置');
        $view.show();
    }

    function hide() {
        $view.hide();
    }

    function init() {
        if (!hasInit) {
            $view = $('#view-setting');
            var userinfo = kdAppSet.getUserInfo();
            var identity = userinfo.identity;
            if (identity == "manager" || identity == "buyer") {
                operationsurl = "http://www.xingdongliu.com/h5preview/U20e08afcd3266674de217e62248665dbfe91240e";
            }
            else {
                operationsurl = "http://www.xingdongliu.com/h5preview/U04d7bf334b8662fcfe04f538aab8fc5d00d6d3bc";
            }
            //debugger;
            var buildDate=$('[kdbuilddate]');
            $view.find('[data-cmd="build-date"]')[0].innerText=buildDate.length==0?'':'('+buildDate.attr('kdbuildDate')+')';

            bindEvents();
            setCustPhoneInfo();
            initScroller();
            hasInit = true;
        }
    }

    function initImgState() {
        //初始化图标
        var iconstate = $view.find('[data-cmd="imgState"]');
        var imgState = kdAppSet.getImgMode();
        if (imgState) {
            iconstate.removeClass('noImgState_touched');

        } else {
            iconstate.addClass('noImgState_touched');
        }
    }

    function bindEvents() {
        $('#view-setting').delegate('.row', {
            'touchstart': function () {
                $(this).addClass('me_touched');
                $(this).children().addClass('me_touchedBottom');
            },
            'touchend': function () {
                $(this).removeClass('me_touched');
                $(this).children().removeClass('me_touchedBottom');
            }
        });

        $('#view-setting #noimg-div').bind('click', function () {
            var imgKey = kdAppSet.getNoimgModeCacheKey();
            var state = kdShare.cache.getCacheDataObj(imgKey);
            var icon = $(this).find('.noImgState');
            if (state === '0') {

                icon.removeClass('noImgState_touched');
                kdShare.cache.setCacheDataObj(1, imgKey);
                OptMsg.ShowMsg("您已取消无图模式", "", 3000);
            } else {
                icon.addClass('noImgState_touched');
                kdShare.cache.setCacheDataObj(0, imgKey);
                OptMsg.ShowMsg("您已开启无图模式，不会下载商品图片", "", 3000);
            }
            kdAppSet.h5Analysis('setting_noimg');
        });

        $('#view-setting').delegate('#refresh-span', {
            'click': function () {
                jConfirm("您确定刷新页面?\n(将重新加载微商城)", null, function (flag) {
                    if (flag) {
                        //刷新页面
                        window.location.reload(true);
                        kdAppSet.h5Analysis('setting_refresh');
                    }
                }, { ok: "是", no: "否" });
            },
            'touchstart': function () {
                var refresh = $('.view_Me .refreshIcon');
                refresh.removeClass('sprite-refresh');
                refresh.addClass('sprite-refresh_s');
            },
            'touchend': function () {
                var refresh = $('.view_Me .refreshIcon');
                refresh.removeClass('sprite-refresh_s');
                refresh.addClass('sprite-refresh');
            }
        });

        // 电话点击事件
        $('#view-setting #me_Phone').bind('click', function () {
            kdAppSet.h5Analysis('setting_Phone');
            var phone = $("#me_Phone").attr("href");
            if (phone == "tel:") {
                jAlert("很抱歉,客服的电话号码为空!");
                return false;
            }
        }).on(kdShare.clickfnIcon($('.view_Me .serverItem .phone'), 'tel', 'tel_p'));

        // 关于微商城
        $('#view-setting #about-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['aboutPage']);
            kdAppSet.h5Analysis('setting_about');
        });

        //版本更新说明
        $('#view-setting #update-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['UpdateList']);
            kdAppSet.h5Analysis('setting_update');
        });

        // 意见反馈点击事件
        $('#view-setting #feedback-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: 'http://club.kisdee.com/forum.php?mod=forumdisplay&fid=900' }]);
            kdAppSet.h5Analysis('setting_feedback');
        });

        //操作指南
        $('#view-setting #operations-div').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: operationsurl }]);
            kdAppSet.h5Analysis('setting_operations');
        });
    }

    function setCustPhoneInfo() {
        /*        var user = kdAppSet.getUserInfo();
         var phone = user.receiverPhone || "";
         var name = user.empName || "";
         if (!phone) {
         phone = user.servicePhone || "";
         name = user.serviceName || "";
         }*/
        var phone = '';
        var name = '';
        var user = kdAppSet.getUserInfo();
        /*        serviceOption  ---0：表示要时使用专营业务员作为“客服”显示；
         1--表示直接使用“客服”列表中的主负责人作为“客服”显示*/
        if (user.serviceOption == 0) {
            name = user.empName;
            phone = user.receiverPhone;
        } else {
            var service = OptMsg.getMsgServiceList();
            if (service.length > 0) {
                phone = service[0].servicePhone;
                name = service[0].serviceName;
            }
        }
        $("#me_Phone").attr("href", "tel:" + phone);
        $("#view-setting .serviceName").text(name);
    }


    function initScroller() {
        var scroller = Lib.Scroller.create($view[0]);
    }

    return {
        render: render,
        show: show,
        hide: hide
    }
})();

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
var aboutPage = (function () {
    var div, scroller, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_aboutPage');
            scroller = Lib.Scroller.create($(div)[0]);
            $(div).find('.logo').attr('src', 'img/register_logo.png');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        $('#aboutPage_Production').bind('click', function () {
            $(this).addClass('btn_touched');
            $('#aboutPage_Client').removeClass('btn_touched');
        });
        $('#aboutPage_Client').bind('click', function () {
            $(this).addClass('btn_touched');
            $('#aboutPage_Production').removeClass('btn_touched');
        });
        $('#aboutPage_Call').delegate('', {
            'touchstart': function () {
                $(this).addClass('call_touched');
            },
            'touchend': function () {
                $(this).removeClass('call_touched');
            }
        });
    }

    function render() {
        initView();
        show();
        scroller.refresh();
    }

    function show() {
        kdAppSet.setAppTitle('关于');
        $(div).show();
        $('.afterRegisterDiv').hide();
    }

    function hide() {
        $('.afterRegisterDiv').hide();
        $(div).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();
/**
 * 图片大图显示
 * */
var ImageView = (function () {
    var divImgView,
        //imgv,
        elemRect,
        qrcode,
        config,
        SliderPosi,
        sampleImg,
        sampleImgli,
        SwipeWrap,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            divImgView = $(".divImgView");
            elemRect = document.getElementById('ImgViewDetail');
            SwipeWrap=document.getElementById('divImgViewSwipeWrap');
            sampleImg=$.String.between(SwipeWrap.innerHTML, '<!--', '-->');
            SliderPosi=document.getElementById('divImgViewSliderPosi');
            sampleImgli = $.String.between(SliderPosi.innerHTML, '<!--', '-->');
            
            bindEvents();
            hasInit = true;
        }
    }


    //显示图片信息
    function freshImgList(imglist){
        var  imgls=[];
        if(imglist instanceof  Array){
            imgls= imglist;
        }else{
            imgls.push(imglist);
        }
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();

        SwipeWrap.innerHTML = $.Array.keep(imgls, function (item,i) {
            var  imgsrc= item != '' ? (imgMode ?item : noimgModeDefault) : 'img/no_img.png';
            var  imgthumbnail= 'img/no_img.png';
            return $.String.format(sampleImg, {
                index: i,
                img: imgsrc,
                imgthumbnail: imgthumbnail
            });
        }).join('');

        if(imgls.length<=1){
            imgls=[];
        }
        SliderPosi.innerHTML = $.Array.keep(imgls, function (item) {
            return $.String.format(sampleImgli, {});
        }).join('');

        initSwipe(imgls);
    }


    function initSwipe(imgls){
        var bullets = document.getElementById('divImgViewSliderPosi').getElementsByTagName('li');
        Swipe(document.getElementById('ImgViewDetail'), {
                startSlide: config.posi,
                auto: 0,
                continuous: false,
                disableScroll: false,
                stopPropagation: false,
                allowVerticalMove: false,
                callback: function(pos) {
                },
                transitionEnd: function(index, element) {
                    var i = bullets.length;
                    if(i>0){
                        while (i--) {
                            bullets[i].className = ' ';
                        }
                        bullets[index].className = 'on';
                    }
                }
            });
        var iwidth=$(window).width();
        if(iwidth>640){
            iwidth='640px';
        }
        $('#ImgViewDetail .middiv ').css('width',iwidth);
        $('#ImgViewDetail nav ').css('width',iwidth);
        var ImgViewDetailPosi=$('#ImgViewDetail nav .position li')[config.posi];
        if(imgls.length>1){
            $(ImgViewDetailPosi).addClass('on');
        }
    }


    function getImgQrcodeUrl(){
        var discribe=config.goodsname;
        var url=config.qrcodelink;

        var logourl=config.imgobj[0];
        var timestamp=Math.round(new Date().getTime()/1000);
        var token=Lib.MD5.encrypt(discribe + "kingdee_xxx" + timestamp);
        var  qrImg='http://mob.cmcloud.cn/ServerCloud/WDH/genGoodsQRcode?';
        qrImg=qrImg+'discribe='+encodeURIComponent(discribe)+'&url='+encodeURIComponent(url)
            +'&logourl='+encodeURIComponent(logourl)+'&timestamp='+timestamp+'&token='+token;
        return qrImg;
    }

    function bindEvents() {

        $('.divImgView').bind('click',function(ev){
            var curClick=ev.target;
            var cname=curClick.className || '';
            if(cname.indexOf('qrcode')>=0){
                if(curClick.innerHTML=='显示二维码'){
                    curClick.innerHTML='显示图片';
                    var imgview=$('#ImgViewQrcode img');
                    imgview.attr('src','img/loading.png');
                    var imgurl=getImgQrcodeUrl();
                    imgview.attr('src',imgurl);
                    showQrcode(true);
                }else{
                    curClick.innerHTML='显示二维码';
                    showQrcode(false);
                }
            }else{
                setTimeout(function () {
                    $("#divMask").hide();
                }, 500);
                kdShare.backView();
            }
        });
    }


    function deleteLoadingImg() {
        divImgView.find('span').addClass('afterImgLoaded');
        divImgView.find('img').removeClass('hideImg');
    }

    function showImage(imgobj) {
        if (config.type == 'followme') {
            divImgView.find('[data-cmd="focusme"]')[0].innerText = '长按图片关注';
        } else {
            divImgView.find('[data-cmd="focusme"]')[0].innerText = '';
        }
        divImgView.show();
        if (typeof imgobj === "object" &&  !(imgobj  instanceof  Array) ){
            var imgsrc = "";
            if (imgobj[0].tagName.toLowerCase() == "img") {
                imgsrc = kdAppSet.getImgThumbnail(imgobj.attr("src"), true);
            } else {
                imgsrc = kdAppSet.getImgThumbnail(imgobj.find('img').attr("src"), true);
            }
            freshImgList(imgsrc);
        }else{
            freshImgList(imgobj);
        }
    }

    //是否显示二维码
    function showQrcode(bview){
        var imgv=$('#ImgViewDetail');
        var barcode=$('#ImgViewQrcode');
        if(bview){
            imgv.hide();
            barcode.show();
        }else{
            barcode.hide();
            imgv.show();
        }
    }


    function render(configp) {
        config = configp;
        initView();
        $("#divMask").show();
        var btnQrcode=$('.divImgView .qrcode');
        if(config.qrcodelink){
            btnQrcode.show();
            btnQrcode[0].innerHTML='显示二维码';
        }else{
            btnQrcode.hide();
        }
        showQrcode(false);
        showImage(config.imgobj);
    }

    return {
        render: render,
        show: function () {
            divImgView.show();
        },
        hide: function () {
            divImgView.hide();
            deleteLoadingImg();
        }
    };
})();


/*选择页面*/

var SingleSelectList = (function () {

    var viewdiv, div, ul, sample, hasBind, scroller, list, hintTxt,
        ullist, currentPage, itemsOfPage, configParam, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewdiv = document.getElementById('view-select');
            div = document.getElementById('div-selectList');
            ul = div.firstElementChild;
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            hasBind = false;
            scroller = null;
            list = [];
            hintTxt = '关键字搜索';
            ullist = $(ul);
            currentPage = 1;
            itemsOfPage = 500;
            configParam = null;
            hasInit = true;
        }
    }


    function load(fn, api, para) {

        Lib.API.get(api, {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: para
        }, function (data, json) {
            removeHint();
            if (api == 'GetAreaInfo') {
                zoneSelect(data, json, fn);
            } else if (api == 'GetAreaList') {
                citySelect(data, json, fn);
            } else if (api == 'GetWLCompany') {
                getWLCompany(data, json, fn);
            }
        }, function (code, msg, json) {
            removeHint();
            ullist.append('<li class="hintflag">' + msg + '</li>');

        }, function () {
            removeHint();
            ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
        }, "");
    }

    function zoneSelect(data, json, fn) {
        list = $.Array.keep(data || [], function (item, index) {
            return {
                name: item.FName,
                id: item.FInterID,
                index: index,
                bselect: (item.FInterID == configParam.selobj.id) ? 'sprite-area_select' : ''
            };
        });
        fn && fn(list);
    }

    function citySelect(data, json, fn) {
        data = data.arealist;
        list = $.Array.keep(data || [], function (item, index) {
            return {
                name: item.areaname,
                id: item.areanumber,
                index: index,
                bselect: (item.areanumber == configParam.selobj.id) ? 'sprite-area_select' : ''
            };
        });
        fn && fn(list);

    }

    function getWLCompany(data, json, fn) {
        data = data.WLCompanyList;
        list = $.Array.keep(data || [], function (item, index) {
            return {
                name: item.name,
                id: item.code,
                index: index,
                bselect: (item.code == configParam.selobj.id) ? 'sprite-area_select' : ''
            }
        });
        fn && fn(list);
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
    }

    function fill(a) {
        if (scroller) {
            scroller.scrollTo(0, 0, 500);
        }
        ul.innerHTML = "";
        var listStr = $.Array.keep(a, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                index: item.index,
                bselect: item.bselect
            });
        }).join('');
        removeHint();
        if (currentPage > 1) {
            $(ul).append(listStr);
        } else {
            ul.innerHTML = listStr;
            if (a.length == 0) {
                ul.innerHTML = '<li class="empty  hintflag">没有查询到相关数据</li>';
            }
        }
        if (scroller) {
            scroller.refresh();
        }
    }


    function bindEvents() {
        $(ul).delegate("li[index]", {
            'click': function () {
                var curli = $(this);
                var index = curli.attr("index");
                var selobj = list[index];
                configParam.callBack && configParam.callBack({ name: selobj.name, id: selobj.id });
                kdAppSet.stopEventPropagation();
            },
            'touchstart': function () {
                $(this).addClass('checked');
            },
            'touchend': function () {
                $(this).removeClass('checked');
            }
        });

        $(viewdiv).delegate('#singleSelect_SearchBtn', {
            'click': function () {
                searchResult();
            },
            'touchstart': function () {
                $(this).addClass('onclick');
            },
            'touchend': function () {
                $(this).removeClass('onclick');
            }
        });

        $(viewdiv).delegate('#singleSelect_SearchTxt', {
            'focus': function () {
                $(this).addClass('textFocus');
                $('#singleSelect_SearchClear').show();
            },
            'blur': function () {
                var searchKey = kdShare.trimStr($(this).val());
                if (searchKey == '' || searchKey == hintTxt) {
                    $(this).removeClass('textFocus');
                    $('#singleSelect_SearchClear').hide();
                }
            },
            'input': function () {
                searchResult();
            }
        });
        $(viewdiv).delegate('#singleSelect_SearchClear', {
            'click': function () {
                $(viewdiv).find('#singleSelect_SearchTxt').val('');
                $(viewdiv).find('#singleSelect_SearchTxt').focus();
            }
        })
    }


    function searchResult() {
        var resultKey = kdShare.trimStr($(viewdiv).find('#singleSelect_SearchTxt').val());
        resultKey = kdAppSet.ReplaceJsonSpecialChar(resultKey);
        if (resultKey == '' || resultKey == hintTxt) {
            fill(list);
        }
        else {
            var temp = [];
            // 获取符合要求的临时列表
            for (var i = 0; i < list.length; i++) {
                var name = list[i].name.toLowerCase() || '';
                if (name.match(resultKey.toLowerCase())) {
                    temp.push(list[i]);
                }
            }
            // 填充列表
            fill(temp);
        }
    }

    function render(config) {
        initView();
        configParam = config;
        ullist.html('');
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        $('#singleSelect_SearchTxt').val('');
        show();
        if (!hasBind) {
            bindEvents();
            hasBind = true;
        }
        (function () {
            load(function (data) {
                if (!scroller) {
                    scroller = Lib.Scroller.create(div);
                    scroller.refresh();
                }
                fill(data);
            }, configParam.api, configParam.para);
        })();
    }

    function show() {
        $(viewdiv).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(viewdiv).hide();
        }
    };

})();
;
var ViewError = (function () {
    var viewPage,
        config,
        errImg,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage=document.getElementById('viewid_error');
            errImg=$('.view_error .errImage');
            errImg.addClass('sprite-systemError');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents(){
        var scroller = Lib.Scroller.create(viewPage);
        var option = {
            fnfresh: function (reset) {
                kdAppSet.wxGetNetWork(
                    function(){
                        freshErrorInfo();
                        reset();
                    },
                    function(){
                     //手机端网络异常
                    }
                );
            },
            hintbottom: -0.4
        };
        kdctrl.initkdScroll(scroller, option);

        $('#viewid_error').delegate('.errFresh',{
            'click':function(){
                freshErrorInfo();
            },
            'touchstart':function(){
                $(this).addClass('errFresh_touched');
            },
            'touchend':function(){
                $(this).removeClass('errFresh_touched');
            }
        });
    }

    function freshErrorInfo(){
        config.fn && config.fn(config.fnParam);
        history.back();
    }

    function render(configp) {
        initView();
        config=configp;
        var errMsg=configp.errMsg || '';
        //手机端网络错误
        var err=$('.view_error .err')[0];
        var errHint=$('.view_error .errHint');
        var errInfo=$('#viewid_error .errInfo');
        if(errMsg==kdAppSet.getAppMsg().netWorkError){
            errInfo.hide();
            errImg.removeClass('sprite-systemError');
            errImg.addClass('sprite-newworkError');
            err.innerHTML='亲,你的手机网络不给力哦!';
            errHint.hide();
        }else{
            errInfo.show();
            errInfo[0].innerHTML=errMsg;
            errImg.removeClass('sprite-newworkError');
            errImg.addClass('sprite-systemError');
            err.innerHTML='系统正在维护中';
            errHint.show();
        }
        show();
    }


    function show() {
        $(viewPage).show();
    }

    function hide() {
        $(viewPage).hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();
/**
 *alert by mayue on 2015-12-22 重新改写定位
 */
var ViewMap = (function () {
    var viewPage,
        config,
        listdata,
        hasInit,
        mapObj;
    var mapjsurl = 'http://webapi.amap.com/maps?v=1.3&key=b3e668b7441992532613810c7dda3072';

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = document.getElementById('viewid_map');
            listdata = {};
            bindEvents();
            hasInit = true;
        }
    }



    MiniQuery.Event.bind(window, {
        'ViewMapLoadJs': function () {
            kdAppSet.loadScriptFile(mapjsurl);
        }
    });

    function bindEvents() {
        //选择地址
        $('#view_maplist').delegate('li', {
            'click': function () {
                var index = this.getAttribute('index');
                var addressh = listdata.regeocode.addressComponent;
                var list = listdata.regeocode.pois;
                var item = list[index];
                //对四个直辖市特殊处理
                var cityname = new Array('北京市', '上海市', '重庆市', '天津市');
                if (cityname.indexOf(addressh.province) != -1) {
                    addressh.city = addressh.province;
                    addressh.province = addressh.province.substring(0, addressh.province.length - 1);
                }
                var addressInfo = {
                    province: addressh.province,
                    city: addressh.city,
                    district: addressh.district,
                    address: item.address + item.name
                };
                config.selectAddress && config.selectAddress(addressInfo);
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('li_touched');
            },
            'touchend': function () {
                $(this).removeClass('li_touched');
            }
        });

    }

    //    function getLocation() {
    //        if (navigator.geolocation) {
    //            kdAppSet.setKdLoading(true, '获取地理位置...');
    //            navigator.geolocation.getCurrentPosition(showPosition,showError);
    //        }
    //        else {
    //            OptMsg.ShowMsg('您的浏览器不支持地理定位');
    //        }
    //        function showPosition(position) {
    //            kdAppSet.setKdLoading(false);
    //            Gaode.geocoder({
    //                    location: {
    //                        lat: position.coords.latitude,
    //                        long: position.coords.longitude
    //                    },
    //                    callback: setListData}
    //            );
    //        }
    //        function showError(error)
    //        {
    //            kdAppSet.setKdLoading(false);
    //            switch(error.code)
    //            {
    //                case error.PERMISSION_DENIED:
    //                    OptMsg.ShowMsg('用户拒绝获取地理位置','',3000);
    //                    break;
    //                case error.POSITION_UNAVAILABLE:
    //                    OptMsg.ShowMsg('获取不到用户地理位置','',3000);
    //                    break;
    //                case error.TIMEOUT:
    //                    OptMsg.ShowMsg('获取地理位置超时','',3000);
    //                    break;
    //                case error.UNKNOWN_ERROR:
    //                    OptMsg.ShowMsg('获取地理位置,出现未知错误','',3000);
    //                    break;
    //            }
    //        }
    ///*        Gaode.geocoder({
    //            location:{
    //                lat: 22.533938,
    //                long: 113.955391
    //            },
    //            callback:setListData
    //        });*/
    //    }

    function getLocation() {
        try {

            mapObj = new AMap.Map('viewMapKingdee', {
                resizeEnable: true,
                zoom: 13
            });

            kdAppSet.setKdLoading(true, '获取地理位置...');
            mapObj.plugin('AMap.Geolocation', function () {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    //zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    buttonPosition: 'RB'
                });
                //mapObj.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
            });
        } catch (e) {
            OptMsg.ShowMsg('获取地理位置失败，请手动选择收货地址', function () { kdShare.backView() }, 2000);

        }
    }

    function onComplete(data) {
        kdAppSet.setKdLoading(false);
        Gaode.geocoder({
            mapObj: mapObj,
            location: {
                long: data.position.getLng(),
                lat: data.position.getLat()
            },
            callback: setListData
        }
                );
    }

    function onError(data) {
        OptMsg.ShowMsg('获取地理位置,定位错误', '', 3000);
    }

    function setListData(data) {
        listdata = data;
    }

    function render(initconfig) {
        config = initconfig;
        initView();
        show();
        getLocation();
    }

    function show() {
        $(viewPage).show();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(viewPage).hide();
        }
    };
})();
var commonIframe = (function () {
    var div, iframe, hasInit;

    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_commonIframe');
            iframe = $(div).find('iframe');
            hasInit = true;
        }
    }

    function render(obj) {
        initView();
        show();
        if (obj.src) {
            iframe.attr('src', obj.src);
        }
    }

    function show() {
        $(div).show();
    }

    function hide() {
        $(div).hide();
        iframe.attr('src', '');
        document.getElementById('viewid_iframe').innerHTML='';
    }


    return {
        render: render,
        show: show,
        hide: hide
    }
})();
/*门店选择列表*/


var StoreList = (function () {
    var sample, regionSample, scroller, storeList, ul, ullist, config,
        regionInfo, viewpage, showHint, currentPage, itemsOfPage, TotalPage, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-store-list');
            viewpage = $(div);
            viewpage.find('[data-cmd="locate"] img').attr('src', 'img/location.png');
            var divlist = document.getElementById('div-view-store-list');
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            var region = document.getElementById('ul-view-store-address-list');
            regionSample = $.String.between(region.innerHTML, '<!--', '-->');
            storeList = [];
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            regionInfo = {
                prov: { name: "省", id: -1 },
                city: { name: "市", id: -1 },
                dist: { name: "区", id: -1 }
            };
            bindEvents();
            fillRegion();
            initScroll(divlist);
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        var option = {
            hinttop: 1.56,
            fnfresh: function (reset) {
                reset();
                storeList = [];
                currentPage = 1;
                getStoreList();
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                getStoreList();
                reset();
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }


    function fillRegion() {
        $('#ul-view-store-address-list')[0].innerHTML = $.String.format(regionSample, {
            province: regionInfo.prov['name'] || '省',
            city: regionInfo.city['name'] || '市',
            district: regionInfo.dist['name'] || '区'
        });
    }

    function getPara() {
        var city = regionInfo.city['name'] || '';
        var dist = regionInfo.dist['name'] || '';
        return city + dist;
    }

    // 获取门店列表
    function getStoreList() {
        //loadingHint();
        //门店类型 type 增加传入项： "send" --- 表示允许配送的门店
        Lib.API.get('GetStoreList', {
                currentPage: currentPage,
                ItemsOfPage: itemsOfPage,
                para: {
                    'region': getPara(),
                    'lng': config.lng,
                    'lat': config.lat,
                    'type': config.type || ''
                }
            },
            function (data, json) {
                TotalPage = json.TotalPage ? json.TotalPage : 0;
                var list = getListData(data.storelist);
                storeList = currentPage == 1 ? list : storeList.concat(list);
                // 填充模板
                freshList(storeList);
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            });
    }

    //获取门店列表 判断是否只有一个门店
    function getOnlyOneStore(fn) {
        Lib.API.get('GetStoreList', {
                para: {
                    'region': '',
                    'lng': 0,
                    'lat': 0
                }
            },
            function (data, json) {
                var list = data.storelist;
                if (list.length == 1) {
                    var item = list[0];
                    var aitem = {
                        name: item.name,
                        address: item.address,
                        id: item.id
                    };
                    fn & fn(aitem);
                }
            });
    }


    function getListData(data) {
        showHint = true;
        var listOther = [];
        var list = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            var selected = (item.id == config.selectId);
            var aitem = {
                name: item.name,
                address: item.address,
                id: item.id,
                selected: selected,
                ismatch: item.ismatch,
                lat: item.lat,
                lng: item.lng,
                distance: item.distance,
                phone: item.phone || ""
            };
            if (aitem.ismatch == 1) {
                showHint = false;
                list.push(aitem);
            } else {
                listOther.push(aitem);
            }
        }
        if (getPara() == '市区') {
            showHint = false;
        }
        return (list.length > 0 ? list : listOther)
    }

    // 填充门店列表
    function freshList(datalist) {
        var hint = viewpage.find('[data-cmd="hint"]');
        var storeList = $('#div-view-store-list');
        if (datalist.length > 0 && showHint) {
            hint.show();
            storeList.css({ 'top': '1.8rem' });
        } else {
            hint.hide();
            storeList.css({ 'top': '1rem' });
        }

        var listStr = $.Array.keep(datalist, function (item, index) {
            return $.String.format(sample, {
                index: index,
                has: (!showHint && index == 0) ? 'has' : '',
                on: item.selected ? 'on' : '',
                name: item.name,
                address: item.address,
                hide: distancehide(item.distance),
                distance: distanceshow(item.distance)
            });
        }).join('');
        removeHint();
        if (datalist.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        scroller.isPageEnd = (currentPage >= TotalPage);
        scroller.refresh();
    }

    function distancehide(distance) {
        if (distance == -1) {
            return "hide";
        } else {
            return "";
        }
    }

    function distanceshow(distance) {
        if (distance < 1) {
            return (distance * 1000).toFixed(2) + 'm';
        } else {
            return distance.toFixed(2) + 'km';
        }
    }


    // 移除加载提示信息
    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
        ullist.children().filter('.emptySearch').remove();
    }

    // 绑定事件
    function bindEvents() {
        viewpage.delegate('[data-cmd="province"]', {
            'click': function () {
                callProvince();
            },
            'touchstart': function () {
                $(this).addClass('addBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('addBtn_touched');
            }
        }).delegate('[data-cmd="city"]', {
            'click': function () {
                callCity();
            }
        }).delegate('[data-cmd="district"]', {
            'click': function () {
                callDistrict();
            }
        }).delegate('[data-cmd="store"]', {
            'click': function (event) {
                //门店选择
                var index = this.getAttribute('data-index');
                if (event.target.getAttribute('data-cmd') == 'guide') {
                    //导航
                    navigation(index);
                } else {
                    config.fnselect && config.fnselect(storeList[index]);
                    kdShare.backView();
                }
            },
            'touchstart': function () {
                $(this).find('[data-cmd="guide"]').addClass('on');
            },
            'touchend': function () {
                $(this).find('[data-cmd="guide"]').removeClass('on');
            }
        }).delegate('[data-cmd="locate"]', {
            'click': function () {
                //自动定位
                MiniQuery.Event.trigger(window, 'toview', ['ViewMap', { selectAddress: selectAddress }]);
            }
        });
    }

    //门店导航--2016-4-18 by mayue
    function navigation(index) {
        var address = storeList[index];
        var lng = address.lng;
        var lat = address.lat;
        if (lat == 0 && lng == 0) {
            Gaode.regeocoder(address.address, function (location) {
                if (location.result == "complete") {
                    lng = location.lng;
                    lat = location.lat;
                    mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + address.address;
                    MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
                } else {
                    OptMsg.ShowMsg('地址有误，请联系客服', "", 3000);
                    return false;
                }
            });
        } else {
            mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + address.address;
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
        }
    }

    function selectAddress(addrInfo) {
        regionInfo = {
            prov: { name: addrInfo.province, id: -1 },
            city: { name: addrInfo.city, id: -1 },
            dist: { name: addrInfo.district, id: -1 }
        };
        fillRegion();
        getAddressCode({
            province: addrInfo.province,
            city: addrInfo.city,
            district: addrInfo.district
        });
    }


    //获取定位地址编码
    function getAddressCode(address) {

        kdAppSet.setKdLoading(true, '获取地址编码...');

        Lib.API.post('GetAddressNumber', {
                para: getLocationPara(address)
            }, function (data, json, root, userflag) {
                kdAppSet.setKdLoading(false);
                dealLocationCode(data);
            }, function (code, msg, json, root, userflag) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('网络错误，请稍候再试', '', 3000);
            }
        );
    }

    function getLocationPara(address) {
        //{"citynumber":440300,"districtnumber":110101,"provincenumber":440000}
        return {
            provincename: address.province,
            provincenumber: "",
            cityname: address.city,
            citynumber: "",
            districtname: address.district,
            districtnumber: ""
        };
    }


    function dealLocationCode(data) {
        regionInfo.prov.id = data.provincenumber;
        regionInfo.city.id = data.citynumber;
        regionInfo.dist.id = data.districtnumber;
    }


    function callProvince() {
        var curThis = viewpage.find('[data-cmd="province"] span')[0];
        var oldProvince = curThis.innerText;
        OptView.getAreaInfo(regionInfo.prov, curThis, { parentnumber: '' }, function () {
            // 但内容改变时初始化市区内容
            if (oldProvince != curThis.innerText) {
                callCity();
                kdShare.clearBackView(1);
            }
        });
    }

    function callCity() {
        var curThis = viewpage.find('[data-cmd="city"] span')[0];
        var oldCity = curThis.innerText;
        var pid = regionInfo.prov['id'];
        if (pid == -1 || !pid) {
            OptMsg.ShowMsg('请先选择省份!', '', 1500);
            return;
        }
        OptView.getAreaInfo(regionInfo.city, curThis, { parentnumber: pid },
            function () {
                // 内容改变时初始化区内容
                if (oldCity != curThis.innerText) {
                    //不需要区
                    //callDistrict();
                    //kdShare.clearBackView(1);
                    kdShare.backView();

                }
            });
    }


    function callDistrict() {
        var curThis = viewpage.find('[data-cmd="district"] span')[0];
        var pid = regionInfo.city['id'];
        if (pid == -1 || !pid) {
            OptMsg.ShowMsg('请先选择市!', '', 1500);
            return;
        }
        OptView.getAreaInfo(regionInfo.dist, curThis, { parentnumber: pid }, function () {
            //刷新店铺列表
            ul.innerHTML = '';
            getStoreList();
            kdShare.backView();
        });
    }


    function render(configp) {
        config = configp || {};
        initView();
        show();
    }


    // 显示加载提示信息
    function loadingHint() {
        ullist.empty();
        ullist.children().filter('.hintflag').remove();
        ullist.append('<div class="hintflag">' + Lib.LoadingTip.get() + '</div>');
        ullist.children().filter('.spacerow').remove();
        ullist.append('<div class="spacerow"></div>');
    }


    function show() {
        kdAppSet.setAppTitle('门店列表');
        viewpage.show();
        ul.innerHTML = '';
        getStoreList();
    }

    function hide() {
        viewpage.hide();
    }

    return {
        getOnlyOneStore: getOnlyOneStore,
        render: render,
        show: show,
        hide: hide
    };


})();
/*门店选择列表*/


var StoreViewList = (function () {
    var viewpage, hasInit, sample, scroller, currentPage, itemsOfPage,
        TotalPage, storeList, ul, ullist;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-store-view-list');
            viewpage = $(div);
            currentPage = 1;
            itemsOfPage = 10;
            TotalPage = 0;
            storeList = [];
            var divlist = document.getElementById('viewid-store-view-list-scroll');//滑动区域
            ul = divlist.firstElementChild;
            ullist = $(ul);
            sample = $.String.between(ul.innerHTML, '<!--', '-->');
            var name = kdAppSet.getUserInfo().cmpInfo.name;
            bindevents();
            initScroll(divlist);
            fillhead();
            hasInit = true;
        }
    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        scroller.noticetop = 1.8;
        var option = {
            fnfresh: function (reset) {
                storeList = [];
                currentPage = 1;
                getStoreList(reset);
            },
            fnmore: function (reset) {
                if (parseInt(currentPage) >= parseInt(TotalPage)) {
                    reset();
                    return;
                }
                currentPage = parseInt(currentPage) + 1;
                getStoreList(reset);
            }
        };
        kdctrl.initkdScroll(scroller, option);
    }

    function fillhead() {
        var imgsrc = kdAppSet.getUserInfo().cmpInfo.img || "img/me.png";
        $(".header-detail img").attr("src", imgsrc);
        viewpage.find('[data-cmd="name"]')[0].innerHTML = kdAppSet.getUserInfo().cmpInfo.name;
    }

    function bindevents() {
        viewpage.delegate('[data-cmd="guide"]', {
            'click': function () {
                var index = this.parentElement.getAttribute('index');
                navigation(index);

            },
            'touchstart': function () {
                $(this).addClass('on');
            },
            'touchend': function () {
                $(this).removeClass('on');
            }
        });

        viewpage.delegate('[data-cmd="phone"]', {
            'click': function () {
                var index = this.getAttribute('index');
                callphone(index);
            },
            'touchstart': function () {
                $(this).addClass('on');
            },
            'touchend': function () {
                $(this).removeClass('on');
            }
        });

        //清除
        viewpage.delegate('[data-cmd="clear"]', {
            'click': function () {
                var str = viewpage.find('[data-cmd="keyword"]')[0].value;
                str = str.replace(/\s+/g, "");
                viewpage.find('[data-cmd="keyword"]')[0].value = '';
                if (str) {
                    storeList = [];
                    currentPage = 1;
                    getStoreList();
                } else {
                    return false;
                }


            }
        });

        //form 表单 阻断提交
        viewpage.delegate('[data-cmd="input"]', {
            'submit': function () {
                var str = viewpage.find('[data-cmd="keyword"]')[0].value;
                str = str.replace(/\s+/g, "");
                if (str) {
                    storeList = [];
                    currentPage = 1;
                    ul.innerHTML = "";
                    ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
                    getStoreList();
                }
                return false;  //阻断
            }
        });
    }

    function callphone(index) {
        var phone = storeList[index].phone || '';
        var phoneUrl = "tel:" + phone;
        if (phoneUrl == "tel:") {
            jAlert("很抱歉,门店的电话号码为空!");
            return false;
        }
        window.location.href = phoneUrl;
    }

    //门店导航
    function navigation(index) {
        var address = storeList[index];
        var lng = address.lng;
        var lat = address.lat;
        if (lat == 0 && lng == 0) {
            Gaode.regeocoder(address.address, function (location) {
                if (location.result == "complete") {
                    lng = location.lng;
                    lat = location.lat;
                    mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + address.address;
                    MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
                } else {
                    OptMsg.ShowMsg('地址有误，请联系客服', "", 3000);
                    return false;
                }
            });
        } else {
            mapurl = "http://m.amap.com/?q=" + lat + "," + lng + "&name=" + address.address;
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: mapurl }]);
        }

    }

    // 获取门店列表
    function getStoreList(fnReset) {
        if (currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        }
        var str = viewpage.find('[data-cmd="keyword"]')[0].value;
        str = str.replace(/\s+/g, "");

        Lib.API.get('GetStoreList', {
            currentPage: currentPage,
            ItemsOfPage: itemsOfPage,
            para: {
                'keyword': str,
                'type': 'offline'
            }
        },
            function (data, json) {
                TotalPage = json.TotalPage ? json.TotalPage : 0;
                var list = data.storelist;
                storeList = currentPage == 1 ? list : storeList.concat(list);
                // 填充模板
                freshList(storeList);
                removeHint();
                fnReset && fnReset();
            }, function (code, msg) {
                removeHint();
                ullist.append('<li class="hintflag">' + msg + '</li>');
                fnReset && fnReset();
            }, function () {
                removeHint();
                ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
                fnReset && fnReset();

            });
    }

    function freshList(storeList) {
        var listStr = $.Array.keep(storeList, function (item, index) {
            return $.String.format(sample, {
                index: index,
                name: item.name,
                address: item.address,
                phone: item.phone || ""
            });
        }).join('');

        if (storeList.length == 0) {
            ul.innerHTML = '<div class="emptySearch"><img src="img/empty.png"><span>没有查询到相关门店数据</span></div>';
        } else {
            ul.innerHTML = listStr;
        }
        scroller.isPageEnd = (currentPage >= TotalPage);
        scroller.refresh();
    }

    function removeHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    function render() {
        initView();
        show();
        debugger;
        viewpage.find('[data-cmd="keyword"]')[0].value = '';

    }
    function show() {
        kdAppSet.setAppTitle('门店列表');
        OptAppMenu.showKdAppMenu(false);
        viewpage.show();
        getStoreList();
        scroller.refresh();
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
/*门店选择列表*/

var Promotion = (function () {
    var viewpage, hasInit, sample, scroller,
        content;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-promotion');
            viewpage = $(div);
            content = document.getElementById('ul-view-promotionlist');
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
                    name: 'lih',
                    begin: '#--lih.begin--#',
                    end: '#--lih.end--#'
                },
                {
                    name: 'buyh',
                    begin: '#--buyh.begin--#',
                    end: '#--buyh.end--#'
                },
                {
                    name: 'buylist',
                    begin: '#--buylist.begin--#',
                    end: '#--buylist.end--#'

                },
                {
                    name: 'buyf',
                    begin: '#--buyf.begin--#',
                    end: '#--buyf.end--#'

                },
                {
                    name: 'gifth',
                    begin: '#--gifth.begin--#',
                    end: '#--gifth.end--#'

                },
                {
                    name: 'giftlist',
                    begin: '#--giftlist.begin--#',
                    end: '#--giftlist.end--#'

                },
                {
                    name: 'giftf',
                    begin: '#--giftf.begin--#',
                    end: '#--giftf.end--#'

                },
                {
                    name: 'lif',
                    begin: '#--lif.begin--#',
                    end: '#--lif.end--#'
                }
            ]);
            scroller = Lib.Scroller.create(div);
            hasInit = true;
        }
    }

    function fillList(arr) {
        var lih = "";
        var buyh = "";
        var buylist = "";
        var buyf = "";
        var gifth = "";
        var giftlist = "";
        var giftf = "";
        var lif = "";
        content.innerHTML = $.String.format(sample.container, {
            'items': $.Array.keep(arr, function (item, index) {
                lih = $.String.format(sample.lih, {
                    //'protitle': item.protitle + "(" + item.proExt + ")",
                    'style': styles(item.itemlist.length, item.giftlist.length),
                    'protitle': item.protitle,
                    'proExt': proExt(item.protitle, item.proExt),
                    'discountInfo': dicount(item.discountInfo),
                    'show': isshow(dicount(item.discountInfo))
                });

                //购买
                if (item.itemlist.length > 0) {
                    buyh = sample.buyh;
                    buylist = $.Array.keep(item.itemlist, function (itemlist, index) {
                        return $.String.format(sample.buylist, {
                            'name': itemlist.name,
                            'num': itemlist.num
                        });
                    }).join('');
                    buyf = sample.buyf;
                } else {
                    buyh = "";
                    buylist = "";
                    buyf = "";
                }

                //赠品
                if (item.giftlist.length > 0) {
                    gifth = sample.gifth;
                    giftlist = $.Array.keep(item.giftlist, function (giftlist, index) {
                        return $.String.format(sample.giftlist, {
                            'name': giftlist.name,
                            'num': giftlist.num
                        });
                    }).join('');
                    giftf = sample.giftf;
                } else {
                    gifth = "";
                    giftlist = "";
                    giftf = "";
                }
                lif = sample.lif;
                return lih + buyh + buylist + buyf + gifth + giftlist + giftf + lif;
            }).join('')
        });
    }

    function isshow(str) {
        if (str == "") {
            return 'hide';
        } else {
            return "";
        }
    }

    function styles(a, b) {
        if (a == 0 && b > 0) {
            return 'one';
        } else if (a > 0 && b == 0) {
            return 'one';
        } else {
            return "";
        }

    }

    function proExt(protitle, proExt) {
        if (protitle.indexOf('全场') > -1) {
            return "";
        } else {
            return proExt;
        }

    }

    function dicount(discountInfo) {
        var condition = "";
        var discount = "";
        var disrate = "";
        if (discountInfo.condition == "0.00" || discountInfo.condition == 0) {
            condition = ""
        } else {
            condition = "满" + discountInfo.condition;
        }
        if (discountInfo.discount == "0.00" || discountInfo.discount == 0) {
            discount = ""
        } else {
            discount = "减" + discountInfo.discount;
        }
        if (discountInfo.disrate == "0.00" || discountInfo.disrate == 0) {
            disrate = ""
        } else {
            disrate = discountInfo.disrate + "折";
        }
        return condition + discount + disrate;
    }

    function render(config) {
        initView();
        fillList(config);
        show();
        scroller.refresh(500);
    }

    function show() {
        kdAppSet.setAppTitle('促销');
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