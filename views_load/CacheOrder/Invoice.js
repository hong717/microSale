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