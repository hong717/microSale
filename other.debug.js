
(function ($) {

    function Scroller(elem, settings) {
        var m,
            hi,
            v,
            dw,
            ww, // Window width
            wh, // Window height
            rwh,
            mw, // Modal width
            mh, // Modal height
            anim,
            debounce,
            that = this,
            ms = $.mobiscroll,
            e = elem,
            elm = $(e),
            theme,
            lang,
            s = extend({}, defaults),
            pres = {},
            warr = [],
            iv = {},
            pixels = {},
            input = elm.is('input'),
            visible = false;

        // Private functions

        function isReadOnly(wh) {
            if ($.isArray(s.readonly)) {
                var i = $('.dwwl', dw).index(wh);
                return s.readonly[i];
            }
            return s.readonly;
        }

        function generateWheelItems(i) {
            var html = '<div class="dw-bf">',
                l = 1,
                j;

            for (j in warr[i]) {
                if (l % 20 == 0) {
                    html += '</div><div class="dw-bf">';
                }
                html += '<div class="dw-li dw-v" data-val="' + j + '" style="height:' + hi + 'px;line-height:' + hi + 'px;"><div class="dw-i">' + warr[i][j] + '</div></div>';
                l++;
            }
            html += '</div>';
            return html;
        }

        function setGlobals(t) {
            min = $('.dw-li', t).index($('.dw-v', t).eq(0));
            max = $('.dw-li', t).index($('.dw-v', t).eq(-1));
            index = $('.dw-ul', dw).index(t);
            h = hi;
            inst = that;
        }

        function formatHeader(v) {
            var t = s.headerText;
            return t ? (typeof (t) == 'function' ? t.call(e, v) : t.replace(/\{value\}/i, v)) : '';
        }

        function read() {
            that.temp = ((input && that.val !== null && that.val != elm.val()) || that.values === null) ? s.parseValue(elm.val() || '', that) : that.values.slice(0);
            that.setValue(true);
        }

        function scrollToPos(time, index, manual, dir, orig) {
            
            // Call validation event
            if (event('validate', [dw, index, time]) !== false) {

                // Set scrollers to position
                $('.dw-ul', dw).each(function (i) {
                    var t = $(this),
                        cell = $('.dw-li[data-val="' + that.temp[i] + '"]', t),
                        cells = $('.dw-li', t),
                        v = cells.index(cell),
                        l = cells.length,
                        sc = i == index || index === undefined;
                    
                    // Scroll to a valid cell
                    if (!cell.hasClass('dw-v')) {
                        var cell1 = cell,
                            cell2 = cell,
                            dist1 = 0,
                            dist2 = 0;
                        
                        while (v - dist1 >= 0 && !cell1.hasClass('dw-v')) {
                            dist1++;
                            cell1 = cells.eq(v - dist1);
                        }

                        while (v + dist2 < l && !cell2.hasClass('dw-v')) {
                            dist2++;
                            cell2 = cells.eq(v + dist2);
                        }
                        
                        // If we have direction (+/- or mouse wheel), the distance does not count
                        if (((dist2 < dist1 && dist2 && dir !== 2) || !dist1 || (v - dist1 < 0) || dir == 1) && cell2.hasClass('dw-v')) {
                            cell = cell2;
                            v = v + dist2;
                        } else {
                            cell = cell1;
                            v = v - dist1;
                        }
                    }
                    
                    if (!(cell.hasClass('dw-sel')) || sc) {
                        // Set valid value
                        that.temp[i] = cell.attr('data-val');

                        // Add selected class to cell
                        $('.dw-sel', t).removeClass('dw-sel');
                        cell.addClass('dw-sel');

                        // Scroll to position
                        //that.scroll(t, i, v, time);
                        that.scroll(t, i, v, sc ? time : 0.1, sc ? orig : undefined);
                    }
                });
                
                // Reformat value if validation changed something
                that.change(manual);
            }
        
        }

        function position(check) {

            if (s.display == 'inline' || (ww === $(window).width() && rwh === $(window).height() && check)) {
                return;
            }
            
            var w,
                l,
                t,
                aw, // anchor width
                ah, // anchor height
                ap, // anchor position
                at, // anchor top
                al, // anchor left
                arr, // arrow
                arrw, // arrow width
                arrl, // arrow left
                scroll,
                totalw = 0,
                minw = 0,
                st = $(window).scrollTop(),
                wr = $('.dwwr', dw),
                d = $('.dw', dw),
                css = {},
                anchor = s.anchor === undefined ? elm : s.anchor;
            
            ww = $(window).width();
            rwh = $(window).height();
            wh = window.innerHeight; // on iOS we need innerHeight
            wh = wh || rwh;
            
            if (/modal|bubble/.test(s.display)) {
                $('.dwc', dw).each(function () {
                    w = $(this).outerWidth(true);
                    totalw += w;
                    minw = (w > minw) ? w : minw;
                });
                w = totalw > ww ? minw : totalw;
                wr.width(w);
            }
            
            mw = d.outerWidth();
            mh = d.outerHeight(true);
            
            if (s.display == 'modal') {
                l = (ww - mw) / 2;
                t = st + (wh - mh) / 2;
            } else if (s.display == 'bubble') {
                scroll = true;
                arr = $('.dw-arrw-i', dw);
                ap = anchor.offset();
                at = ap.top;
                al = ap.left;

                // horizontal positioning
                aw = anchor.outerWidth();
                ah = anchor.outerHeight();
                l = al - (d.outerWidth(true) - aw) / 2;
                l = l > (ww - mw) ? (ww - (mw + 20)) : l;
                l = l >= 0 ? l : 20;
                
                // vertical positioning
                t = at - mh; //(mh + 3); // above the input
                if ((t < st) || (at > st + wh)) { // if doesn't fit above or the input is out of the screen
                    d.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');
                    t = at + ah;// + 3; // below the input
                } else {
                    d.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');
                }

                //t = t >= st ? t : st;
                
                // Calculate Arrow position
                arrw = arr.outerWidth();
                arrl = al + aw / 2 - (l + (mw - arrw) / 2);

                // Limit Arrow position to [0, pocw.width] intervall
                $('.dw-arr', dw).css({ left: arrl > arrw ? arrw : arrl });
            } else {
                css.width = '100%';
                if (s.display == 'top') {
                    t = st;
                } else if (s.display == 'bottom') {
                    t = st + wh - mh;
                }
            }
            
            css.top = t < 0 ? 0 : t;
            css.left = l;
            d.css(css);
            
            // If top + modal height > doc height, increase doc height
            $('.dw-persp', dw).height(0).height(t + mh > $(document).height() ? t + mh : $(document).height());
            
            // Scroll needed
            if (scroll && ((t + mh > st + wh) || (at > st + wh))) {
                $(window).scrollTop(t + mh - wh);
            }
        }
        
        function testTouch(e) {
            if (e.type === 'touchstart') {
                touch = true;
                setTimeout(function () {
                    touch = false; // Reset if mouse event was not fired
                }, 500);
            } else if (touch) {
                touch = false;
                return false;
            }
            return true;
        }

        function event(name, args) {
            var ret;
            args.push(that);
            $.each([pres, settings], function (i, v) {
                if (v[name]) { // Call preset event
                    ret = v[name].apply(e, args);
                }
            });
            return ret;
        }

        function plus(t) {
            var p = +t.data('pos'),
                val = p + 1;
            calc(t, val > max ? min : val, 1, true);
        }

        function minus(t) {
            var p = +t.data('pos'),
                val = p - 1;
            calc(t, val < min ? max : val, 2, true);
        }

        // Public functions

        /**
        * Enables the scroller and the associated input.
        */
        that.enable = function () {
            s.disabled = false;
            if (input) {
                elm.prop('disabled', false);
            }
        };

        /**
        * Disables the scroller and the associated input.
        */
        that.disable = function () {
            s.disabled = true;
            if (input) {
                elm.prop('disabled', true);
            }
        };

        /**
        * Scrolls target to the specified position
        * @param {Object} t - Target wheel jQuery object.
        * @param {Number} index - Index of the changed wheel.
        * @param {Number} val - Value.
        * @param {Number} time - Duration of the animation, optional.
        * @param {Number} orig - Original value.
        */
        that.scroll = function (t, index, val, time, orig) {
            
            function getVal(t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            }

            function ready() {
                clearInterval(iv[index]);
                delete iv[index];
                t.data('pos', val).closest('.dwwl').removeClass('dwa');
            }
            
            var px = (m - val) * hi,
                i;
            
            if (px == pixels[index] && iv[index]) {
                return;
            }
            
            pixels[index] = px;
            
            t.attr('style', (prefix + '-transition:all ' + (time ? time.toFixed(3) : 0) + 's ease-out;') + (has3d ? (prefix + '-transform:translate3d(0,' + px + 'px,0);') : ('top:' + px + 'px;')));
            
            if (iv[index]) {
                ready();
            }
            
            if (time && orig !== undefined) {
                i = 0;
                t.closest('.dwwl').addClass('dwa');
                iv[index] = setInterval(function () {
                    i += 0.1;
                    t.data('pos', Math.round(getVal(i, orig, val - orig, time)));
                    if (i >= time) {
                        ready();
                    }
                }, 100);
                // Trigger animation start event
                //event('onAnimStart', [index, time]);
            } else {
                t.data('pos', val);
            }
        };
        
        /**
        * Gets the selected wheel values, formats it, and set the value of the scroller instance.
        * If input parameter is true, populates the associated input element.
        * @param {Boolean} sc - Scroll the wheel in position.
        * @param {Boolean} fill - Also set the value of the associated input element. Default is true.
        * @param {Number} time - Animation time
        * @param {Boolean} temp - If true, then only set the temporary value.(only scroll there but not set the value)
        */
        that.setValue = function (sc, fill, time, temp) {
            if (!$.isArray(that.temp)) {
                that.temp = s.parseValue(that.temp + '', that);
            }
            
            if (visible && sc) {
                scrollToPos(time);
            }
            
            v = s.formatResult(that.temp);
            
            if (!temp) {
                that.values = that.temp.slice(0);
                that.val = v;
            }

            if (fill) {
                if (input) {
                    elm.val(v).trigger('change');
                }
            }
        };
        
        that.getValues = function () {
            var ret = [],
                i;
            
            for (i in that._selectedValues) {
                ret.push(that._selectedValues[i]);
            }
            return ret;
        };

        /**
        * Checks if the current selected values are valid together.
        * In case of date presets it checks the number of days in a month.
        * @param {Number} time - Animation time
        * @param {Number} orig - Original value
        * @param {Number} i - Currently changed wheel index, -1 if initial validation.
        * @param {Number} dir - Scroll direction
        */
        that.validate = function (i, dir, time, orig) {
            scrollToPos(time, i, true, dir, orig);
        };

        /**
        *
        */
        that.change = function (manual) {
            v = s.formatResult(that.temp);
            if (s.display == 'inline') {
                that.setValue(false, manual);
            } else {
                $('.dwv', dw).html(formatHeader(v));
            }

            if (manual) {
                event('onChange', [v]);
            }
        };

        /**
        * Changes the values of a wheel, and scrolls to the correct position
        */
        that.changeWheel = function (idx, time) {
            if (dw) {
                var i = 0,
                    j,
                    k,
                    nr = idx.length;

                for (j in s.wheels) {
                    for (k in s.wheels[j]) {
                        if ($.inArray(i, idx) > -1) {
                            warr[i] = s.wheels[j][k];
                            $('.dw-ul', dw).eq(i).html(generateWheelItems(i));
                            nr--;
                            if (!nr) {
                                position();
                                scrollToPos(time, undefined, true);
                                return;
                            }
                        }
                        i++;
                    }
                }
            }
        };
        
        /**
        * Return true if the scroller is currently visible.
        */
        that.isVisible = function () {
            return visible;
        };
        
        /**
        *
        */
        that.tap = function (el, handler) {
            var startX,
                startY;
            
            if (s.tap) {
                el.bind('touchstart', function (e) {
                    e.preventDefault();
                    startX = getCoord(e, 'X');
                    startY = getCoord(e, 'Y');
                }).bind('touchend', function (e) {
                    // If movement is less than 20px, fire the click event handler
                    if (Math.abs(getCoord(e, 'X') - startX) < 20 && Math.abs(getCoord(e, 'Y') - startY) < 20) {
                        handler.call(this, e);
                    }
                    tap = true;
                    setTimeout(function () {
                        tap = false;
                    }, 300);
                });
            }
            
            el.bind('click', function (e) {
                if (!tap) {
                    // If handler was not called on touchend, call it on click;
                    handler.call(this, e);
                }
            });
            
        };
        
        /**
        * Shows the scroller instance.
        * @param {Boolean} prevAnim - Prevent animation if true
        */
        that.show = function (prevAnim) {
            if (s.disabled || visible) {
                return false;
            }

            if (s.display == 'top') {
                anim = 'slidedown';
            }

            if (s.display == 'bottom') {
                anim = 'slideup';
            }

            // Parse value from input
            read();

            event('onBeforeShow', [dw]);

            // Create wheels
            var l = 0,
                i,
                label,
                mAnim = '';

            if (anim && !prevAnim) {
                mAnim = 'dw-' + anim + ' dw-in';
            }
            // Create wheels containers
            var html = '<div class="dw-trans ' + s.theme + ' dw-' + s.display + '">' + (s.display == 'inline' ? '<div class="dw dwbg dwi"><div class="dwwr">' : '<div class="dw-persp">' + '<div class="dwo"></div><div class="dw dwbg ' + mAnim + '"><div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div><div class="dwwr">' + (s.headerText ? '<div class="dwv"></div>' : ''));
            
            for (i = 0; i < s.wheels.length; i++) {
                html += '<div class="dwc' + (s.mode != 'scroller' ? ' dwpm' : ' dwsc') + (s.showLabel ? '' : ' dwhl') + '"><div class="dwwc dwrc"><table cellpadding="0" cellspacing="0"><tr>';
                // Create wheels
                for (label in s.wheels[i]) {
                    warr[l] = s.wheels[i][label];
                    html += '<td><div class="dwwl dwrc dwwl' + l + '">' + (s.mode != 'scroller' ? '<div class="dwwb dwwbp" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>+</span></div><div class="dwwb dwwbm" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>&ndash;</span></div>' : '') + '<div class="dwl">' + label + '</div><div class="dww" style="height:' + (s.rows * hi) + 'px;min-width:' + s.width + 'px;"><div class="dw-ul">';
                    // Create wheel values
                    html += generateWheelItems(l);
                    html += '</div><div class="dwwo"></div></div><div class="dwwol"></div></div></td>';
                    l++;
                }
                html += '</tr></table></div></div>';
            }
            html += (s.display != 'inline' ? '<div class="dwbc' + (s.button3 ? ' dwbc-p' : '') + '"><span class="dwbw dwb-s"><span class="dwb">' + s.setText + '</span></span>' + (s.button3 ? '<span class="dwbw dwb-n"><span class="dwb">' + s.button3Text + '</span></span>' : '') + '<span class="dwbw dwb-c"><span class="dwb">' + s.cancelText + '</span></span></div></div>' : '<div class="dwcc"></div>') + '</div></div></div>';
            dw = $(html);

            scrollToPos();
            
            event('onMarkupReady', [dw]);

            // Show
            if (s.display != 'inline') {
                dw.appendTo('body');
                // Remove animation class
                setTimeout(function () {
                    dw.removeClass('dw-trans').find('.dw').removeClass(mAnim);
                }, 350);
            } else if (elm.is('div')) {
                elm.html(dw);
            } else {
                dw.insertAfter(elm);
            }
            
            visible = true;
            
            // Theme init
            theme.init(dw, that);
            
            if (s.display != 'inline') {
                // Init buttons
                that.tap($('.dwb-s span', dw), function () {
                    if (that.hide(false, 'set') !== false) {
                        //add by qinghua
                        var split_fix= '-';
                        var format_date = [that.val][0].split(' ')[0].replace(/年|月|日/g,split_fix);
                        that.val = format_date;
                        that.settings.dateFormat='yy-mm-dd';
                        that.setValue(false, true);
                        event('onSelect', [that.val]);
                    }
                });

                that.tap($('.dwb-c span', dw), function () {
                    that.cancel();
                });

                if (s.button3) {
                    that.tap($('.dwb-n span', dw), s.button3);
                }

                // prevent scrolling if not specified otherwise
                if (s.scrollLock) {
                    dw.bind('touchmove', function (e) {
                        if (mh <= wh && mw <= ww) {
                            e.preventDefault();
                        }
                    });
                }

                // Disable inputs to prevent bleed through (Android bug)
                $('input,select,button').each(function () {
                    if (!$(this).prop('disabled')) {
                        $(this).addClass('dwtd').prop('disabled', true);
                    }
                });
                
                // Set position
                position();
                $(window).bind('resize.dw', function () {
                    // Sometimes scrollTop is not correctly set, so we wait a little
                    clearTimeout(debounce);
                    debounce = setTimeout(function () {
                        position(true);
                    }, 100);
                });
            }

            // Events
            dw.delegate('.dwwl', 'DOMMouseScroll mousewheel', function (e) {
                if (!isReadOnly(this)) {
                    e.preventDefault();
                    e = e.originalEvent;
                    var delta = e.wheelDelta ? (e.wheelDelta / 120) : (e.detail ? (-e.detail / 3) : 0),
                        t = $('.dw-ul', this),
                        p = +t.data('pos'),
                        val = Math.round(p - delta);
                    setGlobals(t);
                    calc(t, val, delta < 0 ? 1 : 2);
                }
            }).delegate('.dwb, .dwwb', START_EVENT, function (e) {
                // Active button
                $(this).addClass('dwb-a');
            }).delegate('.dwwb', START_EVENT, function (e) {
                e.stopPropagation();
                e.preventDefault();
                var w = $(this).closest('.dwwl');
                if (testTouch(e) && !isReadOnly(w) && !w.hasClass('dwa')) {
                    click = true;
                    // + Button
                    var t = w.find('.dw-ul'),
                        func = $(this).hasClass('dwwbp') ? plus : minus;
                    
                    setGlobals(t);
                    clearInterval(timer);
                    timer = setInterval(function () { func(t); }, s.delay);
                    func(t);
                }
            }).delegate('.dwwl', START_EVENT, function (e) {
                // Prevent scroll
                e.preventDefault();
                // Scroll start
                if (testTouch(e) && !move && !isReadOnly(this) && !click) {
                    move = true;
                    $(document).bind(MOVE_EVENT, onMove);
                    target = $('.dw-ul', this);
                    scrollable = s.mode != 'clickpick',
                    pos = +target.data('pos');
                    setGlobals(target);
                    moved = iv[index] !== undefined; // Don't allow tap, if still moving
                    start = getCoord(e, 'Y');
                    startTime = new Date();
                    stop = start;
                    that.scroll(target, index, pos, 0.001);
                    if (scrollable) {
                        target.closest('.dwwl').addClass('dwa');
                    }
                }
            });

            event('onShow', [dw, v]);
        };
        
        /**
        * Hides the scroller instance.
        */
        that.hide = function (prevAnim, btn) {
            // If onClose handler returns false, prevent hide
            if (event('onClose', [v, btn]) === false) {
                return false;
            }

            // Re-enable temporary disabled fields
            $('.dwtd').prop('disabled', false).removeClass('dwtd');
            elm.blur();

            // Hide wheels and overlay
            if (dw) {
                if (s.display != 'inline' && anim && !prevAnim) {
                    dw.addClass('dw-trans').find('.dw').addClass('dw-' + anim + ' dw-out');
                    setTimeout(function () {
                        dw.remove();
                        dw = null;
                    }, 350);
                } else {
                    dw.remove();
                    dw = null;
                }
                visible = false;
                pixels = {};
                // Stop positioning on window resize
                $(window).unbind('.dw');
            }
        };

        /**
        * Cancel and hide the scroller instance.
        */
        that.cancel = function () {
            if (that.hide(false, 'cancel') !== false) {
                event('onCancel', [that.val]);
            }
        };

        /**
        * Scroller initialization.
        */
        that.init = function (ss) {
            // Get theme defaults
            theme = extend({ defaults: {}, init: empty }, ms.themes[ss.theme || s.theme]);

            // Get language defaults
            lang = ms.i18n[ss.lang || s.lang];

            extend(settings, ss); // Update original user settings
            extend(s, theme.defaults, lang, settings);

            that.settings = s;

            // Unbind all events (if re-init)
            elm.unbind('.dw');

            var preset = ms.presets[s.preset];

            if (preset) {
                pres = preset.call(e, that);
                extend(s, pres, settings); // Load preset settings
                extend(methods, pres.methods); // Extend core methods
            }

            // Set private members
            m = Math.floor(s.rows / 2);
            hi = s.height;
            anim = s.animate;

            if (elm.data('dwro') !== undefined) {
                e.readOnly = bool(elm.data('dwro'));
            }

            if (visible) {
                that.hide();
            }

            if (s.display == 'inline') {
                that.show();
            } else {
                read();
                if (input && s.showOnFocus) {
                    // Set element readonly, save original state
                    elm.data('dwro', e.readOnly);
                    e.readOnly = true;
                    // Init show datewheel
                    elm.bind('focus.dw', function () { that.show(); });
                    //hong alter
                    //elm.bind('click', function () { that.show(); });
                }
            }
        };
        
        that.trigger = function (name, params) {
            return event(name, params);
        };
        
        that.values = null;
        that.val = null;
        that.temp = null;
        that._selectedValues = {}; // [];

        that.init(settings);
    }

    function testProps(props) {
        var i;
        for (i in props) {
            if (mod[props[i]] !== undefined) {
                return true;
            }
        }
        return false;
    }

    function testPrefix() {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            p;

        for (p in prefixes) {
            if (testProps([prefixes[p] + 'Transform'])) {
                return '-' + prefixes[p].toLowerCase();
            }
        }
        return '';
    }

    function getInst(e) {
        return scrollers[e.id];
    }
    
    function getCoord(e, c) {
        var org = e.originalEvent,
            ct = e.changedTouches;
        return ct || (org && org.changedTouches) ? (org ? org.changedTouches[0]['page' + c] : ct[0]['page' + c]) : e['page' + c];

    }

    function bool(v) {
        return (v === true || v == 'true');
    }

    function constrain(val, min, max) {
        val = val > max ? max : val;
        val = val < min ? min : val;
        return val;
    }
    
    function calc(t, val, dir, anim, orig) {
        val = constrain(val, min, max);

        var cell = $('.dw-li', t).eq(val),
            o = orig === undefined ? val : orig, 
            idx = index,
            time = anim ? (val == o ? 0.1 : Math.abs((val - o) * 0.1)) : 0;

        // Set selected scroller value
        inst.temp[idx] = cell.attr('data-val');
        
        inst.scroll(t, idx, val, time, orig);
        
        setTimeout(function () {
            // Validate
            inst.validate(idx, dir, time, orig);
        }, 10);
    }

    function init(that, method, args) {
        if (methods[method]) {
            return methods[method].apply(that, Array.prototype.slice.call(args, 1));
        }
        if (typeof method === 'object') {
            return methods.init.call(that, method);
        }
        return that;
    }

    var scrollers = {},
        timer,
        empty = function () { },
        h,
        min,
        max,
        inst, // Current instance
        date = new Date(),
        uuid = date.getTime(),
        move,
        click,
        target,
        index,
        start,
        stop,
        startTime,
        pos,
        moved,
        scrollable,
        mod = document.createElement('modernizr').style,
        has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']),
        prefix = testPrefix(),
        extend = $.extend,
        tap,
        touch,
        START_EVENT = 'touchstart mousedown',
        MOVE_EVENT = 'touchmove mousemove',
        END_EVENT = 'touchend mouseup',
        onMove = function (e) {
            if (scrollable) {
                e.preventDefault();
                stop = getCoord(e, 'Y');
                inst.scroll(target, index, constrain(pos + (start - stop) / h, min - 1, max + 1));
            }
            moved = true;
        },
        defaults = {
            // Options
            width: 70,
            height: 40,
            rows: 3,
            delay: 300,
            disabled: false,
            readonly: false,
            showOnFocus: true,
            showLabel: true,
            wheels: [],
            theme: '',
            headerText: '{value}',
            display: 'modal',
            mode: 'scroller',
            preset: '',
            lang: 'en-US',
            setText: 'Set',
            cancelText: 'Cancel',
            scrollLock: true,
            tap: true,
            formatResult: function (d) {
                return d.join(' ');
            },
            parseValue: function (value, inst) {
                var w = inst.settings.wheels,
                    val = value.split(' '),
                    ret = [],
                    j = 0,
                    i,
                    l,
                    v;

                for (i = 0; i < w.length; i++) {
                    for (l in w[i]) {
                        if (w[i][l][val[j]] !== undefined) {
                            ret.push(val[j]);
                        } else {
                            for (v in w[i][l]) { // Select first value from wheel
                                ret.push(v);
                                break;
                            }
                        }
                        j++;
                    }
                }
                return ret;
            }
        },

        methods = {
            init: function (options) {
                if (options === undefined) {
                    options = {};
                }

                return this.each(function () {
                    if (!this.id) {
                        uuid += 1;
                        this.id = 'scoller' + uuid;
                    }
                    scrollers[this.id] = new Scroller(this, options);
                });
            },
            enable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.enable();
                    }
                });
            },
            disable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.disable();
                    }
                });
            },
            isDisabled: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.settings.disabled;
                }
            },
            isVisible: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.isVisible();
                }
            },
            option: function (option, value) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        var obj = {};
                        if (typeof option === 'object') {
                            obj = option;
                        } else {
                            obj[option] = value;
                        }
                        inst.init(obj);
                    }
                });
            },
            setValue: function (d, fill, time, temp) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.temp = d;
                        inst.setValue(true, fill, time, temp);
                    }
                });
            },
            getInst: function () {
                return getInst(this[0]);
            },
            getValue: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.values;
                }
            },
            getValues: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.getValues();
                }
            },
            show: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.show();
                }
            },
            hide: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                    }
                });
            },
            destroy: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                        $(this).unbind('.dw');
                        delete scrollers[this.id];
                        if ($(this).is('input')) {
                            this.readOnly = bool($(this).data('dwro'));
                        }
                    }
                });
            }
        };

    $(document).bind(END_EVENT, function (e) {
        if (move) {
            var time = new Date() - startTime,
                val = constrain(pos + (start - stop) / h, min - 1, max + 1),
                speed,
                dist,
                tindex,
                ttop = target.offset().top;
        
            if (time < 300) {
                speed = (stop - start) / time;
                dist = (speed * speed) / (2 * 0.0006);
                if (stop - start < 0) {
                    dist = -dist;
                }
            } else {
                dist = stop - start;
            }
            
            tindex = Math.round(pos - dist / h);
            
            if (!dist && !moved) { // this is a "tap"
                var idx = Math.floor((stop - ttop) / h),
                    li = $('.dw-li', target).eq(idx),
                    hl = scrollable;
                
                if (inst.trigger('onValueTap', [li]) !== false) {
                    tindex = idx;
                }
                else {
                    hl = true;
                }
                
                if (hl) {
                    li.addClass('dw-hl'); // Highlight
                    setTimeout(function () {
                        li.removeClass('dw-hl');
                    }, 200);
                }
            }
            
            if (scrollable) {
                calc(target, tindex, 0, true, Math.round(val));
            }
            
            move = false;
            target = null;
        
            $(document).unbind(MOVE_EVENT, onMove);
        }

        if (click) {
            clearInterval(timer);
            click = false;
        }
    
        $('.dwb-a').removeClass('dwb-a');
                
    }).bind('mouseover mouseup mousedown click', function (e) { // Prevent standard behaviour on body click
        if (tap) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });

    $.fn.mobiscroll = function (method) {
        extend(this, $.mobiscroll.shorts);
        return init(this, method, arguments);
    };

    $.mobiscroll = $.mobiscroll || {
        /**
        * Set settings for all instances.
        * @param {Object} o - New default settings.
        */
        setDefaults: function (o) {
            extend(defaults, o);
        },
        presetShort: function (name) {
            this.shorts[name] = function (method) {
                return init(this, extend(method, { preset: name }), arguments);
            };
        },
        shorts: {},
        presets: {},
        themes: {},
        i18n: {}
    };

    $.scroller = $.scroller || $.mobiscroll;
    $.fn.scroller = $.fn.scroller || $.fn.mobiscroll;

})(jQuery);


(function ($) {

    var ms = $.mobiscroll,
        date = new Date(),
        defaults = {
            dateFormat: 'mm/dd/yy',
            dateOrder: 'mmddy',
            timeWheels: 'hhiiA',
            timeFormat: 'hh:ii A',
            startYear: date.getFullYear() - 100,
            endYear: date.getFullYear() + 1,
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
            //dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            shortYearCutoff: '+10',
            monthText: 'Month',
            dayText: 'Day',
            yearText: 'Year',
            hourText: 'Hours',
            minuteText: 'Minutes',
            secText: 'Seconds',
            ampmText: '&nbsp;',
            nowText: 'Now',
            showNow: false,
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1,
            separator: ' '
        },
        preset = function (inst) {
            var that = $(this),
                html5def = {},
                format;
            // Force format for html5 date inputs (experimental)
            if (that.is('input')) {
                switch (that.attr('type')) {
                case 'date':
                    format = 'yy-mm-dd';
                    break;
                case 'datetime':
                    format = 'yy-mm-ddTHH:ii:ssZ';
                    break;
                case 'datetime-local':
                    format = 'yy-mm-ddTHH:ii:ss';
                    break;
                case 'month':
                    format = 'yy-mm';
                    html5def.dateOrder = 'mmyy';
                    break;
                case 'time':
                    format = 'HH:ii:ss';
                    break;
                }
                // Check for min/max attributes
                var min = that.attr('min'),
                    max = that.attr('max');
                if (min) {
                    html5def.minDate = ms.parseDate(format, min);
                }
                if (max) {
                    html5def.maxDate = ms.parseDate(format, max);
                }
            }

            // Set year-month-day order
            var s = $.extend({}, defaults, html5def, inst.settings),
                offset = 0,
                wheels = [],
                ord = [],
                o = {},
                i,
                k,
                f = { y: 'getFullYear', m: 'getMonth', d: 'getDate', h: getHour, i: getMinute, s: getSecond, a: getAmPm },
                p = s.preset,
                dord = s.dateOrder,
                tord = s.timeWheels,
                regen = dord.match(/D/),
                ampm = tord.match(/a/i),
                hampm = tord.match(/h/),
                hformat = p == 'datetime' ? s.dateFormat + s.separator + s.timeFormat : p == 'time' ? s.timeFormat : s.dateFormat,
                defd = new Date(),
                stepH = s.stepHour,
                stepM = s.stepMinute,
                stepS = s.stepSecond,
                mind = s.minDate || new Date(s.startYear, 0, 1),
                maxd = s.maxDate || new Date(s.endYear, 11, 31, 23, 59, 59);
                
            inst.settings = s;

            format = format || hformat;
                
            if (p.match(/date/i)) {

                // Determine the order of year, month, day wheels
                $.each(['y', 'm', 'd'], function (j, v) {
                    i = dord.search(new RegExp(v, 'i'));
                    if (i > -1) {
                        ord.push({ o: i, v: v });
                    }
                });
                ord.sort(function (a, b) { return a.o > b.o ? 1 : -1; });
                $.each(ord, function (i, v) {
                    o[v.v] = i;
                });

                var w = {};
                for (k = 0; k < 3; k++) {
                    if (k == o.y) {
                        offset++;
                        w[s.yearText] = {};
                        var start = mind.getFullYear(),
                            end = maxd.getFullYear();
                        for (i = start; i <= end; i++) {
                            w[s.yearText][i] = dord.match(/yy/i) ? i : (i + '').substr(2, 2);
                        }
                    } else if (k == o.m) {
                        offset++;
                        w[s.monthText] = {};
                        for (i = 0; i < 12; i++) {
                            var str = dord.replace(/[dy]/gi, '').replace(/mm/, i < 9 ? '0' + (i + 1) : i + 1).replace(/m/, (i + 1));
                            w[s.monthText][i] = str.match(/MM/) ? str.replace(/MM/, '<span class="dw-mon">' + s.monthNames[i] + '</span>') : str.replace(/M/, '<span class="dw-mon">' + s.monthNamesShort[i] + '</span>');
                        }
                    } else if (k == o.d) {
                        offset++;
                        w[s.dayText] = {};
                        for (i = 1; i < 32; i++) {
                            w[s.dayText][i] = dord.match(/dd/i) && i < 10 ? '0' + i : i;
                        }
                    }
                }
                wheels.push(w);
            }

            if (p.match(/time/i)) {

                // Determine the order of hours, minutes, seconds wheels
                ord = [];
                $.each(['h', 'i', 's', 'a'], function (i, v) {
                    i = tord.search(new RegExp(v, 'i'));
                    if (i > -1) {
                        ord.push({ o: i, v: v });
                    }
                });
                ord.sort(function (a, b) {
                    return a.o > b.o ? 1 : -1;
                });
                $.each(ord, function (i, v) {
                    o[v.v] = offset + i;
                });

                w = {};
                for (k = offset; k < offset + 4; k++) {
                    if (k == o.h) {
                        offset++;
                        w[s.hourText] = {};
                        for (i = 0; i < (hampm ? 12 : 24); i += stepH) {
                            w[s.hourText][i] = hampm && i == 0 ? 12 : tord.match(/hh/i) && i < 10 ? '0' + i : i;
                        }
                    } else if (k == o.i) {
                        offset++;
                        w[s.minuteText] = {};
                        for (i = 0; i < 60; i += stepM) {
                            w[s.minuteText][i] = tord.match(/ii/) && i < 10 ? '0' + i : i;
                        }
                    } else if (k == o.s) {
                        offset++;
                        w[s.secText] = {};
                        for (i = 0; i < 60; i += stepS) {
                            w[s.secText][i] = tord.match(/ss/) && i < 10 ? '0' + i : i;
                        }
                    } else if (k == o.a) {
                        offset++;
                        var upper = tord.match(/A/);
                        w[s.ampmText] = { 0: upper ? 'AM' : 'am', 1: upper ? 'PM' : 'pm' };
                    }
                    
                }

                wheels.push(w);
            }

            function get(d, i, def) {
                if (o[i] !== undefined) {
                    return +d[o[i]];
                }
                if (def !== undefined) {
                    return def;
                }
                return defd[f[i]] ? defd[f[i]]() : f[i](defd);
            }

            function step(v, st) {
                return Math.floor(v / st) * st;
            }

            function getHour(d) {
                var hour = d.getHours();
                hour = hampm && hour >= 12 ? hour - 12 : hour;
                return step(hour, stepH);
            }

            function getMinute(d) {
                return step(d.getMinutes(), stepM);
            }

            function getSecond(d) {
                return step(d.getSeconds(), stepS);
            }

            function getAmPm(d) {
                return ampm && d.getHours() > 11 ? 1 : 0;
            }

            function getDate(d) {
                var hour = get(d, 'h', 0);
                return new Date(get(d, 'y'), get(d, 'm'), get(d, 'd', 1), get(d, 'a') ? hour + 12 : hour, get(d, 'i', 0), get(d, 's', 0));
            }

            inst.setDate = function (d, fill, time, temp) {
                var i;
                // Set wheels
                for (i in o) {
                    this.temp[o[i]] = d[f[i]] ? d[f[i]]() : f[i](d);
                }
                this.setValue(true, fill, time, temp);
            };

            inst.getDate = function (d) {
                return getDate(d);
            };

            return {
                button3Text: s.showNow ? s.nowText : undefined,
                button3: s.showNow ? function () { inst.setDate(new Date(), false, 0.3, true); } : undefined,
                wheels: wheels,
                headerText: function (v) {
                    return ms.formatDate(hformat, getDate(inst.temp), s);
                },
                /**
                * Builds a date object from the wheel selections and formats it to the given date/time format
                * @param {Array} d - An array containing the selected wheel values
                * @return {String} - The formatted date string
                */
                formatResult: function (d) {
                    return ms.formatDate(format, getDate(d), s);
                },
                /**
                * Builds a date object from the input value and returns an array to set wheel values
                * @return {Array} - An array containing the wheel values to set
                */
                parseValue: function (val) {
                    var d = new Date(),
                        i,
                        result = [];
                    try {
                        d = ms.parseDate(format, val, s);
                    } catch (e) {
                    }
                    // Set wheels
                    for (i in o) {
                        result[o[i]] = d[f[i]] ? d[f[i]]() : f[i](d);
                    }
                    return result;
                },
                /**
                * Validates the selected date to be in the minDate / maxDate range and sets unselectable values to disabled
                * @param {Object} dw - jQuery object containing the generated html
                * @param {Integer} [i] - Index of the changed wheel, not set for initial validation
                */
                validate: function (dw, i) {
                    var temp = inst.temp, //.slice(0),
                        mins = { y: mind.getFullYear(), m: 0, d: 1, h: 0, i: 0, s: 0, a: 0 },
                        maxs = { y: maxd.getFullYear(), m: 11, d: 31, h: step(hampm ? 11 : 23, stepH), i: step(59, stepM), s: step(59, stepS), a: 1 },
                        minprop = true,
                        maxprop = true;
                    $.each(['y', 'm', 'd', 'a', 'h', 'i', 's'], function (x, i) {
                        if (o[i] !== undefined) {
                            var min = mins[i],
                                max = maxs[i],
                                maxdays = 31,
                                val = get(temp, i),
                                t = $('.dw-ul', dw).eq(o[i]),
                                y,
                                m;
                            if (i == 'd') {
                                y = get(temp, 'y');
                                m = get(temp, 'm');
                                maxdays = 32 - new Date(y, m, 32).getDate();
                                max = maxdays;
                                if (regen) {
                                    $('.dw-li', t).each(function () {
                                        var that = $(this),
                                            d = that.data('val'),
                                            w = new Date(y, m, d).getDay(),
                                            str = dord.replace(/[my]/gi, '').replace(/dd/, d < 10 ? '0' + d : d).replace(/d/, d);
                                        $('.dw-i', that).html(str.match(/DD/) ? str.replace(/DD/, '<span class="dw-day">' + s.dayNames[w] + '</span>') : str.replace(/D/, '<span class="dw-day">' + s.dayNamesShort[w] + '</span>'));
                                    });
                                }
                            }
                            if (minprop && mind) {
                                min = mind[f[i]] ? mind[f[i]]() : f[i](mind);
                            }
                            if (maxprop && maxd) {
                                max = maxd[f[i]] ? maxd[f[i]]() : f[i](maxd);
                            }
                            if (i != 'y') {
                                var i1 = $('.dw-li', t).index($('.dw-li[data-val="' + min + '"]', t)),
                                    i2 = $('.dw-li', t).index($('.dw-li[data-val="' + max + '"]', t));
                                $('.dw-li', t).removeClass('dw-v').slice(i1, i2 + 1).addClass('dw-v');
                                if (i == 'd') { // Hide days not in month
                                    $('.dw-li', t).removeClass('dw-h').slice(maxdays).addClass('dw-h');
                                }
                            }
                            if (val < min) {
                                val = min;
                            }
                            if (val > max) {
                                val = max;
                            }
                            if (minprop) {
                                minprop = val == min;
                            }
                            if (maxprop) {
                                maxprop = val == max;
                            }
                            // Disable some days
                            if (s.invalid && i == 'd') {
                                var idx = [];
                                // Disable exact dates
                                if (s.invalid.dates) {
                                    $.each(s.invalid.dates, function (i, v) {
                                        if (v.getFullYear() == y && v.getMonth() == m) {
                                            idx.push(v.getDate() - 1);
                                        }
                                    });
                                }
                                // Disable days of week
                                if (s.invalid.daysOfWeek) {
                                    var first = new Date(y, m, 1).getDay(),
                                        j;
                                    $.each(s.invalid.daysOfWeek, function (i, v) {
                                        for (j = v - first; j < maxdays; j += 7) {
                                            if (j >= 0) {
                                                idx.push(j);
                                            }
                                        }
                                    });
                                }
                                // Disable days of month
                                if (s.invalid.daysOfMonth) {
                                    $.each(s.invalid.daysOfMonth, function (i, v) {
                                        v = (v + '').split('/');
                                        if (v[1]) {
                                            if (v[0] - 1 == m) {
                                                idx.push(v[1] - 1);
                                            }
                                        } else {
                                            idx.push(v[0] - 1);
                                        }
                                    });
                                }
                                $.each(idx, function (i, v) {
                                    $('.dw-li', t).eq(v).removeClass('dw-v');
                                });
                            }

                            // Set modified value
                            temp[o[i]] = val;
                        }
                    });
                },
                methods: {
                    /**
                    * Returns the currently selected date.
                    * @param {Boolean} temp - If true, return the currently shown date on the picker, otherwise the last selected one
                    * @return {Date}
                    */
                    getDate: function (temp) {
                        var inst = $(this).mobiscroll('getInst');
                        if (inst) {
                            return inst.getDate(temp ? inst.temp : inst.values);
                        }
                    },
                    /**
                    * Sets the selected date
                    * @param {Date} d - Date to select.
                    * @param {Boolean} [fill] - Also set the value of the associated input element. Default is true.
                    * @return {Object} - jQuery object to maintain chainability
                    */
                    setDate: function (d, fill, time, temp) {
                        if (fill == undefined) {
                            fill = false;
                        }
                        return this.each(function () {
                            var inst = $(this).mobiscroll('getInst');
                            if (inst) {
                                inst.setDate(d, fill, time, temp);
                            }
                        });
                    }
                }
            };
        };

    $.each(['date', 'time', 'datetime'], function (i, v) {
        ms.presets[v] = preset;
        ms.presetShort(v);
    });

    /**
    * Format a date into a string value with a specified format.
    * @param {String} format - Output format.
    * @param {Date} date - Date to format.
    * @param {Object} settings - Settings.
    * @return {String} - Returns the formatted date string.
    */
    ms.formatDate = function (format, date, settings) {
        if (!date) {
            return null;
        }
        var s = $.extend({}, defaults, settings),
            look = function (m) { // Check whether a format character is doubled
                var n = 0;
                while (i + 1 < format.length && format.charAt(i + 1) == m) {
                    n++;
                    i++;
                }
                return n;
            },
            f1 = function (m, val, len) { // Format a number, with leading zero if necessary
                var n = '' + val;
                if (look(m)) {
                    while (n.length < len) {
                        n = '0' + n;
                    }
                }
                return n;
            },
            f2 = function (m, val, s, l) { // Format a name, short or long as requested
                return (look(m) ? l[val] : s[val]);
            },
            i,
            output = '',
            literal = false;

        for (i = 0; i < format.length; i++) {
            if (literal) {
                if (format.charAt(i) == "'" && !look("'")) {
                    literal = false;
                } else {
                    output += format.charAt(i);
                }
            } else {
                switch (format.charAt(i)) {
                case 'd':
                    output += f1('d', date.getDate(), 2);
                    break;
                case 'D':
                    output += f2('D', date.getDay(), s.dayNamesShort, s.dayNames);
                    break;
                case 'o':
                    output += f1('o', (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000, 3);
                    break;
                case 'm':
                    output += f1('m', date.getMonth() + 1, 2);
                    break;
                case 'M':
                    output += f2('M', date.getMonth(), s.monthNamesShort, s.monthNames);
                    break;
                case 'y':
                    output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                    break;
                case 'h':
                    var h = date.getHours();
                    output += f1('h', (h > 12 ? (h - 12) : (h == 0 ? 12 : h)), 2);
                    break;
                case 'H':
                    output += f1('H', date.getHours(), 2);
                    break;
                case 'i':
                    output += f1('i', date.getMinutes(), 2);
                    break;
                case 's':
                    output += f1('s', date.getSeconds(), 2);
                    break;
                case 'a':
                    output += date.getHours() > 11 ? 'pm' : 'am';
                    break;
                case 'A':
                    output += date.getHours() > 11 ? 'PM' : 'AM';
                    break;
                case "'":
                    if (look("'")) {
                        output += "'";
                    } else {
                        literal = true;
                    }
                    break;
                default:
                    output += format.charAt(i);
                }
            }
        }
        return output;
    };

    /**
    * Extract a date from a string value with a specified format.
    * @param {String} format - Input format.
    * @param {String} value - String to parse.
    * @param {Object} settings - Settings.
    * @return {Date} - Returns the extracted date.
    */
    ms.parseDate = function (format, value, settings) {
        var def = new Date();

        if (!format || !value) {
            return def;
        }

        value = (typeof value == 'object' ? value.toString() : value + '');

        var s = $.extend({}, defaults, settings),
            shortYearCutoff = s.shortYearCutoff,
            year = def.getFullYear(),
            month = def.getMonth() + 1,
            day = def.getDate(),
            doy = -1,
            hours = def.getHours(),
            minutes = def.getMinutes(),
            seconds = 0, //def.getSeconds(),
            ampm = -1,
            literal = false, // Check whether a format character is doubled
            lookAhead = function (match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches) {
                    iFormat++;
                }
                return matches;
            },
            getNumber = function (match) { // Extract a number from the string value
                lookAhead(match);
                var size = (match == '@' ? 14 : (match == '!' ? 20 : (match == 'y' ? 4 : (match == 'o' ? 3 : 2)))),
                    digits = new RegExp('^\\d{1,' + size + '}'),
                    num = value.substr(iValue).match(digits);

                if (!num) {
                    return 0;
                }
                //throw 'Missing number at position ' + iValue;
                iValue += num[0].length;
                return parseInt(num[0], 10);
            },
            getName = function (match, s, l) { // Extract a name from the string value and convert to an index
                var names = (lookAhead(match) ? l : s),
                    i;

                for (i = 0; i < names.length; i++) {
                    if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
                        iValue += names[i].length;
                        return i + 1;
                    }
                }
                return 0;
                //throw 'Unknown name at position ' + iValue;
            },
            checkLiteral = function () {
                //if (value.charAt(iValue) != format.charAt(iFormat))
                //throw 'Unexpected literal at position ' + iValue;
                iValue++;
            },
            iValue = 0,
            iFormat;

        for (iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                switch (format.charAt(iFormat)) {
                case 'd':
                    day = getNumber('d');
                    break;
                case 'D':
                    getName('D', s.dayNamesShort, s.dayNames);
                    break;
                case 'o':
                    doy = getNumber('o');
                    break;
                case 'm':
                    month = getNumber('m');
                    break;
                case 'M':
                    month = getName('M', s.monthNamesShort, s.monthNames);
                    break;
                case 'y':
                    year = getNumber('y');
                    break;
                case 'H':
                    hours = getNumber('H');
                    break;
                case 'h':
                    hours = getNumber('h');
                    break;
                case 'i':
                    minutes = getNumber('i');
                    break;
                case 's':
                    seconds = getNumber('s');
                    break;
                case 'a':
                    ampm = getName('a', ['am', 'pm'], ['am', 'pm']) - 1;
                    break;
                case 'A':
                    ampm = getName('A', ['am', 'pm'], ['am', 'pm']) - 1;
                    break;
                case "'":
                    if (lookAhead("'")) {
                        checkLiteral();
                    } else {
                        literal = true;
                    }
                    break;
                default:
                    checkLiteral();
                }
            }
        }
        if (year < 100) {
            year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10)) ? 0 : -100);
        }
        if (doy > -1) {
            month = 1;
            day = doy;
            do {
                var dim = 32 - new Date(year, month - 1, 32).getDate();
                if (day <= dim) {
                    break;
                }
                month++;
                day -= dim;
            } while (true);
        }
        hours = (ampm == -1) ? hours : ((ampm && hours < 12) ? (hours + 12) : (!ampm && hours == 12 ? 0 : hours));
        var date = new Date(year, month - 1, day, hours, minutes, seconds);
        if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
            throw 'Invalid date';
        }
        return date;
    };

})(jQuery);

!function(a,b){"function"==typeof define&&(define.amd||define.cmd)?define(function(){return b(a)}):b(a,!0)}(this,function(a,b){function c(b,c,d){a.WeixinJSBridge?WeixinJSBridge.invoke(b,e(c),function(a){g(b,a,d)}):j(b,d)}function d(b,c,d){a.WeixinJSBridge?WeixinJSBridge.on(b,function(a){d&&d.trigger&&d.trigger(a),g(b,a,c)}):d?j(b,d):j(b,c)}function e(a){return a=a||{},a.appId=C.appId,a.verifyAppId=C.appId,a.verifySignType="sha1",a.verifyTimestamp=C.timestamp+"",a.verifyNonceStr=C.nonceStr,a.verifySignature=C.signature,a}function f(a){return{timeStamp:a.timestamp+"",nonceStr:a.nonceStr,"package":a.package,paySign:a.paySign,signType:a.signType||"SHA1"}}function g(a,b,c){var d,e,f;switch("openEnterpriseChat"==a&&(b.errCode=b.err_code),delete b.err_code,delete b.err_desc,delete b.err_detail,d=b.errMsg,d||(d=b.err_msg,delete b.err_msg,d=h(a,d),b.errMsg=d),c=c||{},c._complete&&(c._complete(b),delete c._complete),d=b.errMsg||"",C.debug&&!c.isInnerInvoke,e=d.indexOf(":"),f=d.substring(e+1)){case"ok":c.success&&c.success(b);break;case"cancel":c.cancel&&c.cancel(b);break;default:c.fail&&c.fail(b)}c.complete&&c.complete(b)}function h(a,b){var e,f,c=a,d=p[c];return d&&(c=d),e="ok",b&&(f=b.indexOf(":"),e=b.substring(f+1),"confirm"==e&&(e="ok"),"failed"==e&&(e="fail"),-1!=e.indexOf("failed_")&&(e=e.substring(7)),-1!=e.indexOf("fail_")&&(e=e.substring(5)),e=e.replace(/_/g," "),e=e.toLowerCase(),("access denied"==e||"no permission to execute"==e)&&(e="permission denied"),"config"==c&&"function not exist"==e&&(e="ok"),""==e&&(e="fail")),b=c+":"+e}function i(a){var b,c,d,e;if(a){for(b=0,c=a.length;c>b;++b)d=a[b],e=o[d],e&&(a[b]=e);return a}}function j(a,b){if(!(!C.debug||b&&b.isInnerInvoke)){var c=p[a];c&&(a=c),b&&b._complete&&delete b._complete,console.log('"'+a+'",',b||"")}}function k(){if(!(u||v||C.debug||"6.0.2">z||B.systemType<0)){var b=new Image;B.appId=C.appId,B.initTime=A.initEndTime-A.initStartTime,B.preVerifyTime=A.preVerifyEndTime-A.preVerifyStartTime,F.getNetworkType({isInnerInvoke:!0,success:function(a){B.networkType=a.networkType;var c="https://open.weixin.qq.com/sdk/report?v="+B.version+"&o="+B.isPreVerifyOk+"&s="+B.systemType+"&c="+B.clientVersion+"&a="+B.appId+"&n="+B.networkType+"&i="+B.initTime+"&p="+B.preVerifyTime+"&u="+B.url;b.src=c}})}}function l(){return(new Date).getTime()}function m(b){w&&(a.WeixinJSBridge?b():q.addEventListener&&q.addEventListener("WeixinJSBridgeReady",b,!1))}function n(){F.invoke||(F.invoke=function(b,c,d){a.WeixinJSBridge&&WeixinJSBridge.invoke(b,e(c),d)},F.on=function(b,c){a.WeixinJSBridge&&WeixinJSBridge.on(b,c)})}var o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F;if(!a.jWeixin)return o={config:"preVerifyJSAPI",onMenuShareTimeline:"menu:share:timeline",onMenuShareAppMessage:"menu:share:appmessage",onMenuShareQQ:"menu:share:qq",onMenuShareWeibo:"menu:share:weiboApp",onMenuShareQZone:"menu:share:QZone",previewImage:"imagePreview",getLocation:"geoLocation",openProductSpecificView:"openProductViewWithPid",addCard:"batchAddCard",openCard:"batchViewCard",chooseWXPay:"getBrandWCPayRequest",startSearchBeacons:"startMonitoringBeacons",stopSearchBeacons:"stopMonitoringBeacons",onSearchBeacons:"onBeaconsInRange",consumeAndShareCard:"consumedShareCard"},p=function(){var b,a={};for(b in o)a[o[b]]=b;return a}(),q=a.document,r=q.title,s=navigator.userAgent.toLowerCase(),t=navigator.platform.toLowerCase(),u=!(!t.match("mac")&&!t.match("win")),v=-1!=s.indexOf("wxdebugger"),w=-1!=s.indexOf("micromessenger"),x=-1!=s.indexOf("android"),y=-1!=s.indexOf("iphone")||-1!=s.indexOf("ipad"),z=function(){var a=s.match(/micromessenger\/(\d+\.\d+\.\d+)/)||s.match(/micromessenger\/(\d+\.\d+)/);return a?a[1]:""}(),A={initStartTime:l(),initEndTime:0,preVerifyStartTime:0,preVerifyEndTime:0},B={version:1,appId:"",initTime:0,preVerifyTime:0,networkType:"",isPreVerifyOk:1,systemType:y?1:x?2:-1,clientVersion:z,url:encodeURIComponent(location.href)},C={},D={_completes:[]},E={state:0,data:{}},m(function(){A.initEndTime=l()}),F={config:function(a){C=a,j("config",a);var b=C.check===!1?!1:!0;m(function(){var a,d,e;if(b)c(o.config,{verifyJsApiList:i(C.jsApiList)},function(){D._complete=function(a){A.preVerifyEndTime=l(),E.state=1,E.data=a},D.success=function(){B.isPreVerifyOk=0},D.fail=function(a){D._fail?D._fail(a):E.state=-1};var a=D._completes;return a.push(function(){k()}),D.complete=function(){for(var c=0,d=a.length;d>c;++c)a[c]();D._completes=[]},D}()),A.preVerifyStartTime=l();else{for(E.state=1,a=D._completes,d=0,e=a.length;e>d;++d)a[d]();D._completes=[]}}),C.beta&&n()},ready:function(a){0!=E.state?a():(D._completes.push(a),!w&&C.debug&&a())},error:function(a){"6.0.2">z||(-1==E.state?a(E.data):D._fail=a)},checkJsApi:function(a){var b=function(a){var c,d,b=a.checkResult;for(c in b)d=p[c],d&&(b[d]=b[c],delete b[c]);return a};c("checkJsApi",{jsApiList:i(a.jsApiList)},function(){return a._complete=function(a){if(x){var c=a.checkResult;c&&(a.checkResult=JSON.parse(c))}a=b(a)},a}())},onMenuShareTimeline:function(a){d(o.onMenuShareTimeline,{complete:function(){c("shareTimeline",{title:a.title||r,desc:a.title||r,img_url:a.imgUrl||"",link:a.link||location.href,type:a.type||"link",data_url:a.dataUrl||""},a)}},a)},onMenuShareAppMessage:function(a){d(o.onMenuShareAppMessage,{complete:function(){c("sendAppMessage",{title:a.title||r,desc:a.desc||"",link:a.link||location.href,img_url:a.imgUrl||"",type:a.type||"link",data_url:a.dataUrl||""},a)}},a)},onMenuShareQQ:function(a){d(o.onMenuShareQQ,{complete:function(){c("shareQQ",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareWeibo:function(a){d(o.onMenuShareWeibo,{complete:function(){c("shareWeiboApp",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareQZone:function(a){d(o.onMenuShareQZone,{complete:function(){c("shareQZone",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},startRecord:function(a){c("startRecord",{},a)},stopRecord:function(a){c("stopRecord",{},a)},onVoiceRecordEnd:function(a){d("onVoiceRecordEnd",a)},playVoice:function(a){c("playVoice",{localId:a.localId},a)},pauseVoice:function(a){c("pauseVoice",{localId:a.localId},a)},stopVoice:function(a){c("stopVoice",{localId:a.localId},a)},onVoicePlayEnd:function(a){d("onVoicePlayEnd",a)},uploadVoice:function(a){c("uploadVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadVoice:function(a){c("downloadVoice",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},translateVoice:function(a){c("translateVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},chooseImage:function(a){c("chooseImage",{scene:"1|2",count:a.count||9,sizeType:a.sizeType||["original","compressed"],sourceType:a.sourceType||["album","camera"]},function(){return a._complete=function(a){if(x){var b=a.localIds;b&&(a.localIds=JSON.parse(b))}},a}())},previewImage:function(a){c(o.previewImage,{current:a.current,urls:a.urls},a)},uploadImage:function(a){c("uploadImage",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadImage:function(a){c("downloadImage",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},getNetworkType:function(a){var b=function(a){var c,d,e,b=a.errMsg;if(a.errMsg="getNetworkType:ok",c=a.subtype,delete a.subtype,c)a.networkType=c;else switch(d=b.indexOf(":"),e=b.substring(d+1)){case"wifi":case"edge":case"wwan":a.networkType=e;break;default:a.errMsg="getNetworkType:fail"}return a};c("getNetworkType",{},function(){return a._complete=function(a){a=b(a)},a}())},openLocation:function(a){c("openLocation",{latitude:a.latitude,longitude:a.longitude,name:a.name||"",address:a.address||"",scale:a.scale||28,infoUrl:a.infoUrl||""},a)},getLocation:function(a){a=a||{},c(o.getLocation,{type:a.type||"wgs84"},function(){return a._complete=function(a){delete a.type},a}())},hideOptionMenu:function(a){c("hideOptionMenu",{},a)},showOptionMenu:function(a){c("showOptionMenu",{},a)},closeWindow:function(a){a=a||{},c("closeWindow",{},a)},hideMenuItems:function(a){c("hideMenuItems",{menuList:a.menuList},a)},showMenuItems:function(a){c("showMenuItems",{menuList:a.menuList},a)},hideAllNonBaseMenuItem:function(a){c("hideAllNonBaseMenuItem",{},a)},showAllNonBaseMenuItem:function(a){c("showAllNonBaseMenuItem",{},a)},scanQRCode:function(a){a=a||{},c("scanQRCode",{needResult:a.needResult||0,scanType:a.scanType||["qrCode","barCode"]},function(){return a._complete=function(a){var b,c;y&&(b=a.resultStr,b&&(c=JSON.parse(b),a.resultStr=c&&c.scan_code&&c.scan_code.scan_result))},a}())},openProductSpecificView:function(a){c(o.openProductSpecificView,{pid:a.productId,view_type:a.viewType||0,ext_info:a.extInfo},a)},addCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,card_ext:g.cardExt},d.push(h);c(o.addCard,{card_list:d},function(){return a._complete=function(a){var c,d,e,b=a.card_list;if(b){for(b=JSON.parse(b),c=0,d=b.length;d>c;++c)e=b[c],e.cardId=e.card_id,e.cardExt=e.card_ext,e.isSuccess=e.is_succ?!0:!1,delete e.card_id,delete e.card_ext,delete e.is_succ;a.cardList=b,delete a.card_list}},a}())},chooseCard:function(a){c("chooseCard",{app_id:C.appId,location_id:a.shopId||"",sign_type:a.signType||"SHA1",card_id:a.cardId||"",card_type:a.cardType||"",card_sign:a.cardSign,time_stamp:a.timestamp+"",nonce_str:a.nonceStr},function(){return a._complete=function(a){a.cardList=a.choose_card_info,delete a.choose_card_info},a}())},openCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,code:g.code},d.push(h);c(o.openCard,{card_list:d},a)},consumeAndShareCard:function(a){c(o.consumeAndShareCard,{consumedCardId:a.cardId,consumedCode:a.code},a)},chooseWXPay:function(a){c(o.chooseWXPay,f(a),a)},startSearchBeacons:function(a){c(o.startSearchBeacons,{ticket:a.ticket},a)},stopSearchBeacons:function(a){c(o.stopSearchBeacons,{},a)},onSearchBeacons:function(a){d(o.onSearchBeacons,a)},openEnterpriseChat:function(a){c("openEnterpriseChat",{useridlist:a.userIds,chatname:a.groupName},a)}},b&&(a.wx=a.jWeixin=F),F});
/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2013
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
 */
(function (T) {
    function z(a, c, b) {
        var g = 0, f = [0], h = "", l = null, h = b || "UTF8";
        if ("UTF8" !== h && "UTF16" !== h)throw"encoding must be UTF8 or UTF16";
        if ("HEX" === c) {
            if (0 !== a.length % 2)throw"srcString of HEX type must be in byte increments";
            l = B(a);
            g = l.binLen;
            f = l.value
        } else if ("ASCII" === c || "TEXT" === c)l = J(a, h), g = l.binLen, f = l.value; else if ("B64" === c)l = K(a), g = l.binLen, f = l.value; else throw"inputFormat must be HEX, TEXT, ASCII, or B64";
        this.getHash = function (a, c, b, h) {
            var l = null, d = f.slice(), n = g, p;
            3 === arguments.length ? "number" !== typeof b && (h = b, b = 1) : 2 === arguments.length && (b = 1);
            if (b !== parseInt(b, 10) || 1 > b)throw"numRounds must a integer >= 1";
            switch (c) {
                case "HEX":
                    l = L;
                    break;
                case "B64":
                    l = M;
                    break;
                default:
                    throw"format must be HEX or B64";
            }
            if ("SHA-1" === a)for (p = 0; p < b; p++)d = y(d, n), n = 160; else if ("SHA-224" === a)for (p = 0; p < b; p++)d = v(d, n, a), n = 224; else if ("SHA-256" === a)for (p = 0; p < b; p++)d = v(d, n, a), n = 256; else if ("SHA-384" === a)for (p = 0; p < b; p++)d = v(d, n, a), n = 384; else if ("SHA-512" === a)for (p = 0; p < b; p++)d = v(d, n, a), n = 512; else throw"Chosen SHA variant is not supported";
            return l(d, N(h))
        };
        this.getHMAC = function (a, b, c, l, s) {
            var d, n, p, m, w = [], x = [];
            d = null;
            switch (l) {
                case "HEX":
                    l = L;
                    break;
                case "B64":
                    l = M;
                    break;
                default:
                    throw"outputFormat must be HEX or B64";
            }
            if ("SHA-1" === c)n = 64, m = 160; else if ("SHA-224" === c)n = 64, m = 224; else if ("SHA-256" === c)n = 64, m = 256; else if ("SHA-384" === c)n = 128, m = 384; else if ("SHA-512" === c)n = 128, m = 512; else throw"Chosen SHA variant is not supported";
            if ("HEX" === b)d = B(a), p = d.binLen, d = d.value; else if ("ASCII" === b || "TEXT" === b)d = J(a, h), p = d.binLen, d = d.value; else if ("B64" ===
                b)d = K(a), p = d.binLen, d = d.value; else throw"inputFormat must be HEX, TEXT, ASCII, or B64";
            a = 8 * n;
            b = n / 4 - 1;
            n < p / 8 ? (d = "SHA-1" === c ? y(d, p) : v(d, p, c), d[b] &= 4294967040) : n > p / 8 && (d[b] &= 4294967040);
            for (n = 0; n <= b; n += 1)w[n] = d[n] ^ 909522486, x[n] = d[n] ^ 1549556828;
            c = "SHA-1" === c ? y(x.concat(y(w.concat(f), a + g)), a + m) : v(x.concat(v(w.concat(f), a + g, c)), a + m, c);
            return l(c, N(s))
        }
    }

    function s(a, c) {
        this.a = a;
        this.b = c
    }

    function J(a, c) {
        var b = [], g, f = [], h = 0, l;
        if ("UTF8" === c)for (l = 0; l < a.length; l += 1)for (g = a.charCodeAt(l), f = [], 2048 < g ? (f[0] = 224 |
            (g & 61440) >>> 12, f[1] = 128 | (g & 4032) >>> 6, f[2] = 128 | g & 63) : 128 < g ? (f[0] = 192 | (g & 1984) >>> 6, f[1] = 128 | g & 63) : f[0] = g, g = 0; g < f.length; g += 1)b[h >>> 2] |= f[g] << 24 - h % 4 * 8, h += 1; else if ("UTF16" === c)for (l = 0; l < a.length; l += 1)b[h >>> 2] |= a.charCodeAt(l) << 16 - h % 4 * 8, h += 2;
        return{value: b, binLen: 8 * h}
    }

    function B(a) {
        var c = [], b = a.length, g, f;
        if (0 !== b % 2)throw"String of HEX type must be in byte increments";
        for (g = 0; g < b; g += 2) {
            f = parseInt(a.substr(g, 2), 16);
            if (isNaN(f))throw"String of HEX type contains invalid characters";
            c[g >>> 3] |= f << 24 - g % 8 * 4
        }
        return{value: c,
            binLen: 4 * b}
    }

    function K(a) {
        var c = [], b = 0, g, f, h, l, r;
        if (-1 === a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";
        g = a.indexOf("=");
        a = a.replace(/\=/g, "");
        if (-1 !== g && g < a.length)throw"Invalid '=' found in base-64 string";
        for (f = 0; f < a.length; f += 4) {
            r = a.substr(f, 4);
            for (h = l = 0; h < r.length; h += 1)g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(r[h]), l |= g << 18 - 6 * h;
            for (h = 0; h < r.length - 1; h += 1)c[b >> 2] |= (l >>> 16 - 8 * h & 255) << 24 - b % 4 * 8, b += 1
        }
        return{value: c, binLen: 8 * b}
    }

    function L(a, c) {
        var b = "", g = 4 * a.length, f, h;
        for (f = 0; f < g; f += 1)h = a[f >>> 2] >>> 8 * (3 - f % 4), b += "0123456789abcdef".charAt(h >>> 4 & 15) + "0123456789abcdef".charAt(h & 15);
        return c.outputUpper ? b.toUpperCase() : b
    }

    function M(a, c) {
        var b = "", g = 4 * a.length, f, h, l;
        for (f = 0; f < g; f += 3)for (l = (a[f >>> 2] >>> 8 * (3 - f % 4) & 255) << 16 | (a[f + 1 >>> 2] >>> 8 * (3 - (f + 1) % 4) & 255) << 8 | a[f + 2 >>> 2] >>> 8 * (3 - (f + 2) % 4) & 255, h = 0; 4 > h; h += 1)b = 8 * f + 6 * h <= 32 * a.length ? b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(l >>> 6 * (3 - h) & 63) : b + c.b64Pad;
        return b
    }

    function N(a) {
        var c =
        {outputUpper: !1, b64Pad: "="};
        try {
            a.hasOwnProperty("outputUpper") && (c.outputUpper = a.outputUpper), a.hasOwnProperty("b64Pad") && (c.b64Pad = a.b64Pad)
        } catch (b) {
        }
        if ("boolean" !== typeof c.outputUpper)throw"Invalid outputUpper formatting option";
        if ("string" !== typeof c.b64Pad)throw"Invalid b64Pad formatting option";
        return c
    }

    function U(a, c) {
        return a << c | a >>> 32 - c
    }

    function u(a, c) {
        return a >>> c | a << 32 - c
    }

    function t(a, c) {
        var b = null, b = new s(a.a, a.b);
        return b = 32 >= c ? new s(b.a >>> c | b.b << 32 - c & 4294967295, b.b >>> c | b.a << 32 - c & 4294967295) :
            new s(b.b >>> c - 32 | b.a << 64 - c & 4294967295, b.a >>> c - 32 | b.b << 64 - c & 4294967295)
    }

    function O(a, c) {
        var b = null;
        return b = 32 >= c ? new s(a.a >>> c, a.b >>> c | a.a << 32 - c & 4294967295) : new s(0, a.a >>> c - 32)
    }

    function V(a, c, b) {
        return a ^ c ^ b
    }

    function P(a, c, b) {
        return a & c ^ ~a & b
    }

    function W(a, c, b) {
        return new s(a.a & c.a ^ ~a.a & b.a, a.b & c.b ^ ~a.b & b.b)
    }

    function Q(a, c, b) {
        return a & c ^ a & b ^ c & b
    }

    function X(a, c, b) {
        return new s(a.a & c.a ^ a.a & b.a ^ c.a & b.a, a.b & c.b ^ a.b & b.b ^ c.b & b.b)
    }

    function Y(a) {
        return u(a, 2) ^ u(a, 13) ^ u(a, 22)
    }

    function Z(a) {
        var c = t(a, 28), b = t(a,
            34);
        a = t(a, 39);
        return new s(c.a ^ b.a ^ a.a, c.b ^ b.b ^ a.b)
    }

    function $(a) {
        return u(a, 6) ^ u(a, 11) ^ u(a, 25)
    }

    function aa(a) {
        var c = t(a, 14), b = t(a, 18);
        a = t(a, 41);
        return new s(c.a ^ b.a ^ a.a, c.b ^ b.b ^ a.b)
    }

    function ba(a) {
        return u(a, 7) ^ u(a, 18) ^ a >>> 3
    }

    function ca(a) {
        var c = t(a, 1), b = t(a, 8);
        a = O(a, 7);
        return new s(c.a ^ b.a ^ a.a, c.b ^ b.b ^ a.b)
    }

    function da(a) {
        return u(a, 17) ^ u(a, 19) ^ a >>> 10
    }

    function ea(a) {
        var c = t(a, 19), b = t(a, 61);
        a = O(a, 6);
        return new s(c.a ^ b.a ^ a.a, c.b ^ b.b ^ a.b)
    }

    function R(a, c) {
        var b = (a & 65535) + (c & 65535);
        return((a >>> 16) + (c >>>
            16) + (b >>> 16) & 65535) << 16 | b & 65535
    }

    function fa(a, c, b, g) {
        var f = (a & 65535) + (c & 65535) + (b & 65535) + (g & 65535);
        return((a >>> 16) + (c >>> 16) + (b >>> 16) + (g >>> 16) + (f >>> 16) & 65535) << 16 | f & 65535
    }

    function S(a, c, b, g, f) {
        var h = (a & 65535) + (c & 65535) + (b & 65535) + (g & 65535) + (f & 65535);
        return((a >>> 16) + (c >>> 16) + (b >>> 16) + (g >>> 16) + (f >>> 16) + (h >>> 16) & 65535) << 16 | h & 65535
    }

    function ga(a, c) {
        var b, g, f;
        b = (a.b & 65535) + (c.b & 65535);
        g = (a.b >>> 16) + (c.b >>> 16) + (b >>> 16);
        f = (g & 65535) << 16 | b & 65535;
        b = (a.a & 65535) + (c.a & 65535) + (g >>> 16);
        g = (a.a >>> 16) + (c.a >>> 16) + (b >>>
            16);
        return new s((g & 65535) << 16 | b & 65535, f)
    }

    function ha(a, c, b, g) {
        var f, h, l;
        f = (a.b & 65535) + (c.b & 65535) + (b.b & 65535) + (g.b & 65535);
        h = (a.b >>> 16) + (c.b >>> 16) + (b.b >>> 16) + (g.b >>> 16) + (f >>> 16);
        l = (h & 65535) << 16 | f & 65535;
        f = (a.a & 65535) + (c.a & 65535) + (b.a & 65535) + (g.a & 65535) + (h >>> 16);
        h = (a.a >>> 16) + (c.a >>> 16) + (b.a >>> 16) + (g.a >>> 16) + (f >>> 16);
        return new s((h & 65535) << 16 | f & 65535, l)
    }

    function ia(a, c, b, g, f) {
        var h, l, r;
        h = (a.b & 65535) + (c.b & 65535) + (b.b & 65535) + (g.b & 65535) + (f.b & 65535);
        l = (a.b >>> 16) + (c.b >>> 16) + (b.b >>> 16) + (g.b >>> 16) + (f.b >>>
            16) + (h >>> 16);
        r = (l & 65535) << 16 | h & 65535;
        h = (a.a & 65535) + (c.a & 65535) + (b.a & 65535) + (g.a & 65535) + (f.a & 65535) + (l >>> 16);
        l = (a.a >>> 16) + (c.a >>> 16) + (b.a >>> 16) + (g.a >>> 16) + (f.a >>> 16) + (h >>> 16);
        return new s((l & 65535) << 16 | h & 65535, r)
    }

    function y(a, c) {
        var b = [], g, f, h, l, r, s, u = P, t = V, v = Q, d = U, n = R, p, m, w = S, x, q = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
        a[c >>> 5] |= 128 << 24 - c % 32;
        a[(c + 65 >>> 9 << 4) + 15] = c;
        x = a.length;
        for (p = 0; p < x; p += 16) {
            g = q[0];
            f = q[1];
            h = q[2];
            l = q[3];
            r = q[4];
            for (m = 0; 80 > m; m += 1)b[m] = 16 > m ? a[m + p] : d(b[m - 3] ^ b[m - 8] ^ b[m -
                14] ^ b[m - 16], 1), s = 20 > m ? w(d(g, 5), u(f, h, l), r, 1518500249, b[m]) : 40 > m ? w(d(g, 5), t(f, h, l), r, 1859775393, b[m]) : 60 > m ? w(d(g, 5), v(f, h, l), r, 2400959708, b[m]) : w(d(g, 5), t(f, h, l), r, 3395469782, b[m]), r = l, l = h, h = d(f, 30), f = g, g = s;
            q[0] = n(g, q[0]);
            q[1] = n(f, q[1]);
            q[2] = n(h, q[2]);
            q[3] = n(l, q[3]);
            q[4] = n(r, q[4])
        }
        return q
    }

    function v(a, c, b) {
        var g, f, h, l, r, t, u, v, z, d, n, p, m, w, x, q, y, C, D, E, F, G, H, I, e, A = [], B, k = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
            1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452,
            2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
        d = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428];
        f = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
        if ("SHA-224" === b || "SHA-256" === b)n = 64, g = (c + 65 >>> 9 << 4) + 15, w = 16, x = 1, e = Number, q = R, y = fa, C = S, D = ba, E = da, F = Y, G = $, I = Q, H = P, d = "SHA-224" === b ? d : f; else if ("SHA-384" === b || "SHA-512" === b)n = 80, g = (c + 128 >>> 10 << 5) + 31, w = 32, x = 2, e = s, q = ga, y = ha, C = ia, D = ca, E = ea, F = Z, G = aa, I = X, H = W, k = [new e(k[0],
            3609767458), new e(k[1], 602891725), new e(k[2], 3964484399), new e(k[3], 2173295548), new e(k[4], 4081628472), new e(k[5], 3053834265), new e(k[6], 2937671579), new e(k[7], 3664609560), new e(k[8], 2734883394), new e(k[9], 1164996542), new e(k[10], 1323610764), new e(k[11], 3590304994), new e(k[12], 4068182383), new e(k[13], 991336113), new e(k[14], 633803317), new e(k[15], 3479774868), new e(k[16], 2666613458), new e(k[17], 944711139), new e(k[18], 2341262773), new e(k[19], 2007800933), new e(k[20], 1495990901), new e(k[21], 1856431235),
            new e(k[22], 3175218132), new e(k[23], 2198950837), new e(k[24], 3999719339), new e(k[25], 766784016), new e(k[26], 2566594879), new e(k[27], 3203337956), new e(k[28], 1034457026), new e(k[29], 2466948901), new e(k[30], 3758326383), new e(k[31], 168717936), new e(k[32], 1188179964), new e(k[33], 1546045734), new e(k[34], 1522805485), new e(k[35], 2643833823), new e(k[36], 2343527390), new e(k[37], 1014477480), new e(k[38], 1206759142), new e(k[39], 344077627), new e(k[40], 1290863460), new e(k[41], 3158454273), new e(k[42], 3505952657),
            new e(k[43], 106217008), new e(k[44], 3606008344), new e(k[45], 1432725776), new e(k[46], 1467031594), new e(k[47], 851169720), new e(k[48], 3100823752), new e(k[49], 1363258195), new e(k[50], 3750685593), new e(k[51], 3785050280), new e(k[52], 3318307427), new e(k[53], 3812723403), new e(k[54], 2003034995), new e(k[55], 3602036899), new e(k[56], 1575990012), new e(k[57], 1125592928), new e(k[58], 2716904306), new e(k[59], 442776044), new e(k[60], 593698344), new e(k[61], 3733110249), new e(k[62], 2999351573), new e(k[63], 3815920427), new e(3391569614,
                3928383900), new e(3515267271, 566280711), new e(3940187606, 3454069534), new e(4118630271, 4000239992), new e(116418474, 1914138554), new e(174292421, 2731055270), new e(289380356, 3203993006), new e(460393269, 320620315), new e(685471733, 587496836), new e(852142971, 1086792851), new e(1017036298, 365543100), new e(1126000580, 2618297676), new e(1288033470, 3409855158), new e(1501505948, 4234509866), new e(1607167915, 987167468), new e(1816402316, 1246189591)], d = "SHA-384" === b ? [new e(3418070365, d[0]), new e(1654270250, d[1]), new e(2438529370,
            d[2]), new e(355462360, d[3]), new e(1731405415, d[4]), new e(41048885895, d[5]), new e(3675008525, d[6]), new e(1203062813, d[7])] : [new e(f[0], 4089235720), new e(f[1], 2227873595), new e(f[2], 4271175723), new e(f[3], 1595750129), new e(f[4], 2917565137), new e(f[5], 725511199), new e(f[6], 4215389547), new e(f[7], 327033209)]; else throw"Unexpected error in SHA-2 implementation";
        a[c >>> 5] |= 128 << 24 - c % 32;
        a[g] = c;
        B = a.length;
        for (p = 0; p < B; p += w) {
            c = d[0];
            g = d[1];
            f = d[2];
            h = d[3];
            l = d[4];
            r = d[5];
            t = d[6];
            u = d[7];
            for (m = 0; m < n; m += 1)A[m] = 16 > m ?
                new e(a[m * x + p], a[m * x + p + 1]) : y(E(A[m - 2]), A[m - 7], D(A[m - 15]), A[m - 16]), v = C(u, G(l), H(l, r, t), k[m], A[m]), z = q(F(c), I(c, g, f)), u = t, t = r, r = l, l = q(h, v), h = f, f = g, g = c, c = q(v, z);
            d[0] = q(c, d[0]);
            d[1] = q(g, d[1]);
            d[2] = q(f, d[2]);
            d[3] = q(h, d[3]);
            d[4] = q(l, d[4]);
            d[5] = q(r, d[5]);
            d[6] = q(t, d[6]);
            d[7] = q(u, d[7])
        }
        if ("SHA-224" === b)a = [d[0], d[1], d[2], d[3], d[4], d[5], d[6]]; else if ("SHA-256" === b)a = d; else if ("SHA-384" === b)a = [d[0].a, d[0].b, d[1].a, d[1].b, d[2].a, d[2].b, d[3].a, d[3].b, d[4].a, d[4].b, d[5].a, d[5].b]; else if ("SHA-512" === b)a = [d[0].a,
            d[0].b, d[1].a, d[1].b, d[2].a, d[2].b, d[3].a, d[3].b, d[4].a, d[4].b, d[5].a, d[5].b, d[6].a, d[6].b, d[7].a, d[7].b]; else throw"Unexpected error in SHA-2 implementation";
        return a
    }

    "function" === typeof define && typeof define.amd ? define(function () {
        return z
    }) : "undefined" !== typeof exports ? "undefined" !== typeof module && module.exports ? module.exports = exports = z : exports = z : T.jsSHA = z
})(this);

/**
 * Created by clover_wu on 2015-01-12.
 *
 * alter by hong on 2015-03-03
 *
 */
var wx_init_kdnum=0;
var wx_init_para={};

//当通过了签名后回回调此方法
wx.ready(function () {
    //设置默认分享页面
    kdAppSet.wxShareInfo({});
});

//访问出错的回调
wx.error(function (res) {
    //签名过期时需要重新签名
    if (res.code == 42001) {
        wxSign.wx_init(wx_init_para);
    }
});


var wxSign = (function () {

    function createNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }

    function createTimestamp() {
        return parseInt(new Date().getTime() / 1000) + '';
    }


    function raw(args) {
        var keys = Object.keys(args);
        keys = keys.sort();
        var newArgs = {};
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        var string = '';
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    }

    function sign(cfg, fnOk) {
        $.ajax({
            type: "get",
            dataType: "JSONP",
            url: "http://mob.cmcloud.cn/servercloud/weixin/Jsapi_Ticket?eid="+cfg.eid,//api_Ticket
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).done(function (data) {
            if (data.code == 200) {
                var url = window.location.href.split('#')[0] || {};
                var signRet = {
                    "jsapi_ticket":decodeURI(data.data) || '',
                    "nonceStr": cfg.nonceStr,
                    "timestamp": cfg.timestamp,
                    "url": url
                };
                var string = raw(signRet);
                var shaObj = new jsSHA(string, 'TEXT');
                var signature = shaObj.getHash('SHA-1', 'HEX');
                fnOk & fnOk(signature);
                signCard(cfg);
            } else {
                //alert("微信认证失败:" + data.msg);
                if(wx_init_kdnum<3){
                    wx_init_kdnum=wx_init_kdnum+1;
                    wx_init(wx_init_para);
                }
            }
        }).fail(function (a) {
           //alert("微信认证失败");
            if(wx_init_kdnum<3){
                wx_init_kdnum=wx_init_kdnum+1;
                wx_init(wx_init_para);
            }
        })

    }
  function signCard(cfg) {
        $.ajax({
            type: "get",
            dataType: "JSONP",
            url: "http://mob.cmcloud.cn/servercloud/weixin/api_Ticket?eid="+cfg.eid,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).done(function (data) {
            if (data.code == 200) {

                var jsapi_ticket=decodeURI(data.data) || '';
                var nonceStr= createNonceStr();
                var timestamp= createTimestamp();
                var app_id= wx_init_para.appid;
                /*app_id、location_id、timestamp、nonce_str、card_id、card_type*/
                var card_id='';
                var location_id='';
                //var card_type='DISCOUNT';
                var alist=[];
                alist.push(jsapi_ticket);
                alist.push(nonceStr);
                alist.push(timestamp);
                alist.push(app_id);
                //alist.push(card_type);
       /*         alist.push(card_id);
                alist.push(location_id);*/
                alist.sort();
                var string = alist.join("");
                var shaObj = new jsSHA(string, 'TEXT');
                var signature = shaObj.getHash('SHA-1', 'HEX');

                kdCardPay={
                    timestamp: timestamp,
                    nonceStr: nonceStr,
                    signature: signature
                };
/*                alert(alist.join(",")+"||"+signature);
                console.log(JSON.stringify(alist));*/
            };
        });

    }

    function wx_init(para) {
        if(para){
            wx_init_para =para;
        }
        para=para || {};
        var config = {
            appid: para.appid,
            eid:para.eid,
            timestamp: createTimestamp(),
            nonceStr: createNonceStr()
        };
        sign(config, function (data) {
            wx.config({
                debug: false,
                appId: config.appid,
                timestamp: config.timestamp,
                nonceStr: config.nonceStr,
                signature: data,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'hideMenuItems',
                    'chooseImage',
                    'uploadImage',
                    'chooseWXPay',
                    'getNetworkType',
                    'scanQRCode',
                    'onMenuShareQQ',
                    'chooseCard',
                    'openCard'
                ]
            });
        });
    }

    return {
        wx_init: wx_init
    }

})();





/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.7
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
	'use strict';
	var oldOnClick, self = this;


	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	if (!layer || !layer.nodeType) {
		throw new TypeError('Layer must be a document node');
	}

	/** @type function() */
	this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

	/** @type function() */
	this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

	/** @type function() */
	this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

	/** @type function() */
	this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

	/** @type function() */
	this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Set up event handlers as required
	if (this.deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((this.deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
	case 'select':
		return true;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	if (this.deviceIsIOS && targetElement.setSelectionRange) {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (this.deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!this.deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	// If the touch has moved, cancel the click tracking
	if (this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		this.cancelNextClick = true;
		return true;
	}

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (this.deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset);
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (this.deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!this.deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (this.deviceIsIOS && !this.deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (this.deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	if ((/Chrome\/[0-9]+/).test(navigator.userAgent)) {

		// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
		if (FastClick.prototype.deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && metaViewport.content.indexOf('user-scalable=no') !== -1) {
				return true;
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
	'use strict';
	return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}

/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution
  
  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, width;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  options.continuous = options.continuous ? options.continuous : true;

  function setup() {

    // cache slides
    slides = element.children;

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    // determine width of each slide
    width = container.getBoundingClientRect().width || container.offsetWidth;

    element.style.width = (slides.length * width) + 'px';

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];

      slide.style.width = width + 'px';
      slide.setAttribute('data-index', pos);

      if (browser.transitions) {
        slide.style.left = (pos * -width) + 'px';
        move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
      }

    }

    if (!browser.transitions) element.style.left = (index * -width) + 'px';

    container.style.visibility = 'visible';

  }

  function prev() {

    if (index) slide(index-1);
    else if (options.continuous) slide(slides.length-1);

  }

  function next() {

    if (index < slides.length - 1) slide(index+1);
    else if (options.continuous) slide(0);

  }

  function slide(to, slideSpeed) {

    // do nothing if already on requested slide
    if (index == to) return;
    
    if (browser.transitions) {

      var diff = Math.abs(index-to) - 1;
      var direction = Math.abs(index-to) / (index-to); // 1:right -1:left

      while (diff--) move((to > index ? to : index) - diff - 1, width * direction, 0);

      move(index, width * direction, slideSpeed || speed);
      move(to, 0, slideSpeed || speed);

    } else {

      animate(index * -width, to * -width, slideSpeed || speed);

    }

    index = to;

    offloadFn(options.callback && options.callback(index, slides[index]));

  }

  function move(index, dist, speed) {

    translate(index, dist, speed);
    slidePos[index] = dist;

  }

  function translate(index, dist, speed) {

    var slide = slides[index];
    var style = slide && slide.style;

    if (!style) return;

    style.webkitTransitionDuration = 
    style.MozTransitionDuration = 
    style.msTransitionDuration = 
    style.OTransitionDuration = 
    style.transitionDuration = speed + 'ms';

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform = 
    style.MozTransform = 
    style.OTransform = 'translateX(' + dist + 'px)';

  }

  function animate(from, to, speed) {

    // if not an animation, just reposition
    if (!speed) {
      
      element.style.left = to + 'px';
      return;

    }
    
    var start = +new Date;
    
    var timer = setInterval(function() {

      var timeElap = +new Date - start;
      
      if (timeElap > speed) {

        element.style.left = to + 'px';

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        clearInterval(timer);
        return;

      }

      element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

    }, 4);

  }

  // setup auto slideshow
  var delay = options.auto || 0;
  var interval;

  function begin() {

    interval = setTimeout(next, delay);

  }

  function stop() {

    delay = 0;
    clearTimeout(interval);

  }

  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;
  var allowVerticalY=5;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case 'touchstart': this.start(event); break;
        case 'touchmove': this.move(event); break;
        case 'touchend': offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup.call()); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {

      var touches = event.touches[0];

      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };
      
      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false);
      element.addEventListener('touchend', this, false);

    },
    move: function(event) {

      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

      if (options.disableScroll) event.preventDefault();

      var touches = event.touches[0];

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling 
        event.preventDefault();

        // stop slideshow
        stop();

        // increase resistance if first or last slide
        delta.x = 
          delta.x / 
            ( (!index && delta.x > 0               // if first slide and sliding left
              || index == slides.length - 1        // or if last slide and sliding right
              && delta.x < 0                       // and if sliding at all
            ) ?                      
            ( Math.abs(delta.x) / width + 1 )      // determine resistance level
            : 1 );                                 // no resistance if false
        
        // translate 1:1
          if(options.allowVerticalMove || Math.abs(delta.y)<=allowVerticalY){
            translate(index-1, delta.x + slidePos[index-1], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(index+1, delta.x + slidePos[index+1], 0);
          }
      }

    },
    end: function(event) {

      // measure duration
      var duration = +new Date - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide = 
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds = 
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0
      
      // determine direction of swipe (true:right, false:left)
      var direction = delta.x < 0;

      // if not scrolling vertically
      if (!isScrolling) {

              if (isValidSlide && !isPastBounds) {

                  if (direction) {

                      move(index - 1, -width, 0);
                      move(index, slidePos[index] - width, speed);
                      move(index + 1, slidePos[index + 1] - width, speed);
                      index += 1;

                  } else {

                      move(index + 1, width, 0);
                      move(index, slidePos[index] + width, speed);
                      move(index - 1, slidePos[index - 1] + width, speed);
                      index += -1;

                  }

                  options.callback && options.callback(index, slides[index]);

              } else {

                  move(index - 1, -width, speed);
                  move(index, 0, speed);
                  move(index + 1, width, speed);

              }

      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false)
      element.removeEventListener('touchend', events, false)

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {
        
        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

      }

    }

  }

  // trigger setup
  setup();

  // start auto slideshow if applicable
  if (delay) begin();


  // add event listeners
  if (browser.addEventListener) {
    
    // set touchstart event on element    
    if (browser.touch) element.addEventListener('touchstart', events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    slide: function(to, speed) {

      slide(to, speed);

    },
    prev: function() {

      // cancel slideshow
      stop();

      prev();

    },
    next: function() {

      stop();

      next();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = 'auto';
      element.style.left = 0;

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '100%';
        slide.style.left = 0;

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    }
  }

}


if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        $(this).data('Swipe', new Swipe($(this)[0], params));
      });
    }
  })( window.jQuery || window.Zepto )
}

var kdctrl = (function () {

    var maxDate = new Date(2030, 11, 31, 23, 59, 59);//最大日期2030.12.31
    var minDate = new Date(1949, 0, 01, 00, 00, 00);//最小日期1949.1.1
    function initDate(dateCtrl) {
        //初始化日期控件
        dateCtrl.mobiscroll().date({
            theme: 'android-ics',
            lang: 'zh',
            maxDate: maxDate,
            minDate: minDate,
            display: 'bottom',
            mode: 'scroller',
            dateFormat: "yy-mm-dd",
            inputDateFormat: "yy-mm-dd",
            showLabel: false,
            dateOrder: 'yymmdd',
            cancelText: "取消",
            setText: "确定",
            rows: 5
        });
    }

    //date Array(年，月)
    function initDateNoDay(dateCtrl, date) {
        //初始化日期控件，只有年月
        if (date) {
            var maxtime = new Date(date[0], 11, 31, 23, 59, 59);//12月
            var mintime = new Date(date[0], date[1]-1, 01, 00, 00, 00);//1号
        }
        else {
            var maxtime = maxDate;
            var mintime = minDate;
        }
        dateCtrl.mobiscroll().date({
            theme: 'android-ics',
            lang: 'zh',
            maxDate: maxtime,
            minDate: mintime,
            display: 'bottom',
            mode: 'scroller',
            dateFormat: "yy-mm",
            inputDateFormat: "yy-mm",
            showLabel: false,
            dateOrder: 'yymm',
            cancelText: "取消",
            setText: "确定",
            rows: 5
        });
    }

    //日期控件按下效果
    function dateClick(classCtrl) {
        $(document).delegate(classCtrl, {
            'touchstart': function () {
                $(this).css('border-color', '#FF6427');
                $(this).children().css('color', '#FF6427');
            },
            'touchend': function () {
                $(this).css('border-color', '#C2C8CD');
                $(this).children().css('color', '#343434');
            }
        });
    }

    //图片按下放大效果
    function imageClick(classCtrl) {
        $(document).delegate(classCtrl, 'click', function () {
            kdShare.Image.setBigImage($(this));
        });
    }

    //输入框提示
    function inputHint(classCtrl) {
        $(document).delegate(classCtrl, {
            'focus': function () {
                var txtHint = $(this).attr("hint");
                if ($.trim($(this).val()) == txtHint) {
                    $(this).val('');
                }
            },
            'blur': function () {
                var txtHint = $(this).attr("hint");
                if ($.trim($(this).val()) == '') {
                    $(this).val(txtHint);
                }
            }
        })
    }

    function initkdScroll(scroll, option) {
        option.notice = option.notice || {};
        option.notice.down = option.notice.down || $('#divPulldown');
        option.notice.up = option.notice.up || $('#divPullup');

        var wrapper = scroll.wrapper;
        if (!option.hinttop) {
            var itop = $(wrapper).css("top").replace("rem", "");
            option.hinttop = Number(itop) + 0.07;
        }

        if (!option.hintbottom) {
            var ibottom = $(wrapper).css("bottom").replace("rem", "");
            option.hintbottom = Number(ibottom) + 0.07;
        }

        if (!option.fnfresh) {
            option.hinttop = -1;
        }
        if (!option.fnmore) {
            option.hintbottom = -1;
        }
        initScroll(scroll, option);
    }

    function initScroll(scroll, option) {
        var fnfresh = option.fnfresh;
        var fnmore = option.fnmore;
        var notice = option.notice;
        var itop = option.hinttop;
        var ibottom = option.hintbottom;
        var state = 0;
        var msgAllDataShow = "已是最后一页";
        scroll.on(
            {
                'scrollStart': function () {
                    state = 0;
                    this.isWaitingForManualReset = false;

                },
                'scroll': function () {

                    var y = this.y;
                    if (y > 0) {
                        if (y < 25) {
                            if ((state & 1) == 0) {
                                state = 1;
                            }
                        }
                        else if (25 <= y && y < 60) {
                            if ((state & 2) == 0) {
                                var top = scroll.noticetop || itop;
                                notice.down.html('下拉刷新').show().css({ top: top + 'rem' });
                                state = 2;
                            }
                        }
                        else if (y >= 60) {
                            if ((state & 4) == 0) {
                                notice.down.html('松开立即刷新');
                                state = 4;
                            }
                        }
                    }
                    else if (y < 0) {
                        var Y = Math.abs(this.y);
                        var MaxY = Math.abs(this.maxScrollY);
                        if ((Y - MaxY) < 10) {
                            if ((state & 1) == 0) {
                                state = 1;
                            }
                        }
                        else if (25 <= (Y - MaxY) && (Y - MaxY) < 50) {
                            if ((state & 2) == 0) {
                                if (fnmore) {
                                    var msghint = '上拉刷新';
                                    if (scroll.isPageEnd) {
                                        msghint = msgAllDataShow;
                                    }
                                    var bottom = scroll.noticebottom || ibottom;
                                    notice.up.html(msghint).show().css({  bottom: bottom / 50 + 'rem'});
									
                                }
                                state = 2;
                            }
                        }
                        else if (Y - MaxY >= 50) {
                            if ((state & 4) == 0) {
                                if (fnmore) {
                                    if (scroll.isPageEnd) {
                                        notice.up.html(msgAllDataShow);
                                    } else {
                                        notice.up.html('松开加载更多');
                                    }
                                }
                                state = 4;
                            }
                        }
                    }
                    scroll.fnscroll && scroll.fnscroll();
                },
                'beforeScrollEnd': function () {

                    if ((state & 4) == 4) {
                        this.isWaitingForManualReset = true;
                        var self = this;
                        if (this.y > 0) {
                            if (fnfresh) {
                                notice.down.html('正在刷新...');
                                if (this.y > 60) {
                                    fnfresh && fnfresh(function () {
                                        notice.down.html('刷新成功！');
                                        setTimeout(function () {
                                            notice.down.hide();
                                            self.scrollTo(0, 0, 500, self.options.bounceEasing);
                                        }, 250);
                                    });
                                }
                            } else {
                                notice.down.hide();
                                self.scrollTo(0, 0, 500);
                            }
                        } else {
                            var Y = Math.abs(this.y);
                            var MaxY = Math.abs(this.maxScrollY);
                            if (scroll.isPageEnd) {
                                self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                            } else {
                                //notice.up.html('正在加载...');
                                notice.up.html('');
                            }
                            if (Y - MaxY >= 50) {
                                fnmore && fnmore(function () {
                                    setTimeout(function () {
                                        notice.up.hide();
                                        //self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                                    }, 250);
                                });
                                if (!fnmore) {
                                    setTimeout(function () {
                                        notice.up.hide();
                                        self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                                    }, 250);
                                }
                            } else {
                                notice.up.hide();
                                //self.scrollTo(0, -MaxY, 500, self.options.bounceEasing);
                            }
                        }
                    } else {
                        notice.down.hide();
                        notice.up.hide();
                    }
                },

                'inertiaScrollEnd':function(){
                    scroll.fnscroll && scroll.fnscroll(true);
                    //console.log('inertiaScrollEnd');
                }

            });
    }

    //是否PC浏览器
    function isPcBrower() {
        var userAgentInfo = navigator.userAgent.toLowerCase();
        var Agents = ["android", "iphone", "ipad", "ipod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    function ShowMsg(msg){
        try{
            OptMsg.ShowMsg(msg);
        }catch(ex){
        }
    }

    //键盘控件处理
    var KeyBoard = (function () {

        var keyb = $(".keyboard");
        var name = keyb.find(".name");
        var input = keyb.find(".input");
        var config = {};
        var firstInput = false;
        var index = 0;
        var indexNext = 0;
        var maxnum = 999999999;
        var allowZero = false;
        var canHideKeyboard = false;
        var pcBrower = isPcBrower();
        var maxhint = "";
        bindEvent();

        function getMaxNum(num){
            if(num!=undefined){
                return num;
            }
            return 999999999;
        }

        function initKeyBoard(kbconfig) {
            config = kbconfig;
            index = kbconfig.index;
            maxhint = kbconfig.maxhint || "数字不能超过最大值 ";
            indexNext = index + 1;
            maxnum = getMaxNum(kbconfig.maxnum);
            allowZero = kbconfig.allowZero || false;
            keyb.css({bottom: "-163px"});
            name.text(kbconfig.name || "");
            var keyinput = $(".keyboard .row .input");
            if (kbconfig.name == "") {
                keyinput.css({"width": "88%", "text-align": "center"});
            } else {
                keyinput.css({"width": "38%", "text-align": "left"});
                $("#keyboardMark").show();
            }
            input.text(kbconfig.input || "");
            firstInput = true;
            canHideKeyboard = false;
        }

        function setKeyBoard(kbconfig) {
            index = kbconfig.index;
            indexNext = index + 1;
            maxnum = getMaxNum(kbconfig.maxnum);
            name.text(kbconfig.name || "");
            input.text(kbconfig.input || "");
            firstInput = true;
            canHideKeyboard = false;
        }

        function freshKeyBoard(kbconfig) {
            input.text(kbconfig.input || "");
        }

        function hideKeyBoard() {
            $("#divMask").show();
            keyViewShow(false);
            config.hidefn && config.hidefn();
            setTimeout(function () {
                $("#divMask").hide();
            }, 500);
            $("#keyboardMark").hide();
        }


        function clickEffect(curclick, keyv, flag) {

            switch (keyv) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "0":
                case "point":
                    if (flag == 1) {
                        curclick.css("background", "#B9B9C4");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;

                case "clear":
                    if (flag == 1) {
                        curclick.css("background", "#EC2B2B");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;
                case "clear1":
                    if (flag == 1) {
                        curclick.css("background", "#6c6c6c");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;
                case "ok":
                    if (flag == 1) {
                        curclick.css("background", "#B9B9C4");
                    } else if (flag == 0) {
                        curclick.css("background", "");
                    }
                    break;
            }

        }

        //数字键盘响应事件
        function dealNumKeyEvent(objclick) {
            var curclick = objclick;
            var keyv = curclick.attr("key");
            var curv = input.text();
            if (!pcBrower) {
                clickEffect(objclick, keyv, 1);
            }
            switch (keyv) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "0":
                    var newv = null;
                    var len = curv.length;
                    if (firstInput || (curv == 0 && len == 1)) {
                        newv = keyv;
                    } else {
                        newv = curv + keyv;
                    }
                    var newvInt = newv;
                    if (newvInt > maxnum) {
                        ShowMsg(maxhint + maxnum, "", 1500);
                        return;
                    }
                    var lencmp = newvInt.length;
                    if (lencmp > 4) {
                        var ipoint = newvInt.indexOf(".");
                        if (ipoint > 0) {
                            if (lencmp - ipoint > 3) {
                                ShowMsg("小数位数最多只能2位");
                                return;
                            }
                        }
                    }
                    input.text(newvInt);
                    break;
            }
        }

        //功能键盘响应事件
        function dealOtherKeyEvent(objclick) {
            var curclick = objclick;
            var keyv = curclick.attr("key");
            switch (keyv) {
                case "ok":
                    var newvInt = input.text();
                    if (newvInt == 0 && !allowZero) {
                        ShowMsg("数量不能为0");
                    } else {
                        var ilen = newvInt.length;
                        if (ilen >= 2) {
                            var lastChar = newvInt.substring(ilen - 1);
                            if (lastChar == ".") {
                                newvInt = newvInt.substring(0, ilen - 1);
                            }
                        }
                        config.fn && config.fn(newvInt, index);
                        hideKeyBoard();
                    }
                    break;

                case "clear1":
                    var curv = input.text();
                    var len = curv.length;
                    if (len == 0) {
                        return;
                    } else if (len == 1) {
                        newvInt = "";
                    } else {
                        newvInt = curv.substring(0, len - 1);
                    }
                    input.text(newvInt);
                    break;

                case "clear":
                    newvInt = "";
                    input.text(newvInt);
                    break;

                case "point":
                    var curv = input.text();
                    var len = curv.length;
                    if (len == 0) {
                        return;
                    }
                    if (curv.indexOf(".") > 0) {
                        return;
                    }
                    input.text(curv + ".");
                    break;
            }
            firstInput = false;

        }

        function bindEvent() {
            $("#keyboardMark").bind('click', function () {
                if (canHideKeyboard) {
                    hideKeyBoard();
                    canHideKeyboard = false;
                }
            });


            if (pcBrower) {
                $(".keyboard span").delegate('', {
                    'click': function () {
                        dealNumKeyEvent($(this));
                        dealOtherKeyEvent($(this));
                    }
                });

            } else {
                $(".keyboard span").delegate('', {
                    'touchstart': function () {
                        dealNumKeyEvent($(this));
                    },
                    'touchend': function () {
                        var curclick = $(this);
                        var keyv = curclick.attr("key");
                        clickEffect($(this), keyv, 0);
                    },
                    'click': function () {
                        dealOtherKeyEvent($(this));
                    }
                });
            }

        }

        function keyViewShow(bview) {
            if (bview) {
                keyb.show();
                keyb.animate({bottom: "0px"}, 200, function () {
                    setTimeout(function () {
                        canHideKeyboard = true;
                    }, 200);
                });
            } else {
                keyb.animate({bottom: "-163px"}, 200, function () {
                    keyb.hide();
                    canHideKeyboard = false;
                });
            }
        }

        return {
            show: function () {
                keyb.show();
            },
            hide: function () {
                hideKeyBoard();
            },
            autoshow: function (config) {
                initKeyBoard(config);
                keyViewShow(true);
            },
            freshKeyBoard: freshKeyBoard,
            setKeyBoard: setKeyBoard
        }

    })();


    return {
        keyBoard: KeyBoard,
        initDate: initDate,
        initDateNoDay:initDateNoDay,
        dateClick: dateClick,
        inputHint: inputHint,
        imageClick: imageClick,
        initkdScroll: initkdScroll
    };
})();
var kdAppSet = (function () {

    var noimg_mode_default = "img/no_img_mode.png";
    var noimg_mode_cacheKey = "noimg_mode_cacheKey";
    var rmb = "￥";

    //是否显示价格
    var isShowPrice = true;
    //是否显示库存
    var isShowStock = true;
    var stockStrategy = [];

    //透明遮罩，阻碍事件传播，处理点透
    var divMask = $("#divMask");
    //微信链接参数
    var appParam = {};
    //用户信息
    var userInfo = {};

    //针对特别手机端处理
    var phoneNumber = 0;
    //进度加载圈
    var kdloading = $("#kdloading");

    //云之家与连接100接口
    var urlInfo = {
        apiType: 1,    //微信通讯录 api接口 0 云之家， 1 连接100
        urlHeadwx: "http://cloud.kingdee.com/openapi/lianjie100/",//连接100接口
        lianjie100: "?client_id=200147&client_secret=38a903ddcb0e2715987b64033dc68df6",//连接100接口
        urlHead: 'http://mob.cmcloud.cn/webapptest'//mob接口
    };


    //统一系统提示信息
    var AppMsg = {
        workError: "网络错误，请稍候再试",
        getVerifyCode: "获取验证码...",
        checkVerifyCode: "验证注册信息...",
        netWorkError: 'phoneNetWorkError'
    };


    var logImgUrl = "";
    //用户身份信息 是否是主管
    // identity:   manager  buyer  unknow

    var emptyMsg = '<div class="emptySearch" style="height:{height}px"><img src="img/empty.png"/><span>没有符合条件的数据</span></div>';

    var isPCBrower = getPcBrowerType();
    var isIphoneSeries = checkIphoneSeries();

    //获取封装后的控件
    var AppCtrl = kdctrl;

    function getAppParamObj(key) {
        if (window.localStorage) {
            var storage = window.localStorage;
            var keyv = storage.getItem(key);
            if (keyv == null) {
                return {};
            } else {
                var keyv = keyv.replace('\r', '').replace('\n', '');
                return eval('(' + keyv + ')');
            }
        }
        return {};
    }

    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            var qstr = r[2];
            if (qstr == "null") {
                qstr = "";
            }
            return qstr
        }
        return "";
    }


    //设置手机端的特别标志
    function setPhoneNumFlag() {
        var flagStr = "huaweig750-t00";
        if (hasSomeSpecial(flagStr)) {
            phoneNumber = 1;
        }
    }

    //判断某些手机型号 是否要特别处理
    function hasSomeSpecial(specialFlag) {
        var ua = navigator.userAgent.toLowerCase();
        return (ua.indexOf(specialFlag) > 0);
    }

    //获取图片显示模式  有图 无图
    function getImgMode() {
        var noimg_modeV = kdShare.cache.getCacheDataObj(noimg_mode_cacheKey);
        return (noimg_modeV == "" || noimg_modeV == 1);
    }

    //获取购物车缓存标示
    function getGoodslistFlag() {
        return 'goodslist2' + appParam.eid + userInfo.database;
    }

    //获取编辑订单缓存标示
    function getOrderlistFlag() {
        return 'orderlist2' + appParam.eid + userInfo.database;
    }


    //获取手机浏览器信息
    function getPhoneInfo() {
        var phoneInfo = [];
        phoneInfo.push(JSON.stringify(window.navigator.userAgent));
    }

    //显示遮罩框
    function showMark(showObj, bvisiable) {
        if (phoneNumber > 0) {
            //针对不支持透明度的手机浏览器 特别处理
            var kbm = $("#keyboardMarkImg");
            bvisiable ? kbm.show() : kbm.hide();
        } else {
            bvisiable ? showObj.show() : showObj.hide();
        }
    }


    //阻止点击事件传播
    function stopEventPropagation() {
        divMask.show();
        setTimeout(function () {
            divMask.hide();
        }, 500);
    }


    // 金额千分位格式化
    function formatMoney(money, digit) {
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

    // 金额千分位格式化
    function formatMoneyStr(money, digit) {
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
        return formatMoney(moneystr, digit);
    }

    //清除小数点后的 0
    function clearZero(num) {
        var numStr = '' + num;
        if (numStr.indexOf('.') >= 0) {
            var arr = numStr.split('.');
            if (Number(arr[1]) == 0) {
                return Number(arr[0]);
            }
        }
        return num;
    }

    //获取 价格显示字符串
    function getPriceStr(item) {
        var price = item.price;
        var maxprice = item.maxprice;
        var priceStr = "";
        if (maxprice > 0 && maxprice > price) {
            priceStr = rmb + formatMoneyStr(price) + " ~" + rmb + formatMoneyStr(maxprice);
        } else {
            priceStr = rmb + formatMoneyStr(price);
        }

        return priceStr;
    }

    //根据仓库策略显示 库存信息
    function getStockStr(stockNum, unitName) {
        var stockstatus = 0;
        var stockStr = stockNum;
        if (unitName) {
            stockStr = stockNum + " " + unitName;
        }

        if (!isShowStock) {
            var num = Number(stockNum);
            var inum = stockStrategy.length;
            for (var i = 0; i < inum; i++) {
                var item = stockStrategy[i];
                var min = item.min;
                var max = 1000000000;
                if (item.max != undefined) {
                    max = item.max;
                }
                if (num >= min && num <= max) {
                    stockStr = item.stockmsg;
                    break;
                }
            }

            var color = "#FF6427";
            if (stockStr == "缺货") {
                color = "red";
                stockstatus = -1;
            } else if (stockStr == "num") {
                color = "#FF6427";
                stockstatus = 0;
            } else if (stockStr == "有货") {
                color = "#34a82c";
                stockstatus = 1;
            }
        }

        if (stockStr == "num") {
            stockStr = stockNum;
            if (unitName) {
                stockStr = stockNum + " " + unitName;
            }
        }

        return {
            stockStr: stockStr,
            color: "color:" + color,
            stockstatus: stockstatus
        };
    }

    //初始化 webapp 应用信息
    function initApp() {
        getAppParamFromWx();
        setPhoneNumFlag();
        $("#divMask").bind("click", function () {
            $(this).hide();
        });
        useFastClick();
        var url = window.location.href.split('?')[0] || "";
        logImgUrl = url.replace("start.html", "img/share_logo.png");
    }

    //使用fast click 库
    function useFastClick() {
        var viewlist = ["keyboard", "goodsitemlist", "view-addgoods", "view-itemdetail",
            "viewid_goodslist", "view_Me", "orderlistview", "orderlisthead", "orderSearch",
            "view_orderdetail", "viewid_home"];
        var inum = viewlist.length;
        for (var i = 0; i < inum; i++) {
            try {
                var viewid = document.getElementById(viewlist[i]);
                FastClick.attach(viewid);
            } catch (e) {
            }

        }
    }


    //获取由微信链接传过来的参数信息
    function getAppParamFromWx() {

        var eid = GetQueryString("eid") || 0;
        var keyv = "wdhlogininfo" + eid;
        //还要加上时效性判断
        appParam = getAppParamObj(keyv);
        var isdebug = appParam.isdebug || GetQueryString("isdebug") || "";
        var openidv = GetQueryString("openid");
        if (!appParam.openid) {
            var openid = "";
            if (isdebug && openidv != "") {
                openid = openidv;
            }
            appParam = { openid: openid, eid: eid };
        } else {
            if (isdebug && openidv != "") {
                appParam.openid = openidv;
            }
        }

        appParam.isdebug = isdebug;
        appParam.source = "service";

        //单品分享
        //appParam.shareGoodsId = GetQueryString("shareGoodsId") || "";
        //邀请采购员加入
        //appParam.sharePhoneNum = GetQueryString("sharePhoneNum") || "";
        //var phonemsg = GetQueryString("sharePhoneMsg") || "";
        //appParam.sharePhoneMsg = decodeURI(phonemsg);

        //1 要创建付款单
        appParam.createPayBill = GetQueryString("createPayBill") || "";
        //跳转页面到哪里
        appParam.toviewflag = GetQueryString("toviewflag") || "";

        //订单导购测试
        //appParam.guideBillId =1488 || "";

        var wxinfo = "wdhlogininfo" + appParam.openid;
        var appParam2 = getAppParamObj(wxinfo);
        if (appParam2.headimgurl != '') {
            appParam.headimgurl = appParam2.headimgurl;
        }

    }

    //获取提示信息
    function getLoadingHint(msg) {
        var loadingHint = '<div class="hintflag">' + Lib.LoadingTip.get(msg) + '</div>';
        return loadingHint;
    }

    //移除提示信息
    function removeLoadingHint(ctrlObj) {
        ctrlObj.innerHTML = "";
    }

    //提示信息
    function showMsg(content, itime) {
        document.getElementById('kdnoticecontent').innerHTML = content;
        $('#kdnotice').show();
        var stime = itime || 1000;
        setTimeout(function () {
            $('#kdnotice').hide();
        }, stime);
    }

    //用户退出账号
    function logout() {
        $.Object.extend(userInfo, {
            usertype: -1,
            userid: 0,
            //contactName: "",
            identity: "retail",
            //companyName: "",
            senderMobile: "",
            senderName: "",
            custName: "",
            receiverOids: "",
            receiveAddress: "",
            empName: "",
            receiverPhone: "",
            vipPoints: "",
            viplevelname: "",
            vipAmount: ""
        });
    }


    function setAppParam(para) {
        $.Object.extend(appParam, para);
    }

    //自动添加采购员时，更新用户信息
    function updateUserInfo(user) {
        $.Object.extend(userInfo, user);
    }

    //根据接口 设置用户信息
    function setUserInfo(user) {
        //usertype  -1  什么权限都没有  0 能看能下单, 1 只能查看商品 userid=0 没获取到用户id
        userInfo = $.extend(user, {
            custName: user.senderName,
            identity: user.identify,
            allowpayway: sortPayType(user.allowpayway)
        });

        if (userInfo.cmpInfo.img == "") {
            userInfo.cmpInfo.img = logImgUrl;
        }
        //是否显示价格
        isShowPrice = (user.showprice != 1);
        //是否显示库存
        isShowStock = (user.showstock != 1);
    }

    function sortPayType(pay) {
        var list = [];
        var sortList = ['wx', 'alipay', 'zjt', 'prepay','vipcard', 'offline'];
        for (var i in sortList) {
            if (pay.indexOf(sortList[i]) >= 0) {
                list.push(sortList[i]);
            }
        }
        return list;
    }

    //设置用户的 云之家openid
    function setUserCloudOpenid(openid) {
        userInfo.cloudOpenid = openid || "";
    }


    //初始化app控件信息
    function initAppCtrl() {
        AppCtrl.initDate($(".kdcDate"));
        AppCtrl.dateClick(".kdcDateParent");
        AppCtrl.imageClick(".kdcImage");
        AppCtrl.inputHint(".kdcHint");
    }

    //是否PC浏览器  true 表示pc端 false表示手机端
    function getPcBrowerType() {
        var userAgentInfo = navigator.userAgent.toLowerCase();
        var Agents = ["android", "iphone", "ipad", "ipod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    //是否iphone系列产品
    function checkIphoneSeries() {
        var userAgentInfo = navigator.userAgent.toLowerCase();
        var Agents = ["iphone", "ipad", "ipod"];
        var flag = false;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    //是否支持微信通聊天
    function isEnableChat() {
        return false;
    }

    //设置滚动加载信息
    function setKdLoading(bview, msg) {
        if (bview) {
            if (msg == undefined) {
                msg = "正在努力加载...";
            }
            kdloading.find(".loading-text")[0].innerHTML = msg;
            kdloading.show();
        } else {
            kdloading.hide();
        }
    }

    //保存pc端返回的库存显示策略
    function setStockStrategy(stocklist) {
        if (stocklist == undefined) {
            stockStrategy = [
                { "stockmsg": "缺货", "min": 0, "max": 0 },
                { "stockmsg": "num", "min": 1, "max": 20 },
                { "stockmsg": "有货", "min": 21 }
            ];
        } else {
            stockStrategy = stocklist;
        }
    }

    //获取列表为空信息
    function getEmptyMsg(height) {
        if (height == undefined) {
            height = 1012;
        }
        return $.String.format(emptyMsg, { height: height });
    }


    //获取图片的缩略图
    function getImgThumbnail(imgSrc, isOriginal) {
        if (imgSrc.indexOf("http") < 0) {
            return imgSrc;
        }
        if (isOriginal) {
            return imgSrc.replace("&needthumb=1", "");
        } else {
            imgSrc = imgSrc.replace("&needthumb=1", "");
            return imgSrc + "&needthumb=1";
        }
    }

    //获取经销商商品链接
    function getShareLink() {
        var link = userInfo.wdhurl;
        //分享者信息
        if (userInfo.optid) {
            var shareStr = '{"shareManagerId":"' + userInfo.optid + '"}';
            link = link + '&extData=' + encodeURIComponent(encodeURIComponent(shareStr));
        }
        link = link.replace("start.html", "index.html");
        return link;
    }

    function wxShare(share) {

        var title = share.title;
        var desc = share.desc;
        var link = share.link;
        var imgUrl = share.imgUrl || logImgUrl;
        var qqlink = share.qqlink;
        var fnCallBack = share.fnCallBack;

        function sharemsg() {
            $("#wxShareMark").click();
        }

        //分享给朋友
        wx.onMenuShareAppMessage({
            title: title,
            desc: desc,
            link: link,
            imgUrl: imgUrl,
            complete: function () {
                sharemsg();
                fnCallBack && fnCallBack();
            },
            trigger: function () {
            },
            success: function () {
            },
            cancel: function () {
            },
            fail: function () {
            }
        });

        //分享到朋友圈
        wx.onMenuShareTimeline({
            title: title,
            link: link,
            imgUrl: imgUrl,
            complete: function () {
                sharemsg();
                fnCallBack && fnCallBack();
            }
        });
        //分享到QQ
        wx.onMenuShareQQ({
            title: title,
            desc: desc,
            link: qqlink,
            imgUrl: imgUrl,
            complete: function () {
                sharemsg();
                fnCallBack && fnCallBack();
            }
        });
    }

    //设置微信分享信息
    function wxShareInfo(shareinfo) {
        try {
            var shareUrl = window.location.href.split('?')[0] || "kdurl_error";
            shareUrl = shareUrl + "?eid=" + appParam.eid;
            //分享者信息
            if (userInfo.optid) {
                shareUrl = shareUrl + '&shareManagerId=' + userInfo.optid;
                shareUrl = shareUrl + '&oid=kd1' + appParam.openid;
            }
            if (shareinfo.link) {
                shareinfo.link = shareUrl + shareinfo.link;
            }
            var cmpName = "金蝶KIS";
            var imglog = logImgUrl;
            if (userInfo.cmpInfo) {
                cmpName = userInfo.cmpInfo.name;
                if (userInfo.cmpInfo.img) {
                    imglog = userInfo.cmpInfo.img;
                }
            }
            var shareDesc = '\n移动营销协作平台';
            var title = shareinfo.title || cmpName + "微商城";
            var desc = shareinfo.desc || shareDesc;
            var link = shareinfo.link || shareUrl;
            var imgUrl = shareinfo.imgUrl || imglog;
            if (imgUrl.indexOf("http:") < 0) {
                imgUrl = logImgUrl;
            }
            var qqlink = link;
            link = link.replace("start.html", "index.html");

            wxShare({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                qqlink: qqlink
            });
        } catch (ex) {
        }
    }

    //微信扫描条码
    function wxScanQRCode() {
        wx.scanQRCode({
            needResult: 1,
            scanType: ["qrCode", "barCode"],
            success: function (res) {
                var urlOrg = res.resultStr;
                var posi = urlOrg.indexOf('shareGoodsId=');
                if (posi >= 0) {
                    var url = '?' + urlOrg.substr(posi);
                    getGoodsById(url);
                } else {
                    OptMsg.ShowMsg('没有找到商品信息', '', 3000);
                }
            }
        });
    }

    function getGoodsById(url) {
        var shareGoodsId = $.Url.getQueryString(url, 'shareGoodsId') || '';
        if (shareGoodsId) {
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: { itemid: shareGoodsId } }]);
        } else {
            OptMsg.ShowMsg('没有找到商品信息', '', 3000);
        }


    }

    //微信获取网络状态
    function wxGetNetWork(fnOk, fnErr) {
        if (isPCBrower) {
            fnOk && fnOk();
        } else {
            wx.getNetworkType({
                success: function (res) {
                    // 返回网络类型2g，3g，4g，wifi
                    fnOk && fnOk(res.networkType);
                },
                fail: function () {
                    fnErr && fnErr();
                }
            });
        }
    }

    //加载js文件
    function loadScriptFile(url) {
        document.write("<scri" + "pt src=" + url + "></sc" + "ript>");
    }

    //处理引起Json异常的字符串
    var ReplaceJsonSpecialChar = function (input) {
        input = input.replace(/\\/g, "\\\\");
        input = input.replace(/"/g, "\\\"");
        return input;
    };


    //错误页面展示
    function showErrorView(msg, fnCallBack, fnParam) {
        MiniQuery.Event.trigger(window, 'toview', ['ViewError', { fn: fnCallBack, fnParam: fnParam, errMsg: msg }]);
    }

    //设置标题
    function setAppTitle(title) {
        try {
            var apptitle = userInfo.cmpInfo.name;
            title = title || apptitle || "微商城";
            document.title = title;
            if (isIphoneSeries) {
                // hack在微信等webview中无法修改document.title的情况
                var _body = $('body');
                var _iframe = $('<iframe src="img/kdpx.gif" style="display: none;"></iframe>').on('load', function () {
                    setTimeout(function () {
                        _iframe.off('load').remove()
                    }, 0)
                }).appendTo(_body);
            }
        } catch (ex) {
        }
    }

    function delayLoad(name, fn, itime) {
        setTimeout(function () {
            MiniQuery.Event.trigger(window, 'loadview', [
                {
                    name: name,
                    nohint: true,
                    isview: true,
                    fnSuccess: function () {
                        fn && fn();
                    }
                }
            ]);
        }, itime);
    }

    function h5Analysis(key) {
        H5Analysis.btnClick(key);
    }

    initApp();

    return {
        stopEventPropagation: stopEventPropagation,
        showMark: showMark,
        getPhoneNumber: phoneNumber,
        getAppParam: function () {
            return appParam;
        },
        getUserInfo: function () {
            return userInfo;
        },
        getUrlInfo: function () {
            return urlInfo;
        },
        setAppParam: setAppParam,
        setUserInfo: setUserInfo,
        updateUserInfo: updateUserInfo,
        setUserCloudOpenid: setUserCloudOpenid,
        logout: logout,
        getPhoneInfo: getPhoneInfo,
        getImgMode: getImgMode,
        getGoodslistFlag: getGoodslistFlag,
        getOrderlistFlag: getOrderlistFlag,
        getEmptyMsg: getEmptyMsg,
        getRmbStr: rmb,
        getPriceStr: getPriceStr,
        formatMoneyStr: formatMoneyStr,
        clearZero: clearZero,
        getStockStr: getStockStr,
        getIsShowPrice: function () {
            return isShowPrice;
        },
        getAppMsg: function () {
            return AppMsg;
        },
        GetQueryString: GetQueryString,
        getNoimgModeDefault: function () {
            return noimg_mode_default;
        },
        getNoimgModeCacheKey: function () {
            return noimg_mode_cacheKey;
        },
        getLoadingHint: getLoadingHint,
        removeLoadingHint: removeLoadingHint,
        setKdLoading: setKdLoading,
        setStockStrategy: setStockStrategy,
        showMsg: showMsg,
        isEnableChat: isEnableChat,
        initAppCtrl: initAppCtrl,
        isPcBrower: function () {
            return isPCBrower;
        },
        isIPhoneSeries: function () {
            return isIphoneSeries;
        },
        ReplaceJsonSpecialChar: ReplaceJsonSpecialChar,
        getImgThumbnail: getImgThumbnail,
        loadScriptFile: loadScriptFile,
        showErrorView: showErrorView,
        wxScanQRCode: wxScanQRCode,
        wxGetNetWork: wxGetNetWork,
        setAppTitle: setAppTitle,
        delayLoad: delayLoad,
        h5Analysis: h5Analysis,
        wxShare: wxShare,
        wxShareInfo: wxShareInfo,
        getShareLink: getShareLink
    }
})();

var Lib = (function (KISP, Lib) {

    Lib.Scroller = KISP.Scroller;

    var API = Lib.API = (function () {

        var prefix = 'kis.APP002293.uesale.UESaleController.';
        var appParam = kdAppSet.getAppParam();
        var eid = appParam.eid;
        /*        if (appParam.appcode) {
         prefix = 'kis.' + appParam.appcode + '.uesale.UESaleController.';
         }*/

        //测试代码，代理到本地数据层
        var proxy = {
        };

        var apiCallingList = [];
        var apiTime = 15;

        var _post = KISP.API.post;

        KISP.API.post = function (config, fnSucess, fnFail, fnError) {

            var apiName = config.name;
            apiName = apiName.replace(prefix, '');

            if ((typeof(proxy) !== "undefined") && proxy[apiName]) {
                $.Script.load({
                    url: 'api/' + apiName + '.js?' + $.String.random(),
                    charset: 'utf-8',
                    document: document,
                    onload: function () {
                        var json = window['__json__'];
                        var root = {
                            Result: 200,
                            ErrMsg: "",
                            DataJson: json
                        };
                        fnSucess(json.DataJson, root);
                    }
                });
            }
            else {
                _post(config, fnSucess, fnFail, fnError);
            }
        };

        function getSign(cData, a, b, c) {
            try {
                var alist = getObjectv(cData);
                alist.sort();
                alist.push(a);
                alist.push(b);
                alist.push(c);
                var cstr = alist.join('');
                cstr = ReplaceJsonSpecialChar(cstr);
                return MD5ext(cstr);
            } catch (e) {
                return '';
            }
        }


        //处理特殊字符串
        var ReplaceJsonSpecialChar = function (input) {
            input = input.replace(/\\\\/g, "\\");
            input = input.replace(/\\\"/g, "\"");
            return input;
        };

        function getSignSort(cData, a, b, c) {
            try {
                var alist = getObjectv(cData);
                alist.sort();
                alist.push(a);
                alist.push(b);
                alist.push(c);
                return alist.join('');
            } catch (e) {
                return '';
            }
        }


        function hasUnicode(str) {
            var check = /[\u4E00-\u9FA5]/;
            return check.test(str)
        }


        function getObjectv(cData) {
            var fn = arguments.callee;
            var alist = [];
            for (var key in cData) {
                var ktype = typeof  cData[key];
                if (ktype != 'object') {
                    if (cData[key] != undefined) {
                        var cstr = cData[key] + "";
                        if (hasUnicode(cstr)) {
                        } else {
                            alist.push(cstr);
                        }
                    }
                } else {
                    alist = alist.concat(fn.call(null, cData[key]));
                }
            }
            return alist;
        }

        function ajax(name, data, fnSuccess, fnFail, fnError, userflag) {

            if (typeof data == 'function') { //此时为 ajax(name, fnSuccess, fnFail, fnError)
                fnError = fnFail;
                fnFail = fnSuccess;
                fnSuccess = data;
                data = {};
            }
            var paramData = data.para;

            //正在进行的调用 直接返回
            if (!pushApiCallList(name, paramData)) {
                return;
            }

            var apiname = name;
            if (apiname.indexOf(".") < 0) {
                apiname = prefix + name;
            }

            var Timestamp = (new Date()).getTime();
            var openid = kdAppSet.getAppParam().openid;
            KISP.API.post({
                name: apiname,
                eid: eid,
                openid: openid,
                data: {
                    Result: '',
                    ErrMsg: '',
                    AccountDB: '',
                    TotalPage: '',
                    openid: kdAppSet.getAppParam().openid,
                    Sign: '',//getSign(data.para, eid, openid, Timestamp),
                    //SignStr: getSignSort(data.para, eid, openid, Timestamp),
                    Timestamp: Timestamp,
                    CurrentPage: data.currentPage || 1,
                    ItemsOfPage: data.ItemsOfPage || 10,
                    Data: data.para
                }
            }, function (json, root) {
                apiCallFinish(name, paramData);
                var code = json['Result'];
                if (code == 200) {
                    var data = json['Data'] || {};
                    fnSuccess && fnSuccess(data, json, root, userflag);
                }
                else {
                    var msg = json['ErrMsg'];
                    fnFail && fnFail(code, msg, json, root, userflag);
                }
            }, function (code, msg) {
                apiCallFinish(name, paramData);
                fnFail & fnFail(code, msg);
            }, function (errCode) {
                apiCallFinish(name, paramData);
                kdAppSet.wxGetNetWork(
                    function () {
                        fnError && fnError(errCode);
                    },
                    function () {
                        //手机端网络异常
                        fnError && fnError(kdAppSet.getAppMsg().netWorkError);
                    }
                );
            });
        }


        //api调用结束
        function apiCallFinish(name, param) {
            popApiCallList(name, param);
        }

        //压入api调用历史堆栈
        function pushApiCallList(name, param) {
            try {
                var key = name + JSON.stringify(param);
                var apiDate = new Date();
                var apit = parseInt(apiDate.getTime() / 1000);
                var inum = apiCallingList.length;
                var iindex = -1;

                //console.log("调用"+name +" 参数"+key);
                for (var i = inum - 1; i >= 0; i--) {
                    //判断是否超时
                    if ((apit - apiCallingList[i].time) >= apiTime) {
                        //如果超时，删除掉
                        popApiCallList(name, param);
                        //console.log("超时移除调用"+name +" 参数"+key);
                    } else {
                        if (apiCallingList[i].key == key) {
                            iindex = i;
                            break;
                        }
                    }
                }
                if (iindex >= 0) {
                    //console.log("拒绝调用"+name +" 参数"+key);
                    return false;
                }
                apiCallingList.push({key: key, time: apit});
                //console.log("调用记录 "+JSON.stringify(apiCallingList));
                return true;
            }
            catch (ex) {
                return true;
            }
        }

        //移除已完成的api调用记录
        function popApiCallList(name, param) {
            try {
                var key = name + JSON.stringify(param);
                var inum = apiCallingList.length;
                var iindex = -1;
                for (var i = inum - 1; i >= 0; i--) {
                    if (apiCallingList[i].key == key) {
                        iindex = i;
                        break;
                    }
                }
                if (iindex >= 0) {
                    apiCallingList.splice(iindex, 1);
                    //console.log("移除调用"+name +" 参数"+key);
                }
            }
            catch (ex) {
            }
        }

        return {
            get: ajax,
            post: ajax
        };
    })();

    var Navigation = Lib.Navigation = (function () {

        function Navigation(views) {

            this.views = views;
            this.historys = [];
            this.nobacks = [];
        }

        $.Object.extend(Navigation.prototype, {

            push: function (name, view) {
                this.views[name] = view;
            },
            to: function (name, reload, args) {

                var views = this.views;
                var historys = this.historys;
                var nobacks = this.nobacks;

                var current = historys[historys.length - 1]; //取最后一个
                if (current) {
                    views[current.name].hide();
                }
                //没有回退的视图
                if (nobacks.length > 0) {
                    var last = nobacks[nobacks.length - 1];
                    if (last) {
                        views[last.name].hide();
                    }
                }
                var bcheck = (args && args.length > 0);
                var noBack = bcheck ? !!args[0].noBack : false;
                var noRepeat = bcheck ? !!args[0].noRepeat : false;
                if (noBack) {
                    nobacks.push({
                        name: name,
                        args: args
                    });
                } else {
                    if (noRepeat) {
                        if (current.name != name) {
                            historys.push({
                                name: name,
                                args: args
                            });
                        }
                    } else {
                        historys.push({
                            name: name,
                            args: args
                        });
                    }
                }
                var item = views[name];
                kdAppSet.setAppTitle('');
                if (reload) {
                    item.render.apply(null, args);
                }
                else {
                    item.show();
                }
            },
            back: function (reload, count) {

                if (typeof reload == 'number') {
                    count = reload;
                    reload = false;
                }
                reload = reload || false;
                count = count || 1;

                var historys = this.historys;
                var index = historys.length - 1 - count;
                var obj = historys[index];


                if (obj) {
                    var hashName = OptHash.get();
                    //获取hash值 看跟视图是否一致，一致则显示，否则继续回退
                    if (hashName == obj.name) {
                        this.to(obj.name, reload, obj.args);
                        historys.length = index + 1;
                    }else{
                        history.back();
                    }
                }
            },
            clear: function (step) {
                var historys = this.historys;
                var len = historys.length - 1;
                var deleteStart = len - step;
                if (deleteStart < 0) {
                    deleteStart = 0;
                }
                historys.splice(deleteStart, step);
            }
        });
        return Navigation;

    })();

    var LoadingTip = Lib.LoadingTip = (function () {

        var sample = $.String.between(top.document.body.innerHTML, '<!--loading', 'loading-->');

        function get(hintMsg) {
            if (!hintMsg) {
                hintMsg = "数据加载中...";
            }
            return $.String.format(sample, {loadingHint: hintMsg});
        }

        var id = $.String.random();

        function show(content, duration, fn) {

            var div = document.getElementById(id);
            if (!div) {
                var html = $.String.format('<div id="{0}" class="top-tip"><i></i><span><span></div>', id);
                $(document.body).prepend(html);
                div = document.getElementById(id);
            }

            $(div).show();
            $(div).find('span').html(content);

            if (duration) {
                setTimeout(function () {
                    $(div).fadeOut('fast', function () {
                        fn && fn();
                    });
                }, duration);
            }
        }

        function hide() {
            $('#' + id).hide();
        }

        return {
            get: get,
            show: show,
            hide: hide
        };

    })();


    var MD5ext = (function () {

        var rotateLeft = function (lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        };

        var addUnsigned = function (lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            if (lX4 | lY4) {
                if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        };

        var F = function (x, y, z) {
            return (x & y) | ((~x) & z);
        };

        var G = function (x, y, z) {
            return (x & z) | (y & (~z));
        };

        var H = function (x, y, z) {
            return (x ^ y ^ z);
        };

        var I = function (x, y, z) {
            return (y ^ (x | (~z)));
        };

        var FF = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var GG = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var HH = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var II = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var convertToWordArray = function (string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWordsTempOne = lMessageLength + 8;
            var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
            var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        };

        var wordToHex = function (lValue) {
            var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValueTemp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
            }
            return WordToHexValue;
        };

        var uTF8Encode = function (string) {
            string = string.replace(/\x0d\x0a/g, "\x0a");
            var output = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    output += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    output += String.fromCharCode((c >> 6) | 192);
                    output += String.fromCharCode((c & 63) | 128);
                } else {
                    output += String.fromCharCode((c >> 12) | 224);
                    output += String.fromCharCode(((c >> 6) & 63) | 128);
                    output += String.fromCharCode((c & 63) | 128);
                }
            }
            return output;
        };

        function md5(string) {
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            var S21 = 5, S22 = 9 , S23 = 14, S24 = 20;
            var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            string = uTF8Encode(string);
            x = convertToWordArray(string);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }
            var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
            return tempValue.toLowerCase();
        }

        return md5;
    })();

    var MD5 = Lib.MD5 = KISP.MD5;


    return Lib;


})(KISP, {});
/*
 * author:yaohong_zhou
 * date:2015-12-29
 * desc:动态加载某个模块
 *
 * */
var KDLoad = (function () {

    var $body = $(document.body);
    var href = window.location.href;
    var host = window.location.host || '';
    var vpath = 'build/';
    var isdebug = host.indexOf('localhost') >= 0 || host.indexOf('172.20') >= 0 || host.indexOf('127.0') >= 0 || (host == '');
    if (href.indexOf(vpath) >= 0) {
        isdebug = false;
    }
    var path = isdebug ? vpath+'debug/' : '';
    var View_Load = 'views_load/';
    var View_Html = path + 'View_Html/';
    var View_Script = path + 'View_Script/';
    var View_Css = path + 'View_Css/';
    var microSaleCust = isdebug ? 'build/' : '../microSaleCust/';
    var domver = document.getElementById('kdbuildDate');
    var verNum = Math.random();
    if (domver) {
        verNum = domver.getAttribute('kdbuildDate');
    }

    function getHtml(caller) {
        //name,fnSuccess,fnError
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', View_Html + caller.name + '.html?v=' + verNum, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    $body.append(data);
                    loadCss({
                        name: caller.name,
                        fnSuccess: function () {
                            caller.fnSuccess && caller.fnSuccess();
                        }
                    });
                }
                else {
                    caller.fnError && caller.fnError("加载模块" + caller.name + '出错');
                }
            }
        };
        xhr.send(null);
    }

    //调试时使用
    function loadView_debug(caller) {
        var name = caller.name;
        var nav = caller.nav;
        getHtml({
            name: name,
            fnSuccess: function () {
                loadScript({
                    name: name,
                    fnSuccess: function () {
                        caller.app.setKdLoading(false);
                        if (caller.isview) {
                            nav.push(name, window[name]);
                        }
                        caller.fnSuccess && caller.fnSuccess();
                    }
                });
            }
        });
    }

    function LoadView(caller) {
        if (isdebug) {
            loadView_debug(caller);
            return;
        }
        //name,fnSuccess,fnError
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', View_Load + caller.name + '.html?v=' + verNum, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    $body.append(data);
                    caller.fnSuccess && caller.fnSuccess();
                }
                else {
                    caller.fnError && caller.fnError("加载模块" + caller.name + '出错');
                }
            }
        };
        xhr.send(null);
    }

    function loadScript(caller) {
        //name,fnSuccess,fnError

        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                caller.fnSuccess && caller.fnSuccess();
                script.onload = script.onreadystatechange = null;
            }
        };
        script.src = View_Script + caller.name + '.js?v=' + verNum;
        head.appendChild(script);
    }


    function loadCss(caller) {
        //name,fnSuccess,fnError
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.onload = link.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                caller.fnSuccess && caller.fnSuccess();
                link.onload = link.onreadystatechange = null;
            }
        };
        link.href = View_Css + caller.name + '.css?v=' + verNum;
        head.appendChild(link);
    }

    function loadCssCust(caller) {
        //name,fnSuccess,fnError
        if (isdebug) {
            return;
        }
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.onload = link.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                caller.fnSuccess && caller.fnSuccess();
                link.onload = link.onreadystatechange = null;
            }
        };
        link.href = microSaleCust + caller.eid + '/cust.css?v=' + verNum;
        head.appendChild(link);
    }


    return {
        getHtml: getHtml,
        LoadView: LoadView,
        loadScript: loadScript,
        loadCssCust: loadCssCust
    };

})();



/*添加商品到购物车*/

var AddGoods = (function () {

    var viewPage, config, goodsHead, sampleHead, imgdefault, addGoodsList,
        auxType,
        attrType,
        divList,
        scroller,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#view-addgoods');
            goodsHead = document.getElementById('addgoodshead');
            sampleHead = $.String.between(goodsHead.innerHTML, '<!--', '-->');
            imgdefault = "img/no_img.png";
            divList = document.getElementById('addgoodsbody');
            scroller = Lib.Scroller.create(divList);
            AddGoods_Api.initView(scroller);
            AddGoods_Attr.initView(scroller);
            //AddGoods_AddList.initView();
            AddGoods_Batch.initView();
            addGoodsList = AddGoods_Api.getAddGoodsList();
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        //批量录入
        $(".addgoods").delegate('.btnBatch', {
            'click': function () {
                var bloadind = AddGoods_Api.apiLoading();
                if (bloadind) {
                    OptMsg.ShowMsg("数据正在加载中,请稍后...");
                    return;
                }
                var isBatch = false;
                if (this.innerHTML == "批量录入") {
                    isBatch = true;
                    this.innerHTML = "返回";
                } else {
                    //批量录入模式，点击返回时 要清空数据
                    addGoodsList.length = 0;
                    this.innerHTML = "批量录入";
                }
                changeInputMode(isBatch);
            },
            'touchstart': function () {
                $(this).css({ background: '#FF6427', color: "#ffffff" });
            },
            'touchend': function () {
                $(this).css({ background: '#ffffff', color: "#FF6427" });
            }
        });

        //图片放大
        $(".addgoods .imgview").bind("click", function () {
            kdShare.Image.setBigImage($(this));
        });


        //添加到购物车
        $(".addgoods").delegate('.btnok', {
            'click': function () {
                var bloadind = AddGoods_Api.apiLoading();
                if (bloadind) {
                    OptMsg.ShowMsg("数据正在加载中,请稍后...");
                    return;
                }
                addGoodsToGoodsBox();
            },
            'touchstart': function () {
                $(this).css({ background: '#ef5215' });
            },
            'touchend': function () {
                $(this).css({ background: '#FF6427' });
            }
        })
            .delegate('.close', {
                'click': function () {
                    hideAttr();
                }
            })
            .delegate('.goodsBox', {
                'click': function () {
                    $('#divlistMark').hide();
                    viewPage.hide();
                    MiniQuery.Event.trigger(window, 'toview', ['CacheList']);
                },
                'touchstart': function () {
                    var curthis = $(this);
                    curthis.removeClass('sprite-cart');
                    curthis.addClass('sprite-cart_s');
                    curthis.css('color', '#FF753E');
                },
                'touchend': function () {
                    var curthis = $(this);
                    curthis.removeClass('sprite-cart_s');
                    curthis.addClass('sprite-cart');
                    curthis.css('color', '#686f76');
                }
            })
            .delegate('.btn-add-cart', {
                'click': function () {
                    if (AddGoods_Attr.addGoodsToList()) {
                        OptMsg.ShowMsg("已加入购物车", function () {
                            addToGoodsBox();
                            var identity = kdAppSet.getUserInfo().identity;
                            if (identity == 'retail') {
                                hideAttr();
                            }
                            MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
                        }, 500);
                    }
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215', color: '#fff' });
                },
                'touchend': function () {
                    $(this).css({ background: '#fff', color: '#ff6427' });
                }
            })
            .delegate('.btn-buy-now', {
                'click': function () {
                    if (AddGoods_Attr.addGoodsToList()) {
                        addToGoodsBox();

                        hideAttr();
                        var userInfo = kdAppSet.getUserInfo();
                        var hasLogin = userInfo.usertype != 0 || userInfo.senderMobile == ''
                            || (!userInfo.cmpInfo.allowRetailSubmit && userInfo.identity == 'retail');
                        if (hasLogin) {
                            MiniQuery.Event.trigger(window, 'toview', ['Register', { fromView: 'cachelist' }]);
                            return;
                        }
                        //MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
                        CacheList.goodsSubmitBill();
                    }
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215' });
                },
                'touchend': function () {
                    $(this).css({ background: '#FF6427' });
                }
            });

        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            }
        });

    }


    //把商品加入购物车缓存
    function addGoodsToGoodsBox() {

        //判断是否批量录入
        var btnBatch = $(".addgoods .btnBatch");
        var isBatchMode = (btnBatch[0].innerText == '返回');
        if (isBatchMode && (addGoodsList.length <= 0) && (btnBatch.attr('display') == 'none')) {
            OptMsg.ShowMsg("请录入商品数量");
            return;
        }
        //buy 立即购买 add 加入购物车
        if (config.buytype == 'buy') {
            if (isBatchMode || AddGoods_Attr.addGoodsToList()) {
                addToGoodsBox();
                hideAttr();
                var userInfo = kdAppSet.getUserInfo();
                var hasLogin = userInfo.usertype != 0 || userInfo.senderMobile == ''
                    || (!userInfo.cmpInfo.allowRetailSubmit && userInfo.identity == 'retail');
                if (hasLogin) {
                    MiniQuery.Event.trigger(window, 'toview', ['Register', { fromView: 'cachelist' }]);
                    return;
                }
                CacheList.goodsSubmitBill();
            }
        } else if (config.buytype == 'add') {
            if (isBatchMode || AddGoods_Attr.addGoodsToList()) {
                OptMsg.ShowMsg("已加入购物车", function () {
                    addToGoodsBox();
                    if (isBatchMode) {
                        hideAttr();
                    }
                    MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
                }, 500);
            }
        }

    }


    //保存购物清单的数据到缓存
    function addToGoodsBox() {

        if (addGoodsList.length == 0) {
            return;
        }

        var shareData = AddGoods_Api.getData();
        auxType = shareData.auxType;
        attrType = shareData.attrType;

        var addGoods = {
            itemid: config.goods.itemid,
            isoverseas: config.goods.isoverseas || 0,
            name: config.goods.goodsName,
            unitid: config.goods.unitid,
            unitname: config.goods.unitname,
            img: config.goods.goodsImg,
            stocknum: config.goods.stocknum,
            auxtype: auxType,
            attrList: addGoodsList
        };

        var goodslistArr = [];
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist == "") {
            goodslistArr.push(addGoods);
        }
        else {
            goodslistArr = JSON.parse(goodslist);
            var inum = goodslistArr.length;
            var bcheck = false;
            //购物车列表遍历
            for (var i = 0; i < inum; i++) {
                if (addGoods.itemid == goodslistArr[i].itemid) {
                    var attrList = goodslistArr[i].attrList;
                    var attrnum = attrList.length;
                    var newattrnum = addGoodsList.length;
                    //待加商品列表遍历
                    for (var k = 0; k < newattrnum; k++) {
                        var bexist = false;
                        //待加商品明细与购物车商品明细比较（注 购物车商品缓存 使用2层结构）
                        for (var j = 0; j < attrnum; j++) {
                            if (addGoodsList[k].name == attrList[j].name) {
                                bexist = true;
                                //新添加的商品数量加上以前缓存的数量
                                attrList[j].num = kdShare.calcAdd(Number(attrList[j].num), Number(addGoodsList[k].num));
                                break;
                            }
                        }
                        if (!bexist) {
                            attrList.push(addGoodsList[k]);
                        }
                    }
                    bcheck = true;
                }
            }
            if (!bcheck) {
                goodslistArr.push(addGoods);
            }
        }
        goodslist = JSON.stringify(goodslistArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        reSetAddGoodsList();
        freshGoodsNum();
    }


    //设置批量录入模式是否显示
    function showBatchMode() {
        var btnBatch = $(".addgoods .btnBatch");
        btnBatch.hide();
        if (config.buytype == 'list' || kdAppSet.getUserInfo().identity == "retail") {
            //列表添加购物车进来的不需要批量录入
            return;
        }
        changeInputMode(false);
        var shareData = AddGoods_Api.getData();
        if (shareData.auxType == shareData.attrType.noAttr) {
        } else {
            if (shareData.attrList1.length > 1 || shareData.attrList2.length > 1) {
                btnBatch.show();
                if (btnBatch[0].innerHTML == "返回") {
                    changeInputMode(true);
                }
            }
        }
    }


    //切换批量录入模式
    function changeInputMode(isBatch) {
        var addgoodsbody = viewPage.find("#addgoodsbody");
        var flySumlist = viewPage.find("#flySumlist");
        var batchMode = viewPage.find(".batchMode");
        var imgSrc = $('.addgoods .imgDiv img').attr('src') || 'img/no_img.png';
        $('.batchMode .batchImg').attr('src', imgSrc);

        if (isBatch) {
            batchMode.show();
            addgoodsbody.hide();
            flySumlist.hide();
            AddGoods_Batch.showBatchList(config);
        } else {
            batchMode.hide();
            addgoodsbody.show();
            flySumlist.show();
        }
    }


    function render(configParam) {
        initView();
        config = configParam;
        $("#goodsAttr1").hide();
        $("#goodsAttr2").hide();
        toggleBtn();
        show();
        reSetAddGoodsList();
        $(".divNum .numText2")[0].innerText = 1;
        fillGoodsHead(config.goods);
        AddGoods_Api.getItemAuxInfo(config, showGoodsAttrInfo);
        setPriceVisiable();
    }

    /*
     * 切换按钮组显示
     * */
    function toggleBtn() {
        if (config.buytype == 'list') {
            viewPage.find('.btnok').hide();
            viewPage.find('.btnBatch').hide();
            viewPage.find('.btn-box-list').show();
        }
        else {
            viewPage.find('.btnok').show();
            viewPage.find('.btn-box-list').hide();
        }
    }


    //设置价格信息是否显示
    function setPriceVisiable() {
        if (kdAppSet.getIsShowPrice()) {
            viewPage.find(".divhead .price").show();
        } else {
            viewPage.find(".divhead .price").hide();
        }
    }


    //显示商品辅助属性&&获取单商品原价
    function showGoodsAttrInfo(datalist, configp) {
        if (datalist.auxType == 0) {//datalist.auxType == 0，单积分商品，填充原价
            fillPreprice(datalist);
        }
        AddGoods_Attr.showGoodsAttrInfo(datalist, configp);
        showBatchMode();
    }

    //非单商品，填充原价--马跃
    function fillPreprice(dlist) {
        var price;
        var dlength = dlist.fstrategy.length;
        if (dlength == 0) {
            price = dlist.fmaxprice;
        } else {
            price = dlist.fstrategy[dlength - 1].price;
        }
        viewPage.find('[data-cmd="preprice"]').text( kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price));
    }


    //填充表头界面
    function fillGoodsHead(head) {
        var priceStr = kdAppSet.getPriceStr(head);
        var headhtml = $.String.format(sampleHead, {
            imgurl: head.goodsImg == "" ? imgdefault : head.goodsImg,
            newflag: head.newflag,
            cuxiaoflag: head.cuxiaoflag,
            price: priceStr,
            goodsname: head.goodsName
        });

        goodsHead.innerHTML = headhtml;
        // $(".batchMode").find("#goodsname span")[0].innerHTML = head.goodsName;
        var stockinfo = kdAppSet.getStockStr(head.stocknum, head.unitname);
        var stockmsg = stockinfo.stockStr;
        var stockcolor = stockinfo.color;
        var stockctrl = $(".addgoods .stocknum").find("span");
        stockctrl[0].innerText = stockmsg || '';
        var color = stockcolor.replace("color:", "");
        stockctrl.css("color", color);

        if (head) {//积分显示情况--马跃
            pointShow(head);
        }
    }

    //积分显示
    function pointShow(head) {
        //价格
        var price = viewPage.find('[data-cmd="price"]');
        //orshow
        var orshow = viewPage.find('[data-cmd="orshow"]');
        //积分
        var expoint = viewPage.find('[data-cmd="expoint"]');
        //原价
        var preprice = viewPage.find('[data-cmd="preprice"]');
        //填充积分
        viewPage.find('[data-cmd="point"]').text(head.expoint);
        //仅积分兑换--2016.3.16原价永远显示 不隐藏
        if (head.onlyexpoint == 1) {
            price.hide();
            orshow.hide();
            expoint.show();
            //preprice.show();
        } else {
            //preprice.hide();
            if (head.expoint == 0) {
                price.show();
                orshow.hide();
                expoint.hide()
            } else {
                price.show();
                orshow.show();
                expoint.show();
            }
        }
    }

    //初始化数据
    function reSetAddGoodsList() {
        AddGoods_Attr.reSetAddGoodsList();
        AddGoods_Batch.reSetAddGoodsList();
        changeInputMode(false);
    }

    //刷新购物车数量
    function freshGoodsNum() {
        $('.addgoods .count_tip')[0].innerText = CacheList.getGoodsListCount();
    }

    function show() {
        viewPage.show();
    }

    function showAttr(config) {
        initView();
        setViewSize(config.goods);
        $('#divlistMark').show();
        $('.addgoods .goodsBox').show();
        freshGoodsNum();
        render(config);
    }

    function setViewSize(goods) {
        var btnok = viewPage.find('.divok');
        if (goods.auxcount == 0) {
            viewPage.addClass('addgoods_noAuxTop');
            btnok.addClass('noAuxBottom');
        } else {
            viewPage.removeClass('addgoods_noAuxTop');
            btnok.removeClass('noAuxBottom');
        }
    }

    function hideAttr() {
        initView();
        viewPage.hide();
        $('#divlistMark').hide();
        GoodsList.renderFooter();
    }

    return {
        showAttr: showAttr,
        hideAttr: hideAttr,
        freshGoodsNum: freshGoodsNum
    };

})();
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
/*添加商品到购物车 共用api与数据*/

var AddGoods_Api = (function () {

    var ullist, divList, scroller, config,
    //是否正在调用api
        bloadind,
    //辅助属性数据列表
        dlist,
    //采购清单中的商品
        addGoodsList,
    // 0  无辅助属性  1 组合物料  2 有辅助属性
        attrType = {
            noAttr: 0,
            cmbAttr: 1,
            soleAttr: 2
        },
    //当前商品ID
        curGoodsId,
        splitChar,
        auxType,
    //属性1列表
        attrList1,
    //属性1标题
        attrName1,
    //属性2列表
        attrList2,
    //属性2标题
        attrName2,
    //属性1列表 所有值
        attrList1All,
    //属性2列表 所有值
        attrList2All;

    //初始化视图
    function initView(param) {
        divList = document.getElementById('addgoodsbody');
        scroller = param;
        ullist = $(divList.firstElementChild);
        config = {};
        dlist = {};
        addGoodsList = [];//采购清单列表
        splitChar = "*|*";
        auxType = -1;
        attrName1 = ""; //属性1标题
        attrList1 = []; //属性1列表
        attrName2 = "";//属性2标题
        attrList2 = [];//属性2列表
        attrList1All = []; //属性1列表 所有值
        attrList2All = []; //属性2列表 所有值
        curGoodsId = 0;
    }

    //获取商品辅助属性
    function getItemAuxInfo(configp, fn) {
        config = configp;
        if (curGoodsId == config.goods.itemid) {
            fn & fn(dlist, config);
            return;
        }
        reSetAddGoodsList();
        addLoadingHint();
        bloadind = true;
        Lib.API.get('GetItemAuxInfo', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { Itemid: config.goods.itemid }
        }, function (data) {
            bloadind = false;
            dlist = data || {};
            setData(dlist);
            curGoodsId = config.goods.itemid;
            fn & fn(dlist, config);
            removeLoadingHint();
        }, function (code, msg) {
            bloadind = false;
            removeLoadingHint();
            ullist.append('<li class="hintflag">' + msg + '</li>');
            scroller.refresh();
        }, function () {
            bloadind = false;
            removeLoadingHint();
            ullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
            scroller.refresh();
        }, "");
    }

    //获取某个商品的积分兑换信息
    function getItemPoint(itemid) {
        var expoint = dlist.expoint || 0;
        var onlyexpoint = dlist.onlyexpoint || 0;
        if (auxType == attrType.cmbAttr) {
            //如果是合并商品
            var auxlist = dlist.auxlist || [];
            for (var i = 0, len = auxlist.length; i < len; i++) {
                if (itemid == auxlist[i].fitemid) {
                    expoint = auxlist[i].expoint || 0;
                    onlyexpoint = auxlist[i].onlyexpoint || 0;
                    break;
                }
            }
        }
        return {
            expoint: expoint,
            onlyexpoint: onlyexpoint
        };
    }

    //获取商品辅助属性详情 比如 库存信息 图片 单位
    function getGoodsAuxDetail(itemid, auxid, fn) {
        var flagid = itemid;
        if (auxid) {
            flagid = itemid + auxid;
        }
        fn & fn();
        Lib.API.get('GetItemDetailInfo', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { Itemid: itemid, Auxid: auxid }
        }, function (data) {
            var auxlist = data || [];
            fn & fn(auxlist, flagid);
        }, null, null, flagid);
    }

    //移除加载中的提示
    function removeLoadingHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }

    //添加加载中的提示
    function addLoadingHint() {
        ullist.children().filter('.hintflag').remove();
        ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
    }

    function apiLoading() {
        return bloadind;
    }

    function reSetAddGoodsList() {
        attrList1 = [];
        attrName1 = "";
        attrList2 = [];
        attrName2 = "";
        attrList1All = [];
        attrList2All = [];
    }


    function addAttrList(attrList, keyv) {
        var inum = attrList.length;
        var bexist = false;
        for (var i = 0; i < inum; i++) {
            if (attrList[i].name == keyv) {
                bexist = true;
                break;
            }
        }
        if (!bexist) {
            attrList.push({ name: keyv });
        }
    }

    //按名字排序
    function NameAsc(x, y) {
        if (x.name > y.name) {
            return 1;
        } else if (x.name < y.name) {
            return -1;
        }
        return 0;
    }

    function setData(datalist) {

        auxType = datalist.auxType; // 0  无辅助属性  1 组合物料  2 有辅助属性
        var auxName = datalist.auxName || [];
        if (auxName.length == 1) {
            attrName1 = auxName[0].FName;
        } else if (auxName.length == 2) {
            attrName1 = auxName[0].FName;
            attrName2 = auxName[1].FName;
        }
        if (auxType == attrType.noAttr) {
        } else if (auxType == attrType.cmbAttr) {//合并商品
            var auxlist = datalist.auxlist || [];
            var inum = auxlist.length;
            for (var i = 0; i < inum; i++) {
                var item = auxlist[i];
                addAttrList(attrList1, item.fnameaftermerge);
                //批量录入缓存用
                attrList1All.push(item.fnameaftermerge);
            }
        } else if (auxType == attrType.soleAttr) {//商品有辅助属性
            //拆分处理 辅助属性
            var auxName = datalist.auxName || [];
            var auxUsed = datalist.auxUsed || [];
            var auxTypeNum = auxName.length;
            var iauxNum = auxUsed.length;
            for (var i = 0; i < iauxNum; i++) {
                var item = auxUsed[i];
                if (auxTypeNum == 1) {
                    //有1个辅助属性
                    addAttrList(attrList1, item.fvalue);
                    attrList1All.push(item.fvalue);
                } else {
                    //有2个以上辅助属性
                    var fattrStr = item.fvalue;
                    var attrlist = fattrStr.split(splitChar);
                    var jnum = attrlist.length;
                    addAttrList(attrList1, attrlist[0]);
                    attrList1All.push(attrlist[0]);
                    var attrStr2 = "";
                    for (var j = 1; j < jnum; j++) {
                        if (attrStr2 == "") {
                            attrStr2 = attrlist[j];
                        } else {
                            attrStr2 = attrStr2 + "/" + attrlist[j];
                        }
                    }
                    addAttrList(attrList2, attrStr2);
                    attrList2All.push(attrStr2);
                }
            }
        }

        if (attrList1.length > 1) {
            attrList1.sort(NameAsc);
        }
        if (attrList2.length > 1) {
            attrList2.sort(NameAsc);
        }
    }

    //获取商品原价
    function getOldPrice(datakey) {
        var Price = config.goods.price;
        if (auxType > 0) {//非单商品
            var dataKey = datakey;
            if (dataKey != "") {
                //获取某个辅助属性的价格策略
                var priceList = getKeyValueInfo(3, dataKey);
                var auxPrice = getOldPriceByStrategy(priceList);
                if (auxPrice >= 0) {
                    return auxPrice;
                }
            }
        }

        //获取某个商品的价格策略
        var priceList2 = dlist || [];
        var goodsPrice = getOldPriceByStrategy(priceList2);
        if (goodsPrice >= 0) {
            return goodsPrice;
        }
        return Price;
    }

    //根据对应商品获取原价
    function getOldPriceByStrategy(priceList) {
        var oldrice;
        var inum = priceList.fstrategy.length;
        if (inum == 0) {
            oldrice = priceList.fmaxprice;
        } else {
            oldrice = priceList.fstrategy[inum - 1].price;
        }
        return oldrice;
    }




    //如果有针对辅助属性，设置价格策略，则获取价格信息
    function getGoodsAuxPrice(datakey, attrnum) {
        var Price = config.goods.price;
        var attrNum = attrnum;
        if (auxType > 0) {
            var dataKey = datakey;
            if (dataKey != "") {
                //获取某个辅助属性的价格策略
                var priceList = getKeyValueInfo(2, dataKey);
                var auxPrice = getPriceByStrategy(priceList, attrNum);
                if (auxPrice >= 0) {
                    return auxPrice;
                }
            }
        }

        //获取某个商品的价格策略
        var priceList2 = dlist.fstrategy || [];
        var goodsPrice = getPriceByStrategy(priceList2, attrNum);
        if (goodsPrice >= 0) {
            return goodsPrice;
        }
        return Price;
    }


    //根据关键字 获取选中的辅助属性 各种关键值
    function getKeyValueInfo(keyType, dataKey) {
        //keyType 1 辅助属性ID ,  2 辅助属性 价格策略,  keyType  3（马跃）辅助属性商品信息
        if (auxType == attrType.soleAttr) { //有辅助属性
            var inum = attrList1All.length;
            var jnum = attrList2All.length;
            for (var i = 0; i < inum; i++) {
                var cmpv = attrList1All[i];
                if (jnum > 0) {
                    cmpv = cmpv + "/" + attrList2All[i];
                }
                if (dataKey == cmpv) {
                    if (keyType == 1) {
                        return dlist.auxUsed[i].fitemid;
                    } else if (keyType == 2) {
                        return dlist.auxUsed[i].fstrategy || [];
                    } else if (keyType == 3) {
                        return dlist.auxUsed[i] || [];
                    }
                }
            }
        } else if (auxType == attrType.cmbAttr) {  //合并商品
            var auxlist = dlist.auxlist;
            var knum = auxlist.length;
            for (var k = 0; k < knum; k++) {
                if (dataKey == auxlist[k].fnameaftermerge) {
                    if (keyType == 1) {
                        return auxlist[k].fitemid;
                    } else if (keyType == 2) {
                        return auxlist[k].fstrategy || [];
                    } else if (keyType == 3) {
                        return auxlist[k] || [];
                    }
                }
            }
        }
        return 0;
    }


    //根据价格策略，以及数量 返回单价
    function getPriceByStrategy(priceList, num) {
        var inum = priceList.length;
        for (var i = 0; i < inum; i++) {
            var min = priceList[i].min || 0;
            if (priceList[i].max != undefined) {
                max = priceList[i].max;
            } else {
                max = 1000000000;
            }
            if (num >= min && num <= max) {
                return priceList[i].price;
            }
        }
        return -1;
    }


    //加入购物清单 数据缓存
    function addGoodsDataToCache(dataKey, numAdd, price, bAnimation) {
        var inum = addGoodsList.length - 1;
        var isum = 0;
        var isummoney = 0;
        var itmp = 0;
        for (var i = inum; i >= 0; i--) {
            if (addGoodsList[i].name == dataKey) {
                addGoodsList.splice(i, 1);
            } else {
                isum = isum + Number(addGoodsList[i].num);
                itmp = kdShare.calcMul(Number(addGoodsList[i].num), Number(addGoodsList[i].price));
                isummoney = kdShare.calcAdd(isummoney, itmp);
            }
        }

        isum = isum + numAdd;
        isummoney = kdShare.calcAdd(isummoney, kdShare.calcMul(numAdd, price));
        if (numAdd > 0) {
            var auxid = 0;
            var itemid = 0;
            if (auxType == attrType.soleAttr) {//有辅助属性
                auxid = getKeyid(dataKey);
            } else if (auxType == attrType.cmbAttr) {
                itemid = getKeyid(dataKey);
            }
            var pointsInfo = getItemPoint(itemid);
            var addObj = {
                name: dataKey, num: numAdd, fauxid: auxid, fitemid: itemid,
                price: price, expoint: pointsInfo.expoint, onlyexpoint: pointsInfo.onlyexpoint
            };
            addGoodsList.push(addObj);
        }
        return {
            numAdd: numAdd,
            isum: isum,
            isummoney: isummoney
        }
    }

    //根据关键字 获取选中的 辅助属性ID
    function getKeyid(dataKey) {
        return getKeyValueInfo(1, dataKey);
    }

    return {
        initView: initView,
        getItemAuxInfo: getItemAuxInfo,
        getGoodsAuxDetail: getGoodsAuxDetail,
        //reSetAddGoodsList: reSetAddGoodsList,
        getGoodsAuxPrice: getGoodsAuxPrice,
        getKeyid: getKeyid,
        addGoodsDataToCache: addGoodsDataToCache,
        apiLoading: apiLoading,
        getOldPrice: getOldPrice,//获取原价
        getDatalist: function () {
            return dlist;
        },
        getAddGoodsList: function () {
            return addGoodsList;
        },
        getData: function () {
            return {
                auxType: auxType,
                attrType: attrType,
                attrName1: attrName1,
                attrList1: attrList1,
                attrName2: attrName2,
                attrList2: attrList2,
                attrList1All: attrList1All,
                attrList2All: attrList2All
            };
        }
    };

})();
/*添加商品辅助属性勾选*/

var AddGoods_Attr = (function () {

    var auxType, config,
        divList, ul, ullist, scroller,
        goodAttrList1, sampleAttrList1,
        goodAttrList2, sampleAttrList2,
    //属性选中值
        addSelAttr,
        stockNumList,
    //商品辅助属性详情数据集
        dlist,
        addGoodsList,
        shareData,
        attrType,
        attrName1,
        attrList1,
        attrName2,
        attrList2,
        attrList1All,
        attrList2All;

    function initView(param) {
        divList = document.getElementById('addgoodsbody');
        scroller = param;
        ul = divList.firstElementChild;
        ullist = $(ul);
        goodAttrList1 = document.getElementById('goodAttrList1');
        sampleAttrList1 = $.String.between(goodAttrList1.innerHTML, '<!--', '-->');
        goodAttrList2 = document.getElementById('goodAttrList2');
        sampleAttrList2 = $.String.between(goodAttrList2.innerHTML, '<!--', '-->');
        addSelAttr = { attr1: "", attr2: "" }; //属性选中值
        addGoodsList = AddGoods_Api.getAddGoodsList();
        stockNumList = [];
        bindEvents();
    }

    function bindEvents() {
        //辅助属性1选中
        $("#goodAttrList1").delegate('.attr', {
            'click': function () {
                attr1Selected($(this));
            }
        });

        $("#goodAttrList2").delegate('.attr2', {
            'click': function () {
                attr2Selected($(this));
            }
        });


        $(".divNum").delegate("#divNumLeft", {
            'click': function () {
                divNumLeftFunc();
            }
        });

        $(".divNum").delegate("#divNumRight", {
            'click': function () {
                divNumRightFunc();
            }
        });

        $(".divNum").delegate(".numText2", {
            'click': function () {
                var target = this;
                var config = {
                    name: '购买数量',
                    input: target.innerText,
                    hint: "无效数据!",
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.innerText = 1;
                        }
                        else {
                            target.innerText = kvalue;
                        }
                        updateGoodsAuxPrice();
                        freshSumInfoNoAttr();
                    },
                    hidefn: function () {
                    }
                };
                kdShare.keyBoard.autoshow(config);
            }
        });
    }

    //数字键 减号函数
    function divNumLeftFunc() {
        var numInput = $(".divNum .numText2")[0];
        var numAdd = Number(numInput.innerText);
        if (numAdd > 1) {
            numAdd--;
        }
        numInput.innerText = numAdd;
        updateGoodsAuxPrice();
        freshSumInfoNoAttr();
    }

    //数字键 加号函数
    function divNumRightFunc() {
        var numInput = $(".divNum .numText2")[0];
        var numAdd = Number(numInput.innerText);
        numAdd++;
        numInput.innerText = numAdd;
        updateGoodsAuxPrice();
        freshSumInfoNoAttr();
    }

    //加入采购清单
    function addGoodsToList() {
        var bloadind = AddGoods_Api.apiLoading();
        if (bloadind) {
            OptMsg.ShowMsg("数据正在加载中,请稍后...");
            return;
        }
        var dataKey = getAuxDataKey(true);
        if (dataKey != "") {
            return addGoodsDataToList(dataKey);
        }
    }


    //加入购物清单函数处理
    function addGoodsDataToList(dataKey) {
        var numAdd = Number($(".divNum .numText2")[0].innerText);
        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, numAdd);
        var dataAdd = AddGoods_Api.addGoodsDataToCache(dataKey, numAdd, price, true);
        initAttrListInfo();

        if (auxType != 0) {//0 无辅助属性
            $(".addgoods .btnok").css("background", "#FF6427");
            $(".addgoods .selectAttrs").css("display", "none");
            $(".addgoods .selectAttr1").text('');
            $(".addgoods .selectAttr2").text('');
        }
        return true;
    }


    //初始化辅助属性值
    function initAttrListInfo() {
        var goodAttrList1s = $("#goodAttrList1").children();
        goodAttrList1s.removeClass("attrCheck");
        goodAttrList1s.removeClass("attrUnCheck");
        var goodAttrList2s = $("#goodAttrList2").children();
        goodAttrList2s.removeClass("attrCheck");
        goodAttrList2s.removeClass("attrUnCheck");
        addSelAttr = { attr1: "", attr2: "" };
        attrListSelected(attrList1, "");
        attrListSelected(attrList2, "");
        stockNumList = [];
    }

    //获取商品属性共享数据
    function getShareData() {
        shareData = AddGoods_Api.getData();
        attrType = shareData.attrType;
        attrName1 = shareData.attrName1;
        attrList1 = shareData.attrList1;
        attrName2 = shareData.attrName2;
        attrList2 = shareData.attrList2;
        attrList1All = shareData.attrList1All;
        attrList2All = shareData.attrList2All;
    }

    //显示商品的辅助属性
    function showItemAuxInfo(datalist) {
        //获取商品辅助属性值
        getShareData();
        auxType = datalist.auxType; // 0  无辅助属性  1 组合物料  2 有辅助属性
        showBtnGoodsList(auxType);
        var goodsAttr1 = $("#goodsAttr1");
        var goodsAttr2 = $("#goodsAttr2");
        goodsAttr1.hide();
        goodsAttr2.hide();

        if (auxType == attrType.noAttr) {
            freshSumInfoNoAttr();
        } else if (auxType == attrType.cmbAttr) {//合并商品
            goodsAttr1.show();
            goodsAttr1.find("p").text("");
            var attrListHtml = $.Array.keep(attrList1, function (item, index) {
                return $.String.format(sampleAttrList1, {
                    attrname: item.name,
                    attrcheck: item.selected == 1 ? "attrCheck" : "attrUnCheck"
                });
            }).join('');
            goodAttrList1.innerHTML = attrListHtml;
        } else if (auxType == attrType.soleAttr) {//商品有辅助属性
            //拆分处理 辅助属性
            var auxName = datalist.auxName || [];
            var auxTypeNum = auxName.length;
            //显示第1个辅助属性
            goodsAttr1.show();
            attrName1 = auxName[0].FName;
            goodsAttr1.find("p").text(attrName1);
            var attrList1Html = $.Array.keep(attrList1, function (item, index) {
                return $.String.format(sampleAttrList1, {
                    attrname: item.name,
                    attrcheck: item.selected == 1 ? "attrCheck" : "attrUnCheck"
                });
            }).join('');
            goodAttrList1.innerHTML = attrList1Html;
            if (auxTypeNum >= 2) {
                goodsAttr2.show();
                attrName2 = auxName[1].FName;
                if (auxTypeNum > 2) {
                    //若是3个辅助属性以上 则合并后面的辅助属性为1个
                    attrName2 = "";
                    for (var k = 1; k < auxTypeNum; k++) {
                        if (attrName2 == "") {
                            attrName2 = auxName[k].FName;
                        } else {
                            attrName2 = attrName2 + "/" + auxName[k].FName;
                        }
                    }
                }
                //显示第2个辅助属性
                goodsAttr2.find("p").text(attrName2);
                freshAttrList2(attrList2);
            }
        }
        autoSelGoods();
        scroller.refresh();
    }


    //刷新显示辅助属性2 列表
    function freshAttrList2(list) {
        var attrList2Html = $.Array.keep(list, function (item, index) {
            return $.String.format(sampleAttrList2, {
                attrname: item.name,
                attrcheck: item.selected == 1 ? "attrCheck" : "attrUnCheck"
            });
        }).join('');
        goodAttrList2.innerHTML = attrList2Html;
    }

    //获取被选中的辅助属性
    function getSelectedAttr(list) {
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected == 1) {
                return list[i].name;
            }
        }
        return "";
    }

    //辅助属性被选中时，处理函数
    function getGoodsAuxDetailInfo(attrName) {

        var fparentid = config.goods.itemid;
        var auxid = 0;
        if (auxType == attrType.noAttr) {
        } else if (auxType == attrType.cmbAttr) {
            auxid = AddGoods_Api.getKeyid(attrName);
            AddGoods_Api.getGoodsAuxDetail(fparentid, auxid, freshAuxInfo);
        } else if (auxType == attrType.soleAttr) {
            var attrname1 = "";
            var attrname2 = "";
            var attrNum = attrList2All.length;
            if (attrNum == 0) { //只有1个辅助属性
                attrname1 = getSelectedAttr(attrList1);
                auxid = AddGoods_Api.getKeyid(attrname1);
                AddGoods_Api.getGoodsAuxDetail(fparentid, auxid, freshAuxInfo);
            } else {
                attrname1 = getSelectedAttr(attrList1);
                attrname2 = getSelectedAttr(attrList2);
                if (attrname1 != "" && attrname2 != "") {
                    attrName = attrname1 + "/" + attrname2;
                    auxid = AddGoods_Api.getKeyid(attrName);
                    AddGoods_Api.getGoodsAuxDetail(fparentid, auxid, freshAuxInfo);
                }
            }
        }
        updateGoodsAuxPrice();
    }


    //如果有针对辅助属性，设置价格策略，则更新对应的价格信息
    function updateGoodsAuxPrice() {
        var dataKey = getAuxDataKey(false);
        if (dataKey == "") {
            return;
        }
        var attrNum = Number($(".divNum .numText2")[0].innerText);
        var price = AddGoods_Api.getGoodsAuxPrice(dataKey, attrNum);
        var oldPrice = AddGoods_Api.getOldPrice(dataKey, attrNum);//马跃

        $("#view-addgoods").find('[data-cmd="price"]').text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price));
        if (auxType != 0) {//非单商品，修改原价 积分--马跃
            $("#view-addgoods").find('[data-cmd="preprice"]').text( kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(oldPrice));
        }

    }

    //根据选中辅助属性 更新库存数量 以及图片信息显示
    function freshAuxInfo(auxlist, flagid) {

        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        if (auxlist) {
            if (auxlist.FImageUrl == "") {
                auxlist.FImageUrl = config.goods.goodsImg;
            }

            var stockinfo = kdAppSet.getStockStr(parseInt(auxlist.FQty), config.goods.unitname);
            var stockmsg = stockinfo.stockStr;
            var stockcolor = stockinfo.color;
            var stockctrl = $(".addgoods .stocknum").find("span");
            stockctrl[0].innerText = stockmsg;
            var color = stockcolor.replace("color:", "");
            stockctrl.css("color", color);
            $(".addgoods #addgoodshead").find("img")[0].src = auxlist.FImageUrl != '' ? (imgMode ? kdAppSet.getImgThumbnail(auxlist.FImageUrl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault);
        } else {
            $(".addgoods .stocknum").find("span")[0].innerText = "";
            $(".addgoods #addgoodshead").find("img")[0].src = imgMode ? 'img/loading.png' : noimgModeDefault;
        }

        if (auxlist) {//接口访问成功，积分情况显示隐藏--马跃
            pointShow(auxlist)
        }

    }

    //积分显示
    function pointShow(auxlist) {
        //价格
        var price = $("#view-addgoods").find('[data-cmd="price"]');
        //orshow
        var orshow = $("#view-addgoods").find('[data-cmd="orshow"]');
        //积分
        var expoint = $("#view-addgoods").find('[data-cmd="expoint"]');
        //原价
        var preprice = $("#view-addgoods").find('[data-cmd="preprice"]');

        //填充积分
        $("#view-addgoods").find('[data-cmd="point"]').text(auxlist.expoint);
        //仅积分兑换
        if (auxlist.onlyexpoint == 1) {
            price.hide();
            orshow.hide();
            expoint.show();
            //preprice.show();
        } else {
            //preprice.hide();
            if (auxlist.expoint == 0) {
                price.show();
                orshow.hide();
                expoint.hide()
            } else {
                price.show();
                orshow.show();
                expoint.show();
            }
        }
    }

    //自动选中辅助属性值
    function autoSelGoods() {
        //只有一个属性值时 自动选中
        if (auxType == attrType.cmbAttr) {
            if (attrList1.length >= 1) {
                var item = $($("#goodAttrList1 .attr")[0]);
                attr1Selected(item);
            }
        } else if (auxType == attrType.soleAttr) {
            if (attrList1.length >= 1 && attrList2.length >= 1) {
                var item = $($("#goodAttrList1 .attr")[0]);
                attr1Selected(item);
                var item2 = $($("#goodAttrList2 .attr2")[0]);
                attr2Selected(item2);
            } else if (attrList1.length >= 1 && attrList2.length == 0) {
                var item = $($("#goodAttrList1 .attr")[0]);
                attr1Selected(item);
            }
        }
    }

    //辅助属性1 选中
    function attr1Selected(selItem) {
        attrChecked(selItem, 1);
        var addgoods = $(".addgoods");
        addgoods.find(".selectAttrs").css("display", "block");
        addgoods.find(".selectAttr1").text('"' + selItem.text() + '"');
        var attrName = selItem.text();
        attrClick(attrName);
        addSelAttr.attr2 = "";
        getGoodsAuxDetailInfo(attrName);
    }

    //辅助属性2 选中
    function attr2Selected(selItem) {
        attrChecked(selItem, 2);
        var addgoods = $(".addgoods");
        addgoods.find(".selectAttrs").css("display", "block");
        addgoods.find(".selectAttr2").text('"' + selItem.text() + '"');
        getGoodsAuxDetailInfo();
    }

    //属性选中 标记
    function attrClick(attrName) {
        if (auxType == attrType.soleAttr) {
            var auxName = dlist.auxName || [];
            var auxTypeNum = auxName.length;
            if (auxTypeNum >= 2) { //有2个辅助属性以上
                var keyvList = [];
                var inum = attrList1All.length;
                //过滤出 存在的辅助属性组合
                for (var i = 0; i < inum; i++) {
                    if (attrName == attrList1All[i]) {
                        keyvList.push(attrList2All[i]);
                    }
                }
                //刷新辅助属性列表2
                var newlist2 = getAttrList2(keyvList);
                freshAttrList2(newlist2);
            }
        }
    }

    //判断之前被选中的 辅助属性2 是否还在新列表中
    function getAttrList2(list) {
        var ikeynum = list.length;
        var jnum = attrList2.length;
        var newlist = [];
        //被选中的辅助属性
        var checkName = "";
        for (var i = 0; i < ikeynum; i++) {
            var item = { name: list[i] };
            for (var j = 0; j < jnum; j++) {
                if (attrList2[j].selected == 1 && list[i] == attrList2[j].name) {
                    item.selected = 1;
                    checkName = attrList2[j].name;
                }
            }
            newlist.push(item);
        }
        attrListSelected(attrList2, checkName);
        if (newlist.length > 1) {
            newlist.sort(NameAsc);
        }
        return newlist;
    }

    //按名字排序
    function NameAsc(x, y) {
        if (x.name > y.name) {
            return 1;
        } else if (x.name < y.name) {
            return -1;
        }
    }

    //辅助属性 列表属性选中
    function attrListSelected(list, attrname) {
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (attrname != "" && list[i].name == attrname) {
                list[i].selected = 1;
            } else {
                list[i].selected = 0;
            }
        }
    }


    //属性选中 css设置,type 1 表示 列表1， 2 表示 列表2
    function attrChecked(attrCtrl, type) {
        attrCtrl.siblings().removeClass("attrCheck");
        attrCtrl.siblings().addClass("attrUnCheck");
        attrCtrl.removeClass("attrUnCheck");
        attrCtrl.addClass("attrCheck");
        var attrname = attrCtrl[0].innerText;
        var list = attrList1;
        if (type == 2) {
            list = attrList2;
        }
        attrListSelected(list, attrname);
    }

    //是否显示加入购物清单
    function showBtnGoodsList(auxtype) {
        /*        //auxtype  0  无辅助属性  1 组合物料  2 有辅助属性
         var addgoods = $(".addgoods");
         var btnAddGoods = addgoods.find("#btnAddGoods");
         var sumlist = addgoods.find("#flySumlist");
         if (auxtype == attrType.noAttr) {
         btnAddGoods.hide();
         sumlist.hide();
         addgoods.find(".btnok").css("background", "#FF6427");
         addgoods.find(".divbody").css({"bottom": "50px"});
         } else {
         btnAddGoods.show();
         sumlist.show();
         addgoods.find(".btnok").css("background", "#aaaaaa");
         addgoods.find(".divbody").css({"bottom": "90px"});
         }*/
    }

    //在没有辅助属性时，打开界面时，汇总信息要自动计算更新
    function freshSumInfoNoAttr() {
        /*        if (auxType == attrType.noAttr) {
         var dataKey = getAuxDataKey(false);
         if (dataKey == "") {
         return;
         }
         var attrNum = Number($(".divNum .numText2")[0].innerText);
         var price = AddGoods_Api.getGoodsAuxPrice(dataKey, attrNum);
         var ctrlp = $(".addgoods .sumlist");
         ctrlp.find("#sum_num").text(attrNum);
         ctrlp.find("#sum_money").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(attrNum, price)));
         $(".addgoods .divhead .price ")[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price);
         }*/
    }

    //获取选中的辅助属性值 , bhint 是否提示选取辅助属性
    function getAuxDataKey(bhint) {
        var dataKey = "";
        var attrNum = 0;
        if (attrList1.length > 0) {
            attrNum += 1;
        }
        if (attrList2.length > 0) {
            attrNum += 1;
        }
        if (!checkSelInfo(attrNum, bhint)) {
            return dataKey;
        }
        switch (attrNum) {
            case 0:
                dataKey = config.goods.goodsName;
                break;
            case 1:
                dataKey = addSelAttr.attr1;
                break;
            case 2:
                dataKey = addSelAttr.attr1 + "/" + addSelAttr.attr2;
                break;
        }
        return dataKey;
    }

    //获取被选中的辅助属性值
    function getAttrNameSelected(list) {
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            if (list[i].selected == 1) {
                return list[i].name;
            }
        }
        return "";
    }

    //辅助属性 未选择提醒
    function checkSelInfo(auxtype, bhint) {
        switch (auxtype) {
            case attrType.noAttr:
                break;
            case attrType.cmbAttr:
                addSelAttr.attr1 = getAttrNameSelected(attrList1);
                if (addSelAttr.attr1 == "") {
                    var hintstr = attrName1;
                    if (hintstr == "") {
                        hintstr = " 属性值";
                    }
                    if (bhint) {
                        OptMsg.ShowMsg('请选择 ' + hintstr);
                    }
                    return false;
                }
                break;
            case attrType.soleAttr:
                addSelAttr.attr1 = getAttrNameSelected(attrList1);
                if (addSelAttr.attr1 == "") {
                    var hintstr = attrName1;
                    if (hintstr == "") {
                        hintstr = " 属性值";
                    }
                    if (bhint) {
                        OptMsg.ShowMsg('请选择 ' + hintstr);
                    }
                    return false;
                }
                addSelAttr.attr2 = getAttrNameSelected(attrList2);
                if (addSelAttr.attr2 == "") {
                    var hintstr = attrName2;
                    if (hintstr == "") {
                        hintstr = " 属性值";
                    }
                    if (bhint) {
                        OptMsg.ShowMsg('请选择 ' + hintstr);
                    }
                    return false;
                }
                break;
        }
        return true;
    }

    //显示商品的辅助属性
    function showGoodsAttrInfo(datalist, configp) {
        config = configp;
        dlist = AddGoods_Api.getDatalist();
        addGoodsList = AddGoods_Api.getAddGoodsList();
        showItemAuxInfo(datalist);
    }

    function reSetAddGoodsList() {
        addSelAttr = { attr1: "", attr2: "" };
        addGoodsList.length = 0;
    }

    return {
        initView: initView,
        showGoodsAttrInfo: showGoodsAttrInfo,
        addGoodsToList: addGoodsToList,
        reSetAddGoodsList: reSetAddGoodsList
    };

})();
/*商品批量录入*/

var AddGoods_Batch = (function () {
    var
        batchUlList, scrollerBatchList, sampleBatch, batchListData, screenWidth,
        addGoodsList,
        config,
        shareData,
        attrName1,
        attrName2,
        attrList1All,
        attrList2All;

    function initView() {
        var batchUlListdiv = document.getElementById('batchUlListdiv');
        scrollerBatchList = Lib.Scroller.create(batchUlListdiv);
        batchUlList = $("#view-addgoods").find(".batchUlList");
        sampleBatch = $.String.between(batchUlList[0].innerHTML, '<!--', '-->');
        screenWidth = $(window).width();
        if (kdAppSet.isPcBrower()) {
            if (screenWidth > 640) {
                screenWidth = 640;
            }
        }
        config = {};
        addGoodsList = AddGoods_Api.getAddGoodsList();
        bindEvents();
        $('.addgoods .close img').attr('src','img/close.png');
    }

    //初始化数据集
    function reSetAddGoodsList() {
        batchListData = [];
        scrollerBatchList.scrollTo(0, 0, 500);
        batchUlList.empty();
        scrollerBatchList.refresh();
    }


    function bindEvents() {

        if (kdAppSet.isPcBrower()) {
            // PC端输入框无效,将事件添加到其父框
            //批量录入列表  输入框
            $(".batchUlList").delegate(".num", {
                'click': function () {
                    dealBatchNumInput($(this).find('#numInput'));
                }
            });

        } else {
            //批量录入列表  输入框
            $(".batchUlList").delegate("#numInput", {
                'touchstart': function () {
                    dealBatchNumInput($(this));
                }
            });
        }

        $(batchUlList).delegate('li', {
            'touchstart': function (event) {
                if (event.target.id == "numInput") {
                    return;
                }
                $(this).css('background', '#d9dadb');
            },
            'touchend': function (event) {
                if (event.target.id == "numInput") {
                    return;
                }
                $(this).css('background', '#fff');
            }
        });

    }


    //处理批量录入
    function dealBatchNumInput(objclick) {

        var target = objclick;
        var iindex = Number(objclick.attr("index"));
        var attrName = batchListData[iindex].attr1;
        if (batchListData[iindex].attr2) {
            attrName = attrName + "/" + batchListData[iindex].attr2;
        }

        var config = {
            name: attrName,
            input: target.val(),
            allowZero: true,
            fn: function (kvalue, index) {
                if (kvalue == '' || kvalue == 0) {
                    target.val("");
                    batchListData[iindex].num = 0;
                }
                else {
                    target.val(kvalue);
                    batchListData[iindex].num = Number(kvalue);
                }
                var dataKey = attrName;
                var price = AddGoods_Api.getGoodsAuxPrice(dataKey, batchListData[iindex].num);
                //显示金额而不是单价。当初量更改时重新计算金额
                batchUlList.find('li[index=' + iindex + ']').find(".price")[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(price, batchListData[iindex].num));
                batchListData[iindex].price = price;
                AddGoods_Api.addGoodsDataToCache(dataKey, batchListData[iindex].num, price);
                if (addGoodsList.length > 0) {
                    $(".addgoods .btnok").css("background", "#FF6427");
                } else {
                    $(".addgoods .btnok").css("background", "#aaaaaa");
                }
                calcBatchSumInfo();
            },
            hidefn: function () {
            }
        };
        kdShare.keyBoard.autoshow(config);
    }


    //获取商品属性共享数据
    function getShareData() {
        shareData = AddGoods_Api.getData();
        attrName1 = shareData.attrName1;
        attrName2 = shareData.attrName2;
        attrList1All = shareData.attrList1All;
        attrList2All = shareData.attrList2All;
    }


    //获取购物清单中的数据
    function getCacheData(dataKey) {
        var inum = addGoodsList.length;
        for (var i = 0; i < inum; i++) {
            if (addGoodsList[i].name == dataKey) {
                return addGoodsList[i];
            }
        }
    }


    //构造批量录入界面
    function showBatchList(configp) {
        config = configp;
        $('.addgoods .batchMode .goodsname').find('span')[0].innerHTML = configp.goods.goodsName;
        getShareData();
        getBatchListData();
        var listAttr = getBatchlistAttr();
        var lihead = listAttr.lihead;
        var attrstrSample = listAttr.liAttr;
        var htmlList = [];
        $('.addgoods .batchMode .itemHead')[0].innerHTML = lihead;
        batchUlList.empty();

        var inum = batchListData.length;
        for (var i = 0; i < inum; i++) {
            var item = batchListData[i];
            var attrstr = $.String.format(attrstrSample, {attr1: item.attr1, attr2: item.attr2});
            var listr = $.String.format(sampleBatch, {
                index: i,
                attrinfo: attrstr,
                price: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(item.price, item.num)), //使用总金额而不是单价
                num: item.num
            });
            htmlList.push(listr);
        }
        var htmlStr = htmlList.join("");
        batchUlList.append(htmlStr);

        //根据屏幕宽度 动态计算列宽

        var widthleft = screenWidth - 80 - 75 - 5; //5 右边边框 80 金额  75 数量
        if (!kdAppSet.getIsShowPrice()) {
            widthleft = widthleft + 40; //如果单价隐藏
        }
        var iwidth = widthleft + "px";
        $('.addgoods .batchMode').find(".attrli").css({width: iwidth});
        if (!kdAppSet.getIsShowPrice()) {
            $('.addgoods .batchMode').find(".price").css({"visibility": "hidden"});
        }
        calcBatchSumInfo();
        scrollerBatchList.refresh();
    }


    // 在批量模式中显示合计信息
    function calcBatchSumInfo() {
        var inum = addGoodsList.length;
        var isum = 0;
        var isummoney = 0;
        for (var i = 0; i < inum; i++) {
            isum = isum + Number(addGoodsList[i].num);
            isummoney = isummoney + Number(addGoodsList[i].num) * Number(addGoodsList[i].price);
        }
        var sumDiv = $('.batchMode .sumDiv');
        sumDiv.find('.price')[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(isummoney);
        sumDiv.find('.num')[0].innerHTML = isum;
    }


    //获取批量录入数据
    function getBatchListData() {

        batchListData = [];
        var inum = attrList1All.length;
        var jnum = attrList2All.length;
        var price = config.goods.price;
        var num = "";
        var dataKey = "";

        for (var i = 0; i < inum; i++) {
            var item = {attr1: attrList1All[i]};
            if (jnum > 0) {
                item.attr2 = attrList2All[i];
                dataKey = attrList1All[i] + "/" + attrList2All[i];
            } else {
                dataKey = attrList1All[i];
            }
            var cdata = getCacheData(dataKey);

            if (cdata) {
                price = cdata.price;
                num = cdata.num;
            } else {
                price = config.goods.price;
                num = "";
            }
            item.price = price;
            item.num = num;
            batchListData.push(item);
        }
        if (batchListData.length > 1) {
            batchListData.sort(NameAsc);
        }
    }

    //按名字排序
    function NameAsc(x, y) {
        if (x.attr1 > y.attr1) {
            return 1;
        } else if (x.attr1 < y.attr1) {
            return -1;
        } else if (x.attr1 == y.attr1) {
            if (x.attr2 > y.attr2) {
                return 1;
            } else if (x.attr2 < y.attr2) {
                return -1;
            }
        }
    }

    //构造批量录入 列表动态部分
    function getBatchlistAttr() {
        var headstr = '';
        var liAttr = '';
        var attrWidth = "";
        if (attrList2All.length == 0) {
            attrWidth = "width:100%";
        }

        var attrName1Str=attrName1 || '属性';
        if (attrList1All.length > 0) {
            headstr = '<div style=' + attrWidth + '>' + attrName1Str + '</div>';
            liAttr = '<div style=' + attrWidth + '>{attr1}</div>';
        }

        if (attrList2All.length > 0) {
            headstr = headstr + '<div style=' + attrWidth + '>' + attrName2 + '</div>';
            liAttr = liAttr + '<div style=' + attrWidth + '>{attr2}</div>';
        }

        var lihead = '<div class="attrli">' + headstr + '</div>' +
            ' <div class="price attrHead">金额</div><div class="num">数量</div>';

        return {
            lihead: lihead,
            liAttr: liAttr
        };
    }


    return {
        initView: initView,
        reSetAddGoodsList: reSetAddGoodsList,
        showBatchList: showBatchList
    };

})();
/*购物车列表*/

var CacheList = (function () {

    var div , listitemarea, goodsitemlist, samples;
    var scroller ,
    //购物车商品列表
        goodsListArr,
    //是否正在调用接口 1 正在调用 0 调用结束 2调用结束并且出错
        bloadind,
    //商品价格策略
        dlist,
        config,
        editBillId,
        copyBillId,
    //获取单价的时间标示
        priceItemStr,
        pricetime,
        apitime,
    //相隔多久再次获取价格
        apiTime,
        hasInit,
    //是否是零售用户
        isRetail,
        privilegeInfo;

    //刷新购物车商品数
    MiniQuery.Event.bind(window, {
        'freshListBoxCount': function () {
            freshListBoxCount();
        }
    });

    //刷新购物车列表 处理库存不足
    MiniQuery.Event.bind(window, {
        'freshCacheListInfo': function () {
            getGoodsData();
        }
    });


    //编辑商品清单
    MiniQuery.Event.bind(window, {
        'editCacheListInfo': function (billinfo) {
            initView();
            //编辑订单商品
            editBillId = billinfo.editBillId || 0;
            //编辑订单时要重新获取价格
            pricetime = 0;
            copyBillId = 0;
        }
    });

    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view-itemlist');
            listitemarea = document.getElementById('list-item-buy');
            scroller = Lib.Scroller.create(listitemarea);
            goodsitemlist = document.getElementById('goodsitemlist');
            samples = $.String.getTemplates(div.innerHTML, [
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
            priceItemStr = '';
            goodsListArr = [];
            dlist = [];
            editBillId = 0;
            copyBillId = 0;
            pricetime = 0;
            //默认间隔5分钟获取一次
            apiTime = 300;
            isRetail = (kdAppSet.getUserInfo().identity == 'retail');
            bindEvents();
            if (!kdAppSet.isPcBrower() && !kdShare.is_weixinbrower() && !kdAppSet.getAppParam().isdebug) {
                $('#ordersubmit').hide();
            }
            hasInit = true;
        }
    }

    //获取商品id 列表
    function getItemidStr() {
        var inum = goodsListArr.length;
        var itemlist = [];
        var itemstr = "";
        for (var i = 0; i < inum; i++) {
            if (goodsListArr[i].auxtype == 2 || goodsListArr[i].auxtype == 0) {
                itemlist.push(goodsListArr[i].itemid);
            } else {
                var attrList = goodsListArr[i].attrList;
                var jnum = attrList.length;
                for (var j = 0; j < jnum; j++) {
                    itemlist.push(attrList[j].fitemid);
                }
            }
        }
        if (itemlist.length > 0) {
            itemstr = itemlist.toString(",");
        }
        return itemstr;
    }

    //获取商品id 与数量列表，用来判断购物车的东西有没变化
    function getItemidStr2() {
        var inum = goodsListArr.length;
        var itemlist = [];
        var itemstr = "";
        var itemid = '';
        for (var i = 0; i < inum; i++) {
            if (goodsListArr[i].auxtype == 2 || goodsListArr[i].auxtype == 0) {
                itemid = goodsListArr[i].itemid;
            }
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (attrList[j].fitemid != 0) {
                    itemid = attrList[j].fitemid;
                }
                itemlist.push(itemid + '|' + attrList[j].num);
            }
        }
        if (itemlist.length > 0) {
            itemstr = itemlist.toString(",");
        }
        return itemstr;
    }

    //调用接口获取商品价格策略
    function getPriceList() {

        var itemStr = getItemidStr();
        if (itemStr == "") {
            return;
        }
        var needGetPrice = true;
        if (priceItemStr == itemStr) {
            needGetPrice = false;
            freshAllItemPrice(dlist);
        }

        var apiDate = new Date();
        apitime = parseInt(apiDate.getTime() / 1000);
        if (!(apitime - pricetime > apiTime) && !needGetPrice) {
            //不到间隔时间 不获取价格
            return;
        }

        bloadind = 1;
        kdAppSet.setKdLoading(true, "获取价格信息...");
        Lib.API.get('GetItemPriceList', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: {Itemid: itemStr}
        }, function (data, json) {
            privilegeInfo = data.pricemsg || '';
            setPrivilegeInfo(privilegeInfo);
            priceItemStr = itemStr;
            bloadind = 0;
            dlist = data.priceList || {};
            freshAllItemPrice(dlist);

            kdAppSet.setKdLoading(false);
            pricetime = apitime;
        }, function () {
            bloadind = 2;
            kdAppSet.setKdLoading(false);
        }, function () {
            bloadind = 2;
            kdAppSet.setKdLoading(false);
        }, "");
    }

    //根据商品id获取积分兑换信息
    function getPointsByItemid(itemid, pList) {
        var item;
        for (var i in pList) {
            item = pList[i];
            if (itemid == item.fitemid) {
                return {
                    expoint: item.expoint || 0,
                    onlyexpoint: item.onlyexpoint || 0
                }
            }
        }
        return null;
    }

    //刷新商品的积分兑换信息
    function freshAllItemPoints(pointList) {
        var inum = goodsListArr.length;
        for (var i = 0; i < inum; i++) {
            var auxtype = goodsListArr[i].auxtype;
            var itemid = goodsListArr[i].itemid;
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (auxtype == 1) {
                    itemid = attrList[j].fitemid;
                }
                var points = getPointsByItemid(itemid, pointList);
                if (points != null) {
                    goodsListArr[i].attrList[j].expoint = points.expoint;
                    goodsListArr[i].attrList[j].onlyexpoint = points.onlyexpoint;
                }
            }
        }
    }

    /*
     * 设置优惠信息展示
     * */
    function setPrivilegeInfo(value) {
        var $div = $(div).find('.privilegeInfo');
        var confirm = $('.list-item-confirm');
        if (value === "") {
            $div.hide();
            $(listitemarea).css("bottom", "2rem");
            confirm.css("bottom", "1rem");
            return;
        }
        $(listitemarea).css("bottom", "2.6rem");
        confirm.css("bottom", "1.4rem");
        $div.text(value);
        $div.show();
    }

    //刷新所有商品价格
    function freshAllItemPrice(priceList) {
        var inum = goodsListArr.length;
        for (var i = 0; i < inum; i++) {
            var auxtype = goodsListArr[i].auxtype;
            var itemid = goodsListArr[i].itemid;
            var attrList = goodsListArr[i].attrList;
            var jnum = attrList.length;
            for (var j = 0; j < jnum; j++) {
                if (auxtype == 1) {
                    itemid = attrList[j].fitemid;
                }
                var auxid = attrList[j].fauxid;
                var num = attrList[j].num;
                var price = getItemPrice(priceList, itemid, auxid, num);
                if (price != null) {
                    goodsListArr[i].attrList[j].price = price;
                }
            }
        }
        freshAllItemPoints(dlist);
        var goodslist = JSON.stringify(goodsListArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        refreshdata(goodsListArr);
    }

    //根据策略获取商品价格
    function getItemPrice(priceList, itemid, auxid, num) {
        var inum = priceList.length;
        for (var i = 0; i < inum; i++) {
            var item = priceList[i];
            if (itemid == item.fitemid && (item.fauxid == 0 || auxid == item.fauxid)) {
                var priceStrategy = item.fstrategy || [];
                var price = getPriceByStrategy(priceStrategy, num);
                return price;
            }
        }
        return null;
    }

    //根据数量获取商品价格策略
    function getPriceByStrategy(priceList, num) {
        var inum = priceList.length;
        for (var i = 0; i < inum; i++) {
            var min = priceList[i].min || 0;
            if (priceList[i].max != undefined) {
                max = priceList[i].max;
            } else {
                max = 1000000000;
            }
            if (num >= min && num <= max) {
                return  priceList[i].price;
            }
        }
        return 0;
    }


    //获取缓存中的商品列表
    function getGoodsData() {
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist != "") {
            goodsListArr = JSON.parse(goodslist);
            //goodsListArr =goodsListArr.reverse;
            refreshdata(goodsListArr);
        }
        else {
            goodsListArr = [];
            goodsitemlist.innerHTML = "";
        }
        isEmptyBox();
        scroller.refresh();
        freshListBoxCount();
    }

    //判断是否显示 商品列表空页面信息
    function isEmptyBox() {
        if (goodsListArr.length > 0) {
            $("#list-item-buy").show();
            $(".emptybox").hide();
            $(".list-item-confirm").show();
        } else {
            $("#list-item-buy").hide();
            $(".emptybox").show();
            $(".list-item-confirm").hide();
        }
    }


    //处理仅限积分的商品价格
    function dealPointPrice(item) {

    }

    //刷新商品列表数据
    function refreshdata(data, pindex) {

        goodsitemlist.innerHTML = $.Array.map(data, function (item, pindex) {
            var attrList = [];
            var listObj = item.attrList;
            var attrsum = 0;
            var attrsumMoney = 0;
            var itmp;
            for (var attr in listObj) {
                attrList.push(listObj[attr]);
                attrsum = kdShare.calcAdd(attrsum, Number(listObj[attr].num));
                //仅限积分兑换 金额为0
                itmp = (listObj[attr].onlyexpoint == 1 && isRetail) ? 0 : kdShare.calcMul(Number(listObj[attr].num), Number(listObj[attr].price));
                attrsumMoney = kdShare.calcAdd(attrsumMoney, itmp);
            }

            return $.String.format(samples['li'], {
                img: item.img == "" ? "img/no_img.png" : item.img,
                name: item.name,
                unitname: item.unitname,
                index: pindex,
                attrsum: attrsum,
                attrsumMoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(attrsumMoney),
                'rows': $.Array.map(attrList, function (row, index) {
                        return $.String.format(samples['row'], {
                            attrname: row.name,
                            attrprice: kdAppSet.getRmbStr + ((row.onlyexpoint == 1 && isRetail) ? 0 : kdAppSet.formatMoneyStr(row.price)),
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


        if (pindex != undefined) {
            setTimeout(function () {
                var lirow = $("#goodsitemlist").find("[index='" + pindex + "']");
                var btnCtrl = lirow.find(".attrDelete");
                btnCtrl[0].innerText = "完成";
                lirow.find(".attrRowDel").show();
                lirow.find(".attrprice").hide();
                lirow.find(".goodsRowDel").show();
                lirow.find(".itemlist-li-top-center").css({"right": "1.2rem"});
            }, 50);
        }
        scroller && scroller.refresh();
        freshListBoxCount();
        setPriceVisiable();
    }

    //是否显示 商品删除按钮
    function showBtnDelete(attrList, bshow) {
        if (bshow) {
            var attrRowDel = attrList.find(".attrRowDel");
            if (attrRowDel.length > 1) {
                attrRowDel.css("display", "inline-block");
                attrList.find(".attrprice").css("display", "none");
            }
            attrList.find(".goodsRowDel").css("display", "inline-block");
        } else {
            attrList.find(".attrRowDel").css("display", "none");
            if (kdAppSet.getIsShowPrice()) {
                attrList.find(".attrprice").css("display", "inline-block");
            } else {
                attrList.find(".attrprice").css("display", "none");
            }
            attrList.find(".goodsRowDel").css("display", "none");
        }
    }

    //清空缓存中的 商品数据
    function clearCacheGoods() {
        editBillId = 0;
        kdShare.cache.setCacheData("", kdAppSet.getGoodslistFlag());
    }


    function bindEvents() {

        //商品编辑结束 事件处理
        MiniQuery.Event.bind(window, {
            'EditBillFinish': function (data) {
                var billid = data.billid || 0;
                if (billid == 0 || editBillId == billid) {
                    clearCacheGoods();
                }
            }
        });

        //图片点击事件
        $(goodsitemlist).delegate('.itemlist-li-top-left', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).find('img').attr('src'), posi: 0 }]);
                return false;
            }
        });

        //商品列表点击事件  跳到商品详情
        $(goodsitemlist).delegate('.lirow', {
            'click': function () {
                var index = this.getAttribute("index");
                var itemclick = goodsListArr[index];
                var item = {cuxiaoflag: 0, newflag: 0, number: "",
                    img: itemclick.img,
                    itemid: itemclick.itemid,
                    name: itemclick.name,
                    unitid: itemclick.unitid,
                    unitname: itemclick.unitname,
                    num: itemclick.stocknum,
                    price: 0
                };
                MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: item}]);
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

        //商品编辑
        $("#goodsitemlist").delegate(".attrDelete", {
            'click': function () {
                var index = this.getAttribute("index");
                var ctrlP = $("#goodsitemlist li[index=" + index + "]");
                //var ctrlP=$(this).parent().parent();
                if (this.innerText == "编辑") {
                    this.innerText = "完成";
                    showBtnDelete(ctrlP, true);
                    ctrlP.find(".itemlist-li-top-center").css({"right": "1.2rem"});
                } else {
                    this.innerText = "编辑";
                    showBtnDelete(ctrlP, false);
                    ctrlP.find(".itemlist-li-top-center").css({"right": "0.2rem"});
                }
                return true
            },
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            }
        });

        //商品删除
        $("#goodsitemlist").delegate(".goodsRowDel", {
            'click': function (ev) {
                var iindex = this.getAttribute("index");
                var ctrlP = $("#goodsitemlist li[index=" + iindex + "]");
                ctrlP.animate({left: "-6.4rem"}, 300, function () {
                    goodsListArr.splice(iindex, 1);
                    var goodslist = JSON.stringify(goodsListArr);
                    kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
                    refreshdata(goodsListArr);
                    isEmptyBox();
                });
                ev.stopPropagation();
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
        $("#goodsitemlist").delegate(".attrRowDel", {
            'click': function (ev) {
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var ctrlp = $("#goodsitemlist .attrRow[attrindex=" + iindex + "][attrpindex=" + pindex + "]");

                var attrList = goodsListArr[pindex].attrList;
                attrList.splice(iindex, 1);
                goodsListArr[pindex].attrList = attrList;

                ctrlp.animate({left: "-6.4rem"}, 300, function () {
                    if (attrList.length == 0) {
                        ctrlp = $("#goodsitemlist li[index=" + pindex + "]");
                        ctrlp.animate({left: "-6.4rem"}, 300, function () {
                            goodsListArr.splice(pindex, 1);
                            var goodslist = JSON.stringify(goodsListArr);
                            kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
                            refreshdata(goodsListArr);
                            isEmptyBox();
                        });
                    } else {
                        var goodslist2 = JSON.stringify(goodsListArr);
                        kdShare.cache.setCacheData(goodslist2, kdAppSet.getGoodslistFlag());
                        refreshdata(goodsListArr, pindex);
                        isEmptyBox();
                    }
                });
                AddGoods.freshGoodsNum();   //主动立即购买购物车数量，防止用户点返回数量不更新
                ev.stopPropagation();
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
        $("#goodsitemlist").delegate(".attrnum", {
            'click': function (ev) {

                var target = $(this).children('input');
                var iindex = this.getAttribute("attrindex");
                var pindex = this.getAttribute("attrpindex");
                var attrList = goodsListArr[pindex].attrList;
                var attrname = attrList[iindex].name;
                var attrListCtrl = $("#goodsitemlist").find("li[index=" + pindex + "]");
                var config = {
                    name: attrname,
                    input: target.val(),
                    hint: "无效数据!",
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
                        //更新价格
                        var itemid = 0;
                        if (goodsListArr[pindex].auxtype == 2 || goodsListArr[pindex].auxtype == 0) {
                            itemid = goodsListArr[pindex].itemid;
                        } else {
                            itemid = attrList[iindex].fitemid;
                        }
                        var auxid = attrList[iindex].fauxid;
                        var num = attrList[iindex].num;
                        var price = getItemPrice(dlist, itemid, auxid, num);
                        attrList[iindex].price = price;
                        var goodslist = JSON.stringify(goodsListArr);
                        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());

                        var isum = 0;
                        var isumMoney = 0;
                        var itmp;
                        for (var attr in attrList) {
                            isum = kdShare.calcAdd(isum, Number(attrList[attr].num));
                            itmp = kdShare.calcMul(Number(attrList[attr].num), Number(attrList[attr].price));
                            isumMoney = kdShare.calcAdd(isumMoney, itmp);
                        }
                        attrListCtrl.find(".attrSum span").text(isum);
                        attrListCtrl.find(".attrSumPrice span").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(isumMoney));
                        attrListCtrl.find(".attrRow[attrindex=" + iindex + "]").find(".attrprice span").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(price));
                        freshListBoxCount();
                    }
                };
                kdShare.keyBoard.autoshow(config);
                ev.stopPropagation();
                return false;
            }
        });

        //取消订单
        $('#view-itemlist').delegate('#ordercancel', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['CacheOrderList', {data: goodsListArr, editBillId: editBillId, cancelEdit: true}]);
                clearCacheGoods();
            },
            'touchstart': function () {
                $(this).addClass('btnCancelorder_touched');
            },
            'touchend': function () {
                $(this).removeClass('btnCancelorder_touched');
            }
        });


        //提交订单
        $('#view-itemlist').delegate('#ordersubmit', {
            'click': function () {
                submitOrderClick();
            },
            'touchstart': function () {
                $(this).css({background: '#ef5215'});
            },
            'touchend': function () {
                $(this).css({background: '#ff6427'});
            }
        });

        //购物车为空时， 选购点击 处理
        $("#view-itemlist").delegate('.btnSelGoods span', {
                'click': function () {
                    addGoods();
                },
                'touchstart': function () {
                    $(this).css({background: '#ef5215'});
                },
                'touchend': function () {
                    $(this).css({background: '#ff6427'});
                }
            }
        );
    }

    //添加商品
    function addGoods() {
        MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
    }


    //提交订单的处理函数
    function submitOrderClick() {
        if (checkCanSubmit()) {
            submitBill(true);
        }
    }

    //检测是否有权限提交单据
    function checkCanSubmit() {
        var userinfo = kdAppSet.getUserInfo();
        if (userinfo.usertype != 0 || userinfo.senderMobile == ''
            || (!userinfo.cmpInfo.allowRetailSubmit && userinfo.identity == 'retail')
            ) {
            MiniQuery.Event.trigger(window, 'toview', ['Register', {fnCallBack: submitBill, fromView: 'cachelist'}]);
            return false;
        }
        return true;
    }

    //提交订单
    function submitBill(checkPrice) {
        if (checkPrice) {
            if (bloadind == 1) {
                OptMsg.ShowMsg('正在获取价格策略信息,请稍候!', '', 1500);
                return;
            } else if (bloadind == 2) {
                getPriceList();
                OptMsg.ShowMsg('获取价格策略信息出错,正尝试重新获取,请稍候!', '', 2500);
                return;
            }
        }
        MiniQuery.Event.trigger(window, 'toview', ['CacheOrderList', {data: goodsListArr, editBillId: editBillId, privilegeInfo: privilegeInfo}]);
    }

    //计算购物车中的商品数
    function getGoodsListCount() {
        var goods = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        var goodslist = [];
        if (goods != "") {
            goodslist = JSON.parse(goods);
            var inum = goodslist.length;
            var isum = 0;
            for (var i = 0; i < inum; i++) {
                var attrList = goodslist[i].attrList;
                for (var attr in attrList) {
                    isum = isum + Number(attrList[attr].num);
                }
            }
            return isum;
        }
        else {
            return 0;
        }
    }

    //刷新购物车的数量
    function freshListBoxCount() {
        var num = parseInt(getGoodsListCount());
        var cart = document.getElementById('goodsNum');
        if (num > 99) {
            num = '99';
        }
        cart.innerHTML = num;//更新购物车
        if (Number(num) == 0) {
            $(cart).hide();
        } else {
            $(cart).show();
        }
        calcSumMoney();
    }

    //计算购物车商品总金额
    function calcSumMoney() {
        var sumMoney = 0;
        if (goodsListArr) {
            var inum = goodsListArr.length;
            var itmp;
            for (var i = 0; i < inum; i++) {
                var attrList = goodsListArr[i].attrList;
                for (var attr in attrList) {
                    //仅限积分兑换 金额为0
                    itmp = (attrList[attr].onlyexpoint == 1 && isRetail) ? 0 : kdShare.calcMul(Number(attrList[attr].num), Number(attrList[attr].price));
                    sumMoney = kdShare.calcAdd(sumMoney, itmp);
                }
            }
            $("#cacheSumMoney").text(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(sumMoney))
        }
    }

    //设置价格信息是否显示
    function setPriceVisiable() {

        var view_itemlist = $("#view-itemlist");
        if (kdAppSet.getIsShowPrice()) {
            view_itemlist.find(".attrprice").show();
            view_itemlist.find(".attrSumPrice").show();
            view_itemlist.find(".cacheSumMoney").show();
        } else {
            view_itemlist.find(".attrprice").hide();
            view_itemlist.find(".attrSumPrice").hide();
            view_itemlist.find(".cacheSumMoney").hide();
        }
    }

    //刷新购物车界面状态
    function freshViewStatus() {
        //editBillId 不等于0 表示是编辑订单
        var view_itemlist = $("#view-itemlist");
        var title = view_itemlist.find(".listTitle #listtitleid");
        var ordercancel = view_itemlist.find("#ordercancel");
        var ordersubmit = view_itemlist.find("#ordersubmit");

        if (editBillId == 0) {
            title.text("购物车");
            ordersubmit.text("提交订单");
            ordercancel.hide();
        } else {
            title.text("商品清单");
            ordersubmit.text("保存");
            ordercancel.show();
        }
    }

    //调用接口获取订单详情
    function getOrderDetail(interID) {

        kdAppSet.setKdLoading(true, "获取订单信息...");
        Lib.API.get('GetOrderDetail', {
            currentPage: 1,
            ItemsOfPage: 9999,
            para: {InterID: interID, optType: 2}
        }, function (data, json) {
            var goodslist = JSON.stringify(data.list);
            kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
            showGoodslistInfo();
            kdAppSet.setKdLoading(false);
            OptMsg.ShowMsg('订单已复制');
            //刷新价格
            getPriceList();
        }, function (code, msg) {
            kdAppSet.setKdLoading(false);
            jAlert("获取订单信息出错:" + msg);
        }, function () {
            kdAppSet.setKdLoading(false);
            jAlert(kdAppSet.getAppMsg.workError);
        }, "");
    }

    function render(configp) {
        initView();
        if (typeof configp == 'boolean') {
            dealBillInfo({});
            showGoodslistInfo();
        }
        else {
            config = configp || {};
            dealBillInfo(config);
            show();
        }
        getPriceList();
    }

    //处理单据编辑或者单据复制
    function dealBillInfo(configp) {

        copyBillId = configp.copyBillId || 0;
        //复制订单
        if (copyBillId > 0) {
            pricetime = 0;
            goodsListArr = [];
            clearCacheGoods();
            getOrderDetail(copyBillId);
        }
    }


    //商品详情中 点击立即购买
    function goodsSubmitBill() {
        if (checkCanSubmit()) {
            render(true);
            freshAllItemPrice(dlist);
            submitBill(false);
        }
    }

    //显示商品列表
    function showGoodslistInfo() {
        getGoodsData();
        freshListBoxCount();
        freshViewStatus();
    }

    //获取订单金额
    function getOrderMoney() {
        var sum = 0;
        goodsListArr = JSON.parse(kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag()));
        if (goodsListArr) {
            var len = goodsListArr.length;
            var tmp;
            for (var i = 0; i < len; i++) {
                var attrList = goodsListArr[i].attrList;
                for (var attr in attrList) {
                    //仅限积分兑换 金额为0
                    tmp = (attrList[attr].onlyexpoint == 1 && isRetail) ? 0 : kdShare.calcMul(Number(attrList[attr].num), Number(attrList[attr].price));
                    sum = kdShare.calcAdd(sum, tmp);
                }
            }
        }
        return sum;
    }

    function show() {
        $(div).show();
        OptAppMenu.selectKdAppMenu("goodsBoxId");
        OptAppMenu.showKdAppMenu(true);
        showGoodslistInfo();
        kdAppSet.setAppTitle('购物车');
    }

    function hide() {
        $(div).hide();
        OptAppMenu.showKdAppMenu(false);
    }

    return {
        render: render,
        goodsSubmitBill: goodsSubmitBill,
        getGoodsListCount: getGoodsListCount,
        show: show,
        hide: hide,
        getOrderMoney: getOrderMoney
    };


})();


/*购物车 订单显示界面*/
var CacheOrderList = (function () {

    var div,
        scroller,
        samples,
        sampleStore,
        cacheOrderList_ul,
        goodsListArr,
        bsummiting,
        billId,//订单编号
        addressInfo,//收货地址信息
        invoiceInfo,//发票信息
        viewPage,
        payInfo,
        promptTxt,
        isOutInStore, //是否门店自提
        isNeedInvoice,//是否需要发票
        privilegeInfo,
        storeInfo,//自提门店信息
        billInfo,//单据信息 金额
        enablePoints,//是否允许积分兑换
        billPoint,//本单积分
        hasInit,
        lng = 0,
        lat = 0;
    var deliverway = 0;//交货方式
    var deliverList = [];
    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById("viewid_cacheOrderList");
            var listitemarea = document.getElementById('cacheOrderListContent');
            scroller = Lib.Scroller.create(listitemarea);
            cacheOrderList_ul = document.getElementById('cacheOrderList_ul');
            var ul = document.getElementById('cacheOrderList_ul');
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
                },
                {
                    name: 'rowli',
                    begin: '#--rowli.begin--#',
                    end: '#--rowli.end--#',
                    outer: '{rowsli}'
                }
            ]);
            var storeTemplate = document.getElementById('cacheOrderList_store_view').innerHTML;
            sampleStore = $.String.between(storeTemplate, '<!--', '-->');
            bsummiting = false;
            billId = 0;
            billInfo = {};
            viewPage = $(div);
            initAddressInfo();
            initInvoiceInfo();
            initStore();
            bindEvents();
            // 备注信息栏获取焦点
            promptTxt = '请在此处输入要备注的信息';
            isOutInStore = false;
            isNeedInvoice = false;
            $('.view_cacheOrderList .editgoods img').attr('src', 'img/edit_img.png');
            $('.view_cacheOrderList .add_goods img').attr('src', 'img/add_img.png');
            var identity = kdAppSet.getUserInfo().identity;
            if (identity == "manager" || identity == "buyer") {
                viewPage.find('[data-cmd="manage"]').show();
                viewPage.find('[data-cmd="retail"]').hide();
            } else {
                viewPage.find('[data-cmd="retail"]').show();
                viewPage.find('[data-cmd="manage"]').hide();
            }
            if (kdAppSet.getUserInfo().allowoutinstore == 0) {
                $('#cacheOrderList_store').css({ 'visibility': 'hidden' });
            }
            setInvoiceView();
            setWxCardInfo();
            deliverList = kdAppSet.getUserInfo().fetchstylelist;
            if (deliverList.length <= 1) {
                setDeliverway(deliverList);
            }
            hasInit = true;
        }
    }

    function refreshPayBtn(billMoney){
        if (kdAppSet.getIsShowPrice() && billMoney>0) {
            $('#getlistbill')[0].innerText = '立即付款';
        } else {
            $('#getlistbill')[0].innerText = '查看订单';
        }
    }

    //设置微信卡券是否显示
    function setWxCardInfo() {
        var wxCard = $('#cacheOrderList_wxCard');
        if (!kdAppSet.getUserInfo().cmpInfo.allowWxCard) {
            wxCard.hide();
        } else {
            wxCard.show();
        }
    }

    function initStore() {
        var date = new Date();
        //用户自定义取货时间
        var laydate = kdAppSet.getUserInfo().cmpInfo.outinstoretakedelaydate;
        var newDate = new Date(date.setDate(date.getDate() + laydate));//加上延时收货时间
        var currentdate = newDate.getFullYear() + "-" + ((newDate.getMonth() + 1) < 10 ? "0" : "") + (newDate.getMonth() + 1) + "-" + (newDate.getDate() < 10 ? "0" : "") + newDate.getDate();
        storeInfo = {
            newDate: newDate,
            date: currentdate,
            id: 0
        };
    }

    function fillStore() {

        $('#cacheOrderList_store_view')[0].innerHTML = $.String.format(sampleStore, {
            'store': storeInfo.store || '选择门店',
            'address': storeInfo.address || '',
            'date': storeInfo.date
        });
        setTimeout(function () {
            var dateStore = viewPage.find('[data-cmd="date"]');
            initDate(dateStore, {
                'onSelect': function () {
                    storeInfo.date = dateStore.val();
                }
            });
        }, 50);
    }

    function initDate(dateCtrl, event) {
        var fn = function () {
        };

        var startDate = $.Date.format(storeInfo.newDate, "yyyy-MM-dd").split("-");
        var minDate = new Date(startDate[0], startDate[1] - 1, startDate[2], 00, 00, 00);
        //初始化日期控件
        var maxDate = new Date(2020, 12, 30, 23, 59, 59);
        dateCtrl.mobiscroll().date({
            'theme': 'android-ics',
            'lang': 'zh',
            'maxDate': maxDate,
            'minDate': minDate,
            'display': 'bottom',
            'mode': 'scroller',
            'dateFormat': "yy-mm-dd",
            'inputDateFormat': "yy-mm-dd",
            'showLabel': false,
            'dateOrder': 'yymmdd',
            'cancelText': "取消",
            'setText': "确定",
            'rows': 5,
            //点击确定按钮，触发事件。
            'onSelect': event.onSelect || fn,
            //当时间选择的内容发生变化触发的事件
            'onChange': event.onChange || fn,
            //点击取消按钮触发的事件
            'onCancel': event.onCancel || fn
        });
    }

    //初始化收货地址 以及发票信息
    function initAddressInfo() {
        var addrinfo = kdAppSet.getUserInfo().addressInfo;
        addressInfo = {
            provincenumber: addrinfo.provincenumber,
            citynumber: addrinfo.citynumber,
            districtnumber: addrinfo.districtnumber,
            name: addrinfo.receivername,
            mobile: addrinfo.mobile,
            addressdetail: addrinfo.receiveraddress,
            address: addrinfo.address
        };
        freshReceiveInfo(addressInfo);
    }

    //初始化发票信息
    function initInvoiceInfo() {
        var userInfo = kdAppSet.getUserInfo();
        var addrinfo = userInfo.addressInfo;
        invoiceInfo = {
            invoiceHead: userInfo.companyName,
            name: addrinfo.receivername,
            mobile: addrinfo.mobile,
            address: addrinfo.receiveraddress
        };
        freshInvoiceInfo(invoiceInfo);
    }

    //刷新发票信息
    function freshInvoiceInfo(invoice) {
        $("#orderInvoiceHead").text(invoice.invoiceHead);
        $("#orderInvoiceAddress").text(invoice.address);
    }


    //编辑商品
    function editBillInfo() {
        var goodslist = JSON.stringify(goodsListArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        MiniQuery.Event.trigger(window, 'editCacheListInfo', [
            { editBillId: billId }
        ]);
        //通知购物车刷新数量
        MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
    }

    function setDeliverway(data) {
        if (data.length == 0) {
            viewPage.find('[data-cmd="deliverway"]')[0].innerHTML = "快递送货"
        } else {
            viewPage.find('[data-cmd="deliverway"]')[0].innerHTML = data[0].name || "快递送货";
            deliverway = data[0].id || 0;
        }
    }

    function onSelect() {//第几个元素被选中
        var onseList = [];
        for (i = 0; i < deliverList.length; i++) {
            if (deliverList[i].id == deliverway) {
                onseList.push(i);
            }
        }
        return onseList;
    }

    function bindEvents() {
        //经销商选择交货方式
        viewPage.delegate('[data-cmd="manage"]', {
            'click': function () {
                var identity = kdAppSet.getUserInfo().identity;
                if (deliverList.length > 1 && (identity == "manager" || identity == "buyer"))
                    jSelect.showSelect({
                        title: "交货方式",
                        data: deliverList,
                        onselect: onSelect(),
                        fnselect: function (data) {
                            setDeliverway(data);
                        }
                    });
            }
        }
        );

        //刷新购物车列表 处理库存不足
        MiniQuery.Event.bind(window, {
            'freshCacheOrderListInfo': function () {
                goodsListArr = getDataList('goodsList');
                freshListView(goodsListArr);
            }
        });

        //取消修改 按钮事件
        viewPage.delegate('#cancelChange', {
            'click': function () {
                jConfirm("你确定要取消订单修改?", null, function (flag) {
                    if (flag) {
                        MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', { billId: billId }]);
                        finishBillEdit();
                    }
                }, { ok: "确定", no: "取消" });
            },
            'touchstart': function () {
                $(this).addClass('cancelChange_touched');
            },
            'touchend': function () {
                $(this).removeClass('cancelChange_touched');
            }
        });

        //提交单据 按钮事件
        viewPage.delegate('#summitOrder', {
            'click': function () {
                if (checkBillCanSubmit()) {
                    submitOrder();
                    kdAppSet.h5Analysis('CacheOrderList_submit');
                }
            },
            'touchstart': function () {
                $(this).css({ background: '#ef5215' });
            },
            'touchend': function () {
                $(this).css({ background: '#ff6427' });
            }
        });

        //订单添加商品
        viewPage.delegate('.add_goods', {
            'click': function () {
                editBillInfo();
                MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
                kdAppSet.h5Analysis('CacheOrderList_addGoods');
            },
            'touchstart': function () {
                $(this).addClass('touched');
                $(this).find('img').attr('src', 'img/add_img_click.png');
            },
            'touchend': function () {
                $(this).removeClass('touched');
                $(this).find('img').attr('src', 'img/add_img.png');
            }
        });

        //订单编辑商品
        viewPage.delegate('.editgoods', {
            'click': function () {
                editBillInfo();
                MiniQuery.Event.trigger(window, 'toview', ['CacheList', {}]);
                kdAppSet.h5Analysis('CacheOrderList_editGoods');
            },
            'touchstart': function () {
                $(this).addClass('touched');
                $(this).find('img').attr('src', 'img/edit_img_click.png');
            },
            'touchend': function () {
                $(this).removeClass('touched');
                $(this).find('img').attr('src', 'img/edit_img.png');
            }
        });

        //选择收货地址
        viewPage.delegate('.liaddress', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['AddressList', {
                    mode: 'select',
                    addressInfo: addressInfo,
                    fnselect: function (data) {
                        var address = {
                            provincenumber: data.provincenumber,
                            citynumber: data.citynumber,
                            districtnumber: data.districtnumber,
                            name: data.name,
                            mobile: data.mobile,
                            addressdetail: data.addressdetail,
                            address: data.address
                        };
                        freshReceiveInfo(address);
                        caculateFreight();
                    }
                }]);
            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        });

        //选择填写发票信息
        viewPage.delegate('.liinvoice', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['Invoice', {
                    Invoice: invoiceInfo,
                    fnselect: function (data) {
                        invoiceInfo = data;
                        freshInvoiceInfo(invoiceInfo);
                    }
                }]);
            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        });


        //选择门店
        viewPage.delegate('[data-cmd="store-select"]', {
            'click': function () {
                if (lng == 0 && lat == 0) {
                    kdAppSet.setKdLoading(true, '正在加载...');
                    Gaode.getlocation(function (data) {
                        kdAppSet.setKdLoading(false);
                        if (data.type == "complete") {
                            lng = data.position.getLng(),
                            lat = data.position.getLat()
                        }
                        goTostore();
                    });
                } else {
                    goTostore();
                }

            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        });

        //快递收货
        viewPage.delegate('#cacheOrderList_express', {
            'click': function () {
                //显示发票信息
                setInvoiceView(true);
                changeExpressMode(true);
            }
        });

        //门店自提
        viewPage.delegate('#cacheOrderList_store', {
            'click': function () {
                //隐藏发票信息
                setInvoiceView(false);
                changeExpressMode(false);
                //如果只有一个门店 则自动选择
                setOneStore();
            }
        });

        //微信卡券
        viewPage.on({
            'click': function (event) {
                if (billInfo.money) {
                    var that = $(this);
                    if (that.hasClass('sprite-more')) {
                        //选择卡券
                        WXCard.getCardList(function (card) {
                            billInfo.cardCode = card.code;
                            billInfo.freeMoney = card.freeMoney < billInfo.money ? card.freeMoney : billInfo.money;
                            var money = billInfo.money - card.freeMoney;
                            billInfo.billMoney = money > 0 ? money : 0;
                            freshBillMoney(billInfo.billMoney);
                            that.find('[data-cmd="wxCard-name"]').text(card.name);
                            /*                            that.removeClass('sprite-more');
                             that.addClass('sprite-delete-a');*/
                        }, function (msg) {
                            OptMsg.ShowMsg(msg);
                        }, billInfo.money);
                    } else {
                        /*                        //删除卡券
                         if(screenWidth-event.screenX<=60){
                         billInfo.cardCode=0;
                         billInfo.freeMoney=0;
                         billInfo.billMoney=billInfo.money;
                         freshBillMoney(billInfo.billMoney);
                         that.find('[data-cmd="wxCard-name"]').text('');
                         that.removeClass('sprite-delete-a');
                         that.addClass('sprite-more');
                         }*/
                    }
                }
            },
            'touchstart': function () {
                $(this).addClass('address_touched');
            },
            'touchend': function () {
                $(this).removeClass('address_touched');
            }
        }, '#cacheOrderList_wxCard');

        //需要发票
        viewPage.delegate('#cacheOrderList_invoice_on', {
            'click': function () {
                changeInvoiceMode(true);
            }
        });

        //不需要发票
        viewPage.delegate('#cacheOrderList_invoice_off', {
            'click': function () {
                changeInvoiceMode(false);
            }
        }).delegate('[data-cmd="expoint"]', {
            //是否使用积分兑换
            'click': function () {
                enablePoints = Number(!enablePoints);
                enablePoints ? $(this).addClass('sprite-area_select') : $(this).removeClass('sprite-area_select');
                //使用积分
                var billMoney = billInfo.billMoney || billInfo.money;
                if (enablePoints == 1) {
                    var money = getPointMoney();
                    freshBillMoney(billMoney - money);
                } else {
                    freshBillMoney(billMoney);
                }
            }
        });

        //提交单据后，继续购物 按钮事件
        $('#backtoitem').bind('click', function () {
            freshListView([]);
            MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', {}]);
            kdShare.clearBackView(1);
        });


        //提交单据后，立即支付或者查看订单 按钮事件
        $('#getlistbill').bind('click', function () {
            freshListView([]);
            var billMoney = payInfo.billmoney + payInfo.freight;
            if (kdAppSet.getIsShowPrice() && billMoney>0) {
                toPayView();
            } else {
                MiniQuery.Event.trigger(window, 'toview', ['Orderlist', { item: "" }]);
                kdShare.clearBackView(1);
            }
        });

        viewPage.delegate('#cacheOrderRemark', {
            'focus': function () {
                if (kdShare.trimStr($(this).val()) == promptTxt) {
                    $(this).val('');
                }
                $(this).addClass('textColor');
            },
            'blur': function () {
                if (kdShare.trimStr($(this).val()) == '') {
                    $(this).val(promptTxt);
                    $(this).removeClass('textColor');
                }
            }
        });
        //日期点击效果控制
        $('#orderReceiveDate').on(kdShare.clickfnIcon($('#orderReceiveDate'), 'date', 'date_s'));

        viewPage.delegate('.btn-freightRule', 'click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['FreightRule']);
        });

        WXCard.checkApi(function (check) {
            if (!check) {
                $('#cacheOrderList_wxCard').find('[data-cmd="wxCard-name"]').text('您的微信版本不支持卡券功能');
            }
        });

    }

    function goTostore() {
        MiniQuery.Event.trigger(window, 'toview', ['StoreList', {
            'lng': lng,
            'lat': lat,
            'selectId': storeInfo.id,
            'fnselect': function (data) {
                $.Object.extend(storeInfo, {
                    id: data.id,
                    store: data.name,
                    address: data.address
                });
                fillStore();
            }
        }]);
    }

    //获取能积分兑换商品的金额
    function getPointMoney() {
        var item;
        var sumMoney = 0;
        var data = CacheOrderList_Retail.getSubmitData();
        for (var i = 0, len = data.length; i < len; i++) {
            item = data[i];
            if (item.expoint > 0) {
                sumMoney = sumMoney + (item.onlyexpoint == 1 ? 0 : Number(item.DiscountPrice) * Number(item.Qty));
            }
        }
        return sumMoney;
    }

    //设置只有一个门店的情况
    function setOneStore() {
        var user = kdAppSet.getUserInfo();
        var one = user.oneStore;
        if (one && !storeInfo.id) {
            $.Object.extend(storeInfo, {
                store: one.name,
                address: one.address,
                id: one.id
            });
            fillStore();
        }
    }

    //设置发票信息是否可见
    function setInvoiceView(bview) {
        //判断后台参数 是否允许选择发票
        var setting = kdAppSet.getUserInfo().cmpInfo;
        var aview = false;
        if (setting.allowChooseInvoice) {
            aview = true;
        }
        if (bview == undefined) {
            bview = aview;
        } else {
            bview = bview && aview;
        }
        var invoice = $('#cacheOrderList_invoice');
        var invoiceView = $('#cacheOrderList_invoice_view');

        if (bview) {
            invoice.show();
            //hong
            if (isNeedInvoice) {
                invoiceView.show();
            } else {
                invoiceView.hide();
            }
        } else {
            invoice.hide();
            invoiceView.hide();
        }
        scroller && scroller.refresh();
    }

    //更改送货方式
    function changeExpressMode(isExpress) {
        var liaddress = $('#cacheOrderList_liaddress');
        var listore = $('#cacheOrderList_store_view');
        var SendMode = $('#cacheOrderList_SendMode');
        var express = $('#cacheOrderList_express');
        var store = $('#cacheOrderList_store');

        if (isExpress) {
            isOutInStore = false;
            SendMode.removeClass('borderBottom');
            express.addClass('sprite-style-on');
            store.removeClass('sprite-style-on');
            liaddress.addClass('borderBottom');
            liaddress.show();
            listore.hide();
        } else {
            isOutInStore = true;
            SendMode.addClass('borderBottom');
            express.removeClass('sprite-style-on');
            store.addClass('sprite-style-on');
            liaddress.hide();
            listore.show();
            fillStore();
        }
        caculateFreight();
        checkOverseaGoods();
        scroller.refresh();
    }

    //是否需要发票
    function changeInvoiceMode(needInvoice) {

        var liinvoice = $('#cacheOrderList_invoice_view');
        var invoice = $('#cacheOrderList_invoice');
        var invoice_on = $('#cacheOrderList_invoice_on');
        var invoice_off = $('#cacheOrderList_invoice_off');

        if (needInvoice) {
            isNeedInvoice = true;
            invoice.removeClass('borderBottom');
            invoice_on.addClass('sprite-style-on');
            invoice_off.removeClass('sprite-style-on');
            liinvoice.addClass('borderBottom');
            liinvoice.show();
        } else {
            isNeedInvoice = false;
            invoice.addClass('borderBottom');
            invoice_on.removeClass('sprite-style-on');
            invoice_off.addClass('sprite-style-on');
            liinvoice.hide();
        }
        scroller.refresh();

    }

    //检测单据是否能提交
    function checkBillCanSubmit() {
        var identity = kdAppSet.getUserInfo().identity;
        /*        if (deliverList.length > 1 && (identity == "manager" || identity == "buyer")) {
                    if (deliverway == 0) {
                        jAlert("请选择交货方式!");
                        return false;
                    }
                }*/
        if (!isOutInStore) {
            if (addressInfo.address == "") {
                jAlert("收货地址不能为空,请修改!");
                return false;
            }
            if ((addressInfo.provincenumber == '0') || (addressInfo.citynumber == '0') || (addressInfo.districtnumber == '0')) {
                jAlert("收货地址中 省,市,区都不能为空,请修改!");
                return false;
            }
        } else {
            //门店提货
            var today = kdShare.getToday();
            if (storeInfo.date < today) {
                jAlert("提货日期不能小于今天!");
                return false;
            }

            if (storeInfo.id == 0) {
                jAlert("门店不能为空,请选择!");
                return false;
            }
        }


        var display = $('#cacheOrderList_identity').css("display");
        if (display != 'none') {
            var identityStr = kdShare.trimStr($(".view_cacheOrderList .identity input")[0].value);
            if (identityStr == '') {
                jAlert("身份证号码不能为空,\n请录入!");
                return false;
            } else if ((identityStr.length != 15) && (identityStr.length != 18)) {
                jAlert("身份证号码长度不对,\n请检查!");
                return false;
            }
        }
        return true;
    }

    function setPrivilegeInfo(value) {
        var $div = $(div).find('.privilegeInfo-div');
        if (value === '') {
            $div.hide();
            return;
        }
        $div.text(value);
        $div.show();
    }

    //设置是否使用积分兑换 以及微信卡券
    function setPayInfo(data) {
        var pointInfo = getPointsData(data);
        var pointView = viewPage.find('[data-cmd="expoint-view"]');
        pointView.hide();
        //是否包含可积分兑换的商品
        if (pointInfo.points > 0) {
            if (kdAppSet.getUserInfo().identity == 'retail') {
                pointView.show();
            }
            //如果有积分兑换商品，则不能使用微信卡券
            $('#cacheOrderList_wxCard').hide();
        } else {
            setWxCardInfo();
        }
        /*        var points=0;
         //勾选积分兑换或者有仅限积分的商品时
         //enablePoints==1 ||
         if( pointInfo.hasOnlyPoint){
         points=pointInfo.points;
         }*/
        return pointInfo.points;
    }

    //刷新 商品列表数据
    function freshListView(data) {
        var points = setPayInfo(data);
        freshViewStatus();
        checkOverseaGoods();
        var user = kdAppSet.getUserInfo();
        if (user.identity == 'retail') {
            $('#summitOrder').hide();
            CacheOrderList_Retail.getPromotion(data, scroller, function(point){
                billPoint=point;
                caculateFreight();
            }, billInfo, points);
            $('.view_cacheOrderList [data-cmd="totalHead"]').show();
            return;
        }
        caculateFreight();
        var sumMomey = 0;
        var sumNum = 0;
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        cacheOrderList_ul.innerHTML = $.Array.map(data, function (item) {
            var attrList = [];
            var listObj = item.attrList;
            var attrsum = 0;
            var attrsumMoney = 0;
            var itmp;
            for (var attr in listObj) {
                attrList.push(listObj[attr]);
                attrsum = kdShare.calcAdd(attrsum, Number(listObj[attr].num));
                itmp = kdShare.calcMul(Number(listObj[attr].num), Number(listObj[attr].price));
                attrsumMoney = kdShare.calcAdd(attrsumMoney, itmp);
            }
            sumNum = kdShare.calcAdd(sumNum, attrsum);
            sumMomey = kdShare.calcAdd(sumMomey, attrsumMoney);
            return $.String.format(samples['li'], {
                img: item.img == "" ? (imgMode ? "img/no_img.png" : noimgModeDefault) : (imgMode ? kdAppSet.getImgThumbnail(item.img) : noimgModeDefault),
                name: item.name,
                attrsum: attrsum + item.unitname,
                attrsumMoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(attrsumMoney),
                'rows': $.Array.map([""], function (row) {
                    return $.String.format(samples['row'], {
                        'rowsli': $.Array.map(attrList, function (row) {
                            return $.String.format(samples['rowli'], {
                                attrname: row.name,
                                attrprice: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(row.price),
                                num: row.num,
                                money: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(kdShare.calcMul(Number(row.num), Number(row.price)))
                            });
                        }
                        ).join('')
                    });
                }
                ).join('')
            });
        }).join('');
        billInfo.money = sumMomey;
        freshBillMoney(sumMomey);
        scroller.refresh();
        setPriceVisiable();
    }

    //刷新单据金额
    function freshBillMoney(money) {
        var moneyStr = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(money);
        $("#viewid_cacheOrderList").find(".divbillmoney span").text(moneyStr);
        $('.view_cacheOrderList [data-cmd="totalMoney"]')[0].innerText = moneyStr;
    }

    //检测是否有跨境商品
    function checkOverseaGoods() {
        var data = goodsListArr;
        var inum = data.length;
        var bcheck = false;
        if (!isOutInStore) {
            for (var i = 0; i < inum; i++) {
                if (data[i].isoverseas == 1) {
                    bcheck = true;
                    break;
                }
            }
        }
        var identityView = $('#cacheOrderList_identity');
        bcheck ? identityView.show() : identityView.hide();
    }

    //刷新收货信息
    function freshReceiveInfo(datainfo) {
        $("#orderReceiveName").text(datainfo.name);
        var phone = $("#orderReceivePhone");
        if (datainfo.name == datainfo.mobile) {
            phone.text('');
        } else {
            phone.text(datainfo.mobile);
        }
        $("#orderReceiveAddress").text(datainfo.addressdetail);
        addressInfo = datainfo;
    }

    //获取提交单据的列表数据
    function getListData(data) {

        var tempdata = [];
        var recDate = '';
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var iauxtype = data[i].auxtype;
            if (iauxtype == 0) {
                var temp = {};
                temp.MaterialID = data[i].itemid;
                temp.IsOverseas = data[i].isoverseas;
                temp.UnitID = data[i].unitid;
                temp.AuxID = 0;
                temp.IsGift = 0;
                temp.ActivityID = 0;
                var attrList0 = data[i].attrList;
                temp.Qty = attrList0[0].num;
                temp.Price = attrList0[0].price;
                temp.DiscountPrice = attrList0[0].price;
                temp.DeliverDate = recDate;
                tempdata.push(temp);

            } else if (iauxtype == 1) {

                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    var temp1 = {};
                    temp1.MaterialID = attrList1[j].fitemid;
                    temp1.IsOverseas = data[i].isoverseas;
                    temp1.UnitID = data[i].unitid;
                    temp1.AuxID = 0;
                    temp1.IsGift = 0;
                    temp1.ActivityID = 0;
                    temp1.Qty = attrList1[j].num;
                    temp1.Price = attrList1[j].price;
                    temp1.DiscountPrice = attrList1[j].price;
                    temp1.DeliverDate = recDate;
                    tempdata.push(temp1);
                }

            } else if (iauxtype == 2) {

                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    var temp2 = {};
                    temp2.MaterialID = data[i].itemid;
                    temp2.IsOverseas = data[i].isoverseas;
                    temp2.UnitID = data[i].unitid;
                    temp2.AuxID = attrList2[k].fauxid;
                    temp2.Qty = attrList2[k].num;
                    temp2.Price = attrList2[k].price;
                    temp2.DiscountPrice = attrList2[k].price;
                    temp2.DeliverDate = recDate;
                    temp2.IsGift = 0;
                    temp2.ActivityID = 0;
                    tempdata.push(temp2);
                }
            }
        }
        return tempdata;
    }

    //获取积分兑换的信息
    function getPointsData(data) {
        var points = 0;
        var hasOnlyPoint = false;
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var attrList = data[i].attrList;
            var gnum = attrList.length;
            for (var g = 0; g < gnum; g++) {
                points = points + attrList[g].expoint || 0;
                if (!!attrList[g].onlyexpoint) {
                    hasOnlyPoint = true;
                }
            }
        }
        return {
            points: points,
            hasOnlyPoint: hasOnlyPoint
        };
    }

    //提交订单
    function submitOrder() {

        if (bsummiting) {
            OptMsg.ShowMsg('正在提交订单，请稍候!');
            return;
        }
        bsummiting = true;
        var tempdata = null;
        if (kdAppSet.getUserInfo().identity == 'retail') {
            tempdata = CacheOrderList_Retail.getSubmitData();
        } else {
            tempdata = getListData(goodsListArr);
        }

        var optOpenid = kdAppSet.getUserInfo().optid;
        var remark = $("#cacheOrderRemark")[0].value;
        if (remark == promptTxt) {
            remark = "";
        }
        remark = kdAppSet.ReplaceJsonSpecialChar(remark);

        var identityStr = $(".view_cacheOrderList .identity input")[0].value;
        identityStr = kdAppSet.ReplaceJsonSpecialChar(identityStr);
        kdShare.cache.setCacheData(identityStr, 'identityStr');

        var userinfo = kdAppSet.getUserInfo();
        var contactName = userinfo.contactName;
        var nameStr = addressInfo.name;

        var mobileStr = addressInfo.mobile;
        if (isOutInStore) {
            nameStr = contactName || '';
            mobileStr = userinfo.senderMobile || '';
        }
        nameStr = kdAppSet.ReplaceJsonSpecialChar(nameStr);
        var addressStr = kdAppSet.ReplaceJsonSpecialChar(addressInfo.address);
        var invoiceAddrStr = kdAppSet.ReplaceJsonSpecialChar(invoiceInfo.address);

        var submitData = {
            optOpenid: optOpenid,
            InterID: billId,
            Explanation: remark,
            provincenumber: isOutInStore ? '0' : addressInfo.provincenumber,
            citynumber: isOutInStore ? '0' : addressInfo.citynumber,
            districtnumber: isOutInStore ? '0' : addressInfo.districtnumber,
            name: nameStr,
            mobile: mobileStr,
            IdNumber: identityStr,
            address: isOutInStore ? '现场提货' : addressStr,
            OutInStore: isOutInStore ? 1 : 0,
            NeedInvoice: isNeedInvoice ? 1 : 0,
            InvoiceName: invoiceInfo.invoiceHead,
            InvoiceReceiver: invoiceInfo.name,
            InvoiceReceiverMobile: invoiceInfo.mobile,
            InvoiceReceiverAddress: invoiceAddrStr,
            WXCardNumber: billInfo.cardCode || '',
            WXDiscountMoney: billInfo.freeMoney || 0,
            StoreID: storeInfo.id,
            TakeDate: storeInfo.date,
            EnablePoints: enablePoints,
            BillPoint: billPoint,
            SODetail: tempdata,
            FetchStyle: deliverway//交货方式
        };

        kdAppSet.setKdLoading(true, "正在提交订单...");
        var para = { para: submitData };

        submitOrderApi(function (data) {
            payInfo.billno = data.billno;
            payInfo.interid = data.billId || billId;
            payInfo.billmoney = data.billmoney;
            payInfo.freight = data.freight || 0;
            $("#cacheOrderRemark").val("");
            document.getElementById('popbillno').innerHTML = payInfo.billno;
            kdAppSet.setKdLoading(false);
            finishBillEdit();
            //通知订单列表刷新
            MiniQuery.Event.trigger(window, 'freshListInfo', []);
            //通知购物车刷新数量
            MiniQuery.Event.trigger(window, 'freshListBoxCount', []);

            //初始化门店数据
            if (isOutInStore) {
                initStore();
                fillStore();
            }
            var billMoney = payInfo.billmoney + payInfo.freight;
            refreshPayBtn(billMoney);
            //如果是经销商身份，并且只有线下支付方式，则不出来付款页面
            var user = kdAppSet.getUserInfo();
            var payls = user.allowpayway || [];
            var offpayls = user.offlinesubpay || [];
            if (user.identity != 'retail' && payls.length == 1
                && payls.indexOf('offline') >= 0 && offpayls.length<=1) {
                $('#orderpopupTip').show();
            } else if (kdAppSet.getIsShowPrice() && (billMoney > 0)) {
                //付款
                toPayView();
            } else {
                $('#orderpopupTip').show();
            }

        }, para);
    }

    //跳到微信支付页面
    function toPayView() {
        if (payInfo.billno) {
            payInfo.sendType = isOutInStore ? 1 : 0;
            OrderPay.payBill(payInfo);
            kdShare.clearBackView(1);
        }
    }

    //订单编辑结束
    function finishBillEdit() {
        billId = 0;
        //清空购物车缓存
        kdShare.cache.setCacheData("", kdAppSet.getGoodslistFlag());
        goodsListArr.length = 0;
        //通知完成订单提交
        MiniQuery.Event.trigger(window, 'EditBillFinish', [
            {}
        ]);
    }

    //调用提交订单接口
    function submitOrderApi(fn, para) {

        Lib.API.get('SubmitSaleOrder', para,
            function (data, json) {
                var status = data.status || 0;
                if (status == 0) {
                    bsummiting = false;
                    var billno = data.BillNo || "";
                    var BillIdv = data.BillId || "";
                    if (billno != "") {
                        //发送订单消息
                        OptMsg.NewOrderBill(billno, BillIdv, (billId == 0));
                    }
                    WXCard.consumeCard(billInfo.cardCode);
                    fn && fn({ billId: data.BillId, billno: billno, billmoney: data.BillMoney, freight: data.BillFreight });

                } else if (status == -1) {
                    //库存不足
                    bsummiting = false;
                    kdAppSet.setKdLoading(false);
                    var itemlist = data.itemlist || [];
                    var msg = '库存不足提示\n存在' + itemlist.length + '个库存不足的商品\n请处理后再下单';
                    jAlert(msg, '', function () {
                        MiniQuery.Event.trigger(window, 'toview', ['LowStock', { itemlist: itemlist }]);
                    });
                }
            }, function (code, msg) {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function (errcode) {
                bsummiting = false;
                kdAppSet.setKdLoading(false);
                jAlert(kdAppSet.getAppMsg.workError + "!错误编码 " + errcode);
            });
    }


    //调用接口获取订单详情
    function getOrderDetail(interID) {

        kdAppSet.setKdLoading(true, "获取订单信息...");
        Lib.API.get('GetOrderDetail', {
            currentPage: 1,
            ItemsOfPage: 9999,
            para: { InterID: interID }
        }, function (data, json) {
            var Explanation = data.Explanation;
            Explanation = Explanation.replace("-此单来自微订货", "");
            if (Explanation == "请在此处输入要备注的信息") {
                Explanation = "";
            }
            var identity = data.IdNumber || '';
            $('.view_cacheOrderList .identity input').val(identity);

            $("#cacheOrderRemark").val(Explanation);
            $('#viewid_cacheOrderList #billId').text(data.BillNo);

            saveBillDataToCache(data.list);
            getDatafromCache();
            isOutInStore = !!data.OutInStore;
            changeExpressMode(!isOutInStore);
            freshReceiveInfo({
                provincenumber: data.provincenumber || 0,
                citynumber: data.citynumber || 0,
                districtnumber: data.districtnumber || 0,
                name: data.name || '',
                mobile: data.mobile || '',
                address: data.address || '',
                addressdetail: data.receiveraddress || ''
            });
            setDeliverway([{
                name: data.FetchStyleName,
                id: data.FetchStyleID
            }]);//交货方式
            changeInvoiceMode(data.NeedInvoice == 1);
            invoiceInfo = {
                invoiceHead: data.InvoiceName,
                name: data.InvoiceReceiver,
                mobile: data.InvoiceReceiverMobile,
                address: data.InvoiceReceiverAddress
            };
            freshInvoiceInfo(invoiceInfo);
            viewPage.find('.view_cacheOrderList').text('￥' + data.freight); //设置运费
            //设置门店信息
            $.Object.extend(storeInfo, {
                id: data.StoreID,
                store: data.StoreName,
                date: data.TakeDate,
                address: data.StoreAddress || ''
            });
            fillStore();
            setInvoiceView(!isOutInStore);
            kdAppSet.setKdLoading(false);
        }, function (code, msg) {
            jAlert("获取订单信息出错," + msg);
            kdAppSet.setKdLoading(false);
        }, function () {
            kdAppSet.setKdLoading(false);
            jAlert(kdAppSet.getAppMsg.workError);
        }, "");
    }


    //刷新购物车界面状态
    function freshViewStatus() {
        //billId 不等于0 表示是编辑订单
        var view_cacheOrder = $("#viewid_cacheOrderList");
        var cancelChange = view_cacheOrder.find("#cancelChange");
        var orderNumber = view_cacheOrder.find(".orderNumber");
        var billsum = view_cacheOrder.find(".cacheOrder_billsum");
        var cacheOrderListContent = view_cacheOrder.find("#cacheOrderListContent");
        var divid_cacheOrder_billsum = view_cacheOrder.find("#divid_cacheOrder_billsum");


        if (billId == 0) {
            cancelChange.hide();
            orderNumber.hide();
            billsum.css("top", "0");
            $('.view_cacheOrderList .content').attr('style', "min-hight:0px");//最小高度置为0
            if (privilegeInfo !== '') {
                cacheOrderListContent.css("top", "1.66rem");
                divid_cacheOrder_billsum.css("height", "1.66rem");
            } else {
                cacheOrderListContent.css("top", "1.28rem");
                divid_cacheOrder_billsum.css("height", "1.28rem");
            }
        } else {
            cancelChange.show();
            orderNumber.show();
            $('.view_cacheOrderList .content').attr('style', "min-hight:0px");//最小高度置为0
            if (privilegeInfo !== '') {
                cacheOrderListContent.css("top", "2.16rem");
                divid_cacheOrder_billsum.css("height", "2.16rem");
            } else {
                cacheOrderListContent.css("top", "1.78rem");
                divid_cacheOrder_billsum.css("height", "1.78rem");
            }
        }
        scroller.refresh();
        //获取当前高度，并设置最小高度确保底部不被顶起
        var minHeight = $('.view_cacheOrderList .content').height();
        $('.view_cacheOrderList .content').css('min-height', minHeight);

        // 设置最小高度，确保底部不被顶起 --mayue
        //var minHeight = $('.view_cacheOrderList .content').height();
        //if (billId != 0) {
        //    minHeight = minHeight - 25;
        //}
        //$('.view_cacheOrderList .content').css('min-height', minHeight);
    }

    //保存订单数据到缓存
    function saveBillDataToCache(data) {
        var goodslist = JSON.stringify(data);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getOrderlistFlag());
    }

    //由缓存获取数据
    function getDatafromCache() {
        goodsListArr = getDataList();
        freshListView(goodsListArr);
    }

    //获取本地缓存数据
    function getDataList(goodsList) {
        var listStr = kdAppSet.getOrderlistFlag();
        if (goodsList == "goodsList") {
            listStr = kdAppSet.getGoodslistFlag();
        }
        var goodslist = kdShare.cache.getCacheDataObj(listStr);
        var list = [];
        if (goodslist != "") {
            list = JSON.parse(goodslist);
        }
        return list;
    }

    //设置价格信息是否显示
    function setPriceVisiable() {

        if (kdAppSet.getIsShowPrice()) {
            viewPage.find('.billmoney').show();
            viewPage.find('.freight').show();
            viewPage.find(".total").show();
            viewPage.find(".price").show();
        } else {
            viewPage.find('.billmoney').hide();
            viewPage.find('.freight').hide();
            viewPage.find(".total").hide();
            viewPage.find(".price").hide();
        }
    }

    function initCardInfo() {
        //设置微信卡券 初始化空白信息
        billInfo = {};
        var that = $('#cacheOrderList_wxCard');
        that.find('[data-cmd="wxCard-name"]').text('');
        that.removeClass('sprite-delete-a');
        that.addClass('sprite-more');
        //设置是否使用积分兑换  初始化为不使用
        enablePoints = 0;
        viewPage.find('[data-cmd="expoint"]').removeClass('sprite-area_select');
    }

    function render(config) {
        initView();
        privilegeInfo = config.privilegeInfo || '';
        setPrivilegeInfo(privilegeInfo);
        var identityStr = kdShare.cache.getCacheDataObj('identityStr');
        $('.view_cacheOrderList .identity input').val(identityStr);
        if (isOutInStore) {
            setOneStore();
        }
        payInfo = {};
        billPoint=0;
        initCardInfo();
        billId = config.billId || 0;
        show();
        if (billId != 0) {
            //由订单详情 编辑订单跳转过来
            getOrderDetail(billId);
        } else {
            //由购物车 提交订单跳转过来
            var cancelEdit = config.cancelEdit;
            if (cancelEdit) {
                //如果是取消编辑，跳转过来，则读取原订单数据
                goodsListArr = getDataList();
            } else {
                goodsListArr = config.data;
            }
            freshListView(goodsListArr);
            afterRender(config);
        }
        //默认获取用户经纬度
    }

    function afterRender(config) {
        var editbillid = config.editBillId || 0;
        if (editbillid > 0) {
            billId = editbillid;
            freshViewStatus();
        }
    }

    function caculateFreight() {
        var freightSpan = viewPage.find('.freight');
        if (kdAppSet.getUserInfo().ueVersion < 4) {
            viewPage.find('#div-freight-line').hide();
            return;
        }
        viewPage.find('#div-freight-line').show();
        if (isOutInStore || !kdAppSet.getIsShowPrice()) {
            freightSpan.text('￥0');
            return;
        }
        var aitemlist = [];
        var user = kdAppSet.getUserInfo();
        if (user.identity == 'retail') {
            aitemlist = CacheOrderList_Retail.getFreightData();
        } else {
            aitemlist = getItemList();
        }
        var data = {
            provincenumber: addressInfo.provincenumber,
            citynumber: addressInfo.citynumber,
            districtnumber: addressInfo.districtnumber,
            ItemList: aitemlist
        };

        Lib.API.get('GetFreightInfo', { para: data }, function (data, json) {
            freightSpan.text('￥' + data.freight);
        }, function (code, msg) {
            jAlert(msg);
        }, function (errcode) {
            jAlert(kdAppSet.getAppMsg.workError + "!错误编码 " + errcode);
        });
    }

    function getItemList() {
        var arr = [];
        for (var i = goodsListArr.length - 1; i > -1; i--) {
            var item = goodsListArr[i];
            var iauxtype = +item.auxtype;
            switch (iauxtype) {
                case 0:
                    arr.push({
                        ItemID: item.itemid,
                        Price: item.attrList[0].price,
                        Qty: item.attrList[0].num
                    });
                    break;
                case 1:
                    var attrList1 = item.attrList;
                    for (var j = attrList1.length - 1; j > -1; j--) {
                        arr.push({
                            ItemID: attrList1[j].fitemid,
                            Price: attrList1[j].price,
                            Qty: attrList1[j].num
                        });
                    }
                    break;
                case 2:
                    var attrList2 = item.attrList;
                    for (var k = attrList2.length - 1; k > -1; k--) {
                        arr.push({
                            ItemID: item.itemid,
                            Price: attrList2[k].price,
                            Qty: attrList2[k].num
                        });
                    }
            }
        }
        return arr;
    }

    function show() {
        viewPage.show();
        $('#orderpopupTip').hide();
        scroller.refresh();
    }

    function hide() {
        viewPage.hide();
        jSelect.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();


/*购物车 订单显示界面 零售用户获取促销信息*/
var CacheOrderList_Retail = (function () {

    var samples,
        listData,
        listUl,
        hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            listUl = document.getElementById('cacheOrderList_ul');
            $(listUl).addClass('goodsdetail');
            samples = $.String.getTemplates(listUl.innerHTML, [
                {
                    name: 'li',
                    begin: '<!--2',
                    end: '2-->'
                },
                {
                    name: 'good',
                    begin: '#--good.begin--#',
                    end: '#--good.end--#',
                    outer: '{goods}'
                },
                {
                    name: 'goodli',
                    begin: '#--goodli.begin--#',
                    end: '#--goodli.end--#',
                    outer: '{goodsli}'
                },
                {
                    name: 'gift',
                    begin: '#--gift.begin--#',
                    end: '#--gift.end--#',
                    outer: '{gifts}'
                },
                {
                    name: 'giftli',
                    begin: '#--giftli.begin--#',
                    end: '#--giftli.end--#',
                    outer: '{giftsli}'
                }
            ]);
            hasInit = true;
        }
    }

    //返回商品名称，增加了积分兑换的信息
    function getGoodsPoint(item) {
        var extInfo = '';
        if (item.expoint > 1) {
            if (item.onlyexpoint == 1) {
                extInfo = ' 仅限' + item.expoint + '积分';
            } else {
                extInfo = ' 可用' + item.expoint + '积分';
            }
        }
        return  extInfo;
    }

    //刷新商品列表数据
    function fill(list, scroller) {

        if (list.length == 0) {
            listUl.innerHTML = '';
            scroller.refresh();
            return;
        }

        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        var headTitleHide = '';
        //只有普通商品时  隐藏标题
        if (list.length == 1 && list[0].name == '普通商品') {
            headTitleHide = 'hide';
        }

        listUl.innerHTML = $.Array.map(list, function (item, index) {

            var goodList = item.list;
            var giftList = item.giftList;
            var allPro = item.all || 0; //是否是全场类促销 1表示全场促销
            var moneyStr = kdAppSet.formatMoneyStr(item.money);
            var oldMoneyStr = kdAppSet.formatMoneyStr(item.oldMoney);
            var hideStr = '';
            if (item.money == item.oldMoney) {
                hideStr = 'hide';
            }
            if (allPro == 1) {
                oldMoneyStr = '';
                hideStr = 'hide';
                moneyStr = '-' + kdAppSet.formatMoneyStr(item.rateMoney);
            }

            return $.String.format(samples['li'], {
                'protitle': item.name,
                'sumtitle': item.title,
                'proInfo': item.proInfo,
                'headTitleHide': headTitleHide,
                'titleHide': (item.title == '' || headTitleHide == 'hide' || moneyStr == '-0') ? 'hide' : '',
                'hide': hideStr,
                'sumMoney': oldMoneyStr,
                'sumMoneyDiscount': moneyStr,
                'goods': $.Array.map([""], function () {
                        return $.String.format(samples['good'], {
                            'goodsli': $.Array.map(goodList, function (good) {
                                    return $.String.format(samples['goodli'], {
                                        'goodsname': good.name,
                                        'pointShow': good.expoint == 0 ? 'hide' : '',
                                        'expoint': getGoodsPoint(good),
                                        'goodsimg': good.img == "" ? (imgMode ? "img/no_img.png" : noimgModeDefault) : (imgMode ? kdAppSet.getImgThumbnail(good.img) : noimgModeDefault),
                                        'price': kdAppSet.formatMoneyStr(good.onlyexpoint == 1 ? 0 : good.price),
                                        'num': kdAppSet.clearZero(good.num),
                                        'money': kdAppSet.formatMoneyStr(good.onlyexpoint == 1 ? 0 : good.money)
                                    });
                                }
                            ).join('')
                        });
                    }
                ).join(''),
                'gifts': $.Array.map([""], function () {
                        return $.String.format(samples['gift'], {
                            'gifthide': giftList.length == 0 ? 'hide' : '',
                            'giftsli': $.Array.map(giftList, function (gift) {
                                    return $.String.format(samples['giftli'], {
                                        'giftname': gift.name,
                                        'giftnum': kdAppSet.clearZero(gift.num)
                                    });
                                }
                            ).join('')
                        });
                    }
                ).join('')
            });
        }).join('');
        scroller.refresh(250);
    }


    //调用促销接口的商品列表数据
    function getListData(data) {
        var tempdata = [];
        var inum = data.length;
        var recDate = '';
        for (var i = 0; i < inum; i++) {
            var iauxtype = data[i].auxtype;
            if (iauxtype == 0) {
                var temp = {};
                temp.itemid = data[i].itemid;
                var attrList0 = data[i].attrList;
                temp.qty = attrList0[0].num;
                temp.price = attrList0[0].price;
                temp.orgPrice = attrList0[0].price;

                temp.IsOverseas = data[i].isoverseas;
                temp.UnitID = data[i].unitid;
                temp.AuxID = 0;
                temp.DeliverDate = recDate;

                temp.img = data[i].img;
                temp.name = data[i].name;
                temp.unitname = data[i].unitname;

                temp.expoint = data[i].expoint || 0;
                temp.onlyexpoint = data[i].onlyexpoint || 0;

                var attrListg = data[i].attrList || [];
                if (attrListg.length > 0) {
                    temp.expoint = attrListg[0].expoint || 0;
                    temp.onlyexpoint = attrListg[0].onlyexpoint || 0;
                }

                tempdata.push(temp);
            } else if (iauxtype == 1) {
                var attrList1 = data[i].attrList;
                var jnum = attrList1.length;
                for (var j = 0; j < jnum; j++) {
                    var temp1 = {};
                    temp1.itemid = attrList1[j].fitemid;
                    temp1.qty = attrList1[j].num;
                    temp1.price = attrList1[j].price;
                    temp1.orgPrice = attrList1[j].price;

                    temp1.IsOverseas = data[i].isoverseas;
                    temp1.UnitID = data[i].unitid;
                    temp1.AuxID = 0;
                    temp1.DeliverDate = recDate;


                    temp1.img = data[i].img;
                    temp1.name = MiniQuery.Object.clone(data[i].name + ' - ' + attrList1[j].name);
                    temp1.unitname = data[i].unitname;

                    temp1.expoint = attrList1[j].expoint || 0;
                    temp1.onlyexpoint = attrList1[j].onlyexpoint || 0;

                    tempdata.push(temp1);
                }
            } else if (iauxtype == 2) {
                var attrList2 = data[i].attrList;
                var knum = attrList2.length;
                for (var k = 0; k < knum; k++) {
                    var temp2 = {};
                    temp2.itemid = data[i].itemid;
                    temp2.qty = attrList2[k].num;
                    temp2.price = attrList2[k].price;
                    temp2.orgPrice = attrList2[k].price;

                    temp2.IsOverseas = data[i].isoverseas;
                    temp2.UnitID = data[i].unitid;
                    temp2.AuxID = attrList2[k].fauxid;
                    temp2.DeliverDate = recDate;

                    temp2.img = data[i].img;
                    temp2.name = MiniQuery.Object.clone(data[i].name + ' - ' + attrList2[k].name);
                    temp2.unitname = data[i].unitname;

                    temp2.expoint = attrList2[k].expoint || 0;
                    temp2.onlyexpoint = attrList2[k].onlyexpoint || 0;

                    tempdata.push(temp2);
                }
            }
        }
        return tempdata;
    }

    //合并相同itemid的商品
    function unionGoods(list) {
        var inum = list.length;
        var tempdata = [];
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            var jnum = tempdata.length;
            var bcheck = false;
            for (var j = 0; j < jnum; j++) {
                if (item.itemid == tempdata[j].itemid) {
                    tempdata[j].qty = tempdata[j].qty + item.qty;
                    bcheck = true;
                    break;
                }
            }
            if (!bcheck) {
                tempdata.push({
                    itemid: item.itemid,
                    qty: item.qty,
                    price: item.price,
                    expoint: item.expoint,
                    onlyexpoint: item.onlyexpoint
                });
            }
        }
        return tempdata;
    }

    //构造类似促销接口返回的数据结构
    function getGoodsList(list) {

        var goodslist = setPromotionData(list);
        var iteminfo = {
            discount: [],
            gift: [],
            gifttypecount: 0,
            list: goodslist,
            promotionid: "0",
            promotionname: "普通商品",
            row: 0
        };
        var itemlist = [iteminfo];
        var moeny = getSumMoney(goodslist);
        var para = {
            amount: moeny,
            discountamount: moeny
        };
        return  {
            alllist: [],
            itemlist: itemlist,
            para: para
        };
    }

    //当有仅限积分兑换时 计算金额总计
    function getSumMoney(aData) {
        var sumMoney = 0;
        for (var i in aData) {
            var item = aData[i];
            sumMoney += item.onlyexpoint == 1 ? 0 : item.price * item.qty;
        }
        return sumMoney;
    }

    //不调用促销接口时，设置商品折后价格
    function setPromotionData(data) {
        var aData = MiniQuery.Object.clone(data);
        var list = [];
        for (var i in aData) {
            var item = aData[i];
            item.promotionID = 0;
            item.discountprice = item.price;
            /*            if (item.onlyexpoint == 1) {
             //仅限积分兑换 价格设置为0
             item.discountprice = 0;
             item.price = 0;
             } else {
             item.discountprice = item.price;
             }*/
            list.push(item);
        }
        return list;
    }


    //expoints  商品的兑换积分   fn回调函数
    function getPromotion(list, scroller, fn, billInfo, expoints) {
        initView();
        kdAppSet.setKdLoading(true, "获取促销信息...");
        var user = kdAppSet.getUserInfo();
        listData = getListData(list);
        var listData2 = unionGoods(listData);
        //使用积分兑换,不走促销流程
        if (expoints > 0) {
            var data = getGoodsList(listData2);
            freshViewList(data, scroller, fn, billInfo);
            setTimeout(2000, function () {
                scroller.refresh();
            });
            return;
        }

        var paraData = {
            'shopid': user.storeid,
            'vipid': user.vipid,
            'list': listData2
        };
        var para = {para: paraData};
        var apiname = 'GetPromotionForOrder';
        Lib.API.get(apiname, para,
            function (data, json) {
                freshViewList(data, scroller, fn, billInfo);
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function (errcode) {
                kdAppSet.setKdLoading(false);
                jAlert(kdAppSet.getAppMsg.workError + "!错误编码 " + errcode);
            });
    }

    function freshViewList(data, scroller, fn, billInfo) {
        try {
            var para = data.para || {};
            var billPoint = para.points || 0;
            if (billPoint < 0) {
                billPoint = 0;
            };
        } catch (e) {
        }
        kdAppSet.setKdLoading(false);
        $('#summitOrder').show();
        listData = DataHelp.formatList(listData, data);
        fill(listData, scroller);
        var sum = DataHelp.formatSum(data);
        billInfo.money = sum.proMoney;
        var totalMoney = '￥' + kdAppSet.formatMoneyStr(sum.proMoney);
        $('.view_cacheOrderList [data-cmd="totalMoney"]')[0].innerText = totalMoney;
        var totalMoneyOrg = '';
        if (sum.proMoney != sum.oldMoney) {
            totalMoneyOrg = '￥' + kdAppSet.formatMoneyStr(sum.oldMoney);
        }
        $('.view_cacheOrderList [data-cmd="totalMoneyOrg"]')[0].innerText = totalMoneyOrg;
        $("#viewid_cacheOrderList").find(".divbillmoney span").text(totalMoney);
        fn && fn(billPoint);
    }

    function getSubmitData() {
        var tempdata = [];
        var data = listData;
        var inum = data.length;
        for (var i = 0; i < inum; i++) {

            var item = data[i];
            var goodList = item.list;
            var giftList = item.giftList;

            var alist = getSubmitDataList(goodList);
            if (alist.length > 0) {
                tempdata = tempdata.concat(alist);
            }
            var alist2 = getSubmitDataList(giftList);
            if (alist2.length > 0) {
                tempdata = tempdata.concat(alist2);
            }
        }
        return tempdata;
    }

    function getFreightData() {
        var tempdata = [];
        var data = listData;
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var item = data[i];
            var goodList = item.list;
            var alist = getFreightDataList(goodList);
            if (alist.length > 0) {
                tempdata = tempdata.concat(alist);
            }
        }
        return tempdata;
    }

    function getFreightDataList(list) {
        var tempdata = [];
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            tempdata.push({
                ItemID: item.itemid,
                Qty: item.qty,
                Price: item.discountPrice
            });
        }
        return tempdata;
    }

    function getSubmitDataList(list) {
        var tempdata = [];
        var inum = list.length;
        for (var i = 0; i < inum; i++) {
            var item = list[i];
            var temp = {};
            temp.MaterialID = item.itemid;
            temp.IsOverseas = item.IsOverseas;
            temp.UnitID = item.UnitID;
            temp.AuxID = item.AuxID;
            temp.Qty = item.num;
            temp.Price = item.orgPrice;
            temp.DiscountPrice = item.discountPrice;
            temp.IsGift = item.gift || 0;
            temp.ActivityID = item.promotionid;
            temp.DeliverDate = '';
            //前端计算金额使用
            temp.expoint = item.expoint || 0;
            temp.onlyexpoint = item.onlyexpoint || 0;
            tempdata.push(temp);
        }
        return tempdata;
    }


    //对促销返回的数据进行格式化
    var DataHelp = (function () {

        var Object = MiniQuery.Object;

        //获取一般促销方案商品列表
        function getProList1(list, itemlist) {
            var listdata = [];
            for (var i = 0, len = itemlist.length; i < len; i++) {
                var item = itemlist[i];
                var extInfo = '';
                var list2 = getList(item.list, item.gift, list);
                var giftCount = item.gifttypecount || 0;
                var giftList = [];
                if (item.gift.length > 0) {
                    giftList = getGiftList(item.gift);
                }
                var sum = getListSum(list2);
                var money = getMoney(sum.money, item.discount);
                if (item.discount && item.discount.length > 0) {
                    var disitem = item.discount[0];
                    if (disitem.type == 0) {
                        extInfo = ' (' + kdAppSet.clearZero(disitem.value) + '折优惠)';
                    } else if (disitem.type == 1) {
                        extInfo = ' (优惠' + kdAppSet.clearZero(disitem.value) + '元)';
                    }
                }
                var promotion = {
                    'name': item.promotionname || '',
                    'giftCount': giftCount, //赠品数量
                    'giftList': giftList, //赠品列表
                    'money': money, //优惠后金额
                    'oldMoney': sum.money, //优惠前金额
                    'rateMoney': sum.money - money, //优惠金额
                    'title': '小计:',
                    'proInfo': extInfo,
                    'list': list2
                };
                listdata.push(promotion);
            }
            return listdata;
        }


        //获取全场促销方案商品列表  money商品列表的总优惠价
        function getProList2(money, itemlist) {

            var listdata = [];
            var money2 = 0;
            var money3 = 0;
            for (var i = 0, len = itemlist.length; i < len; i++) {
                var item = itemlist[i];
                var list2 = getList([], item.gift, []);
                var disList = item.discount || [];
                var disItem = {};
                var onlyGift = 1;
                if (disList.length > 0) {
                    disItem = disList[0];
                    onlyGift = 0;
                }
                var title = getTitle(disItem);
                if (i == 0) {
                    money2 = money;
                } else {
                    money2 = money3;
                }
                money3 = getRateMoney(money2, disItem);
                var giftCount = item.gifttypecount || 0;
                var giftList = [];
                if (item.gift.length > 0) {
                    giftList = getGiftList(item.gift);
                }
                var promotion = {
                    'name': item.promotionname || '',
                    'giftCount': giftCount, //赠品数量
                    'giftList': giftList, //赠品列表
                    'money': money3, //优惠后金额
                    'oldMoney': money2, //优惠前金额
                    'all': 1, //表示属于全场促销 的赠品类  计算金额 不要重复加
                    'rateMoney': money2 - money3, //优惠金额
                    'title': '小计:',
                    'proInfo': title,
                    'onlyGift': onlyGift,
                    'list': list2
                };
                listdata.push(promotion);
            }
            return listdata;
        }


        //计算所有促销方案的合计 优惠金额
        function getAllMoney(list) {
            var money = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                money = money + list[i].money;
            }
            return money;
        }

        //计算某个促销方案的小计 优惠金额
        function getMoney(money, list) {
            for (var i = 0, len = list.length; i < len; i++) {
                money = getRateMoney(money, list[i]);
            }
            return money;
        }

        //计算某个优惠方案的 优惠金额
        function getRateMoney(money, item) {
            if (item.type == 0) {
                money = money * item.value / 10;
            } else if (item.type == 1) {
                money = money - item.value;
            }
            return money;
        }

        //获取小计标题头
        function getTitle(item) {
            var title = '';
            if (item.type == 0) {
                title = '(' + kdAppSet.clearZero(item.value) + '折)';
            } else if (item.type == 1) {
                title = '(优惠' + kdAppSet.clearZero(item.value) + '元)';
            }
            return title;
        }

        //itemlist  按促销分类的商品列表  gift 赠品列表  list 原商品列表
        function getList(itemlist, gift, list) {
            var listdata = [];
            var item = {};
            for (var i = 0, len = itemlist.length; i < len; i++) {
                item = getGoodsItem(list, itemlist[i]);
                if (item) {
                    if (item instanceof  Array) {
                        listdata = listdata.concat(item);
                    } else {
                        listdata.push(item);
                    }
                }
            }
            return listdata;
        }

        //如果商品是仅限积分兑换 要把金额去掉
        function setItem(item) {
            /*            if (item.onlyexpoint == 1) {
             item.price = 0;
             item.money = 0;
             item.discountPrice = 0;
             item.discountMoney = 0;
             }*/
            return item;
        }

        //list 原商品列表 ,item 促销方案商品
        function getGoodsItem(list, item) {
            var itemid = item.itemid;
            var proNum = item.qty;
            if (item.discountprice < 0) {
                item.discountprice = 0;
            }
            var aitem = null;
            //商品id跟数量刚好匹配
            for (var j = 0, len2 = list.length; j < len2; j++) {
                if (itemid == list[j].itemid && list[j].hasMatch != 1 && proNum == list[j].qty) {
                    list[j].hasMatch = 1;
                    list[j].num = item.qty;
                    list[j].promotionid = item.promotionID;
                    list[j].money = list[j].price * list[j].num;
                    list[j].discountMoney = item.discountprice * list[j].num;
                    list[j].discountPrice = item.discountprice;
                    aitem = Object.clone(list[j]);
                    return setItem(aitem);
                }
            }
            //商品id跟数量,能找到原商品数量大于促销方案数量的
            for (var j = 0, len2 = list.length; j < len2; j++) {
                if (itemid == list[j].itemid && list[j].hasMatch != 1) {
                    if (list[j].qty > proNum) {
                        list[j].num = item.qty;
                        list[j].promotionid = item.promotionID;
                        list[j].money = list[j].price * list[j].num;
                        list[j].discountMoney = item.discountprice * list[j].num;
                        list[j].discountPrice = item.discountprice;
                        aitem = Object.clone(list[j]);
                        list[j].qty = list[j].qty - proNum; //减去已经匹配的数量
                        return setItem(aitem);
                    }
                }
            }
            //商品id跟数量,需要多个原商品数量相加才能等于促销方案数量
            var sumNum = 0;
            var alist = [];
            for (var j = 0, len2 = list.length; j < len2; j++) {
                if (itemid == list[j].itemid && list[j].hasMatch != 1) {
                    sumNum = sumNum + list[j].qty;
                    if (sumNum >= proNum) {
                        if (sumNum == proNum) {
                            list[j].hasMatch = 1;
                            list[j].num = list[j].qty;
                        } else {
                            list[j].num = list[j].qty - (sumNum - proNum);
                        }
                        list[j].promotionid = item.promotionID;
                        list[j].money = list[j].price * list[j].num;
                        list[j].discountMoney = item.discountprice * list[j].num;
                        list[j].discountPrice = item.discountprice;
                        aitem = Object.clone(list[j]);
                        alist.push(setItem(aitem));
                        return alist;
                    } else {
                        list[j].hasMatch = 1;
                        list[j].num = list[j].qty;
                        list[j].promotionid = item.promotionID;
                        list[j].money = list[j].price * list[j].num;
                        list[j].discountMoney = item.discountprice * list[j].num;
                        list[j].discountPrice = item.discountprice;
                        aitem = Object.clone(list[j]);
                        alist.push(setItem(aitem));
                    }
                }
            }

            return null;
        }

        // gift 赠品列表
        function getGiftList(gift) {
            var listdata = [];
            var item = {};
            for (var i = 0, len = gift.length; i < len; i++) {
                item = formatItem(gift[i]);
                if (item.default == 1) {
                    item.money = 0;
                    item.num = item.qty;
                    item.discountPrice = 0;
                    item.discountMoney = 0;
                    listdata.push(Object.clone(item));
                }
            }
            return listdata;
        }

        //格式化赠品数据
        function formatItem(item) {
            return {
                'itemid': item.itemid,
                'promotionid': item.promotionID,
                'qty': item.qty,
                'model': item.model,
                'price': item.saleprice,
                'orgPrice': item.saleprice,
                'money': item.qty * item.saleprice,
                'name': item.name,
                'UnitID': item.unitid,
                'unitname': item.unitname,
                'default': item.isdefault,
                'gift': 1,
                'AuxID': 0,
                'DeliverDate': '',
                'img': '',
                'IsOverseas': 0
            };

        }

        //获取某个促销方案 商品的原价总金额与数量
        function getListSum(listdata) {
            var len = listdata.length;
            var money = 0;
            var num = 0;
            for (var i = 0; i < len; i++) {
                if (!listdata[i].gift) {
                    money = money + listdata[i].num * listdata[i].price;
                    num = num + listdata[i].num;
                }
            }
            return {
                'money': money,
                'num': num
            };
        }


        //按优先级排序
        function PriorAsc(x, y) {
            if (x.fullorall > y.fullorall) {
                return 1;
            } else if (x.fullorall < y.fullorall) {
                return -1;
            }
            return 0;
        }


        //格式化返回商品列表数据
        function formatList(list, listNew) {

            if (list.length == 0) {
                return [];
            }

            //先按优先级排序
            var discountList = listNew.discount || [];
            if (discountList.length > 1) {
                discountList.sort(PriorAsc);
            }

            var giftList = listNew.gift || [];
            if (giftList.length > 1) {
                giftList.sort(PriorAsc);
            }

            var listdata = [];
            //一般促销方案商品列表
            var list1 = getProList1(list, listNew.itemlist);
            listdata = listdata.concat(list1);

            //全场促销方案商品列表
            var money = getAllMoney(listdata);
            var list2 = getProList2(money, listNew.alllist);
            listdata = listdata.concat(list2);

            return listdata;
        }

        //格式化返回商品总计数据
        function formatSum(list) {
            var total = list.para || {};
            var proMoney = total.discountamount || 0;
            var calc = getFreeMoney(proMoney);
            return $.extend({}, {
                'oldMoney': total.amount || 0,//商品原价总计
                'proMoney': proMoney > 0 ? proMoney : 0,//商品优惠后总计
                'freeMoney': calc.free,//抹零金额
                'payMoney': calc.pay//应付金额
            });
        }

        //获取抹零金额
        function getFreeMoney(money) {
            return  {
                'pay': money,
                'free': 0
            };
        }

        return {
            'formatList': formatList,
            'formatSum': formatSum
        }


    })();

    return {
        getPromotion: getPromotion,
        getFreightData: getFreightData,
        getSubmitData: getSubmitData
    };


})();


var GoodsCategory = (function () {
    var $view,
        $loading,
        hasInit,
        hasBind,
        $ulLeft,
        $ulRight,
        samplesLeft,
        samplesRight,
        hasLvl2,
        hasLvl3,
        hasCurrentLvl3, //当前激活类目是否有3级类目
        currentGroup, //当前激活一级类目
        scrollerLeft,
        scrollerRight,
        list;

    function render() {
        init();
        BindEvents();
        loadData();
        show();
    }

    function init() {
        if (hasInit) {
            return;
        }
        initVariable();
        scrollerLeft = Lib.Scroller.create('#div-left', {scrollbars: false});
        scrollerRight = Lib.Scroller.create('#div-right');
        hasInit = true;
    }

    function initVariable() {
        $view = $('#view-category');
        $loading = $('#div-loading');
        $ulLeft = $('#ul-left');
        $ulRight = $('#ul-right');
        samplesLeft = $.String.between($ulLeft.html(), '<!--', '-->');
        samplesRight = $.String.getTemplates($ulRight.html(), [
            {
                name: 'ul',
                begin: '<!--',
                end: '-->'
            },
            {
                name: 'item',
                begin: '#--item.begin--#',
                end: '#--item.end--#',
                outer: '{items}'
            }
        ]);
    }

    function BindEvents() {
        if (hasBind) {
            return;
        }
        $view
            .delegate('.search', 'click', function () {
                MiniQuery.Event.trigger(window, 'toview', ['GoodsSearch', {noBack: true}]);
            })
            .delegate('[data-cmd="qrcode"]', {
                //扫一扫
                'click': function () {
                    kdAppSet.stopEventPropagation();
                    kdAppSet.wxScanQRCode();
                },
                'touchstart': function () {
                    $(this).css('color', '#bababa');
                    var img = $(this).find('.code');
                    img.removeClass('sprite-qrcode');
                    img.addClass('sprite-qrcode_s');
                },
                'touchend': function () {
                    $(this).css('color', '#a9a9a9');
                    var img = $(this).find('.code');
                    img.addClass('sprite-qrcode');
                    img.removeClass('sprite-qrcode_s');
                }
            });

        $ulLeft.delegate('li',
            {
                'click': function () {

                    if (hasLvl2) {
                        if (currentGroup == $(this).attr('data-index')) {
                            return;
                        }
                        currentGroup = +$(this).attr('data-index');
                        var index = +$(this).attr('data-index');
                        $ulLeft.find('li').removeClass('active');
                        $ulLeft.find('li[data-index="' + index + '"]').addClass('active');
                        renderRight(list[index].child);
                        return;
                    }
                    var index = +$(this).attr('data-index');
                    gotoList(list[index]);
                },
                'touchstart': function () {
                    if (hasLvl2) {
                        return;
                    }
                    $(this).css('color', '#ff5837');
                },
                'touchend': function () {
                    if (hasLvl2) {
                        return;
                    }
                    $(this).css('color', '#000');
                }
            });

        $ulRight.delegate('li[data-group]',
            {
                'click': function () {
                    if (hasCurrentLvl3) {
                        return;
                    }
                    var i = +$(this).attr('data-group');
                    gotoList(list[currentGroup].child[i]);
                },
                'touchstart': function () {
                    if (hasCurrentLvl3) {
                        return;
                    }
                    $(this).css('background-color', '#ebebeb');
                },
                'touchend': function () {
                    if (hasCurrentLvl3) {
                        return;
                    }
                    $(this).css('background-color', '#fff');
                }
            });

        $ulRight.delegate('.item', 'click', function () {
            var i = $(this).parent().parent().attr('data-group');
            var j = $(this).attr('data-index');
            gotoList(list[currentGroup].child[i].child[j]);
        }).delegate('.category-title', {
            'touchstart': function () {
                $(this).addClass('hover');
            },
            'touchend': function () {
                $(this).removeClass('hover');
            }
        });


        hasBind = true;
    }

    //跳转到列表视图
    function gotoList(item) {
        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {
            title: item.name,
            ItemType: item.itemid,
            tabindex: 0,
            keyword: '',
            reload: true,
            fromPage: 1
        }]);
    }

    function loadData() {
        if (list) {   //读取缓存数据
            fillWithData();
            return;
        }
        toggleLoading(true);

        Lib.API.get('GetItemClass', {
            currentPage: 1,
            ItemsOfPage: 1000,
            para: {}
        }, function (data) {
            var datalistTmp = data['itemlist'] || [];
            list = dealViewData(datalistTmp);
            toggleLoading(false);
            fillWithData();
        }, function (code, msg) {
            toggleLoading(false, msg);
        }, function () {
            toggleLoading(false, '网络错误，请稍候再试');
        }, "");
    }

    function toggleLoading(bool, msg) {
        if (bool) {
            $('#div-left').hide();
            $loading.show();
            $loading.empty();
            $loading.children().filter('.hintflag').remove();
            $loading.append('<div class="hintflag" style="width: 100%;">' + Lib.LoadingTip.get() + '</div>');
            $loading.children().filter('.spacerow').remove();
            $loading.append('<div class="spacerow"></div>');
            return;
        }
        if (msg === undefined) {
            $loading.hide();
        }
        $('#div-left').show();
        $loading.append('<li class="hintflag">' + msg + '</li>');
        $loading.children().filter('.hintflag').remove();
        $loading.children().filter('.spacerow').remove();
    }

    function dealViewData(data) {
        //1 先把数据分层级放开
        var list1 = [];
        var list2 = [];
        var list3 = [];
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            var item = data[i];
            var ilevel = Number(item.FLevel);
            var item = {itemid: item.FItemID, name: item.FName, parentid: item.FParentID};
            switch (ilevel) {
                case 1:
                    list1.push(item);
                    break;
                case 2:
                    list2.push(item);
                    break;
                case 3:
                    list3.push(item);
                    break;
            }
        }
        hasLvl2 = !!list2.length;
        hasLvl3 = !!list3.length;
        //处理第2层级数据的节点关系
        inum = list2.length;
        for (var i = 0; i < inum; i++) {
            list2[i].child = getChildList(list3, list2[i].itemid);
        }
        //处理第1层级数据的节点关系
        inum = list1.length;
        for (var i = 0; i < inum; i++) {
            list1[i].child = getChildList(list2, list1[i].itemid);
        }
        return list1;
    }

    function getChildList(list, itemid) {
        var childlist = [];
        var inum = list.length;
        for (var i = inum - 1; i >= 0; i--) {
            if (list[i].parentid == itemid) {
                childlist.push(list[i]);
                list.splice(i, 1);
            }
        }
        if (childlist.length > 0) {
            childlist = childlist.reverse();
        }
        return childlist;
    }

    function fillWithData() {
        if (list.length < 1) {
            $loading.html(kdAppSet.getEmptyMsg());
            $loading.show();
            return;
        }
        renderLeft(list);
        renderRight(list[0].child);
    }

    function renderLeft(data) {
        if (hasLvl2) {
            $ulLeft.parent().removeClass('left-single');
            $ulRight.show();
        }
        else {
            $ulLeft.parent().addClass('left-single');
            $ulRight.hide();
        }

        var s = $.Array.keep(data, function (item, index) {
            return $.String.format(samplesLeft, {
                index: index,
                name: item.name
            });
        }).join('');
        $ulLeft.html(s);
        if (hasLvl2) {
            $ulLeft.find('li[data-index="0"]').addClass('active');
        }
        currentGroup = 0;
        setTimeout(function () {
            scrollerLeft.refresh()
        }, 50);
    }

    function renderRight(data) {
        hasCurrentLvl3 = IsLvl3(data);
        if (!data.length) {
            $ulRight.html(kdAppSet.getEmptyMsg());
            return;
        }
        if (!hasCurrentLvl3) {
            $ulRight.addClass('right-single');
        }
        else {
            $ulRight.removeClass('right-single');
        }
        var s = $.Array.keep(data, function (item, index) {
            return $.String.format(samplesRight.ul, {
                index: index,
                title: item.name,
                items: getLvl3(item.child)
            });
        }).join('');
        $ulRight.html(s);
        setTimeout(scrollerRight.refresh(), 0);
    }

    function getLvl3(data) {
        var s = $.Array.keep(data, function (item, index) {
            return $.String.format(samplesRight.item, {
                index: index,
                name: item.name,
                url: item.url || 'img/no_img_mode.png'
            });
        }).join('');
        return s;
    }

    function IsLvl3(data) {
        for (var i = data.length - 1; i > -1; i--) {
            if (data[i].child.length > 0)
                return true;
        }
        return false;
    }

    function show() {
        kdAppSet.setAppTitle('商品');
        $view.css('display', '-webkit-box');
        scrollerLeft.refresh();
        scrollerRight.refresh();    //未知BUG，从此视图进搜索页面，页面高度变化时回退到此视图scroller滚动失效
        OptAppMenu.selectKdAppMenu("typeId");
        OptAppMenu.showKdAppMenu(true);
    }

    function hide() {
        $view.hide();
        OptAppMenu.showKdAppMenu(false);
    }


    return {
        render: render,
        show: show,
        hide: hide
    }
})();


/*商品列表排序页面*/

var GoodsListSort = (function () {

    var viewPage;
    var config;
    var sortInfo = {};
    /*false  表示降序 true 表示升序*/
    var sortList = {
        '0': false,
        '1': false,
        '2': false,
        '3': false,
        '4': false,
        '5': false
    };


    function initView() {
        if (!viewPage) {
            viewPage = $('#viewid-goodslist-sort');
            sortInfo = {
                key: 5,
                asc: false
            };
            bindEvents();
        }
    }

    function bindEvents() {

        viewPage.on('click', '[data-cmd="order-ul"] li', function () {
            //选中某一行
            var key = this.getAttribute('data-cmd');
            sortInfo = {
                key: key,
                asc: sortList[key]
            };
            setSelect($(this));


        }).on('click', '[data-cmd="order"]', function () {
            //切换排序方式
            setOrder($(this));

        }).on({
            'click': function () {
                kdShare.backView();
                setTimeout(function () {
                    config.callBack && config.callBack(sortInfo);
                }, 250);

            }, 'touchstart': function () {
                $(this).addClass('touched');
            },
            'touchend': function () {
                $(this).removeClass('touched');
            }

        }, '[data-cmd="ok"]');

    }

    function setOrder($this) {

        var $li = $this.parent();
        var key = $li.attr('data-cmd');
        $li.find('span').removeClass('on');

        sortList[key] = !sortList[key];
        sortList[key] ? $this.find('.up').addClass('on') : $this.find('.down').addClass('on');
        sortInfo = {
            key: key,
            asc: sortList[key]
        };
    }

    function setSelect($this) {
        var $li = viewPage.find('[data-cmd="order-ul"] li');
        $li.removeClass('default-icon-chose');
        $li.find('[data-cmd="order"]').addClass('hide');
        $this.addClass('default-icon-chose');
        $this.find('[data-cmd="order"]').removeClass('hide');
    }


    function render(args) {
        config = args;
        initView(config);
        show();
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
        hide: hide,
    };

})();


/*
 *
 * 输入搜索关键字以及点击搜索历史记录查找商品
 * 历史记录保存在客户端
 */

var GoodsSearch = (function () {
    //搜索视图
    var viewPage,
    //搜索历史列表
        historyList,
    //是否已初始化
        hasInit,
    //是否已绑定事件
        hasBind,
    //搜索历史列表滚动scroll
        scroller,
        scrollerFilter,
        ullist,
        ulFilter,
        viewSample,
        sampleFilter,
        searchTxt,
        listFilter,
        selected,
        vheight,
        historyCacheKey;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid_searchPage');
            ullist = viewPage.find(".historyList")[0];
            viewSample = $.String.between(ullist.innerHTML, '<!--', '-->');
            var divList = document.getElementById('viewid_searchPage_content');
            var divFilter = document.getElementById('div_viewid_searchPage_filter');
            scroller = Lib.Scroller.create(divList);
            scrollerFilter = Lib.Scroller.create(divFilter);
            historyCacheKey = "searchHistoryKeyWords";
            historyList = [];
            selected = 'on sprite-btn-filter';
            searchTxt = $('.view_searchPage #inputTxt');
            ulFilter = document.getElementById('viewid_searchPage_filter');
            sampleFilter = $.String.between(ulFilter.innerHTML, '<!--', '-->');
            bindEvents();
            listFilter = kdAppSet.getUserInfo().taglist;
            vheight = $(window).height();
            hasInit = true;
        }
    }

    function resize() {
        //这里会执行2次 以后可优化
        var viewFilter = viewPage.find('.filter');
        if (vheight != $(window).height()) {
            viewFilter.hide();
        } else {
            viewFilter.show();
        }
    }


    //数组排序 key 排序字段 asc 是否升序
    function keySort(key, asc) {
        return function (x, y) {
            if (x[key]) {
                return asc ? 1 : -1;
            } else if (y[key]) {
                return asc ? -1 : 1;
            }
            return 0;
        }
    }

    //填充过滤tag数据
    function fillFilter() {

        listFilter.sort(keySort('selected'));
        ulFilter.innerHTML = $.Array.keep(listFilter, function (item, index) {
            return $.String.format(sampleFilter, {
                id: item.id,
                name: item.name,
                selected: item.selected ? selected : ''
            });
        }).join('');
        var viewFilter = viewPage.find('.filter');
        listFilter.length > 0 ? viewFilter.show() : viewFilter.hide();
        scrollerFilter.scrollTo(0, 0);
        scrollerFilter.refresh();
    }

    function getTaglist() {
        var listid = [];
        var list = listFilter;
        var item;
        for (var i in list) {
            item = list[i];
            if (item.selected) {
                listid.push(item.id);
            }
        }
        return listid;
    }

    // 消除字符串两端空格
    function getTrimStr(str) {
        var reg = new RegExp('(^\\s*)|(\\s*$)', 'g');
        return str.replace(reg, '');
    }

    // 获取localStorage中的历史记录
    function getHistoryList() {
        if (window.localStorage[historyCacheKey]) {
            historyList = window.JSON.parse(window.localStorage[historyCacheKey]);
        }
    }

    // 将 历史记录保存到localStorage中
    function setHistoryList() {
        window.localStorage[historyCacheKey] = window.JSON.stringify(historyList);
    }


    // 保存输入的查询字符串
    function saveSearchTxt() {
        var inputTxt = searchTxt.val();
        var tempList = [];

        inputTxt = getTrimStr(inputTxt);
        if (inputTxt == '') {
            return false;
        }

        // 最新的搜索出现在历史列表的最前面
        tempList.push(inputTxt);
        // 如果输入的文本与历史记录中的相同，将历史记录中的删除
        for (var i = 0; i < historyList.length && i < 3; i++) {
            if (historyList[i] != inputTxt) {
                tempList.push(historyList[i]);
            }
        }
        historyList = tempList;
        setHistoryList();
    }

    // 填充历史记录列表
    function fillList(data) {
        ullist.innerHTML = $.Array.keep(data, function (item, index) {
            return $.String.format(viewSample, {
                historyTxt: item
            });
        }).join('');
        if (data.length == 0) {
            ullist.innerHTML = '';
            displayClearBtn();
        }
    }

    // 显示与隐藏清楚记录按键
    function displayClearBtn() {
        var clearBtn = $('.view_searchPage .clearDiv');
        var emptyDiv = $('.view_searchPage .emptyDiv');
        if (historyList.length > 0) {
            emptyDiv.css('display', 'none');
            clearBtn.css('display', 'block');
        } else {
            clearBtn.css('display', 'none');
            emptyDiv.css('display', 'block');
        }
    }


    function serach() {
        var KeyWord = $(searchTxt).val();
        var newkey = kdShare.ReplaceSChar(KeyWord);

        if (newkey != KeyWord) {
            searchTxt.val(newkey);
        }
        saveSearchTxt();
        var taglist = getTaglist();
        //noRepeat true 回退时 不能重复
        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {noRepeat: true, title: '商品搜索',
            tabindex: 0, keyword: newkey, hideCategory: false, taglist: taglist, reload: true}]);
        searchTxt.val('');
        fillList(historyList);
        displayClearBtn();
    }

    // 绑定事件
    function bindEvents() {

        viewPage.delegate('.searchTxt .imgClear', {
            'click': function () {
                searchTxt.val('');
                searchTxt.focus();
            }
        });

        // 阻断form表单默认事件
        viewPage.delegate('.searchTxt form', {
            'submit': function () {
                serach();
                return false;  //阻断
            }
        });

        //搜索按钮 事件
        viewPage.delegate('.cancelBtn', {
            'click': function () {
                serach();
                return false;  //阻断
            },
            'touchstart': function () {
                $(this).css({ 'background-color': '#ccc' });
            },
            'touchend': function () {
                $(this).css({ 'background-color': '#EFEFEF' });
            }
        });

        viewPage.delegate('.historyList li', {
            'click': function () {
                searchTxt.val(this.innerHTML);
            },
            'touchstart': function () {
                $(this).css({ 'background-color': '#ccc' });
            },
            'touchend': function () {
                $(this).css({ 'background-color': '#f5f5f5' });
            }
        }).delegate('.filter li', {
            'click': function () {
                var id = this.getAttribute('data-id');
                var list = listFilter;
                var item;
                for (var i in list) {
                    item = list[i];
                    if (item.id == id) {
                        item.selected = !!item.selected;
                        item.selected = !item.selected;
                        item.selected ? $(this).addClass(selected) : $(this).removeClass(selected);
                        break;
                    }
                }
            }});

        viewPage.delegate('.clearDiv input', {
            'click': function () {
                historyList = [];
                setHistoryList();
                ullist.innerHTML = '';
                displayClearBtn();
            },
            'touchstart': function () {
                $(this).css({ 'background-color': '#ccc' });
            },
            'touchend': function () {
                $(this).css({ 'background-color': '#f5f5f5' });
            }
        });
    }


    // 页面构建函数
    function render() {
        initView();
        show();
        getHistoryList();
        displayClearBtn();
        fillList(historyList);
        fillFilter();
        searchTxt.val('');
        searchTxt.focus();
    }

    function show() {
        viewPage.show();
        kdAppSet.setAppTitle('商品搜索');
        window.addEventListener('resize', resize);
    }


    return {
        render: render,
        show: show,
        hide: function () {
            viewPage.hide();
            kdAppSet.setAppTitle('');
            window.removeEventListener("resize", resize);
        }
    };
})();

var Home = (function () {
    var div,
        viewPage,
        scroller,
        SwipeWrap,
        sampleImg,
        sampleImgli,
        sampleImgList,
        sampleNameList,
        nameList,
        SliderPosi,
        imageViewList,
        firstLoad,
        noImage,
        imglistSwipe,
        hasInit,
        config,
        iX,
        iY,
        homeDataList;


    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('viewid_home');
            viewPage = $(div);
            if (kdAppSet.getAppParam().isSubscribe == 1 || kdAppSet.getUserInfo().wxservicenumberurl == "" || kdAppSet.isPcBrower()) {
                viewPage.find('[data-cmd="followme"]').removeClass();
            }
            var scrollList = document.getElementById('homeViewList');
            scroller = Lib.Scroller.create(scrollList, { scrollbars: false });
            SwipeWrap = document.getElementById('homeSwipeWrap');
            sampleImg = $.String.between(SwipeWrap.innerHTML, '<!--', '-->');
            SliderPosi = document.getElementById('homeSliderPosi');
            sampleImgli = $.String.between(SliderPosi.innerHTML, '<!--', '-->');
            imageViewList = $('#homeSwipeWrap');
            nameList = document.getElementById('nameList');
            sampleNameList = $.String.getTemplates(nameList.innerHTML, [
                {
                    name: 'nameList',
                    begin: '#--nameList.begin--#',
                    end: '#--nameList.end--#'
                }
            ]);
            sampleImgList = $.String.getTemplates(nameList.innerHTML, [
                {
                    name: 'imgList',
                    begin: '#--ImgList.begin--#',
                    end: '#--ImgList.end--#'
                }
            ]);
            noImage = 'img/no_img.png';
            bindEvents();
            firstLoad = true;
            hasInit = true;
        }
    }

    function showView(viewName, config) {
        kdAppSet.stopEventPropagation();
        config = config || {};
        MiniQuery.Event.trigger(window, 'toview', [viewName, config]);
    }



    function bindEvents() {


        //刷新商品列表
        MiniQuery.Event.bind(window, {
            'Home_refresh': function () {
                getGoodsList();
            }
        });


        viewPage.delegate('.search', {
            //搜索
            'click': function () {
                showView('GoodsSearch');
            }
        })
            .delegate('.more', {
                'touchstart': function () {
                    $(this).addClass('touched');
                },
                'touchend': function () {
                    $(this).removeClass('touched');
                }
            })
            .delegate('#home_hotlist  .more', {
                //推荐 导购
                'click': function () {
                    var tiltleName = viewPage.find('#home_hotlist .title')[0].innerHTML;
                    showView('HotList', { title: tiltleName, fromPage: 0 });
                }
            })
            .delegate('#home_newlist  .more', {
                //新品
                'click': function () {
                    var tiltleName = viewPage.find('#home_newlist .title')[0].innerHTML;
                    showView('GoodsList', { tabindex: 1, title: tiltleName, fromPage: 0, hideCategory: true, reload: true });
                }
            })
            .delegate('#home_cxlist .more', {
                //促销
                'click': function () {
                    var tiltleName = viewPage.find('#home_cxlist .title')[0].innerHTML;
                    showView('GoodsList', { tabindex: 2, title: tiltleName, fromPage: 0, hideCategory: true, reload: true });
                }
            })
            .delegate('#homeSwipeWrap img', {
                //首页广告图片
                'click': function () {
                    var optid = this.getAttribute('data-optid');
                    switch (optid) {
                        case 'xp':
                            showView('GoodsList', { tabindex: 1, fromPage: 0, hideCategory: true, reload: true });
                            break;
                        case 'cx':
                            showView('GoodsList', { tabindex: 2, fromPage: 0, hideCategory: true, reload: true });
                            break;
                        case 'tj':
                            showView('HotList', { fromPage: 0 });
                            break;
                    }
                }
            })
            .delegate('.imgList2 li', {
                //商品详情
                'click': function () {
                    var goodsid = this.getAttribute('data-goodsid');
                    showView('GoodsDetail', { item: { itemid: goodsid } });
                }
            })
            .delegate('[data-cmd="qrcode"]', {
                //扫一扫
                'click': function () {
                    kdAppSet.stopEventPropagation();
                    kdAppSet.wxScanQRCode();
                },
                'touchstart': function () {
                    $(this).css('color', '#bababa');
                    var img = $(this).find('.code');
                    img.removeClass('sprite-qrcode');
                    img.addClass('sprite-qrcode_s');
                },
                'touchend': function () {
                    $(this).css('color', '#a9a9a9');
                    var img = $(this).find('.code');
                    img.addClass('sprite-qrcode');
                    img.removeClass('sprite-qrcode_s');
                }
            })
            .delegate('[data-cmd="followme"]', {
                //关注我
                'click': function () {
                    var userInfo = kdAppSet.getUserInfo();
                    MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                        { imgobj: userInfo.wxservicenumberurl, imgname: userInfo.wxservicenumber, type: 'followme' }]);
                },
                'touchstart': function (event) {
                    iX = event.originalEvent.changedTouches[0].clientX - this.offsetLeft;
                    iY = event.originalEvent.changedTouches[0].clientY - this.offsetTop;
                    //return false;
                },
                'touchmove': kdShare.throttle(ImgMove, 20),
                'touchend': function (e) {
                    //dragging = false;

                }
            })
        ;
    }

    function ImgMove(event) {
        var sizerate = document.documentElement.style.fontSize;
        sizerate = sizerate.substring(0, sizerate.length - 2);//适应屏幕处理
        var event = event || window.event;
        var oX = (event.originalEvent.changedTouches[0].clientX - iX) / sizerate;
        if (oX <= 0) {
            oX = 0;
        }
        if (oX >= (document.documentElement.clientWidth / sizerate - 1.12)) {
            oX = document.documentElement.clientWidth / sizerate - 1.12;
        }
        var oY = (event.originalEvent.changedTouches[0].clientY - iY) / sizerate;
        if (oY <= 0) {
            oY = 0;
        }
        if (oY >= (document.documentElement.clientHeight / sizerate - 2.16)) {
            oY = document.documentElement.clientHeight / sizerate - 2.16;
        }

        this.style.left = oX + 'rem';
        this.style.top = oY + 'rem';
    }

    //显示图片墙信息
    function freshWrapImgList(imglist) {
        if (!imglist) {
            return;
        }
        var imgls = imglist;

        if (imgls.length == 0) {
            imgls.push(noImage);
        }
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();

        SwipeWrap.innerHTML = $.Array.keep(imgls, function (item, i) {
            var imgsrc = item.img != '' ? (imgMode ? item.img : noimgModeDefault) : noImage;
            return $.String.format(sampleImg, {
                index: i,
                img: imgsrc,
                optid: item.optid
            });
        }).join('');


        setTimeout(function () {
            $("#homeSwipeWrap img").load(function () {
                scroller && scroller.refresh();
            })
        }, 250);


        if (imgls.length <= 1) {
            imgls = [];
        }
        SliderPosi.innerHTML = $.Array.keep(imgls, function () {
            return $.String.format(sampleImgli, {});
        }).join('');
        if (imgls.length > 1) {
            $('#viewid_home  nav .position li:first').addClass('on')
        }
        initSwipe();
    }

    function initSwipe() {
        var bullets = document.getElementById('homeSliderPosi').getElementsByTagName('li');
        Swipe(document.getElementById('homeSlider'), {
            startSlide: 0,
            auto: 3000,
            continuous: false,
            disableScroll: false,
            stopPropagation: false,
            allowVerticalMove: false,
            callback: function (pos) {
            },
            transitionEnd: function (index) {
                var i = bullets.length;
                if (i > 0) {
                    while (i--) {
                        bullets[i].className = ' ';
                    }
                    bullets[index].className = 'on';
                }
            }
        });
    }

    //刷新指定列表数据
    function freshListView(dataList, domList) {
        domList.innerHTML = $.Array.keep(dataList, function (item, index) {
            return $.String.format(sampleImgList.imgList, {
                img: item.img,
                name: item.name,
                goodsid: item.goodsid,
                price: kdAppSet.formatMoneyStr(item.price)
            });
        }).join('');
    }


    //请求api 获取首页数据
    function getGoodsList() {
        kdAppSet.setKdLoading(true);
        var para = { para: {} };
        Lib.API.get('GetHomePageList', para,
            function (data, json) {
                homeDataList = data;
                kdAppSet.setKdLoading(false);
                Home_Icon.render(data);
                freshGoodsList(data);
                config.fn && config.fn(); //首页加载完后 再回调
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showErrorView(msg);
            }, function (errCode) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showErrorView(errCode);
            });
    }


    //处理后台返回的数据
    function getDataList(data, liststr) {
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        return $.Array.keep(data[liststr] || [], function (item) {
            return {
                goodsid: item.fitemid,
                price: item.fprice,
                maxprice: item.fmaxprice,
                name: item.fname,
                img: item.fimageurl != '' ? (imgMode ? item.fimageurl : noimgModeDefault) : (imgMode ? noImage : noimgModeDefault)
            };
        });
    }

    //菜单列表支持自定义
    function AddNameList(data) {

        var user = kdAppSet.getUserInfo().cmpInfo;
        var style = user.homeImgStyle;
        var imgClass = 'img3';
        style == 1 ? (imgClass = 'img1') : (style == 2 ? (imgClass = 'img2') : '');
        nameList.innerHTML = "";
        nameList.innerHTML += $.Array.keep(data, function (item) {
            return $.String.format(sampleNameList.nameList, {
                nameListId: getListName(item.id),
                imgClass: imgClass,
                name: item.name
            });
        }).join('');
    }

    function getListName(name) {
        var nameList = {
            'cx': 'home_cxlist',
            'xp': 'home_newlist',
            'tj': 'home_hotlist'
        };
        return nameList[name];
    }

    //刷新首页数据
    function freshGoodsList(data) {

        AddNameList(data.namelist);

        var tjListData = getDataList(data, 'tjlist');
        var xpListData = getDataList(data, 'xplist');
        var cxListData = getDataList(data, 'cxlist');

        if (xpListData.length > 0) {
            $('#home_newlist').show();
        }
        if (cxListData.length > 0) {
            $('#home_cxlist').show();
        }
        if (tjListData.length > 0) {
            $('#home_hotlist').show();
        }

        var xplist = $('#home_newlist .imgList2')[0];
        if (xplist) {
            freshListView(xpListData, xplist);
        }

        var cxlist = $('#home_cxlist .imgList2')[0];
        if (cxlist) {
            freshListView(cxListData, cxlist);
        }
        var tjlist = $('#home_hotlist .imgList2')[0];
        if (tjlist) {
            freshListView(tjListData, tjlist);
        }

        setTimeout(function () {
            var imgs = $(".view_home .imgList2 .imgBox img");
            imgs.on('load', function () {
                scroller && scroller.refresh();
            });
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].complete) {
                    scroller && scroller.refresh();
                }
            }
        }, 500);

        var isShowPrice = kdAppSet.getIsShowPrice();
        if (!isShowPrice) {
            $(viewPage).find('.price').css('visibility', 'hidden');
        }
        else {
            viewPage.find('.price').css('visibility', 'visible');
        }

        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
        var imglist = $.Array.keep(data['imglist'] || [], function (item) {
            return {
                optid: item.id,
                img: item.imgurl != '' ? (imgMode ? item.imgurl : noimgModeDefault) : (imgMode ? noImage : noimgModeDefault)
            };
        });
        imglistSwipe = imglist;
        if (imglist.length == 0) {
            $('#homeSlider').hide();
        } else {
            freshWrapImgList(imglist);
        }
        scroller && scroller.refresh();
        setTimeout(function () {
            scroller && scroller.refresh();
        }, 2500);
    }


    function render(configp) {
        config = configp;

        initView();
        if (config && config.isHide) {
        } else {
            show();
        }
        if (firstLoad) {
            getGoodsList();
            firstLoad = false;
        }
    }

    //在首个页面 显示不是首页的情况下 ，要刷新一下轮播组件
    function freshSwipeImg() {
        var firstview = kdAppSet.getAppParam().firstview;
        if (firstview) {
            freshWrapImgList(imglistSwipe);
            kdAppSet.getAppParam().firstview = '';
        }
    }

    function show() {
        viewPage.show();
        OptAppMenu.selectKdAppMenu("homeId");
        OptAppMenu.showKdAppMenu(true);
        freshSwipeImg();
        scroller && scroller.refresh();
    }

    return {
        render: render,
        show: show,
        hide: function () {
            viewPage.hide();
            OptAppMenu.showKdAppMenu(false);
        }
    };


})();


/*图标*/
var Home_Icon = (function () {

    var hasInit, sampleIconList, iconimgList, viewPage,
        homeDataList;
    viewList = [];//点击事件


    function init(config) {
        if (!hasInit) {
            var div = document.getElementById('viewid_home');
            viewPage = $(div);
            iconimgList = document.getElementById('homeIconList');
            sampleIconList = $.String.between(iconimgList.innerHTML, '<!--', '-->');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {
        viewPage.delegate('.iconList li', {
            'click': function () {
                var name = this.getAttribute('data-name');
                if (name == "物流查询" || name == "再次购买" || name == "我要提货") {//联系客服不需要登录判断
                    if (kdAppSet.getUserInfo().usertype != 0) {
                        MiniQuery.Event.trigger(window, 'toview', ['Register', {}]);
                        return;
                    }
                }

                switch (name) {
                    case '物流查询':
                        showView('Orderlist', { tabindex: 4 });
                        kdAppSet.h5Analysis('home_logistics');
                        break;
                    case '再次购买':
                        showView('Orderlist', { tabindex: 0 });
                        kdAppSet.h5Analysis('home_buyagain');
                        break;
                    case '我要提货':
                        showView('PickUpList');
                        kdAppSet.h5Analysis('home_storelist');
                        break;
                    case '我的客服':
                        callPhone();
                        kdAppSet.h5Analysis('home_service');
                        break;
                    case '新品':
                        var tiltleName = viewPage.find('#home_newlist .title')[0].innerHTML;
                        showView('GoodsList', { tabindex: 1, title: tiltleName, fromPage: 0, hideCategory: true, reload: true, reload: true });
                        break;
                    case '门店':
                        showView('StoreViewList');
                        break;
                    case '促销':
                        var tiltleName = viewPage.find('#home_cxlist .title')[0].innerHTML;
                        showView('GoodsList', { tabindex: 2, title: tiltleName, fromPage: 0, hideCategory: true, reload: true, reload: true });
                        break;
                    case '公告':
                        showView('Inform', { noticelist: homeDataList.noticelist });
                        break;
                }
            },
            'touchstart': function () {
                var index = this.getAttribute('data-index');
                $(this).find('img').attr('src', viewList[index].iconimgClick);
            },
            'touchend': function () {
                var index = this.getAttribute('data-index');
                $(this).find('img').attr('src', viewList[index].iconimg);
            }
        })

    }

    function showView(viewName, config) {
        kdAppSet.stopEventPropagation();
        config = config || {};
        MiniQuery.Event.trigger(window, 'toview', [viewName, config]);
    }

    function callPhone() {
        var phone = '';
        var service = OptMsg.getMsgServiceList();
        if (service.length > 0) {
            phone = service[0].servicePhone;
        }
        var phoneUrl = "tel:" + phone;
        if (phoneUrl == "tel:") {
            jAlert("很抱歉,客服的电话号码为空!");
            return false;
        }
        window.location.href = phoneUrl;
    }

    //处理图标
    function iconList(iconlist) {
        //每次清空
        viewList = [];
        for (i = 0; i < iconlist.length; i++) {
            switch (iconlist[i]) {
                case 'logistics'://物流查询
                    viewList.push({
                        iconimg: 'img/iconlogistics.png',
                        iconimgClick: 'img/iconlogistics_click.png',
                        iconName: '物流查询'
                    });
                    break;
                case 'buyagain'://再次购买
                    viewList.push({
                        iconimg: 'img/iconbuy.png',
                        iconimgClick: 'img/iconbuy_click.png',
                        iconName: '再次购买'
                    });
                    break;
                case 'outinstore'://门店自提
                    viewList.push({
                        iconimg: 'img/iconSelfhelp.png',
                        iconimgClick: 'img/iconSelfhelp_click.png',
                        iconName: '我要提货'
                    });
                    break;
                case 'servicephone'://客服电话
                    viewList.push({
                        iconimg: 'img/iconmyservicephone.png',
                        iconimgClick: 'img/iconmyservicephone_click.png',
                        iconName: '我的客服'
                    });
                    break;
                case 'xinpin'://新品推荐
                    viewList.push({
                        iconimg: 'img/iconxinpin.png',
                        iconimgClick: 'img/iconxinpin_click.png',
                        iconName: '新品'
                    });
                    break;
                case 'storelist'://线下门店
                    viewList.push({
                        iconimg: 'img/iconstore.png',
                        iconimgClick: 'img/iconstore_click.png',
                        iconName: '门店'
                    });
                    break;
                case 'cuxiao'://促销
                    viewList.push({
                        iconimg: 'img/iconcuxiao.png',
                        iconimgClick: 'img/iconcuxiao_click.png',
                        iconName: '促销'
                    });
                    break;
                case 'gonggao'://公告
                    viewList.push({
                        iconimg: 'img/icongonggao.png',
                        iconimgClick: 'img/icongonggao_click.png',
                        iconName: '公告'
                    });
                    break;
            }
        }
    }

    //初始化快捷图标菜单--马跃
    function initMenuList() {
        iconimgList.innerHTML = $.Array.keep(viewList, function (item, index) {
            return $.String.format(sampleIconList, {
                index: index,
                //img: iconImgList[index],
                img: item.iconimg,
                imgname: item.iconName
            });
        }).join('');
    }


    function render(config) {
        homeDataList = config;
        init();
        iconList(config.imgbuttonlist);//处理图标
        initMenuList();//显示
    }

    return {
        render: render,
    }
})();
var Me = (function () {
    var viewpage, scroller, hasInit, endTime, sample, iconSample;
    // 初始化视图
    function initView() {
        if (!hasInit) {
            viewpage = $('.view_Me');
            scroller = Lib.Scroller.create($('.me_commonItems')[0]);
            sample = document.getElementById('me_saler').innerHTML;
            sample = $.String.between(sample, '<!--', '-->');
            iconSample = $.String.between(document.getElementById('iconsample').innerHTML, '<!--', '-->');
            initicon();
            bindEvents();
            endTime = " 23:59:59";
            var imgsrc = kdAppSet.getUserInfo().headimgurl || "img/picture.png";
            $(".me_userInfo img").attr("src", imgsrc);
            repalceImg();
            hasInit = true;
        }
    }

    function repalceImg() {
        $('#nav_Oredrs .icon-item').attr('src', 'img/Me_order.png');
        $('#nav_Notices .icon-item').attr('src', 'img/Me_pay.png');
        $('#me_Address .icon-item').attr('src', 'img/Me_address.png');
        $('#me_Collect .icon-item').attr('src', 'img/Me_collection.png');
        $('#me_Collect .icon-item').attr('src', 'img/Me_collection.png');
        $('#me_manager .icon-item').attr('src', 'img/Me_manage.png');
        $('#me_join .icon-item').attr('src', 'img/Me_join.png');
        $('#me_setting .icon-item').attr('src', 'img/Me_setting.png');
        $('#me_Money img').attr('src', 'img/Me_payable.png');
        $('#me_Buyer img').attr('src', 'img/Me_buyer.png');
        $('#me_Money img').attr('src', 'img/Me_turnover.png');
        $('#me_Buyer img').attr('src', 'img/Me_buyer.png');
        $('#me_retail img').attr('src', 'img/Me_retail.png');
    }

    function fillHead() {
        var mview = $('#me_info');
        var sview = $('#me_saler');
        mview.hide();
        sview.hide();
        var user = kdAppSet.getUserInfo();
        if (user.identity == 'retail') {
            sview.show();
            sview[0].innerHTML = $.String.format(sample, {
                'name': user.contactName || user.senderName,
                'points': (user.vipPoints || 0).toFixed(2),
                'level': user.viplevelname,
                'money': (user.vipAmount || 0).toFixed(2),
                'view': user.usertype == -1 ? 'hide' : '',
                'vipView': user.usertype == -1 ? '' : 'vip',
                'allowView': user.cmpInfo.allowRetailPoint ? '' : 'hidev'
            });
        } else {
            mview.show();
        }
    }

    // 页面渲染
    function render() {
        initView();
        show();
        initUserInfo();
    }

    function initUserInfo() {

        // 获取图片及采购主管信息
        var contactName = kdAppSet.getUserInfo().contactName;
        $('.view_Me #userName').text(contactName);
        var userinfo = kdAppSet.getUserInfo();
        var position = "";
        var identity = userinfo.identity;
        var mobile = userinfo.senderMobile || '';

        var compony = $('.view_Me #userCompony');
        compony.text(userinfo.companyName);
        var NamePosition = $('.view_Me .NamePosition');

        if (userinfo.caninvited == 1 && userinfo.cmpInfo.allowshareprice == 1) {
            viewpage.find('[data-cmd="invite"]').show();//显示输入邀请码
        } else {
            viewpage.find('[data-cmd="invite"]').hide();//隐藏输入邀请码
        }

        if (identity == "manager") {
            position = "采购主管";
            NamePosition.css('top', '0');
            $('#me_manager').show();
            if (userinfo.cmpInfo.allowshareprice == 1) {
                viewpage.find('[data-cmd="share"]').show();//显示邀请有礼
            }
            $('#me_join').hide();
        }
        else if (identity == "buyer") {
            position = "采购员";
            if (userinfo.cmpInfo.allowshareprice == 1) {
                viewpage.find('[data-cmd="share"]').show();//显示邀请有礼
            }
            NamePosition.css('top', '0');
        }
        else {
            if (identity == "retail") {
                position = "(会员)";
                compony.hide();
                NamePosition.css('top', '10px');
                $('#me_manager').hide();
            }
        }
        $('.view_Me #userPosition').text(position);
        //是否在微信中打开
        var iswxBrower = !(!kdAppSet.isPcBrower() && !kdShare.is_weixinbrower());

        //手机号未验证
        var checkDiv = $('.view_Me .checkDiv span');
        var check = (!mobile && iswxBrower || (kdAppSet.getAppParam().isdebug && !mobile));
        check ? checkDiv.show() : checkDiv.hide();

        scroller.refresh();
        var quitDiv = $('.view_Me .quitDiv');
        userinfo.senderMobile ? quitDiv.show() : quitDiv.hide();

        setViewByPower();
        fillHead();
    }

    //马跃--2016/4/7重写根据不同身份不同图标的显示。此次采取动态填充分别放在manageList，retailList以便以后扩充
    function initicon() {
        //采购员||主管
        var manageList = [
            {
                styleid: 'nav_uncheck',
                styleclass: 'sprite-toComfirm',
                stylename: '待确认'
            },
            {
                styleid: 'nav_Sending',
                styleclass: 'sprite-pay',
                stylename: '待发货'
            },
            {
                styleid: 'nav_sended',
                styleclass: 'nav_BadOrders_return sprite-sending',
                stylename: '已发货'
            },
            {
                styleid: 'nav_BadOrders',
                styleclass: 'nav_BadOrders_return sprite-return',
                stylename: '退货'
            }
        ];
        //会员||游客
        var retailList = [
            {
                styleid: 'nav_unpay',
                styleclass: 'sprite-toComfirm',
                stylename: '待付款'
            },
            {
                styleid: 'nav_uncheck',
                styleclass: 'sprite-toComfirm',
                stylename: '待确认'
            },
            {
                styleid: 'nav_Sending',
                styleclass: 'sprite-pay',
                stylename: '待发货'
            },
            {
                styleid: 'nav_sended',
                styleclass: 'nav_BadOrders_return sprite-sending',
                stylename: '已发货'
            }
        ];

        var iconList = $('#iconsample');
        var identity = kdAppSet.getUserInfo().identity;
        var iconData = [];
        if (identity == "manager" || identity == "buyer") {
            iconData = manageList;
        } else {
            iconData = retailList;
        }
        iconList[0].innerHTML = "";
        iconList[0].innerHTML += $.Array.keep(iconData, function (item) {
            return $.String.format(iconSample, {
                styleid: item.styleid,
                styleclass: item.styleclass,
                stylename: item.stylename
            });
        }).join('');
    }

    //初始化状态数量
    function initTips() {
        if (!kdAppSet.getUserInfo().senderMobile) {
            $('.count-tip').hide();
            return;
        }
        $('.count-tip').hide();
        var identity = kdAppSet.getUserInfo().identity;
        var now = $.Date.now();
        var endDatev = $.Date.format(now, "yyyy-MM-dd");
        now.setDate(now.getDate() - 90);
        var startDatav = $.Date.format(now, "yyyy-MM-dd");
        var optOpenid = kdAppSet.getUserInfo().optid;

        var para = {
            para: {
                optOpenid: optOpenid,
                BeginDate: startDatav,
                EndDate: endDatev
            }
        };

        Lib.API.get('GetDynamicInfo', para, function (data, json) {
            var counts = {
                toConfirm: +data.statuslist[1].total,//待确认
                toDeliver: +data.statuslist[2].total,//待发货
                hasDeliver: +data.statuslist[3].total,//已发货
                toPay: +data.statuslist[4].total,//待付款
                salesReturn: +data.statuslist[5].total//退货
            };
            //显示数量
            var contTip = $('.count-tip');
            var data1 = identity === 'retail' ? counts.toPay : counts.toConfirm;
            var data2 = identity === 'retail' ? counts.toConfirm : counts.toDeliver;
            var data3 = identity === 'retail' ? counts.toDeliver : counts.hasDeliver;
            var data4 = identity === 'retail' ? counts.hasDeliver : counts.salesReturn;
            if (data1 > 0) {
                contTip[0].innerText = data1 < 99 ? data1 : 99;
                contTip[0].style.display = 'block';
            }
            if (data2 > 0) {
                contTip[1].innerText = data2 < 99 ? data2 : 99;
                contTip[1].style.display = 'block';
            }
            if (data3 > 0) {
                contTip[2].innerText = data3 < 99 ? data3 : 99;
                contTip[2].style.display = 'block';
            }
            if (data4 > 0) {
                contTip[3].innerText = data4 < 99 ? data4 : 99;
                contTip[3].style.display = 'block';
            }
            var vip = data.vip || {};
            kdAppSet.updateUserInfo({
                vipAmount: vip.vipAmount || 0,
                vipPoints: vip.vipPoints || 0,
                viplevelname: vip.viplevelname || ''
            });

            fillHead();
        }, function (code, msg) {
            jAlert(msg);
        }, function () {
        });
    }

    // 游客跳转到登录页面
    function gotoLoginPage() {
        MiniQuery.Event.trigger(window, 'toview', ['Register', { fromView: 'person' }]);
    }

    //显示指定的订单页面
    function showOrderView(tabIndex) {
        if (isCanShowView()) {
            showView(['Orderlist', { tabindex: tabIndex }]);
        }
    }

    // 事件绑定
    function bindEvents() {

        //点击头像 --已验证：会员中心  未验证：登录
        viewpage.delegate('.picture img', {
            'click': function () {
                var mobile = kdAppSet.getUserInfo().senderMobile || '';
                var iswxBrower = !(!kdAppSet.isPcBrower() && !kdShare.is_weixinbrower());
                if (!mobile && iswxBrower || (kdAppSet.getAppParam().isdebug && !mobile)) {
                    gotoLoginPage();
                } else {
                    //1  表示要修改会员信息
                    goToVip(1);
                }
            }
        });

        // 绑定点击样式效果

        // 绑定通用项的点击效果
        viewpage.delegate('.commonItem', {
            'touchstart': function () {
                $(this).addClass('me_touched');
                $(this).children().addClass('me_touchedBottom');
            },
            'touchend': function () {
                $(this).removeClass('me_touched');
                $(this).children().removeClass('me_touchedBottom');
            }
        });

        viewpage.delegate('.singleItem', {
            'touchstart': function () {
                $(this).addClass('me_touched');
                $(this).children().addClass('me_touchedBottom');
            },
            'touchend': function () {
                $(this).removeClass('me_touched');
                $(this).children().removeClass('me_touchedBottom');
            }
        });

        viewpage.delegate('.second-level', {
            'touchstart': function () {
                $(this).css('backgroundColor', '#ebebeb');
            },
            'touchend': function () {
                $(this).css('backgroundColor', '#fff');
            }
        });

        // 会员金额
        viewpage.delegate('[data-cmd="vip"]', {
            'click': function () {
                goToVip();
            }
        });

        // 全部订单点击事件
        viewpage.delegate('#nav_Oredrs', {
            'click': function () {
                if (isCanShowView()) {
                    showView(['Orderlist', { tabindex: 0 }]);
                    kdAppSet.h5Analysis('me_allBill');
                }
            }
        });

        // 付款通知点击事件
        viewpage.delegate('#nav_Notices', {
            'click': function () {
                if (isCanShowView()) {
                    showView(['PaymentList', {}]);
                    kdAppSet.h5Analysis('me_payList');
                }
            }
        });

        // 待付款点击事件--会员特有
        viewpage.delegate('#nav_unpay', {
            'click': function () {
                showOrderView(1);
                kdAppSet.h5Analysis('me_unpay');
            }
        });

        // 待确认点击事件
        viewpage.delegate('#nav_uncheck', {
            'click': function () {
                showOrderView(2);
                kdAppSet.h5Analysis('');
            }
        }
        );

        // 待发货点击事件
        viewpage.delegate('#nav_Sending', {
            'click': function () {
                showOrderView(3);
                kdAppSet.h5Analysis('me_unsend');
            }
        });

        // 已发货点击事件
        viewpage.delegate('#nav_sended', {
            'click': function () {
                showOrderView(4);
                kdAppSet.h5Analysis('me_sended');
            }
        });

        // 退货点击事件--经销商特有
        viewpage.delegate('#nav_BadOrders', {
            'click': function () {
                if (isCanShowView()) {
                    showView(['RejectBillList', {}]);
                    kdAppSet.h5Analysis('me_salesReturn');
                }
            }
        });

        // 我的应付款点击事件
        viewpage.delegate('#me_Money', {
            'click': function () {
                if (isCanShowView()) {
                    if (kdAppSet.getUserInfo().identity == "manager") {
                        showView(['Balance', {}]);
                        kdAppSet.h5Analysis('me_checkMoney');
                        return;
                    } else {
                        showRightHint();
                    }
                }
            }
        });

        // 我的采购员点击事件
        viewpage.delegate('#me_Buyer', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                var user = kdAppSet.getUserInfo();
                if (user.identity == "manager") {
                    kdAppSet.stopEventPropagation();
                    showView(['Buyer', {}]);
                    kdAppSet.h5Analysis('me_buyer');
                }
                else {
                    showRightHint();
                }
            }
        });

        // 我的收货地址 点击事件
        viewpage.delegate('#me_Address', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                showView(['AddressList', {}]);
                kdAppSet.h5Analysis('me_address');
            }
        });

        // 我的收藏 点击事件
        viewpage.delegate('#me_Collect', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                showView(['CollectionList', {}]);
                kdAppSet.h5Analysis('me_collect');
            }
        });

        //我的买家
        viewpage.delegate('#me_retail', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                var user = kdAppSet.getUserInfo();
                if (user.identity == "manager") {
                    kdAppSet.stopEventPropagation();
                    showView(['BuyerList', {}]);
                    kdAppSet.h5Analysis('me_myBuyer');
                }
                else {
                    showRightHint();
                }
            }
        });

        //我要加盟
        viewpage.delegate('#me_join', 'click', function () {
            var mobile = kdAppSet.getUserInfo().senderMobile || '';
            MiniQuery.Event.trigger(window, 'toview', ['registerDetail', { mobile: mobile }]);
            kdAppSet.h5Analysis('me_toJoin');
        });

        // 我的消息 点击事件
        viewpage.delegate('#me_Message',
            {
                'click': function () {
                    if (!isCanShowView()) {
                        return;
                    }
                    showView(['Message', {}]);
                }
            });

        // 我的设置点击事件
        $('.view_Me #me_setting').bind('click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['Setting']);
            kdAppSet.h5Analysis('me_setting');
        });

        // 退出当前帐号点击事件
        viewpage.delegate('#quitBtn', {
            'click': function () {
                var msg = "您是否要注销当前账号？注销后<br>下次登录需重新验证手机号";
                jConfirm(msg, null, function (flag) {
                    if (flag) {
                        unBindWxOpenid();
                        kdAppSet.h5Analysis('me_loginout');
                    }
                }, { ok: "是", no: "否" });
            },
            'touchstart': function () {
                $(this).addClass('quit_touched');
            },
            'touchend': function () {
                $(this).removeClass('quit_touched');
            }
        });

        // 验证手机号码按键
        viewpage.delegate('.checkDiv span', {
            'click': function () {
                gotoLoginPage();
            },
            'touchstart': function () {
                $(this).css('background', 'rgba(255,255,255,0.2)');
            },
            'touchend': function () {
                $(this).css('background', 'rgba(0,0,0,0.2)');
            }
        });

        //点击分享有礼  必须是采购主管和采购员身份才可以点击
        viewpage.delegate('[data-cmd="share"]', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                var user = kdAppSet.getUserInfo();
                 if (user.identity == "manager" || user.identity == "buyer") {
                kdAppSet.stopEventPropagation();
                showView(['Share', {}]);
                }
                 else {
                     showRightHint();
                 }
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });

        //点击输入邀请码
        viewpage.delegate('[data-cmd="invite"]', {
            'click': function () {
                if (!isCanShowView()) {
                    return;
                }
                //是否可以输入邀请码
                if (kdAppSet.getUserInfo().caninvited == 1) {
                    showView(['Invite', {}]);
                }
                else {
                    OptMsg.ShowMsg('您暂不可以输入邀请码，请联系客服!', "", 1500);
                }
            },
            'touchstart': function () {

            },
            'touchend': function () {

            }
        });
    }

    function goToVip(flag) {
        var user = kdAppSet.getUserInfo();
        if (user.usertype != -1 && user.identity == "retail") {
            flag = flag || 0;
            //正式
            var vipUrl = 'http://mob.cmcloud.cn/webapp/vip' + kdAppSet.getUserInfo().apiversion + '/microSaleLogin.html?eid=' + kdAppSet.getAppParam().eid + '&flag=' + flag;
            //测试
            //var vipUrl = 'http://mob.cmcloud.cn/webapp/vip' + '/microSaleLogin.html?eid=' + kdAppSet.getAppParam().eid + '&flag=' + flag;
            //本地
            //var vipUrl = "http://localhost/VIP/vip/htdocs/index.html#VIP-7E8D2BA6";
            MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: vipUrl }]);
            kdAppSet.h5Analysis('me_balance');
        }
    }

    function showRightHint() {
        OptMsg.ShowMsg('您不是采购主管,没有权限!', "", 1500);
    }

    //解除绑定用户信息
    function unBindWxOpenid() {
        kdAppSet.setKdLoading(true);
        Lib.API.get('RemoveOpenID', {
            para: {}
        },
            function (data, json) {
                kdAppSet.setKdLoading(false);
                if (data.status == 0) {
                    kdAppSet.showMsg('账号已注销');
                    kdAppSet.logout();
                    initTips();
                    initUserInfo();
                    //通知商品订单列表刷新
                    MiniQuery.Event.trigger(window, 'GoodsList_refresh', []);
                    //通知首页刷新
                    MiniQuery.Event.trigger(window, 'Home_refresh', []);
                } else {
                    kdAppSet.showMsg('注销账号出错');
                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                jAlert(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                jAlert("注销账号出错");
            });
    }

    //根据权限控制 能显示的功能模块
    function setViewByPower() {
        var moneyview = $('.view_Me #me_Money_group');
        moneyview.show();
        var buyer = $('.view_Me #me_Buyer');
        buyer.show();
        if (kdAppSet.getUserInfo().identity != "manager") {
            moneyview.hide();
            buyer.hide();
        }
    }

    // 页面展示权限检测
    function isCanShowView() {
        //var myMsg = '您没有权限查看,请登录';
        if (kdAppSet.getUserInfo().usertype != 0) {
            //OptMsg.ShowMsg(myMsg, "", 1500);
            gotoLoginPage();
            return;
        }
        return true;
    }

    // 页面跳转
    function showView(config) {
        MiniQuery.Event.trigger(window, 'toview', config);
        kdAppSet.stopEventPropagation();
    }

    // 页面显示
    function show() {
        viewpage.show();
        OptAppMenu.selectKdAppMenu("meId");
        OptAppMenu.showKdAppMenu(true);
        kdAppSet.setKdLoading(false);
        initTips();
        fillHead();
        // 每次进来刷新下滚动区域
        scroller.refresh();
        kdAppSet.setAppTitle('我');
    }

    function hide() {
        viewpage.hide();
        OptAppMenu.showKdAppMenu(false);
    }

    return {
        render: render,
        show: show,
        hide: hide
    }
})();
var OrderDetail = (function () {
    var div, listorderdetail, orderdetailul, orderdetailullist,
        samples, sampleStore, scroller, datalist, viewPage, hasInit,
        billId,user, config,

    //0全部 1待确认 2待发货 3已发货 4 已收货 5未付款  6已付款 7部分发货
        _Status = {
            all: 0,
            check: 1,
            unsend: 2,
            sended: 3,
            receive: 4,
            unpay: 5
        },
        billStatus = {
            readonly: 0,
            edit: 1
        },
    //1 开通微信支付 0 没开通
        wxpay,
    //当前订单信息
        targetorder;


    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('view_orderdetail');
            viewPage = $(div);
            listorderdetail = document.getElementById('orderscrollarea');
            scroller = Lib.Scroller.create(listorderdetail);
            orderdetailul = document.getElementById('orderdetailarea');
            orderdetailullist = $(orderdetailul);
            samples = $.String.getTemplates(orderdetailul.innerHTML, [
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
            var storeTemplate = document.getElementById('view_orderdetail_store').innerHTML;
            sampleStore = $.String.between(storeTemplate, '<!--', '-->');
            billId = 0;
            targetorder = {};
            datalist = [];
            bindEvents();
            viewPage.find('.receiveimg').attr('src', 'img/receiveman.png');
            viewPage.find('.moneyimg').attr('src', 'img/billmoney.png');
            viewPage.find('.buyagain').attr('src', 'img/buyagain.png');
            viewPage.find('.btnctrl_right img').attr('src', 'img/menubtn_normal.png');
            wxpay = kdAppSet.getAppParam().wxpay;
            PopMenu.bindWithBtn('goodsdetail_popmenu');
            user = kdAppSet.getUserInfo();
            hasInit = true;
        }
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


    function fillStore(storeInfo) {
        var express = viewPage.find('[data-cmd="express"]');
        var store = $('#view_orderdetail_store');
        var listv = $(listorderdetail);
        viewPage.find('[data-type="codeImg"]').hide();
        viewPage.find('[data-type="imgHint"]').hide();
        store[0].innerHTML = $.String.format(sampleStore, {
            'name': storeInfo.storeName || '',
            'address': storeInfo.storeAddress || '',
            'phone': storeInfo.storePhone || '',
            'takeCode': storeInfo.takeCode || '',
            'date': storeInfo.takeDate
        });

        if (storeInfo.isOutInStore == 1) {
            if (storeInfo.takeCode) {
                setTimeout(function () {
                    setTakeCodeImg(viewPage, storeInfo.takeCode);
                }, 50);
            }
            express.hide();
            listv.css({ top:'1.6rem' });
            store.show();
        } else {
            store.hide();
            express.show();

        }
    }

    function setTakeCodeImg(view, takecode) {
        var imgview = view.find('[data-type="codeImg"]');
        view.find('[data-type="imgHint"]').show();
        imgview.show();
        imgview.attr('src', 'img/loading.png');
        var imgurl = getImgQrcodeUrl(takecode);
        imgview.attr('src', imgurl);
    }

    function setViewInfo() {
        viewPage.find('[data-cmd="express"]').hide();
        $('#view_orderdetail_store').hide();
        if (kdAppSet.getUserInfo().ueVersion < 4) {
            $('.orderdetail_express').hide();
        }
        else {
            $('.orderdetail_express').show();
        }
    }


    function render(configp) {
        config = configp;
        initView();
        setViewInfo();
        show();
        // 隐藏菜单栏
        HideMenuBar(true);
        kdAppSet.setKdLoading(false);
        billId = config.billId;
        freshBtnInfo(config);
        getOrderItemInfor(billId);
    }

    function freshBtnInfo(config) {
        $("#view_orderdetail .orderdetail_btnctrl").hide();
        if (config.isReject) {
            viewPage.find('.orderdetailRejectDiv').show();
        } else {
            viewPage.find('.orderdetailRejectDiv').hide();
        }
    }


    function setView(item) {

        $("#view_orderdetail .orderdetail_btnctrl").show();
        $('#orderdetail_receivename')[0].innerHTML = item.name;
        $('#orderdetail_receivephone')[0].innerHTML = item.mobile;
        $('#orderdetail_address')[0].innerHTML = item.address;
        $('#orderdetail-status')[0].innerHTML = getStatusName(item.status);
        $('#orderdetail-count-1')[0].innerHTML = item.num;
        $('#orderdetail-amount-1')[0].innerHTML = kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(item.billmoney); //合计金额
        $('#orderdetail_freight').html('￥' + item.freight);
        $('#orderdetail_identity')[0].innerHTML = item.identity;

        var identityView = $('.view_orderdetail .identity');
        var listv = $(listorderdetail);
        if (item.identity == '') {
            listv.css({ top:'3.08rem' });
            if(targetorder.isOutInStore == 1){listv.css({ top:'1.6rem' });}
            identityView.hide();
        } else {
            listv.css({ top:'3.48rem' });
            identityView.show();
        }
        var ordertotalInfo = $('.ordertotalInfo');
        ordertotalInfo.find('.order').html(item.billno);
        ordertotalInfo.find('.bookDate').html(item.date);
        ordertotalInfo.find('.orderPoint').html(item.point + "积分");
        ordertotalInfo.find('.billexPoint').html(item.billexpoint + "积分");
        ordertotalInfo.find('.maker').html(item.buyername);
        ordertotalInfo.find('.deliverway').html(item.FetchStyleName);
    }

    //刷新订单详情界面
    function freshViewInfo(item) {

        setView(item);

        //经销商隐藏本次积分，显示交货方式
        var orderPoint = $('#orderDetail-Point');//获取积分
        var billexpoint = viewPage.find('[data-cmd="orderDetail-billexPoint"]');//消费积分
        var deliverway = viewPage.find('[data-cmd="orderDetail-deliverway"]');//交货方式

        if (user.identity != 'retail') {
            orderPoint.hide();
            billexpoint.hide();
            deliverway.show();
        } else {
            orderPoint.show();
            billexpoint.show();
            deliverway.hide();
        }

        var receive_btn = $('#orderdetail_receive_btn');
        receive_btn.parent().show();
        if (item.status == _Status.receive) {
            receive_btn.parent().hide();
            //receive_btn.find('span').html('已确认收货');
        }
        else if (item.status == _Status.sended) {
            receive_btn.find('span').html('确认收货');
            receive_btn.attr('class', 'orderdetail_receive');
        }
        else if (item.status == _Status.check) {
            receive_btn.find('span').html('修改订单');
            receive_btn.attr('class', 'orderdetail_changeOrder');
            if (item.canedit == billStatus.readonly) {
                receive_btn.parent().hide();
            }

            //如果是零售用户，则只能删除订单，不能修改订单
            if(user.identity == 'retail' && item.canedit == billStatus.edit){
                var btnDelete=receive_btn.find('span');
                btnDelete.removeClass('sprite-open');
                btnDelete.css({'padding-right':0});
                btnDelete.html('删除订单');
            }
        }
        else if (item.status == _Status.receive) {
        }
        else {
            receive_btn.find('span').html('提醒厂家');
            receive_btn.attr('class', 'orderdetail_received');
        }

        if (item.status == _Status.check) {
            receive_btn.css({ background: '#fff', color: '#8c9093' });
        } else if (item.status != _Status.unsend) {
            receive_btn.css({ background: '#fff', color: '#FF6427' });
        } else {
            receive_btn.css({ background: '#fff', color: '#FF6427' });
        }


        //设置付款按钮状态
        var ctrl = viewPage.find('[data-cmd="btnCtrl"]');
        var billPayed = (item.paystatus > 0);
        //如果是经销商身份，有做过付款通知单 也算已付款
        if (user.identity != 'retail' && item.payno != '') {
            billPayed = true;
        }

        var btnpay = $('#orderdetail_payBtn span');
        var orderPayBtn = $('#orderdetail_payBtn');

        //如果是门店自提 并且已经付款，则不显示底部按钮
        if ((item.sendType == 1) && billPayed) {
            ctrl.hide();
        } else {
            ctrl.show();
        }

        var takecode = viewPage.find('[data-type="takecode"]');
        //如果是买家订单列表过来的，则不显示底部按钮，并且不显示提货码
        if (config && config.from == 'buyerOrderList') {
            ctrl.hide();
            setTimeout(function () {
                try {
                    takecode[0].innerText = '提货码：**** ****';
                    viewPage.find('[data-type="codeImg"]').hide();
                    viewPage.find('[data-type="imgHint"]').hide();
                } catch (e) {
                }
            }, 50);
        }


        if (wxpay == 1) {
            //开启微信支付
            if (billPayed) {
                hidePayMenu(true);
                setBtnPayView(btnpay, '查看付款单');

            } else {
                if (user.identity == 'retail') {
                    //零售用户
                    hidePayMenu(true);
                    setBtnPayView(btnpay, '付款');
                } else {
                    //经销商
                    btnpay.text('付款');
                    btnpay.removeClass('sprite-open');
                    btnpay.removeClass('sprite-open_s');
                }
            }
        } else {
            hidePayMenu(true);
            if (billPayed) {
                setBtnPayView(btnpay, '查看付款单');
            } else {
                setBtnPayView(btnpay, '付款');
            }

        }

        if (billPayed) {
            //如果是门店提货或者储值卡付款,实体卡  都不能查看付款单
            if (item.sendType == 1 || item.paystatus == 3  || item.paystatus == 6) {
                orderPayBtn.hide();
            } else {
                orderPayBtn.show();
            }
        } else {
            if (item.billmoney + Number(item.freight) > 0) {
                orderPayBtn.show();
            } else {
                orderPayBtn.hide();
            }
            //零售用户 并且是线下支付方式 则不显示付款按钮
            if (kdAppSet.getUserInfo().identity == 'retail' && item.payType == 'offline') {
                orderPayBtn.hide();
            }
        }

        //如果是已发货 或者已收货，并且不是由退货申请单过来 则隐藏收款按钮  显示退货按钮 ，
        var returnBtn = $('#orderdetail_return_btn');
        if ((targetorder.status == _Status.sended || targetorder.status == _Status.receive) && !config.isReject) {
            orderPayBtn.hide();
            returnBtn.show();
        } else {
            returnBtn.hide();
        }

    }

    function setBtnPayView(btnpay, btnname) {
        btnpay.text(btnname);
        btnpay.removeClass('sprite-open');
        btnpay.removeClass('sprite-open_s');
        btnpay.css('padding-right', '0');
    }

    //刷新订单详情列表
    function freshListViewInfo(data) {
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();
		var status = false;
        //for (i in data.SEOrderItems) {
        //    if ((data.SEOrderItems[i].OutAuxQty != 0) && (data.status == 7)) {
        //        status = true;//待发货状态并且有已出库商品，显示已出库
        //        break;
        //    }
        //}
        orderdetailul.innerHTML = $.Array.map(data.SEOrderItems, function (item, pindex) {
            return $.String.format(samples['li'], {
                index: pindex,
                fparentid: item.FParentID,
                fitemid: item.FItemID,
                gift: item.FIsGift == 0 ? 'hide' : '',
                name: item.FName,
                num: item.FAuxQty + " " + item.FUnitName,
                model: item.FModel,
                totalMoney: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.FSumMoney)), //商品总价
                img: item.FImageUrl != '' ? (imgMode ? kdAppSet.getImgThumbnail(item.FImageUrl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                hasAttrList: item.FRemark == "0" ? "display:none" : "display:block",
                totalTxt: item.FRemark == "0" ? "display:none" : "display:block", // 只有一个类别的隐藏‘小计’文本
                out_good: data.status == 7 ? "display:block" : "display:none",//待发货状态并且有已出库商品，显示已出库
                OutAuxQty: item.OutAuxQty + " " + item.FUnitName,
                OutAmount: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr((item.OutAmount)),
                attrListFlag: item.FRemark,
                'rows': ""
            });
        }).join('');
        setPriceVisiable();
        $('#orderdetail-money').html(kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(data.BillMoney));
        $('.ordertotalInfo .note').html(data.Explanation);
        showPayInfo(data);
        var ctrlSum = $("#view-orderdetail").find(".orderdetail-sum");
        if (data.SEOrderItems.length > 2) {
            ctrlSum.show();
        } else {
            ctrlSum.hide();
        }
        scroller.refresh();
    }


    function showPayInfo(data) {
        //设置支付信息
        var paystatus = data.paystatus || 0;
        var payinfo = viewPage.find('.payinfo');
        if (paystatus > 0) {
            payinfo.show();
            if (paystatus == 1) {
                payinfo.attr('src', 'img/wx_pay.png');
            } else if (paystatus == 2) {
                payinfo.attr('src', 'img/lineoff_pay.png');
            } else if (paystatus == 3) {
                payinfo.attr('src', 'img/prepay.png');
            }else if (paystatus == 4) {
                //支付宝支付
                payinfo.attr('src', 'img/alipay_list.png');
            } else if (paystatus == 5) {
                //资金通支付
                payinfo.attr('src', 'img/zjt_list.png');
            }
        } else {
            payinfo.hide();
        }
    }

    //获取订单详情
    function getOrderItemInfor(interid) {
        $('.paybuttonList').hide();
        var parax = { InterID: interid };
        var para = { currentPage: 1, ItemsOfPage: 50, para: parax };
        orderdetailullist.empty();
        removeHintList();
        orderdetailullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        GetOrderItemInforAPI(function (data) {
            targetorder = {
                interid: interid,
                status: data.status,
                paystatus: data.paystatus,
                num: data.num,
                date: data.date,
                billmoney: data.BillMoney || 0,
                address: data.address,
                name: data.name,
                mobile: data.mobile,
                buyername: data.buyername,
                billno: data.billno,
                payno: data.payNo || '',
                canedit: data.canedit || 0,
                expresscom: data.expresscom || '',
                expressnumber: data.expressnumber || '',
                isOutInStore: data.OutInStore,
                identity: data.IdNumber || '',
                freight: Number(data.freight) || 0,
                storeID: data.StoreID,
                takeDate: data.TakeDate,
                storeName: data.StoreName,
                storePhone: data.StorePhone,
                storeAddress: data.StoreAddress,
                point: data.billVantage,
                takeCode: data.TakeCode,
                payType: data.PayType || '',
                sendType: data.SendType || '',
                billexpoint: data.billexpoint || 0,
                FetchStyleName: data.FetchStyleName || "快递送货"
            };
            fillStore(targetorder);
            freshViewInfo(targetorder);
            freshListViewInfo(data);
        }, para);

        function GetOrderItemInforAPI(fn, para) {
            Lib.API.get('GetSEOrderItem', para,
                function (data, json) {
                    removeHintList();
                    datalist = data || [];
                    fn && fn(datalist);
                }, function (code, msg, json) {
                    removeHintList();
                    orderdetailullist.append('<li class="hintflag">' + msg + '</li>');
                    //在导购分享过来的链接，即使没权限也能保证能进入微商城
                    viewPage.find(".orderdetail_btnctrl").show();
                    viewPage.find('[data-cmd="btnCtrl"]').hide();
                }, function () {
                    removeHintList();
                    orderdetailullist.append('<li class="hintflag">网络错误，请稍候再试</li>');
                });
        }
    }

    function getStatusName(index) {
        index = index || 0;
        var statusList = ["", "待确认", "待发货", "已发货", "已收货","","","部分发货"];
        return statusList[index];
    }

    function removeHintAttrList(attrLst) {
        attrLst.children().filter('.hintflag').remove();
    }

    function removeHintList() {
        orderdetailullist.children().filter('.hintflag').remove();
    }

    //显示商品辅助属性
    function showAttrLst(datalist, attrLst) {
        var attrLstHtml = $.Array.map(datalist, function (row) {
                return $.String.format(samples['row'], {
                    attrname: row.FAuxName,
                    attrnum: row.FAuxQty + row.FUnitName,
                    attrprice: kdAppSet.getRmbStr + kdAppSet.formatMoneyStr(row.FPrice)  // 添加商品单价
                });
            }
        ).join('');
        attrLst.empty();
        attrLst.append(attrLstHtml);
        setPriceVisiable();
        scroller.refresh();
    }

    function showDetail(curclick) {
        var ctrlli = curclick.parent();
        var index = ctrlli.attr("index");
        var attrLst = ctrlli.find(".attrList");
        if (attrLst.css("display") == "none") {
            attrLst.show();
            if (attrLst.children().length > 0) {
                return;
            }
        } else {
            attrLst.hide();
            return;
        }
        removeHintAttrList(attrLst);
        attrLst.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        var itemclick = datalist.SEOrderItems[index];
        Lib.API.get('GetSEOrderItemDetail', {
            currentPage: 1,
            ItemsOfPage: 100,
            para: {
                InterID: targetorder.interid,
                ItemID: itemclick.FItemID
            }
        }, function (data) {
            var datalist = data.SEOrderItemDetail || [];
            showAttrLst(datalist, attrLst);
        }, function (code, msg) {
            removeHintAttrList(attrLst);
            attrLst.append('<li class="hintflag">' + msg + '</li>');
            scroller.refresh();
        }, function () {
            removeHintAttrList(attrLst);
            attrLst.append('<li class="hintflag">网络错误，请稍候再试</li>');
            scroller.refresh();
        }, "");

    }

    function bindEvents() {


        //支付完成后 刷新提货码
        MiniQuery.Event.bind(window, {
            'OrderDetailTakeCode': function (config) {
                if (config && billId == config.billid && config.takecode != '') {
                    var view = $('#view_orderdetail');
                    var takecode = view.find('[data-type="takecode"]');
                    takecode[0].innerText = '提货码：' + config.takecode;
                    setTakeCodeImg(view, config.takecode);
                    $('#view_orderdetail .orderPoint').html(config.point);
                }
            }
        });


        //设置支付方式后 如果是零售用户，并且是线下支付，要隐藏付款按钮
        MiniQuery.Event.bind(window, {
            'OrderDetailSetPayBtn': function (config) {
                if (config && billId == config.billid) {
                    var orderPayBtn = $('#orderdetail_payBtn');
                    orderPayBtn.hide();
                }
            }
        });

        //刷新订单支付信息
        MiniQuery.Event.bind(window, {
            'freshOrderPayNo': function (payinfo) {
                //{payno:data.payNo,billid:order.interid}
                var interid = payinfo.billid;
                if (interid == billId) {
                    targetorder.payno = payinfo.payno;
                    setBtnPayView($('#orderdetail_payBtn span'), '查看付款单');
                    var receive_btn = $('#orderdetail_receive_btn');
                    if (receive_btn.find('span')[0].innerText == '修改订单') {
                        receive_btn.parent().hide();
                    }
                    if (payinfo.payType == 'prepay') {
                        $('#orderdetail_payBtn').hide();
                    }
                }
            }
        });


        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: $(this).attr('src'), posi: 0 }]);
            }
        });

        viewPage.delegate('.btn-freightRule', 'click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['FreightRule']);
        });


        //再次购买
        $("#view_orderdetail").delegate('.buyagain', {
            'click': function () {
                var curBill = targetorder.interid;
                MiniQuery.Event.trigger(window, 'toview', ['CacheList', { copyBillId: curBill }]);
            },
            'touchstart': function () {
                $(this).attr('src', 'img/buyagain_s.png');
            },
            'touchend': function () {
                $(this).attr('src', 'img/buyagain.png');
            }
        });

        //商品明细展开
        $("#orderdetailarea").delegate('.rowhead', {
            'touchstart': function () {
                $(this).css('background', '#d9dadb');
                $(this).find("img").css('background', '#fff');
            },
            'touchend': function () {
                $(this).css('background', '#fff');
            },
            'click': function (event) {
                if (event.target.nodeName == "IMG") {
                    //商品详情
                    var index = $(this).attr("index");
                    var itemclick = datalist.SEOrderItems[index];
                    MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: { itemid: itemclick.FItemID } }]);
                } else {
                    var attrListFlag = $(this).attr("attrListFlag");
                    if (attrListFlag == 1) {
                        showDetail($(this));
                    }
                    var icon = $(this).find('.sumMsg div');
                    kdShare.changeClassOfTouch(icon, 'unfold_s', 'unfold');
                }
            }
        });


        //付款 按钮
        viewPage.delegate('#orderdetail_payBtn', {
            'click': function () {
                if (this.innerText == '付款') {
                    //hidePayMenu();
                    //改为弹出付款方式
                    OrderPay.payBill({
                        interid: targetorder.interid,
                        billno: targetorder.billno,
                        billmoney: targetorder.billmoney,
                        freight: targetorder.freight,
                        payType: targetorder.payType,
                        sendType: targetorder.sendType
                    });
                }
                else if (this.innerText == '付款通知') {
                    newPayDetail();
                }
                else if (this.innerText == '付款') {
                    //零售用户 付款
                    if (!kdAppSet.getIsShowPrice() || wxpay != 1) {
                        jAlert('暂时无法付款，请联系商家');
                        return;
                    }
                    OrderPay.payBill(targetorder, '', 1);
                }
                else {
                    OrderPay.viewPayBill(targetorder);
                }
                HideMenuBar(true);
            },
            'touchstart': function () {
                $(this).css({ background: '#8c9093', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#8c9093' });
            }
        });


        //付款
        viewPage.delegate('.paybuttonList .payNow', {
            'click': function () {
                if (!kdAppSet.getIsShowPrice() || wxpay != 1) {
                    jAlert('暂时无法付款，请联系商家');
                    return;
                }
                OrderPay.payBill(targetorder, '', 1);
                hidePayMenu(true);
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //付款通知
        viewPage.delegate('.paybuttonList .payNotify', {
            'click': function () {
                newPayDetail();
                hidePayMenu(true);
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //退货
        viewPage.delegate('#orderdetail_return_btn  .orderdetail_receive', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectBillList', {}]);
            },
            'touchstart': function () {
                $(this).css({ background: '#8c9093', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#8c9093' });
            }
        });


        //确认收货 修改订单 订单提醒  零售用户删除订单
        viewPage.delegate('#orderdetail_receive_btn',
            {
                'click': function () {
                    if (targetorder.status == _Status.sended) {
                        CheckOrder()
                    }
                    else if ((targetorder.status == _Status.check)) {
                        HideMenuBar();
                        hidePayMenu(true);
                        if(user.identity == 'retail'){
                            CancelOrder();
                        }
                    }
                    else if ((targetorder.status == _Status.receive)) {
                        OptMsg.ShowMsg('重复收货！');
                    }
                    else {
                        var billno = $('.ordertotalInfo .order').text();
                        OptMsg.OrderBillRemind(billno);
                    }
                },
                'touchstart': function () {
                    if (targetorder.status == _Status.check  && user.identity != 'retail') {

                    }  else if(targetorder.status == _Status.check  && user.identity == 'retail'){
                        $(this).css({ background: '#8c9093', color: '#fff' });
                    }else{
                        $(this).css({ background: '#ff6427', color: '#fff' });
                    }
                },
                'touchend': function () {
                    if (targetorder.status == _Status.check  && user.identity != 'retail') {
                    }else if(targetorder.status == _Status.check  && user.identity == 'retail'){
                        $(this).css({ background: '#fff', color: '#8c9093' });
                    } else {
                        $(this).css({ background: '#fff', color: '#ff6427' });
                    }
                }
            }
        );

        //取消订单
        viewPage.delegate('.orderbuttonList .cancelOrder', {
            'click': function () {
                HideMenuBar();
                CancelOrder();
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //修改订单
        viewPage.delegate('.orderbuttonList .changeOrder', {
            'click': function () {
                HideMenuBar();
                EditOrder();
            },
            'touchstart': function () {
                $(this).find('span').addClass('itemTouched');
            },
            'touchend': function () {
                $(this).find('span').removeClass('itemTouched');
            }
        });

        //申请退货
        viewPage.delegate('.orderdetailRejectDiv .rejectBtn', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['RejectGoodsSelect', { billid: billId }]);
            },
            'touchstart': function () {
                $(this).addClass('redBtn_touched');
            },
            'touchend': function () {
                $(this).removeClass('redBtn_touched');
            }
        })
    }

    //新增付款通知单
    function newPayDetail() {
        MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
            {
                newbill: true,
                payNo: '',
                payOrder: targetorder.billno,
                paymoney: kdAppSet.getIsShowPrice() ? targetorder.billmoney : null,
                payBillId: targetorder.interid
            }
        ]);
    }

    function hidePayMenu(ishide) {
        //hong
        var btn = $('#orderdetail_payBtn');
        if (btn.hasClass('orderdetail_payBtn') && !ishide) {
            btn.removeClass('orderdetail_payBtn');
            btn.addClass('orderdetail_payBtn_s');
            btn.find('span').attr('class', 'sprite-open_s');
            $('.paybuttonList').show();
        } else {
            btn.removeClass('orderdetail_payBtn_s');
            btn.addClass('orderdetail_payBtn');
            //btn.find('span').attr('class', 'sprite-open');
            $('.paybuttonList').hide();
        }
        if (wxpay != 1) {
            btn.find('span').attr('class', '');
        }

        //如果是已收货 则付款按钮位置会在最右边
        if (targetorder.status == _Status.receive) {
            $('.view_orderdetail .paybuttonList').css("right", "3%");
        } else {
            $('.view_orderdetail .paybuttonList').css("right", "41%");
        }

    }

    function HideMenuBar(isHide) {

        var btn = $('#orderdetail_receive_btn');
        var btnTitle=btn.find('span')[0].innerText;
        if ( btnTitle== '修改订单') {
            if (btn.attr('class') == 'orderdetail_changeOrder' && !isHide) {
                btn.attr('class', 'orderdetail_changeOrder_s');
                btn.find('span').attr('class', 'sprite-open_s');
                $('.orderbuttonList').show();
            } else {
                btn.attr('class', 'orderdetail_changeOrder');
                btn.find('span').attr('class', 'sprite-open');
                $('.orderbuttonList').hide();
            }
        } else if(btnTitle== '删除订单'){

        }
    }

    function EditOrder() {
        var curBill = targetorder.interid;
        MiniQuery.Event.trigger(window, 'toview', ['CacheOrderList', { billId: curBill }]);
    }

    function CancelOrder() {
        jConfirm("你确定要取消订单?", null, function (flag) {
            if (flag) {
                var para = { currentPage: 1, ItemsOfPage: 10 };
                para.para = { billno: targetorder.billno };
                CancelOrderApi(function (data) {
                    //通知购物车取消订单
                    MiniQuery.Event.trigger(window, 'EditBillFinish', [
                        { billid: targetorder.interid }
                    ]);
                    //通知订单列表刷新
                    MiniQuery.Event.trigger(window, 'freshListInfo', []);
                    OptMsg.ShowMsg(data[0].result);

                    setTimeout(function () {
                        kdShare.backView();
                    }, 500);
                    //刷新待付款列表
                    MiniQuery.Event.trigger(window, 'freshPaymentListInfo', []);
                }, para);
                function CancelOrderApi(fn, para) {
                    Lib.API.get('DelOrderByBillId', para,
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


    function CheckOrder() {
        var para = { currentPage: 1, ItemsOfPage: 10 };
        para.para = { interid: targetorder.interid };
        checkorderAPI(function (data) {
            if (data == 'ok') {
                var receive_btn = $('#orderdetail_receive_btn');
                receive_btn.find('span').html('已确认收货');
                $('#orderdetail-status').html('已收货');
                if (receive_btn.hasClass('orderdetail_receive')) {
                    receive_btn.removeClass('orderdetail_receive');
                }
                receive_btn.addClass('orderdetail_received');
                targetorder.status = _Status.receive;
                receive_btn.parent().css('display', 'none');
                OptMsg.ReceiveOrderGoods(targetorder.billno);
                OptMsg.ShowMsg('收货成功！');
            }
        }, para);
        function checkorderAPI(fn, para) {
            Lib.API.get('CheckOrder', para,
                function (data) {
                    fn && fn(data['Status']);
                }, function () {
                    kdAppSet.setKdLoading(false);
                }, function () {
                    kdAppSet.setKdLoading(false);
                });
        }
    }

    function setPriceVisiable() {
        var showPrice = $('#orderscrollarea .showPrice');
        var totalMoney = $('#orderscrollarea .totalMoney');
        var moneyDiv = $('.orderdetail-top .moneyDiv');
        var money = $('#orderdetail-money');
        var freight = $('#orderdetail_freight');
        if (kdAppSet.getIsShowPrice()) {
            showPrice.show();
            totalMoney.show();
            moneyDiv.show();
            money.show();
            freight.show();
        } else {
            showPrice.hide();
            totalMoney.hide();
            moneyDiv.hide();
            money.hide();
            freight.hide();
        }
    }

    function show() {
        OptAppMenu.showKdAppMenu(false);
        viewPage.show();
    }

    function hide() {
        hidePayMenu(true);
        viewPage.hide();
        PopMenu.hideElem();
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();


var OrderPay = (function () {
    //查看付款单
    //var payBillFlag = 'kdCreatePayBillFlag';

    function viewPayBill(order) {
        MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
            {
                payNo: order.payno,
                payOrder: order.billno
            }
        ]);
        kdAppSet.stopEventPropagation();
    }

    //订单支付
    function payBill(payInfo) {
        /*        var payInfo = {
         billno: '',
         interid: '',
         billmoney: '',
         freight: '',
         payType:'',//付款方式 "offline", "prepay", "wx"  ""
         sendType:'' //送货方式 配送方式（0--快递；1--门店自提；）
         };*/
        if (payInfo.payType == 'offline') {
            //线下
            MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                {
                    newbill: true,
                    payNo: '',
                    payOrder: payInfo.billno,
                    paymoney: kdAppSet.getIsShowPrice() ? payInfo.billmoney : null,
                    payBillId: payInfo.interid
                }
            ]);
        } else {
            MiniQuery.Event.trigger(window, 'toview', ['PayList', payInfo]);
        }
    }

    //微信支付
    function wxPay(order) {
        var NetID = window.kis$NetID || '';
        if (NetID) {
            callWx(order, NetID)
        } else {

            var eid = kdAppSet.getAppParam().eid;
            var mobile = kdAppSet.getUserInfo().senderMobile;
            OptLog.debug('发起getNetid: eid=' + eid + ' mobile=' + mobile + ' netid:' + window.kis$NetID);
            KDNetID.get(eid, function (msg, data) {
                if (msg == 'ok') {
                    OptLog.debug('返回getNetid: eid=' + eid + ' mobile=' + mobile + ' netid:' + data.NetID);
                    NetID = data.NetID || '';
                    if (NetID) {
                        callWx(order, NetID);
                    } else {
                        jAlert('NetID为空，发起支付出现异常，请稍后重试');
                    }
                } else {
                    jAlert('发起支付出现异常，请稍后重试');
                }
            });
        }
    }

    //微信代付
    function wxPayOther(order) {
        var urlpay = getWxPayUrl(order);
        MiniQuery.Event.trigger(window, 'toview', ['PayCode', {url: urlpay, pay: order}]);
    }

    //获取微信代付链接
    function getWxPayUrl(order) {
        var NetID = window.kis$NetID || '';
        var appParam = kdAppSet.getAppParam();
        var appId = appParam.appid;
        var eId = appParam.eid;
        var openId = appParam.openid;
        var billNo = order.billno;

        var freight = Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);

        var user = kdAppSet.getUserInfo();
        var contactName = encodeURIComponent(user.contactName);
        var senderMobile = encodeURIComponent(user.senderMobile);
        var cmpName = encodeURIComponent(encodeURIComponent(user.companyName));

        var payBackUrl = window.location.href.split('?')[0];
        payBackUrl = payBackUrl.replace("start.html", "index.html") + '?eid=' + eId;
        payBackUrl = encodeURIComponent(payBackUrl);

        var param = '?appid=' + appId + '&NetID=' + NetID + '&eid=' + eId + '&optOpenid=' + openId + '&billno=' + billNo
            + '&billmoney=' + sumMoney + '&contactName=' + contactName + '&senderMobile=' + senderMobile
            + '&cmpName=' + cmpName + '&payBackUrl=' + payBackUrl;
        var urlpay = 'http://mob.cmcloud.cn/webapp/PayOther/index.html';
        urlpay = urlpay + param;
        return urlpay;
    }

    function callWx(order, NetID) {

        var appParam = kdAppSet.getAppParam();
        var appId = appParam.appid;
        var eId = appParam.eid;
        var openId = appParam.openid;
        var billNo = order.billno;

        var freight = Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);
        if (sumMoney <= 0 || !kdAppSet.getIsShowPrice()) {
            MiniQuery.Event.trigger(window, 'toview', []);
        }

        var callbackUrl = window.location.href.split('?')[0] || '';
        callbackUrl = encodeURIComponent(callbackUrl);

        var user = kdAppSet.getUserInfo();
        var contactName = encodeURIComponent(user.contactName);
        var senderMobile = encodeURIComponent(user.senderMobile);
        var cmpName = encodeURIComponent(encodeURIComponent(user.companyName));

        var toview = 'OrderDetail|' + order.interid;
        var param = '?appid=' + appId + '&NetID=' + NetID + '&eid=' + eId + '&openid=' + openId + '&billno=' + billNo
            + '&billmoney=' + sumMoney + '&contactName=' + contactName + '&senderMobile=' + senderMobile
            + '&callbackurl=' + callbackUrl + '&toviewflag=' + toview + '&cmpName=' + cmpName;

        var urlpay = 'http://mob.cmcloud.cn/webapp/weixinPay/wxPay.html';
        urlpay = urlpay + param;
        window.location.href = urlpay;
    }


    //支付宝支付
    function aliPay(order) {

        var NetID = window.kis$NetID || '';
        if (NetID) {
            callAli(order, NetID)
        } else {
            KDNetID.get(kdAppSet.getAppParam().eid, function (msg, data) {
                if (msg == 'ok') {
                    NetID = data.NetID || '';
                    if (NetID) {
                        callAli(order, NetID);
                    } else {
                        jAlert('NetID为空，发起支付出现异常，请稍后重试');
                    }
                } else {
                    jAlert('发起支付出现异常，请稍后重试');
                }
            });
        }

    }

    function callAli(order, NetID) {
        var billNo = order.billno;
        var user = kdAppSet.getUserInfo();
        var freight = Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);
        if (sumMoney <= 0 || !kdAppSet.getIsShowPrice()) {
            MiniQuery.Event.trigger(window, 'toview', []);
        }
        var cmpName = encodeURIComponent(encodeURIComponent(user.companyName));
        var payLink = window.location.href.split('?')[0] || "kdurl_error";
        payLink = payLink.replace("start.html", "alipay.html") + '?alipay=1&billmoney=' + sumMoney + '&NetID=' + NetID + '&billno=' + billNo + '&cmpName=' + cmpName;
        MiniQuery.Event.trigger(window, 'toview', ['commonIframe', {src: payLink}]);
    }

    //资金通支付
    function zjtPay(order) {

        var NetID = window.kis$NetID || '';
        if (NetID) {
            callZjt(order, NetID)
        } else {
            KDNetID.get(kdAppSet.getAppParam().eid, function (msg, data) {
                if (msg == 'ok') {
                    NetID = data.NetID || '';
                    if (NetID) {
                        callZjt(order, NetID);
                    } else {
                        jAlert('NetID为空，发起支付出现异常，请稍后重试');
                    }
                } else {
                    jAlert('发起支付出现异常，请稍后重试');
                }
            });
        }

    }

    function callZjt(order, NetID) {

        var billNo = order.billno;
        var freight = kdAppSet.getUserInfo().ueVersion < 4 ? 0 : Number(order.freight);
        var sumMoney = order.billmoney + Number(freight);
        if (sumMoney <= 0 || !kdAppSet.getIsShowPrice()) {
            MiniQuery.Event.trigger(window, 'toview', []);
        }
        var payLink = window.location.href.split('?')[0] || "kdurl_error";
        payLink = payLink.replace("start.html", "zjtpay.html") + '?zjtpay=1&billmoney=' + sumMoney + '&billno=' + billNo + '&NetID=' + NetID;
        MiniQuery.Event.trigger(window, 'toview', ['commonIframe', {src: payLink}]);
    }

    //储值卡支付
    function cardPay(pay, vipMoney, payType) {
        /*billno: '',
         interid: '',
         billmoney: '',
         freight: ''
         payType:'',//付款方式 "offline", "prepay", "wx"  ""
         sendType:'' //送货方式 配送方式（0--快递；1--门店自提；）
         */
        var money = pay.billmoney + pay.freight;
        var payWay = 2;
        if (payType == 'vipcard') {
            payWay = 6;
        }
        var para = {
            payWay: payWay,
            payNo: '',
            payMoney: money,
            payDate: kdShare.getToday(),
            payMsg: '',
            payOrder: pay.billno,
            payTargetBank: '',
            payTargetBankNo: '',
            payImgList: []
        };
        kdAppSet.setKdLoading(true, "提交支付信息..");
        Lib.API.get('setPayOrderInfo', {
                para: para
            },
            function (data) {
                kdAppSet.setKdLoading(false);
                // OptMsg.ShowMsg(data.Msg);
                if (data.status == '0') {

                    if (payType == 'prepay') {
                        kdAppSet.updateUserInfo({
                            vipAmount: (vipMoney - money)
                        });
                    }else{
                        kdAppSet.updateUserInfo({
                            vipcardAmount: (vipMoney - money)
                        });
                    }

                    var payno = data.payNo || '';
                    MiniQuery.Event.trigger(window, 'freshOrderPayNo', [
                        {payno: payno, billid: pay.interid, payType: payType}
                    ]);
                    MiniQuery.Event.trigger(window, 'OrderDetailTakeCode', [
                        {billid: pay.interid, takecode: data.takecode, point: data.vantage }
                    ]);
                    OptMsg.PayBillMsg({
                        money: para.payMoney,
                        orderno: pay.billno,
                        billno: payno
                    });

                    //如果是门店自提 则要跳转到订单详情
                    if (pay.sendType == 1) {
                        OptMsg.ShowMsg('已支付,并生成提货码,请查看!', function () {
                            autoBack = true;
                            MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                                billId: pay.interid
                            }]);
                        }, 2000);
                    } else {
                        OptMsg.ShowMsg('已支付!', function () {
                            kdShare.backView();
                        }, 1500);
                    }
                }
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                jAlert("提交支付信息出错:" + msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('提交支付信息出错!');
            });
    }


    return {
        viewPayBill: viewPayBill,
        payBill: payBill,
        aliPay: aliPay,
        zjtPay: zjtPay,
        wxPay: wxPay,
        wxPayOther: wxPayOther,
        getWxPayUrl: getWxPayUrl,
        cardPay: cardPay
    };
})
();


var Orderlist = (function () {
    var div, viewpage,
        samples,
        tabNum,
        listviews,
    //0全部 1待审核 2待发货 3已发货 4 已收货 5待付款 6已付款 7部分发货
        listStatus = {
            all: 0,
            check: 1,
            unsend: 2,
            sended: 3,
            receive: 4,
            unpay: 5
        },
        curTabIndex,
        itemsOfPage, orderlistfresh, liDateHead, bretail,
        keywordhint, txSearch, endTime, iheight, hasInit, afterRefresh;
    var remindArr = [];

    //初始化视图
    function initView() {
        if (!hasInit) {
            tabNum = 5;
            div = document.getElementById('view_orderlist');
            viewpage = $(div);
            samples = $.String.getTemplates(document.getElementById('orderlist_list0').innerHTML, [
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
            listviews = [];
            initListView();
            itemsOfPage = 10;
            curTabIndex = 0;
            orderlistfresh = false;
            keywordhint = "搜索订单号";
            txSearch = $("#view_orderlist .txtSearch");
            endTime = " 23:59:59";
            bretail = kdAppSet.getUserInfo().identity == 'retail';
            liDateHead = '<li lindex={index} class="lidatehead {buyer-view}" status="1">{date}</li>';
            iheight = $(window).height() - 44 - 40;
            bindEvents();
            bindScrollEvents();
            hasInit = true;
        }
    }


    //初始化列表视图数据
    function initListView() {
        for (var i = 0; i < tabNum; i++) {
            var listwrap = document.getElementById('orderlist_listwrap' + i);
            var listv = document.getElementById('orderlist_list' + i);
            var scroller = Lib.Scroller.create(listwrap);
            scroller.noticetop = 1.8;
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
    function initScroll(listview) {
        var option = {
            fnfresh: function (reset) {
                reSearch('', reset);
            },
            fnmore: function (reset) {
                GetOrderList('', reset);
            }
        };
        kdctrl.initkdScroll(listview.scroller, option);
    }

    function bindScrollEvents() {
        for (var i = 0; i < tabNum; i++) {
            initScroll(listviews[i]);
        }
    }

    //获取当前页签的搜索条件
    function getCurDataKey() {
        var startDatav = $("#orderlist_dateBegin").val();
        var endDatev = $("#orderlist_dateEnd").val() + endTime;
        var keywordv = txSearch.val() == keywordhint ? "" : txSearch.val();
        return keywordv + startDatav + endDatev;
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
        $('.orderlist').hide();
        changePageView(index);
        listview.listwrap.show();
        if (!listview.scroller || bfresh || bReload) {
            listview.currentPage = 1;
            listview.totalPageCount = 1;
            listview.listdata.length = 0;
            GetOrderList();
        }
    }

    function removeHint(tabindex) {
        ullist = getOptlist(tabindex);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    //获取当前list操作
    function getOptlist(index) {
        return $(listviews[index].listv);
    }

    //根据模板获取列表字符串信息
    function getTemplateStr(item) {
        var isretail = '';
        if (parseInt(item.status) == listStatus.unpay) {
            isretail = 'display:none';
        }

        var itemList = item.itemList;
        var listr = $.String.format(samples['li'], {
            billid: item.interid,
            billno: item.billno,
            status: getStatusName(item.status),
            amount: item.amount,
            num: item.num,
            billmoney: kdAppSet.formatMoneyStr(item.billmoney + item.freight),
            time: item.date,
            index: item.index,
            optname: getOptName(item.status),
            optname2: getOptName2(item.status),
            btnstatus: item.status,
            paystatus: parseInt(item.paystatus) == 0 ? 'display:none;' : '',
            isretail: isretail,
            payimg: getPayImg(item.paystatus),
            receivername: getRecName(item.receivername),
            //直接隐藏已发货的催单键--2015.12.3
            //show: parseInt(item.status) == listStatus.receive ? 'display:none;' : '',
            show: parseInt(item.status) == 4 || parseInt(item.status) == 3 || parseInt(item.status) == 5 ? 'display:none;' : '',
            'store-flag': item.sendType == 1 ? '(门店自提)' : '',
            'buyer-view': bretail ? 'hide' : '',
            'retail-view': bretail ? '' : 'hide',
            'freight-view': item.freight == 0 ? 'hide' : '',
            'freight': item.freight,
            'out-view': parseInt(item.status) == 7 ? '' : 'hide',
            'out-num': item.outNum,
            'rows': $.Array.map(itemList, function (row, index) {
                return $.String.format(samples['row'], {
                    imgurl: row.imgurl == "" ? "img/no_img.png" : row.imgurl,
                    goods: row.name,
                    isgift: row.isgift == 0 ? 'hide' : '',
                    money: kdAppSet.formatMoneyStr(row.summoney),
                    goodsnum: kdAppSet.formatMoneyStr(row.qty)
                });
            }
            ).join('')
        });

        return listr;
    }

    function getRecName(status) {
        var userinfo = kdAppSet.getUserInfo();
        var identity = userinfo.identity;
        if (identity == "manager" || identity == "buyer") {
            return "(" + status + ")";
        }
        else {
            return "";
        }
    }

    function getOptName(status) {
        var optName = '再次购买';
        if (status == listStatus.unpay) {
            optName = '付款';
        }
        return optName;
    }

    function getOptName2(status) {
        var optName = '订单状态';
        if (status == listStatus.unpay) {
            optName = '付款通知';
        }
        return optName;
    }

    //根据页面标签获取 option值
    function getOptionIndex(index) {
        var optionlist = [0, 5, 1, 2, 3];
        return optionlist[index];
    }

    function getPayImg(status) {
        var imgh = 'img/';
        var img = 'kdpx.gif';
        if (status == 1) {
            //微信支付
            img = 'wx_pay.png';
        } else if (status == 2) {
            //线下支付
            img = 'lineoff_pay.png';
        } else if (status == 3) {
            //储值卡支付
            img = 'prepay.png';
        } else if (status == 4) {
            //支付宝支付
            img = 'alipay_list.png';
        } else if (status == 5) {
            //资金通支付
            img = 'zjt_list.png';
        }
        return imgh + img;
    }

    //获取数据列表html字符串
    function getListHtml(data, listdata, tabindex) {
        var inum = data.length;
        var htmlstr = "";
        var listview = listviews[tabindex];
        for (var i = 0; i < inum; i++) {
            listdata[data[i].index] = data[i];
            var item = data[i];
            var datestr = item.date.substring(0, 7);
            if (datestr != listview.dateCmp) {
                var datestrh = datestr.replace("-", "年") + "月";
                htmlstr += $.String.format(liDateHead, {
                    date: datestrh, index: item.index,
                    'buyer-view': bretail ? 'hide' : ''
                });
                listview.dateCmp = datestr;
            }
            var listr = getTemplateStr(item);
            htmlstr += listr;
        }
        return htmlstr;
    }

    //获取订单列表
    function GetOrderList(index, fnReset) {
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
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
            listview.scroller.refresh();
        }

        var startDatav = $("#orderlist_dateBegin").val();
        var endDatev = $("#orderlist_dateEnd").val() + endTime;
        var keywordv = txSearch.val() == keywordhint ? "" : txSearch.val();
        var optOpenid = kdAppSet.getUserInfo().optid;

        para.para = {
            optOpenid: optOpenid,
            Option: getOptionIndex(curTabIndex),
            KeyWord: kdAppSet.ReplaceJsonSpecialChar(keywordv),
            BeginDate: startDatav,
            EndDate: endDatev
        };

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
        }, para, fnReset);
    }


    //设置滚动页面 是否还有下一页
    function setScrollPageEnd(index) {
        var lv = listviews[index];
        lv.scroller.isPageEnd = (lv.currentPage - 1 >= lv.totalPageCount);
    }

    function setTotalPage(index, json) {
        listviews[index].totalPageCount = parseInt(json['TotalPage']);
    }

    //调用订单列表api
    function GetOrderListAPI(fn, para, fnReset) {
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
                        amount: item.famount,
                        status: item.FRemark, // 订单状态  //0全部 1待审核 2待发货 3已发货 4 已收货 5待付款
                        consigndate: item.fconsigndate,
                        billno: item.FBillNo,
                        billmoney: item.FBillMoney || 0,
                        date: item.FDate,
                        settle: item.fsettlename,
                        num: item.FAuxQty,
                        outNum: item.OutAuxQty,
                        paystatus: item.paystatus || 0, //支付状态  1微信 2线下支付 3储值卡支付
                        expressnumber: item.FWLNumber,
                        expresscom: item.FWLCompany,
                        freight: item.freight || 0,
                        payType: item.PayType || '',
                        sendType: item.SendType || 0,  //送货方式 配送方式（0--快递；1--门店自提；）
                        itemList: item.itemList || [],
                        receivername: item.receivername
                    };
                });
                fn && fn(list, userflag);
                setScrollPageEnd(userflag);
                fnReset && fnReset();
            }, function (code, msg, json, root, userflag) {
                var index = userflag || curTabIndex;
                removeHint(index);
                fnReset && fnReset();
                kdAppSet.showErrorView(msg, errorRefresh, userflag);
            }, function (errCode) {
                removeHint(curTabIndex);
                fnReset && fnReset();
                kdAppSet.showErrorView(errCode, errorRefresh, curTabIndex);

            }, curTabIndex);

        var listview = listviews[curTabIndex];
        var cmpkey = getCurDataKey();
        if (listview.dataKey != cmpkey) {
            listview.dataKey = cmpkey;
        }
    }

    //错误刷新
    function errorRefresh(index) {
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        GetOrderList(index);
    }

    //订单页签切换
    function changePageView(index) {
        var headtab = viewpage.find(".headtab");
        var tabs = headtab.find('.tab');
        var listviews = viewpage.find(".orderlist");
        var linebs = headtab.find('.lineb');
        tabs.css('color', '#686f76');
        linebs.hide();
        listviews.hide();
        $(linebs[index]).show();
        $(listviews[index]).show();
        $(tabs[index]).css('color', '#FF753E');
    }

    function textFill(input) {
        input.addClass("hintcolor");
        input.focus(function () {
            if ($.trim(input.val()) == keywordhint) {
                input.val('');
            }
            input.removeClass("hintcolor");
        });
        input.blur(function () {
            if ($.trim(input.val()) == '') {
                input.val(keywordhint);
                input.addClass("hintcolor");
            }
        });
    }


    //删除列表中的某个订单
    function deleteListItem(billid, tabindex) {
        var ullist = listviews[tabindex].listv;
        deleteItem(ullist);
        listviews[tabindex].scroller.refresh();
        function deleteItem(ullist) {
            $(ullist).children().filter('[billid=' + billid + ']').remove();
        }
    }

    function bindEvents() {

        MiniQuery.Event.bind(window, {
            'freshListInfo': function () {
                freshListInfo();
            }
        });

        //订单支付 刷新待付款列表信息
        MiniQuery.Event.bind(window, {
            'freshOrderPayNo': function (payinfo) {
                //{payno:data.payNo,billid:order.interid}
                deleteListItem(payinfo.billid, 1);
            }
        });

        $("#view_orderlist .headtab .tab").bind('click', function () {
            var dataindex = this.getAttribute("data-index");
            getOrderListByCondition(dataindex);
        });

        for (var i = 0; i < tabNum; i++) {
            ListBindEvents(listviews[i].listv);
        }

        initDate();
        txSearch.val(keywordhint);
        txSearch.keydown(function (event) {
            if (event.keyCode == 13) {
                reSearch(true);
            }
        });

        textFill(txSearch);
        txSearch.delegate('', {
            'focus': function () {
                $(".divSearch #imgClear").css('display', 'block');
            },
            'blur': function () {
                var searchVal = kdShare.trimStr($(this).val());
                if (searchVal == '' || searchVal == keywordhint) {
                    $(".divSearch #imgClear").css('display', 'none');
                }
            }
        });

        $("#view_orderlist .divSearch #imgClear").bind("click", function () {
            txSearch.val("");
            txSearch.val(keywordhint);
            txSearch.addClass("hintcolor");
            $(this).css('display', 'none');
        });

        $("#view_orderlist .btnDate").bind("click", function () {
            var datePan = $("#view_orderlist .datePan");
            var btnDateImg = $(this).find("img");
            var bview = datePan.css("display");
            var itop = "2.68rem";
            if (bview == "none") {
                setScrollerNoticetop(2.78);
                btnDateImg.removeClass("sprite-downext downext");
                btnDateImg.addClass("sprite-upext upext");
            } else {
                itop = "1.8rem";
                setScrollerNoticetop(1.88);
                btnDateImg.removeClass("sprite-upext upext");
                btnDateImg.addClass("sprite-downext downext");
            }
            listviews[curTabIndex].scroller.refresh();
            $("#orderlistview .orderlist").animate({ top: itop }, "normal");
            datePan.animate({ height: 'toggle', opacity: 'toggle' }, "normal");
        });

        $("#view_orderlist .btnDate").on(kdShare.clickfnImg($("#view_orderlist .btnDate img"), null));
        var now = $.Date.now();
        $("#orderlist_dateEnd").val($.Date.format(now, "yyyy-MM-dd"));
        //默认获取最近90天的订单数据
        now.setDate(now.getDate() - 90);
        $("#orderlist_dateBegin").val($.Date.format(now, "yyyy-MM-dd"));
        $("#view_orderlist .btnSearch").bind("click", function () {
            reSearch(true);
            kdAppSet.h5Analysis('orderlist_btnSearch');
        }).on(kdShare.clickfn());
    }

    function setScrollerNoticetop(itop) {
        for (var i = 0; i < tabNum; i++) {
            listviews[i].scroller.noticetop = itop;
        }
    }

    function initDate() {

        kdctrl.initDate($(".view_orderlist .kdcDate"));

        var dateCtrl = $('#orderlist_dateBegin,#orderlist_dateEnd');
        dateCtrl.bind('change',
            function () {
                reSearch(true);
            }
        );
    }

    function getItembyIndex(index) {
        return listviews[curTabIndex].listdata[index];
    }

    function ListBindEvents(ulobj) {

        var $list = $(ulobj);
        $list.delegate('.orderlist_liinfo', {
            'touchstart': function () {

                $(this).parents('li').css('background', '#fff');
                $(this).css('background-color', '#d9dadb');
                $(this).parents('li').find("img").css("visibility", "hidden");

            }, 'touchend': function () {

                $(this).css('background-color', '#fff');
                $(this).parents('li').find("img").css("visibility", "visible");

            }
        }).delegate('div.orderlist_liinfo', 'click', function () {

            var index = this.getAttribute("index");
            var item = getItembyIndex(index);
            kdAppSet.stopEventPropagation();
            MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                billId: item.interid
            }]);

        });

        //零售用户列表查看详情
        $list.delegate('[data-cmd="detail"]', {
            'click': function () {

                var index = this.getAttribute("index");
                var item = getItembyIndex(index);
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                    billId: item.interid
                }]);

            },
            'touchstart': function () {
                var $this = $(this);
                $this.addClass('pressed');
                $this.find('[data-cmd="li"]').addClass('pressed');
            },
            'touchend': function () {
                var $this = $(this);
                $this.removeClass('pressed');
                $this.find('[data-cmd="li"]').removeClass('pressed');
            }
        });

        //订单状态
        $list.delegate('div.optStatus', {
            'click': function () {

                var index = this.getAttribute("index");
                var item = getItembyIndex(index);
                if (item.status == listStatus.unpay) {
                    //待付款 付款通知
                    MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                        {
                            newbill: true,
                            payNo: '',
                            payOrder: item.billno,
                            paymoney: kdAppSet.getIsShowPrice() ? item.billmoney + Number(item.freight) : null,
                            payBillId: item.interid
                        }
                    ]);

                } else {
                    kdAppSet.stopEventPropagation();
                    MiniQuery.Event.trigger(window, 'toview', ['Express', { item: item }]);
                }
            },
            'touchstart': function () {
                $(this).css({ background: '#8c9093', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#8c9093' });
            }
        });

        //再次购买
        $list.delegate('div.optbutton', {
            'click': function () {
                var index = this.getAttribute("index");
                var item = getItembyIndex(index);
                if (item.status == listStatus.unpay) {
                    //待付款 付款
                    if (!kdAppSet.getIsShowPrice()) {
                        jAlert('暂时无法付款，请联系商家');
                        return;
                    }
                    OrderPay.payBill({
                        interid: item.interid,
                        billno: item.billno,
                        billmoney: item.billmoney,
                        payType: item.payType,
                        sendType: item.sendType,
                        freight: Number(item.freight)
                    });
                    kdAppSet.h5Analysis('orderlist_pay');
                } else {
                    MiniQuery.Event.trigger(window, 'toview', ['CacheList', { copyBillId: item.interid }]);
                    kdAppSet.h5Analysis('orderlist_buymore');
                }
            },
            'touchstart': function () {
                $(this).css({ background: '#ff6427', color: '#fff' });
            },
            'touchend': function () {
                $(this).css({ background: '#fff', color: '#ff6427' });
            }
        });

        //提醒厂家
        $list.delegate('.remind', {
            'click': function () {
                var status = this.getAttribute('status');
                var index = this.getAttribute('index');
                var remindBillno = getItembyIndex(index).billno;//催单单号
                if (remindArr.indexOf(remindBillno) < 0) {
                    remindArr.push(remindBillno);
                    if (status == listStatus.sended) {
                        CheckOrder(this, index);
                    }
                    else if (status == listStatus.receive) {
                    }
                    else {
                        var item = getItembyIndex(index);
                        OptMsg.OrderBillRemind(item.billno);
                    }
                } else {
                    OptMsg.ShowMsg("已提醒厂家进行业务处理！", "", 1100);
                }
                kdAppSet.h5Analysis('orderlist_remind');
            },
            'touchstart': function () {
                $(this).addClass("remind_s");
            },
            'touchend': function () {
                $(this).removeClass("remind_s");
            }
        });

    }


    function CheckOrder(obj, index) {
        var data2 = getItembyIndex(index);
        var para = { currentPage: 1, ItemsOfPage: 10 };
        para.para = { interid: data2.interid };
        checkorderAPI(function (data) {
            if (data == 'ok') {
                if ($(obj).hasClass('optConfirm')) {
                    $(obj).removeClass('optConfirm');
                }
                $(obj).css('display', 'none');
                $(obj).parents('li').find('.pstatus').html('已收货');
                listviews[curTabIndex].listdata[index].status = listStatus.receive;
                OptMsg.ReceiveOrderGoods(data2.billno);
                OptMsg.ShowMsg('收货成功！');
            }
        }, para);
        function checkorderAPI(fn, para) {
            Lib.API.get('CheckOrder', para,
                function (data) {
                    fn && fn(data['Status']);
                }, function (msg) {
                    kdAppSet.setKdLoading(false);
                    if (msg) {
                        jAlert(msg);
                    }
                }, function (errCode) {
                    kdAppSet.setKdLoading(false);
                    if (errCode) {
                        jAlert(kdAppSet.getAppMsg.workError + errCode);
                    }
                });
        }
    }

    function getStatusName(index) {
        index = index || 0;
        var statusList = ["", "待确认", "待发货", "已发货", "已收货", "待付款", "", "部分发货"];
        return statusList[index];
    }


    function freshListInfo() {
        initView();
        getOrderListByCondition(curTabIndex, true);
    }


    function reSearch(bsearch, fnReset) {
        var index = curTabIndex;
        var listview = listviews[index];
        listview.dateCmp = "";
        listview.currentPage = 1;
        listview.listdata.length = 0;
        if (bsearch) {
            listview.scroller.scrollTo(0, 0, 500);
            listview.listv.innerHTML = '';
        }
        GetOrderList('', fnReset);
    }

    function render(config) {
        initView();
        show();
        if (orderlistfresh && config.tabindex == undefined) {
            return;
        }
        orderlistfresh = true;
        kdAppSet.setKdLoading(false);
        var tabindex = config.tabindex || 0;
        if (config.KeyWord) {
            txSearch.val(config.KeyWord);
        }
        if (config.afterRefresh) {
            // 付款单页面退出下次需要刷新
            afterRefresh = config.afterRefresh;
        } else {
            if (afterRefresh) {
                txSearch.val('');
                afterRefresh = false;
            }
        }
        getOrderListByCondition(tabindex);//默认取全部
    }

    function show() {
        //viewpage.show();
        OptAnimation.show(viewpage);
        kdAppSet.setKdLoading(false);
        listviews[curTabIndex].scroller.refresh();
    }

    function hide() {
        //viewpage.hide();
        OptAnimation.hide(viewpage);
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();


/**
 * Created by clover_wu on 2015-01-21
 *
 * alter by hong on 2015-04-27
 *
 *alert by mayue on 2015-12-22 重新改写定位
 */

var Gaode = (function () {
    var config;
    var mapObj;

    var scroller,
        listwrap,
        maplist,
        sample;
    //function mapInit(location) {
    //    if(mapObj){
    //        return;
    //    }
    //    mapObj = new AMap.Map("viewMapKingdee", {
    //        view: new AMap.View2D({
    //            //center:new AMap.LngLat(113.955391,22.533938),//地图中心点
    //            center:new AMap.LngLat(location.long,location.lat),//地图中心点
    //            zoom:50 //地图显示的缩放级别
    //        })
    //    });
    //}


    //已知点坐标--地址
    function geocoder(initconfig) {
        config = initconfig;
        var location = config.location;
        mapObj = config.mapObj;
        mapObj.setZoomAndCenter(18, [location.long, location.lat]);
        //mapInit(location);
        var MGeocoder;
        //加载地理编码插件
        mapObj.plugin(["AMap.Geocoder"], function () {
            MGeocoder = new AMap.Geocoder({
                radius: 2000,
                extensions: "all"
            });
            //返回地理编码结果
            AMap.event.addListener(MGeocoder, "complete", geocoder_CallBack);
            //逆地理编码
            var lnglatXY = new AMap.LngLat(location.long, location.lat);
            MGeocoder.getAddress(lnglatXY);
        });
    }



    //回调函数--显示地址列表
    function geocoder_CallBack(data) {
        config.callback(data);
        if (!maplist) {
            listwrap = document.getElementById('view_mapdiv');
            maplist = document.getElementById('view_maplist');
            sample = $.String.between(maplist.innerHTML, '<!--', '-->');
        }

        var addressh = data.regeocode.addressComponent;
        var addressinfo = addressh.province + addressh.city + addressh.district;
        maplist.innerHTML = $.Array.map(data.regeocode.pois, function (item, i) {
            if (i % 4 == 0) {
                setView(i + 1, item.location.toString());
            }
            return $.String.format(sample, {
                index: i,
                name: item.name,
                address: addressinfo + item.address
            });
        }).join('');

        if (!scroller) {
            scroller = Lib.Scroller.create(listwrap);
        } else {
            scroller.refresh();
        }
    }

    //设置标记点
    function setView(index, e) {
        var coor = e.split(','),
            lnglat = new AMap.LngLat(coor[0], coor[1]);
        var kk = "http://webapi.amap.com/images/" + index + ".png";
        new AMap.Marker({
            map: mapObj,
            // icon: kk,
            position: lnglat,
            offset: new AMap.Pixel(-10, -34)
        });

        mapObj.setFitView();


        //测试
        //var marker = new AMap.Marker({
        //    map: mapObj,
        //    // icon: kk,
        //    position: lnglat,
        //    offset: new AMap.Pixel(-10, -34)
        //});

        //mapObj.setFitView();

        //marker.on('click', function (e) {
        //    infowindow.open(mapObj, e.target.getPosition());
        //})
        //AMap.plugin('AMap.AdvancedInfoWindow', function () {
        //    infowindow = new AMap.AdvancedInfoWindow({
        //        offset: new AMap.Pixel(0, -30)
        //    });
        //})

    }



    //地址--坐标
    function regeocoder(address, fn) {
        kdAppSet.setKdLoading(true, '获取地址信息...');
        AMap.service(["AMap.Geocoder"], function () {
            geocoder = new AMap.Geocoder({
                radius: 1000 //范围，默认：500
            });

            //地理编码,返回地理编码结果
            geocoder.getLocation(address, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    kdAppSet.setKdLoading(false);
                    fn && fn({
                        result: status,
                        lng: result.geocodes[0].location.getLng(),
                        lat: result.geocodes[0].location.getLat()
                    });
                };
                if (status == 'error') {
                    kdAppSet.setKdLoading(false);
                    fn && fn({
                        result: status
                    });
                };
                if (status == 'no_data') {
                    kdAppSet.setKdLoading(false);
                    fn && fn({
                        result: status
                    });
                };

            });
        }); //加载地理编码
    }

    //获取坐标
    function getlocation(fn) {
        try {
            AMap.service(["AMap.Geolocation"], function () {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    //zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    buttonPosition: 'RB'
                });
                //mapObj.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', function (data) {
                    fn && fn(data);
                });//返回定位信息
                AMap.event.addListener(geolocation, 'error', function (data) {
                    fn && fn(data);
                });//返回定位出错信息
            });
        } catch (e) {
            fn && fn({});
        }

    }

    //计算两点之间距离
    //传入开始经纬度   结束地址经纬度 object{lng,lat}
    //返回距离 单位 米
    function pointdistance(begin, end) {
        var lnglat = new AMap.LngLat(begin.lng, begin.lat);
        var distance = lnglat.distance([end.lng, end.lat]);
        return distance;
    }

    return {
        geocoder: geocoder,//坐标--地址
        regeocoder: regeocoder,//地址-坐标
        getlocation: getlocation,//获取当前坐标
        pointdistance: pointdistance,//两点之间距离
    }
})();

/**
 * 版本更新说明
 *
 */

    /*1、新增限购功能，提供限购期间限购、每日限购、每单限购三种限购方式

     3、
     4、*/

var UpdateContentList = [
    '<p class="title">* 微商城5.8版本（2016-06-23）</p>',
    '1、商品详情中增加在线客服功能 ',
    '2、增加会员实体卡（提货卡、多账户卡）付款方式',
    '3、会员中心增加实体卡余额查询功能 ',
    '',
    '<p class="title">* 微商城5.7版本（2016-06-02）</p>',
    '1、经销商“我”的界面增加“邀请有奖”功能 ',
    '2、零售客户“我”的界面增加“邀请码”功能 ',
    '3、付款方式增加微信代付功能',
    '4、商品列表排序方式增加按最近购买时间排序',
    '5、“我”的界面UI视觉优化',
    '',
    '<p class="title">* 微商城5.6版本（2016-05-23）</p>',
    '1、新增限购功能，提供限购期间限量、每日限量、每单限量三种限购方式',
    '2、商品详情界面促销方案显示优化',
    '3、支持商品类别、商品的二维码和地址直接访问方式（旗舰版的商品设置模块中提供商品类别、商品的独立链接地址和二维码）',
    '4、会员中心支持充值送积分或金额（仅支持旗舰4.2版本）',
    '5、其它细节调整',
    '',
    '<p class="title">* 微商城5.5版本（2016-05-05）</p>',
    '1、增加公告按钮及公告列表界面',
    '2、增加门店按钮及门店列表界面',
    '3、增加新品、促销按钮',
    '4、首页按钮区域内容可针对经销商、零售客户进行设置',
    '5、去除首页新品、促销区域最多显示6个商品的限制',
    '6、我要自提列表增加导航功能',
    '',
    '<p class="title">* 微商城5.4版本（2016-04-20）</p>',
    '1、商品列表提供多种排序方式',
    '2、零售客户：“我”的界面隐藏“退货”按钮，“退货”入口移至已发货订单详情界面',
    '3、商品设置增加标签功能，商品搜索时勾选标签后可在标签中进行搜索',
    '4、门店自提增加导航功能',
    '5、会员中心增加订单详情查询功能',
    '6、会员中心提供两个显示风格，可在微商城参数设置中进行设置',
    '7、微信支付使用订单号作为商户订单号，方便商家对账',
    '',
    '<p class="title">* 微商城5.3版本（2016-03-24）</p>',
    '1、商品详情中显示满赠/折/折赠、全场赠/折/折赠的促销方案',
    '2、会员中心增加积分兑换入口',
    '3、增加零售客户未支付订单作废参数',
    '4、增加门店自提时间参数',
    '5、增加会员注册送金额参数',
    '6、增加自动收货参数',
    '7、经销商订单增加送货方式选项',
    '8、微商城首页设置中增加新品、促销、推荐区域链接地址',
    '9、微信支付，支付宝支付信息中，增加客户名称，方便对账',
    '',
    '<p class="title">* 微商城5.2版本（2016-03-04）</p>',
    '1、新增零售客户积分兑换商品功能 ',
    '2、零售客户储值卡余额变动短信提醒',
    '3、支付方式增加银行卡支付',
    '4、首页新品、促销、推荐三个区域可设置为隐藏或显示',
    '',
    '<p class="title">* 微商城5.1.1版本（2016-02-18）</p>',
    '1、商品详情模块支持后台设置的url链接跳转（链接后面需要加空格来区隔） ',
    '',
    '<p class="title">* 微商城5.1版本（2016-01-27）</p>',
    '1、增加支付宝支付方式',
    '2、线下支付支持自定义支付方式',
    '3、支持微信卡券支付',
    '',
    '<p class="title">* 微商城5.0版本（2016-01-12）</p>',
    '1、部分发货的订单在订单详情中显示已出库数量及金额，订单状态中显示多条出库记录',
    '2、增加“是否需要发票”参数',
    '3、增加零售客户支付成功后“销售订单自动审核”参数',
    '4、门店自提订单允许商家在销售订单中进行变更，顾客提货时根据订单实际金额自动进行储值金额多退少补',
    '5、“我---交易管理---应付款”变更为往来应付（针对经销商身份），提供以下数据：已下单金额、未出库金额、期初应付金额、交易金额、实付金额',
    '',
    '<p class="title">* 微商城4.9版本（2015-12-24）</p>',
    '1、首页图片设置：支持新增、修改、删除图片',
    '2、新品、促销、推荐设置：',
    ' (1）增加单图、双图显示模式，共支持三种显示模式',
    ' (2）新品、促销区域展示的商品及顺序可自定义',
    ' (3）首页区域名称支持自定义',
    '3、零售客户支持促销方案，提交订单时带出促销方案',
    '4、增加“服务号关注”展示',
    '5、页面回退程序优化',
    '6、修复了商品列表以及订单列表 下拉刷新提示不准确的bug',
    '7、优化了加入购物车，商品显示框的大小，支持动态变化（根据商品辅助属性个数）',
    '',
    '<p class="title">* 微商城4.8.1版本（2015-12-14）</p>',
    '1、优化各种屏幕大小的UI适配',
    '',
    '<p class="title">* 微商城4.8版本（2015-12-3）</p>',
    '1、在基础资料【客户】中增加【联系人信息】页签，用于管理客户的多联系人，此处的联系人与微CRM的联系人信息保持一致；',
    '2、优化客户和联系人的地址信息，将“省”、“市”、“区/县”字段由字符录入改为从辅助资料选择，避免录入错误；',
    '3、在【微商城参数设置】中增加【微商城客服】设置页签，微商城客服可以不是专营业务员，而是指定部门的人员；',
    '4、商品设置中增加批量上传图片功能。',
    '',
    '<p class="title">* 微商城4.7版本（2015-11-20）</p>',
    '1、我的买家新增买家订单及详情联查功能；',
    '2、首页“我要分享”更改为“我要提货”，在“我要提货”列表展示待提货订单信息；',
    '3、优化经销商、零售客户订单列表展示方式；',
    '4、微商城参数中经销商分享设置增加价格选择选项；',
    '5、经销商购买记录报表中增加“支付方式、交货方式、经销商价格”列，付款金额增加储值卡支付金额、线下支付（已审核）单据金额统计，门店自提订单详情增加零售信息。',
    '',
    '<p class="title">* 微商城4.6版本（2015-11-5）</p>',
    '1、零售客户支持门店自提、自提时间选择；相应的门店收银中增加了顾客提货单，可用于微商城客户到门店的自提业务处理；',
    '2、零售客户在微商城的消费可参与会员积分；',
    '3、微商城参数增加支付方式设置，商家可选择符合自身需要的支付方式。其中针对零售客户可选择使用微信支付、会员储值卡支付、线下支付（仅限快递送货时可选）；',
    '4、首页大图优化。',
    '',
    '<p class="title">* 微商城4.5版本（2015-10-15）</p>',
    '1、修改微信支付完成后收款单的生成方式，在收款单和销售订单上增加微信支付单号，在微信支付平台增加销售订单号，方便商家进行对账；',
    '2、增加跨境商品下单时身份证号码验证；',
    '3、前端恢复多辅助属性的批量下单功能；',
    '4、前端“我的买家”中增加买家订单金额查询；',
    '5、经销商购买记录报表中增加统计经销商自己的订单；',
    '6、商品设置中，已上架商品可以打开直接编辑。',
    '',
    '<p class="title">* 微商城4.4版本（2015-09-16）</p>',
    '1、类目支持横排显示，并可根据类目选择直接显示商品；',
    '2、支持分仓库存检查；',
    '3、新增经销商分享销售记录表；',
    '4、前端用户体验优化。',
    '',
    '<p class="title">* 微商城4.3版本（2015-08-31）</p>',
    '1、支持商品分享时，接收者享受分享者的价格策略；',
    '2、支持销售订单上的套装商品在转物流发货时，可自动拆分成明细商品到网上订单。'
];
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


var PayCode = (function () {
    var viewPage, hasInit;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid-pay-code');

            hasInit = true;
        }
    }

    function render(config) {
        config = config || {};
        initView();
        show();
        setPayCode(config);
        setWxShare(config.pay);
    }


    //在pc端使用 自己去获取微信appid
    function setAppid() {

        if(kdAppSet.getAppParam().appid){
           return;
        }

        function createTimestamp() {
            return parseInt(new Date().getTime() / 1000) + '';
        }

        var eid = kdAppSet.getAppParam().eid;
        var timestamp = createTimestamp();
        var token = timestamp + "kingdee" + eid;
        token = Lib.MD5.encrypt(token);
        var param = {
            "eid": eid,
            "timestamp": timestamp,
            "token": token
        };

        var url = 'http://mob.cmcloud.cn/serverCloud/Weixin/GetServerInfo_Api';
        var xhr = new window.XMLHttpRequest();
        xhr.open('post', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        var appInfo = json.data;
                        kdAppSet.setAppParam({
                            'appid': appInfo.appid
                        });
                    } else {
                        OptMsg.ShowMsg(json.msg);
                    }
                }
            }
        };
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(toQueryString(param));
    }


    function toQueryString(obj) {
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


    function setPayCode(config) {
        viewPage.find('img').attr('src', 'img/kdpx.gif');
        var url = OptUtils.getImgQrcodeUrl({
            url: config.url
        });
        viewPage.find('img').attr('src', url);
    }




    //设置微信代付链接
    function setWxShare(pay) {
        /*billmoney: 0.01
         billno: "SEORD002209"
         freight: 0
         interid: "3385"
         payType: ""
         sendType: 0*/

        var link = OrderPay.getWxPayUrl({
            billno: pay.billno,
            freight: pay.freight,
            billmoney: pay.billmoney
        });
        var sumMoney = Number(pay.billmoney) + Number(pay.freight);
        var title = '邀请好友代付';
        var desc = '您的好友 ' + kdAppSet.getUserInfo().contactName
            + ' ，邀请您代付一笔金额为' + sumMoney + '元的微商城订单';

        kdAppSet.wxShare(
            {
                title: title,
                desc: desc,
                link: link,
                imgUrl: '',
                qqlink: link,
                fnCallBack: function () {
                    kdShare.backView();
                }
            }
        );
    }

    function show() {
        kdAppSet.setAppTitle('微信代付');
        viewPage.show();
    }

    function hide() {
        viewPage.hide();
    }

    return {
        render: render,
        setWxShare: setWxShare,
        setAppid: setAppid,
        show: show,
        hide: hide
    };


})();
/* 付款单编辑与详情页面*/

var PayDetail = (function () {
    var viewPage, scroller, hasInit, sample, payOrder, payBillId,
        bankItemSample = '', accountItem = '',
        payNo = '',
        payType = '';
    var constStr = {
        'textarea': '请输入需告知供应商的信息',
        'moneyMsg': '请输入金额',
        'bankName': ['工商银行', '建设银行', '农业银行', '中国银行', '交通银行', '招商银行']
    };

    var srcList = [], isEditBill, maxImgNum,
        uploadImageNum, serverIds, banksName,
        bankList;
    var srcMeidaKey = [];
    var footer;

    // 初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('.view_payDetail');
            scroller = Lib.Scroller.create(viewPage.find('.content')[0]);
            var bankUl = viewPage.find('.pay_selectDiv .bankList')[0];
            bankItemSample = $.String.between(bankUl.innerHTML, '<!--', '-->');
            var accountList = viewPage.find('.pay_selectDiv .accountList')[0];
            accountItem = $.String.between(accountList.innerHTML, '<!--', '-->');
            sample = $.String.between(viewPage.find('.imgListDiv').html(), '<!--', '-->');
            isEditBill = false;
            maxImgNum = 3;
            uploadImageNum = 0;
            payOrder = '';
            serverIds = [];
            bankList = [];
            bindEvents();
            footer = $('.view_payDetail .footer');
            hasInit = true;
        }
    }


    // 获取要提交的付款信息
    function getPayBillInfo() {
        var payMsg = kdShare.trimStr(viewPage.find('.pay_Msg').val());
        var srcListNew = [];
        var inum = srcList.length;
        for (var i = 0; i < inum; i++) {
            srcListNew.push({ "imgSrc": srcList[i].serverId });
        }

        var pmsg = payMsg != constStr.textarea ? payMsg : '';
        var pTargetBank = kdShare.trimStr(viewPage.find('#bankName').val());
        var pTargetBankNo = kdShare.trimStr(viewPage.find('.account').val());
        return  payinfo = {
            payWay: 0,
            payNo: payNo || '',
            paySubOffline: payType,
            payMoney: Number(viewPage.find('#pay_Money').val()),
            payDate: viewPage.find('.kdcDate').val(),
            payMsg: kdAppSet.ReplaceJsonSpecialChar(pmsg),
            payOrder: payOrder,
            payTargetBank: kdAppSet.ReplaceJsonSpecialChar(pTargetBank),
            payTargetBankNo: kdAppSet.ReplaceJsonSpecialChar(pTargetBankNo),
            payImgList: srcListNew
        };
    }

    //提交付款单据信息
    function submitPaybill() {
        var para = getPayBillInfo();
        if (!para.payMoney) {
            OptMsg.ShowMsg('请输入正确的金额');
            return;
        }
        saveBankName();
        kdAppSet.setKdLoading(true, "正在提交单据...");
        Lib.API.get('setPayOrderInfo', {
                para: para
            },
            function (data) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(data.Msg);
                if (data.status == '0') {
                    //刷新待付款列表
                    MiniQuery.Event.trigger(window, 'freshPaymentListInfo', []);
                    //刷新订单详情的支付按钮
                    var payno = data.payNo || '';
                    MiniQuery.Event.trigger(window, 'freshOrderPayNo', [
                        {payno: payno, billid: payBillId}
                    ]);
                    //通知支付页面回退
                    MiniQuery.Event.trigger(window, 'PayListBackView', [
                        {billid: payBillId}
                    ]);
                    OptMsg.PayBillMsg({
                        money: para.payMoney,
                        orderno: payOrder,
                        billno: payno
                    });
                    setTimeout(function () {
                        kdShare.backView();
                    }, 500);
                }
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('提交单据出错!');
            });
    }

    // 保存银行信息到手机
    function saveBankName() {
        var bankName = viewPage.find('.pay_selectDiv input').val();
        var bankAccount = viewPage.find('.pay_selectDiv .account').val();
        bankName = kdShare.trimStr(bankName);
        bankAccount = kdShare.trimStr(bankAccount);
        if (!bankName || !bankAccount) {
            return;
        }
        var accountsTmp = [];
        var bexist = false;
        var inum = bankList.length;
        for (var i = 0; i < inum; i++) {
            if (bankList[i].name == bankName) {
                var accounts = bankList[i].accounts;
                for (var j = 0; j < accounts.length; j++) {
                    if (accounts[j] == bankAccount) {
                        bexist = true;
                        break;
                    }
                }
                accountsTmp = bankList[i].accounts;
                break;
            }
        }
        if (!bexist) {
            if (accountsTmp.length > 0) {
                accountsTmp.push(bankAccount);
            } else {
                accountsTmp.push(bankAccount);
                bankList.push({
                    name: bankName,
                    accounts: accountsTmp
                });
            }
        }
        kdShare.cache.setCacheData(JSON.stringify(bankList), kdAppSet.getGoodslistFlag() + 'paybanks');
        initBankList();
    }


    // 获取手机上保留的银行帐号信息
    function initBankList() {
        var bankListStr = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag() + 'paybanks');
        if (bankListStr != "") {
            bankList = JSON.parse(bankListStr);
        }
        banksName = [];
        var inum = bankList.length;
        for (var i = 0; i < inum; i++) {
            var name = bankList[i].name;
            if (banksName.indexOf(name) < 0) {
                banksName.push(name);
            }
        }
        if (banksName.length == 0) {
            banksName = constStr.bankName;
        } else {
            var inum = banksName.length;
            var bankNames = constStr.bankName;
            for (var j = 0; j < bankNames.length; j++) {
                var bexist = false;
                for (var k = 0; k < inum; k++) {
                    if (bankNames[j] == banksName[k]) {
                        bexist = true;
                    }
                }
                if (!bexist) {
                    banksName.push(bankNames[j]);
                }
            }
        }
        var bankUl = viewPage.find('.pay_selectDiv .bankList');
        var listStr = $.Array.keep(banksName,
            function (item, index) {
                return $.String.format(bankItemSample, {
                    item: item,
                    index: index
                });
            }
        ).join(' ');
        bankUl.html(listStr);
    }


    function bindEvents() {

        //提交付款单据
        viewPage.delegate('.submit', {
            'click': function () {
                if (uploadImageNum > 0) {
                    OptMsg.ShowMsg("正在上传图片,请稍后...", '', 1500);
                    return;
                }
                var payMoney = kdShare.trimStr(viewPage.find('#pay_Money').val());
                if (payMoney == '' || payMoney == constStr.moneyMsg) {
                    OptMsg.ShowMsg(constStr.moneyMsg);
                    return;
                }
                jConfirm("您确定要提交付款信息?", null, function (flag) {
                    if (flag) {
                        submitPaybill();
                    }
                }, {ok: "确定", no: "取消"});
            },
            'touchstart': function () {
                $(this).css({background: '#ef5215'});
            },
            'touchend': function () {
                $(this).css({background: '#FF6427'});
            }
        });


        //关联订单
        viewPage.delegate('.pay_Order', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['Orderlist',
                    {
                        tabindex: 0,
                        KeyWord: this.innerText,
                        afterRefresh: true
                    }
                ]);
            },
            'touchstart': function () {
                $(this).addClass('order_Touching');
            },
            'touchend': function () {
                $(this).removeClass('order_Touching');
            }
        });


        //更多录入
        viewPage.delegate('.moreBtn span', {
            'click': function () {
                showMoreInfo(true);
            }
        });

        //关闭更多
        viewPage.delegate('.moreDiv .closeBtn', {
            'click': function () {
                viewPage.find('.moreDiv').addClass('hideModule');
                viewPage.find('.moreBtn').removeClass('hideModule');
                scroller.refresh();
            }
        });

        viewPage.find('.moreDiv .closeBtn').on(kdShare.clickfnIcon(viewPage.find('.moreDiv .closeBtn'), 'closeMore', 'closeMore_s'));

        viewPage.delegate('.pay_selectDiv .showUl', {
            'click': function () {
                if (!isEditBill) {
                    return;
                }
                $(this).parent().find('ul').toggleClass('hideModule');
                if (this == viewPage.find('.bank .pay_selectDiv .showUl')[0]) {
                    viewPage.find('.bank_Account .accountList').addClass('hideModule');
                }
                viewPage.find('.moreDiv .closeBtn').addClass('hideModule');
                return false;
            },
            'touchstart': function () {
                $(this).addClass('order_Touching');
            },
            'touchend': function () {
                $(this).removeClass('order_Touching');
            }
        });

        viewPage.delegate('.pay_selectDiv li', {
            'click': function (event) {
                $(this).parents('.pay_selectDiv').find('input').val($(this).html());
                $(this).parent().addClass('hideModule');
                if ($(this).attr('class') == 'bankItem') {
                    viewPage.find('.pay_selectDiv #bankName').change();
                }
                event.stopPropagation();
                return false;
            },
            'touchstart': function () {
                $(this).addClass('order_Touching');
            },
            'touchend': function () {
                $(this).removeClass('order_Touching');
            }
        });

        viewPage.find('.pay_selectDiv option').bind('click', function () {
            viewPage.find('.pay_selectDiv input').val($(this).html());
            return false;
        });

        viewPage.delegate('.pay_selectDiv input', {
            'click': function () {
                $(this).parent().find('ul').addClass('hideModule');
                viewPage.find('.moreDiv .closeBtn').addClass('hideModule');
                return false;
            },
            'focus': function () {
                $(this).parent().addClass('touched_border');
            },
            'blur': function () {
                $(this).parent().removeClass('touched_border');
            }
        });

        viewPage.delegate('.pay_selectDiv #bankName', {
            'change': function () {
                if (bankList.length == 0) {
                    return;
                }
                var bankName = $(this).val();
                var accounts = [];
                var inum = bankList.length;
                for (var i = 0; i < inum; i++) {
                    if (bankList[i].name == bankName) {
                        accounts = bankList[i].accounts;
                        break;
                    }
                }
                if (accounts.length == 0) {
                    viewPage.find('.bank_Account .accountList').addClass('hideModule');
                } else {
                    viewPage.find('.bank_Account .accountList').removeClass('hideModule');
                }
                var listStr = $.Array.keep(accounts,
                    function (item, index) {
                        return $.String.format(accountItem, {
                            item: item
                        });
                    }
                ).join(' ');
                viewPage.find('.pay_selectDiv .accountList').html(listStr);
                scroller.refresh();
            }
        });

        viewPage.delegate('textarea', {
            'click': function () {
                if ($(this).val() == constStr.textarea) {
                    $(this).val('');
                }
                $(this).addClass('textFocus');
                $(this).parent().addClass('touched_border');
            },
            'blur': function () {
                if (kdShare.trimStr($(this).val()) == '' || $(this).val() == constStr.textarea) {
                    $(this).val(constStr.textarea);
                    $(this).removeClass('textFocus');
                }
                $(this).parent().removeClass('touched_border');
            }
        });

        //付款金额录入
        viewPage.delegate('.money', {
            'click': function () {
                if (!isEditBill) {
                    return;
                }

                var target = $(this).children('input');
                var value = kdShare.trimStr(target.val());
                if (value == '' || value == constStr.moneyMsg) {
                    target.val('');
                }
                var config = {
                    name: '付款金额',
                    input: target.val(),
                    hint: "无效数据!",
                    allowZero: true,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            target.val(constStr.moneyMsg);
                        }
                        else {
                            target.val(kvalue);
                        }
                    },
                    hidefn: function () {
                        var value = kdShare.trimStr(target.val());
                        if (value == '') {
                            target.val(constStr.moneyMsg);
                        }
                    }
                };
                kdShare.keyBoard.autoshow(config);
            },
            'focus': function () {
                $(this).addClass('moneyFocus');
                $(this).parent().addClass('touched_border');
            },
            'blur': function () {
                if (kdShare.trimStr($(this).val()) == '' || $(this).val() == constStr.moneyMsg) {
                    $(this).val(constStr.moneyMsg);
                }
                $(this).parent().removeClass('touched_border');
                $(this).removeClass('moneyFocus');
                $(this).onkeyup = null;
                $(this).onkeydown = null;
            }
        });

        // 添加图片事件
        viewPage.delegate('.addImgBtn', {
            'click': function () {
                if (isEditBill) {
                    getPhotoFromWX();
                }
            },
            'touchstart': function () {
                if (isEditBill) {
                    $(this).removeClass('sprite-addImg');
                    $(this).addClass('sprite-addImg_s');
                }
            },
            'touchend': function () {
                if (isEditBill) {
                    $(this).removeClass('sprite-addImg_s');
                    $(this).addClass('sprite-addImg');
                }
            }
        });

        //图片删除
        viewPage.delegate('.deleteImg', {
            'click': function () {
                if (isEditBill) {
                    var parent = $(this).parents('.imgBox');
                    var imgList = viewPage.find('.imgListDiv');
                    var src = parent.find('img').attr('src');
                    imgList[0].removeChild(parent[0]);
                    refreshSrcList(src);
                }
            }
        });
    }

    //录入更多信息
    function showMoreInfo(bshow) {
        if (bshow) {
            viewPage.find('.moreDiv').removeClass('hideModule');
            viewPage.find('.moreBtn').addClass('hideModule');
            viewPage.find('.moreDiv .closeBtn').removeClass('hideModule');
            $('.view_payDetail .closeBtn').show();
        } else {
            viewPage.find('.moreDiv').addClass('hideModule');
            viewPage.find('.moreBtn').removeClass('hideModule');
            viewPage.find('.moreDiv .closeBtn').addClass('hideModule');
            $('.view_payDetail .closeBtn').hide();
        }
        scroller.refresh();
    }

    //调用微信接口获取图片
    function getPhotoFromWX() {
        wx.chooseImage({
            success: function (res) {
                //待上传的img列表
                serverIds = [];
                srcMeidaKey = [];
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
                viewPage.find('.submit').addClass('invalid_Btn');

                for (var i = 0; i < uploadImageNum; i++) {
                    var imgSrc = localIds[i];
                    // 创建图片
                    createImgElement(viewPage.find('.imgListDiv'), imgSrc);
                    uploadWXImg(imgSrc);
                }
            },
            fail: function () {
                uploadImageNum = 0;
            }
        });
    }


    function getImgWx(meida_id) {
        var inum = srcMeidaKey.length;
        for (var i = 0; i < inum; i++) {
            if (srcMeidaKey[i].serverId == meida_id) {
                return srcMeidaKey[i].localId;
            }
        }
        return '';
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
                srcMeidaKey.push({
                    localId: imgSrc,
                    serverId: serverId
                });
                // 显示上传图片到服务器
                if (uploadImageNum <= 0) {
                    //图片上传完毕
                    kdAppSet.setKdLoading(true, '上传中...');
                    try {
                        var eid = kdAppSet.getAppParam().eid;
                        OptImage.upLoadWxImageMultiple(eid, serverIds,
                            function (json) {
                                var imglist = json.data || [];
                                for (var i = 0; i < imglist.length; i++) {
                                    var imgwx = getImgWx(imglist[i].meida_id);
                                    if (imglist[i].suc == 1) {
                                        srcList.push({ 'imgSrc': imgwx, 'serverId': imglist[i].url});
                                    } else {
                                        deleteImgElement(viewPage.find('.imgListDiv'), imgwx);
                                    }
                                }
                                kdAppSet.setKdLoading(false);
                                viewPage.find('.submit').removeClass('invalid_Btn');
                            }, function () {
                                kdAppSet.setKdLoading(false);
                                viewPage.find('.submit').removeClass('invalid_Btn');
                            });
                    }
                    catch (ex) {
                        jAlert('调用接口出错' + ex)
                    }
                }

            },
            fail: function () {
                uploadImageNum = uploadImageNum - 1;
                if (uploadImageNum <= 0) {
                    kdAppSet.setKdLoading(false);
                    viewPage.find('.submit').removeClass('invalid_Btn');
                }
                OptMsg.ShowMsg('上传失败', '', 1500);
                deleteImgElement(viewPage.find('.imgListDiv'), imgSrc);
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
            viewPage.find('.addImgBtn').show();
        }
    }

    // 根据src创建一个img元素插入显示列表
    function createImgElement(jqObj, src) {
        var imgBox = $.String.format(sample, {
            src: src
        });
        jqObj.append(imgBox);
        if (jqObj.find('.imgBox').length >= maxImgNum) {
            viewPage.find('.addImgBtn').hide();
        } else {
            viewPage.find('.addImgBtn').show();
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
        viewPage.find('.addImgBtn').show();
    }


    //显示上传的图片
    function freshImgInfo(list) {
        viewPage.find('.imgListDiv').html('');
        var imgList = list.payImgList || [];
        var inum = imgList.length;
        srcList = [];
        for (var i = 0; i < inum; i++) {
            createImgElement(viewPage.find('.imgListDiv'), imgList[i]);
            srcList.push({ "imgSrc": imgList[i], "serverId": imgList[i] });
        }
        if (isEditBill) {
            viewPage.find(".imgDiv .deleteImg").show();
        } else {
            viewPage.find(".imgDiv .deleteImg").hide();
        }
        if (viewPage.find('.imgListDiv').innerText == '' && (!isEditBill)) {
            viewPage.find('.imgDiv').hide();
        } else {
            viewPage.find('.imgDiv').show();
        }
    }


    // 页面渲染
    function render(config) {
        initView();
        payNo = config.payNo || '';
        payType = config.payType || '';
        payOrder = config.payOrder || '';
        payBillId = config.payBillId || '';
        if (payOrder) {
            viewPage.find('.order').show();
            viewPage.find('.pay_Order').html(payOrder);
        } else {
            viewPage.find('.order').hide();
            viewPage.find('.pay_Order').html('');
        }
        var newbill = config.newbill || false;
        initBankList();
        isEditBill = false;
        initBillInfo();
        if (newbill) {
            isEditBill = true;
            var paymoney = config.paymoney || '';
            if (paymoney != '') {
                viewPage.find('#pay_Money').val(paymoney);
            }
            viewPage.find('.payNoDiv').hide();
            showMoreInfo(false);
            freshBillStatus();
        } else {
            viewPage.find('.payNoDiv').show();
            viewPage.find('.payNoDiv .payno').html(payNo);
            showPayDetail();
        }
        show();
        var minHeight = $('.view_payDetail .content').height();  // 设置最小高度，确保底部不被顶起
        $('.view_payDetail .content').css('min-height', minHeight);
        scroller.refresh();
    }


    //初始化单据信息
    function initBillInfo() {
        viewPage.find('#pay_Money').val(constStr.moneyMsg);
        viewPage.find('.pay_DateDiv input').val($.Date.format($.Date.now(), "yyyy-MM-dd"));
        viewPage.find('.pay_Msg').val(constStr.textarea);
        viewPage.find('#bankName').val('');
        viewPage.find('.account').val('');
        viewPage.find('.bankMsg').val('');
        viewPage.find('.check_logo').addClass('hideModule');
        viewPage.find('.imgListDiv').html('');
        uploadImageNum = 0;
        serverIds = [];
        srcList.length = 0;
        freshBillStatus();
    }

    function freshBillStatus() {
        var readonly = true;
        $('.view_payDetail .closeBtn').hide();
        var content = $('.view_payDetail .content');
        if (isEditBill) {
            readonly = false;
            viewPage.find('.addImgBtn').show();
            viewPage.find(".imgDiv .deleteImg").show();
            content.css('bottom', '45px');
            footer.show();
            if ($('.pay_Msg').val() == constStr.textarea) {
                $('.pay_Msg').removeClass('textFocus');
            }
            else {
                $('.pay_Msg').addClass('textFocus');
            }
        } else {
            viewPage.find('.addImgBtn').hide();
            viewPage.find(".imgDiv .deleteImg").hide();
            content.css('bottom', '0');
            footer.hide();
            $('.pay_Msg').removeClass('textFocus');
        }
        viewPage.find('#pay_Money').attr("readonly", "true");
        viewPage.find('.pay_DateDiv input').attr("disabled", readonly);
        viewPage.find('.pay_Msg').attr("disabled", readonly);
        viewPage.find('#bankName').attr("disabled", readonly);
        viewPage.find('.account').attr("disabled", readonly);
        viewPage.find('.bankMsg').attr("disabled", readonly);
    }

    // 详情页信息
    function showPayDetail() {
        kdAppSet.setKdLoading(true, "正在加载数据...");
        Lib.API.get('GetPayDetailInfo', {
                para: {  'payNo': payNo }
            },
            function (data, json, root) {
                kdAppSet.setKdLoading(false);
                var payWay = data.payWay || 0;
                isEditBill = false;
                if (payWay == 0 && data.payStatus == 0) {
                    //线下支付 并且未确认
                    isEditBill = true;
                }
                viewPage.find('.pay_DateDiv input').val(data.payDate);
                viewPage.find('#pay_Money').val(data.payMoney);
                viewPage.find('.check_logo').removeClass('hideModule');
                viewPage.find('.check_logo').attr('class', 'check_logo sprite-' + getStatus(data.payStatus));
                viewPage.find('#bankName').val(data.payTargetBank);
                viewPage.find('.account').val(data.payTargetBankNo);
                var payMsg = data.payMsg.replace('捎句话：', '');
                viewPage.find('.pay_Msg').val(payMsg || '');
                payOrder = data.payOrder || '';
                if (payOrder) {
                    viewPage.find('.order').show();
                    viewPage.find('.pay_Order').html(payOrder);
                }
                showMoreInfo(true);
                freshBillStatus();
                freshImgInfo(data);
                scroller.refresh();
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                msg = msg || '无法加载';
                OptMsg.ShowMsg(msg);
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                msg = msg || '无法加载';
                OptMsg.ShowMsg(msg);
            });
    }

    // 付款通知状态检查
    function getStatus(status) {
        if (status == '-1') {
            return 'failure'
        }
        if (status == '1') {
            return 'checked'
        }
        return 'checking';
    }

    function show() {
        viewPage.show();
    }

    function hide() {
        viewPage.hide();
        $('.view_payDetail .pay_selectDiv ul').addClass('hideModule');
    }

    return {
        render: render,
        show: show,
        hide: hide
    };
})();
var PayList = (function () {
    var payKey = 'MicroSalePayType';
    var scroller, ullist, viewpage, payInfo, payType, offlinePay, vipMoney, vipcardMoney, autoBack, hasInit;

    //payWay  0 线下支付  1 微信支付  2 储值卡  4--支付宝  5--资金通 6-实体卡

    //支付完成后回退到上一个界面
    MiniQuery.Event.bind(window, {
        'PayListBackView': function (pay) {
            if (payInfo && pay.billid == payInfo.interid) {
                kdShare.backView();
            }
        }
    });

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('viewid-pay-list');
            viewpage = $(div);
            var divlist = document.getElementById('div-view-pay-list');
            var ul = divlist.firstElementChild;
            ullist = $(ul);
            bindEvents();
            offlinePay = kdAppSet.getUserInfo().allowpayway || [];
            addOffLinePay(offlinePay);
            initScroll(divlist);
            hasInit = true;
        }
    }

    function addOffLinePay(ls) {
        //判断是否开启线下支付
        //sprite-list_union-pay线下支付原样式
        if (ls.indexOf('offline') >= 0) {
            var liTemplate = '<li data-pay="{key}"  data-cmd="offline" class="union-pay  sprite-own-way">' +
                ' <div class="pay-style">{name}</div></li>';
            var payTypeList = kdAppSet.getUserInfo().offlinesubpay;
            var payHtml = '';
            for (var i in payTypeList) {
                var item = payTypeList[i];
                payHtml += $.String.format(liTemplate, {
                    key: item.key,
                    name: item.name
                });
            }
            ullist.append(payHtml);
        }
        //判断是否开启微信支付，若开启则添加代付选项
        if (ls.indexOf('wx') >= 0) {
            ls.push('wx_other');
        }

    }

    function initScroll(scrolldiv) {
        scroller = Lib.Scroller.create(scrolldiv);
        kdctrl.initkdScroll(scroller, {});
    }

    function setListView(payinfo) {
        var payTypeList = kdAppSet.getUserInfo().allowpayway;
        var payls = MiniQuery.Object.clone(payTypeList);

        payType = '';
        //隐藏所有支付类型
        viewpage.find('[data-pay]').hide();

        if (payinfo.sendType == 1) {
            //门店自提 不能使用线下支付
            var posi = payls.indexOf('offline');
            if (posi >= 0) {
                payls.splice(posi, 1);
            }
        } else {
            //显示线下支付类型
            var offPay = viewpage.find('[data-cmd="offline"]');
            offPay.removeClass('on');
            offPay.show();
        }

        //显示线上支付类型
        for (var i = 0, len = payls.length; i < len; i++) {
            var viewli = viewpage.find('[data-pay="' + payls[i] + '"]');
            viewli.removeClass('on');
            viewli.show();
        }
        setDefaultSelect(payls);
        scroller && scroller.refresh();
    }


    //设置为上次选择的支付方式
    function setDefaultSelect(payList) {
        //获取上次的支付类型
        var lastPay = kdShare.cache.getCacheDataObj(payKey);
        if (payList.indexOf(lastPay) >= 0 || (payList.indexOf('offline') >= 0 && checkOfflinePay(lastPay))) {
            var payli = viewpage.find('[data-pay="' + lastPay + '"]');
            if (payli != null) {
                payType = lastPay;
                payli.addClass('on');
            }
        } else {
            //设置第一个支付方式 为默认
            //todo
        }
    }

    //检测某个类型的线下支付
    function checkOfflinePay(pay) {
        var payTypeList = kdAppSet.getUserInfo().offlinesubpay;
        for (var i in payTypeList) {
            if (payTypeList[i].key == pay) {
                return true;
            }
        }
        return false;
    }

    // 绑定事件
    function bindEvents() {

        viewpage.delegate('[data-cmd="cancel"]', {
            'click': function () {
                kdShare.backView();
            },
            'touchstart': function () {
                $(this).addClass('press1');
            },
            'touchend': function () {
                $(this).removeClass('press1');
            }
        }).delegate('[data-cmd="pay"]', {
            'click': function () {
                pay();
            },
            'touchstart': function () {
                $(this).addClass('press2');
            },
            'touchend': function () {
                $(this).removeClass('press2');
            }
        }).delegate('[data-pay]', {
            'click': function () {
                var $this = $(this);
                $this.siblings().removeClass('on');
                $this.addClass('on');
                payType = $this.attr('data-pay');

                if ($this.attr('data-pay') == 'wx_other') {
                    OrderPay.wxPayOther(payInfo);
                }
            }
        });

    }

    function pay() {
        if (payType == '') {
            OptMsg.ShowMsg('请选择支付方式!', '', 2000);
            return;
        }
        //记住支付类型
        if (payType != 'wx_other') {
            kdShare.cache.setCacheData(payType, payKey);
        }
        switch (payType) {
            case 'offline':
                break;
            case 'prepay':
                //储值卡wx
                var money = payInfo.billmoney + payInfo.freight;
                if (vipMoney >= money) {
                    kdAppSet.setKdLoading(true, "提交支付信息..");
                    setBillPayType(false, function () {
                        OrderPay.cardPay(payInfo, vipMoney, 'prepay');
                    });
                } else {
                    OptMsg.ShowMsg('储值卡余额不足!', '', 1500);
                }
                break;
            case 'vipcard':
                //实体卡
                var money2 = payInfo.billmoney + payInfo.freight;
                if (vipcardMoney >= money2 || true) {
                    kdAppSet.setKdLoading(true, "提交支付信息..");
                    setBillPayType(false, function () {
                        OrderPay.cardPay(payInfo, vipcardMoney, 'vipcard');
                    });
                } else {
                    OptMsg.ShowMsg('实体卡余额不足!', '', 1500);
                }
                break;
            case 'wx':
                //微信支付
                setBillPayType(false);
                OrderPay.wxPay(payInfo);
                break;
            case 'wx_other':
                //微信代付
                setBillPayType(true);
                break;
            case 'alipay':
                //支付宝
                setBillPayType(false);
                OrderPay.aliPay(payInfo);
                break;
            case 'zjt':
                //资金通
                setBillPayType(false);
                OrderPay.zjtPay(payInfo);
                break;
            default :
                //其它的都当做线下支付来处理
                if (kdAppSet.getUserInfo().identity == 'retail') {
                    setBillPayType(true);
                } else {
                    setBillPayType(false);
                    MiniQuery.Event.trigger(window, 'toview', ['PayDetail',
                        {
                            newbill: true,
                            payType: payType,
                            payNo: '',
                            payOrder: payInfo.billno,
                            paymoney: kdAppSet.getIsShowPrice() ? payInfo.billmoney : null,
                            payBillId: payInfo.interid
                        }
                    ]);
                }
                break;
        }
    }

    //设置订单支付类型
    function setBillPayType(backview, fn) {
        if (backview) {
            kdAppSet.setKdLoading(true, "提交支付信息..");
        }

        Lib.API.get('SetOrderPayType', {
                para: {
                    PayType: payType,
                    InterID: payInfo.interid
                }
            },
            function (data) {
                kdAppSet.setKdLoading(false);
                if (data.status == 1) {
                    OptMsg.ShowMsg('提交订单支付方式失败!');
                } else {
                    //设置支付方式后 如果是零售用户，并且是线下支付，要隐藏付款按钮
                    var bOffLine = ['prepay', 'wx', 'alipay', 'zjt'].indexOf(payType) >= 0;
                    if (!bOffLine && kdAppSet.getUserInfo().identity == 'retail') {
                        MiniQuery.Event.trigger(window, 'OrderDetailSetPayBtn', [
                            {billid: payInfo.interid }
                        ]);
                    }
                    fn && fn();
                    if (backview) {
                        OptMsg.ShowMsg('已提交', function () {
                            kdShare.backView();
                        }, 1500);
                    }
                }
            }, function (code, msg, json) {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                OptMsg.ShowMsg('提交订单支付方式出错!');
            });

    }


    function fill(pay) {
        var billno = viewpage.find('[data-type="billno"]');
        billno[0].innerText = pay.billno;
        var money = pay.billmoney + pay.freight;
        var billMoney = viewpage.find('[data-type="money"]');
        billMoney[0].innerText = '￥' + kdAppSet.formatMoneyStr(money);

        vipMoney = kdAppSet.getUserInfo().vipAmount;
        var cardMoney = viewpage.find('[data-type="card-money"]');
        cardMoney[0].innerText = '￥' + kdAppSet.formatMoneyStr(vipMoney.toFixed(2));

        vipcardMoney = kdAppSet.getUserInfo().vipcardAmount;
        var vipcard = viewpage.find('[data-type="vipcard-money"]');
        vipcard[0].innerText = '￥' + kdAppSet.formatMoneyStr(vipcardMoney.toFixed(2));
    }

    function render(config) {
        payInfo = config;
        autoBack = false;
        initView();
        show();
        setListView(payInfo);
        fill(payInfo);
        PayCode.setWxShare(payInfo);
    }


    function show() {
        kdAppSet.setAppTitle('支付方式');
        if (autoBack) {
            setTimeout(function () {
                kdShare.backView();
            }, 50);
        }
        viewpage.show();
    }

    function hide() {
        viewpage.hide();
        kdAppSet.wxShareInfo({});
    }

    return {
        render: render,
        show: show,
        hide: hide
    };


})();
var InvitePop = (function () {
    var viewpage, hasInit, sample, scroller,
       config;

    //初始化视图
    function initView() {
        if (!hasInit) {
            var div = document.getElementById('div-view-invitepop');
            viewpage = $(div);
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        //取消
        viewpage.delegate('[data-cmd="close"]', {
            'click': function () {
                hide();
                config.invite();
            }
        });


        //确定
        viewpage.delegate('[data-cmd="btn"]', {
            'click': function () {
                bindCode();
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
                    hide();
                    config.invite();
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

    function showInvite(configs) {
        config = configs;
        initView();
        show();
    }


    function render(config) {
        debugger;
        initView();
        show();
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
        hide: hide,
        showInvite: showInvite
    };
})();
var Register = (function () {
    var div, hasInit, htmlStr, viewPage, bcodeSendind, timeEvent, itimeCount, shopurl, config;

    //初始化视图
    function initView() {
        OptMsg.ShowMsg('先登录才能继续操作哦!', "", 3000);
        if (!hasInit) {
            htmlStr = '';
            div = document.getElementById('viewid_registerPage');
            viewPage = $("#viewid_registerPage");
            var cmpInfo = kdAppSet.getUserInfo().cmpInfo;
            viewPage.find('.logo').attr('src', cmpInfo.img);
            viewPage.find('.helpBtn').attr('src', 'img/kingdee.png');
            viewPage.find('.companyName').text(cmpInfo.name);
            shopurl = kdAppSet.getUserInfo().shopurl;
            if (shopurl == '') {
                viewPage.find('.retailCust').hide();
            }
            bcodeSendind = false;
            bindEvents();
            hasInit = true;
        }
    }

    //获取验证码
    function sendRegisterCode() {
        if (bcodeSendind) {
            return;
        }
        var mobile = viewPage.find("#phoneNumber")[0].value;
        mobile = kdShare.getPureNumber(mobile);
        if (!isMobileNumber(mobile)) {
            return;
        } else {
            viewPage.find("#phoneNumber").val(mobile);
        }

        kdAppSet.setKdLoading(true, "正在获取验证码..");
        Lib.API.get('GetVerifyCode', { para: { mobile: mobile } },
            function (data, json) {
                kdAppSet.setKdLoading(false);
                var status = +data.status;
                switch (status) {
                    case 0:
                        bcodeSendind = true;
                        itimeCount = 0;
                        timeEvent = setInterval(function () {
                            freshSendCodeBtn();
                        }, 1000);
                        jAlert(data.verifyMsg);
                        break;
                    case 1:
                        MiniQuery.Event.trigger(window, 'toview', ['failureLogin', { 'mobile': mobile }]);
                        break;
                    case 4: //已提交意向，但还在审核中
                        jConfirm(data.verifyMsg, null, function (flag) {
                            if (!flag) {
                                /*                 var user = kdAppSet.getUserInfo();
                                 var phone = user.receiverPhone || user.servicePhone || "";*/
                                var phone = '';
                                var user = kdAppSet.getUserInfo();
                                if (user.serviceOption == 0) {
                                    phone = user.receiverPhone;
                                } else if (user.serviceOption == 1) {
                                    var service = OptMsg.getMsgServiceList();
                                    if (service.length > 0) {
                                        phone = service[0].servicePhone;
                                    }
                                }
                                if (!phone) {
                                    jAlert("很抱歉,客服的电话号码为空!");
                                    return;
                                }
                                window.location.href = 'tel://' + phone;
                            }
                        }, { ok: '确定', no: '联系客服' });
                        break;
                    default: {
                        var errMsg = data.verifyMsg;
                        errMsg = errMsg.replace('Invalid phone', '无效的手机号码');
                        jAlert(errMsg);
                    }

                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(kdAppSet.getAppMsg.workError);
            });
    }


    function freshSendCodeBtn() {
        var itotalCount = 90;
        itimeCount = itimeCount + 1;
        if (itimeCount >= itotalCount) {
            bcodeSendind = false;
            clearInterval(timeEvent);
            viewPage.find(".sendCode")[0].innerHTML = '获取验证码';
        } else {
            viewPage.find(".sendCode")[0].innerHTML = '剩余 ' + (itotalCount - itimeCount) + " 秒";
        }
    }

    //验证注册信息
    function checkRegisterInfo() {

        var mobile = viewPage.find("#phoneNumber")[0].value;
        if (!isMobileNumber(mobile)) {
            return;
        }
        var checkCode = viewPage.find("#checkNumber")[0].value;
        if (!isVerifyCode(checkCode)) {
            return;
        }
        kdAppSet.setKdLoading(true, "验证注册信息..");
        var openid = kdAppSet.getAppParam().openid;
        Lib.API.get('CheckVerifyCode', {
            para: { mobile: mobile, openid: openid, verifyCode: kdAppSet.ReplaceJsonSpecialChar(checkCode) }
        },
            function (data, json) {
                kdAppSet.setKdLoading(false);
                var status = parseInt(data.status);
                var userinfo = kdAppSet.getUserInfo();
                if (status == 0) {//验证码正确
                    var toview = config.toview;
                    if (data.caninvited == 1 && userinfo.cmpInfo.allowshareprice == 1) {//可以被邀请
                        InvitePop.showInvite({
                            invite: function () {
                                if (toview) {
                                    toViewPage(toview);
                                } else {
                                    reloadWebApp();
                                }
                            }
                        });
                    } else {
                        if (toview) {
                            toViewPage(toview);
                        } else {
                            reloadWebApp();
                        }
                    }

                } else {
                    jAlert(data.verifymsg);
                }
            }, function (code, msg) {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(msg);
            }, function () {
                kdAppSet.setKdLoading(false);
                kdAppSet.showMsg(kdAppSet.getAppMsg.workError);
            });
    }



    //如果openid为空,重新获取,这里需要用户授权
    function reloadWebApp(firstview) {
        var eid = kdAppSet.getAppParam().eid;
        var linkurl = window.location.href.split('?')[0] || "kdurl_error";
        if (!firstview) {
            firstview = config.fromView || 'home';
        }
        linkurl = linkurl + "?source=service&eid=" + eid + '&firstview=' + firstview;
        reloadApp(linkurl);
    }

    function reloadApp(linkurl) {
        var eid = kdAppSet.getAppParam().eid;
        linkurl = linkurl.replace("start.html", "index.html");
        linkurl = encodeURIComponent(linkurl);
        window.location.href = "http://mob.cmcloud.cn/ServerCloud/WeiXin/KisApp?from=" + linkurl + "&type=1&focus=0&eid=" + eid;
    }

    //登录后 跳转到指定页面
    function toViewPage(toview) {
        //view:'OrderDetail',id: guideBillId
        var view = toview.view;
        var id = toview.id;
        var eid = kdAppSet.getAppParam().eid;
        var linkurl = window.location.href.split('?')[0] || "kdurl_error";
        if (view == 'OrderDetail') {
            linkurl = linkurl + "?source=service&eid=" + eid + '&guideBillId=' + id;
            reloadApp(linkurl);
        }
    }


    function isMobileNumber(phoneNumber) {
        var check = /^(1[0-9]{10})$/;
        if (!check.test(phoneNumber)) {
            jAlert("请输入正确的手机号!");
            return false;
        }
        return true;
    }

    function isVerifyCode(verifyCode) {
        if (verifyCode == "请输入验证码") {
            jAlert("请输入验证码!");
            return false;
        }
        return true;
    }

    function bindEvents() {

        viewPage.delegate('.sendCode', {
            'click': function () {
                sendRegisterCode();
            },
            'touchstart': function () {
                $(this).addClass('code_touched');
            },
            'touchend': function () {
                $(this).removeClass('code_touched');
            }
        });

        viewPage.delegate(".check", {
            'click': function () {
                checkRegisterInfo();
            },
            'touchstart': function () {
                $(this).addClass('code_touched');
            },
            'touchend': function () {
                $(this).removeClass('code_touched');
            }
        });

        viewPage.delegate(".helpBtn", {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: 'http://club.kisdee.com/forum.php?mod=forumdisplay&fid=900' }]);
            },
            'touchstart': function () {
                $(this).attr('src', 'img/kingdee_s.png');
            },
            'touchend': function () {
                $(this).attr('src', 'img/kingdee.png');
            }
        });

        //去网上商城
        viewPage.delegate(".retailCust", {
            'click': function () {
                if (shopurl) {
                    window.location.href = shopurl;
                }
            },
            'touchstart': function () {
                $(this).addClass('retailCust_touched');
            },
            'touchend': function () {
                $(this).removeClass('retailCust_touched');
            }
        });

        viewPage.delegate('#phoneNumber', {
            'keyup': function () {
                checkInputInfo();
            },
            'focus': function () {
                $(this).addClass('textFocus');
            },
            'blur': function () {
                var val = kdShare.trimStr($(this).val());
                if (!isNumber(val)) {
                    $(this).removeClass('textFocus');
                }
            }
        });

        viewPage.delegate('#checkNumber', {
            'keyup': function () {
                checkInputInfo();
            },
            'focus': function () {
                $(this).addClass('textFocus');
            },
            'blur': function () {
                var val = kdShare.trimStr($(this).val());
                if (!isNumber(val)) {
                    $(this).removeClass('textFocus');
                }
            }
        });
    }

    function isNumber(value) {
        var check = /^[0-9]{1,11}$/;
        if (check.test(value)) {
            return true;
        } else {
            return false;
        }
    }

    function checkInputInfo() {
        var mobile = viewPage.find("#phoneNumber")[0].value;
        mobile = kdShare.getPureNumber(mobile);
        var check = /^(1[0-9]{10})$/;
        if (!check.test(mobile)) {
            viewPage.find(".sendCode").css("background-color", "#CCCCCC");
            return false;
        } else {
            viewPage.find(".sendCode").css("background-color", "#F57325");
            return true;
        }
    }

    function render(configp) {
        bcodeSendind = false;
        initView();
        config = configp || {};
        var sharePhoneNum = config.sharePhoneNum || 0;
        var inviteSpan = viewPage.find(".inviteDiv span");
        if (sharePhoneNum > 0) {
            viewPage.find("#phoneNumber").val(sharePhoneNum);
            viewPage.find(".sendCode").css("background-color", "#F57325");
            var msg = kdAppSet.getAppParam().sharePhoneMsg + "加入微商城平台";
            inviteSpan.text(msg);
            inviteSpan.parent().show();
        } else {
            inviteSpan.parent().hide();
        }
        show();
        var openid = kdAppSet.getAppParam().openid;
        if (!openid) {
            //判断openid是否为空
            reloadWebApp('Register');
            return;
        }
    }

    function show() {
        $(div).show();
        OptAppMenu.showKdAppMenu(false);
        kdAppSet.setAppTitle('登录');
    }

    return {
        render: render,
        show: show,
        hide: function () {
            $(div).hide();
            kdAppSet.setAppTitle('');
        }
    };


})();
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
/*数字动画*/
var OptAnimation = (function () {
    //加入购物车动画
    function addToCartFlyShow(targetObj, targetendObj, speed, callback) {
        var funParabola = function (d, t, g) {
            var i = { speed: 166.67, curvature: 0.001, progress: function () {
            }, complete: function () {
            } };
            var p = {};
            g = g || {};
            for (var v in i) {
                p[v] = g[v] || i[v]
            }
            var u = { mark: function () {
                return this
            }, position: function () {
                return this
            }, move: function () {
                return this
            }, init: function () {
                return this
            } };
            var e = "margin", r = document.createElement("div");
            if ("oninput" in r) {
                ["", "ms", "webkit"].forEach(function (b) {
                    var a = b + (b ? "T" : "t") + "ransform";
                    if (a in r.style) {
                        e = a
                    }
                })
            }
            var s = p.curvature, q = 0, o = 0;
            var k = true;
            if (d && t && d.nodeType == 1 && t.nodeType == 1) {
                var n = {}, j = {};
                var h = {}, m = {};
                var f = {}, l = {};
                u.mark = function () {
                    if (k == false) {
                        return this
                    }
                    if (typeof f.x == "undefined") {
                        this.position()
                    }
                    d.setAttribute("data-center", [f.x, f.y].join());
                    t.setAttribute("data-center", [l.x, l.y].join());
                    return this
                };
                u.position = function () {
                    if (k == false) {
                        return this
                    }
                    var b = document.documentElement.scrollLeft || document.body.scrollLeft, a = document.documentElement.scrollTop || document.body.scrollTop;
                    if (e == "margin") {
                        d.style.marginLeft = d.style.marginTop = "0px"
                    } else {
                        d.style[e] = "translate(0, 0)"
                    }
                    n = d.getBoundingClientRect();
                    j = t.getBoundingClientRect();
                    h = { x: n.left + (n.right - n.left) / 2 + b, y: n.top + (n.bottom - n.top) / 2 + a };
                    m = { x: j.left + (j.right - j.left) / 2 + b, y: j.top + (j.bottom - j.top) / 2 + a };
                    f = { x: 0, y: 0 };
                    l = { x: -1 * (h.x - m.x), y: -1 * (h.y - m.y) };
                    q = (l.y - s * l.x * l.x) / l.x;
                    return this
                };
                u.move = function () {
                    if (k == false) {
                        return this
                    }
                    var a = 0, b = l.x > 0 ? 1 : -1;
                    var c = function () {
                        var z = 2 * s * a + q;
                        a = a + b * Math.sqrt(p.speed / (z * z + 1));
                        if ((b == 1 && a > l.x) || (b == -1 && a < l.x)) {
                            a = l.x
                        }
                        var w = a, A = s * w * w + q * w;
                        d.setAttribute("data-center", [Math.round(w), Math.round(A)].join());
                        if (e == "margin") {
                            d.style.marginLeft = w + "px";
                            d.style.marginTop = A + "px"
                        } else {
                            d.style[e] = "translate(" + [w + "px", A + "px"].join() + ")"
                        }
                        if (a !== l.x) {
                            p.progress(w, A);
                            window.requestAnimationFrame(c)
                        } else {
                            p.complete();
                            k = true
                        }
                    };
                    window.requestAnimationFrame(c);
                    k = false;
                    return this
                };
                u.init = function () {
                    this.position().mark().move()
                }
            }
            return u
        };
        (function () {
            var b = 0;
            var c = ["webkit", "moz"];
            for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
                window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
                window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"]
            }
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (h, e) {
                    var d = new Date().getTime();
                    var f = Math.max(0, 16.7 - (d - b));
                    var g = window.setTimeout(function () {
                        h(d + f)
                    }, f);
                    b = d + f;
                    return g
                }
            }
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (d) {
                    clearTimeout(d)
                }
            }
        }());
        var flyElement = document.getElementById('flyelement');
        var targetElement = document.getElementById(targetendObj);
        var CartParabola = funParabola(flyElement, targetElement, {
            speed: speed,
            curvature: 0.002,
            complete: function () {
                flyElement.style.visibility = "hidden";
                callback && callback();
            }
        });

        function addToCartfly() {
            flyElement.style.left = ($(targetObj).offset().left + $(targetObj).innerWidth() / 2) + "px";
            flyElement.style.top = ($(targetObj).offset().top + $(targetObj).innerHeight() / 2) + "px";
            flyElement.style.visibility = "visible";
            CartParabola.position().move();
        }
        addToCartfly();
    }

    function show(viewPage){
        viewPage.show();
/*        viewPage.removeClass('kdpage_hide');
        viewPage.addClass('kdpage_show');*/
    }

    function hide(viewPage){
        viewPage.hide();
/*        viewPage.removeClass('kdpage_show');
        viewPage.addClass('kdpage_hide');*/
    }

    return {
        addToCartFlyShow: addToCartFlyShow,
        show: show,
        hide: hide
    };
})();



/*页面主菜单*/
var OptAppMenu = (function () {

    var kdcMenuBar = $(".kdcMenuBar");
    //主菜单点击事件
    function menuClickEvent(clickId) {

        switch (clickId) {
            case "homeId":
                MiniQuery.Event.trigger(window, 'toview', ['Home', { }]);
                break;
            case "typeId":
                MiniQuery.Event.trigger(window, 'toview', ['GoodsCategory', { }]);
                break;
            case "goodsBoxId":
                MiniQuery.Event.trigger(window, 'toview', ['CacheList', {}]);//noBack:true
                break;
            case "meId":
                MiniQuery.Event.trigger(window, 'toview', ['Me', { }]);
                break;
        }
        return false;
    }

    //初始化菜单状态
    function initMenuStatus() {
        $(".kdcMenuBar span").each(function () {
            $(this).removeClass("selected");
            var menuid = this.id;
            switch (menuid) {
                case "homeId":
                    kdShare.changeClassOfTouch($(this), 'main_s', 'main', true);
                    break;
                case "typeId":
                    kdShare.changeClassOfTouch($(this), 'order_s', 'order', true);
                    break;
                case "goodsBoxId":
                    kdShare.changeClassOfTouch($(this), 'hcart_s', 'hcart', true);
                    break;
                case "meId":
                    kdShare.changeClassOfTouch($(this), 'person_s', 'person', true);
                    break;
            }
        });
    }

    //选中某个菜单
    function selectMenu(menuid) {
        initMenuStatus();
        var menu = kdcMenuBar.find("#" + menuid);
        menu.addClass("selected");
        switch (menuid) {
            case "homeId":
                kdShare.changeClassOfTouch(menu, 'main', 'main_s', true);
                break;
            case "typeId":
                kdShare.changeClassOfTouch(menu, 'order', 'order_s', true);
                break;
            case "goodsBoxId":
                kdShare.changeClassOfTouch(menu, 'hcart', 'hcart_s', true);
                break;
            case "meId":
                kdShare.changeClassOfTouch(menu, 'person', 'person_s', true);
                break;
        }
    }

    //设置选中某个菜单
    function selectKdAppMenu(menuid) {
        selectMenu(menuid);
    }

    //是否显示主菜单
    function showKdAppMenu(bvisiable) {
        if (bvisiable) {
            kdcMenuBar.show();
        } else {
            kdcMenuBar.hide();
        }
    }

    //初始化app底部菜单
    function initAppMenu() {
        kdcMenuBar.find("#homeId,#typeId,#goodsBoxId,#meId").bind("click", function () {
            var clickId = this.id;
            menuClickEvent(clickId);
        });
    }

    return {
        initAppMenu: initAppMenu,
        showKdAppMenu: showKdAppMenu,
        selectKdAppMenu: selectKdAppMenu
    }

})();



//微订货打开快递信息
var OptExpress = (function () {

    function ShowExpress(num) {
        var kd100url = "http://m.kuaidi100.com/index_all.html?postid=" + num + "&callbackurl=" + "";
        kdAppSet.stopEventPropagation();
        MiniQuery.Event.trigger(window, 'toview', ['Mkd100', { url: kd100url }]);
    }

    return {
        ShowExpress: ShowExpress
    };
})();



/*浏览器hash事件处理*/
var OptHash = (function () {
    var viewNameList = [];
    var viewHashList = [];
    window.addEventListener("hashchange", hashDeal, false);
    function hashDeal() {
        var hash = window.location.hash;
        hash = hash.substr(1, hash.length - 1);
        var len = viewHashList.length - 1;
        if (len >= 0 && hash != viewHashList[len]) {
            MiniQuery.Event.trigger(window, 'backviewkeep');
        }
    }

    function pushHash(viewName, args) {
        var hash_para = '/' + encodeURIComponent(args ? JSON.stringify(args) : '');

        //var inum = viewHashList.length;
        //var hash = $.String.random(7) + inum;
        //viewHashList.push(hash);
        var hashView = viewName + hash_para;
        viewHashList.push(hashView);
        viewNameList.push(viewName);
        window.location.hash = hashView;
        console.log(viewNameList.join(','));
        console.log(viewHashList.join(','));
    }

    function popHash() {
        viewHashList.pop();
        viewNameList.pop();
        //隐藏键盘
        document.activeElement.blur();
        kdShare.keyBoard.hide();
        //隐藏加载中
        kdAppSet.setKdLoading(false);
        PopMenu.hideElem();
        // 隐藏快速购买
        AddGoods.hideAttr();
        JHide();
        console.log(viewNameList.join(','));
        console.log(viewHashList.join(','));
    }

    function get() {
        var hash = window.location.hash;
        var posi = hash.indexOf('/');
        return (posi >= 0) ? hash.substring(1, posi) : hash.substring(1);
    }

    return {
        pushHash: pushHash,
        popHash: popHash,
        get: get
    }

})();



/*图片上传模块*/

var OptImage = (function () {
    var optUrlHead = "http://mob.cmcloud.cn/ServerCloud/WeiXin/WeixinImageUpload";
    var optUrlHead_multiple = "http://mob.cmcloud.cn/ServerCloud/WeiXin/WeixinImageUpload_multiple";

    function upLoadWxImage(eid, media_id, fnSuccess, fnFail) {
        var param = '?'
            + 'eid=' + eid + '&'
            + 'media_id=' + media_id;
        var url = optUrlHead + param;
        getJSON(url,
            function (data) {
                fnSuccess & fnSuccess(data);
            },
            function (data) {
                fnFail & fnFail(data);
            }
        );
    }

    function getJSON(url, fnSuccess, fnFail) {
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        fnSuccess && fnSuccess(json);
                    } else {
                        fnFail && fnFail(json.msg);
                    }
                }
                else {
                    fnFail && fnFail("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }


    //批量上传图片
    function upLoadWxImageMultiple(eid, mediaids, fnSuccess, fnFail) {
        var paramDataStr = JSON.stringify(mediaids);
        var paramData = {eid: eid, data: paramDataStr};
        $.ajax({
            type: "POST",
            async: true,
            url: optUrlHead_multiple,
            data: paramData,
            dataType: 'json',
            success: function (data) {
                if (data.code == 200) {
                    fnSuccess && fnSuccess(data);
                } else {
                    fnFail && fnFail(data);
                }
            },
            error: function (data) {
                fnFail & fnFail(data);
            }
        });
    }

    return {
        upLoadWxImage: upLoadWxImage,
        upLoadWxImageMultiple: upLoadWxImageMultiple
    };

})();



/*微订货界面操作日志*/
var OptLog = (function () {
    var optUrlHead = "http://mob.cmcloud.cn/ServerCloud/DataReport/NewVisitRecode";
    /*1	首页
   */

    var optLogEnum = {
        index: 1
    };

    //允许记录验证次数
    var logList = [];


    function writeLog(eid, openid, operateid, identify) {
        var param = '?'
            + 'eid=' + eid + '&'
            + 'openid=' + openid + '&'
            + 'operateid=' + operateid + '&'
            + 'identify=0';
        getJSON(optUrlHead + param);
    }


    function getJSON(url, fnSuccess, fnFail) {
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    fnSuccess && fnSuccess();
                }
                else {
                    fnFail && fnFail("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }


    function writePageLog(optid) {
        var logkey = "" + optid;
        if (logList.indexOf(logkey) >= 0) {
            return;
        }
        logList.push(logkey);
        var eid = kdAppSet.getAppParam().eid;
        var openid = kdAppSet.getAppParam().openid;
        writeLog(eid, openid, optid);
    }

    function debug(msg){
        var logUrl='http://mob.cmcloud.cn/ServerCloud/selftest/writelog?msgid=1&msg='+msg;
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', logUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {

            }
        };
        xhr.send(null);
    }

    return {
        debug: debug,
        writePageLog: writePageLog,
        getLogType: function () {
            return optLogEnum;
        }
    };


})();



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



var OptPayOff = (function () {
    var optUrlHead = "http://mob.cmcloud.cn/ServerCloud/WeiXin/NewOrderRequest";
    // 获取prepay_id接口请求测试参数
    var prePayPara = {
        "appid": "",//wxeb3d2a1ffd94caf1
        "mch_id": null,
        "paySignkey": null,
        "item_body": "",
        "item_detail": "",
        "item_attach": "支付测试",
        "order_no": "",
        "total_fee": "",
        "spbill_create_ip": "",
        "goods_tag": "",
        "openid": ""
    };

    // 获取随机码
    function get32_RandomNumber(len) {
        len = len || 32;
        var charstr = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = charstr.length;
        var randomStr = '';
        for (var i = 0; i < len; i++) {
            randomStr += charstr.charAt(Math.floor(Math.random() * maxPos));
        }
        return randomStr;
    }


    // 调用微信支付接口函数
    function wxPayOff(para,fnSuccessPayOff) {
        if (typeof para != 'object') {
            return;
        }
        wx.chooseWXPay({
            timestamp: Number(para.timestamp),
            nonceStr: para.nonceStr,
            package: para.package,
            signType: para.signType,
            paySign: para.paySign,
            success: function (res) {
                fnSuccessPayOff & fnSuccessPayOff(res);
            }
        });
    }

    // 设置微信支付接口参数
    function setPayInfo(payInfo) {
        prePayPara.openid = kdAppSet.getAppParam().openid;
        prePayPara.order_no = get32_RandomNumber(10);
        prePayPara.item_body = payInfo.name || "";
        prePayPara.total_fee = Number(payInfo.money)*100;
    }

    // 调用后台接口 获取微信支付参数
    function wxPayment(payInfo,fnSuccessPay,fnFail) {
        kdAppSet.setKdLoading(true, '跳转到支付页面...');
        // 更新获取参数
        setPayInfo(payInfo);
        var eid=kdAppSet.getAppParam().eid;
        var currentUrl = optUrlHead + '?data=' + JSON.stringify(prePayPara)+'&eid='+eid;
        var xhr = new window.XMLHttpRequest();
        xhr.open('post', currentUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                kdAppSet.setKdLoading(false);
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    var json = (new Function('return ' + data))();
                    if (json.code == 200) {
                        wxPayOff(json.data,fnSuccessPay);
                    } else {
                        fnFail && fnFail(json.msg);
                    }
                }
                else {
                    fnFail && fnFail("调用接口出错Error");
                }
            }
        };
        xhr.send(null);
    }

    return {
        wxPayment: wxPayment
    }
}());

var OptUtils = (function () {


    function getImgQrcodeUrl(link) {
        link=link || {};
        var url = link.url;
        var logourl = link.logourl || '';
        var discribe = link.discribe || '';

        var timestamp = Math.round(new Date().getTime() / 1000);
        var token = Lib.MD5.encrypt(discribe + "kingdee_xxx" + timestamp);

        var qrImg = 'http://mob.cmcloud.cn/ServerCloud/WDH/genGoodsQRcode?';
        qrImg = qrImg + 'discribe=' + encodeURIComponent(discribe) + '&url=' + encodeURIComponent(url)
            + '&logourl=' + encodeURIComponent(logourl) + '&timestamp=' + timestamp + '&token=' + token;
        return qrImg;
    }


    return {
        getImgQrcodeUrl: getImgQrcodeUrl
    };


})();



var OptView = (function () {

    // 获取选中的某一个省/市/区信息
    // areaSel: 省/市/区内容缓存，areaObj: 地址页面对象，para：参数，fn: 回调函数
    function getAreaInfo(areaSel, areaObj, para, fn) {
        MiniQuery.Event.trigger(window, 'toview', ['SingleSelectList', {selobj: areaSel,
            api: 'GetAreaList',
            para: para,
            callBack: function (selObj) {
                if (areaSel.id == selObj.id) {
                    return;
                } else {
                    areaSel.id = selObj.id;
                    areaSel.name = selObj.name;
                    areaObj.innerText=areaSel.name;
                }
                fn && fn();
            }}]);
    }

    return {
        getAreaInfo:getAreaInfo
    };

})();



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

/**
 * 选择界面
 * Create by Mayue
 * Date 2015-11-11
 * */
var jSelect = (function () {
    var hasInit,
        div,
        $viewpage,
        scroller,
        sample;
    var config = [];
    var dataList = [];
    var selectList = [];
    //初始化视图
    function initView() {
        if (!hasInit) {
            div = document.getElementById('select-way');
            $viewpage = $(div);
            scroller = Lib.Scroller.create($viewpage.find('article')[0]);
            sample = $.String.between(document.getElementById('select-list').innerHTML, '<!--', '-->');
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        //取消事件
        $viewpage.delegate('[data-cmd="cancel"]', {
            'click': function () {
                hide();
            },
            'touchstart': function () {
                $(this).css('color', '#646464');
            },
            'touchend': function () {
                $(this).css('color', 'gray');
            }
        }
        );

        //确定事件
        $viewpage.delegate('[data-cmd="sure"]', {
            'click': function () {
                var list = $viewpage.find(".on");
                dataList = [];
                for (i = 0; i < list.length; i++) {
                    var index = $viewpage.find(".on")[i].getAttribute("data-index");
                    dataList.push(config.data[index]);
                }
                hide();
                config.fnselect(dataList);
            },
            'touchstart': function () {
                $(this).css('color', '#fc7452');
            },
            'touchend': function () {
                $(this).css('color', '#ff6427');
            }
        }
        );

        //列表选择事件
        $viewpage.delegate('[data-cmd="li"]', {
            'click': function () {
                var index = this.getAttribute("data-index");
                selectStyle(index);
            }
        }
        );
    }

    //记忆上次选择样式
    function initStyle(onSelect) {
        var li = $viewpage.find('[data-cmd="li"]');
        if (onSelect.length == 0) {
            li.eq(0).addClass("on");//没有传值，则默认勾选第一个
        } else {
            for (i = 0; i < onSelect.length; i++) {
                li.eq(onSelect[i]).addClass("on");
            }
        }
    }

    //列表选中效果 --单选/多选
    function selectStyle(index) {
        var li = $viewpage.find('[data-cmd="li"]');
        if (config.type == "checkbox") {
            li.eq(index).addClass("on");
        } else {
            li.removeClass("on");
            li.eq(index).addClass("on");
        }
    }


    function showSelect(cfg) {
        initView();
        config = MiniQuery.Object.clone(cfg);
        fillTitle();
        fillList();
        initStyle(cfg.onselect);
        show();
    }

    //选择界面标题
    function fillTitle() {
        $viewpage.find('header')[0].innerHTML = config.title;
    }

    //数据列表
    function fillList() {
        var list = document.getElementById("select-list");
        list.innerHTML = $.Array.keep(config.data, function (item, index) {
            return $.String.format(sample, {
                name: item.name,
                index: index
            });
        }).join('');
    }


    function show() {
        $(div).show();
        scroller.refresh();
    }

    function hide() {
        $(div).hide();
    }

    function render() {
        initView();
        show();
    }

    return {
        render: render,
        show: show,
        hide: hide,
        showSelect: showSelect
    };
})();
/*公用函数库*/

var kdShare = (function () {
    //click效果
    var clickfn = {
        'touchstart': touchstart,
        'touchend': touchend
    };

    function touchstart() {
        $(this).addClass('onclick');
    }

    function touchend() {
        $(this).removeClass('onclick');
    }

    var Cache = (function () {

        var setCacheDataObj = function (obj, key) {
            if (window.localStorage) {
                var storage = window.localStorage;
                var strJson = JSON.stringify(obj);
                storage.setItem(key, strJson);
            } else {
            }
        };

        var setCacheData = function (obj, key) {
            if (window.localStorage) {
                var storage = window.localStorage;
                storage.setItem(key, obj);
            } else {
            }
        };

        var getCacheDataObj = function (key) {
            if (window.localStorage) {
                var storage = window.localStorage;
                var keyv = storage.getItem(key);
                return keyv == null ? "" : keyv;
            } else {
                return "";
            }
        };

        return {
            setCacheDataObj: setCacheDataObj,
            setCacheData: setCacheData,
            getCacheDataObj: getCacheDataObj
        };

    })();

    var Image = (function () {
        function setBigImage(imgobj) {
            MiniQuery.Event.trigger(window, 'toview', ['ImageView', { imgobj: imgobj }]);
            kdAppSet.stopEventPropagation();
        }
        return {
            setBigImage: setBigImage
        }
    })();

    //替换特殊字符串
    var ReplaceSChar = function (input) {
        input = input.replace(/'/g, "");
        input = input.replace(/"/g, "");
        input = input.replace(/,/g, "");
        return input;
    };

    //去除前后空格
    function trimStr(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    //生成随机数
    function GuidLike() {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    // 提取手机号码
    function getPureNumber(mobile) {
        mobile = mobile.replace(/[^0-9]/g, '');
        return mobile;
    }

    //debug 日志
    function kdlog(str) {
        console.log(str);
    }

    //是否是微信浏览器
    function is_weixinbrower() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    //是否是谷歌浏览器
    function is_chromebrower() {
        var ua = navigator.userAgent.toLowerCase();
        var browerstr = JSON.stringify(ua);
        if (browerstr.indexOf("applewebkit") > 0) {
            return true;
        } else {
            return false;
        }
    }

    //回退到上一页面
    function backView() {
        // MiniQuery.Event.trigger(window, 'backviewkeep');
        history.back();
    }

    //回退到上一页面
    function clearBackView(step) {
        MiniQuery.Event.trigger(window, 'clearbackview', [step]);
    }


    function clickfnImg(objimg, objbg) {
        return {
            'touchstart': function () {

                if (objimg) {
                    var srcimg = objimg.attr("src");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    srcimg = srcimg.replace(orgimg, orgdst);
                    objimg.attr("src", srcimg);
                }
                else if (objbg) {
                    var bgimg = objbg.css("background");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    bgimg = bgimg.replace(orgimg, orgdst);
                    objbg.css("background", bgimg);
                }
            },
            'touchend': function () {

                if (objimg) {
                    var srcimg = objimg.attr("src");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    srcimg = srcimg.replace(orgdst, orgimg);
                    objimg.attr("src", srcimg);
                }
                else if (objbg) {
                    var bgimg = objbg.css("background");
                    var orgimg = ".png";
                    var orgdst = "_p.png";
                    bgimg = bgimg.replace(orgdst, orgimg);
                    objbg.css("background", bgimg);
                }
            }
        };
    }

    function clickfnIcon(obj, oldStr, newStr) {
        var classValue = '';
        return {
            'touchstart': function () {

                if (obj && obj.attr) {
                    classValue = obj.attr('class');
                    var reg = new RegExp(oldStr, "g");
                    var newClass = classValue.replace(reg, newStr);
                    obj.attr('class', newClass);
                }
            },
            'touchend': function () {
                if (obj && obj.attr) {
                    if (classValue != '') {
                        var reg = new RegExp(newStr, "g");
                        var newClass = classValue.replace(reg, oldStr);   // 防止长按导致的中断
                        obj.attr('class', newClass);
                    }
                }
            }
        };
    }

    function changeClassOfTouch(jqObj, oldLabel, newLabel, isSingle) {
        var oldClass = jqObj.attr('class');
        var reg = new RegExp(oldLabel, 'g');
        var newClass = oldClass.replace(reg, newLabel);
        if (!isSingle && oldClass == newClass) {
            reg = new RegExp(newLabel, 'g');
            newClass = oldClass.replace(reg, oldLabel);
        }
        jqObj.attr('class', newClass);
    }

    function clickfnCss(objcss, css_n, css_p) {
        return {
            'touchstart': function () {
                objcss = objcss || $(this);
                objcss.css(css_n);
            },
            'touchend': function () {
                objcss = objcss || $(this);
                objcss.css(css_p);
            }
        };
    }

    //js小数乘法计算
    function calcMul(arg1, arg2) {
        var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {
        }
        try {
            m += s2.split(".")[1].length
        } catch (e) {
        }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }

    //js小数加法计算
    function calcAdd(num1, num2) {
        var sq1, sq2, m;
        try {
            sq1 = num1.toString().split(".")[1].length;
        } catch (e) {
            sq1 = 0;
        }
        try {
            sq2 = num2.toString().split(".")[1].length;
        } catch (e) {
            sq2 = 0;
        }
        m = Math.pow(10, Math.max(sq1, sq2));
        return (num1 * m + num2 * m) / m;
    }

    function isMobileNumber(phoneNumber, num) {
        var digit = num || 10;
        var check = new RegExp("^(1[0-9]{" + digit + "})$");
        if (!check.test(phoneNumber)) {
            return false;
        }
        return true;
    }


    function setAppTitle(title) {
        try {
            var appTitle = title || "微订货";
            document.title = appTitle;
            if (kdAppSet.isIPhoneSeries()) {
                // hack在微信等webview中无法修改document.title的情况
                var _body = $('body');
                var _iframe = $('<iframe src="img/kdpx.gif"></iframe>').on('load', function () {
                    setTimeout(function () {
                        _iframe.off('load').remove()
                    }, 0)
                }).appendTo(_body);
            }
        } catch (ex) {
        }
    }

    function getToday() {
        var date = new Date();
        var currentdate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate();
        return currentdate;
    }

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

    //将字符串中的数字转换成可点击样式
    function StrNumToPhone(str) {
        if (str) {
            var numArry = str.match(/\d+(\-\d+)?/g);
            var telStr;
            if (numArry) {
                for (i = 0; i < numArry.length; i++) {
                    if (numArry[i].length > 6) {
                        telStr = "<a href= tel:" + numArry[i] + ">" + numArry[i] + "</a>";
                        str = str.replace(numArry[i], telStr)
                    }
                }
            }
        }
        return str;
    }

    return {
        Image: Image,
        keyBoard: kdctrl.keyBoard,
        clickfn: function () {
            return clickfn;
        },
        clickfnImg: clickfnImg,
        clickfnIcon: clickfnIcon,
        clickfnCss: clickfnCss,
        changeClassOfTouch: changeClassOfTouch,
        touchstart: touchstart,
        touchend: touchend,
        isMobileNumber: isMobileNumber,
        cache: Cache,
        backView: backView,
        clearBackView: clearBackView,
        trimStr: trimStr,
        getToday: getToday,
        getPureNumber: getPureNumber,
        calcMul: calcMul,
        calcAdd: calcAdd,
        guid: GuidLike,
        ReplaceSChar: ReplaceSChar,
        kdlog: kdlog,
        throttle: throttle,
        setAppTitle: setAppTitle,
        is_weixinbrower: is_weixinbrower,
        is_chromebrower: is_chromebrower,
        StrNumToPhone: StrNumToPhone
    };

})();


/*商品详情页面*/

var GoodsDetail = (function () {
    var viewPage,
        itemdetailarea,
        cartListData,
        cartList,
        config,
        hasInit,
    //在商品详情页中，多次跳转不同商品，并且要回退到上一个商品
        itemIdList,
        Head,
        List;

    //初始化视图
    function initView(param) {
        if (!hasInit) {
            viewPage = $('#view-itemdetail');
            cartListData = {};
            cartList = '';
            bindEvents();

            PopMenu.bindWithBtn('pop-menu-btn');
            $('#pop-menu-btn').find('img').attr('src', 'img/menubtn_normal.png');
            $('.view_itemdetail .menu_share img').attr('src', 'img/menuShare.png');
            $('.view_itemdetail .goodsinfoList .collect img').attr('src', 'img/menuCollect.png');

            itemIdList = [];

            Head = GoodsDetail_Head;
            Head.initView(viewPage, param);
            List = GoodsDetail_List;
            List.initView(viewPage, param);


            hasInit = true;
        }


    }


    function render(param) {
        config = param || {};
        initView(config);
        config.hasLoaded = false;
        Head.render(config);
        List.render(config);
        show(true);
        Head.freshImgList([]);
        var itemTop = viewPage.find('.itemdetail-top');
        var itemReturn = viewPage.find('#itemdetail_Return');
        var itemArea = viewPage.find('#itemdetailarea');

        //是否商品分享
        if (!config.shareGoodsId) {
            itemTop.hide();
            itemReturn.hide();
            itemArea.css("top", "0");
            var data = config.item;
            List.initGoodsMore([]);
            List.loadData(data);
            List.getItemAuxInfo(data.itemid, config);
        } else {
            //微信商品分享页面过来
            config.item = {};
            List.getItemAuxInfo(config.shareGoodsId, config);
            itemTop.show();
            itemReturn.show();
            itemArea.css("top", "45px");
            OptAppMenu.showKdAppMenu(false);
        }
    }

    /*
     //回退时重定向商品
     function redirectGoods(itemid) {
     Head.freshImgList([]);
     config = { item: {} };
     config.shareGoodsId = "";
     List.loadData({});
     List.getItemAuxInfo(itemid);
     }*/


    function AddGoodsToCart(buytype) {
        var goodsimg = config.item.img;
        if (goodsimg instanceof Array) {
            goodsimg = config.item.img[0];
        }
        var goodsinfo = {
            expoint: config.item.expoint,
            onlyexpoint: config.item.onlyexpoint,
            auxcount: config.item.auxcount,
            itemid: config.item.itemid,
            isoverseas: config.item.isoverseas || 0,
            model: config.item.model,
            note: config.item.note,
            price: config.item.price,
            maxprice: config.item.maxprice,
            unitid: config.item.unitid,
            unitname: config.item.unitname,
            stocknum: config.item.num,
            goodsName: config.item.name,
            goodsImg: goodsimg,
            newflag: "display:none;",
            cuxiaoflag: "display:none;"
        };

        AddGoods.showAttr({ goods: goodsinfo, buytype: buytype });

    }

    function bindEvents() {

        viewPage.delegate('.addToCart', { //加入购物车 处理
                'click': function () {
                    if (!config.hasLoaded) {
                        OptMsg.ShowMsg('数据加载中，请稍后操作...');
                        return;
                    }
                    AddGoodsToCart('add');
                    kdAppSet.h5Analysis('goodsDetail_add');
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215', color: '#fff' });
                },
                'touchend': function () {
                    $(this).css({ background: '#fff', color: '#ff6427' });
                }
            }
        )
            .delegate('#itemdetail_buy', {         //立即购买处理
                'click': function () {
                    if (!config.hasLoaded) {
                        OptMsg.ShowMsg('数据加载中，请稍后操作...');
                        return;
                    }
                    AddGoodsToCart('buy');
                    kdAppSet.h5Analysis('goodsDetail_buy');
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215' });
                },
                'touchend': function () {
                    $(this).css({ background: '#FF6427' });
                }
            }
        )
            .delegate('#itemdetail_Return', { //商品分享时  回到微订货主页显示
                'click': function () {
                    MiniQuery.Event.trigger(window, 'toview', ['Home', {}]);
                },
                'touchstart': function () {
                    $(this).find('.triangle').css('border-right-color', "#EF5215");
                },
                'touchend': function () {
                    $(this).find('.triangle').css('border-right-color', "#FF6427");
                }
            })
            .delegate('.collect', 'click', function () {
                var _this = this;
                var img = $(_this).find('img')[0];
                List.postCollectInfo(img);
                kdAppSet.h5Analysis('goodsDetail_collect');
            })
            .delegate('.pre a', 'click', function () {
                /*                var href = this.hash;
                 href = decodeURIComponent(href.substring(1));
                 // MiniQuery.Event.trigger(window, 'toview', ['commonIframe', {src: href}]);
                 itemIdList.push(config.item.itemid);
                 MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', {item: {itemid: 549}}]);*/
                return false;
            })
            .delegate('#menu_share_btn', 'click', function () {

                //改为打开客服联系页面
                var info = kdAppSet.getAppParam();
                var user = kdAppSet.getUserInfo();
                var phoneList = OptMsg.getPhoneList();
                var phoneStr = phoneList.join(',');
                var url = 'http://mob.cmcloud.cn/webapp/chat/html/index.html?';
                var param = {
                    eid: info.eid,//514403
                    appflag: 0,
                    phone: phoneStr,
                    nick: user.contactName,
                    img: user.headimgurl,
                    openid: info.openid,
                    appid: info.appid || '10091',
                    'goodsImg':'',
                    'goodsName':'',
                    'goodsPrice':'',
                    'goodsModel':''
                };
                var item=config.item || {};
                if(item.name){
                    var imgs=item.img || [];
                    $.Object.extend(param, {
                        'goodsImg':imgs.length>0?imgs[0]:'',
                        'goodsName':item.name,
                        'goodsPrice':item.price,
                        'goodsModel':item.model
                    });
                }

/*                url = url + $.Object.toQueryString(param);
                MiniQuery.Event.trigger(window, 'toview', ['commonIframe', { src: url }]);*/

                MiniQuery.Event.trigger(window, 'toview', ['ChatList', param]);

            });


    }


    function show(forward) {
        CacheList.hide();
        viewPage.show();
        if ($('#view-addgoods').css('display') == 'block') {
            $('#divlistMark').show();
        }
        /*        if (!forward) {
         if (itemIdList.length > 0) {
         redirectGoods(itemIdList.pop());
         }
         }*/
    }

    function hide() {
        viewPage.hide();
        kdAppSet.wxShareInfo({});
        $("#wxShareMark").click();
        $('#divlistMark').hide();
    }


    return {
        render: render,
        show: show,
        hide: hide
    };
})();



var GoodsDetail_Api=(function(){

    //在字符串中 提取包含特定 子字符串的信息
    function matchString(httpStr, httpFlag, httpEndFlag, flagNum) {
        var httpList = [];
        var httpTemplate = '';
        var str = '';
        var start = httpStr.indexOf(httpFlag);
        if (start < 0) {
            httpTemplate = httpStr;
        }
        var end;
        while (start >= 0) {
            httpTemplate = httpTemplate + httpStr.substring(0, start);
            httpStr = httpStr.substring(start);
            end = httpStr.indexOf(httpEndFlag);
            flagNum = flagNum + 1;
            if (end >= 0) {
                str = httpStr.substring(0, end);
                httpList.push(str);
                httpTemplate = httpTemplate + '{httpLink' + (flagNum - 1) + '}';
                httpStr = httpStr.substring(end);
            } else {
                str = httpStr.substring(0);
                httpList.push(str);
                httpTemplate = httpTemplate + '{httpLink' + (flagNum - 1) + '}';
                httpStr = '';
            }
            start = httpStr.indexOf(httpFlag);
            if (start < 0) {
                httpTemplate = httpTemplate + httpStr;
            }
        }
        return {
            list: httpList,
            template: httpTemplate
        };
    }


    function getHttpList(httpStr) {
        var httpFlag = 'http://';
        var httpFlag2 = 'https://';
        var httpEndFlag = ' ';
        var http1 = matchString(httpStr, httpFlag, httpEndFlag, 0);
        if (http1.list.length > 0) {
            httpStr = http1.template;
        }
        var http2 = matchString(httpStr, httpFlag2, httpEndFlag, http1.list.length);
        var list3 = http1.list.concat(http2.list);
        return {
            list: list3,
            template: http2.template
        };
    }

    function getDesc(httpStr) {
        if (httpStr) {
            var httpInfo = getHttpList(httpStr);
            var list = httpInfo.list;
            httpStr = httpInfo.template;
            if (list.length > 0) {
                for (var i in list) {
                    var linkflag = '{httpLink' + i + '}';
                    var strOrg = list[i];
                    var str = encodeURIComponent(list[i]);
                    var str2 = '<a href=#' + str + ' >' + strOrg + '</a>';
                    httpStr = httpStr.replace(new RegExp(linkflag, 'gm'), str2);
                }
            }
        }
        return httpStr;
    }

    function getQrcode(itemid) {
        var appParam = kdAppSet.getAppParam();
        var userInfo = kdAppSet.getUserInfo();
        //是否是主管分享
        var data = {
            'shareGoodsId': itemid
        };
        if (userInfo.optid) {
            data.shareManagerId = userInfo.optid;
        }
        var datastr = MiniQuery.Object.toQueryString({
            eid: appParam.eid,
            data: MiniQuery.Object.toQueryString(data)
        });
        var link = 'http://mob.cmcloud.cn/ServerCloud/wdh/genGoodsUrl?' + datastr;
        return link;
    }

    return {
        getQrcode:getQrcode,
        getDesc:getDesc
    }


})();
var GoodsDetail_Head = (function () {

    var hasInit;
    var config;
    var viewPage;
    var SwipeWrap;
    var sampleImgli;
    var SliderPosi;
    var sampleImg;
    var imgSlider;
    var Api;
    var List;
    var imageWidth;
    var imageViewList;


    function initView(vPage,param) {
        if (!hasInit) {
            viewPage=vPage;
            config = param;
            SwipeWrap = document.getElementById('itemDetailSwipeWrap');
            sampleImg = $.String.between(SwipeWrap.innerHTML, '<!--', '-->');
            SliderPosi = document.getElementById('itemDetailSliderPosi');
            sampleImgli = $.String.between(SliderPosi.innerHTML, '<!--', '-->');
            imageWidth = $(window).width() - 20;
            imageViewList = $('.itemdetail-img');
            Api = GoodsDetail_Api;
            List = GoodsDetail_List;
            bindEvents();
            hasInit = true;
        }

    }

    function bindEvents() {

        viewPage.delegate('.kdcImage2', { //放大图片
            'click': function () {
                if (!config.hasLoaded) {
                    OptMsg.ShowMsg('数据加载中，请稍后操作...');
                    return;
                }
                var qrcode = Api.getQrcode(config.item.itemid);
                var imgurllist = config.item.img;
                var posi = imgSlider.getPos();
                MiniQuery.Event.trigger(window, 'toview', ['ImageView',
                    { imgobj: imgurllist, qrcodelink: qrcode, goodsname: config.item.name, posi: posi }]);
            }
        });

    }


    function initSwipe() {
        var bullets = document.getElementById('itemDetailSliderPosi').getElementsByTagName('li');
        imgSlider =
            Swipe(document.getElementById('itemDetailSlider'), {
                startSlide: 0,
                auto: 0,
                continuous: false,
                disableScroll: false,
                stopPropagation: false,
                allowVerticalMove: false,
                callback: function (pos) {
                },
                transitionEnd: function (index, element) {
                    var i = bullets.length;
                    if (i > 0) {
                        while (i--) {
                            bullets[i].className = ' ';
                        }
                        bullets[index].className = 'on';
                    }
                }
            });
        $('.itemdetail-img .middiv ').css('width', $(window).width());

        setTimeout(function () {
            var imgs = $(".itemdetail-img .middiv img");
            imgs.on('load', function () {
                List.refresh();
            });
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].complete) {
                    List.refresh();
                }
            }
        }, 250);
    }


    var imgSizeGet = 0;
    var check = function () {
        // 只要任何一方大于0
        // 表示已经服务器已经返回宽高
        // console.log(img.width+'**'+img.height);
        var hbase = 282;
        var imglist = imageViewList.find('.kdcImage2[initview=0]');
        if (imglist.length == 0) {
            clearInterval(imgSizeGet);
        } else {
            for (var i = 0, len = imglist.length; i < len; i++) {
                var img = imglist[i];
                if (img.width || img.height) {
                    var wrate = img.width / imageWidth;
                    var hrate = img.height / hbase;
                    var imgc = $(img);
                    if (wrate > hrate) {
                        imgc.css('max-width', '100%');
                    } else {
                        imgc.css('max-height', '100%');
                    }
                    imgc.attr('initview', 1);
                }
            }
        }
    };


    //显示图片信息
    function freshImgList(imglist) {

        var imgls = [];
        if (imglist instanceof Array) {
            imgls = imglist;
        } else {
            imgls.push(imglist);
        }
        if (imgls.length == 0) {
            imgls.push('img/no_img.png');
        }
        var imgMode = kdAppSet.getImgMode();
        var noimgModeDefault = kdAppSet.getNoimgModeDefault();

        SwipeWrap.innerHTML = $.Array.keep(imgls, function (item, i) {
            var imgsrc = item != '' ? (imgMode ? item : noimgModeDefault) : 'img/no_img.png';
            return $.String.format(sampleImg, {
                index: i,
                img: imgsrc
            });
        }).join('');

        if (imgls.length > 0) {
            // 定时获取图片宽高
            if (imgSizeGet) {
                clearInterval(imgSizeGet);
            }
            imgSizeGet = setInterval(function () {
                check();
            }, 40);
        }

        if (imgls.length <= 1) {
            imgls = [];
        }
        SliderPosi.innerHTML = $.Array.keep(imgls, function (item) {
            return $.String.format(sampleImgli, {});
        }).join('');
        if (imgls.length > 1) {
            $('.view_itemdetail nav .position li:first').addClass('on');
        }
        initSwipe();
    }

    function render(param){
        config = param;
    }

    return {
        render: render,
        initView: initView,
        freshImgList: freshImgList
    }

})();
var GoodsDetail_List = (function () {

    var hasInit;
    var viewPage;
    var config;
    var scroller;
    var isCollected;
    var itemdetailarea;
    var loadingHint;
    var MoreInfo;
    var sampleGoodsInfo;
    var sampleMore;

    var Api;
    var Head;


    //初始化视图
    function initView(vPage, param) {
        if (!hasInit) {
            viewPage = vPage;
            config = param;
            itemdetailarea = document.getElementById('itemdetailarea');
            scroller = Lib.Scroller.create(itemdetailarea, { scrollbars: false });
            loadingHint = $("#view-itemdetail").find("#loadingHint");
            MoreInfo = document.getElementById('item-more');
            var goodsinfoList = document.getElementById('goodsinfoList');
            sampleGoodsInfo = $.String.between(goodsinfoList.innerHTML, '<!--', '-->');
            sampleMore = $.String.getTemplates(MoreInfo.innerHTML, [
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
                }
            ]);


            bindEvents();
            initScroll();
            Api = GoodsDetail_Api;
            Head = GoodsDetail_Head;
            hasInit = true;
        }

        $(MoreInfo).hide();
        scroller.isPageEnd = false;
    }

    function bindEvents() {
        viewPage.delegate('[data-cmd="promotionlist"]', {
            'click': function () {
                MiniQuery.Event.trigger(window, 'toview', ['Promotion', config.item.promotionlist]);
            }
        });
    }

    function initScroll() {
        kdctrl.initkdScroll(scroller, {});
    }


    //加载数据
    function loadData(data) {

        //价格上限
        var maxPrice = data.maxprice + '' || '0';
        var arrMax = maxPrice.split('.');
        var maxPriceObj = {
            front: arrMax[0],   //小数点前
            end: arrMax[1] || '00'      //小数点后
        };

        var price = data.price ? data.price + '' : '0';
        var arrPrice = price.split('.');
        var priceObj = {
            front: arrPrice[0],
            end: arrPrice[1] || '00'
        };

        var rate = '10';
        var saleprice = data.saleprice || 0;
        if (saleprice > 0) {
            var ratev = price / saleprice * 10;
            rate = ratev >= 1 ? (rate > 10 ? 10 : ratev.toFixed(1)) : ratev.toFixed(2);
        }
        var datanum = data.num || 0;
        var unitname = data.unitname || '';
        var stockinfo = kdAppSet.getStockStr(datanum, unitname);
        var stockmsg = stockinfo.stockStr;
        var stockstatus = stockinfo.stockstatus;
        if (datanum <= 0) {
            stockstatus = -1;
        }
        var salenum = data.salenum || 0;
        var dataname = data.name || '';
        var onlyexpoint = data.onlyexpoint || 0;
        var point = data.expoint || 0;

        var prolist = data.promotionlist || [];

        var showSaleNum = kdAppSet.getUserInfo().cmpInfo.showSaleNum;
        document.getElementById('goodsinfoList').innerHTML = $.String.format(sampleGoodsInfo, {
            name: dataname,
            pricehLow: priceObj.front,
            pricedLow: priceObj.end,
            pricehHigh: maxPriceObj.front,
            pricedHigh: maxPriceObj.end,
            rate: rate,
            point: point,
            stock: stockmsg,
            saleinfo: salenum + unitname,
            stockcolor: stockstatus == -1 ? 'lowstock' : '',
            oldprice: saleprice,
            sizeinfo: data.model || "",
            lisizecss: data.model == "" ? 'display:none' : '',
            showsalenum: showSaleNum ? '' : 'display:none',
            'pro-show': (prolist.length == 0 || onlyexpoint == 1) ? 'hide' : '',
            'protitle': prolist.length > 0 ? prolist[0].protitle : '',
            'limit-show': data.limitedinfo == '' ? 'hide' : '',
            'limit-title': data.limitedinfo
        });

        var rateView = $('#goodsDetail_rate');
        if (rate > 0 && rate != 10) {
            rateView.css('visibility', 'visible');
        } else {
            rateView.css('visibility', 'hidden');
        }

        var priceInterval = $('#itemdetail-priceInterval');
        if (maxPrice > 0 && +maxPrice > price) {//区间价，最高价显示
            priceInterval.show();
        }
        else {//非区间价，最高价隐藏
            priceInterval.hide();
        }


        //仅限积分兑换onlyexpoint == 1，不显示价格--mayue
        var itemPrice = $('#itemdetail-price');
        var orFlag = viewPage.find('[data-cmd="orshow"]');
        var onlyexpoint = data.onlyexpoint;
        if (onlyexpoint == 1) {
            itemPrice.hide();
            priceInterval.hide();
            orFlag.hide();
        } else {
            itemPrice.show();
            orFlag.show();
        }

        //如果可以积分兑换显示--mayue
        var pointView = viewPage.find('[data-cmd="point"]');
        if (point == 0) {
            pointView.hide();
        } else {
            pointView.show();
            rateView.css('visibility', 'hidden');
        }

        renderFreight(data.freightInfo);
        scroller.refresh();
        setPriceVisiable();
    }


    function initGoodsMore(arr) {

        MoreInfo.innerHTML = $.String.format(sampleMore.container, {
            'items': $.Array.keep(arr, function (item, index) {
                var descStr = item.desc == '' ? '' : $.String.format(sampleMore.desc, { 'desc': Api.getDesc(item.desc) });
                var imgStr = item.img == '' ? '' : $.String.format(sampleMore.img, { 'img': item.img });
                return descStr + imgStr;
            }).join('')
        });

        arr.length > 0 ?$(MoreInfo).show():$(MoreInfo).hide();

        if(arr.length>0){
            setTimeout(function () {
                var imgs = $(MoreInfo).find('img');
                imgs.on('load', function () {
                    scroller.refresh();
                });
                for (var i = 0; i < imgs.length; i++) {
                    if (imgs[i].complete) {
                        scroller.refresh();
                    }
                }
            }, 250);
        }
        scroller.refresh();
    }


    function renderFreight(freightInfo) {
        var $li = viewPage.find('.lifreight');
        if (!kdAppSet.getIsShowPrice()) {    // 旗舰版版本过低或者不显示价格不支持运费
            $li.hide();
            return;
        }
        $li.show();
        if (freightInfo == "") {//没有设置运费，默认显示0
            $li.find('span').text("0");
        } else {
            $li.find('span').text(freightInfo);
        }
    }

    //设置是否显示价格
    function setPriceVisiable() {
        if (kdAppSet.getIsShowPrice()) return;
        $('#itemdetail-price').css('display', 'none');
        $('#itemdetail-priceInterval').css('display', 'none');
        $('#item-originalprice').css('display', 'none');
        $('#goodsDetail_rate').css('display', 'none');
    }


    //获取商品价格 库存 辅助属性
    function getItemAuxInfo(itemid,config) {

        showHint(true);
        Lib.API.get('GetGoodsDetail', {
            currentPage: 1,
            ItemsOfPage: 999,
            para: { Itemid: itemid }
        }, function (data, json) {
            showHint(false);
            config.hasLoaded = true;
            var dlist = data || {};
            isCollected = !!data.isfavorite;

            $.Object.extend(config.item, {
                auxcount: dlist.auxcount,
                auxType: dlist.auxType,
                itemid: itemid,
                isoverseas: dlist.isoverseas || 0,
                model: dlist.model,
                note: dlist.note,
                price: dlist.fprice,
                saleprice: dlist.fsaleprice || '',
                maxprice: dlist.fmaxprice,
                unitid: dlist.unitid,
                unitname: dlist.unitname,
                num: dlist.num,
                name: dlist.name,
                img: dlist.img,
                salenum: dlist.salevolumnpermonth,
                noteimg: dlist.noteimg,
                freightInfo: dlist.freightinfo,
                expoint: dlist.expoint,
                onlyexpoint: dlist.onlyexpoint,
                limitedinfo: dlist.limitedinfo,
                promotionlist: data.promotionlist   //促销方案
            });

            loadData(config.item);
            var url = !!isCollected ? 'img/menuCollected.png' : 'img/menuCollect.png';
            $('.collect img').attr('src', url);
            Head.freshImgList(config.item.img);
            scroller.refresh();
            var imglink = config.item.img;
            if (imglink instanceof Array) {
                imglink = imglink[0];
            }
            wxShareGoodsInfo({
                itemid: config.item.itemid,
                name: config.item.name,
                img: imglink
            });


            scroller.refresh();
            initGoodsMore(config.item.noteimg);
        }, function (code, msg) {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">' + msg + '</div>';
            scroller.refresh();
        }, function () {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">网络错误，请稍候再试</div>';
            scroller.refresh();
        }, "");
    }


    //显示 正在调用接口的提示信息
    function showHint(bshow) {
        if (bshow) {
            loadingHint[0].innerHTML = "";
            loadingHint.find('.hintflag').remove();
            loadingHint.append('<li class="hintflag" style="background: #fff">' + Lib.LoadingTip.get() + '</li>');
        } else {
            loadingHint[0].innerHTML = "";
        }
    }


    function postCollectInfo(img) {

        Lib.API.get('SetMyfavorite', {
            para: {
                FItemID: config.item.itemid,
                OptType: !isCollected ? 1 : 0
            }
        }, function (data, json) {
            isCollected = !isCollected;
            if (isCollected) {
                $(img).attr('src', 'img/menuCollected.png');
            }
            else {
                $(img).attr('src', 'img/menuCollect.png');
            }
            var msg = isCollected ? '商品已收藏' : '已取消商品收藏';
            OptMsg.ShowMsg(msg);
        }, function (code, msg) {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">' + msg + '</div>';
            scroller.refresh();
        }, function () {
            showHint(false);
            loadingHint[0].innerHTML = '<div class="hintflag">网络错误，请稍候再试</div>';
            scroller.refresh();
        });
    }


    function wxShareGoodsInfo(item) {
        //如果是分享过来的 则晚一点设置分享信息
        if (config.shareGoodsId != "") {
            setTimeout(function () {
                wxShareGoods(item);
            }, 1000);
        } else {
            wxShareGoods(item);
        }
    }

    //设置微信分享内容
    function wxShareGoods(item) {
        var goodsUrl = "&shareGoodsId=" + item.itemid;
        var user = kdAppSet.getUserInfo();
        var cmpName = user.cmpInfo.name;
        var desc = '';
        if (user.identity != 'retail') {
            desc = '亲, ' + cmpName + ' 的这件商品真值得拥有，还可享受 ' + user.contactName + ' 的优惠价哟，快来收了去吧！';
        } else {
            desc = '亲, ' + cmpName + ' 的这件商品真值得拥有，快来和我一起购吧！';
        }
        kdAppSet.wxShareInfo({
            title: item.name,
            desc: desc,
            link: goodsUrl,
            imgUrl: item.img
        });
    }

    function refresh() {
        scroller && scroller.refresh();
    }

    function render(param){
        config = param;
    }

    return {
        initView: initView,
        render: render,
        loadData: loadData,
        initGoodsMore: initGoodsMore,
        getItemAuxInfo: getItemAuxInfo,
        postCollectInfo: postCollectInfo,
        refresh: refresh
    }

})();
/*商品列表页面*/

var GoodsList = (function () {
    //商品列表div视图
    var viewPage,
        hasInit,
        firstLoad,
        tabNum,
    //列表显示 0 小图列表 1大图列表
        listType,
        fromPage, //记录从哪个页面跳转来的
        List,
        Category,
        Footer;

    //初始化视图
    function initView() {
        if (!hasInit) {
            viewPage = $('#viewid_goodslist');
            tabNum = 1;
            listType = 0;
            PopMenu.bindWithBtn('goodsList_popMenu');
            viewPage.find('.headtab img').addClass('sprite-list_img');
            bindEvents();
            var moneySum = viewPage.find('[data-cmd="money"]');
            kdAppSet.getIsShowPrice() ? moneySum.show() : moneySum.hide();
            List = GoodsList_List;
            List.init();
            Category = GoodsList_Category;
            Footer = GoodsList_Footer;
            hasInit = true;

        }
    }


    //事件绑定
    function bindEvents() {

        //刷新商品列表
        MiniQuery.Event.bind(window, {
            'GoodsList_refresh': function () {
                List && List.sort();
            }
        });

        viewPage.delegate('#toClassSearch', {
            'click': function () {
                kdAppSet.stopEventPropagation();
                MiniQuery.Event.trigger(window, 'toview', ['GoodsSearch', { noBack: true }]);
                kdAppSet.h5Analysis('goodsList_search');
            }
        })
            .delegate('#listviewtype', {
                'click': function () {
                    //切换列表显示模式
                    listType = (listType + 1) % 2;
                    List.refresh({ listType: listType });
                    var tabimg = viewPage.find('.listviewtype img');
                    if (listType == 0) {
                        tabimg.removeClass('sprite-list_row');
                        $(List.listWrap()).addClass('list-bgcolor');
                        tabimg.addClass('sprite-list_img');
                    } else if (listType == 1) {
                        tabimg.removeClass('sprite-list_img');
                        $(List.listWrap()).removeClass('list-bgcolor');
                        tabimg.addClass('sprite-list_row');
                    }
                    kdAppSet.h5Analysis('goodsList_bigImg');
                }
            })
            .delegate('.goodsListBox', {
                //去购物车
                'click': function () {
                    kdAppSet.stopEventPropagation();
                    MiniQuery.Event.trigger(window, 'toview', ['CacheList']);
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215', color: '#fff' });
                },
                'touchend': function () {
                    $(this).css({ background: '#fff', color: '#ff6427' });
                }
            }
        )
            .delegate('#back-div', {
                'click': function () {
                    switch (fromPage) {
                        case 0:
                            kdShare.backView();
                            break;
                        case 1:
                            kdShare.backView();
                            break;
                    }
                }
            })
            .delegate('[data-cmd="order"]', {
                'click': function () {
                    MiniQuery.Event.trigger(window, 'toview', ['GoodsListSort', { callBack: List.sort }]);
                }
            });
    }


    function isEmpty(obj) {
        for (var i in obj) {
            return false;
        }
        return true;
    }

    function render(config) {
        initView();
        config = config || {};
        if (isEmpty(config) && List.searchKey().tabindex != 0) {
            //如果是新品或者促销 则刷新商品
            config.reload = true;
        }
        config.ItemType = 1099;
        config.MiddleType = '';
        config.ChildType = '';
        var cItemType = config.ItemType;
        var cChildType = config.ChildType;

        show();
        if (!firstLoad || config.reload) {
            renderBackButton(config.fromPage);
            Footer.render({
                listWrap: List.listWrap(),
                listviewobj: List.listviewobj()
            });
            var hideCategory = config.hideCategory;

            if (config.MiddleType) {
                hideCategory = true;
                config.ItemType = config.MiddleType;
            }
            config.ItemType = config.ChildType || config.MiddleType || config.ItemType;
            var categoryType = kdAppSet.getUserInfo().cmpInfo.categoryType;
            if (hideCategory) {
                Category.hide();
                getGoodsListData(config);
            }
            else {
                //横排菜单显示
                if (categoryType == 1) {
                    Category.render({
                        ItemType: cItemType,
                        ChildType: cChildType,
                        fn: function () {
                            getGoodsListData(config);
                        }
                    });
                } else {
                    getGoodsListData(config);
                }
            }
            firstLoad = true;
        }

    }

    function getGoodsListData(config) {

        /*        getItemListData({
         //搜索类型 0 全部 1促销 2新品
         tabindex: config.tabindex || 0,
         //搜索关键字
         keyword: config.keyword || '',
         //标题
         title: config.title || '',
         ItemType: config.ItemType || -1,
         TagList: config.taglist || []
         });*/
        List.render({
            //搜索类型 0 全部 1促销 2新品
            tabindex: config.tabindex || 0,
            //搜索关键字
            keyword: config.keyword || '',
            //标题
            title: config.title || '',
            ItemType: config.ItemType || -1,
            TagList: config.taglist || []
        });


    }

    /*
     * 处理回退按钮，不同入口显示不同样式
     * param index {number}: 入口值, 0 为主页，1 为类目，其他值为搜索
     * */
    function renderBackButton(index) {
        fromPage = +index;
        var $div = $('#back-div');
        var $title = $div.find('.title');
        var $searchBox = $('#toClassSearch');
        switch (fromPage) {
            case 0:
                $div.show();
                togglerBack('sprite-main');
                $searchBox.addClass('hasBackDiv');
                $title.text('主页');
                break;
            case 1:
                $div.show();
                togglerBack('sprite-order');
                $searchBox.addClass('hasBackDiv');
                $title.text('商品');
                break;
            default:
                $searchBox.removeClass('hasBackDiv');
                $div.hide();
        }
    }

    function togglerBack(className) {
        var $icon = $('#back-div .icon-category');
        $icon.removeClass('sprite-order');
        $icon.removeClass('sprite-order');
        $icon.addClass(className);
    }

    function renderFooter() {
        return Footer ? Footer.render({
            listWrap: List.listWrap(),
            listviewobj: List.listviewobj()
        }) : function () {
        };
    }

    function show() {
        viewPage.show();
        kdAppSet.setKdLoading(false);
        renderFooter();
        GoodsList_Opt.refresh();
    }

    function hide() {
        PopMenu.hideElem();
        viewPage.hide();
    }

    return {
        render: render,
        show: show,
        hide: hide,
        renderFooter: renderFooter
    };

})();


var GoodsList_Api = (function () {

    var apiLock, listviewobj; //防止用户快速点击

    //获取商品数据
    function get(config, fn, para, fnReset) {
        apiLock = true;
        listviewobj = config.listviewobj;
        var tabIndex = config.tabIndex;
        var itemsOfPage = config.itemsOfPage;
        var errorRefresh = config.errorRefresh;
        Lib.API.get('GetItemInfor', para,
            function (data, json, root, userflag) {
                removeHint();
                listviewobj.totalPageCount = parseInt(json['TotalPage']);
                var imgMode = kdAppSet.getImgMode();
                var noimgModeDefault = kdAppSet.getNoimgModeDefault();
                var pagenum = (listviewobj.currentPage - 1) * itemsOfPage;
                var list = $.Array.keep(data['itemlist'] || [], function (item, index) {
                    return {
                        index: pagenum + index,
                        name: item.fname,
                        img: item.fimageurl != '' ? (imgMode ? item.fimageurl : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                        imgThumbnail: item.fimageurl != '' ? (imgMode ? kdAppSet.getImgThumbnail(item.fimageurl) : noimgModeDefault) : (imgMode ? 'img/no_img.png' : noimgModeDefault),
                        number: item.fnumber,
                        itemid: item.fitemid,
                        auxcount: item.auxcount,
                        price: item.fprice || 0,
                        maxprice: item.fmaxprice || 0,
                        model: item.fmodel,
                        isoverseas: item.foverseas || 0,
                        unitid: item.funitid,
                        unitname: item.funitname,
                        note: item.fnote,
                        num: parseInt(item.fqty),
                        newflag: item.frecommend,
                        cuxiaoflag: item.fpromotion,
                        expoint: item.expoint,
                        onlyexpoint: item.onlyexpoint
                    };
                });
                fn && fn(list, userflag);
                listviewobj.scroller.isPageEnd = (listviewobj.currentPage - 1 >= listviewobj.totalPageCount);

                apiLock = false;
                fnReset && fnReset();
            },
            function (code, msg) {
                removeHint();
                apiLock = false;
                kdAppSet.showErrorView(msg, errorRefresh);
                fnReset && fnReset();
            },
            function (errCode) {
                removeHint();
                apiLock = false;
                kdAppSet.showErrorView(errCode, errorRefresh);
                fnReset && fnReset();
            }, tabIndex);
    }


    function removeHint() {
        var ullist = $(listviewobj.listv);
        ullist.children().filter('.hintflag').remove();
        ullist.children().filter('.spacerow').remove();
    }


    function format(data) {
        return {
            expoint: data.expoint,
            onlyexpoint: data.onlyexpoint,
            itemid: data.itemid,
            auxcount: data.auxcount,
            model: data.model,
            note: data.note,
            price: data.price,
            maxprice: data.maxprice,
            isoverseas: data.isoverseas,
            unitid: data.unitid,
            unitname: data.unitname,
            stocknum: data.num,
            goodsName: data.name,
            goodsImg: data.img,
            newflag: (data.newflag == 1) ? "display:block;" : "display:none;",
            cuxiaoflag: (data.cuxiaoflag == 1) ? "display:block;" : "display:none;"
        };
    }


    return {
        apiLock: function () {
            return apiLock
        },
        format: format,
        get: get
    }

})();
/*类目模块*/

var GoodsList_Category = (function () {
    var list;
    var tree = [];
    var hasInit;
    var hasconfig = true;
    var List;
    var Api;
    var $wrap = $('#div-category-wrap');
    var lisamples, ItemSamples;
    var hasInitlevel = 1;//总级数
    var liListView = [];//类目
    var currlevel = 1;//当前级别 从1算起

    function render(config) {
        //初始化
        load(function (arr) {
            init(config);
            if (arr.length < 1) {
                hide();
                return;
            }
            $wrap.show();
            fillCategory(-1, arr, currlevel);
            setCategorySelected(config);
            config.fn && config.fn();
        });
    }

    function getIndex(ItemType) {
        for (var i in list) {
            if (ItemType == list[i].Id) {
                return list[i].index;
            }
        }
        return -2;
    }

    //设置选中某个一级类目 根据FItemID的值来判断--暂时保留--mayue
    function setCategorySelected(config) {

        //TODO 根据level计算
        config = config || {};
        var ItemType = config.ItemType || '';
        var findli = $('#div-category-1 li[data-index="' + getIndex(ItemType) + '"]');
        var licate = $('#div-category-1 li');
        var elem = findli.length > 0 ? findli[0] : licate[0];
        selectCategory($(elem), config);

        //是否需要选中2级菜单
        if (config) {
            var ChildType = config.ChildType || '';
            if (ChildType) {
                family(ChildType);
                var a = 2;
                for (var i = alist.length - 1; i > 0; i--) {
                    var findli = $('#div-category-' + a + ' li[data-index="' + getIndex(alist[i - 1]) + '"]');
                    var licate = $('#div-category-' + a + ' li');
                    var elem = findli.length > 0 ? findli[0] : licate[0];
                    selectCategory($(elem), config);
                    a = a + 1;
                    console.log(alist[i - 1]);
                }
            }
        }
        List.clear();
    }

    //生成树
    var alist = [];
    function family(ChildType) {
        var child = [];
        for (i = 0; i < list.length; i++) {
            if (ChildType == list[i].Id) {
                child = list[i];
            }
        }
        alist.push(ChildType);
        for (i = 0; i < list.length; i++) {
            if (child.parent == list[i].Id) {
                family(list[i].Id);
            }
        }
    }


    //加载数据 获取类目数据
    function load(fn) {
        if (list !== undefined) {
            fn && fn(tree);
            return;  //类目更新频率低，启用缓存数据
        }
        Lib.API.get('GetItemClass', {
            currentPage: 1,
            ItemsOfPage: 1000,
            para: {}
        }, function (data, json) {
            hasInitlevel = data.totallevel;
            list = MiniQuery.Array.keep(data.itemlist, function (item, index) {
                return {
                    Id: item.FItemID,
                    name: item.FName,
                    number: item.FNumber,
                    parent: item.FParentID,
                    level: item.FLevel,
                    index: index,
                }
            });
            toTree(list);
            fn && fn(tree);
        }, function (code, msg) {

        }, function () {

        });
    }

    //获取一级类目
    function toTree(list) {
        MiniQuery.Array.each(list, function (item, index) {
            if (item.parent == 0) {
                tree.push(item);
            }
        });
    }
    //mayue--获取子类目
    function getChildNodeByID(id) {
        var childeNode = [];
        for (i = 0; i < list.length; i++) {
            if (id == list[i].parent) {
                childeNode.push(list[i]);
            }
        }
        return childeNode;
    }

    //填充横排类目
    function fillCategory(id, list, currlevel) {
        if (currlevel > liListView.length) {
            return;
        }
        liListView[currlevel - 1].ItemList.innerHTML = $.String.format(ItemSamples.ul, {
            'all': $.String.format(ItemSamples.all, {
                'ItemId': id
            }),
            'item': MiniQuery.Array.keep(list, function (item, index) {
                return $.String.format(ItemSamples.item, {
                    'index': item.index,
                    'name': item.name,
                    'ItemId': item.Id,//可无
                    'dataindex': index + 1
                });
            }).join('')
        });

        setTimeout(function () {
            var last = $(liListView[currlevel - 1].ItemList).find('li[data-index]').last()[0];
            $(liListView[currlevel - 1].ItemList).width(last.offsetLeft + last.clientWidth);
        }, 0);
        setTimeout(function () {
            liListView[currlevel - 1].scroller.refresh();
        }, 1000);
    }

    function init() {
        if (!hasInit) {
            List = GoodsList_List;
            Api = GoodsList_Api;
            lisamples = $.String.getTemplates($wrap[0].innerHTML, [
                {
                    name: 'liList',
                    begin: '#--li.begin--#',
                    end: '#--li.end--#'
                }
            ]);

            ItemSamples = $.String.getTemplates($wrap[0].innerHTML, [
                 {
                     'name': 'ul',
                     'begin': '#--ul.begin--#',
                     'end': '#--ul.end--#'
                 },
               {
                   'name': 'all',
                   'begin': '#--all.begin--#',
                   'end': '#--all.end--#',
                   'outer': '{all}'
               },
               {
                   'name': 'item',
                   'begin': '#--item.begin--#',
                   'end': '#--item.end--#',
                   'outer': '{item}'
               },
            ]);
            initHtml();
            initLiListView();
            bindEvents();
            hasInit = true;
        }
    }

    //初始化类目列表页面容器
    function initHtml() {
        $wrap[0].innerHTML = "";
        for (i = 1; i <= hasInitlevel; i++) {
            $wrap[0].innerHTML += $.String.format(lisamples.liList, {
                'liId': 'div-category-' + i,
                'level': i
            });
        }
    }

    //创建类目列表滑动组件
    function initLiListView() {
        for (i = 1; i <= hasInitlevel; i++) {
            var ItemList = $('#div-category-' + i).find('ul')[0];
            var scroller = KISP.Scroller.create('#div-category-' + i, { scrollX: true, scrollY: false, scrollbars: false });
            var listview = {
                ItemList: ItemList,
                scroller: scroller,
            };
            liListView.push(listview);
        }
    }

    //绑定类目列表事件 
    function bindEvents() {
        for (i = 1; i <= hasInitlevel; i++) {
            $('#div-category-' + i).delegate('li', 'click', function () {
                if (Api.apiLock()) {
                    OptMsg.ShowMsg('数据加载中，请稍后操作...');
                    return;
                }
                selectCategory($(this));
                List.clear();
                List.getItemlist();
            });
        }
    }

    //选择类目
    function selectCategory($click, config) {
        currlevel = parseInt($click.parent().parent().attr('data-level'));//获取当前level
        var index = $click.attr('data-index')
        var id = $click.attr('data-ItemId');
        var childNode = getChildNodeByID(id);
        if (childNode.length > 0 && index > -1) {
            if (currlevel < liListView.length) {
                currlevel = currlevel + 1;
                fillCategory(id, childNode, currlevel);
            }
        }
        toggleChild(currlevel);
        changeActive($click);
        List.searchKey().ItemType = id;
    }

    //子目錄
    function toggleChild(index) {
        $('div-ategory-' + index).css('-webkit-transform', 'translate(0,0)');
        var Listtop = 1.72 + 0.82 * (index - 1);
        $(List.listWrap()).css('top', Listtop + 'rem');//顶部
        var Listscroller = 1.82 + 0.82 * (index - 1);
        List.listviewobj().scroller.noticetop = Listscroller;
        List.listviewobj().scroller.refresh();
    }

    //选中样式
    function changeActive($click) {
        var dataindex = $click.attr('data-dataindex')
        var li = $click.parent().find('[data-cmd="li"]');
        li.removeClass("active");
        li.eq(dataindex).addClass("active");
    }

    function hide() {
        $wrap.hide();
        if (List) {
            $(List.listWrap()).css('top', 0.9 + 'rem');//顶部
            List.listviewobj().scroller.noticetop = 1.1;
        }
    }

    return {
        render: render,
        hide: hide
    }
})();


/*底部模块*/
var GoodsList_Footer = (function () {

    var $div,hasInit,listWrap,listviewobj;

    function render(config) {
        init(config);

        if (CacheList.getGoodsListCount() > 0) {
            $(listWrap).addClass('hasBottom');
        }
        else {
            $(listWrap).removeClass('hasBottom');
        }
        var span = $div.find('.span-cart-count');
        var count = CacheList.getGoodsListCount();
        var moneyBox = $div.find('.money');
        if (!listviewobj || !listviewobj.scroller) {
            return;
        }
        if (count > 0) {
            $div.css('display', '-webkit-box');
            span.text(count < 100 ? count : 99);
            span.show();
            var money = kdAppSet.formatMoneyStr(CacheList.getOrderMoney(), 2); //防止测试数据为0
            if (!money) {
                return;
            }
            var arr = money.split('.');
            $div.find('.money-integer').text(kdAppSet.getRmbStr + arr[0]);
            $div.find('.money-decimal').text('.' + arr[1]);
            moneyBox.show();
            listviewobj.scroller.noticebottom = 65;
            //listviewobj.scroller.refresh();//防止刷回顶部--2016、3、24
        }
        else {
            span.text('');
            span.hide();
            moneyBox.hide();
            hide();
            listviewobj.scroller.noticebottom = 0;
            //listviewobj.scroller.refresh();//防止刷回顶部--2016、3、24
        }
    }

    function init(config) {
        if (!hasInit) {
            $div = $('#div-category-footer');
            listWrap=config.listWrap;
            listviewobj=config.listviewobj;
            bindEvents();
            hasInit = true;
        }
    }

    function bindEvents() {

        $div.delegate('.left', 'click', function () {
            MiniQuery.Event.trigger(window, 'toview', ['CacheList', {}]);
            kdAppSet.h5Analysis('goodsList_shopCart');
        })
            .delegate('.input-submit', {
                'click': function () {
                    CacheList.goodsSubmitBill();
                    kdAppSet.h5Analysis('goodsList_submitBill');
                },
                'touchstart': function () {
                    $(this).css({ background: '#ef5215' });
                },
                'touchend': function () {
                    $(this).css({ background: '#ff6427' });
                }
            });

    }

    function hide() {
        //listviewobj.scroller.refresh();//防止刷回顶部--2016、3、24
        $div.hide();
    }

    return {
        render: render,
        hide: hide
    }
})();
var GoodsList_List = (function () {

    var hasInit;
    var hintText;
    var listWrap;
    var listviewobj;
    var iheight;
    //商品查找条件
    var searchKey;
    var sample;
    var sample2;
    //页签 0 全部 1新品 2 促销
    var curTabIndex;
    var itemsOfPage;
    var lastCalled;
    //列表排序
    var sortInfo;
    //大小图模式切换
    var listType;
    var Api;


    //需要直接加入购物车模式 的 企业号，特别处理
    var eidList = [ '2467638','4148788','326919','2276683'];

    //初始化列表视图数据
    function init() {
        if (!hasInit) {
            sortInfo = {};
            searchKey = {};
            curTabIndex = -1;
            itemsOfPage = 10;
            lastCalled = 0;
            Api = GoodsList_Api;
            listType = 0;
            listWrap = document.getElementById('goodslist_listwrap');
            $(listWrap).addClass('list-bgcolor');
            hintText = "商品名称/规格型号/商品代码";
            var samples = document.getElementById('goodslist_list').innerHTML;

            var eid = kdAppSet.getAppParam().eid;
            var qInput = (eidList.indexOf(eid) >= 0);
            sample = qInput ? $.String.between(samples, '<!--3', '3-->') : $.String.between(samples, '<!--1', '1-->');

            sample2 = $.String.getTemplates(samples, [
                {
                    name: 'li',
                    begin: '<!--2',
                    end: '2-->'
                },
                {
                    name: 'row',
                    begin: '#--row.begin--#',
                    end: '#--row.end--#',
                    outer: '{rows}'
                }
            ]);
            listviewobj = {
                listv: document.getElementById('goodslist_list'),
                scroller: Lib.Scroller.create(listWrap),
                currentPage: 1,
                totalPageCount: 0,
                listdata: [],
                fresh: false
            };
            iheight = $(window).height() - 44;

            initScroll(listviewobj);
            bindEvents(listviewobj.listv);
            sortInfo={
                'SortType':5,
                'SortDirect':'desc'
            };
            hasInit = true;
        }
    }


    function showGoodsDetail(index) {
        var item = listviewobj.listdata[index];
        kdAppSet.stopEventPropagation();
        MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', { item: item }]);
    }

    function getGoods($this) {
        var pctrl = $this.parent();
        var index = pctrl.attr('data-index');
        var data = listviewobj.listdata[index];
        return  Api.format(data);
    }

    function bindEvents(listv) {

        $(listv).delegate('.infoDiv', {
            'touchstart': function () {
                $(this).parent().css('background', '#d9dadb');
            },
            'touchend': function () {
                $(this).parent().css('background', '#fff');
            }
        })
            .delegate('.infoDiv', 'click', function () {
                var index = $(this).parents('li').attr('data-index');
                showGoodsDetail(index);
                return false;
            })
            .delegate('.imgbox', 'click', function () {
                var index = $(this).attr('data-index');
                showGoodsDetail(index);
                return false;
            })

            .delegate('[data-cmd="-"]', 'click', function () {

                var pctrl = $(this).parent();
                var goods = getGoods($(this));
                var num = Number(pctrl.find('[data-cmd="input"]')[0].innerText || 0);
                if (num >= 1) {
                    num = num - 1;
                    goods.num = num;
                    num >= 1 ? GoodsList_Opt.update(goods) : GoodsList_Opt.del(goods);
                    pctrl.find('[data-cmd="input"]')[0].innerText = num ? num : '';
                    num == 0 ? $(this).addClass('hide') : '';
                    refreshFooter();

                }
            })
            .delegate('[data-cmd="+"]', 'click', function () {

                var pctrl = $(this).parent();
                var goods = getGoods($(this));
                var num = Number(pctrl.find('[data-cmd="input"]')[0].innerText || 0);
                num = num + 1;
                goods.num = num;
                GoodsList_Opt.update(goods);
                pctrl.find('[data-cmd="input"]')[0].innerText = num;
                var li = pctrl.find('[data-cmd="-"]');
                num >= 0 ? li.removeClass('hide') : '';
                refreshFooter();

            })
            .delegate('[data-cmd="input"]', 'click', function () {
                var pctrl = $(this).parent();
                var goods = getGoods($(this));
                var num = Number(pctrl.find('[data-cmd="input"]')[0].innerText || 0);

                var config = {
                    name: '',
                    input: num,
                    allowZero: true,
                    hint: "无效数据!",
                    index: 0,
                    fn: function (kvalue, index) {
                        if (kvalue == '') {
                            kvalue = 0;
                        }
                        goods.num = kvalue;
                        kvalue == 0 ? GoodsList_Opt.del(goods) : GoodsList_Opt.update(goods);
                        pctrl.find('[data-cmd="input"]')[0].innerText = (kvalue == 0 ? '' : kvalue);
                        var li = pctrl.find('[data-cmd="-"]');
                        kvalue == 0 ? li.addClass('hide') : li.removeClass('hide');
                        refreshFooter();
                    }
                };
                kdShare.keyBoard.autoshow(config);

            })

            .delegate('.addBtn, .icon-buy', {
                'click': function (e) {
                    //加入购物车
                    var index = $(this).parents('li').attr('data-index') || $(this).parents('.imgbox').attr('data-index');
                    var data = listviewobj.listdata[index];
                    var goodsinfo = Api.format(data);
                    e.stopPropagation(); //防止冒泡,区别下方法
                    kdAppSet.stopEventPropagation();
                    AddGoods.showAttr({ goods: goodsinfo, buytype: 'list' });
                    kdAppSet.h5Analysis('goodsList_add');
                },
                'touchstart': function () {
                    $(this).addClass('sprite-buy');
                    $(this).removeClass('sprite-buy_s');
                },
                'touchend': function () {
                    $(this).addClass('sprite-buy_s');
                    $(this).removeClass('sprite-buy');
                }
            }
        );
    }


    function refreshFooter() {

        /*        var eid = kdAppSet.getAppParam().eid;
         if (eidList.indexOf(eid) >= 0 && data.auxcount == 0) {
         GoodsList_Opt.update(goodsinfo);
         OptMsg.ShowMsg('已加入购物车');
         GoodsList.renderFooter();
         } else {

         }*/
        GoodsList.renderFooter();
    }

    function initScroll(listview) {
        var option = {
            hinttop: 1.8,
            fnfresh: function (reset) {
                listview.currentPage = 1;
                listview.listdata = [];
                getItemlist('', reset);
            },
            fnmore: function (reset) {
                getItemlist('', reset);
            }
        };
        listview.scroller.fnscroll = fnscroll;
        kdctrl.initkdScroll(listview.scroller, option);
    }

    function fnscroll(bfresh) {
        var now = new Date,
            wait = 250,
            remaining = wait - (now - lastCalled);
        if (remaining <= 0 || bfresh) {
            lastCalled = now;
            freshImgList();
        }
    }


    function render(searchInfo) {

        var taglist = searchKey.TagList || [];
        var skey = searchInfo.tabindex + searchInfo.keyword + searchInfo.ItemType + searchInfo.TagList.join('');
        var curkey = searchKey.tabindex + searchKey.keyword + searchKey.ItemType + taglist.join('');

        kdAppSet.setAppTitle(searchInfo.title);
        if (curkey != skey) {
            searchKey = searchInfo;
            $('#txtSearch').val(searchKey.keyword || hintText);
            clear();
            curTabIndex = searchKey.tabindex;
            listviewobj.currentPage = 1;
            listviewobj.totalPageCount = 1;
            listviewobj.listdata.length = 0;
            getItemlist();
            listviewobj.fresh = true;
        }
        listviewobj.scroller.refresh();
    }


    function clear() {
        listviewobj.currentPage = 1;
        listviewobj.totalPageCount = 1;
        listviewobj.listdata.length = 0;
        var scroll = listviewobj.scroller;
        scroll.scrollTo(0, 0);
        listviewobj.listv.innerHTML = '';
        scroll.refresh();
    }


    //错误刷新
    function errorRefresh(tabindex) {
        listviewobj.currentPage = 1;
        listviewobj.listdata = [];
        getItemlist(tabindex);
    }

    //获取下一页参数
    function getQueryParam(index) {
        var listview = listviewobj;
        if (listview.currentPage > listview.totalPageCount && listview.currentPage != 1) {
            return;
        }
        return {
            currentPage: listview.currentPage,
            ItemsOfPage: itemsOfPage,
            para: {
                keyword: kdAppSet.ReplaceJsonSpecialChar(searchKey.keyword || ''),
                option: index,
                SortType: sortInfo.SortType || 0,
                SortDirect: sortInfo.SortDirect || 'desc',
                ItemType: searchKey.ItemType,
                TagList: searchKey.TagList || []
            }
        };
    }


    function getItemlist(index, fnReset) {
        if (index == undefined || index == '') {
            index = curTabIndex;
        }
        var para = getQueryParam(index);
        //达到最后一页
        if (!para) {
            fnReset && fnReset();
            return;
        }
        var ullist = $(listviewobj.listv);
        if (para.currentPage > 1 || ullist.children().length == 0) {
            ullist.children().filter('.hintflag').remove();
            ullist.append('<li class="hintflag">' + Lib.LoadingTip.get() + '</li>');
        }

        //填充数据列表--mayue
        GoodsList_Api.get(
            {
                listviewobj: listviewobj,
                tabIndex: curTabIndex,
                itemsOfPage: itemsOfPage,
                errorRefresh: errorRefresh
            },
            function (data) {
                var listview = listviewobj;
                setListData(data, listview.listdata);
                var listStr = '';
                if (listType == 0) {
                    listStr = getDatalistRow(data);
                } else if (listType == 1) {
                    listStr = getDatalistImg(data);
                }

                if (listview.currentPage > 1) {
                    listview.listv.innerHTML += listStr;
                } else {
                    listview.listv.innerHTML = listStr;
                    if (listStr == "") {
                        listview.listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
                    }
                }
                GoodsList_Opt.refresh();
                listview.scroller.refresh();
                listview.currentPage += 1;
                setPriceVisiable();
                freshImgList();
                kdAppSet.setKdLoading(false);
            }, para, fnReset);
    }


    function setListData(data, listData) {
        var inum = data.length;
        for (var i = 0; i < inum; i++) {
            listData.push(data[i]);
        }
    }

    //列表排序 以及做 刷新列表使用
    function sort(sort) {
        listviewobj.currentPage = 1;
        listviewobj.listdata = [];
        if (sort) {
            sortInfo = {
                SortType: sort.key || '0',
                SortDirect: sort.asc ? 'asc' : 'desc'
            };
            kdAppSet.setKdLoading(true, '正在排序数据...');
        }
        listviewobj.scroller.scrollTo(0, 0);
        getItemlist('');
        /*
         SortType --- 排序类型：-1--默认排序（按商品上架时间）；
         0--商品上架时间；1--按价格；2--按销量；3--商品名称；4--物料代码
         SortDirect ---排序方向："desc"--降序，“asc”--升序
         */
    }


    //刷新列表信息

    function refresh(config) {
        listType = config.listType;
        var listview = listviewobj;

        var listStr = '';
        if (listType == 0) {
            listStr = getDatalistRow(listview.listdata);
        } else if (listType == 1) {
            listStr = getDatalistImg(listview.listdata);
        }

        listview.listv.innerHTML = listStr;
        //mayue 原来是用 listStr == "" 作为条件，导致先出现了空数据页面
        if (listview.totalPageCount == 0) {
            listview.listv.innerHTML = kdAppSet.getEmptyMsg(iheight);
        }
        var scroll = listview.scroller;
        scroll.refresh();
        setPriceVisiable();
        //刷新图片
        freshImgList();
    }


    //获取小图列表html
    function getDatalistRow(data) {
        return $.Array.keep(data, function (item) {
            return getStrByTemplate(item);
        }).join('');
    }

    //获取大图列表html
    function getDatalistImg(data) {
        var listdata = [];
        var rowlist = null;
        for (var i = 0, inum = data.length; i < inum; i++) {
            var knum = i % 2;
            if (knum == 0) {
                rowlist = [];
                rowlist.push(data[i]);
                listdata.push(rowlist);
            } else {
                rowlist.push(data[i]);
            }
        }
        return $.Array.keep(listdata, function (itemArr) {
            return getStrByTemplate2(itemArr);
        }).join('');
    }


    //获取小图模板数据
    function getStrByTemplate(item) {

        var priceStr = kdAppSet.getPriceStr(item);
        var stockinfo = kdAppSet.getStockStr(item.num, item.unitname);
        var stockmsg = stockinfo.stockStr;
        var colormsg = stockinfo.color;

        if (!sample) {
            var samples = document.getElementById('goodslist_list0').innerHTML;
            sample = $.String.between(samples, '<!--', '-->');
        }

        var strHtml = $.String.format(sample, {
            index: item.index,
            img: item.imgThumbnail,
            number: item.number,
            name: item.name,
            itemid: item.itemid,
            price: priceStr,
            model: item.model,
            stockmsg: stockmsg,
            colormsg: colormsg,
            cuxiao: item.note,
            //积分
            oldprice: item.maxprice + '/' + item.unitname,
            "xcust-old-price": (!item.expoint && item.maxprice == item.price) ? "xcust-old-price" : "",
            expoint: item.expoint,
            priceshow: item.onlyexpoint == 1 ? 'hide' : '',
            orshow: item.onlyexpoint == 1 ? 'hide' : '',
            pointshow: item.expoint ? '' : 'hide',
            "input-view": item.auxcount == 0 ? '' : 'hide-input'
        });
        return strHtml;
    }


    //获取大图模板数据
    function getStrByTemplate2(list) {
        return $.String.format(sample2['li'], {
            'rows': $.Array.map(list, function (item, index) {
                    //item.maxprice = 0;
                    //var priceStr = kdAppSet.getPriceStr(item);
                    var stockinfo = kdAppSet.getStockStr(item.num, item.unitname);
                    var stockmsg = stockinfo.stockStr;
                    var colormsg = stockinfo.color;
                    return $.String.format(sample2['row'], {
                        'data-index': item.index,
                        img: 'img/loading.png',
                        imgsrc: item.img,
                        number: item.number,
                        name: item.name,
                        //price: priceStr,
                        price: "￥" + item.price,
                        model: item.model,
                        stockmsg: stockmsg,
                        colormsg: colormsg,
                        cuxiao: item.note
                    });
                }
            ).join('')
        });
    }


    //根据滚动位置动态加载图片
    function freshImgList() {

        if (listType == 1) {
            var listview = listviewobj;
            var scroll = listview.scroller;
            var scrollTop = Math.abs(scroll.y);
            var scrollBottom = scrollTop + scroll.wrapperHeight;
            $(listview.listv).find('.imgrow').each(function () {
                var itop = this.offsetTop;
                var ibom = itop + this.clientHeight;
                if ((itop >= scrollTop && itop <= scrollBottom) || (ibom >= scrollTop && ibom <= scrollBottom)) {
                    $(this).find('.imgbox img').each(function () {
                        var curthis = $(this);
                        var imgsrc = curthis.attr('imgsrc');
                        if (imgsrc != '') {
                            curthis.attr('src', imgsrc);
                            curthis.attr('imgsrc', '');
                        }
                    });
                }
            });
        }
    }


    //设置价格是否显示  直接在列表渲染时 处理更好
    function setPriceVisiable() {
        var $price = $("#viewid_goodslist").find(".price");
        kdAppSet.getIsShowPrice() ? $price.show() : $price.hide();
    }


    return {
        init: init,
        render: render,
        refresh: refresh,
        sort: sort,
        clear: clear,
        getItemlist: getItemlist,
        searchKey: function () {
            return searchKey;
        },
        listWrap: function () {
            return listWrap;
        },
        listviewobj: function () {
            return listviewobj;
        }
    }

})();
var GoodsList_Opt = (function () {


    function del(goods) {
        var bexist = false;
        var itemid = goods.itemid;
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist == "") {
            return;
        }
        var goodslistArr = JSON.parse(goodslist);
        var inum = goodslistArr.length;
        //购物车列表遍历
        for (var i = 0; i < inum; i++) {
            if (itemid == goodslistArr[i].itemid) {
                goodslistArr.splice(i, 1);
                bexist = true;
                break;
            }
        }
        if (bexist) {
            goodslist = JSON.stringify(goodslistArr);
            kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
        }
    }


    function update(goods) {

        //保存购物清单的数据到缓存

        var addGoodsList = [];
        addGoodsList.push({
            expoint: goods.expoint,
            fauxid: 0,
            fitemid: goods.itemid,
            name: goods.goodsName,
            num: goods.num || 1,
            onlyexpoint: goods.onlyexpoint,
            price: goods.price
        });

        var addGoods = {
            itemid: goods.itemid,
            isoverseas: goods.isoverseas || 0,
            name: goods.goodsName,
            unitid: goods.unitid,
            unitname: goods.unitname,
            img: goods.goodsImg,
            stocknum: goods.stocknum || 0,
            auxtype: 0,
            attrList: addGoodsList
        };

        var goodslistArr = [];
        var goodslist = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (goodslist == "") {
            goodslistArr.push(addGoods);
        }
        else {
            goodslistArr = JSON.parse(goodslist);
            var inum = goodslistArr.length;
            var bcheck = false;
            //购物车列表遍历
            for (var i = 0; i < inum; i++) {
                if (addGoods.itemid == goodslistArr[i].itemid) {
                    var attrList = goodslistArr[i].attrList;
                    var attrnum = attrList.length;
                    var newattrnum = addGoodsList.length;
                    //待加商品列表遍历
                    for (var k = 0; k < newattrnum; k++) {
                        var bexist = false;
                        //待加商品明细与购物车商品明细比较（注 购物车商品缓存 使用2层结构）
                        for (var j = 0; j < attrnum; j++) {
                            if (addGoodsList[k].name == attrList[j].name) {
                                bexist = true;
                                //新添加的商品数量加上以前缓存的数量
                                //attrList[j].num = kdShare.calcAdd(Number(attrList[j].num), Number(addGoodsList[k].num));

                                //数量直接覆盖原来的
                                attrList[j].num = Number(addGoodsList[k].num);
                                break;
                            }
                        }
                        if (!bexist) {
                            attrList.push(addGoodsList[k]);
                        }
                    }
                    bcheck = true;
                }
            }
            if (!bcheck) {
                goodslistArr.push(addGoods);
            }
        }
        goodslist = JSON.stringify(goodslistArr);
        kdShare.cache.setCacheData(goodslist, kdAppSet.getGoodslistFlag());
    }


    function refresh() {
        var $list = $('#goodslist_list');
        var qInput = $list.find('.count-bar');
        if (qInput.length<=0) {
            return;
        }

        $list.find('[data-id]').text('');
        $list.find('[data-cmd="-"]').addClass('hide');

        var listStr = kdShare.cache.getCacheDataObj(kdAppSet.getGoodslistFlag());
        if (listStr != "") {
            var list = JSON.parse(listStr);
            var inum = list.length;
            var itemid = '';
            var num = '';

            //购物车列表遍历
            for (var i = 0; i < inum; i++) {
                var attrList = list[i].attrList;
                var attrnum = attrList.length;
                for (var j = 0; j < attrnum; j++) {
                    itemid = attrList[j].fitemid;
                    num = attrList[j].num;
                    var li = $list.find('[data-id="' + itemid + '"]');
                    if (li.length > 0) {
                        li.text(num);
                        li.siblings('[data-cmd="-"]').removeClass('hide');
                    }
                }
            }
        }
    }

    return {
        del: del,
        update: update,
        refresh: refresh
    }

})();
;
(function () {

    /*    (function () {
            if (!kdAppSet.getAppParam().isdebug) {
                var url = document.referrer;
                if (url.indexOf('/index.html') < 0) {
                    var link = window.location.href;
                    link = link.replace("start.html", "index.html");
                    window.location.replace(link);
                }
            }
        })();*/

    //开始
    (function () {

        if (kdAppSet.isPcBrower()) {
            $('html').addClass('isPC_Html');
        } else {
            $('html').removeClass('isPC_Html');
        }
        var nav;

        function initCategory(categoryType) {
            nav = new Lib.Navigation({
                'Home': Home,
                'GoodsList': GoodsList,
                'GoodsListSort': GoodsListSort,
                'GoodsSearch': GoodsSearch,
                'GoodsDetail': GoodsDetail,
                'Me': Me,
                'Register': Register,
                'CacheList': CacheList,
                'CacheOrderList': CacheOrderList,
                'PayList': PayList,
                'PayCode': PayCode,
                'PayDetail': PayDetail,
                'Orderlist': Orderlist,
                'OrderDetail': OrderDetail,
                'GoodsCategory': categoryType == 0 ? GoodsCategory : GoodsList //该模式下类目和商品列表整合，类目直接跳商品列表
            });

            function loadview(caller) {
                var name = caller.name;
                if (caller.nohint) {
                } else {
                    kdAppSet.setKdLoading(true, "正在加载...");
                }
                KDLoad.LoadView({
                    //下面2个参数 给debug代码时 使用
                    nav: nav,
                    app: kdAppSet,
                    name: name,
                    fnSuccess: function () {
                        if (caller.nohint) {
                        } else {
                            kdAppSet.setKdLoading(false);
                        }
                        if (caller.isview) {
                            nav.push(name, window[name]);
                        }
                        caller.fnSuccess && caller.fnSuccess();
                    }
                });
            }

            MiniQuery.Event.bind(window, {
                'toview': function (name) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var noBack = (args && args.length > 0) ? !!args[0].noBack : false;
                    //先判断视图是否存在 不存在则先load进来
                    if (nav.views[name]) {
                        nav.to(name, true, args);
                        if (!noBack) {
                            OptHash.pushHash(name, args);
                        }
                    } else {
                        loadview({
                            name: name,
                            fnSuccess: function () {
                                nav.push(name, window[name]);
                                nav.to(name, true, args);
                                if (!noBack) {
                                    OptHash.pushHash(name, args);
                                }
                            }
                        });
                    }
                },
                'loadview': loadview,
                'backview': function () {
                    nav.back(true);
                },
                //回退页面 并且不刷新
                'backviewkeep': function () {
                    OptHash.popHash();
                    nav.back(false);
                },
                //删除回退页面个数
                'clearbackview': function (step) {
                    nav.clear(step);
                }
            });

        }

        var custCssEidList = ['2467638', '2193738', '4391056'];
        //var custJsEidList = ['4391056'];

        function loadCustFile(eid) {

            if (custCssEidList.indexOf(eid) >= 0) {
                KDLoad.loadCssCust({ eid: eid });
            }

        }

        function getUserInfo() {

            var AppParam = kdAppSet.getAppParam();
            var appid = AppParam.appid;
            var eid = AppParam.eid;
            //微信签名
            wxSign.wx_init({ appid: appid, eid: eid });
            showAppHint();
            getUserInfoApi();

            function getUserInfoApi() {
                kdAppSet.setKdLoading(true);
                var para = {
                    para: {
                        ownerGUID: AppParam.shareManagerId || '',
                        NickName: AppParam.nickname || '',
                        headimgurl: AppParam.headimgurl || ''
                    }
                };

                Lib.API.get('GetUserInfos', para,
                    function (data, json) {
                        //kdAppSet.setKdLoading(false);
                        checkVersion(data.apiversion);
                        dealUserInfo(data);

                        var categoryType = kdAppSet.getUserInfo().cmpInfo.categoryType;
                        initCategory(categoryType);
                        //设置web app title
                        var userinfo = kdAppSet.getUserInfo();
                        kdAppSet.setAppTitle('');
                        //设置默认分享页面
                        kdAppSet.wxShareInfo({});
                        //初始化控件
                        kdAppSet.initAppCtrl();

                        if (!userinfo.cmpInfo.allowRetailLogin && !userinfo.senderMobile) {
                            //不允许零售客户访问
                            MiniQuery.Event.trigger(window, 'toview', ['Register', {}]);
                        }
                        else {
                            initAppView();
                        }
                        //加载客户个性化文件
                        loadCustFile(eid);
                        PayCode.setAppid();

                    }, function (code, msg, json) {
                        kdAppSet.setKdLoading(false);
                        initCategory(0);
                        kdAppSet.showErrorView(msg, getUserInfoApi, '');
                    }, function (errCode) {
                        kdAppSet.setKdLoading(false);
                        initCategory(0);
                        kdAppSet.showErrorView(errCode, getUserInfoApi, '');
                    });
            }

            /*
             * 检查版本
             * */
            function checkVersion(version) {
                var url = window.location.href;
                var reg = /microSaleV(\d+)/;
                var vers = url.match(reg);
                if (vers) {
                    if (kdAppSet.getAppParam().isdebug || vers[1] == 10 || version == vers[1]) {
                        return true;
                    }
                    window.location.href = url.replace(vers[0], 'microSaleV' + version);
                }
            }

            //显示界面信息
            function initAppView() {
                showApp();
                //初始化菜单
                OptAppMenu.initAppMenu();
                //通知购物车刷新数量
                MiniQuery.Event.trigger(window, 'freshListBoxCount', []);
            }

            //处理用户以及系统设置信息
            function dealUserInfo(data) {
                var otherPara = data.otherPara || {};
                var address = data.address || {};
                var fidentify = data.fidentify || "";

                var user = {
                    userid: data.userid,
                    usertype: data.usertype,
                    apiversion: data.apiversion,
                    headimgurl: data.headimgurl,
                    database: data.database,
                    contactName: data.fcontact || kdAppSet.getAppParam().nickname || '',
                    senderMobile: data.fmobilephone,
                    senderName: data.fname,
                    companyName: data.fcompanyname,
                    receiverOids: data.fopenids,
                    receiveAddress: data.faddress,
                    empName: data.fempname,
                    receiverPhone: data.fempmobilephone,
                    msgOption: data.msgoption,
                    serviceOption: data.serviceoption,
                    serviceList: MiniQuery.Object.clone(data.serviceList) || [],
                    showprice: data.showprice,
                    showstock: data.showstock,
                    identify: fidentify.toLowerCase(),
                    optid: data.foptid,
                    shopurl: data.shopurl || '',
                    corpid: data.corpid || "kingdee",
                    ueversion: data.ueversion,
                    storeid: data.storeid,
                    vipid: data.vipID,
                    vipAmount: data.vipAmount,
                    vipcardAmount: data.vipcardAmount,
                    vipPoints: data.vipPoints,
                    viplevelname: data.viplevelname,
                    wdhurl: data.wdhurl,
                    wxservicenumber: data.wxservicenumber, //微信服务号
                    wxservicenumberurl: data.wxservicenumberurl,//微信服务号关注二维码图片地址
                    allowoutinstore: data.allowoutinstore || 0,//是否允许门店自提
                    invitecode: data.invitecode,//邀请码
                    caninvited: data.caninvited,//是否允许被邀请（0：不允许；1：允许）
                    sharesum: data.sharesum,//我的好友数量
                    shareordersum: data.shareordersum,//已下单的好友数量
                    //支付方式
                    allowpayway: MiniQuery.Object.clone(data.allowpayway) || [],
                    //线下支付方式
                    offlinesubpay: MiniQuery.Object.clone(data.offlinesubpay) || [],
                    fetchstylelist: MiniQuery.Object.clone(data.fetchstylelist) || [],
                    taglist: MiniQuery.Object.clone(data.taglist) || [],
                    cmpInfo: {
                        name: otherPara.signshortname,
                        phone: otherPara.signtel,
                        address: otherPara.signaddress,
                        welcome: otherPara.signwelcome,
                        img: otherPara.signlogo,
                        homeImgStyle: otherPara.homepageimagestyle || 3,
                        //是否显示销售数量
                        showSaleNum: (otherPara.showsalevolumn == 1) || false,
                        //是否显示发票
                        allowChooseInvoice: (otherPara.allowchooseinvoice == 1) || false,
                        //允许零售用户访问
                        allowRetailLogin: (otherPara.allowretaillogon == 1) || false,
                        //允许零售用户下单
                        allowRetailSubmit: (otherPara.allowretailsubmit == 1) || false,
                        //是否允许积分
                        allowRetailPoint: (otherPara.allowvantageforretail == 1) || false,
                        //是否允许使用微信卡券
                        allowWxCard: (otherPara.allowwxcardcoupons == 1) || false,
                        categoryType: otherPara.goodsonlinetypestyle,
                        outinstoretakedelaydate: parseInt(otherPara.outinstoretakedelaydate) || 0,
                        allowshareprice: parseInt(otherPara.allowshareprice) || 0
                    },
                    addressInfo: {
                        receiverid: address.receiverid || "",
                        receiveraddress: address.receiveraddress,
                        address: address.address,
                        receivername: address.receivername,
                        provincenumber: address.provincenumber || "",
                        citynumber: address.citynumber || "",
                        districtnumber: address.districtnumber || "",
                        mobile: address.mobile
                    }
                };

                debugfn(user);

                if (user.identify == 'retail' && user.senderMobile == '') {
                    user.usertype = -1;
                }

                kdAppSet.setUserInfo(user);
                var stockStrategy = data.StockStrategy;
                kdAppSet.setStockStrategy(stockStrategy);
                kdAppSet.delayLoad('StoreList', function () {
                    StoreList.getOnlyOneStore(getOneStore);
                }, 1000);

            }

            function debugfn(user){
                //用来调试使用
 /*               var host = window.location.host || '';
                var isdebug = host.indexOf('localhost') >= 0 || host.indexOf('172.20') >= 0 || host.indexOf('127.0') >= 0 || (host == '');
                if(isdebug){
                    user.identify='manager';
                    user.senderMobile='138';
                    user.contactName='test';
                    user.usertype=0;
                }*/
            }
        }

        function getOneStore(store) {
            kdAppSet.updateUserInfo({
                oneStore: store
            });
        }

        function showApp() {
            //分享页面过来
            if (isShareView()) {
                showShareView();
            } else {
                var firstview = kdAppSet.getAppParam().firstview;
                showAppView(firstview, false);
            }
            OptLog.writePageLog(OptLog.getLogType().index);
        }


        //提示是否开启无图模式
        function showAppHint() {
            var imgKey = kdAppSet.getNoimgModeCacheKey();
            var state = kdShare.cache.getCacheDataObj(imgKey);
            if (state === '0') {
                OptMsg.ShowMsg("您已开启无图模式,商品图片不会下载", "", 3000);
            }
        }

        //显示对应页面
        function showAppView(view, ishide) {
            function tohome(config) {
                MiniQuery.Event.trigger(window, 'toview', ['Home', config]);
            }

            switch (view) {
                case "person":
                    nav.to('Me', true);
                    OptHash.pushHash('Me');
                    break;

                case "goods":
                    nav.to('GoodsCategory', true);
                    OptHash.pushHash('GoodsCategory');
                    break;

                case "Register":
                    nav.to('Register', true);
                    OptHash.pushHash('Register');
                    break;

                case "cachelist":
                    nav.to('CacheList', true);
                    OptHash.pushHash('CacheList');
                    break;

                case "newlist":
                    //直接跳转到 新品页面
                    tohome({
                        isHide: true, fn: function () {
                            //由于新品标题是在首页动态加载的，所以需要等首页接口完成后才能显示
                            var tiltleName = $('#home_newlist .title')[0].innerHTML;
                            MiniQuery.Event.trigger(window, 'toview', ['GoodsList', { tabindex: 1, title: tiltleName, fromPage: 0, hideCategory: true }]);
                        }
                    });
                    break;

                case "cxlist":
                    //直接跳转到 促销页面
                    tohome({
                        isHide: true, fn: function () {
                            var tiltleName = $('#home_cxlist .title')[0].innerHTML;
                            MiniQuery.Event.trigger(window, 'toview', ['GoodsList', { tabindex: 2, title: tiltleName, fromPage: 0, hideCategory: true }]);
                        }
                    });
                    break;

                case "hotlist":
                    //直接跳转到 推荐页面
                    tohome({
                        isHide: true, fn: function () {
                            var tiltleName = $('#home_hotlist .title')[0].innerHTML;
                            MiniQuery.Event.trigger(window, 'toview', ['HotList', { title: tiltleName, fromPage: 0 }]);
                        }
                    });
                    break;

                case "pointlist":
                    //直接跳转到 商品列表的积分商品页面
                    tohome({ isHide: true });
                    setTimeout(function () {
                        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', { ItemType: 999999999 }]);
                    }, 200);
                    break;

                case "goodslist":
                    //直接跳转到 商品列表的某个类目
                    tohome({ isHide: true });
                    var app = kdAppSet.getAppParam();
                    setTimeout(function () {
                        MiniQuery.Event.trigger(window, 'toview', ['GoodsList', {
                            ItemType: app.ItemType,
                            MiddleType: app.MiddleType,
                            ChildType: app.ChildType
                        }]);
                    }, 200);
                    break;

                default:
                    if (view) {
                        MiniQuery.Event.trigger(window, 'toview', [view, {}]);
                    } else {
                        if (!dealHashView()) {
                            tohome({});
                        }
                    }
                    break;
            }

        }


        //处理hash 值跳转
        function dealHashView() {
            //不允许首次显示的视图
            var vlist = ['CacheOrderList', 'PayList', 'ViewError'];
            var hash = kdAppSet.getAppParam().hash || '';
            hash = hash.substring(1);
            var config = {};
            if (hash != '') {
                var args = hash.split('/');
                if (args.length > 0) {
                    var view = args[0];
                    if (vlist.indexOf(view) < 0) {
                        var param = args.length > 1 ? args[1] : '';
                        param = decodeURIComponent(param);
                        if (param != '') {
                            try {
                                config = JSON.parse(param);
                            } catch (e) {
                            }
                        }
                        //先进入首页，再进入hash页面
                        MiniQuery.Event.trigger(window, 'toview', ['Home', {
                            isHide: true,
                            fn: function () {
                                MiniQuery.Event.trigger(window, 'toview', [view, config[0]]);
                            }
                        }]);
                        return true;
                    }
                }
            }
            return false;
        }

        //是否需要进入分享页面
        function isShareView() {
            //导购订单分享
            var app = kdAppSet.getAppParam();
            var guideBillId = app.guideBillId;
            if (guideBillId) {
                return true;
            }
            //微信支付后 跳转到指定页面
            var toviewflag = app.toviewflag;
            if (toviewflag) {
                return true;
            }
            //商品详情分享
            var shareGoodsId = app.shareGoodsId;
            //采购员邀请
            var sharePhoneNum = app.sharePhoneNum;
            if (shareGoodsId) {
                return true;
            } else if (sharePhoneNum) {
                if (kdAppSet.getUserInfo().usertype != 0) {
                    return true;
                }
            }
            return false;
        }

        //检测是否已验证过身份
        function checkLogin(config) {
            var userinfo = kdAppSet.getUserInfo();
            if (userinfo.usertype != 0 || userinfo.senderMobile == '') {
                MiniQuery.Event.trigger(window, 'toview', ['Register', { toview: config }]);
                return false;
            }
            return true;
        }

        //微信分享跳转页面
        function showShareView() {
            var app = kdAppSet.getAppParam();
            //导购订单分享
            var guideBillId = app.guideBillId;

            //微信支付后 跳转到指定页面
            var toviewflag = app.toviewflag;
            if (toviewflag) {
                var arrList = toviewflag.split('|');
                var key = '';
                var value = '';
                if (arrList.length >= 1) {
                    key = arrList[0];
                }
                if (arrList.length >= 2) {
                    value = arrList[1];
                }
                if (key == 'OrderDetail') {
                    guideBillId = value;
                }
            }

            if (guideBillId) {
                if (checkLogin({ view: 'OrderDetail', id: guideBillId })) {

                    if (kdAppSet.isIPhoneSeries()) {
                        //处理微信支付后,点击回退再次回到支付页面
                        MiniQuery.Event.trigger(window, 'toview', ['Home', { isHide: true }]);
                        setTimeout(function () {
                            MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                                billId: guideBillId
                            }]);
                        }, 250);
                    } else {
                        MiniQuery.Event.trigger(window, 'toview', ['OrderDetail', {
                            billId: guideBillId
                        }]);
                    }

                }
                return;
            }

            //单品分享
            var shareGoodsId = app.shareGoodsId;
            //邀请采购员加入
            var sharePhoneNum = app.sharePhoneNum;
            if (shareGoodsId) {
                MiniQuery.Event.trigger(window, 'toview', ['GoodsDetail', {
                    shareGoodsId: shareGoodsId
                }]);
            } else if (sharePhoneNum) {
                if (kdAppSet.getUserInfo().usertype != 0) {
                    //没有身份信息才跳转到登录验证页面
                    MiniQuery.Event.trigger(window, 'toview', ['Register', {
                        sharePhoneNum: sharePhoneNum
                    }]);
                }
            }
        }

        if (!kdAppSet.isPcBrower() && !kdAppSet.getAppParam().isdebug) {
            if (!kdShare.is_weixinbrower()) {
                jConfirm("请在微信中使用微商城,否则只能简单浏览", null, function (flag) {
                    if (flag) {
                        //获取用户以及设置信息
                        getUserInfo();
                    } else {
                        kdAppSet.setKdLoading(false);
                    }
                }, { ok: "继续浏览", no: "退出" });
            } else {
                //获取用户以及设置信息
                getUserInfo();
            }
        } else {
            if (!kdShare.is_chromebrower()) {
                jAlert("请在谷歌浏览器中使用微商城轻应用!", "", function () {
                    var chromeUrl = 'http://rj.baidu.com/soft/detail/14744.html';
                    window.location.href = chromeUrl;
                });
                kdAppSet.setKdLoading(false);
                return;
            } else {
                //获取用户以及设置信息
                getUserInfo();
            }
        }

    })();
})();
