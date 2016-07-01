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