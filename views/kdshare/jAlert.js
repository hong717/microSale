(function ($) {

    $.alerts = {

        // These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time

        verticalOffset: -75,                // vertical offset of the dialog from center screen, in pixels
        horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
        repositionOnResize: true,           // re-centers the dialog on window resize
        overlayOpacity: 0.5,                // transparency level of overlay
        overlayColor: '#000',               // base color of overlay
        draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
        okButton: '&nbsp;确定&nbsp;',         // text for the OK button
        cancelButton: '&nbsp;取消&nbsp;', // text for the Cancel button
        dialogClass: null,                  // if specified, this class will be applied to all dialogs

        // Public methods

        alert: function (message, title, callback) {
            if (title == null) title = 'Alert';
            $.alerts._show(title, message, null, 'alert', function (result) {
                if (callback) callback(result);
            });
        },

        confirm: function (message, title, callback, btnobj) {
            $.alerts.okButton = btnobj.ok;
            $.alerts.cancelButton = btnobj.no;
            if (title == null) title = 'Confirm';
            $.alerts._show(title, message, null, 'confirm', function (result) {
                if (callback) callback(result);
            });
        },

        prompt: function (message, value, title, callback) {
            if (title == null) title = 'Prompt';
            $.alerts._show(title, message, value, 'prompt', function (result) {
                if (callback) callback(result);
            });
        },

        // Private methods

        _show: function (title, msg, value, type, callback) {

            $.alerts._hide();
            $.alerts._overlay('show');

            $("BODY").append(
                    '<div id="popup_main">' +
                    '<div id="popup_container" style="width: 80%;z-index: 1041;position:absolute;top:50%;left:10%;z-index: 1041;border-radius: 5px;border: 1px solid #dfdfdf;box-shadow: 1px 3px 5px rgba(35, 24, 21, 0.75);background: #fff; max-height: 5.02rem;">' +

                    '<div id="popup_content" style="">' +
                    '<div id="popup_message" style="color:#403F3F;padding:0.44rem 0.2rem;margin: 0 auto;font-size: 16px;text-align:center;max-height: 4.3rem;box-sizing:border-box;line-height: 0.5rem;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div>' +
                    '</div></div>' +
                    '<div style="background-color: #393e47;width: 100%;height: 100%;opacity: 0.6;filter: alpha(opacity=60);position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 1040;"></div>' +
                    '</div>');

            if ($.alerts.dialogClass) $("#popup_container").addClass($.alerts.dialogClass);

            // IE6 Fix
            //var pos = ($.browser.msie && parseInt($.browser.version) <= 6 ) ? 'absolute' : 'fixed';
            var pos = ('undefined' == typeof (document.body.style.maxHeight)) ? 'absolute' : 'fixed';

            $("#popup_container").css({
                position: pos,
                zIndex: 99999,
                padding: 0,
                margin: 0
            });

            $("#popup_title").text(title);
            $("#popup_content").addClass(type);
            $("#popup_message").text(msg);
            $("#popup_message").html($("#popup_message").text().replace(/\n/g, '<br />'));

            $("#popup_container").css({
                minWidth: $("#popup_container").outerWidth(),
                maxWidth: $("#popup_container").outerWidth()
            });

            $.alerts._reposition();
            $.alerts._maintainPosition(true);

            switch (type) {
                case 'alert':
                    $.alerts.okButton = "&nbsp;确定&nbsp;";
                    $("#popup_message").after('<div style="border-top: 1px solid #dfdfdf;height: 0.72rem;line-height: 0.72rem;text-align: center;font-size: 18px;color: #0062d2;" id="popup_ok" ><span style="color:#ff6427">' + $.alerts.okButton + '</span></div>');
                    $("#popup_ok").click(function () {
                        $.alerts._hide();
                        callback(true);
                    });
                    $("#popup_ok").focus().keypress(function (e) {
                        if (e.keyCode == 13 || e.keyCode == 27) $("#popup_ok").trigger('click');
                    });
                    break;
                case 'confirm':
                    $("#popup_message").after('<div id="popup_panel" style="border-top: 1px solid #E4E4E4;text-align: center;font-size:16px;">' +
                        '<input style="font-size: 18px;color:#949DA5;background:#ffffff;border: none;border-right: 1px solid #E4E4E4;width: 50%;height:0.54rem;" type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" readonly />' +
                        '<input style="padding: 0.2rem 0;font-size: 18px;color: #ff6427;background:#ffffff;border: none;width: 50%;" type="button" value="' + $.alerts.okButton + '" id="popup_ok"  readonly /></div>');
                    $("#popup_ok").click(function () {
                        $.alerts._hide();
                        if (callback) callback(true);
                    });
                    $("#popup_cancel").click(function () {
                        $.alerts._hide();
                        if (callback) callback(false);
                    });
                    $("#popup_ok").focus();
                    $("#popup_ok, #popup_cancel").keypress(function (e) {
                        if (e.keyCode == 13) $("#popup_ok").trigger('click');
                        if (e.keyCode == 27) $("#popup_cancel").trigger('click');
                    });
                    break;
                case 'prompt':
                    $("#popup_message").append('<br /><input type="text" size="30" id="popup_prompt" style="margin: 0.3rem 0em;" />').after('<div id="popup_panel" style="text-align: center;margin-top:0.2rem;"><input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" /></div>');
                    $("#popup_prompt").width($("#popup_message").width());
                    $("#popup_ok").click(function () {
                        var val = $("#popup_prompt").val();
                        $.alerts._hide();
                        if (callback) callback(val);
                    });
                    $("#popup_cancel").click(function () {
                        $.alerts._hide();
                        if (callback) callback(null);
                    });
                    $("#popup_prompt, #popup_ok, #popup_cancel").keypress(function (e) {
                        if (e.keyCode == 13) $("#popup_ok").trigger('click');
                        if (e.keyCode == 27) $("#popup_cancel").trigger('click');
                    });
                    if (value) $("#popup_prompt").val(value);
                    $("#popup_prompt").focus().select();
                    break;
            }


            // Make draggable
            if ($.alerts.draggable) {
                try {
                    $("#popup_container").draggable({ handle: $("#popup_title") });
                    $("#popup_title").css({ cursor: 'move' });
                } catch (e) { /* requires jQuery UI draggables */
                }
            }
        },

        _hide: function () {
            $("#popup_main").remove();
            $.alerts._overlay('hide');
            $.alerts._maintainPosition(false);
        },


        _overlay: function (status) {
            switch (status) {
                case 'show':
                    $.alerts._overlay('hide');
                    if (kdAppSet.getPhoneNumber > 0) {
                        $("BODY").append('<img id="popup_overlay"  style="position: absolute;width: 100%;height: 100%;left: 0;top:0;z-index: 99998" src="img/kdpx.gif" />');
                    } else {
                        $("BODY").append('<div id="popup_overlay"></div>');
                        $("#popup_overlay").css({
                            position: 'absolute',
                            zIndex: 99998,
                            top: '0px',
                            left: '0px',
                            width: '100%',
                            height: $(document).height(),
                            background: '#000000',
                            opacity: 0.5
                        });
                    }
                    break;
                case 'hide':
                    $("#popup_overlay").remove();
                    break;
            }
        },

        _reposition: function () {
            var top = (($(window).height() / 2) - ($("#popup_container").outerHeight() / 2)) + $.alerts.verticalOffset;
            var left = (($(window).width() / 2) - ($("#popup_container").outerWidth() / 2)) + $.alerts.horizontalOffset;
            if (top < 0) top = 0;
            if (left < 0) left = 0;

            // IE6 fix
            if ('undefined' == typeof (document.body.style.maxHeight)) top = top + $(window).scrollTop();

            $("#popup_container").css({
                top: top + 'px',
                left: left + 'px'
            });
            $("#popup_overlay").height($(document).height());
        },

        _maintainPosition: function (status) {
            if ($.alerts.repositionOnResize) {
                switch (status) {
                    case true:
                        $(window).bind('resize', function () {
                            $.alerts._reposition();
                        });
                        break;
                    case false:
                        $(window).unbind('resize');
                        break;
                }
            }
        }

    }

    // Shortuct functions
    jAlert = function (message, title, callback) {
        try {

            if (message.length > 200) {
                message = message.substr(0, 200);
            }

            if (showOkAlert) {
                showOkAlert(message, callback);
            }
            else {
                $.alerts.alert(message, title, callback);
            }
        }
        catch (e) {
            $.alerts.alert(message, title, callback);
        }
    }

    jConfirm = function (message, title, callback, btnobj) {
        $.alerts.confirm(message, title, callback, btnobj);
    };

    jPrompt = function (message, value, title, callback) {
        $.alerts.prompt(message, value, title, callback);
    };

    JHide = function(){
        $.alerts._hide();
    }

})(jQuery);
