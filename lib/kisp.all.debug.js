
/*!
 * jQuery JavaScript Library v2.1.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-05-01T17:11Z
 */

(function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        // For CommonJS and CommonJS-like environments where a proper window is present,
        // execute the factory and get jQuery
        // For environments that do not inherently posses a window with a document
        // (such as Node.js), expose a jQuery-making factory as module.exports
        // This accentuates the need for the creation of a real window
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "jQuery requires a window with a document" );
                }
                return factory( w );
            };
    } else {
        factory( global );
    }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

    var arr = [];

    var slice = arr.slice;

    var concat = arr.concat;

    var push = arr.push;

    var indexOf = arr.indexOf;

    var class2type = {};

    var toString = class2type.toString;

    var hasOwn = class2type.hasOwnProperty;

    var support = {};



    var
    // Use the correct document accordingly with window argument (sandbox)
        document = window.document,

        version = "2.1.1",

    // Define a local copy of jQuery
        jQuery = function( selector, context ) {
            // The jQuery object is actually just the init constructor 'enhanced'
            // Need init if jQuery is called (just allow error to be thrown if not included)
            return new jQuery.fn.init( selector, context );
        },

    // Support: Android<4.1
    // Make sure we trim BOM and NBSP
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

    // Matches dashed string for camelizing
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,

    // Used by jQuery.camelCase as callback to replace()
        fcamelCase = function( all, letter ) {
            return letter.toUpperCase();
        };

    jQuery.fn = jQuery.prototype = {
        // The current version of jQuery being used
        jquery: version,

        constructor: jQuery,

        // Start with an empty selector
        selector: "",

        // The default length of a jQuery object is 0
        length: 0,

        toArray: function() {
            return slice.call( this );
        },

        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        get: function( num ) {
            return num != null ?

                // Return just the one element from the set
                ( num < 0 ? this[ num + this.length ] : this[ num ] ) :

                // Return all the elements in a clean array
                slice.call( this );
        },

        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack: function( elems ) {

            // Build a new jQuery matched element set
            var ret = jQuery.merge( this.constructor(), elems );

            // Add the old object onto the stack (as a reference)
            ret.prevObject = this;
            ret.context = this.context;

            // Return the newly-formed element set
            return ret;
        },

        // Execute a callback for every element in the matched set.
        // (You can seed the arguments with an array of args, but this is
        // only used internally.)
        each: function( callback, args ) {
            return jQuery.each( this, callback, args );
        },

        map: function( callback ) {
            return this.pushStack( jQuery.map(this, function( elem, i ) {
                return callback.call( elem, i, elem );
            }));
        },

        slice: function() {
            return this.pushStack( slice.apply( this, arguments ) );
        },

        first: function() {
            return this.eq( 0 );
        },

        last: function() {
            return this.eq( -1 );
        },

        eq: function( i ) {
            var len = this.length,
                j = +i + ( i < 0 ? len : 0 );
            return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
        },

        end: function() {
            return this.prevObject || this.constructor(null);
        },

        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push: push,
        sort: arr.sort,
        splice: arr.splice
    };

    jQuery.extend = jQuery.fn.extend = function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;

            // skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = jQuery.extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    jQuery.extend({
        // Unique for each copy of jQuery on the page
        expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

        // Assume jQuery is ready without the ready module
        isReady: true,

        error: function( msg ) {
            throw new Error( msg );
        },

        noop: function() {},

        // See test/unit/core.js for details concerning isFunction.
        // Since version 1.3, DOM methods and functions like alert
        // aren't supported. They return false on IE (#2968).
        isFunction: function( obj ) {
            return jQuery.type(obj) === "function";
        },

        isArray: Array.isArray,

        isWindow: function( obj ) {
            return obj != null && obj === obj.window;
        },

        isNumeric: function( obj ) {
            // parseFloat NaNs numeric-cast false positives (null|true|false|"")
            // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
            // subtraction forces infinities to NaN
            return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;
        },

        isPlainObject: function( obj ) {
            // Not plain objects:
            // - Any object or value whose internal [[Class]] property is not "[object Object]"
            // - DOM nodes
            // - window
            if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
                return false;
            }

            if ( obj.constructor &&
                !hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
                return false;
            }

            // If the function hasn't returned already, we're confident that
            // |obj| is a plain object, created by {} or constructed with new Object
            return true;
        },

        isEmptyObject: function( obj ) {
            var name;
            for ( name in obj ) {
                return false;
            }
            return true;
        },

        type: function( obj ) {
            if ( obj == null ) {
                return obj + "";
            }
            // Support: Android < 4.0, iOS < 6 (functionish RegExp)
            return typeof obj === "object" || typeof obj === "function" ?
                class2type[ toString.call(obj) ] || "object" :
                typeof obj;
        },

        // Evaluates a script in a global context
        globalEval: function( code ) {
            var script,
                indirect = eval;

            code = jQuery.trim( code );

            if ( code ) {
                // If the code includes a valid, prologue position
                // strict mode pragma, execute code by injecting a
                // script tag into the document.
                if ( code.indexOf("use strict") === 1 ) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild( script ).parentNode.removeChild( script );
                } else {
                    // Otherwise, avoid the DOM node creation, insertion
                    // and removal by using an indirect global eval
                    indirect( code );
                }
            }
        },

        // Convert dashed to camelCase; used by the css and data modules
        // Microsoft forgot to hump their vendor prefix (#9572)
        camelCase: function( string ) {
            return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
        },

        nodeName: function( elem, name ) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },

        // args is for internal usage only
        each: function( obj, callback, args ) {
            var value,
                i = 0,
                length = obj.length,
                isArray = isArraylike( obj );

            if ( args ) {
                if ( isArray ) {
                    for ( ; i < length; i++ ) {
                        value = callback.apply( obj[ i ], args );

                        if ( value === false ) {
                            break;
                        }
                    }
                } else {
                    for ( i in obj ) {
                        value = callback.apply( obj[ i ], args );

                        if ( value === false ) {
                            break;
                        }
                    }
                }

                // A special, fast, case for the most common use of each
            } else {
                if ( isArray ) {
                    for ( ; i < length; i++ ) {
                        value = callback.call( obj[ i ], i, obj[ i ] );

                        if ( value === false ) {
                            break;
                        }
                    }
                } else {
                    for ( i in obj ) {
                        value = callback.call( obj[ i ], i, obj[ i ] );

                        if ( value === false ) {
                            break;
                        }
                    }
                }
            }

            return obj;
        },

        // Support: Android<4.1
        trim: function( text ) {
            return text == null ?
                "" :
                ( text + "" ).replace( rtrim, "" );
        },

        // results is for internal usage only
        makeArray: function( arr, results ) {
            var ret = results || [];

            if ( arr != null ) {
                if ( isArraylike( Object(arr) ) ) {
                    jQuery.merge( ret,
                            typeof arr === "string" ?
                            [ arr ] : arr
                    );
                } else {
                    push.call( ret, arr );
                }
            }

            return ret;
        },

        inArray: function( elem, arr, i ) {
            return arr == null ? -1 : indexOf.call( arr, elem, i );
        },

        merge: function( first, second ) {
            var len = +second.length,
                j = 0,
                i = first.length;

            for ( ; j < len; j++ ) {
                first[ i++ ] = second[ j ];
            }

            first.length = i;

            return first;
        },

        grep: function( elems, callback, invert ) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;

            // Go through the array, only saving the items
            // that pass the validator function
            for ( ; i < length; i++ ) {
                callbackInverse = !callback( elems[ i ], i );
                if ( callbackInverse !== callbackExpect ) {
                    matches.push( elems[ i ] );
                }
            }

            return matches;
        },

        // arg is for internal usage only
        map: function( elems, callback, arg ) {
            var value,
                i = 0,
                length = elems.length,
                isArray = isArraylike( elems ),
                ret = [];

            // Go through the array, translating each of the items to their new values
            if ( isArray ) {
                for ( ; i < length; i++ ) {
                    value = callback( elems[ i ], i, arg );

                    if ( value != null ) {
                        ret.push( value );
                    }
                }

                // Go through every key on the object,
            } else {
                for ( i in elems ) {
                    value = callback( elems[ i ], i, arg );

                    if ( value != null ) {
                        ret.push( value );
                    }
                }
            }

            // Flatten any nested arrays
            return concat.apply( [], ret );
        },

        // A global GUID counter for objects
        guid: 1,

        // Bind a function to a context, optionally partially applying any
        // arguments.
        proxy: function( fn, context ) {
            var tmp, args, proxy;

            if ( typeof context === "string" ) {
                tmp = fn[ context ];
                context = fn;
                fn = tmp;
            }

            // Quick check to determine if target is callable, in the spec
            // this throws a TypeError, but we will just return undefined.
            if ( !jQuery.isFunction( fn ) ) {
                return undefined;
            }

            // Simulated bind
            args = slice.call( arguments, 2 );
            proxy = function() {
                return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
            };

            // Set the guid of unique handler to the same of original handler, so it can be removed
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;

            return proxy;
        },

        now: Date.now,

        // jQuery.support is not used in Core but other projects attach their
        // properties to it so it needs to exist.
        support: support
    });

// Populate the class2type map
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });

    function isArraylike( obj ) {
        var length = obj.length,
            type = jQuery.type( obj );

        if ( type === "function" || jQuery.isWindow( obj ) ) {
            return false;
        }

        if ( obj.nodeType === 1 && length ) {
            return true;
        }

        return type === "array" || length === 0 ||
            typeof length === "number" && length > 0 && ( length - 1 ) in obj;
    }
    var Sizzle =
        /*!
         * Sizzle CSS Selector Engine v1.10.19
         * http://sizzlejs.com/
         *
         * Copyright 2013 jQuery Foundation, Inc. and other contributors
         * Released under the MIT license
         * http://jquery.org/license
         *
         * Date: 2014-04-18
         */
        (function( window ) {

            var i,
                support,
                Expr,
                getText,
                isXML,
                tokenize,
                compile,
                select,
                outermostContext,
                sortInput,
                hasDuplicate,

            // Local document vars
                setDocument,
                document,
                docElem,
                documentIsHTML,
                rbuggyQSA,
                rbuggyMatches,
                matches,
                contains,

            // Instance-specific data
                expando = "sizzle" + -(new Date()),
                preferredDoc = window.document,
                dirruns = 0,
                done = 0,
                classCache = createCache(),
                tokenCache = createCache(),
                compilerCache = createCache(),
                sortOrder = function( a, b ) {
                    if ( a === b ) {
                        hasDuplicate = true;
                    }
                    return 0;
                },

            // General-purpose constants
                strundefined = typeof undefined,
                MAX_NEGATIVE = 1 << 31,

            // Instance methods
                hasOwn = ({}).hasOwnProperty,
                arr = [],
                pop = arr.pop,
                push_native = arr.push,
                push = arr.push,
                slice = arr.slice,
            // Use a stripped-down indexOf if we can't use a native one
                indexOf = arr.indexOf || function( elem ) {
                    var i = 0,
                        len = this.length;
                    for ( ; i < len; i++ ) {
                        if ( this[i] === elem ) {
                            return i;
                        }
                    }
                    return -1;
                },

                booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

            // Regular expressions

            // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
                whitespace = "[\\x20\\t\\r\\n\\f]",
            // http://www.w3.org/TR/css3-syntax/#characters
                characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

            // Loosely modeled on CSS identifier characters
            // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
            // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
                identifier = characterEncoding.replace( "w", "w#" ),

            // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
                attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
                    // Operator (capture 2)
                    "*([*^$|!~]?=)" + whitespace +
                    // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
                    "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
                    "*\\]",

                pseudos = ":(" + characterEncoding + ")(?:\\((" +
                    // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
                    // 1. quoted (capture 3; capture 4 or capture 5)
                    "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
                    // 2. simple (capture 6)
                    "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
                    // 3. anything else (capture 2)
                    ".*" +
                    ")\\)|)",

            // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
                rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

                rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
                rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

                rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

                rpseudo = new RegExp( pseudos ),
                ridentifier = new RegExp( "^" + identifier + "$" ),

                matchExpr = {
                    "ID": new RegExp( "^#(" + characterEncoding + ")" ),
                    "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
                    "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
                    "ATTR": new RegExp( "^" + attributes ),
                    "PSEUDO": new RegExp( "^" + pseudos ),
                    "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                        "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                        "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
                    "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
                    // For use in libraries implementing .is()
                    // We use this for POS matching in `select`
                    "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                        whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
                },

                rinputs = /^(?:input|select|textarea|button)$/i,
                rheader = /^h\d$/i,

                rnative = /^[^{]+\{\s*\[native \w/,

            // Easily-parseable/retrievable ID or TAG or CLASS selectors
                rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

                rsibling = /[+~]/,
                rescape = /'|\\/g,

            // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
                runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
                funescape = function( _, escaped, escapedWhitespace ) {
                    var high = "0x" + escaped - 0x10000;
                    // NaN means non-codepoint
                    // Support: Firefox<24
                    // Workaround erroneous numeric interpretation of +"0x"
                    return high !== high || escapedWhitespace ?
                        escaped :
                            high < 0 ?
                        // BMP codepoint
                        String.fromCharCode( high + 0x10000 ) :
                        // Supplemental Plane codepoint (surrogate pair)
                        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
                };

// Optimize for push.apply( _, NodeList )
            try {
                push.apply(
                    (arr = slice.call( preferredDoc.childNodes )),
                    preferredDoc.childNodes
                );
                // Support: Android<4.0
                // Detect silently failing push.apply
                arr[ preferredDoc.childNodes.length ].nodeType;
            } catch ( e ) {
                push = { apply: arr.length ?

                    // Leverage slice if possible
                    function( target, els ) {
                        push_native.apply( target, slice.call(els) );
                    } :

                    // Support: IE<9
                    // Otherwise append directly
                    function( target, els ) {
                        var j = target.length,
                            i = 0;
                        // Can't trust NodeList.length
                        while ( (target[j++] = els[i++]) ) {}
                        target.length = j - 1;
                    }
                };
            }

            function Sizzle( selector, context, results, seed ) {
                var match, elem, m, nodeType,
                // QSA vars
                    i, groups, old, nid, newContext, newSelector;

                if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
                    setDocument( context );
                }

                context = context || document;
                results = results || [];

                if ( !selector || typeof selector !== "string" ) {
                    return results;
                }

                if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
                    return [];
                }

                if ( documentIsHTML && !seed ) {

                    // Shortcuts
                    if ( (match = rquickExpr.exec( selector )) ) {
                        // Speed-up: Sizzle("#ID")
                        if ( (m = match[1]) ) {
                            if ( nodeType === 9 ) {
                                elem = context.getElementById( m );
                                // Check parentNode to catch when Blackberry 4.6 returns
                                // nodes that are no longer in the document (jQuery #6963)
                                if ( elem && elem.parentNode ) {
                                    // Handle the case where IE, Opera, and Webkit return items
                                    // by name instead of ID
                                    if ( elem.id === m ) {
                                        results.push( elem );
                                        return results;
                                    }
                                } else {
                                    return results;
                                }
                            } else {
                                // Context is not a document
                                if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
                                    contains( context, elem ) && elem.id === m ) {
                                    results.push( elem );
                                    return results;
                                }
                            }

                            // Speed-up: Sizzle("TAG")
                        } else if ( match[2] ) {
                            push.apply( results, context.getElementsByTagName( selector ) );
                            return results;

                            // Speed-up: Sizzle(".CLASS")
                        } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
                            push.apply( results, context.getElementsByClassName( m ) );
                            return results;
                        }
                    }

                    // QSA path
                    if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
                        nid = old = expando;
                        newContext = context;
                        newSelector = nodeType === 9 && selector;

                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        // IE 8 doesn't work on object elements
                        if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                            groups = tokenize( selector );

                            if ( (old = context.getAttribute("id")) ) {
                                nid = old.replace( rescape, "\\$&" );
                            } else {
                                context.setAttribute( "id", nid );
                            }
                            nid = "[id='" + nid + "'] ";

                            i = groups.length;
                            while ( i-- ) {
                                groups[i] = nid + toSelector( groups[i] );
                            }
                            newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
                            newSelector = groups.join(",");
                        }

                        if ( newSelector ) {
                            try {
                                push.apply( results,
                                    newContext.querySelectorAll( newSelector )
                                );
                                return results;
                            } catch(qsaError) {
                            } finally {
                                if ( !old ) {
                                    context.removeAttribute("id");
                                }
                            }
                        }
                    }
                }

                // All others
                return select( selector.replace( rtrim, "$1" ), context, results, seed );
            }

            /**
             * Create key-value caches of limited size
             * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
             *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
             *	deleting the oldest entry
             */
            function createCache() {
                var keys = [];

                function cache( key, value ) {
                    // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
                    if ( keys.push( key + " " ) > Expr.cacheLength ) {
                        // Only keep the most recent entries
                        delete cache[ keys.shift() ];
                    }
                    return (cache[ key + " " ] = value);
                }
                return cache;
            }

            /**
             * Mark a function for special use by Sizzle
             * @param {Function} fn The function to mark
             */
            function markFunction( fn ) {
                fn[ expando ] = true;
                return fn;
            }

            /**
             * Support testing using an element
             * @param {Function} fn Passed the created div and expects a boolean result
             */
            function assert( fn ) {
                var div = document.createElement("div");

                try {
                    return !!fn( div );
                } catch (e) {
                    return false;
                } finally {
                    // Remove from its parent by default
                    if ( div.parentNode ) {
                        div.parentNode.removeChild( div );
                    }
                    // release memory in IE
                    div = null;
                }
            }

            /**
             * Adds the same handler for all of the specified attrs
             * @param {String} attrs Pipe-separated list of attributes
             * @param {Function} handler The method that will be applied
             */
            function addHandle( attrs, handler ) {
                var arr = attrs.split("|"),
                    i = attrs.length;

                while ( i-- ) {
                    Expr.attrHandle[ arr[i] ] = handler;
                }
            }

            /**
             * Checks document order of two siblings
             * @param {Element} a
             * @param {Element} b
             * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
             */
            function siblingCheck( a, b ) {
                var cur = b && a,
                    diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
                        ( ~b.sourceIndex || MAX_NEGATIVE ) -
                        ( ~a.sourceIndex || MAX_NEGATIVE );

                // Use IE sourceIndex if available on both nodes
                if ( diff ) {
                    return diff;
                }

                // Check if b follows a
                if ( cur ) {
                    while ( (cur = cur.nextSibling) ) {
                        if ( cur === b ) {
                            return -1;
                        }
                    }
                }

                return a ? 1 : -1;
            }

            /**
             * Returns a function to use in pseudos for input types
             * @param {String} type
             */
            function createInputPseudo( type ) {
                return function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && elem.type === type;
                };
            }

            /**
             * Returns a function to use in pseudos for buttons
             * @param {String} type
             */
            function createButtonPseudo( type ) {
                return function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && elem.type === type;
                };
            }

            /**
             * Returns a function to use in pseudos for positionals
             * @param {Function} fn
             */
            function createPositionalPseudo( fn ) {
                return markFunction(function( argument ) {
                    argument = +argument;
                    return markFunction(function( seed, matches ) {
                        var j,
                            matchIndexes = fn( [], seed.length, argument ),
                            i = matchIndexes.length;

                        // Match elements found at the specified indexes
                        while ( i-- ) {
                            if ( seed[ (j = matchIndexes[i]) ] ) {
                                seed[j] = !(matches[j] = seed[j]);
                            }
                        }
                    });
                });
            }

            /**
             * Checks a node for validity as a Sizzle context
             * @param {Element|Object=} context
             * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
             */
            function testContext( context ) {
                return context && typeof context.getElementsByTagName !== strundefined && context;
            }

// Expose support vars for convenience
            support = Sizzle.support = {};

            /**
             * Detects XML nodes
             * @param {Element|Object} elem An element or a document
             * @returns {Boolean} True iff elem is a non-HTML XML node
             */
            isXML = Sizzle.isXML = function( elem ) {
                // documentElement is verified for cases where it doesn't yet exist
                // (such as loading iframes in IE - #4833)
                var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                return documentElement ? documentElement.nodeName !== "HTML" : false;
            };

            /**
             * Sets document-related variables once based on the current document
             * @param {Element|Object} [doc] An element or document object to use to set the document
             * @returns {Object} Returns the current document
             */
            setDocument = Sizzle.setDocument = function( node ) {
                var hasCompare,
                    doc = node ? node.ownerDocument || node : preferredDoc,
                    parent = doc.defaultView;

                // If no document and documentElement is available, return
                if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
                    return document;
                }

                // Set our document
                document = doc;
                docElem = doc.documentElement;

                // Support tests
                documentIsHTML = !isXML( doc );

                // Support: IE>8
                // If iframe document is assigned to "document" variable and if iframe has been reloaded,
                // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
                // IE6-8 do not support the defaultView property so parent will be undefined
                if ( parent && parent !== parent.top ) {
                    // IE11 does not have attachEvent, so all must suffer
                    if ( parent.addEventListener ) {
                        parent.addEventListener( "unload", function() {
                            setDocument();
                        }, false );
                    } else if ( parent.attachEvent ) {
                        parent.attachEvent( "onunload", function() {
                            setDocument();
                        });
                    }
                }

                /* Attributes
                 ---------------------------------------------------------------------- */

                // Support: IE<8
                // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
                support.attributes = assert(function( div ) {
                    div.className = "i";
                    return !div.getAttribute("className");
                });

                /* getElement(s)By*
                 ---------------------------------------------------------------------- */

                // Check if getElementsByTagName("*") returns only elements
                support.getElementsByTagName = assert(function( div ) {
                    div.appendChild( doc.createComment("") );
                    return !div.getElementsByTagName("*").length;
                });

                // Check if getElementsByClassName can be trusted
                support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
                    div.innerHTML = "<div class='a'></div><div class='a i'></div>";

                    // Support: Safari<4
                    // Catch class over-caching
                    div.firstChild.className = "i";
                    // Support: Opera<10
                    // Catch gEBCN failure to find non-leading classes
                    return div.getElementsByClassName("i").length === 2;
                });

                // Support: IE<10
                // Check if getElementById returns elements by name
                // The broken getElementById methods don't pick up programatically-set names,
                // so use a roundabout getElementsByName test
                support.getById = assert(function( div ) {
                    docElem.appendChild( div ).id = expando;
                    return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
                });

                // ID find and filter
                if ( support.getById ) {
                    Expr.find["ID"] = function( id, context ) {
                        if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
                            var m = context.getElementById( id );
                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document #6963
                            return m && m.parentNode ? [ m ] : [];
                        }
                    };
                    Expr.filter["ID"] = function( id ) {
                        var attrId = id.replace( runescape, funescape );
                        return function( elem ) {
                            return elem.getAttribute("id") === attrId;
                        };
                    };
                } else {
                    // Support: IE6/7
                    // getElementById is not reliable as a find shortcut
                    delete Expr.find["ID"];

                    Expr.filter["ID"] =  function( id ) {
                        var attrId = id.replace( runescape, funescape );
                        return function( elem ) {
                            var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                            return node && node.value === attrId;
                        };
                    };
                }

                // Tag
                Expr.find["TAG"] = support.getElementsByTagName ?
                    function( tag, context ) {
                        if ( typeof context.getElementsByTagName !== strundefined ) {
                            return context.getElementsByTagName( tag );
                        }
                    } :
                    function( tag, context ) {
                        var elem,
                            tmp = [],
                            i = 0,
                            results = context.getElementsByTagName( tag );

                        // Filter out possible comments
                        if ( tag === "*" ) {
                            while ( (elem = results[i++]) ) {
                                if ( elem.nodeType === 1 ) {
                                    tmp.push( elem );
                                }
                            }

                            return tmp;
                        }
                        return results;
                    };

                // Class
                Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
                    if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
                        return context.getElementsByClassName( className );
                    }
                };

                /* QSA/matchesSelector
                 ---------------------------------------------------------------------- */

                // QSA and matchesSelector support

                // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
                rbuggyMatches = [];

                // qSa(:focus) reports false when true (Chrome 21)
                // We allow this because of a bug in IE8/9 that throws an error
                // whenever `document.activeElement` is accessed on an iframe
                // So, we allow :focus to pass through QSA all the time to avoid the IE error
                // See http://bugs.jquery.com/ticket/13378
                rbuggyQSA = [];

                if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
                    // Build QSA regex
                    // Regex strategy adopted from Diego Perini
                    assert(function( div ) {
                        // Select is set to empty string on purpose
                        // This is to test IE's treatment of not explicitly
                        // setting a boolean content attribute,
                        // since its presence should be enough
                        // http://bugs.jquery.com/ticket/12359
                        div.innerHTML = "<select msallowclip=''><option selected=''></option></select>";

                        // Support: IE8, Opera 11-12.16
                        // Nothing should be selected when empty strings follow ^= or $= or *=
                        // The test attribute must be unknown in Opera but "safe" for WinRT
                        // http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
                        if ( div.querySelectorAll("[msallowclip^='']").length ) {
                            rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
                        }

                        // Support: IE8
                        // Boolean attributes and "value" are not treated correctly
                        if ( !div.querySelectorAll("[selected]").length ) {
                            rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
                        }

                        // Webkit/Opera - :checked should return selected option elements
                        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                        // IE8 throws error here and will not see later tests
                        if ( !div.querySelectorAll(":checked").length ) {
                            rbuggyQSA.push(":checked");
                        }
                    });

                    assert(function( div ) {
                        // Support: Windows 8 Native Apps
                        // The type and name attributes are restricted during .innerHTML assignment
                        var input = doc.createElement("input");
                        input.setAttribute( "type", "hidden" );
                        div.appendChild( input ).setAttribute( "name", "D" );

                        // Support: IE8
                        // Enforce case-sensitivity of name attribute
                        if ( div.querySelectorAll("[name=d]").length ) {
                            rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
                        }

                        // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                        // IE8 throws error here and will not see later tests
                        if ( !div.querySelectorAll(":enabled").length ) {
                            rbuggyQSA.push( ":enabled", ":disabled" );
                        }

                        // Opera 10-11 does not throw on post-comma invalid pseudos
                        div.querySelectorAll("*,:x");
                        rbuggyQSA.push(",.*:");
                    });
                }

                if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
                    docElem.webkitMatchesSelector ||
                    docElem.mozMatchesSelector ||
                    docElem.oMatchesSelector ||
                    docElem.msMatchesSelector) )) ) {

                    assert(function( div ) {
                        // Check to see if it's possible to do matchesSelector
                        // on a disconnected node (IE 9)
                        support.disconnectedMatch = matches.call( div, "div" );

                        // This should fail with an exception
                        // Gecko does not error, returns false instead
                        matches.call( div, "[s!='']:x" );
                        rbuggyMatches.push( "!=", pseudos );
                    });
                }

                rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
                rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

                /* Contains
                 ---------------------------------------------------------------------- */
                hasCompare = rnative.test( docElem.compareDocumentPosition );

                // Element contains another
                // Purposefully does not implement inclusive descendent
                // As in, an element does not contain itself
                contains = hasCompare || rnative.test( docElem.contains ) ?
                    function( a, b ) {
                        var adown = a.nodeType === 9 ? a.documentElement : a,
                            bup = b && b.parentNode;
                        return a === bup || !!( bup && bup.nodeType === 1 && (
                            adown.contains ?
                                adown.contains( bup ) :
                                a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
                            ));
                    } :
                    function( a, b ) {
                        if ( b ) {
                            while ( (b = b.parentNode) ) {
                                if ( b === a ) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };

                /* Sorting
                 ---------------------------------------------------------------------- */

                // Document order sorting
                sortOrder = hasCompare ?
                    function( a, b ) {

                        // Flag for duplicate removal
                        if ( a === b ) {
                            hasDuplicate = true;
                            return 0;
                        }

                        // Sort on method existence if only one input has compareDocumentPosition
                        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                        if ( compare ) {
                            return compare;
                        }

                        // Calculate position if both inputs belong to the same document
                        compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
                            a.compareDocumentPosition( b ) :

                            // Otherwise we know they are disconnected
                            1;

                        // Disconnected nodes
                        if ( compare & 1 ||
                            (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

                            // Choose the first element that is related to our preferred document
                            if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
                                return -1;
                            }
                            if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
                                return 1;
                            }

                            // Maintain original order
                            return sortInput ?
                                ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
                                0;
                        }

                        return compare & 4 ? -1 : 1;
                    } :
                    function( a, b ) {
                        // Exit early if the nodes are identical
                        if ( a === b ) {
                            hasDuplicate = true;
                            return 0;
                        }

                        var cur,
                            i = 0,
                            aup = a.parentNode,
                            bup = b.parentNode,
                            ap = [ a ],
                            bp = [ b ];

                        // Parentless nodes are either documents or disconnected
                        if ( !aup || !bup ) {
                            return a === doc ? -1 :
                                    b === doc ? 1 :
                                aup ? -1 :
                                    bup ? 1 :
                                        sortInput ?
                                            ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
                                            0;

                            // If the nodes are siblings, we can do a quick check
                        } else if ( aup === bup ) {
                            return siblingCheck( a, b );
                        }

                        // Otherwise we need full lists of their ancestors for comparison
                        cur = a;
                        while ( (cur = cur.parentNode) ) {
                            ap.unshift( cur );
                        }
                        cur = b;
                        while ( (cur = cur.parentNode) ) {
                            bp.unshift( cur );
                        }

                        // Walk down the tree looking for a discrepancy
                        while ( ap[i] === bp[i] ) {
                            i++;
                        }

                        return i ?
                            // Do a sibling check if the nodes have a common ancestor
                            siblingCheck( ap[i], bp[i] ) :

                            // Otherwise nodes in our document sort first
                                ap[i] === preferredDoc ? -1 :
                                bp[i] === preferredDoc ? 1 :
                            0;
                    };

                return doc;
            };

            Sizzle.matches = function( expr, elements ) {
                return Sizzle( expr, null, null, elements );
            };

            Sizzle.matchesSelector = function( elem, expr ) {
                // Set document vars if needed
                if ( ( elem.ownerDocument || elem ) !== document ) {
                    setDocument( elem );
                }

                // Make sure that attribute selectors are quoted
                expr = expr.replace( rattributeQuotes, "='$1']" );

                if ( support.matchesSelector && documentIsHTML &&
                    ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
                    ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

                    try {
                        var ret = matches.call( elem, expr );

                        // IE 9's matchesSelector returns false on disconnected nodes
                        if ( ret || support.disconnectedMatch ||
                            // As well, disconnected nodes are said to be in a document
                            // fragment in IE 9
                            elem.document && elem.document.nodeType !== 11 ) {
                            return ret;
                        }
                    } catch(e) {}
                }

                return Sizzle( expr, document, null, [ elem ] ).length > 0;
            };

            Sizzle.contains = function( context, elem ) {
                // Set document vars if needed
                if ( ( context.ownerDocument || context ) !== document ) {
                    setDocument( context );
                }
                return contains( context, elem );
            };

            Sizzle.attr = function( elem, name ) {
                // Set document vars if needed
                if ( ( elem.ownerDocument || elem ) !== document ) {
                    setDocument( elem );
                }

                var fn = Expr.attrHandle[ name.toLowerCase() ],
                // Don't get fooled by Object.prototype properties (jQuery #13807)
                    val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
                        fn( elem, name, !documentIsHTML ) :
                        undefined;

                return val !== undefined ?
                    val :
                        support.attributes || !documentIsHTML ?
                    elem.getAttribute( name ) :
                        (val = elem.getAttributeNode(name)) && val.specified ?
                    val.value :
                    null;
            };

            Sizzle.error = function( msg ) {
                throw new Error( "Syntax error, unrecognized expression: " + msg );
            };

            /**
             * Document sorting and removing duplicates
             * @param {ArrayLike} results
             */
            Sizzle.uniqueSort = function( results ) {
                var elem,
                    duplicates = [],
                    j = 0,
                    i = 0;

                // Unless we *know* we can detect duplicates, assume their presence
                hasDuplicate = !support.detectDuplicates;
                sortInput = !support.sortStable && results.slice( 0 );
                results.sort( sortOrder );

                if ( hasDuplicate ) {
                    while ( (elem = results[i++]) ) {
                        if ( elem === results[ i ] ) {
                            j = duplicates.push( i );
                        }
                    }
                    while ( j-- ) {
                        results.splice( duplicates[ j ], 1 );
                    }
                }

                // Clear input after sorting to release objects
                // See https://github.com/jquery/sizzle/pull/225
                sortInput = null;

                return results;
            };

            /**
             * Utility function for retrieving the text value of an array of DOM nodes
             * @param {Array|Element} elem
             */
            getText = Sizzle.getText = function( elem ) {
                var node,
                    ret = "",
                    i = 0,
                    nodeType = elem.nodeType;

                if ( !nodeType ) {
                    // If no nodeType, this is expected to be an array
                    while ( (node = elem[i++]) ) {
                        // Do not traverse comment nodes
                        ret += getText( node );
                    }
                } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
                    // Use textContent for elements
                    // innerText usage removed for consistency of new lines (jQuery #11153)
                    if ( typeof elem.textContent === "string" ) {
                        return elem.textContent;
                    } else {
                        // Traverse its children
                        for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                            ret += getText( elem );
                        }
                    }
                } else if ( nodeType === 3 || nodeType === 4 ) {
                    return elem.nodeValue;
                }
                // Do not include comment or processing instruction nodes

                return ret;
            };

            Expr = Sizzle.selectors = {

                // Can be adjusted by the user
                cacheLength: 50,

                createPseudo: markFunction,

                match: matchExpr,

                attrHandle: {},

                find: {},

                relative: {
                    ">": { dir: "parentNode", first: true },
                    " ": { dir: "parentNode" },
                    "+": { dir: "previousSibling", first: true },
                    "~": { dir: "previousSibling" }
                },

                preFilter: {
                    "ATTR": function( match ) {
                        match[1] = match[1].replace( runescape, funescape );

                        // Move the given value to match[3] whether quoted or unquoted
                        match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

                        if ( match[2] === "~=" ) {
                            match[3] = " " + match[3] + " ";
                        }

                        return match.slice( 0, 4 );
                    },

                    "CHILD": function( match ) {
                        /* matches from matchExpr["CHILD"]
                         1 type (only|nth|...)
                         2 what (child|of-type)
                         3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                         4 xn-component of xn+y argument ([+-]?\d*n|)
                         5 sign of xn-component
                         6 x of xn-component
                         7 sign of y-component
                         8 y of y-component
                         */
                        match[1] = match[1].toLowerCase();

                        if ( match[1].slice( 0, 3 ) === "nth" ) {
                            // nth-* requires argument
                            if ( !match[3] ) {
                                Sizzle.error( match[0] );
                            }

                            // numeric x and y parameters for Expr.filter.CHILD
                            // remember that false/true cast respectively to 0/1
                            match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                            match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

                            // other types prohibit arguments
                        } else if ( match[3] ) {
                            Sizzle.error( match[0] );
                        }

                        return match;
                    },

                    "PSEUDO": function( match ) {
                        var excess,
                            unquoted = !match[6] && match[2];

                        if ( matchExpr["CHILD"].test( match[0] ) ) {
                            return null;
                        }

                        // Accept quoted arguments as-is
                        if ( match[3] ) {
                            match[2] = match[4] || match[5] || "";

                            // Strip excess characters from unquoted arguments
                        } else if ( unquoted && rpseudo.test( unquoted ) &&
                            // Get excess from tokenize (recursively)
                            (excess = tokenize( unquoted, true )) &&
                            // advance to the next closing parenthesis
                            (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

                            // excess is a negative index
                            match[0] = match[0].slice( 0, excess );
                            match[2] = unquoted.slice( 0, excess );
                        }

                        // Return only captures needed by the pseudo filter method (type and argument)
                        return match.slice( 0, 3 );
                    }
                },

                filter: {

                    "TAG": function( nodeNameSelector ) {
                        var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
                        return nodeNameSelector === "*" ?
                            function() { return true; } :
                            function( elem ) {
                                return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                            };
                    },

                    "CLASS": function( className ) {
                        var pattern = classCache[ className + " " ];

                        return pattern ||
                            (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
                            classCache( className, function( elem ) {
                                return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
                            });
                    },

                    "ATTR": function( name, operator, check ) {
                        return function( elem ) {
                            var result = Sizzle.attr( elem, name );

                            if ( result == null ) {
                                return operator === "!=";
                            }
                            if ( !operator ) {
                                return true;
                            }

                            result += "";

                            return operator === "=" ? result === check :
                                    operator === "!=" ? result !== check :
                                    operator === "^=" ? check && result.indexOf( check ) === 0 :
                                    operator === "*=" ? check && result.indexOf( check ) > -1 :
                                    operator === "$=" ? check && result.slice( -check.length ) === check :
                                    operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
                                    operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
                                false;
                        };
                    },

                    "CHILD": function( type, what, argument, first, last ) {
                        var simple = type.slice( 0, 3 ) !== "nth",
                            forward = type.slice( -4 ) !== "last",
                            ofType = what === "of-type";

                        return first === 1 && last === 0 ?

                            // Shortcut for :nth-*(n)
                            function( elem ) {
                                return !!elem.parentNode;
                            } :

                            function( elem, context, xml ) {
                                var cache, outerCache, node, diff, nodeIndex, start,
                                    dir = simple !== forward ? "nextSibling" : "previousSibling",
                                    parent = elem.parentNode,
                                    name = ofType && elem.nodeName.toLowerCase(),
                                    useCache = !xml && !ofType;

                                if ( parent ) {

                                    // :(first|last|only)-(child|of-type)
                                    if ( simple ) {
                                        while ( dir ) {
                                            node = elem;
                                            while ( (node = node[ dir ]) ) {
                                                if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                                                    return false;
                                                }
                                            }
                                            // Reverse direction for :only-* (if we haven't yet done so)
                                            start = dir = type === "only" && !start && "nextSibling";
                                        }
                                        return true;
                                    }

                                    start = [ forward ? parent.firstChild : parent.lastChild ];

                                    // non-xml :nth-child(...) stores cache data on `parent`
                                    if ( forward && useCache ) {
                                        // Seek `elem` from a previously-cached index
                                        outerCache = parent[ expando ] || (parent[ expando ] = {});
                                        cache = outerCache[ type ] || [];
                                        nodeIndex = cache[0] === dirruns && cache[1];
                                        diff = cache[0] === dirruns && cache[2];
                                        node = nodeIndex && parent.childNodes[ nodeIndex ];

                                        while ( (node = ++nodeIndex && node && node[ dir ] ||

                                            // Fallback to seeking `elem` from the start
                                            (diff = nodeIndex = 0) || start.pop()) ) {

                                            // When found, cache indexes on `parent` and break
                                            if ( node.nodeType === 1 && ++diff && node === elem ) {
                                                outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                                                break;
                                            }
                                        }

                                        // Use previously-cached element index if available
                                    } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
                                        diff = cache[1];

                                        // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                                    } else {
                                        // Use the same loop as above to seek `elem` from the start
                                        while ( (node = ++nodeIndex && node && node[ dir ] ||
                                            (diff = nodeIndex = 0) || start.pop()) ) {

                                            if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                                                // Cache the index of each encountered element
                                                if ( useCache ) {
                                                    (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                                                }

                                                if ( node === elem ) {
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    // Incorporate the offset, then check against cycle size
                                    diff -= last;
                                    return diff === first || ( diff % first === 0 && diff / first >= 0 );
                                }
                            };
                    },

                    "PSEUDO": function( pseudo, argument ) {
                        // pseudo-class names are case-insensitive
                        // http://www.w3.org/TR/selectors/#pseudo-classes
                        // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                        // Remember that setFilters inherits from pseudos
                        var args,
                            fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
                                Sizzle.error( "unsupported pseudo: " + pseudo );

                        // The user may use createPseudo to indicate that
                        // arguments are needed to create the filter function
                        // just as Sizzle does
                        if ( fn[ expando ] ) {
                            return fn( argument );
                        }

                        // But maintain support for old signatures
                        if ( fn.length > 1 ) {
                            args = [ pseudo, pseudo, "", argument ];
                            return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
                                markFunction(function( seed, matches ) {
                                    var idx,
                                        matched = fn( seed, argument ),
                                        i = matched.length;
                                    while ( i-- ) {
                                        idx = indexOf.call( seed, matched[i] );
                                        seed[ idx ] = !( matches[ idx ] = matched[i] );
                                    }
                                }) :
                                function( elem ) {
                                    return fn( elem, 0, args );
                                };
                        }

                        return fn;
                    }
                },

                pseudos: {
                    // Potentially complex pseudos
                    "not": markFunction(function( selector ) {
                        // Trim the selector passed to compile
                        // to avoid treating leading and trailing
                        // spaces as combinators
                        var input = [],
                            results = [],
                            matcher = compile( selector.replace( rtrim, "$1" ) );

                        return matcher[ expando ] ?
                            markFunction(function( seed, matches, context, xml ) {
                                var elem,
                                    unmatched = matcher( seed, null, xml, [] ),
                                    i = seed.length;

                                // Match elements unmatched by `matcher`
                                while ( i-- ) {
                                    if ( (elem = unmatched[i]) ) {
                                        seed[i] = !(matches[i] = elem);
                                    }
                                }
                            }) :
                            function( elem, context, xml ) {
                                input[0] = elem;
                                matcher( input, null, xml, results );
                                return !results.pop();
                            };
                    }),

                    "has": markFunction(function( selector ) {
                        return function( elem ) {
                            return Sizzle( selector, elem ).length > 0;
                        };
                    }),

                    "contains": markFunction(function( text ) {
                        return function( elem ) {
                            return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
                        };
                    }),

                    // "Whether an element is represented by a :lang() selector
                    // is based solely on the element's language value
                    // being equal to the identifier C,
                    // or beginning with the identifier C immediately followed by "-".
                    // The matching of C against the element's language value is performed case-insensitively.
                    // The identifier C does not have to be a valid language name."
                    // http://www.w3.org/TR/selectors/#lang-pseudo
                    "lang": markFunction( function( lang ) {
                        // lang value must be a valid identifier
                        if ( !ridentifier.test(lang || "") ) {
                            Sizzle.error( "unsupported lang: " + lang );
                        }
                        lang = lang.replace( runescape, funescape ).toLowerCase();
                        return function( elem ) {
                            var elemLang;
                            do {
                                if ( (elemLang = documentIsHTML ?
                                    elem.lang :
                                    elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

                                    elemLang = elemLang.toLowerCase();
                                    return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
                                }
                            } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
                            return false;
                        };
                    }),

                    // Miscellaneous
                    "target": function( elem ) {
                        var hash = window.location && window.location.hash;
                        return hash && hash.slice( 1 ) === elem.id;
                    },

                    "root": function( elem ) {
                        return elem === docElem;
                    },

                    "focus": function( elem ) {
                        return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                    },

                    // Boolean properties
                    "enabled": function( elem ) {
                        return elem.disabled === false;
                    },

                    "disabled": function( elem ) {
                        return elem.disabled === true;
                    },

                    "checked": function( elem ) {
                        // In CSS3, :checked should return both checked and selected elements
                        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                        var nodeName = elem.nodeName.toLowerCase();
                        return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
                    },

                    "selected": function( elem ) {
                        // Accessing this property makes selected-by-default
                        // options in Safari work properly
                        if ( elem.parentNode ) {
                            elem.parentNode.selectedIndex;
                        }

                        return elem.selected === true;
                    },

                    // Contents
                    "empty": function( elem ) {
                        // http://www.w3.org/TR/selectors/#empty-pseudo
                        // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
                        //   but not by others (comment: 8; processing instruction: 7; etc.)
                        // nodeType < 6 works because attributes (2) do not appear as children
                        for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                            if ( elem.nodeType < 6 ) {
                                return false;
                            }
                        }
                        return true;
                    },

                    "parent": function( elem ) {
                        return !Expr.pseudos["empty"]( elem );
                    },

                    // Element/input types
                    "header": function( elem ) {
                        return rheader.test( elem.nodeName );
                    },

                    "input": function( elem ) {
                        return rinputs.test( elem.nodeName );
                    },

                    "button": function( elem ) {
                        var name = elem.nodeName.toLowerCase();
                        return name === "input" && elem.type === "button" || name === "button";
                    },

                    "text": function( elem ) {
                        var attr;
                        return elem.nodeName.toLowerCase() === "input" &&
                            elem.type === "text" &&

                            // Support: IE<8
                            // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
                            ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
                    },

                    // Position-in-collection
                    "first": createPositionalPseudo(function() {
                        return [ 0 ];
                    }),

                    "last": createPositionalPseudo(function( matchIndexes, length ) {
                        return [ length - 1 ];
                    }),

                    "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
                        return [ argument < 0 ? argument + length : argument ];
                    }),

                    "even": createPositionalPseudo(function( matchIndexes, length ) {
                        var i = 0;
                        for ( ; i < length; i += 2 ) {
                            matchIndexes.push( i );
                        }
                        return matchIndexes;
                    }),

                    "odd": createPositionalPseudo(function( matchIndexes, length ) {
                        var i = 1;
                        for ( ; i < length; i += 2 ) {
                            matchIndexes.push( i );
                        }
                        return matchIndexes;
                    }),

                    "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
                        var i = argument < 0 ? argument + length : argument;
                        for ( ; --i >= 0; ) {
                            matchIndexes.push( i );
                        }
                        return matchIndexes;
                    }),

                    "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
                        var i = argument < 0 ? argument + length : argument;
                        for ( ; ++i < length; ) {
                            matchIndexes.push( i );
                        }
                        return matchIndexes;
                    })
                }
            };

            Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
            for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
                Expr.pseudos[ i ] = createInputPseudo( i );
            }
            for ( i in { submit: true, reset: true } ) {
                Expr.pseudos[ i ] = createButtonPseudo( i );
            }

// Easy API for creating new setFilters
            function setFilters() {}
            setFilters.prototype = Expr.filters = Expr.pseudos;
            Expr.setFilters = new setFilters();

            tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
                var matched, match, tokens, type,
                    soFar, groups, preFilters,
                    cached = tokenCache[ selector + " " ];

                if ( cached ) {
                    return parseOnly ? 0 : cached.slice( 0 );
                }

                soFar = selector;
                groups = [];
                preFilters = Expr.preFilter;

                while ( soFar ) {

                    // Comma and first run
                    if ( !matched || (match = rcomma.exec( soFar )) ) {
                        if ( match ) {
                            // Don't consume trailing commas as valid
                            soFar = soFar.slice( match[0].length ) || soFar;
                        }
                        groups.push( (tokens = []) );
                    }

                    matched = false;

                    // Combinators
                    if ( (match = rcombinators.exec( soFar )) ) {
                        matched = match.shift();
                        tokens.push({
                            value: matched,
                            // Cast descendant combinators to space
                            type: match[0].replace( rtrim, " " )
                        });
                        soFar = soFar.slice( matched.length );
                    }

                    // Filters
                    for ( type in Expr.filter ) {
                        if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
                            (match = preFilters[ type ]( match ))) ) {
                            matched = match.shift();
                            tokens.push({
                                value: matched,
                                type: type,
                                matches: match
                            });
                            soFar = soFar.slice( matched.length );
                        }
                    }

                    if ( !matched ) {
                        break;
                    }
                }

                // Return the length of the invalid excess
                // if we're just parsing
                // Otherwise, throw an error or return tokens
                return parseOnly ?
                    soFar.length :
                    soFar ?
                        Sizzle.error( selector ) :
                        // Cache the tokens
                        tokenCache( selector, groups ).slice( 0 );
            };

            function toSelector( tokens ) {
                var i = 0,
                    len = tokens.length,
                    selector = "";
                for ( ; i < len; i++ ) {
                    selector += tokens[i].value;
                }
                return selector;
            }

            function addCombinator( matcher, combinator, base ) {
                var dir = combinator.dir,
                    checkNonElements = base && dir === "parentNode",
                    doneName = done++;

                return combinator.first ?
                    // Check against closest ancestor/preceding element
                    function( elem, context, xml ) {
                        while ( (elem = elem[ dir ]) ) {
                            if ( elem.nodeType === 1 || checkNonElements ) {
                                return matcher( elem, context, xml );
                            }
                        }
                    } :

                    // Check against all ancestor/preceding elements
                    function( elem, context, xml ) {
                        var oldCache, outerCache,
                            newCache = [ dirruns, doneName ];

                        // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
                        if ( xml ) {
                            while ( (elem = elem[ dir ]) ) {
                                if ( elem.nodeType === 1 || checkNonElements ) {
                                    if ( matcher( elem, context, xml ) ) {
                                        return true;
                                    }
                                }
                            }
                        } else {
                            while ( (elem = elem[ dir ]) ) {
                                if ( elem.nodeType === 1 || checkNonElements ) {
                                    outerCache = elem[ expando ] || (elem[ expando ] = {});
                                    if ( (oldCache = outerCache[ dir ]) &&
                                        oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

                                        // Assign to newCache so results back-propagate to previous elements
                                        return (newCache[ 2 ] = oldCache[ 2 ]);
                                    } else {
                                        // Reuse newcache so results back-propagate to previous elements
                                        outerCache[ dir ] = newCache;

                                        // A match means we're done; a fail means we have to keep checking
                                        if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    };
            }

            function elementMatcher( matchers ) {
                return matchers.length > 1 ?
                    function( elem, context, xml ) {
                        var i = matchers.length;
                        while ( i-- ) {
                            if ( !matchers[i]( elem, context, xml ) ) {
                                return false;
                            }
                        }
                        return true;
                    } :
                    matchers[0];
            }

            function multipleContexts( selector, contexts, results ) {
                var i = 0,
                    len = contexts.length;
                for ( ; i < len; i++ ) {
                    Sizzle( selector, contexts[i], results );
                }
                return results;
            }

            function condense( unmatched, map, filter, context, xml ) {
                var elem,
                    newUnmatched = [],
                    i = 0,
                    len = unmatched.length,
                    mapped = map != null;

                for ( ; i < len; i++ ) {
                    if ( (elem = unmatched[i]) ) {
                        if ( !filter || filter( elem, context, xml ) ) {
                            newUnmatched.push( elem );
                            if ( mapped ) {
                                map.push( i );
                            }
                        }
                    }
                }

                return newUnmatched;
            }

            function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
                if ( postFilter && !postFilter[ expando ] ) {
                    postFilter = setMatcher( postFilter );
                }
                if ( postFinder && !postFinder[ expando ] ) {
                    postFinder = setMatcher( postFinder, postSelector );
                }
                return markFunction(function( seed, results, context, xml ) {
                    var temp, i, elem,
                        preMap = [],
                        postMap = [],
                        preexisting = results.length,

                    // Get initial elements from seed or context
                        elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

                    // Prefilter to get matcher input, preserving a map for seed-results synchronization
                        matcherIn = preFilter && ( seed || !selector ) ?
                            condense( elems, preMap, preFilter, context, xml ) :
                            elems,

                        matcherOut = matcher ?
                            // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                                postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

                            // ...intermediate processing is necessary
                            [] :

                            // ...otherwise use results directly
                            results :
                            matcherIn;

                    // Find primary matches
                    if ( matcher ) {
                        matcher( matcherIn, matcherOut, context, xml );
                    }

                    // Apply postFilter
                    if ( postFilter ) {
                        temp = condense( matcherOut, postMap );
                        postFilter( temp, [], context, xml );

                        // Un-match failing elements by moving them back to matcherIn
                        i = temp.length;
                        while ( i-- ) {
                            if ( (elem = temp[i]) ) {
                                matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
                            }
                        }
                    }

                    if ( seed ) {
                        if ( postFinder || preFilter ) {
                            if ( postFinder ) {
                                // Get the final matcherOut by condensing this intermediate into postFinder contexts
                                temp = [];
                                i = matcherOut.length;
                                while ( i-- ) {
                                    if ( (elem = matcherOut[i]) ) {
                                        // Restore matcherIn since elem is not yet a final match
                                        temp.push( (matcherIn[i] = elem) );
                                    }
                                }
                                postFinder( null, (matcherOut = []), temp, xml );
                            }

                            // Move matched elements from seed to results to keep them synchronized
                            i = matcherOut.length;
                            while ( i-- ) {
                                if ( (elem = matcherOut[i]) &&
                                    (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

                                    seed[temp] = !(results[temp] = elem);
                                }
                            }
                        }

                        // Add elements to results, through postFinder if defined
                    } else {
                        matcherOut = condense(
                                matcherOut === results ?
                                matcherOut.splice( preexisting, matcherOut.length ) :
                                matcherOut
                        );
                        if ( postFinder ) {
                            postFinder( null, results, matcherOut, xml );
                        } else {
                            push.apply( results, matcherOut );
                        }
                    }
                });
            }

            function matcherFromTokens( tokens ) {
                var checkContext, matcher, j,
                    len = tokens.length,
                    leadingRelative = Expr.relative[ tokens[0].type ],
                    implicitRelative = leadingRelative || Expr.relative[" "],
                    i = leadingRelative ? 1 : 0,

                // The foundational matcher ensures that elements are reachable from top-level context(s)
                    matchContext = addCombinator( function( elem ) {
                        return elem === checkContext;
                    }, implicitRelative, true ),
                    matchAnyContext = addCombinator( function( elem ) {
                        return indexOf.call( checkContext, elem ) > -1;
                    }, implicitRelative, true ),
                    matchers = [ function( elem, context, xml ) {
                        return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
                            (checkContext = context).nodeType ?
                                matchContext( elem, context, xml ) :
                                matchAnyContext( elem, context, xml ) );
                    } ];

                for ( ; i < len; i++ ) {
                    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
                        matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
                    } else {
                        matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

                        // Return special upon seeing a positional matcher
                        if ( matcher[ expando ] ) {
                            // Find the next relative operator (if any) for proper handling
                            j = ++i;
                            for ( ; j < len; j++ ) {
                                if ( Expr.relative[ tokens[j].type ] ) {
                                    break;
                                }
                            }
                            return setMatcher(
                                    i > 1 && elementMatcher( matchers ),
                                    i > 1 && toSelector(
                                    // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                                    tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
                                ).replace( rtrim, "$1" ),
                                matcher,
                                    i < j && matcherFromTokens( tokens.slice( i, j ) ),
                                    j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
                                    j < len && toSelector( tokens )
                            );
                        }
                        matchers.push( matcher );
                    }
                }

                return elementMatcher( matchers );
            }

            function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
                var bySet = setMatchers.length > 0,
                    byElement = elementMatchers.length > 0,
                    superMatcher = function( seed, context, xml, results, outermost ) {
                        var elem, j, matcher,
                            matchedCount = 0,
                            i = "0",
                            unmatched = seed && [],
                            setMatched = [],
                            contextBackup = outermostContext,
                        // We must always have either seed elements or outermost context
                            elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
                        // Use integer dirruns iff this is the outermost matcher
                            dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
                            len = elems.length;

                        if ( outermost ) {
                            outermostContext = context !== document && context;
                        }

                        // Add elements passing elementMatchers directly to results
                        // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
                        // Support: IE<9, Safari
                        // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
                        for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
                            if ( byElement && elem ) {
                                j = 0;
                                while ( (matcher = elementMatchers[j++]) ) {
                                    if ( matcher( elem, context, xml ) ) {
                                        results.push( elem );
                                        break;
                                    }
                                }
                                if ( outermost ) {
                                    dirruns = dirrunsUnique;
                                }
                            }

                            // Track unmatched elements for set filters
                            if ( bySet ) {
                                // They will have gone through all possible matchers
                                if ( (elem = !matcher && elem) ) {
                                    matchedCount--;
                                }

                                // Lengthen the array for every element, matched or not
                                if ( seed ) {
                                    unmatched.push( elem );
                                }
                            }
                        }

                        // Apply set filters to unmatched elements
                        matchedCount += i;
                        if ( bySet && i !== matchedCount ) {
                            j = 0;
                            while ( (matcher = setMatchers[j++]) ) {
                                matcher( unmatched, setMatched, context, xml );
                            }

                            if ( seed ) {
                                // Reintegrate element matches to eliminate the need for sorting
                                if ( matchedCount > 0 ) {
                                    while ( i-- ) {
                                        if ( !(unmatched[i] || setMatched[i]) ) {
                                            setMatched[i] = pop.call( results );
                                        }
                                    }
                                }

                                // Discard index placeholder values to get only actual matches
                                setMatched = condense( setMatched );
                            }

                            // Add matches to results
                            push.apply( results, setMatched );

                            // Seedless set matches succeeding multiple successful matchers stipulate sorting
                            if ( outermost && !seed && setMatched.length > 0 &&
                                ( matchedCount + setMatchers.length ) > 1 ) {

                                Sizzle.uniqueSort( results );
                            }
                        }

                        // Override manipulation of globals by nested matchers
                        if ( outermost ) {
                            dirruns = dirrunsUnique;
                            outermostContext = contextBackup;
                        }

                        return unmatched;
                    };

                return bySet ?
                    markFunction( superMatcher ) :
                    superMatcher;
            }

            compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
                var i,
                    setMatchers = [],
                    elementMatchers = [],
                    cached = compilerCache[ selector + " " ];

                if ( !cached ) {
                    // Generate a function of recursive functions that can be used to check each element
                    if ( !match ) {
                        match = tokenize( selector );
                    }
                    i = match.length;
                    while ( i-- ) {
                        cached = matcherFromTokens( match[i] );
                        if ( cached[ expando ] ) {
                            setMatchers.push( cached );
                        } else {
                            elementMatchers.push( cached );
                        }
                    }

                    // Cache the compiled function
                    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

                    // Save selector and tokenization
                    cached.selector = selector;
                }
                return cached;
            };

            /**
             * A low-level selection function that works with Sizzle's compiled
             *  selector functions
             * @param {String|Function} selector A selector or a pre-compiled
             *  selector function built with Sizzle.compile
             * @param {Element} context
             * @param {Array} [results]
             * @param {Array} [seed] A set of elements to match against
             */
            select = Sizzle.select = function( selector, context, results, seed ) {
                var i, tokens, token, type, find,
                    compiled = typeof selector === "function" && selector,
                    match = !seed && tokenize( (selector = compiled.selector || selector) );

                results = results || [];

                // Try to minimize operations if there is no seed and only one group
                if ( match.length === 1 ) {

                    // Take a shortcut and set the context if the root selector is an ID
                    tokens = match[0] = match[0].slice( 0 );
                    if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                        support.getById && context.nodeType === 9 && documentIsHTML &&
                        Expr.relative[ tokens[1].type ] ) {

                        context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
                        if ( !context ) {
                            return results;

                            // Precompiled matchers will still verify ancestry, so step up a level
                        } else if ( compiled ) {
                            context = context.parentNode;
                        }

                        selector = selector.slice( tokens.shift().value.length );
                    }

                    // Fetch a seed set for right-to-left matching
                    i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
                    while ( i-- ) {
                        token = tokens[i];

                        // Abort if we hit a combinator
                        if ( Expr.relative[ (type = token.type) ] ) {
                            break;
                        }
                        if ( (find = Expr.find[ type ]) ) {
                            // Search, expanding context for leading sibling combinators
                            if ( (seed = find(
                                token.matches[0].replace( runescape, funescape ),
                                    rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
                            )) ) {

                                // If seed is empty or no tokens remain, we can return early
                                tokens.splice( i, 1 );
                                selector = seed.length && toSelector( tokens );
                                if ( !selector ) {
                                    push.apply( results, seed );
                                    return results;
                                }

                                break;
                            }
                        }
                    }
                }

                // Compile and execute a filtering function if one is not provided
                // Provide `match` to avoid retokenization if we modified the selector above
                ( compiled || compile( selector, match ) )(
                    seed,
                    context,
                    !documentIsHTML,
                    results,
                        rsibling.test( selector ) && testContext( context.parentNode ) || context
                );
                return results;
            };

// One-time assignments

// Sort stability
            support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
            support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
            setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
            support.sortDetached = assert(function( div1 ) {
                // Should return 1, but returns 4 (following)
                return div1.compareDocumentPosition( document.createElement("div") ) & 1;
            });

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
            if ( !assert(function( div ) {
                div.innerHTML = "<a href='#'></a>";
                return div.firstChild.getAttribute("href") === "#" ;
            }) ) {
                addHandle( "type|href|height|width", function( elem, name, isXML ) {
                    if ( !isXML ) {
                        return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
                    }
                });
            }

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
            if ( !support.attributes || !assert(function( div ) {
                div.innerHTML = "<input/>";
                div.firstChild.setAttribute( "value", "" );
                return div.firstChild.getAttribute( "value" ) === "";
            }) ) {
                addHandle( "value", function( elem, name, isXML ) {
                    if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
                        return elem.defaultValue;
                    }
                });
            }

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
            if ( !assert(function( div ) {
                return div.getAttribute("disabled") == null;
            }) ) {
                addHandle( booleans, function( elem, name, isXML ) {
                    var val;
                    if ( !isXML ) {
                        return elem[ name ] === true ? name.toLowerCase() :
                                (val = elem.getAttributeNode( name )) && val.specified ?
                            val.value :
                            null;
                    }
                });
            }

            return Sizzle;

        })( window );



    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;
    jQuery.expr[":"] = jQuery.expr.pseudos;
    jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;



    var rneedsContext = jQuery.expr.match.needsContext;

    var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



    var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
    function winnow( elements, qualifier, not ) {
        if ( jQuery.isFunction( qualifier ) ) {
            return jQuery.grep( elements, function( elem, i ) {
                /* jshint -W018 */
                return !!qualifier.call( elem, i, elem ) !== not;
            });

        }

        if ( qualifier.nodeType ) {
            return jQuery.grep( elements, function( elem ) {
                return ( elem === qualifier ) !== not;
            });

        }

        if ( typeof qualifier === "string" ) {
            if ( risSimple.test( qualifier ) ) {
                return jQuery.filter( qualifier, elements, not );
            }

            qualifier = jQuery.filter( qualifier, elements );
        }

        return jQuery.grep( elements, function( elem ) {
            return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
        });
    }

    jQuery.filter = function( expr, elems, not ) {
        var elem = elems[ 0 ];

        if ( not ) {
            expr = ":not(" + expr + ")";
        }

        return elems.length === 1 && elem.nodeType === 1 ?
            jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
            jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
                return elem.nodeType === 1;
            }));
    };

    jQuery.fn.extend({
        find: function( selector ) {
            var i,
                len = this.length,
                ret = [],
                self = this;

            if ( typeof selector !== "string" ) {
                return this.pushStack( jQuery( selector ).filter(function() {
                    for ( i = 0; i < len; i++ ) {
                        if ( jQuery.contains( self[ i ], this ) ) {
                            return true;
                        }
                    }
                }) );
            }

            for ( i = 0; i < len; i++ ) {
                jQuery.find( selector, self[ i ], ret );
            }

            // Needed because $( selector, context ) becomes $( context ).find( selector )
            ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
            ret.selector = this.selector ? this.selector + " " + selector : selector;
            return ret;
        },
        filter: function( selector ) {
            return this.pushStack( winnow(this, selector || [], false) );
        },
        not: function( selector ) {
            return this.pushStack( winnow(this, selector || [], true) );
        },
        is: function( selector ) {
            return !!winnow(
                this,

                // If this is a positional/relative selector, check membership in the returned set
                // so $("p:first").is("p:last") won't return true for a doc with two "p".
                    typeof selector === "string" && rneedsContext.test( selector ) ?
                    jQuery( selector ) :
                    selector || [],
                false
            ).length;
        }
    });


// Initialize a jQuery object


// A central reference to the root jQuery(document)
    var rootjQuery,

    // A simple way to check for HTML strings
    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    // Strict HTML recognition (#11290: must start with <)
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

        init = jQuery.fn.init = function( selector, context ) {
            var match, elem;

            // HANDLE: $(""), $(null), $(undefined), $(false)
            if ( !selector ) {
                return this;
            }

            // Handle HTML strings
            if ( typeof selector === "string" ) {
                if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
                    // Assume that strings that start and end with <> are HTML and skip the regex check
                    match = [ null, selector, null ];

                } else {
                    match = rquickExpr.exec( selector );
                }

                // Match html or make sure no context is specified for #id
                if ( match && (match[1] || !context) ) {

                    // HANDLE: $(html) -> $(array)
                    if ( match[1] ) {
                        context = context instanceof jQuery ? context[0] : context;

                        // scripts is true for back-compat
                        // Intentionally let the error be thrown if parseHTML is not present
                        jQuery.merge( this, jQuery.parseHTML(
                            match[1],
                                context && context.nodeType ? context.ownerDocument || context : document,
                            true
                        ) );

                        // HANDLE: $(html, props)
                        if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
                            for ( match in context ) {
                                // Properties of context are called as methods if possible
                                if ( jQuery.isFunction( this[ match ] ) ) {
                                    this[ match ]( context[ match ] );

                                    // ...and otherwise set as attributes
                                } else {
                                    this.attr( match, context[ match ] );
                                }
                            }
                        }

                        return this;

                        // HANDLE: $(#id)
                    } else {
                        elem = document.getElementById( match[2] );

                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        if ( elem && elem.parentNode ) {
                            // Inject the element directly into the jQuery object
                            this.length = 1;
                            this[0] = elem;
                        }

                        this.context = document;
                        this.selector = selector;
                        return this;
                    }

                    // HANDLE: $(expr, $(...))
                } else if ( !context || context.jquery ) {
                    return ( context || rootjQuery ).find( selector );

                    // HANDLE: $(expr, context)
                    // (which is just equivalent to: $(context).find(expr)
                } else {
                    return this.constructor( context ).find( selector );
                }

                // HANDLE: $(DOMElement)
            } else if ( selector.nodeType ) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;

                // HANDLE: $(function)
                // Shortcut for document ready
            } else if ( jQuery.isFunction( selector ) ) {
                return typeof rootjQuery.ready !== "undefined" ?
                    rootjQuery.ready( selector ) :
                    // Execute immediately if ready is not present
                    selector( jQuery );
            }

            if ( selector.selector !== undefined ) {
                this.selector = selector.selector;
                this.context = selector.context;
            }

            return jQuery.makeArray( selector, this );
        };

// Give the init function the jQuery prototype for later instantiation
    init.prototype = jQuery.fn;

// Initialize central reference
    rootjQuery = jQuery( document );


    var rparentsprev = /^(?:parents|prev(?:Until|All))/,
    // methods guaranteed to produce a unique set when starting from a unique set
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };

    jQuery.extend({
        dir: function( elem, dir, until ) {
            var matched = [],
                truncate = until !== undefined;

            while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
                if ( elem.nodeType === 1 ) {
                    if ( truncate && jQuery( elem ).is( until ) ) {
                        break;
                    }
                    matched.push( elem );
                }
            }
            return matched;
        },

        sibling: function( n, elem ) {
            var matched = [];

            for ( ; n; n = n.nextSibling ) {
                if ( n.nodeType === 1 && n !== elem ) {
                    matched.push( n );
                }
            }

            return matched;
        }
    });

    jQuery.fn.extend({
        has: function( target ) {
            var targets = jQuery( target, this ),
                l = targets.length;

            return this.filter(function() {
                var i = 0;
                for ( ; i < l; i++ ) {
                    if ( jQuery.contains( this, targets[i] ) ) {
                        return true;
                    }
                }
            });
        },

        closest: function( selectors, context ) {
            var cur,
                i = 0,
                l = this.length,
                matched = [],
                pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
                    jQuery( selectors, context || this.context ) :
                    0;

            for ( ; i < l; i++ ) {
                for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
                    // Always skip document fragments
                    if ( cur.nodeType < 11 && (pos ?
                        pos.index(cur) > -1 :

                        // Don't pass non-elements to Sizzle
                        cur.nodeType === 1 &&
                        jQuery.find.matchesSelector(cur, selectors)) ) {

                        matched.push( cur );
                        break;
                    }
                }
            }

            return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
        },

        // Determine the position of an element within
        // the matched set of elements
        index: function( elem ) {

            // No argument, return index in parent
            if ( !elem ) {
                return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
            }

            // index in selector
            if ( typeof elem === "string" ) {
                return indexOf.call( jQuery( elem ), this[ 0 ] );
            }

            // Locate the position of the desired element
            return indexOf.call( this,

                // If it receives a jQuery object, the first element is used
                elem.jquery ? elem[ 0 ] : elem
            );
        },

        add: function( selector, context ) {
            return this.pushStack(
                jQuery.unique(
                    jQuery.merge( this.get(), jQuery( selector, context ) )
                )
            );
        },

        addBack: function( selector ) {
            return this.add( selector == null ?
                    this.prevObject : this.prevObject.filter(selector)
            );
        }
    });

    function sibling( cur, dir ) {
        while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
        return cur;
    }

    jQuery.each({
        parent: function( elem ) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function( elem ) {
            return jQuery.dir( elem, "parentNode" );
        },
        parentsUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "parentNode", until );
        },
        next: function( elem ) {
            return sibling( elem, "nextSibling" );
        },
        prev: function( elem ) {
            return sibling( elem, "previousSibling" );
        },
        nextAll: function( elem ) {
            return jQuery.dir( elem, "nextSibling" );
        },
        prevAll: function( elem ) {
            return jQuery.dir( elem, "previousSibling" );
        },
        nextUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "nextSibling", until );
        },
        prevUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "previousSibling", until );
        },
        siblings: function( elem ) {
            return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
        },
        children: function( elem ) {
            return jQuery.sibling( elem.firstChild );
        },
        contents: function( elem ) {
            return elem.contentDocument || jQuery.merge( [], elem.childNodes );
        }
    }, function( name, fn ) {
        jQuery.fn[ name ] = function( until, selector ) {
            var matched = jQuery.map( this, fn, until );

            if ( name.slice( -5 ) !== "Until" ) {
                selector = until;
            }

            if ( selector && typeof selector === "string" ) {
                matched = jQuery.filter( selector, matched );
            }

            if ( this.length > 1 ) {
                // Remove duplicates
                if ( !guaranteedUnique[ name ] ) {
                    jQuery.unique( matched );
                }

                // Reverse order for parents* and prev-derivatives
                if ( rparentsprev.test( name ) ) {
                    matched.reverse();
                }
            }

            return this.pushStack( matched );
        };
    });
    var rnotwhite = (/\S+/g);



// String to Object options format cache
    var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
    function createOptions( options ) {
        var object = optionsCache[ options ] = {};
        jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
            object[ flag ] = true;
        });
        return object;
    }

    /*
     * Create a callback list using the following parameters:
     *
     *	options: an optional list of space-separated options that will change how
     *			the callback list behaves or a more traditional option object
     *
     * By default a callback list will act like an event callback list and can be
     * "fired" multiple times.
     *
     * Possible options:
     *
     *	once:			will ensure the callback list can only be fired once (like a Deferred)
     *
     *	memory:			will keep track of previous values and will call any callback added
     *					after the list has been fired right away with the latest "memorized"
     *					values (like a Deferred)
     *
     *	unique:			will ensure a callback can only be added once (no duplicate in the list)
     *
     *	stopOnFalse:	interrupt callings when a callback returns false
     *
     */
    jQuery.Callbacks = function( options ) {

        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === "string" ?
            ( optionsCache[ options ] || createOptions( options ) ) :
            jQuery.extend( {}, options );

        var // Last fire value (for non-forgettable lists)
            memory,
        // Flag to know if list was already fired
            fired,
        // Flag to know if list is currently firing
            firing,
        // First callback to fire (used internally by add and fireWith)
            firingStart,
        // End of the loop when firing
            firingLength,
        // Index of currently firing callback (modified by remove if needed)
            firingIndex,
        // Actual callback list
            list = [],
        // Stack of fire calls for repeatable lists
            stack = !options.once && [],
        // Fire callbacks
            fire = function( data ) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for ( ; list && firingIndex < firingLength; firingIndex++ ) {
                    if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if ( list ) {
                    if ( stack ) {
                        if ( stack.length ) {
                            fire( stack.shift() );
                        }
                    } else if ( memory ) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
        // Actual Callbacks object
            self = {
                // Add a callback or a collection of callbacks to the list
                add: function() {
                    if ( list ) {
                        // First, we save the current length
                        var start = list.length;
                        (function add( args ) {
                            jQuery.each( args, function( _, arg ) {
                                var type = jQuery.type( arg );
                                if ( type === "function" ) {
                                    if ( !options.unique || !self.has( arg ) ) {
                                        list.push( arg );
                                    }
                                } else if ( arg && arg.length && type !== "string" ) {
                                    // Inspect recursively
                                    add( arg );
                                }
                            });
                        })( arguments );
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if ( firing ) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away
                        } else if ( memory ) {
                            firingStart = start;
                            fire( memory );
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                remove: function() {
                    if ( list ) {
                        jQuery.each( arguments, function( _, arg ) {
                            var index;
                            while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
                                list.splice( index, 1 );
                                // Handle firing indexes
                                if ( firing ) {
                                    if ( index <= firingLength ) {
                                        firingLength--;
                                    }
                                    if ( index <= firingIndex ) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // Check if a given callback is in the list.
                // If no argument is given, return whether or not list has callbacks attached.
                has: function( fn ) {
                    return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
                },
                // Remove all callbacks from the list
                empty: function() {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                // Have the list do nothing anymore
                disable: function() {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled: function() {
                    return !list;
                },
                // Lock the list in its current state
                lock: function() {
                    stack = undefined;
                    if ( !memory ) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked: function() {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                fireWith: function( context, args ) {
                    if ( list && ( !fired || stack ) ) {
                        args = args || [];
                        args = [ context, args.slice ? args.slice() : args ];
                        if ( firing ) {
                            stack.push( args );
                        } else {
                            fire( args );
                        }
                    }
                    return this;
                },
                // Call all the callbacks with the given arguments
                fire: function() {
                    self.fireWith( this, arguments );
                    return this;
                },
                // To know if the callbacks have already been called at least once
                fired: function() {
                    return !!fired;
                }
            };

        return self;
    };


    jQuery.extend({

        Deferred: function( func ) {
            var tuples = [
                    // action, add listener, listener list, final state
                    [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
                    [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
                    [ "notify", "progress", jQuery.Callbacks("memory") ]
                ],
                state = "pending",
                promise = {
                    state: function() {
                        return state;
                    },
                    always: function() {
                        deferred.done( arguments ).fail( arguments );
                        return this;
                    },
                    then: function( /* fnDone, fnFail, fnProgress */ ) {
                        var fns = arguments;
                        return jQuery.Deferred(function( newDefer ) {
                            jQuery.each( tuples, function( i, tuple ) {
                                var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
                                // deferred[ done | fail | progress ] for forwarding actions to newDefer
                                deferred[ tuple[1] ](function() {
                                    var returned = fn && fn.apply( this, arguments );
                                    if ( returned && jQuery.isFunction( returned.promise ) ) {
                                        returned.promise()
                                            .done( newDefer.resolve )
                                            .fail( newDefer.reject )
                                            .progress( newDefer.notify );
                                    } else {
                                        newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                                    }
                                });
                            });
                            fns = null;
                        }).promise();
                    },
                    // Get a promise for this deferred
                    // If obj is provided, the promise aspect is added to the object
                    promise: function( obj ) {
                        return obj != null ? jQuery.extend( obj, promise ) : promise;
                    }
                },
                deferred = {};

            // Keep pipe for back-compat
            promise.pipe = promise.then;

            // Add list-specific methods
            jQuery.each( tuples, function( i, tuple ) {
                var list = tuple[ 2 ],
                    stateString = tuple[ 3 ];

                // promise[ done | fail | progress ] = list.add
                promise[ tuple[1] ] = list.add;

                // Handle state
                if ( stateString ) {
                    list.add(function() {
                        // state = [ resolved | rejected ]
                        state = stateString;

                        // [ reject_list | resolve_list ].disable; progress_list.lock
                    }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
                }

                // deferred[ resolve | reject | notify ]
                deferred[ tuple[0] ] = function() {
                    deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
                    return this;
                };
                deferred[ tuple[0] + "With" ] = list.fireWith;
            });

            // Make the deferred a promise
            promise.promise( deferred );

            // Call given func if any
            if ( func ) {
                func.call( deferred, deferred );
            }

            // All done!
            return deferred;
        },

        // Deferred helper
        when: function( subordinate /* , ..., subordinateN */ ) {
            var i = 0,
                resolveValues = slice.call( arguments ),
                length = resolveValues.length,

            // the count of uncompleted subordinates
                remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

            // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
                deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

            // Update function for both resolve and progress values
                updateFunc = function( i, contexts, values ) {
                    return function( value ) {
                        contexts[ i ] = this;
                        values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
                        if ( values === progressValues ) {
                            deferred.notifyWith( contexts, values );
                        } else if ( !( --remaining ) ) {
                            deferred.resolveWith( contexts, values );
                        }
                    };
                },

                progressValues, progressContexts, resolveContexts;

            // add listeners to Deferred subordinates; treat others as resolved
            if ( length > 1 ) {
                progressValues = new Array( length );
                progressContexts = new Array( length );
                resolveContexts = new Array( length );
                for ( ; i < length; i++ ) {
                    if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
                        resolveValues[ i ].promise()
                            .done( updateFunc( i, resolveContexts, resolveValues ) )
                            .fail( deferred.reject )
                            .progress( updateFunc( i, progressContexts, progressValues ) );
                    } else {
                        --remaining;
                    }
                }
            }

            // if we're not waiting on anything, resolve the master
            if ( !remaining ) {
                deferred.resolveWith( resolveContexts, resolveValues );
            }

            return deferred.promise();
        }
    });


// The deferred used on DOM ready
    var readyList;

    jQuery.fn.ready = function( fn ) {
        // Add the callback
        jQuery.ready.promise().done( fn );

        return this;
    };

    jQuery.extend({
        // Is the DOM ready to be used? Set to true once it occurs.
        isReady: false,

        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        readyWait: 1,

        // Hold (or release) the ready event
        holdReady: function( hold ) {
            if ( hold ) {
                jQuery.readyWait++;
            } else {
                jQuery.ready( true );
            }
        },

        // Handle when the DOM is ready
        ready: function( wait ) {

            // Abort if there are pending holds or we're already ready
            if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
                return;
            }

            // Remember that the DOM is ready
            jQuery.isReady = true;

            // If a normal DOM Ready event fired, decrement, and wait if need be
            if ( wait !== true && --jQuery.readyWait > 0 ) {
                return;
            }

            // If there are functions bound, to execute
            readyList.resolveWith( document, [ jQuery ] );

            // Trigger any bound ready events
            if ( jQuery.fn.triggerHandler ) {
                jQuery( document ).triggerHandler( "ready" );
                jQuery( document ).off( "ready" );
            }
        }
    });

    /**
     * The ready event handler and self cleanup method
     */
    function completed() {
        document.removeEventListener( "DOMContentLoaded", completed, false );
        window.removeEventListener( "load", completed, false );
        jQuery.ready();
    }

    jQuery.ready.promise = function( obj ) {
        if ( !readyList ) {

            readyList = jQuery.Deferred();

            // Catch cases where $(document).ready() is called after the browser event has already occurred.
            // we once tried to use readyState "interactive" here, but it caused issues like the one
            // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
            if ( document.readyState === "complete" ) {
                // Handle it asynchronously to allow scripts the opportunity to delay ready
                setTimeout( jQuery.ready );

            } else {

                // Use the handy event callback
                document.addEventListener( "DOMContentLoaded", completed, false );

                // A fallback to window.onload, that will always work
                window.addEventListener( "load", completed, false );
            }
        }
        return readyList.promise( obj );
    };

// Kick off the DOM ready check even if the user does not
    jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
    var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
        var i = 0,
            len = elems.length,
            bulk = key == null;

        // Sets many values
        if ( jQuery.type( key ) === "object" ) {
            chainable = true;
            for ( i in key ) {
                jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
            }

            // Sets one value
        } else if ( value !== undefined ) {
            chainable = true;

            if ( !jQuery.isFunction( value ) ) {
                raw = true;
            }

            if ( bulk ) {
                // Bulk operations run against the entire set
                if ( raw ) {
                    fn.call( elems, value );
                    fn = null;

                    // ...except when executing function values
                } else {
                    bulk = fn;
                    fn = function( elem, key, value ) {
                        return bulk.call( jQuery( elem ), value );
                    };
                }
            }

            if ( fn ) {
                for ( ; i < len; i++ ) {
                    fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
                }
            }
        }

        return chainable ?
            elems :

            // Gets
            bulk ?
                fn.call( elems ) :
                len ? fn( elems[0], key ) : emptyGet;
    };


    /**
     * Determines whether an object can have data
     */
    jQuery.acceptData = function( owner ) {
        // Accepts only:
        //  - Node
        //    - Node.ELEMENT_NODE
        //    - Node.DOCUMENT_NODE
        //  - Object
        //    - Any
        /* jshint -W018 */
        return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
    };


    function Data() {
        // Support: Android < 4,
        // Old WebKit does not have Object.preventExtensions/freeze method,
        // return new empty object instead with no [[set]] accessor
        Object.defineProperty( this.cache = {}, 0, {
            get: function() {
                return {};
            }
        });

        this.expando = jQuery.expando + Math.random();
    }

    Data.uid = 1;
    Data.accepts = jQuery.acceptData;

    Data.prototype = {
        key: function( owner ) {
            // We can accept data for non-element nodes in modern browsers,
            // but we should not, see #8335.
            // Always return the key for a frozen object.
            if ( !Data.accepts( owner ) ) {
                return 0;
            }

            var descriptor = {},
            // Check if the owner object already has a cache key
                unlock = owner[ this.expando ];

            // If not, create one
            if ( !unlock ) {
                unlock = Data.uid++;

                // Secure it in a non-enumerable, non-writable property
                try {
                    descriptor[ this.expando ] = { value: unlock };
                    Object.defineProperties( owner, descriptor );

                    // Support: Android < 4
                    // Fallback to a less secure definition
                } catch ( e ) {
                    descriptor[ this.expando ] = unlock;
                    jQuery.extend( owner, descriptor );
                }
            }

            // Ensure the cache object
            if ( !this.cache[ unlock ] ) {
                this.cache[ unlock ] = {};
            }

            return unlock;
        },
        set: function( owner, data, value ) {
            var prop,
            // There may be an unlock assigned to this node,
            // if there is no entry for this "owner", create one inline
            // and set the unlock as though an owner entry had always existed
                unlock = this.key( owner ),
                cache = this.cache[ unlock ];

            // Handle: [ owner, key, value ] args
            if ( typeof data === "string" ) {
                cache[ data ] = value;

                // Handle: [ owner, { properties } ] args
            } else {
                // Fresh assignments by object are shallow copied
                if ( jQuery.isEmptyObject( cache ) ) {
                    jQuery.extend( this.cache[ unlock ], data );
                    // Otherwise, copy the properties one-by-one to the cache object
                } else {
                    for ( prop in data ) {
                        cache[ prop ] = data[ prop ];
                    }
                }
            }
            return cache;
        },
        get: function( owner, key ) {
            // Either a valid cache is found, or will be created.
            // New caches will be created and the unlock returned,
            // allowing direct access to the newly created
            // empty data object. A valid owner object must be provided.
            var cache = this.cache[ this.key( owner ) ];

            return key === undefined ?
                cache : cache[ key ];
        },
        access: function( owner, key, value ) {
            var stored;
            // In cases where either:
            //
            //   1. No key was specified
            //   2. A string key was specified, but no value provided
            //
            // Take the "read" path and allow the get method to determine
            // which value to return, respectively either:
            //
            //   1. The entire cache object
            //   2. The data stored at the key
            //
            if ( key === undefined ||
                ((key && typeof key === "string") && value === undefined) ) {

                stored = this.get( owner, key );

                return stored !== undefined ?
                    stored : this.get( owner, jQuery.camelCase(key) );
            }

            // [*]When the key is not a string, or both a key and value
            // are specified, set or extend (existing objects) with either:
            //
            //   1. An object of properties
            //   2. A key and value
            //
            this.set( owner, key, value );

            // Since the "set" path can have two possible entry points
            // return the expected data based on which path was taken[*]
            return value !== undefined ? value : key;
        },
        remove: function( owner, key ) {
            var i, name, camel,
                unlock = this.key( owner ),
                cache = this.cache[ unlock ];

            if ( key === undefined ) {
                this.cache[ unlock ] = {};

            } else {
                // Support array or space separated string of keys
                if ( jQuery.isArray( key ) ) {
                    // If "name" is an array of keys...
                    // When data is initially created, via ("key", "val") signature,
                    // keys will be converted to camelCase.
                    // Since there is no way to tell _how_ a key was added, remove
                    // both plain key and camelCase key. #12786
                    // This will only penalize the array argument path.
                    name = key.concat( key.map( jQuery.camelCase ) );
                } else {
                    camel = jQuery.camelCase( key );
                    // Try the string as a key before any manipulation
                    if ( key in cache ) {
                        name = [ key, camel ];
                    } else {
                        // If a key with the spaces exists, use it.
                        // Otherwise, create an array by matching non-whitespace
                        name = camel;
                        name = name in cache ?
                            [ name ] : ( name.match( rnotwhite ) || [] );
                    }
                }

                i = name.length;
                while ( i-- ) {
                    delete cache[ name[ i ] ];
                }
            }
        },
        hasData: function( owner ) {
            return !jQuery.isEmptyObject(
                    this.cache[ owner[ this.expando ] ] || {}
            );
        },
        discard: function( owner ) {
            if ( owner[ this.expando ] ) {
                delete this.cache[ owner[ this.expando ] ];
            }
        }
    };
    var data_priv = new Data();

    var data_user = new Data();



    /*
     Implementation Summary

     1. Enforce API surface and semantic compatibility with 1.9.x branch
     2. Improve the module's maintainability by reducing the storage
     paths to a single mechanism.
     3. Use the same single mechanism to support "private" and "user" data.
     4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
     5. Avoid exposing implementation details on user objects (eg. expando properties)
     6. Provide a clear path for implementation upgrade to WeakMap in 2014
     */
    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        rmultiDash = /([A-Z])/g;

    function dataAttr( elem, key, data ) {
        var name;

        // If nothing was found internally, try to fetch any
        // data from the HTML5 data-* attribute
        if ( data === undefined && elem.nodeType === 1 ) {
            name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
            data = elem.getAttribute( name );

            if ( typeof data === "string" ) {
                try {
                    data = data === "true" ? true :
                            data === "false" ? false :
                            data === "null" ? null :
                        // Only convert to a number if it doesn't change the string
                            +data + "" === data ? +data :
                        rbrace.test( data ) ? jQuery.parseJSON( data ) :
                            data;
                } catch( e ) {}

                // Make sure we set the data so it isn't changed later
                data_user.set( elem, key, data );
            } else {
                data = undefined;
            }
        }
        return data;
    }

    jQuery.extend({
        hasData: function( elem ) {
            return data_user.hasData( elem ) || data_priv.hasData( elem );
        },

        data: function( elem, name, data ) {
            return data_user.access( elem, name, data );
        },

        removeData: function( elem, name ) {
            data_user.remove( elem, name );
        },

        // TODO: Now that all calls to _data and _removeData have been replaced
        // with direct calls to data_priv methods, these can be deprecated.
        _data: function( elem, name, data ) {
            return data_priv.access( elem, name, data );
        },

        _removeData: function( elem, name ) {
            data_priv.remove( elem, name );
        }
    });

    jQuery.fn.extend({
        data: function( key, value ) {
            var i, name, data,
                elem = this[ 0 ],
                attrs = elem && elem.attributes;

            // Gets all values
            if ( key === undefined ) {
                if ( this.length ) {
                    data = data_user.get( elem );

                    if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
                        i = attrs.length;
                        while ( i-- ) {

                            // Support: IE11+
                            // The attrs elements can be null (#14894)
                            if ( attrs[ i ] ) {
                                name = attrs[ i ].name;
                                if ( name.indexOf( "data-" ) === 0 ) {
                                    name = jQuery.camelCase( name.slice(5) );
                                    dataAttr( elem, name, data[ name ] );
                                }
                            }
                        }
                        data_priv.set( elem, "hasDataAttrs", true );
                    }
                }

                return data;
            }

            // Sets multiple values
            if ( typeof key === "object" ) {
                return this.each(function() {
                    data_user.set( this, key );
                });
            }

            return access( this, function( value ) {
                var data,
                    camelKey = jQuery.camelCase( key );

                // The calling jQuery object (element matches) is not empty
                // (and therefore has an element appears at this[ 0 ]) and the
                // `value` parameter was not undefined. An empty jQuery object
                // will result in `undefined` for elem = this[ 0 ] which will
                // throw an exception if an attempt to read a data cache is made.
                if ( elem && value === undefined ) {
                    // Attempt to get data from the cache
                    // with the key as-is
                    data = data_user.get( elem, key );
                    if ( data !== undefined ) {
                        return data;
                    }

                    // Attempt to get data from the cache
                    // with the key camelized
                    data = data_user.get( elem, camelKey );
                    if ( data !== undefined ) {
                        return data;
                    }

                    // Attempt to "discover" the data in
                    // HTML5 custom data-* attrs
                    data = dataAttr( elem, camelKey, undefined );
                    if ( data !== undefined ) {
                        return data;
                    }

                    // We tried really hard, but the data doesn't exist.
                    return;
                }

                // Set the data...
                this.each(function() {
                    // First, attempt to store a copy or reference of any
                    // data that might've been store with a camelCased key.
                    var data = data_user.get( this, camelKey );

                    // For HTML5 data-* attribute interop, we have to
                    // store property names with dashes in a camelCase form.
                    // This might not apply to all properties...*
                    data_user.set( this, camelKey, value );

                    // *... In the case of properties that might _actually_
                    // have dashes, we need to also store a copy of that
                    // unchanged property.
                    if ( key.indexOf("-") !== -1 && data !== undefined ) {
                        data_user.set( this, key, value );
                    }
                });
            }, null, value, arguments.length > 1, null, true );
        },

        removeData: function( key ) {
            return this.each(function() {
                data_user.remove( this, key );
            });
        }
    });


    jQuery.extend({
        queue: function( elem, type, data ) {
            var queue;

            if ( elem ) {
                type = ( type || "fx" ) + "queue";
                queue = data_priv.get( elem, type );

                // Speed up dequeue by getting out quickly if this is just a lookup
                if ( data ) {
                    if ( !queue || jQuery.isArray( data ) ) {
                        queue = data_priv.access( elem, type, jQuery.makeArray(data) );
                    } else {
                        queue.push( data );
                    }
                }
                return queue || [];
            }
        },

        dequeue: function( elem, type ) {
            type = type || "fx";

            var queue = jQuery.queue( elem, type ),
                startLength = queue.length,
                fn = queue.shift(),
                hooks = jQuery._queueHooks( elem, type ),
                next = function() {
                    jQuery.dequeue( elem, type );
                };

            // If the fx queue is dequeued, always remove the progress sentinel
            if ( fn === "inprogress" ) {
                fn = queue.shift();
                startLength--;
            }

            if ( fn ) {

                // Add a progress sentinel to prevent the fx queue from being
                // automatically dequeued
                if ( type === "fx" ) {
                    queue.unshift( "inprogress" );
                }

                // clear up the last queue stop function
                delete hooks.stop;
                fn.call( elem, next, hooks );
            }

            if ( !startLength && hooks ) {
                hooks.empty.fire();
            }
        },

        // not intended for public consumption - generates a queueHooks object, or returns the current one
        _queueHooks: function( elem, type ) {
            var key = type + "queueHooks";
            return data_priv.get( elem, key ) || data_priv.access( elem, key, {
                empty: jQuery.Callbacks("once memory").add(function() {
                    data_priv.remove( elem, [ type + "queue", key ] );
                })
            });
        }
    });

    jQuery.fn.extend({
        queue: function( type, data ) {
            var setter = 2;

            if ( typeof type !== "string" ) {
                data = type;
                type = "fx";
                setter--;
            }

            if ( arguments.length < setter ) {
                return jQuery.queue( this[0], type );
            }

            return data === undefined ?
                this :
                this.each(function() {
                    var queue = jQuery.queue( this, type, data );

                    // ensure a hooks for this queue
                    jQuery._queueHooks( this, type );

                    if ( type === "fx" && queue[0] !== "inprogress" ) {
                        jQuery.dequeue( this, type );
                    }
                });
        },
        dequeue: function( type ) {
            return this.each(function() {
                jQuery.dequeue( this, type );
            });
        },
        clearQueue: function( type ) {
            return this.queue( type || "fx", [] );
        },
        // Get a promise resolved when queues of a certain type
        // are emptied (fx is the type by default)
        promise: function( type, obj ) {
            var tmp,
                count = 1,
                defer = jQuery.Deferred(),
                elements = this,
                i = this.length,
                resolve = function() {
                    if ( !( --count ) ) {
                        defer.resolveWith( elements, [ elements ] );
                    }
                };

            if ( typeof type !== "string" ) {
                obj = type;
                type = undefined;
            }
            type = type || "fx";

            while ( i-- ) {
                tmp = data_priv.get( elements[ i ], type + "queueHooks" );
                if ( tmp && tmp.empty ) {
                    count++;
                    tmp.empty.add( resolve );
                }
            }
            resolve();
            return defer.promise( obj );
        }
    });
    var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

    var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

    var isHidden = function( elem, el ) {
        // isHidden might be called from jQuery#filter function;
        // in that case, element will be second argument
        elem = el || elem;
        return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
    };

    var rcheckableType = (/^(?:checkbox|radio)$/i);



    (function() {
        var fragment = document.createDocumentFragment(),
            div = fragment.appendChild( document.createElement( "div" ) ),
            input = document.createElement( "input" );

        // #11217 - WebKit loses check when the name is after the checked attribute
        // Support: Windows Web Apps (WWA)
        // `name` and `type` need .setAttribute for WWA
        input.setAttribute( "type", "radio" );
        input.setAttribute( "checked", "checked" );
        input.setAttribute( "name", "t" );

        div.appendChild( input );

        // Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
        // old WebKit doesn't clone checked state correctly in fragments
        support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

        // Make sure textarea (and checkbox) defaultValue is properly cloned
        // Support: IE9-IE11+
        div.innerHTML = "<textarea>x</textarea>";
        support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
    })();
    var strundefined = typeof undefined;



    support.focusinBubbles = "onfocusin" in window;


    var
        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch ( err ) { }
    }

    /*
     * Helper functions for managing events -- not part of the public interface.
     * Props to Dean Edwards' addEvent library for many of the ideas.
     */
    jQuery.event = {

        global: {},

        add: function( elem, types, handler, data, selector ) {

            var handleObjIn, eventHandle, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = data_priv.get( elem );

            // Don't attach events to noData or text/comment nodes (but allow plain objects)
            if ( !elemData ) {
                return;
            }

            // Caller can pass in an object of custom data in lieu of the handler
            if ( handler.handler ) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            // Make sure that the handler has a unique ID, used to find/remove it later
            if ( !handler.guid ) {
                handler.guid = jQuery.guid++;
            }

            // Init the element's event structure and main handler, if this is the first
            if ( !(events = elemData.events) ) {
                events = elemData.events = {};
            }
            if ( !(eventHandle = elemData.handle) ) {
                eventHandle = elemData.handle = function( e ) {
                    // Discard the second event of a jQuery.event.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
                        jQuery.event.dispatch.apply( elem, arguments ) : undefined;
                };
            }

            // Handle multiple events separated by a space
            types = ( types || "" ).match( rnotwhite ) || [ "" ];
            t = types.length;
            while ( t-- ) {
                tmp = rtypenamespace.exec( types[t] ) || [];
                type = origType = tmp[1];
                namespaces = ( tmp[2] || "" ).split( "." ).sort();

                // There *must* be a type, no attaching namespace-only handlers
                if ( !type ) {
                    continue;
                }

                // If event changes its type, use the special event handlers for the changed type
                special = jQuery.event.special[ type ] || {};

                // If selector defined, determine special event api type, otherwise given type
                type = ( selector ? special.delegateType : special.bindType ) || type;

                // Update special based on newly reset type
                special = jQuery.event.special[ type ] || {};

                // handleObj is passed to all event handlers
                handleObj = jQuery.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
                    namespace: namespaces.join(".")
                }, handleObjIn );

                // Init the event handler queue if we're the first
                if ( !(handlers = events[ type ]) ) {
                    handlers = events[ type ] = [];
                    handlers.delegateCount = 0;

                    // Only use addEventListener if the special events handler returns false
                    if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
                        if ( elem.addEventListener ) {
                            elem.addEventListener( type, eventHandle, false );
                        }
                    }
                }

                if ( special.add ) {
                    special.add.call( elem, handleObj );

                    if ( !handleObj.handler.guid ) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add to the element's handler list, delegates in front
                if ( selector ) {
                    handlers.splice( handlers.delegateCount++, 0, handleObj );
                } else {
                    handlers.push( handleObj );
                }

                // Keep track of which events have ever been used, for event optimization
                jQuery.event.global[ type ] = true;
            }

        },

        // Detach an event or set of events from an element
        remove: function( elem, types, handler, selector, mappedTypes ) {

            var j, origCount, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = data_priv.hasData( elem ) && data_priv.get( elem );

            if ( !elemData || !(events = elemData.events) ) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = ( types || "" ).match( rnotwhite ) || [ "" ];
            t = types.length;
            while ( t-- ) {
                tmp = rtypenamespace.exec( types[t] ) || [];
                type = origType = tmp[1];
                namespaces = ( tmp[2] || "" ).split( "." ).sort();

                // Unbind all events (on this namespace, if provided) for the element
                if ( !type ) {
                    for ( type in events ) {
                        jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
                    }
                    continue;
                }

                special = jQuery.event.special[ type ] || {};
                type = ( selector ? special.delegateType : special.bindType ) || type;
                handlers = events[ type ] || [];
                tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

                // Remove matching events
                origCount = j = handlers.length;
                while ( j-- ) {
                    handleObj = handlers[ j ];

                    if ( ( mappedTypes || origType === handleObj.origType ) &&
                        ( !handler || handler.guid === handleObj.guid ) &&
                        ( !tmp || tmp.test( handleObj.namespace ) ) &&
                        ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
                        handlers.splice( j, 1 );

                        if ( handleObj.selector ) {
                            handlers.delegateCount--;
                        }
                        if ( special.remove ) {
                            special.remove.call( elem, handleObj );
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if ( origCount && !handlers.length ) {
                    if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
                        jQuery.removeEvent( elem, type, elemData.handle );
                    }

                    delete events[ type ];
                }
            }

            // Remove the expando if it's no longer used
            if ( jQuery.isEmptyObject( events ) ) {
                delete elemData.handle;
                data_priv.remove( elem, "events" );
            }
        },

        trigger: function( event, data, elem, onlyHandlers ) {

            var i, cur, tmp, bubbleType, ontype, handle, special,
                eventPath = [ elem || document ],
                type = hasOwn.call( event, "type" ) ? event.type : event,
                namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

            cur = tmp = elem = elem || document;

            // Don't do events on text and comment nodes
            if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
                return;
            }

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
                return;
            }

            if ( type.indexOf(".") >= 0 ) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;

            // Caller can pass in a jQuery.Event object, Object, or just an event type string
            event = event[ jQuery.expando ] ?
                event :
                new jQuery.Event( type, typeof event === "object" && event );

            // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ?
                new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
                null;

            // Clean up the event in case it is being reused
            event.result = undefined;
            if ( !event.target ) {
                event.target = elem;
            }

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data == null ?
                [ event ] :
                jQuery.makeArray( data, [ event ] );

            // Allow special events to draw outside the lines
            special = jQuery.event.special[ type ] || {};
            if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
                return;
            }

            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

                bubbleType = special.delegateType || type;
                if ( !rfocusMorph.test( bubbleType + type ) ) {
                    cur = cur.parentNode;
                }
                for ( ; cur; cur = cur.parentNode ) {
                    eventPath.push( cur );
                    tmp = cur;
                }

                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if ( tmp === (elem.ownerDocument || document) ) {
                    eventPath.push( tmp.defaultView || tmp.parentWindow || window );
                }
            }

            // Fire handlers on the event path
            i = 0;
            while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

                event.type = i > 1 ?
                    bubbleType :
                    special.bindType || type;

                // jQuery handler
                handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
                if ( handle ) {
                    handle.apply( cur, data );
                }

                // Native handler
                handle = ontype && cur[ ontype ];
                if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
                    event.result = handle.apply( cur, data );
                    if ( event.result === false ) {
                        event.preventDefault();
                    }
                }
            }
            event.type = type;

            // If nobody prevented the default action, do it now
            if ( !onlyHandlers && !event.isDefaultPrevented() ) {

                if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
                    jQuery.acceptData( elem ) ) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

                        // Don't re-trigger an onFOO event when we call its FOO() method
                        tmp = elem[ ontype ];

                        if ( tmp ) {
                            elem[ ontype ] = null;
                        }

                        // Prevent re-triggering of the same event, since we already bubbled it above
                        jQuery.event.triggered = type;
                        elem[ type ]();
                        jQuery.event.triggered = undefined;

                        if ( tmp ) {
                            elem[ ontype ] = tmp;
                        }
                    }
                }
            }

            return event.result;
        },

        dispatch: function( event ) {

            // Make a writable jQuery.Event from the native event object
            event = jQuery.event.fix( event );

            var i, j, ret, matched, handleObj,
                handlerQueue = [],
                args = slice.call( arguments ),
                handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
                special = jQuery.event.special[ event.type ] || {};

            // Use the fix-ed jQuery.Event rather than the (read-only) native event
            args[0] = event;
            event.delegateTarget = this;

            // Call the preDispatch hook for the mapped type, and let it bail if desired
            if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
                return;
            }

            // Determine handlers
            handlerQueue = jQuery.event.handlers.call( this, event, handlers );

            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
                event.currentTarget = matched.elem;

                j = 0;
                while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

                    // Triggered event must either 1) have no namespace, or
                    // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                    if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

                        event.handleObj = handleObj;
                        event.data = handleObj.data;

                        ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                            .apply( matched.elem, args );

                        if ( ret !== undefined ) {
                            if ( (event.result = ret) === false ) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }

            // Call the postDispatch hook for the mapped type
            if ( special.postDispatch ) {
                special.postDispatch.call( this, event );
            }

            return event.result;
        },

        handlers: function( event, handlers ) {
            var i, matches, sel, handleObj,
                handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;

            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

                for ( ; cur !== this; cur = cur.parentNode || this ) {

                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if ( cur.disabled !== true || event.type !== "click" ) {
                        matches = [];
                        for ( i = 0; i < delegateCount; i++ ) {
                            handleObj = handlers[ i ];

                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + " ";

                            if ( matches[ sel ] === undefined ) {
                                matches[ sel ] = handleObj.needsContext ?
                                    jQuery( sel, this ).index( cur ) >= 0 :
                                    jQuery.find( sel, this, null, [ cur ] ).length;
                            }
                            if ( matches[ sel ] ) {
                                matches.push( handleObj );
                            }
                        }
                        if ( matches.length ) {
                            handlerQueue.push({ elem: cur, handlers: matches });
                        }
                    }
                }
            }

            // Add the remaining (directly-bound) handlers
            if ( delegateCount < handlers.length ) {
                handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
            }

            return handlerQueue;
        },

        // Includes some event props shared by KeyEvent and MouseEvent
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

        fixHooks: {},

        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function( event, original ) {

                // Add which for key events
                if ( event.which == null ) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                return event;
            }
        },

        mouseHooks: {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function( event, original ) {
                var eventDoc, doc, body,
                    button = original.button;

                // Calculate pageX/Y if missing and clientX/Y available
                if ( event.pageX == null && original.clientX != null ) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                    event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
                }

                // Add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                if ( !event.which && button !== undefined ) {
                    event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                }

                return event;
            }
        },

        fix: function( event ) {
            if ( event[ jQuery.expando ] ) {
                return event;
            }

            // Create a writable copy of the event object and normalize some properties
            var i, prop, copy,
                type = event.type,
                originalEvent = event,
                fixHook = this.fixHooks[ type ];

            if ( !fixHook ) {
                this.fixHooks[ type ] = fixHook =
                    rmouseEvent.test( type ) ? this.mouseHooks :
                        rkeyEvent.test( type ) ? this.keyHooks :
                        {};
            }
            copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

            event = new jQuery.Event( originalEvent );

            i = copy.length;
            while ( i-- ) {
                prop = copy[ i ];
                event[ prop ] = originalEvent[ prop ];
            }

            // Support: Cordova 2.5 (WebKit) (#13255)
            // All events should have a target; Cordova deviceready doesn't
            if ( !event.target ) {
                event.target = document;
            }

            // Support: Safari 6.0+, Chrome < 28
            // Target should not be a text node (#504, #13143)
            if ( event.target.nodeType === 3 ) {
                event.target = event.target.parentNode;
            }

            return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
        },

        special: {
            load: {
                // Prevent triggered image.load events from bubbling to window.load
                noBubble: true
            },
            focus: {
                // Fire native event if possible so blur/focus sequence is correct
                trigger: function() {
                    if ( this !== safeActiveElement() && this.focus ) {
                        this.focus();
                        return false;
                    }
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if ( this === safeActiveElement() && this.blur ) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: "focusout"
            },
            click: {
                // For checkbox, fire native event so checked state will be right
                trigger: function() {
                    if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
                        this.click();
                        return false;
                    }
                },

                // For cross-browser consistency, don't fire native .click() on links
                _default: function( event ) {
                    return jQuery.nodeName( event.target, "a" );
                }
            },

            beforeunload: {
                postDispatch: function( event ) {

                    // Support: Firefox 20+
                    // Firefox doesn't alert if the returnValue field is not set.
                    if ( event.result !== undefined && event.originalEvent ) {
                        event.originalEvent.returnValue = event.result;
                    }
                }
            }
        },

        simulate: function( type, elem, event, bubble ) {
            // Piggyback on a donor event to simulate a different one.
            // Fake originalEvent to avoid donor's stopPropagation, but if the
            // simulated event prevents default then we do the same on the donor.
            var e = jQuery.extend(
                new jQuery.Event(),
                event,
                {
                    type: type,
                    isSimulated: true,
                    originalEvent: {}
                }
            );
            if ( bubble ) {
                jQuery.event.trigger( e, null, elem );
            } else {
                jQuery.event.dispatch.call( elem, e );
            }
            if ( e.isDefaultPrevented() ) {
                event.preventDefault();
            }
        }
    };

    jQuery.removeEvent = function( elem, type, handle ) {
        if ( elem.removeEventListener ) {
            elem.removeEventListener( type, handle, false );
        }
    };

    jQuery.Event = function( src, props ) {
        // Allow instantiation without the 'new' keyword
        if ( !(this instanceof jQuery.Event) ) {
            return new jQuery.Event( src, props );
        }

        // Event object
        if ( src && src.type ) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = src.defaultPrevented ||
                src.defaultPrevented === undefined &&
                // Support: Android < 4.0
                src.returnValue === false ?
                returnTrue :
                returnFalse;

            // Event type
        } else {
            this.type = src;
        }

        // Put explicitly provided properties onto the event object
        if ( props ) {
            jQuery.extend( this, props );
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || jQuery.now();

        // Mark it as fixed
        this[ jQuery.expando ] = true;
    };

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,

        preventDefault: function() {
            var e = this.originalEvent;

            this.isDefaultPrevented = returnTrue;

            if ( e && e.preventDefault ) {
                e.preventDefault();
            }
        },
        stopPropagation: function() {
            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if ( e && e.stopPropagation ) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            this.isImmediatePropagationStopped = returnTrue;

            if ( e && e.stopImmediatePropagation ) {
                e.stopImmediatePropagation();
            }

            this.stopPropagation();
        }
    };

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function( orig, fix ) {
        jQuery.event.special[ orig ] = {
            delegateType: fix,
            bindType: fix,

            handle: function( event ) {
                var ret,
                    target = this,
                    related = event.relatedTarget,
                    handleObj = event.handleObj;

                // For mousenter/leave call the handler if related is outside the target.
                // NB: No relatedTarget if the mouse left/entered the browser window
                if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply( this, arguments );
                    event.type = fix;
                }
                return ret;
            }
        };
    });

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
    if ( !support.focusinBubbles ) {
        jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

            // Attach a single capturing handler on the document while someone wants focusin/focusout
            var handler = function( event ) {
                jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
            };

            jQuery.event.special[ fix ] = {
                setup: function() {
                    var doc = this.ownerDocument || this,
                        attaches = data_priv.access( doc, fix );

                    if ( !attaches ) {
                        doc.addEventListener( orig, handler, true );
                    }
                    data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
                },
                teardown: function() {
                    var doc = this.ownerDocument || this,
                        attaches = data_priv.access( doc, fix ) - 1;

                    if ( !attaches ) {
                        doc.removeEventListener( orig, handler, true );
                        data_priv.remove( doc, fix );

                    } else {
                        data_priv.access( doc, fix, attaches );
                    }
                }
            };
        });
    }

    jQuery.fn.extend({

        on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
            var origFn, type;

            // Types can be a map of types/handlers
            if ( typeof types === "object" ) {
                // ( types-Object, selector, data )
                if ( typeof selector !== "string" ) {
                    // ( types-Object, data )
                    data = data || selector;
                    selector = undefined;
                }
                for ( type in types ) {
                    this.on( type, selector, data, types[ type ], one );
                }
                return this;
            }

            if ( data == null && fn == null ) {
                // ( types, fn )
                fn = selector;
                data = selector = undefined;
            } else if ( fn == null ) {
                if ( typeof selector === "string" ) {
                    // ( types, selector, fn )
                    fn = data;
                    data = undefined;
                } else {
                    // ( types, data, fn )
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if ( fn === false ) {
                fn = returnFalse;
            } else if ( !fn ) {
                return this;
            }

            if ( one === 1 ) {
                origFn = fn;
                fn = function( event ) {
                    // Can use an empty set, since event contains the info
                    jQuery().off( event );
                    return origFn.apply( this, arguments );
                };
                // Use same guid so caller can remove using origFn
                fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
            }
            return this.each( function() {
                jQuery.event.add( this, types, fn, data, selector );
            });
        },
        one: function( types, selector, data, fn ) {
            return this.on( types, selector, data, fn, 1 );
        },
        off: function( types, selector, fn ) {
            var handleObj, type;
            if ( types && types.preventDefault && types.handleObj ) {
                // ( event )  dispatched jQuery.Event
                handleObj = types.handleObj;
                jQuery( types.delegateTarget ).off(
                    handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                );
                return this;
            }
            if ( typeof types === "object" ) {
                // ( types-object [, selector] )
                for ( type in types ) {
                    this.off( type, selector, types[ type ] );
                }
                return this;
            }
            if ( selector === false || typeof selector === "function" ) {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if ( fn === false ) {
                fn = returnFalse;
            }
            return this.each(function() {
                jQuery.event.remove( this, types, fn, selector );
            });
        },

        trigger: function( type, data ) {
            return this.each(function() {
                jQuery.event.trigger( type, data, this );
            });
        },
        triggerHandler: function( type, data ) {
            var elem = this[0];
            if ( elem ) {
                return jQuery.event.trigger( type, data, elem, true );
            }
        }
    });


    var
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style|link)/i,
    // checked="checked" or checked
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

    // We have to close these tags to support XHTML (#13200)
        wrapMap = {

            // Support: IE 9
            option: [ 1, "<select multiple='multiple'>", "</select>" ],

            thead: [ 1, "<table>", "</table>" ],
            col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

            _default: [ 0, "", "" ]
        };

// Support: IE 9
    wrapMap.optgroup = wrapMap.option;

    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
    function manipulationTarget( elem, content ) {
        return jQuery.nodeName( elem, "table" ) &&
            jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

            elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
            elem;
    }

// Replace/restore the type attribute of script elements for safe DOM manipulation
    function disableScript( elem ) {
        elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
        return elem;
    }
    function restoreScript( elem ) {
        var match = rscriptTypeMasked.exec( elem.type );

        if ( match ) {
            elem.type = match[ 1 ];
        } else {
            elem.removeAttribute("type");
        }

        return elem;
    }

// Mark scripts as having already been evaluated
    function setGlobalEval( elems, refElements ) {
        var i = 0,
            l = elems.length;

        for ( ; i < l; i++ ) {
            data_priv.set(
                elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
            );
        }
    }

    function cloneCopyEvent( src, dest ) {
        var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

        if ( dest.nodeType !== 1 ) {
            return;
        }

        // 1. Copy private data: events, handlers, etc.
        if ( data_priv.hasData( src ) ) {
            pdataOld = data_priv.access( src );
            pdataCur = data_priv.set( dest, pdataOld );
            events = pdataOld.events;

            if ( events ) {
                delete pdataCur.handle;
                pdataCur.events = {};

                for ( type in events ) {
                    for ( i = 0, l = events[ type ].length; i < l; i++ ) {
                        jQuery.event.add( dest, type, events[ type ][ i ] );
                    }
                }
            }
        }

        // 2. Copy user data
        if ( data_user.hasData( src ) ) {
            udataOld = data_user.access( src );
            udataCur = jQuery.extend( {}, udataOld );

            data_user.set( dest, udataCur );
        }
    }

    function getAll( context, tag ) {
        var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
            context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
                [];

        return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
            jQuery.merge( [ context ], ret ) :
            ret;
    }

// Support: IE >= 9
    function fixInput( src, dest ) {
        var nodeName = dest.nodeName.toLowerCase();

        // Fails to persist the checked state of a cloned checkbox or radio button.
        if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
            dest.checked = src.checked;

            // Fails to return the selected option to the default selected state when cloning options
        } else if ( nodeName === "input" || nodeName === "textarea" ) {
            dest.defaultValue = src.defaultValue;
        }
    }

    jQuery.extend({
        clone: function( elem, dataAndEvents, deepDataAndEvents ) {
            var i, l, srcElements, destElements,
                clone = elem.cloneNode( true ),
                inPage = jQuery.contains( elem.ownerDocument, elem );

            // Support: IE >= 9
            // Fix Cloning issues
            if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
                !jQuery.isXMLDoc( elem ) ) {

                // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
                destElements = getAll( clone );
                srcElements = getAll( elem );

                for ( i = 0, l = srcElements.length; i < l; i++ ) {
                    fixInput( srcElements[ i ], destElements[ i ] );
                }
            }

            // Copy the events from the original to the clone
            if ( dataAndEvents ) {
                if ( deepDataAndEvents ) {
                    srcElements = srcElements || getAll( elem );
                    destElements = destElements || getAll( clone );

                    for ( i = 0, l = srcElements.length; i < l; i++ ) {
                        cloneCopyEvent( srcElements[ i ], destElements[ i ] );
                    }
                } else {
                    cloneCopyEvent( elem, clone );
                }
            }

            // Preserve script evaluation history
            destElements = getAll( clone, "script" );
            if ( destElements.length > 0 ) {
                setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
            }

            // Return the cloned set
            return clone;
        },

        buildFragment: function( elems, context, scripts, selection ) {
            var elem, tmp, tag, wrap, contains, j,
                fragment = context.createDocumentFragment(),
                nodes = [],
                i = 0,
                l = elems.length;

            for ( ; i < l; i++ ) {
                elem = elems[ i ];

                if ( elem || elem === 0 ) {

                    // Add nodes directly
                    if ( jQuery.type( elem ) === "object" ) {
                        // Support: QtWebKit
                        // jQuery.merge because push.apply(_, arraylike) throws
                        jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

                        // Convert non-html into a text node
                    } else if ( !rhtml.test( elem ) ) {
                        nodes.push( context.createTextNode( elem ) );

                        // Convert html into DOM nodes
                    } else {
                        tmp = tmp || fragment.appendChild( context.createElement("div") );

                        // Deserialize a standard representation
                        tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
                        wrap = wrapMap[ tag ] || wrapMap._default;
                        tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

                        // Descend through wrappers to the right content
                        j = wrap[ 0 ];
                        while ( j-- ) {
                            tmp = tmp.lastChild;
                        }

                        // Support: QtWebKit
                        // jQuery.merge because push.apply(_, arraylike) throws
                        jQuery.merge( nodes, tmp.childNodes );

                        // Remember the top-level container
                        tmp = fragment.firstChild;

                        // Fixes #12346
                        // Support: Webkit, IE
                        tmp.textContent = "";
                    }
                }
            }

            // Remove wrapper from fragment
            fragment.textContent = "";

            i = 0;
            while ( (elem = nodes[ i++ ]) ) {

                // #4087 - If origin and destination elements are the same, and this is
                // that element, do not do anything
                if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
                    continue;
                }

                contains = jQuery.contains( elem.ownerDocument, elem );

                // Append to fragment
                tmp = getAll( fragment.appendChild( elem ), "script" );

                // Preserve script evaluation history
                if ( contains ) {
                    setGlobalEval( tmp );
                }

                // Capture executables
                if ( scripts ) {
                    j = 0;
                    while ( (elem = tmp[ j++ ]) ) {
                        if ( rscriptType.test( elem.type || "" ) ) {
                            scripts.push( elem );
                        }
                    }
                }
            }

            return fragment;
        },

        cleanData: function( elems ) {
            var data, elem, type, key,
                special = jQuery.event.special,
                i = 0;

            for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
                if ( jQuery.acceptData( elem ) ) {
                    key = elem[ data_priv.expando ];

                    if ( key && (data = data_priv.cache[ key ]) ) {
                        if ( data.events ) {
                            for ( type in data.events ) {
                                if ( special[ type ] ) {
                                    jQuery.event.remove( elem, type );

                                    // This is a shortcut to avoid jQuery.event.remove's overhead
                                } else {
                                    jQuery.removeEvent( elem, type, data.handle );
                                }
                            }
                        }
                        if ( data_priv.cache[ key ] ) {
                            // Discard any remaining `private` data
                            delete data_priv.cache[ key ];
                        }
                    }
                }
                // Discard any remaining `user` data
                delete data_user.cache[ elem[ data_user.expando ] ];
            }
        }
    });

    jQuery.fn.extend({
        text: function( value ) {
            return access( this, function( value ) {
                return value === undefined ?
                    jQuery.text( this ) :
                    this.empty().each(function() {
                        if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                            this.textContent = value;
                        }
                    });
            }, null, value, arguments.length );
        },

        append: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                    var target = manipulationTarget( this, elem );
                    target.appendChild( elem );
                }
            });
        },

        prepend: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                    var target = manipulationTarget( this, elem );
                    target.insertBefore( elem, target.firstChild );
                }
            });
        },

        before: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.parentNode ) {
                    this.parentNode.insertBefore( elem, this );
                }
            });
        },

        after: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.parentNode ) {
                    this.parentNode.insertBefore( elem, this.nextSibling );
                }
            });
        },

        remove: function( selector, keepData /* Internal Use Only */ ) {
            var elem,
                elems = selector ? jQuery.filter( selector, this ) : this,
                i = 0;

            for ( ; (elem = elems[i]) != null; i++ ) {
                if ( !keepData && elem.nodeType === 1 ) {
                    jQuery.cleanData( getAll( elem ) );
                }

                if ( elem.parentNode ) {
                    if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
                        setGlobalEval( getAll( elem, "script" ) );
                    }
                    elem.parentNode.removeChild( elem );
                }
            }

            return this;
        },

        empty: function() {
            var elem,
                i = 0;

            for ( ; (elem = this[i]) != null; i++ ) {
                if ( elem.nodeType === 1 ) {

                    // Prevent memory leaks
                    jQuery.cleanData( getAll( elem, false ) );

                    // Remove any remaining nodes
                    elem.textContent = "";
                }
            }

            return this;
        },

        clone: function( dataAndEvents, deepDataAndEvents ) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

            return this.map(function() {
                return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
            });
        },

        html: function( value ) {
            return access( this, function( value ) {
                var elem = this[ 0 ] || {},
                    i = 0,
                    l = this.length;

                if ( value === undefined && elem.nodeType === 1 ) {
                    return elem.innerHTML;
                }

                // See if we can take a shortcut and just use innerHTML
                if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
                    !wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

                    value = value.replace( rxhtmlTag, "<$1></$2>" );

                    try {
                        for ( ; i < l; i++ ) {
                            elem = this[ i ] || {};

                            // Remove element nodes and prevent memory leaks
                            if ( elem.nodeType === 1 ) {
                                jQuery.cleanData( getAll( elem, false ) );
                                elem.innerHTML = value;
                            }
                        }

                        elem = 0;

                        // If using innerHTML throws an exception, use the fallback method
                    } catch( e ) {}
                }

                if ( elem ) {
                    this.empty().append( value );
                }
            }, null, value, arguments.length );
        },

        replaceWith: function() {
            var arg = arguments[ 0 ];

            // Make the changes, replacing each context element with the new content
            this.domManip( arguments, function( elem ) {
                arg = this.parentNode;

                jQuery.cleanData( getAll( this ) );

                if ( arg ) {
                    arg.replaceChild( elem, this );
                }
            });

            // Force removal if there was no new content (e.g., from empty arguments)
            return arg && (arg.length || arg.nodeType) ? this : this.remove();
        },

        detach: function( selector ) {
            return this.remove( selector, true );
        },

        domManip: function( args, callback ) {

            // Flatten any nested arrays
            args = concat.apply( [], args );

            var fragment, first, scripts, hasScripts, node, doc,
                i = 0,
                l = this.length,
                set = this,
                iNoClone = l - 1,
                value = args[ 0 ],
                isFunction = jQuery.isFunction( value );

            // We can't cloneNode fragments that contain checked, in WebKit
            if ( isFunction ||
                ( l > 1 && typeof value === "string" &&
                    !support.checkClone && rchecked.test( value ) ) ) {
                return this.each(function( index ) {
                    var self = set.eq( index );
                    if ( isFunction ) {
                        args[ 0 ] = value.call( this, index, self.html() );
                    }
                    self.domManip( args, callback );
                });
            }

            if ( l ) {
                fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
                first = fragment.firstChild;

                if ( fragment.childNodes.length === 1 ) {
                    fragment = first;
                }

                if ( first ) {
                    scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
                    hasScripts = scripts.length;

                    // Use the original fragment for the last item instead of the first because it can end up
                    // being emptied incorrectly in certain situations (#8070).
                    for ( ; i < l; i++ ) {
                        node = fragment;

                        if ( i !== iNoClone ) {
                            node = jQuery.clone( node, true, true );

                            // Keep references to cloned scripts for later restoration
                            if ( hasScripts ) {
                                // Support: QtWebKit
                                // jQuery.merge because push.apply(_, arraylike) throws
                                jQuery.merge( scripts, getAll( node, "script" ) );
                            }
                        }

                        callback.call( this[ i ], node, i );
                    }

                    if ( hasScripts ) {
                        doc = scripts[ scripts.length - 1 ].ownerDocument;

                        // Reenable scripts
                        jQuery.map( scripts, restoreScript );

                        // Evaluate executable scripts on first document insertion
                        for ( i = 0; i < hasScripts; i++ ) {
                            node = scripts[ i ];
                            if ( rscriptType.test( node.type || "" ) &&
                                !data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

                                if ( node.src ) {
                                    // Optional AJAX dependency, but won't run scripts if not present
                                    if ( jQuery._evalUrl ) {
                                        jQuery._evalUrl( node.src );
                                    }
                                } else {
                                    jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
                                }
                            }
                        }
                    }
                }
            }

            return this;
        }
    });

    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function( name, original ) {
        jQuery.fn[ name ] = function( selector ) {
            var elems,
                ret = [],
                insert = jQuery( selector ),
                last = insert.length - 1,
                i = 0;

            for ( ; i <= last; i++ ) {
                elems = i === last ? this : this.clone( true );
                jQuery( insert[ i ] )[ original ]( elems );

                // Support: QtWebKit
                // .get() because push.apply(_, arraylike) throws
                push.apply( ret, elems.get() );
            }

            return this.pushStack( ret );
        };
    });


    var iframe,
        elemdisplay = {};

    /**
     * Retrieve the actual display of a element
     * @param {String} name nodeName of the element
     * @param {Object} doc Document object
     */
// Called only from within defaultDisplay
    function actualDisplay( name, doc ) {
        var style,
            elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

        // getDefaultComputedStyle might be reliably used only on attached element
            display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

                // Use of this method is a temporary fix (more like optmization) until something better comes along,
                // since it was removed from specification and supported only in FF
                style.display : jQuery.css( elem[ 0 ], "display" );

        // We don't have any data stored on the element,
        // so use "detach" method as fast way to get rid of the element
        elem.detach();

        return display;
    }

    /**
     * Try to determine the default display value of an element
     * @param {String} nodeName
     */
    function defaultDisplay( nodeName ) {
        var doc = document,
            display = elemdisplay[ nodeName ];

        if ( !display ) {
            display = actualDisplay( nodeName, doc );

            // If the simple way fails, read from inside an iframe
            if ( display === "none" || !display ) {

                // Use the already-created iframe if possible
                iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

                // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
                doc = iframe[ 0 ].contentDocument;

                // Support: IE
                doc.write();
                doc.close();

                display = actualDisplay( nodeName, doc );
                iframe.detach();
            }

            // Store the correct default display
            elemdisplay[ nodeName ] = display;
        }

        return display;
    }
    var rmargin = (/^margin/);

    var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

    var getStyles = function( elem ) {
        return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
    };



    function curCSS( elem, name, computed ) {
        var width, minWidth, maxWidth, ret,
            style = elem.style;

        computed = computed || getStyles( elem );

        // Support: IE9
        // getPropertyValue is only needed for .css('filter') in IE9, see #12537
        if ( computed ) {
            ret = computed.getPropertyValue( name ) || computed[ name ];
        }

        if ( computed ) {

            if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
                ret = jQuery.style( elem, name );
            }

            // Support: iOS < 6
            // A tribute to the "awesome hack by Dean Edwards"
            // iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
            // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
            if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

                // Remember the original values
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;

                // Put in the new values to get a computed value out
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;

                // Revert the changed values
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }

        return ret !== undefined ?
            // Support: IE
            // IE returns zIndex value as an integer.
            ret + "" :
            ret;
    }


    function addGetHookIf( conditionFn, hookFn ) {
        // Define the hook, we'll check on the first run if it's really needed.
        return {
            get: function() {
                if ( conditionFn() ) {
                    // Hook not needed (or it's not possible to use it due to missing dependency),
                    // remove it.
                    // Since there are no other hooks for marginRight, remove the whole object.
                    delete this.get;
                    return;
                }

                // Hook needed; redefine it so that the support test is not executed again.

                return (this.get = hookFn).apply( this, arguments );
            }
        };
    }


    (function() {
        var pixelPositionVal, boxSizingReliableVal,
            docElem = document.documentElement,
            container = document.createElement( "div" ),
            div = document.createElement( "div" );

        if ( !div.style ) {
            return;
        }

        div.style.backgroundClip = "content-box";
        div.cloneNode( true ).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";

        container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:0.02rem;" +
            "position:absolute";
        container.appendChild( div );

        // Executing both pixelPosition & boxSizingReliable tests require only one layout
        // so they're executed at the same time to save the second computation.
        function computePixelPositionAndBoxSizingReliable() {
            div.style.cssText =
                // Support: Firefox<29, Android 2.3
                // Vendor-prefix box-sizing
                "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
                "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
                "border:1px;padding:0.02rem;width:0.08rem;position:absolute";
            div.innerHTML = "";
            docElem.appendChild( container );

            var divStyle = window.getComputedStyle( div, null );
            pixelPositionVal = divStyle.top !== "1%";
            boxSizingReliableVal = divStyle.width === "0.08rem";

            docElem.removeChild( container );
        }

        // Support: node.js jsdom
        // Don't assume that getComputedStyle is a property of the global object
        if ( window.getComputedStyle ) {
            jQuery.extend( support, {
                pixelPosition: function() {
                    // This test is executed only once but we still do memoizing
                    // since we can use the boxSizingReliable pre-computing.
                    // No need to check if the test was already performed, though.
                    computePixelPositionAndBoxSizingReliable();
                    return pixelPositionVal;
                },
                boxSizingReliable: function() {
                    if ( boxSizingReliableVal == null ) {
                        computePixelPositionAndBoxSizingReliable();
                    }
                    return boxSizingReliableVal;
                },
                reliableMarginRight: function() {
                    // Support: Android 2.3
                    // Check if div with explicit width and no margin-right incorrectly
                    // gets computed margin-right based on width of container. (#3333)
                    // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                    // This support function is only executed once so no memoizing is needed.
                    var ret,
                        marginDiv = div.appendChild( document.createElement( "div" ) );

                    // Reset CSS: box-sizing; display; margin; border; padding
                    marginDiv.style.cssText = div.style.cssText =
                        // Support: Firefox<29, Android 2.3
                        // Vendor-prefix box-sizing
                        "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
                        "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
                    marginDiv.style.marginRight = marginDiv.style.width = "0";
                    div.style.width = "0.02rem";
                    docElem.appendChild( container );

                    ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

                    docElem.removeChild( container );

                    return ret;
                }
            });
        }
    })();


// A method for quickly swapping in/out CSS properties to get correct calculations.
    jQuery.swap = function( elem, options, callback, args ) {
        var ret, name,
            old = {};

        // Remember the old values, and insert the new ones
        for ( name in options ) {
            old[ name ] = elem.style[ name ];
            elem.style[ name ] = options[ name ];
        }

        ret = callback.apply( elem, args || [] );

        // Revert the old values
        for ( name in options ) {
            elem.style[ name ] = old[ name ];
        }

        return ret;
    };


    var
    // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
    // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
        rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
        rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

        cssShow = { position: "absolute", visibility: "hidden", display: "block" },
        cssNormalTransform = {
            letterSpacing: "0",
            fontWeight: "400"
        },

        cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
    function vendorPropName( style, name ) {

        // shortcut for names that are not vendor prefixed
        if ( name in style ) {
            return name;
        }

        // check for vendor prefixed names
        var capName = name[0].toUpperCase() + name.slice(1),
            origName = name,
            i = cssPrefixes.length;

        while ( i-- ) {
            name = cssPrefixes[ i ] + capName;
            if ( name in style ) {
                return name;
            }
        }

        return origName;
    }

    function setPositiveNumber( elem, value, subtract ) {
        var matches = rnumsplit.exec( value );
        return matches ?
            // Guard against undefined "subtract", e.g., when used as in cssHooks
            Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
            value;
    }

    function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
        var i = extra === ( isBorderBox ? "border" : "content" ) ?
                // If we already have the right measurement, avoid augmentation
                4 :
                // Otherwise initialize for horizontal or vertical properties
                    name === "width" ? 1 : 0,

            val = 0;

        for ( ; i < 4; i += 2 ) {
            // both box models exclude margin, so add it if we want it
            if ( extra === "margin" ) {
                val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
            }

            if ( isBorderBox ) {
                // border-box includes padding, so remove it if we want content
                if ( extra === "content" ) {
                    val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
                }

                // at this point, extra isn't border nor margin, so remove border
                if ( extra !== "margin" ) {
                    val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
                }
            } else {
                // at this point, extra isn't content, so add padding
                val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

                // at this point, extra isn't content nor padding, so add border
                if ( extra !== "padding" ) {
                    val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
                }
            }
        }

        return val;
    }

    function getWidthOrHeight( elem, name, extra ) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            styles = getStyles( elem ),
            isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

        // some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if ( val <= 0 || val == null ) {
            // Fall back to computed then uncomputed css if necessary
            val = curCSS( elem, name, styles );
            if ( val < 0 || val == null ) {
                val = elem.style[ name ];
            }

            // Computed unit is not pixels. Stop here and return.
            if ( rnumnonpx.test(val) ) {
                return val;
            }

            // we need the check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox &&
                ( support.boxSizingReliable() || val === elem.style[ name ] );

            // Normalize "", auto, and prepare for extra
            val = parseFloat( val ) || 0;
        }

        // use the active box-sizing model to add/subtract irrelevant styles
        return ( val +
            augmentWidthOrHeight(
                elem,
                name,
                    extra || ( isBorderBox ? "border" : "content" ),
                valueIsBorderBox,
                styles
            )
            ) + "px";
    }

    function showHide( elements, show ) {
        var display, elem, hidden,
            values = [],
            index = 0,
            length = elements.length;

        for ( ; index < length; index++ ) {
            elem = elements[ index ];
            if ( !elem.style ) {
                continue;
            }

            values[ index ] = data_priv.get( elem, "olddisplay" );
            display = elem.style.display;
            if ( show ) {
                // Reset the inline display of this element to learn if it is
                // being hidden by cascaded rules or not
                if ( !values[ index ] && display === "none" ) {
                    elem.style.display = "";
                }

                // Set elements which have been overridden with display: none
                // in a stylesheet to whatever the default browser style is
                // for such an element
                if ( elem.style.display === "" && isHidden( elem ) ) {
                    values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
                }
            } else {
                hidden = isHidden( elem );

                if ( display !== "none" || !hidden ) {
                    data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
                }
            }
        }

        // Set the display of most of the elements in a second loop
        // to avoid the constant reflow
        for ( index = 0; index < length; index++ ) {
            elem = elements[ index ];
            if ( !elem.style ) {
                continue;
            }
            if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
                elem.style.display = show ? values[ index ] || "" : "none";
            }
        }

        return elements;
    }

    jQuery.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
        cssHooks: {
            opacity: {
                get: function( elem, computed ) {
                    if ( computed ) {
                        // We should always get a number back from opacity
                        var ret = curCSS( elem, "opacity" );
                        return ret === "" ? "1" : ret;
                    }
                }
            }
        },

        // Don't automatically add "px" to these possibly-unitless properties
        cssNumber: {
            "columnCount": true,
            "fillOpacity": true,
            "flexGrow": true,
            "flexShrink": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },

        // Add in properties whose names you wish to fix before
        // setting or getting the value
        cssProps: {
            // normalize float css property
            "float": "cssFloat"
        },

        // Get and set the style property on a DOM Node
        style: function( elem, name, value, extra ) {
            // Don't set styles on text and comment nodes
            if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
                return;
            }

            // Make sure that we're working with the right name
            var ret, type, hooks,
                origName = jQuery.camelCase( name ),
                style = elem.style;

            name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

            // gets hook for the prefixed version
            // followed by the unprefixed version
            hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

            // Check if we're setting a value
            if ( value !== undefined ) {
                type = typeof value;

                // convert relative number strings (+= or -=) to relative numbers. #7345
                if ( type === "string" && (ret = rrelNum.exec( value )) ) {
                    value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
                    // Fixes bug #9237
                    type = "number";
                }

                // Make sure that null and NaN values aren't set. See: #7116
                if ( value == null || value !== value ) {
                    return;
                }

                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
                    value += "px";
                }

                // Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
                // but it would mean to define eight (for every problematic property) identical functions
                if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
                    style[ name ] = "inherit";
                }

                // If a hook was provided, use that value, otherwise just set the specified value
                if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
                    style[ name ] = value;
                }

            } else {
                // If a hook was provided get the non-computed value from there
                if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
                    return ret;
                }

                // Otherwise just get the value from the style object
                return style[ name ];
            }
        },

        css: function( elem, name, extra, styles ) {
            var val, num, hooks,
                origName = jQuery.camelCase( name );

            // Make sure that we're working with the right name
            name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

            // gets hook for the prefixed version
            // followed by the unprefixed version
            hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

            // If a hook was provided get the computed value from there
            if ( hooks && "get" in hooks ) {
                val = hooks.get( elem, true, extra );
            }

            // Otherwise, if a way to get the computed value exists, use that
            if ( val === undefined ) {
                val = curCSS( elem, name, styles );
            }

            //convert "normal" to computed value
            if ( val === "normal" && name in cssNormalTransform ) {
                val = cssNormalTransform[ name ];
            }

            // Return, converting to number if forced or a qualifier was provided and val looks numeric
            if ( extra === "" || extra ) {
                num = parseFloat( val );
                return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
            }
            return val;
        }
    });

    jQuery.each([ "height", "width" ], function( i, name ) {
        jQuery.cssHooks[ name ] = {
            get: function( elem, computed, extra ) {
                if ( computed ) {
                    // certain elements can have dimension info if we invisibly show them
                    // however, it must have a current display style that would benefit from this
                    return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
                        jQuery.swap( elem, cssShow, function() {
                            return getWidthOrHeight( elem, name, extra );
                        }) :
                        getWidthOrHeight( elem, name, extra );
                }
            },

            set: function( elem, value, extra ) {
                var styles = extra && getStyles( elem );
                return setPositiveNumber( elem, value, extra ?
                        augmentWidthOrHeight(
                            elem,
                            name,
                            extra,
                                jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
                            styles
                        ) : 0
                );
            }
        };
    });

// Support: Android 2.3
    jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
        function( elem, computed ) {
            if ( computed ) {
                // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                // Work around by temporarily setting element display to inline-block
                return jQuery.swap( elem, { "display": "inline-block" },
                    curCSS, [ elem, "marginRight" ] );
            }
        }
    );

// These hooks are used by animate to expand properties
    jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function( prefix, suffix ) {
        jQuery.cssHooks[ prefix + suffix ] = {
            expand: function( value ) {
                var i = 0,
                    expanded = {},

                // assumes a single number if not a string
                    parts = typeof value === "string" ? value.split(" ") : [ value ];

                for ( ; i < 4; i++ ) {
                    expanded[ prefix + cssExpand[ i ] + suffix ] =
                        parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
                }

                return expanded;
            }
        };

        if ( !rmargin.test( prefix ) ) {
            jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
        }
    });

    jQuery.fn.extend({
        css: function( name, value ) {
            return access( this, function( elem, name, value ) {
                var styles, len,
                    map = {},
                    i = 0;

                if ( jQuery.isArray( name ) ) {
                    styles = getStyles( elem );
                    len = name.length;

                    for ( ; i < len; i++ ) {
                        map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
                    }

                    return map;
                }

                return value !== undefined ?
                    jQuery.style( elem, name, value ) :
                    jQuery.css( elem, name );
            }, name, value, arguments.length > 1 );
        },
        show: function() {
            return showHide( this, true );
        },
        hide: function() {
            return showHide( this );
        },
        toggle: function( state ) {
            if ( typeof state === "boolean" ) {
                return state ? this.show() : this.hide();
            }

            return this.each(function() {
                if ( isHidden( this ) ) {
                    jQuery( this ).show();
                } else {
                    jQuery( this ).hide();
                }
            });
        }
    });


    function Tween( elem, options, prop, end, easing ) {
        return new Tween.prototype.init( elem, options, prop, end, easing );
    }
    jQuery.Tween = Tween;

    Tween.prototype = {
        constructor: Tween,
        init: function( elem, options, prop, end, easing, unit ) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || "swing";
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
        },
        cur: function() {
            var hooks = Tween.propHooks[ this.prop ];

            return hooks && hooks.get ?
                hooks.get( this ) :
                Tween.propHooks._default.get( this );
        },
        run: function( percent ) {
            var eased,
                hooks = Tween.propHooks[ this.prop ];

            if ( this.options.duration ) {
                this.pos = eased = jQuery.easing[ this.easing ](
                    percent, this.options.duration * percent, 0, 1, this.options.duration
                );
            } else {
                this.pos = eased = percent;
            }
            this.now = ( this.end - this.start ) * eased + this.start;

            if ( this.options.step ) {
                this.options.step.call( this.elem, this.now, this );
            }

            if ( hooks && hooks.set ) {
                hooks.set( this );
            } else {
                Tween.propHooks._default.set( this );
            }
            return this;
        }
    };

    Tween.prototype.init.prototype = Tween.prototype;

    Tween.propHooks = {
        _default: {
            get: function( tween ) {
                var result;

                if ( tween.elem[ tween.prop ] != null &&
                    (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
                    return tween.elem[ tween.prop ];
                }

                // passing an empty string as a 3rd parameter to .css will automatically
                // attempt a parseFloat and fallback to a string if the parse fails
                // so, simple values such as "10px" are parsed to Float.
                // complex values such as "rotate(1rad)" are returned as is.
                result = jQuery.css( tween.elem, tween.prop, "" );
                // Empty strings, null, undefined and "auto" are converted to 0.
                return !result || result === "auto" ? 0 : result;
            },
            set: function( tween ) {
                // use step hook for back compat - use cssHook if its there - use .style if its
                // available and use plain properties where available
                if ( jQuery.fx.step[ tween.prop ] ) {
                    jQuery.fx.step[ tween.prop ]( tween );
                } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
                    jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
                } else {
                    tween.elem[ tween.prop ] = tween.now;
                }
            }
        }
    };

// Support: IE9
// Panic based approach to setting things on disconnected nodes

    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function( tween ) {
            if ( tween.elem.nodeType && tween.elem.parentNode ) {
                tween.elem[ tween.prop ] = tween.now;
            }
        }
    };

    jQuery.easing = {
        linear: function( p ) {
            return p;
        },
        swing: function( p ) {
            return 0.5 - Math.cos( p * Math.PI ) / 2;
        }
    };

    jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
    jQuery.fx.step = {};




    var
        fxNow, timerId,
        rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
        rrun = /queueHooks$/,
        animationPrefilters = [ defaultPrefilter ],
        tweeners = {
            "*": [ function( prop, value ) {
                var tween = this.createTween( prop, value ),
                    target = tween.cur(),
                    parts = rfxnum.exec( value ),
                    unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

                // Starting value computation is required for potential unit mismatches
                    start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
                        rfxnum.exec( jQuery.css( tween.elem, prop ) ),
                    scale = 1,
                    maxIterations = 20;

                if ( start && start[ 3 ] !== unit ) {
                    // Trust units reported by jQuery.css
                    unit = unit || start[ 3 ];

                    // Make sure we update the tween properties later on
                    parts = parts || [];

                    // Iteratively approximate from a nonzero starting point
                    start = +target || 1;

                    do {
                        // If previous iteration zeroed out, double until we get *something*
                        // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";

                        // Adjust and apply
                        start = start / scale;
                        jQuery.style( tween.elem, prop, start + unit );

                        // Update scale, tolerating zero or NaN from tween.cur()
                        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
                    } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
                }

                // Update tween properties
                if ( parts ) {
                    start = tween.start = +start || +target || 0;
                    tween.unit = unit;
                    // If a +=/-= token was provided, we're doing a relative animation
                    tween.end = parts[ 1 ] ?
                        start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
                        +parts[ 2 ];
                }

                return tween;
            } ]
        };

// Animations created synchronously will run synchronously
    function createFxNow() {
        setTimeout(function() {
            fxNow = undefined;
        });
        return ( fxNow = jQuery.now() );
    }

// Generate parameters to create a standard animation
    function genFx( type, includeWidth ) {
        var which,
            i = 0,
            attrs = { height: type };

        // if we include width, step value is 1 to do all cssExpand values,
        // if we don't include width, step value is 2 to skip over Left and Right
        includeWidth = includeWidth ? 1 : 0;
        for ( ; i < 4 ; i += 2 - includeWidth ) {
            which = cssExpand[ i ];
            attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
        }

        if ( includeWidth ) {
            attrs.opacity = attrs.width = type;
        }

        return attrs;
    }

    function createTween( value, prop, animation ) {
        var tween,
            collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
            index = 0,
            length = collection.length;
        for ( ; index < length; index++ ) {
            if ( (tween = collection[ index ].call( animation, prop, value )) ) {

                // we're done with this property
                return tween;
            }
        }
    }

    function defaultPrefilter( elem, props, opts ) {
        /* jshint validthis: true */
        var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
            anim = this,
            orig = {},
            style = elem.style,
            hidden = elem.nodeType && isHidden( elem ),
            dataShow = data_priv.get( elem, "fxshow" );

        // handle queue: false promises
        if ( !opts.queue ) {
            hooks = jQuery._queueHooks( elem, "fx" );
            if ( hooks.unqueued == null ) {
                hooks.unqueued = 0;
                oldfire = hooks.empty.fire;
                hooks.empty.fire = function() {
                    if ( !hooks.unqueued ) {
                        oldfire();
                    }
                };
            }
            hooks.unqueued++;

            anim.always(function() {
                // doing this makes sure that the complete handler will be called
                // before this completes
                anim.always(function() {
                    hooks.unqueued--;
                    if ( !jQuery.queue( elem, "fx" ).length ) {
                        hooks.empty.fire();
                    }
                });
            });
        }

        // height/width overflow pass
        if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE9-10 do not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

            // Set display property to inline-block for height/width
            // animations on inline elements that are having width/height animated
            display = jQuery.css( elem, "display" );

            // Test default display if display is currently "none"
            checkDisplay = display === "none" ?
                data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

            if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
                style.display = "inline-block";
            }
        }

        if ( opts.overflow ) {
            style.overflow = "hidden";
            anim.always(function() {
                style.overflow = opts.overflow[ 0 ];
                style.overflowX = opts.overflow[ 1 ];
                style.overflowY = opts.overflow[ 2 ];
            });
        }

        // show/hide pass
        for ( prop in props ) {
            value = props[ prop ];
            if ( rfxtypes.exec( value ) ) {
                delete props[ prop ];
                toggle = toggle || value === "toggle";
                if ( value === ( hidden ? "hide" : "show" ) ) {

                    // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
                    if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
                        hidden = true;
                    } else {
                        continue;
                    }
                }
                orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

                // Any non-fx value stops us from restoring the original display value
            } else {
                display = undefined;
            }
        }

        if ( !jQuery.isEmptyObject( orig ) ) {
            if ( dataShow ) {
                if ( "hidden" in dataShow ) {
                    hidden = dataShow.hidden;
                }
            } else {
                dataShow = data_priv.access( elem, "fxshow", {} );
            }

            // store state if its toggle - enables .stop().toggle() to "reverse"
            if ( toggle ) {
                dataShow.hidden = !hidden;
            }
            if ( hidden ) {
                jQuery( elem ).show();
            } else {
                anim.done(function() {
                    jQuery( elem ).hide();
                });
            }
            anim.done(function() {
                var prop;

                data_priv.remove( elem, "fxshow" );
                for ( prop in orig ) {
                    jQuery.style( elem, prop, orig[ prop ] );
                }
            });
            for ( prop in orig ) {
                tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

                if ( !( prop in dataShow ) ) {
                    dataShow[ prop ] = tween.start;
                    if ( hidden ) {
                        tween.end = tween.start;
                        tween.start = prop === "width" || prop === "height" ? 1 : 0;
                    }
                }
            }

            // If this is a noop like .hide().hide(), restore an overwritten display value
        } else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
            style.display = display;
        }
    }

    function propFilter( props, specialEasing ) {
        var index, name, easing, value, hooks;

        // camelCase, specialEasing and expand cssHook pass
        for ( index in props ) {
            name = jQuery.camelCase( index );
            easing = specialEasing[ name ];
            value = props[ index ];
            if ( jQuery.isArray( value ) ) {
                easing = value[ 1 ];
                value = props[ index ] = value[ 0 ];
            }

            if ( index !== name ) {
                props[ name ] = value;
                delete props[ index ];
            }

            hooks = jQuery.cssHooks[ name ];
            if ( hooks && "expand" in hooks ) {
                value = hooks.expand( value );
                delete props[ name ];

                // not quite $.extend, this wont overwrite keys already present.
                // also - reusing 'index' from above because we have the correct "name"
                for ( index in value ) {
                    if ( !( index in props ) ) {
                        props[ index ] = value[ index ];
                        specialEasing[ index ] = easing;
                    }
                }
            } else {
                specialEasing[ name ] = easing;
            }
        }
    }

    function Animation( elem, properties, options ) {
        var result,
            stopped,
            index = 0,
            length = animationPrefilters.length,
            deferred = jQuery.Deferred().always( function() {
                // don't match elem in the :animated selector
                delete tick.elem;
            }),
            tick = function() {
                if ( stopped ) {
                    return false;
                }
                var currentTime = fxNow || createFxNow(),
                    remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
                // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
                    temp = remaining / animation.duration || 0,
                    percent = 1 - temp,
                    index = 0,
                    length = animation.tweens.length;

                for ( ; index < length ; index++ ) {
                    animation.tweens[ index ].run( percent );
                }

                deferred.notifyWith( elem, [ animation, percent, remaining ]);

                if ( percent < 1 && length ) {
                    return remaining;
                } else {
                    deferred.resolveWith( elem, [ animation ] );
                    return false;
                }
            },
            animation = deferred.promise({
                elem: elem,
                props: jQuery.extend( {}, properties ),
                opts: jQuery.extend( true, { specialEasing: {} }, options ),
                originalProperties: properties,
                originalOptions: options,
                startTime: fxNow || createFxNow(),
                duration: options.duration,
                tweens: [],
                createTween: function( prop, end ) {
                    var tween = jQuery.Tween( elem, animation.opts, prop, end,
                            animation.opts.specialEasing[ prop ] || animation.opts.easing );
                    animation.tweens.push( tween );
                    return tween;
                },
                stop: function( gotoEnd ) {
                    var index = 0,
                    // if we are going to the end, we want to run all the tweens
                    // otherwise we skip this part
                        length = gotoEnd ? animation.tweens.length : 0;
                    if ( stopped ) {
                        return this;
                    }
                    stopped = true;
                    for ( ; index < length ; index++ ) {
                        animation.tweens[ index ].run( 1 );
                    }

                    // resolve when we played the last frame
                    // otherwise, reject
                    if ( gotoEnd ) {
                        deferred.resolveWith( elem, [ animation, gotoEnd ] );
                    } else {
                        deferred.rejectWith( elem, [ animation, gotoEnd ] );
                    }
                    return this;
                }
            }),
            props = animation.props;

        propFilter( props, animation.opts.specialEasing );

        for ( ; index < length ; index++ ) {
            result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
            if ( result ) {
                return result;
            }
        }

        jQuery.map( props, createTween, animation );

        if ( jQuery.isFunction( animation.opts.start ) ) {
            animation.opts.start.call( elem, animation );
        }

        jQuery.fx.timer(
            jQuery.extend( tick, {
                elem: elem,
                anim: animation,
                queue: animation.opts.queue
            })
        );

        // attach callbacks from options
        return animation.progress( animation.opts.progress )
            .done( animation.opts.done, animation.opts.complete )
            .fail( animation.opts.fail )
            .always( animation.opts.always );
    }

    jQuery.Animation = jQuery.extend( Animation, {

        tweener: function( props, callback ) {
            if ( jQuery.isFunction( props ) ) {
                callback = props;
                props = [ "*" ];
            } else {
                props = props.split(" ");
            }

            var prop,
                index = 0,
                length = props.length;

            for ( ; index < length ; index++ ) {
                prop = props[ index ];
                tweeners[ prop ] = tweeners[ prop ] || [];
                tweeners[ prop ].unshift( callback );
            }
        },

        prefilter: function( callback, prepend ) {
            if ( prepend ) {
                animationPrefilters.unshift( callback );
            } else {
                animationPrefilters.push( callback );
            }
        }
    });

    jQuery.speed = function( speed, easing, fn ) {
        var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
            complete: fn || !fn && easing ||
                jQuery.isFunction( speed ) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
        };

        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

        // normalize opt.queue - true/undefined/null -> "fx"
        if ( opt.queue == null || opt.queue === true ) {
            opt.queue = "fx";
        }

        // Queueing
        opt.old = opt.complete;

        opt.complete = function() {
            if ( jQuery.isFunction( opt.old ) ) {
                opt.old.call( this );
            }

            if ( opt.queue ) {
                jQuery.dequeue( this, opt.queue );
            }
        };

        return opt;
    };

    jQuery.fn.extend({
        fadeTo: function( speed, to, easing, callback ) {

            // show any hidden elements after setting opacity to 0
            return this.filter( isHidden ).css( "opacity", 0 ).show()

                // animate to the value specified
                .end().animate({ opacity: to }, speed, easing, callback );
        },
        animate: function( prop, speed, easing, callback ) {
            var empty = jQuery.isEmptyObject( prop ),
                optall = jQuery.speed( speed, easing, callback ),
                doAnimation = function() {
                    // Operate on a copy of prop so per-property easing won't be lost
                    var anim = Animation( this, jQuery.extend( {}, prop ), optall );

                    // Empty animations, or finishing resolves immediately
                    if ( empty || data_priv.get( this, "finish" ) ) {
                        anim.stop( true );
                    }
                };
            doAnimation.finish = doAnimation;

            return empty || optall.queue === false ?
                this.each( doAnimation ) :
                this.queue( optall.queue, doAnimation );
        },
        stop: function( type, clearQueue, gotoEnd ) {
            var stopQueue = function( hooks ) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop( gotoEnd );
            };

            if ( typeof type !== "string" ) {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            if ( clearQueue && type !== false ) {
                this.queue( type || "fx", [] );
            }

            return this.each(function() {
                var dequeue = true,
                    index = type != null && type + "queueHooks",
                    timers = jQuery.timers,
                    data = data_priv.get( this );

                if ( index ) {
                    if ( data[ index ] && data[ index ].stop ) {
                        stopQueue( data[ index ] );
                    }
                } else {
                    for ( index in data ) {
                        if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
                            stopQueue( data[ index ] );
                        }
                    }
                }

                for ( index = timers.length; index--; ) {
                    if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
                        timers[ index ].anim.stop( gotoEnd );
                        dequeue = false;
                        timers.splice( index, 1 );
                    }
                }

                // start the next in the queue if the last step wasn't forced
                // timers currently will call their complete callbacks, which will dequeue
                // but only if they were gotoEnd
                if ( dequeue || !gotoEnd ) {
                    jQuery.dequeue( this, type );
                }
            });
        },
        finish: function( type ) {
            if ( type !== false ) {
                type = type || "fx";
            }
            return this.each(function() {
                var index,
                    data = data_priv.get( this ),
                    queue = data[ type + "queue" ],
                    hooks = data[ type + "queueHooks" ],
                    timers = jQuery.timers,
                    length = queue ? queue.length : 0;

                // enable finishing flag on private data
                data.finish = true;

                // empty the queue first
                jQuery.queue( this, type, [] );

                if ( hooks && hooks.stop ) {
                    hooks.stop.call( this, true );
                }

                // look for any active animations, and finish them
                for ( index = timers.length; index--; ) {
                    if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
                        timers[ index ].anim.stop( true );
                        timers.splice( index, 1 );
                    }
                }

                // look for any animations in the old queue and finish them
                for ( index = 0; index < length; index++ ) {
                    if ( queue[ index ] && queue[ index ].finish ) {
                        queue[ index ].finish.call( this );
                    }
                }

                // turn off finishing flag
                delete data.finish;
            });
        }
    });

    jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
        var cssFn = jQuery.fn[ name ];
        jQuery.fn[ name ] = function( speed, easing, callback ) {
            return speed == null || typeof speed === "boolean" ?
                cssFn.apply( this, arguments ) :
                this.animate( genFx( name, true ), speed, easing, callback );
        };
    });

// Generate shortcuts for custom animations
    jQuery.each({
        slideDown: genFx("show"),
        slideUp: genFx("hide"),
        slideToggle: genFx("toggle"),
        fadeIn: { opacity: "show" },
        fadeOut: { opacity: "hide" },
        fadeToggle: { opacity: "toggle" }
    }, function( name, props ) {
        jQuery.fn[ name ] = function( speed, easing, callback ) {
            return this.animate( props, speed, easing, callback );
        };
    });

    jQuery.timers = [];
    jQuery.fx.tick = function() {
        var timer,
            i = 0,
            timers = jQuery.timers;

        fxNow = jQuery.now();

        for ( ; i < timers.length; i++ ) {
            timer = timers[ i ];
            // Checks the timer has not already been removed
            if ( !timer() && timers[ i ] === timer ) {
                timers.splice( i--, 1 );
            }
        }

        if ( !timers.length ) {
            jQuery.fx.stop();
        }
        fxNow = undefined;
    };

    jQuery.fx.timer = function( timer ) {
        jQuery.timers.push( timer );
        if ( timer() ) {
            jQuery.fx.start();
        } else {
            jQuery.timers.pop();
        }
    };

    jQuery.fx.interval = 13;

    jQuery.fx.start = function() {
        if ( !timerId ) {
            timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
        }
    };

    jQuery.fx.stop = function() {
        clearInterval( timerId );
        timerId = null;
    };

    jQuery.fx.speeds = {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    };


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
    jQuery.fn.delay = function( time, type ) {
        time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
        type = type || "fx";

        return this.queue( type, function( next, hooks ) {
            var timeout = setTimeout( next, time );
            hooks.stop = function() {
                clearTimeout( timeout );
            };
        });
    };


    (function() {
        var input = document.createElement( "input" ),
            select = document.createElement( "select" ),
            opt = select.appendChild( document.createElement( "option" ) );

        input.type = "checkbox";

        // Support: iOS 5.1, Android 4.x, Android 2.3
        // Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
        support.checkOn = input.value !== "";

        // Must access the parent to make an option select properly
        // Support: IE9, IE10
        support.optSelected = opt.selected;

        // Make sure that the options inside disabled selects aren't marked as disabled
        // (WebKit marks them as disabled)
        select.disabled = true;
        support.optDisabled = !opt.disabled;

        // Check if an input maintains its value after becoming a radio
        // Support: IE9, IE10
        input = document.createElement( "input" );
        input.value = "t";
        input.type = "radio";
        support.radioValue = input.value === "t";
    })();


    var nodeHook, boolHook,
        attrHandle = jQuery.expr.attrHandle;

    jQuery.fn.extend({
        attr: function( name, value ) {
            return access( this, jQuery.attr, name, value, arguments.length > 1 );
        },

        removeAttr: function( name ) {
            return this.each(function() {
                jQuery.removeAttr( this, name );
            });
        }
    });

    jQuery.extend({
        attr: function( elem, name, value ) {
            var hooks, ret,
                nType = elem.nodeType;

            // don't get/set attributes on text, comment and attribute nodes
            if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
                return;
            }

            // Fallback to prop when attributes are not supported
            if ( typeof elem.getAttribute === strundefined ) {
                return jQuery.prop( elem, name, value );
            }

            // All attributes are lowercase
            // Grab necessary hook if one is defined
            if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[ name ] ||
                    ( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
            }

            if ( value !== undefined ) {

                if ( value === null ) {
                    jQuery.removeAttr( elem, name );

                } else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
                    return ret;

                } else {
                    elem.setAttribute( name, value + "" );
                    return value;
                }

            } else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
                return ret;

            } else {
                ret = jQuery.find.attr( elem, name );

                // Non-existent attributes return null, we normalize to undefined
                return ret == null ?
                    undefined :
                    ret;
            }
        },

        removeAttr: function( elem, value ) {
            var name, propName,
                i = 0,
                attrNames = value && value.match( rnotwhite );

            if ( attrNames && elem.nodeType === 1 ) {
                while ( (name = attrNames[i++]) ) {
                    propName = jQuery.propFix[ name ] || name;

                    // Boolean attributes get special treatment (#10870)
                    if ( jQuery.expr.match.bool.test( name ) ) {
                        // Set corresponding property to false
                        elem[ propName ] = false;
                    }

                    elem.removeAttribute( name );
                }
            }
        },

        attrHooks: {
            type: {
                set: function( elem, value ) {
                    if ( !support.radioValue && value === "radio" &&
                        jQuery.nodeName( elem, "input" ) ) {
                        // Setting the type on a radio button after the value resets the value in IE6-9
                        // Reset value to default in case type is set after value during creation
                        var val = elem.value;
                        elem.setAttribute( "type", value );
                        if ( val ) {
                            elem.value = val;
                        }
                        return value;
                    }
                }
            }
        }
    });

// Hooks for boolean attributes
    boolHook = {
        set: function( elem, value, name ) {
            if ( value === false ) {
                // Remove boolean attributes when set to false
                jQuery.removeAttr( elem, name );
            } else {
                elem.setAttribute( name, name );
            }
            return name;
        }
    };
    jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
        var getter = attrHandle[ name ] || jQuery.find.attr;

        attrHandle[ name ] = function( elem, name, isXML ) {
            var ret, handle;
            if ( !isXML ) {
                // Avoid an infinite loop by temporarily removing this function from the getter
                handle = attrHandle[ name ];
                attrHandle[ name ] = ret;
                ret = getter( elem, name, isXML ) != null ?
                    name.toLowerCase() :
                    null;
                attrHandle[ name ] = handle;
            }
            return ret;
        };
    });




    var rfocusable = /^(?:input|select|textarea|button)$/i;

    jQuery.fn.extend({
        prop: function( name, value ) {
            return access( this, jQuery.prop, name, value, arguments.length > 1 );
        },

        removeProp: function( name ) {
            return this.each(function() {
                delete this[ jQuery.propFix[ name ] || name ];
            });
        }
    });

    jQuery.extend({
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },

        prop: function( elem, name, value ) {
            var ret, hooks, notxml,
                nType = elem.nodeType;

            // don't get/set properties on text, comment and attribute nodes
            if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
                return;
            }

            notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

            if ( notxml ) {
                // Fix name and attach hooks
                name = jQuery.propFix[ name ] || name;
                hooks = jQuery.propHooks[ name ];
            }

            if ( value !== undefined ) {
                return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
                    ret :
                    ( elem[ name ] = value );

            } else {
                return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
                    ret :
                    elem[ name ];
            }
        },

        propHooks: {
            tabIndex: {
                get: function( elem ) {
                    return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
                        elem.tabIndex :
                        -1;
                }
            }
        }
    });

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
    if ( !support.optSelected ) {
        jQuery.propHooks.selected = {
            get: function( elem ) {
                var parent = elem.parentNode;
                if ( parent && parent.parentNode ) {
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }

    jQuery.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
    ], function() {
        jQuery.propFix[ this.toLowerCase() ] = this;
    });




    var rclass = /[\t\r\n\f]/g;

    jQuery.fn.extend({
        addClass: function( value ) {
            var classes, elem, cur, clazz, j, finalValue,
                proceed = typeof value === "string" && value,
                i = 0,
                len = this.length;

            if ( jQuery.isFunction( value ) ) {
                return this.each(function( j ) {
                    jQuery( this ).addClass( value.call( this, j, this.className ) );
                });
            }

            if ( proceed ) {
                // The disjunction here is for better compressibility (see removeClass)
                classes = ( value || "" ).match( rnotwhite ) || [];

                for ( ; i < len; i++ ) {
                    elem = this[ i ];
                    cur = elem.nodeType === 1 && ( elem.className ?
                        ( " " + elem.className + " " ).replace( rclass, " " ) :
                        " "
                        );

                    if ( cur ) {
                        j = 0;
                        while ( (clazz = classes[j++]) ) {
                            if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
                                cur += clazz + " ";
                            }
                        }

                        // only assign if different to avoid unneeded rendering.
                        finalValue = jQuery.trim( cur );
                        if ( elem.className !== finalValue ) {
                            elem.className = finalValue;
                        }
                    }
                }
            }

            return this;
        },

        removeClass: function( value ) {
            var classes, elem, cur, clazz, j, finalValue,
                proceed = arguments.length === 0 || typeof value === "string" && value,
                i = 0,
                len = this.length;

            if ( jQuery.isFunction( value ) ) {
                return this.each(function( j ) {
                    jQuery( this ).removeClass( value.call( this, j, this.className ) );
                });
            }
            if ( proceed ) {
                classes = ( value || "" ).match( rnotwhite ) || [];

                for ( ; i < len; i++ ) {
                    elem = this[ i ];
                    // This expression is here for better compressibility (see addClass)
                    cur = elem.nodeType === 1 && ( elem.className ?
                        ( " " + elem.className + " " ).replace( rclass, " " ) :
                        ""
                        );

                    if ( cur ) {
                        j = 0;
                        while ( (clazz = classes[j++]) ) {
                            // Remove *all* instances
                            while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
                                cur = cur.replace( " " + clazz + " ", " " );
                            }
                        }

                        // only assign if different to avoid unneeded rendering.
                        finalValue = value ? jQuery.trim( cur ) : "";
                        if ( elem.className !== finalValue ) {
                            elem.className = finalValue;
                        }
                    }
                }
            }

            return this;
        },

        toggleClass: function( value, stateVal ) {
            var type = typeof value;

            if ( typeof stateVal === "boolean" && type === "string" ) {
                return stateVal ? this.addClass( value ) : this.removeClass( value );
            }

            if ( jQuery.isFunction( value ) ) {
                return this.each(function( i ) {
                    jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
                });
            }

            return this.each(function() {
                if ( type === "string" ) {
                    // toggle individual class names
                    var className,
                        i = 0,
                        self = jQuery( this ),
                        classNames = value.match( rnotwhite ) || [];

                    while ( (className = classNames[ i++ ]) ) {
                        // check each className given, space separated list
                        if ( self.hasClass( className ) ) {
                            self.removeClass( className );
                        } else {
                            self.addClass( className );
                        }
                    }

                    // Toggle whole class name
                } else if ( type === strundefined || type === "boolean" ) {
                    if ( this.className ) {
                        // store className if set
                        data_priv.set( this, "__className__", this.className );
                    }

                    // If the element has a class name or if we're passed "false",
                    // then remove the whole classname (if there was one, the above saved it).
                    // Otherwise bring back whatever was previously saved (if anything),
                    // falling back to the empty string if nothing was stored.
                    this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
                }
            });
        },

        hasClass: function( selector ) {
            var className = " " + selector + " ",
                i = 0,
                l = this.length;
            for ( ; i < l; i++ ) {
                if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
                    return true;
                }
            }

            return false;
        }
    });




    var rreturn = /\r/g;

    jQuery.fn.extend({
        val: function( value ) {
            var hooks, ret, isFunction,
                elem = this[0];

            if ( !arguments.length ) {
                if ( elem ) {
                    hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

                    if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
                        return ret;
                    }

                    ret = elem.value;

                    return typeof ret === "string" ?
                        // handle most common string cases
                        ret.replace(rreturn, "") :
                        // handle cases where value is null/undef or number
                            ret == null ? "" : ret;
                }

                return;
            }

            isFunction = jQuery.isFunction( value );

            return this.each(function( i ) {
                var val;

                if ( this.nodeType !== 1 ) {
                    return;
                }

                if ( isFunction ) {
                    val = value.call( this, i, jQuery( this ).val() );
                } else {
                    val = value;
                }

                // Treat null/undefined as ""; convert numbers to string
                if ( val == null ) {
                    val = "";

                } else if ( typeof val === "number" ) {
                    val += "";

                } else if ( jQuery.isArray( val ) ) {
                    val = jQuery.map( val, function( value ) {
                        return value == null ? "" : value + "";
                    });
                }

                hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

                // If set returns undefined, fall back to normal setting
                if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
                    this.value = val;
                }
            });
        }
    });

    jQuery.extend({
        valHooks: {
            option: {
                get: function( elem ) {
                    var val = jQuery.find.attr( elem, "value" );
                    return val != null ?
                        val :
                        // Support: IE10-11+
                        // option.text throws exceptions (#14686, #14858)
                        jQuery.trim( jQuery.text( elem ) );
                }
            },
            select: {
                get: function( elem ) {
                    var value, option,
                        options = elem.options,
                        index = elem.selectedIndex,
                        one = elem.type === "select-one" || index < 0,
                        values = one ? null : [],
                        max = one ? index + 1 : options.length,
                        i = index < 0 ?
                            max :
                            one ? index : 0;

                    // Loop through all the selected options
                    for ( ; i < max; i++ ) {
                        option = options[ i ];

                        // IE6-9 doesn't update selected after form reset (#2551)
                        if ( ( option.selected || i === index ) &&
                            // Don't return options that are disabled or in a disabled optgroup
                            ( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
                            ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

                            // Get the specific value for the option
                            value = jQuery( option ).val();

                            // We don't need an array for one selects
                            if ( one ) {
                                return value;
                            }

                            // Multi-Selects return an array
                            values.push( value );
                        }
                    }

                    return values;
                },

                set: function( elem, value ) {
                    var optionSet, option,
                        options = elem.options,
                        values = jQuery.makeArray( value ),
                        i = options.length;

                    while ( i-- ) {
                        option = options[ i ];
                        if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
                            optionSet = true;
                        }
                    }

                    // force browsers to behave consistently when non-matching value is set
                    if ( !optionSet ) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        }
    });

// Radios and checkboxes getter/setter
    jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[ this ] = {
            set: function( elem, value ) {
                if ( jQuery.isArray( value ) ) {
                    return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
                }
            }
        };
        if ( !support.checkOn ) {
            jQuery.valHooks[ this ].get = function( elem ) {
                // Support: Webkit
                // "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            };
        }
    });




// Return jQuery for attributes-only inclusion


    jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

        // Handle event binding
        jQuery.fn[ name ] = function( data, fn ) {
            return arguments.length > 0 ?
                this.on( name, null, data, fn ) :
                this.trigger( name );
        };
    });

    jQuery.fn.extend({
        hover: function( fnOver, fnOut ) {
            return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
        },

        bind: function( types, data, fn ) {
            return this.on( types, null, data, fn );
        },
        unbind: function( types, fn ) {
            return this.off( types, null, fn );
        },

        delegate: function( selector, types, data, fn ) {
            return this.on( types, selector, data, fn );
        },
        undelegate: function( selector, types, fn ) {
            // ( namespace ) or ( selector, types [, fn] )
            return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
        }
    });


    var nonce = jQuery.now();

    var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
    jQuery.parseJSON = function( data ) {
        return JSON.parse( data + "" );
    };


// Cross-browser xml parsing
    jQuery.parseXML = function( data ) {
        var xml, tmp;
        if ( !data || typeof data !== "string" ) {
            return null;
        }

        // Support: IE9
        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString( data, "text/xml" );
        } catch ( e ) {
            xml = undefined;
        }

        if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
            jQuery.error( "Invalid XML: " + data );
        }
        return xml;
    };


    var
    // Document location
        ajaxLocParts,
        ajaxLocation,

        rhash = /#.*$/,
        rts = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
    // #7653, #8125, #8152: local protocol detection
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

    /* Prefilters
     * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
     * 2) These are called:
     *    - BEFORE asking for a transport
     *    - AFTER param serialization (s.data is a string if s.processData is true)
     * 3) key is the dataType
     * 4) the catchall symbol "*" can be used
     * 5) execution will start with transport dataType and THEN continue down to "*" if needed
     */
        prefilters = {},

    /* Transports bindings
     * 1) key is the dataType
     * 2) the catchall symbol "*" can be used
     * 3) selection will start with transport dataType and THEN go to "*" if needed
     */
        transports = {},

    // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
        allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
    try {
        ajaxLocation = location.href;
    } catch( e ) {
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        ajaxLocation = document.createElement( "a" );
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }

// Segment location into parts
    ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports( structure ) {

        // dataTypeExpression is optional and defaults to "*"
        return function( dataTypeExpression, func ) {

            if ( typeof dataTypeExpression !== "string" ) {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }

            var dataType,
                i = 0,
                dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

            if ( jQuery.isFunction( func ) ) {
                // For each dataType in the dataTypeExpression
                while ( (dataType = dataTypes[i++]) ) {
                    // Prepend if requested
                    if ( dataType[0] === "+" ) {
                        dataType = dataType.slice( 1 ) || "*";
                        (structure[ dataType ] = structure[ dataType ] || []).unshift( func );

                        // Otherwise append
                    } else {
                        (structure[ dataType ] = structure[ dataType ] || []).push( func );
                    }
                }
            }
        };
    }

// Base inspection function for prefilters and transports
    function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

        var inspected = {},
            seekingTransport = ( structure === transports );

        function inspect( dataType ) {
            var selected;
            inspected[ dataType ] = true;
            jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
                var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
                if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
                    options.dataTypes.unshift( dataTypeOrTransport );
                    inspect( dataTypeOrTransport );
                    return false;
                } else if ( seekingTransport ) {
                    return !( selected = dataTypeOrTransport );
                }
            });
            return selected;
        }

        return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
    }

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
    function ajaxExtend( target, src ) {
        var key, deep,
            flatOptions = jQuery.ajaxSettings.flatOptions || {};

        for ( key in src ) {
            if ( src[ key ] !== undefined ) {
                ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
            }
        }
        if ( deep ) {
            jQuery.extend( true, target, deep );
        }

        return target;
    }

    /* Handles responses to an ajax request:
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     */
    function ajaxHandleResponses( s, jqXHR, responses ) {

        var ct, type, finalDataType, firstDataType,
            contents = s.contents,
            dataTypes = s.dataTypes;

        // Remove auto dataType and get content-type in the process
        while ( dataTypes[ 0 ] === "*" ) {
            dataTypes.shift();
            if ( ct === undefined ) {
                ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
        }

        // Check if we're dealing with a known content-type
        if ( ct ) {
            for ( type in contents ) {
                if ( contents[ type ] && contents[ type ].test( ct ) ) {
                    dataTypes.unshift( type );
                    break;
                }
            }
        }

        // Check to see if we have a response for the expected dataType
        if ( dataTypes[ 0 ] in responses ) {
            finalDataType = dataTypes[ 0 ];
        } else {
            // Try convertible dataTypes
            for ( type in responses ) {
                if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
                    finalDataType = type;
                    break;
                }
                if ( !firstDataType ) {
                    firstDataType = type;
                }
            }
            // Or just use first one
            finalDataType = finalDataType || firstDataType;
        }

        // If we found a dataType
        // We add the dataType to the list if needed
        // and return the corresponding response
        if ( finalDataType ) {
            if ( finalDataType !== dataTypes[ 0 ] ) {
                dataTypes.unshift( finalDataType );
            }
            return responses[ finalDataType ];
        }
    }

    /* Chain conversions given the request and the original response
     * Also sets the responseXXX fields on the jqXHR instance
     */
    function ajaxConvert( s, response, jqXHR, isSuccess ) {
        var conv2, current, conv, tmp, prev,
            converters = {},
        // Work with a copy of dataTypes in case we need to modify it for conversion
            dataTypes = s.dataTypes.slice();

        // Create converters map with lowercased keys
        if ( dataTypes[ 1 ] ) {
            for ( conv in s.converters ) {
                converters[ conv.toLowerCase() ] = s.converters[ conv ];
            }
        }

        current = dataTypes.shift();

        // Convert to each sequential dataType
        while ( current ) {

            if ( s.responseFields[ current ] ) {
                jqXHR[ s.responseFields[ current ] ] = response;
            }

            // Apply the dataFilter if provided
            if ( !prev && isSuccess && s.dataFilter ) {
                response = s.dataFilter( response, s.dataType );
            }

            prev = current;
            current = dataTypes.shift();

            if ( current ) {

                // There's only work to do if current dataType is non-auto
                if ( current === "*" ) {

                    current = prev;

                    // Convert response if prev dataType is non-auto and differs from current
                } else if ( prev !== "*" && prev !== current ) {

                    // Seek a direct converter
                    conv = converters[ prev + " " + current ] || converters[ "* " + current ];

                    // If none found, seek a pair
                    if ( !conv ) {
                        for ( conv2 in converters ) {

                            // If conv2 outputs current
                            tmp = conv2.split( " " );
                            if ( tmp[ 1 ] === current ) {

                                // If prev can be converted to accepted input
                                conv = converters[ prev + " " + tmp[ 0 ] ] ||
                                    converters[ "* " + tmp[ 0 ] ];
                                if ( conv ) {
                                    // Condense equivalence converters
                                    if ( conv === true ) {
                                        conv = converters[ conv2 ];

                                        // Otherwise, insert the intermediate dataType
                                    } else if ( converters[ conv2 ] !== true ) {
                                        current = tmp[ 0 ];
                                        dataTypes.unshift( tmp[ 1 ] );
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    // Apply converter (if not an equivalence)
                    if ( conv !== true ) {

                        // Unless errors are allowed to bubble, catch and return them
                        if ( conv && s[ "throws" ] ) {
                            response = conv( response );
                        } else {
                            try {
                                response = conv( response );
                            } catch ( e ) {
                                return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
                            }
                        }
                    }
                }
            }
        }

        return { state: "success", data: response };
    }

    jQuery.extend({

        // Counter for holding the number of active queries
        active: 0,

        // Last-Modified header cache for next request
        lastModified: {},
        etag: {},

        ajaxSettings: {
            url: ajaxLocation,
            type: "GET",
            isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            /*
             timeout: 0,
             data: null,
             dataType: null,
             username: null,
             password: null,
             cache: null,
             throws: false,
             traditional: false,
             headers: {},
             */

            accepts: {
                "*": allTypes,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },

            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },

            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },

            // Data converters
            // Keys separate source (or catchall "*") and destination types with a single space
            converters: {

                // Convert anything to text
                "* text": String,

                // Text to html (true = no transformation)
                "text html": true,

                // Evaluate text as a json expression
                "text json": jQuery.parseJSON,

                // Parse text as xml
                "text xml": jQuery.parseXML
            },

            // For options that shouldn't be deep extended:
            // you can add your own custom options here if
            // and when you create one that shouldn't be
            // deep extended (see ajaxExtend)
            flatOptions: {
                url: true,
                context: true
            }
        },

        // Creates a full fledged settings object into target
        // with both ajaxSettings and settings fields.
        // If target is omitted, writes into ajaxSettings.
        ajaxSetup: function( target, settings ) {
            return settings ?

                // Building a settings object
                ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

                // Extending ajaxSettings
                ajaxExtend( jQuery.ajaxSettings, target );
        },

        ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
        ajaxTransport: addToPrefiltersOrTransports( transports ),

        // Main method
        ajax: function( url, options ) {

            // If url is an object, simulate pre-1.5 signature
            if ( typeof url === "object" ) {
                options = url;
                url = undefined;
            }

            // Force options to be an object
            options = options || {};

            var transport,
            // URL without anti-cache param
                cacheURL,
            // Response headers
                responseHeadersString,
                responseHeaders,
            // timeout handle
                timeoutTimer,
            // Cross-domain detection vars
                parts,
            // To know if global events are to be dispatched
                fireGlobals,
            // Loop variable
                i,
            // Create the final options object
                s = jQuery.ajaxSetup( {}, options ),
            // Callbacks context
                callbackContext = s.context || s,
            // Context for global events is callbackContext if it is a DOM node or jQuery collection
                globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
                    jQuery( callbackContext ) :
                    jQuery.event,
            // Deferreds
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery.Callbacks("once memory"),
            // Status-dependent callbacks
                statusCode = s.statusCode || {},
            // Headers (they are sent all at once)
                requestHeaders = {},
                requestHeadersNames = {},
            // The jqXHR state
                state = 0,
            // Default abort message
                strAbort = "canceled",
            // Fake xhr
                jqXHR = {
                    readyState: 0,

                    // Builds headers hashtable if needed
                    getResponseHeader: function( key ) {
                        var match;
                        if ( state === 2 ) {
                            if ( !responseHeaders ) {
                                responseHeaders = {};
                                while ( (match = rheaders.exec( responseHeadersString )) ) {
                                    responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
                                }
                            }
                            match = responseHeaders[ key.toLowerCase() ];
                        }
                        return match == null ? null : match;
                    },

                    // Raw string
                    getAllResponseHeaders: function() {
                        return state === 2 ? responseHeadersString : null;
                    },

                    // Caches the header
                    setRequestHeader: function( name, value ) {
                        var lname = name.toLowerCase();
                        if ( !state ) {
                            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
                            requestHeaders[ name ] = value;
                        }
                        return this;
                    },

                    // Overrides response content-type header
                    overrideMimeType: function( type ) {
                        if ( !state ) {
                            s.mimeType = type;
                        }
                        return this;
                    },

                    // Status-dependent callbacks
                    statusCode: function( map ) {
                        var code;
                        if ( map ) {
                            if ( state < 2 ) {
                                for ( code in map ) {
                                    // Lazy-add the new callback in a way that preserves old ones
                                    statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
                                }
                            } else {
                                // Execute the appropriate callbacks
                                jqXHR.always( map[ jqXHR.status ] );
                            }
                        }
                        return this;
                    },

                    // Cancel the request
                    abort: function( statusText ) {
                        var finalText = statusText || strAbort;
                        if ( transport ) {
                            transport.abort( finalText );
                        }
                        done( 0, finalText );
                        return this;
                    }
                };

            // Attach deferreds
            deferred.promise( jqXHR ).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;

            // Remove hash character (#7531: and string promotion)
            // Add protocol if not provided (prefilters might expect it)
            // Handle falsy url in the settings object (#10093: consistency with old signature)
            // We also use the url parameter if available
            s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
                .replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

            // Alias method option to type as per ticket #12004
            s.type = options.method || options.type || s.method || s.type;

            // Extract dataTypes list
            s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

            // A cross-domain request is in order when we have a protocol:host:port mismatch
            if ( s.crossDomain == null ) {
                parts = rurl.exec( s.url.toLowerCase() );
                s.crossDomain = !!( parts &&
                    ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
                        ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
                    );
            }

            // Convert data if not already a string
            if ( s.data && s.processData && typeof s.data !== "string" ) {
                s.data = jQuery.param( s.data, s.traditional );
            }

            // Apply prefilters
            inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

            // If request was aborted inside a prefilter, stop there
            if ( state === 2 ) {
                return jqXHR;
            }

            // We can fire global events as of now if asked to
            fireGlobals = s.global;

            // Watch for a new set of requests
            if ( fireGlobals && jQuery.active++ === 0 ) {
                jQuery.event.trigger("ajaxStart");
            }

            // Uppercase the type
            s.type = s.type.toUpperCase();

            // Determine if request has content
            s.hasContent = !rnoContent.test( s.type );

            // Save the URL in case we're toying with the If-Modified-Since
            // and/or If-None-Match header later on
            cacheURL = s.url;

            // More options handling for requests with no content
            if ( !s.hasContent ) {

                // If data is available, append data to url
                if ( s.data ) {
                    cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
                    // #9682: remove data so that it's not used in an eventual retry
                    delete s.data;
                }

                // Add anti-cache in url if needed
                if ( s.cache === false ) {
                    s.url = rts.test( cacheURL ) ?

                        // If there is already a '_' parameter, set its value
                        cacheURL.replace( rts, "$1_=" + nonce++ ) :

                        // Otherwise add one to the end
                        cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
                }
            }

            // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
            if ( s.ifModified ) {
                if ( jQuery.lastModified[ cacheURL ] ) {
                    jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
                }
                if ( jQuery.etag[ cacheURL ] ) {
                    jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
                }
            }

            // Set the correct header, if data is being sent
            if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
                jqXHR.setRequestHeader( "Content-Type", s.contentType );
            }

            // Set the Accepts header for the server, depending on the dataType
            jqXHR.setRequestHeader(
                "Accept",
                    s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
                    s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
                    s.accepts[ "*" ]
            );

            // Check for headers option
            for ( i in s.headers ) {
                jqXHR.setRequestHeader( i, s.headers[ i ] );
            }

            // Allow custom headers/mimetypes and early abort
            if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
                // Abort if not done already and return
                return jqXHR.abort();
            }

            // aborting is no longer a cancellation
            strAbort = "abort";

            // Install callbacks on deferreds
            for ( i in { success: 1, error: 1, complete: 1 } ) {
                jqXHR[ i ]( s[ i ] );
            }

            // Get transport
            transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

            // If no transport, we auto-abort
            if ( !transport ) {
                done( -1, "No Transport" );
            } else {
                jqXHR.readyState = 1;

                // Send global event
                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
                }
                // Timeout
                if ( s.async && s.timeout > 0 ) {
                    timeoutTimer = setTimeout(function() {
                        jqXHR.abort("timeout");
                    }, s.timeout );
                }

                try {
                    state = 1;
                    transport.send( requestHeaders, done );
                } catch ( e ) {
                    // Propagate exception as error if not done
                    if ( state < 2 ) {
                        done( -1, e );
                        // Simply rethrow otherwise
                    } else {
                        throw e;
                    }
                }
            }

            // Callback for when everything is done
            function done( status, nativeStatusText, responses, headers ) {
                var isSuccess, success, error, response, modified,
                    statusText = nativeStatusText;

                // Called once
                if ( state === 2 ) {
                    return;
                }

                // State is "done" now
                state = 2;

                // Clear timeout if it exists
                if ( timeoutTimer ) {
                    clearTimeout( timeoutTimer );
                }

                // Dereference transport for early garbage collection
                // (no matter how long the jqXHR object will be used)
                transport = undefined;

                // Cache response headers
                responseHeadersString = headers || "";

                // Set readyState
                jqXHR.readyState = status > 0 ? 4 : 0;

                // Determine if successful
                isSuccess = status >= 200 && status < 300 || status === 304;

                // Get response data
                if ( responses ) {
                    response = ajaxHandleResponses( s, jqXHR, responses );
                }

                // Convert no matter what (that way responseXXX fields are always set)
                response = ajaxConvert( s, response, jqXHR, isSuccess );

                // If successful, handle type chaining
                if ( isSuccess ) {

                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if ( s.ifModified ) {
                        modified = jqXHR.getResponseHeader("Last-Modified");
                        if ( modified ) {
                            jQuery.lastModified[ cacheURL ] = modified;
                        }
                        modified = jqXHR.getResponseHeader("etag");
                        if ( modified ) {
                            jQuery.etag[ cacheURL ] = modified;
                        }
                    }

                    // if no content
                    if ( status === 204 || s.type === "HEAD" ) {
                        statusText = "nocontent";

                        // if not modified
                    } else if ( status === 304 ) {
                        statusText = "notmodified";

                        // If we have data, let's convert it
                    } else {
                        statusText = response.state;
                        success = response.data;
                        error = response.error;
                        isSuccess = !error;
                    }
                } else {
                    // We extract error from statusText
                    // then normalize statusText and status for non-aborts
                    error = statusText;
                    if ( status || !statusText ) {
                        statusText = "error";
                        if ( status < 0 ) {
                            status = 0;
                        }
                    }
                }

                // Set data for the fake xhr object
                jqXHR.status = status;
                jqXHR.statusText = ( nativeStatusText || statusText ) + "";

                // Success/Error
                if ( isSuccess ) {
                    deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
                } else {
                    deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
                }

                // Status-dependent callbacks
                jqXHR.statusCode( statusCode );
                statusCode = undefined;

                if ( fireGlobals ) {
                    globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
                        [ jqXHR, s, isSuccess ? success : error ] );
                }

                // Complete
                completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
                    // Handle the global AJAX counter
                    if ( !( --jQuery.active ) ) {
                        jQuery.event.trigger("ajaxStop");
                    }
                }
            }

            return jqXHR;
        },

        getJSON: function( url, data, callback ) {
            return jQuery.get( url, data, callback, "json" );
        },

        getScript: function( url, callback ) {
            return jQuery.get( url, undefined, callback, "script" );
        }
    });

    jQuery.each( [ "get", "post" ], function( i, method ) {
        jQuery[ method ] = function( url, data, callback, type ) {
            // shift arguments if data argument was omitted
            if ( jQuery.isFunction( data ) ) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

// Attach a bunch of functions for handling common AJAX events
    jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
        jQuery.fn[ type ] = function( fn ) {
            return this.on( type, fn );
        };
    });


    jQuery._evalUrl = function( url ) {
        return jQuery.ajax({
            url: url,
            type: "GET",
            dataType: "script",
            async: false,
            global: false,
            "throws": true
        });
    };


    jQuery.fn.extend({
        wrapAll: function( html ) {
            var wrap;

            if ( jQuery.isFunction( html ) ) {
                return this.each(function( i ) {
                    jQuery( this ).wrapAll( html.call(this, i) );
                });
            }

            if ( this[ 0 ] ) {

                // The elements to wrap the target around
                wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

                if ( this[ 0 ].parentNode ) {
                    wrap.insertBefore( this[ 0 ] );
                }

                wrap.map(function() {
                    var elem = this;

                    while ( elem.firstElementChild ) {
                        elem = elem.firstElementChild;
                    }

                    return elem;
                }).append( this );
            }

            return this;
        },

        wrapInner: function( html ) {
            if ( jQuery.isFunction( html ) ) {
                return this.each(function( i ) {
                    jQuery( this ).wrapInner( html.call(this, i) );
                });
            }

            return this.each(function() {
                var self = jQuery( this ),
                    contents = self.contents();

                if ( contents.length ) {
                    contents.wrapAll( html );

                } else {
                    self.append( html );
                }
            });
        },

        wrap: function( html ) {
            var isFunction = jQuery.isFunction( html );

            return this.each(function( i ) {
                jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
            });
        },

        unwrap: function() {
            return this.parent().each(function() {
                if ( !jQuery.nodeName( this, "body" ) ) {
                    jQuery( this ).replaceWith( this.childNodes );
                }
            }).end();
        }
    });


    jQuery.expr.filters.hidden = function( elem ) {
        // Support: Opera <= 12.12
        // Opera reports offsetWidths and offsetHeights less than zero on some elements
        return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
    };
    jQuery.expr.filters.visible = function( elem ) {
        return !jQuery.expr.filters.hidden( elem );
    };




    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
        rsubmittable = /^(?:input|select|textarea|keygen)/i;

    function buildParams( prefix, obj, traditional, add ) {
        var name;

        if ( jQuery.isArray( obj ) ) {
            // Serialize array item.
            jQuery.each( obj, function( i, v ) {
                if ( traditional || rbracket.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );

                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
                }
            });

        } else if ( !traditional && jQuery.type( obj ) === "object" ) {
            // Serialize object item.
            for ( name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
            }

        } else {
            // Serialize scalar item.
            add( prefix, obj );
        }
    }

// Serialize an array of form elements or a set of
// key/values into a query string
    jQuery.param = function( a, traditional ) {
        var prefix,
            s = [],
            add = function( key, value ) {
                // If value is a function, invoke it and return its value
                value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
                s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
            };

        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if ( traditional === undefined ) {
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }

        // If an array was passed in, assume that it is an array of form elements.
        if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
            // Serialize the form elements
            jQuery.each( a, function() {
                add( this.name, this.value );
            });

        } else {
            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for ( prefix in a ) {
                buildParams( prefix, a[ prefix ], traditional, add );
            }
        }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    };

    jQuery.fn.extend({
        serialize: function() {
            return jQuery.param( this.serializeArray() );
        },
        serializeArray: function() {
            return this.map(function() {
                // Can add propHook for "elements" to filter or add form elements
                var elements = jQuery.prop( this, "elements" );
                return elements ? jQuery.makeArray( elements ) : this;
            })
                .filter(function() {
                    var type = this.type;

                    // Use .is( ":disabled" ) so that fieldset[disabled] works
                    return this.name && !jQuery( this ).is( ":disabled" ) &&
                        rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
                        ( this.checked || !rcheckableType.test( type ) );
                })
                .map(function( i, elem ) {
                    var val = jQuery( this ).val();

                    return val == null ?
                        null :
                        jQuery.isArray( val ) ?
                            jQuery.map( val, function( val ) {
                                return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                            }) :
                        { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                }).get();
        }
    });


    jQuery.ajaxSettings.xhr = function() {
        try {
            return new XMLHttpRequest();
        } catch( e ) {}
    };

    var xhrId = 0,
        xhrCallbacks = {},
        xhrSuccessStatus = {
            // file protocol always yields status code 0, assume 200
            0: 200,
            // Support: IE9
            // #1450: sometimes IE returns 1223 when it should be 204
            1223: 204
        },
        xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
    if ( window.ActiveXObject ) {
        jQuery( window ).on( "unload", function() {
            for ( var key in xhrCallbacks ) {
                xhrCallbacks[ key ]();
            }
        });
    }

    support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
    support.ajax = xhrSupported = !!xhrSupported;

    jQuery.ajaxTransport(function( options ) {
        var callback;

        // Cross domain only allowed if supported through XMLHttpRequest
        if ( support.cors || xhrSupported && !options.crossDomain ) {
            return {
                send: function( headers, complete ) {
                    var i,
                        xhr = options.xhr(),
                        id = ++xhrId;

                    xhr.open( options.type, options.url, options.async, options.username, options.password );

                    // Apply custom fields if provided
                    if ( options.xhrFields ) {
                        for ( i in options.xhrFields ) {
                            xhr[ i ] = options.xhrFields[ i ];
                        }
                    }

                    // Override mime type if needed
                    if ( options.mimeType && xhr.overrideMimeType ) {
                        xhr.overrideMimeType( options.mimeType );
                    }

                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.
                    if ( !options.crossDomain && !headers["X-Requested-With"] ) {
                        headers["X-Requested-With"] = "XMLHttpRequest";
                    }

                    // Set headers
                    for ( i in headers ) {
                        xhr.setRequestHeader( i, headers[ i ] );
                    }

                    // Callback
                    callback = function( type ) {
                        return function() {
                            if ( callback ) {
                                delete xhrCallbacks[ id ];
                                callback = xhr.onload = xhr.onerror = null;

                                if ( type === "abort" ) {
                                    xhr.abort();
                                } else if ( type === "error" ) {
                                    complete(
                                        // file: protocol always yields status 0; see #8605, #14207
                                        xhr.status,
                                        xhr.statusText
                                    );
                                } else {
                                    complete(
                                            xhrSuccessStatus[ xhr.status ] || xhr.status,
                                        xhr.statusText,
                                        // Support: IE9
                                        // Accessing binary-data responseText throws an exception
                                        // (#11426)
                                            typeof xhr.responseText === "string" ? {
                                            text: xhr.responseText
                                        } : undefined,
                                        xhr.getAllResponseHeaders()
                                    );
                                }
                            }
                        };
                    };

                    // Listen to events
                    xhr.onload = callback();
                    xhr.onerror = callback("error");

                    // Create the abort callback
                    callback = xhrCallbacks[ id ] = callback("abort");

                    try {
                        // Do send the request (this may raise an exception)
                        xhr.send( options.hasContent && options.data || null );
                    } catch ( e ) {
                        // #14683: Only rethrow if this hasn't been notified as an error yet
                        if ( callback ) {
                            throw e;
                        }
                    }
                },

                abort: function() {
                    if ( callback ) {
                        callback();
                    }
                }
            };
        }
    });




// Install script dataType
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function( text ) {
                jQuery.globalEval( text );
                return text;
            }
        }
    });

// Handle cache's special case and crossDomain
    jQuery.ajaxPrefilter( "script", function( s ) {
        if ( s.cache === undefined ) {
            s.cache = false;
        }
        if ( s.crossDomain ) {
            s.type = "GET";
        }
    });

// Bind script tag hack transport
    jQuery.ajaxTransport( "script", function( s ) {
        // This transport only deals with cross domain requests
        if ( s.crossDomain ) {
            var script, callback;
            return {
                send: function( _, complete ) {
                    script = jQuery("<script>").prop({
                        async: true,
                        charset: s.scriptCharset,
                        src: s.url
                    }).on(
                        "load error",
                        callback = function( evt ) {
                            script.remove();
                            callback = null;
                            if ( evt ) {
                                complete( evt.type === "error" ? 404 : 200, evt.type );
                            }
                        }
                    );
                    document.head.appendChild( script[ 0 ] );
                },
                abort: function() {
                    if ( callback ) {
                        callback();
                    }
                }
            };
        }
    });




    var oldCallbacks = [],
        rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
            this[ callback ] = true;
            return callback;
        }
    });

// Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

        var callbackName, overwritten, responseContainer,
            jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
                "url" :
                typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
                );

        // Handle iff the expected data type is "jsonp" or we have a parameter to set
        if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

            // Get callback name, remembering preexisting value associated with it
            callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
                s.jsonpCallback() :
                s.jsonpCallback;

            // Insert callback into url or form data
            if ( jsonProp ) {
                s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
            } else if ( s.jsonp !== false ) {
                s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
            }

            // Use data converter to retrieve json after script execution
            s.converters["script json"] = function() {
                if ( !responseContainer ) {
                    jQuery.error( callbackName + " was not called" );
                }
                return responseContainer[ 0 ];
            };

            // force json dataType
            s.dataTypes[ 0 ] = "json";

            // Install callback
            overwritten = window[ callbackName ];
            window[ callbackName ] = function() {
                responseContainer = arguments;
            };

            // Clean-up function (fires after converters)
            jqXHR.always(function() {
                // Restore preexisting value
                window[ callbackName ] = overwritten;

                // Save back as free
                if ( s[ callbackName ] ) {
                    // make sure that re-using the options doesn't screw things around
                    s.jsonpCallback = originalSettings.jsonpCallback;

                    // save the callback name for future use
                    oldCallbacks.push( callbackName );
                }

                // Call if it was a function and we have a response
                if ( responseContainer && jQuery.isFunction( overwritten ) ) {
                    overwritten( responseContainer[ 0 ] );
                }

                responseContainer = overwritten = undefined;
            });

            // Delegate to script
            return "script";
        }
    });




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
    jQuery.parseHTML = function( data, context, keepScripts ) {
        if ( !data || typeof data !== "string" ) {
            return null;
        }
        if ( typeof context === "boolean" ) {
            keepScripts = context;
            context = false;
        }
        context = context || document;

        var parsed = rsingleTag.exec( data ),
            scripts = !keepScripts && [];

        // Single tag
        if ( parsed ) {
            return [ context.createElement( parsed[1] ) ];
        }

        parsed = jQuery.buildFragment( [ data ], context, scripts );

        if ( scripts && scripts.length ) {
            jQuery( scripts ).remove();
        }

        return jQuery.merge( [], parsed.childNodes );
    };


// Keep a copy of the old load method
    var _load = jQuery.fn.load;

    /**
     * Load a url into a page
     */
    jQuery.fn.load = function( url, params, callback ) {
        if ( typeof url !== "string" && _load ) {
            return _load.apply( this, arguments );
        }

        var selector, type, response,
            self = this,
            off = url.indexOf(" ");

        if ( off >= 0 ) {
            selector = jQuery.trim( url.slice( off ) );
            url = url.slice( 0, off );
        }

        // If it's a function
        if ( jQuery.isFunction( params ) ) {

            // We assume that it's the callback
            callback = params;
            params = undefined;

            // Otherwise, build a param string
        } else if ( params && typeof params === "object" ) {
            type = "POST";
        }

        // If we have elements to modify, make the request
        if ( self.length > 0 ) {
            jQuery.ajax({
                url: url,

                // if "type" variable is undefined, then "GET" method will be used
                type: type,
                dataType: "html",
                data: params
            }).done(function( responseText ) {

                // Save response for use in complete callback
                response = arguments;

                self.html( selector ?

                    // If a selector was specified, locate the right elements in a dummy div
                    // Exclude scripts to avoid IE 'Permission Denied' errors
                    jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

                    // Otherwise use the full result
                    responseText );

            }).complete( callback && function( jqXHR, status ) {
                self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
            });
        }

        return this;
    };




    jQuery.expr.filters.animated = function( elem ) {
        return jQuery.grep(jQuery.timers, function( fn ) {
            return elem === fn.elem;
        }).length;
    };




    var docElem = window.document.documentElement;

    /**
     * Gets a window from an element
     */
    function getWindow( elem ) {
        return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    jQuery.offset = {
        setOffset: function( elem, options, i ) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = jQuery.css( elem, "position" ),
                curElem = jQuery( elem ),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if ( position === "static" ) {
                elem.style.position = "relative";
            }

            curOffset = curElem.offset();
            curCSSTop = jQuery.css( elem, "top" );
            curCSSLeft = jQuery.css( elem, "left" );
            calculatePosition = ( position === "absolute" || position === "fixed" ) &&
                ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

            // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
            if ( calculatePosition ) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;

            } else {
                curTop = parseFloat( curCSSTop ) || 0;
                curLeft = parseFloat( curCSSLeft ) || 0;
            }

            if ( jQuery.isFunction( options ) ) {
                options = options.call( elem, i, curOffset );
            }

            if ( options.top != null ) {
                props.top = ( options.top - curOffset.top ) + curTop;
            }
            if ( options.left != null ) {
                props.left = ( options.left - curOffset.left ) + curLeft;
            }

            if ( "using" in options ) {
                options.using.call( elem, props );

            } else {
                curElem.css( props );
            }
        }
    };

    jQuery.fn.extend({
        offset: function( options ) {
            if ( arguments.length ) {
                return options === undefined ?
                    this :
                    this.each(function( i ) {
                        jQuery.offset.setOffset( this, options, i );
                    });
            }

            var docElem, win,
                elem = this[ 0 ],
                box = { top: 0, left: 0 },
                doc = elem && elem.ownerDocument;

            if ( !doc ) {
                return;
            }

            docElem = doc.documentElement;

            // Make sure it's not a disconnected DOM node
            if ( !jQuery.contains( docElem, elem ) ) {
                return box;
            }

            // If we don't have gBCR, just use 0,0 rather than error
            // BlackBerry 5, iOS 3 (original iPhone)
            if ( typeof elem.getBoundingClientRect !== strundefined ) {
                box = elem.getBoundingClientRect();
            }
            win = getWindow( doc );
            return {
                top: box.top + win.pageYOffset - docElem.clientTop,
                left: box.left + win.pageXOffset - docElem.clientLeft
            };
        },

        position: function() {
            if ( !this[ 0 ] ) {
                return;
            }

            var offsetParent, offset,
                elem = this[ 0 ],
                parentOffset = { top: 0, left: 0 };

            // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
            if ( jQuery.css( elem, "position" ) === "fixed" ) {
                // We assume that getBoundingClientRect is available when computed position is fixed
                offset = elem.getBoundingClientRect();

            } else {
                // Get *real* offsetParent
                offsetParent = this.offsetParent();

                // Get correct offsets
                offset = this.offset();
                if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
                    parentOffset = offsetParent.offset();
                }

                // Add offsetParent borders
                parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
                parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
            }

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
                left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
            };
        },

        offsetParent: function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || docElem;

                while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent || docElem;
            });
        }
    });

// Create scrollLeft and scrollTop methods
    jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
        var top = "pageYOffset" === prop;

        jQuery.fn[ method ] = function( val ) {
            return access( this, function( elem, method, val ) {
                var win = getWindow( elem );

                if ( val === undefined ) {
                    return win ? win[ prop ] : elem[ method ];
                }

                if ( win ) {
                    win.scrollTo(
                        !top ? val : window.pageXOffset,
                        top ? val : window.pageYOffset
                    );

                } else {
                    elem[ method ] = val;
                }
            }, method, val, arguments.length, null );
        };
    });

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
    jQuery.each( [ "top", "left" ], function( i, prop ) {
        jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
            function( elem, computed ) {
                if ( computed ) {
                    computed = curCSS( elem, prop );
                    // if curCSS returns percentage, fallback to offset
                    return rnumnonpx.test( computed ) ?
                        jQuery( elem ).position()[ prop ] + "px" :
                        computed;
                }
            }
        );
    });


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
    jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
        jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
            // margin is only for outerHeight, outerWidth
            jQuery.fn[ funcName ] = function( margin, value ) {
                var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
                    extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

                return access( this, function( elem, type, value ) {
                    var doc;

                    if ( jQuery.isWindow( elem ) ) {
                        // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
                        // isn't a whole lot we can do. See pull request at this URL for discussion:
                        // https://github.com/jquery/jquery/pull/764
                        return elem.document.documentElement[ "client" + name ];
                    }

                    // Get document width or height
                    if ( elem.nodeType === 9 ) {
                        doc = elem.documentElement;

                        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                        // whichever is greatest
                        return Math.max(
                            elem.body[ "scroll" + name ], doc[ "scroll" + name ],
                            elem.body[ "offset" + name ], doc[ "offset" + name ],
                            doc[ "client" + name ]
                        );
                    }

                    return value === undefined ?
                        // Get width or height on the element, requesting but not forcing parseFloat
                        jQuery.css( elem, type, extra ) :

                        // Set width or height on the element
                        jQuery.style( elem, type, value, extra );
                }, type, chainable ? margin : undefined, chainable, null );
            };
        });
    });


// The number of elements contained in the matched element set
    jQuery.fn.size = function() {
        return this.length;
    };

    jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

    if ( typeof define === "function" && define.amd ) {
        define( "jquery", [], function() {
            return jQuery;
        });
    }




    var
    // Map over jQuery in case of overwrite
        _jQuery = window.jQuery,

    // Map over the $ in case of overwrite
        _$ = window.$;

    jQuery.noConflict = function( deep ) {
        if ( window.$ === jQuery ) {
            window.$ = _$;
        }

        if ( deep && window.jQuery === jQuery ) {
            window.jQuery = _jQuery;
        }

        return jQuery;
    };

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
    if ( typeof noGlobal === strundefined ) {
        window.jQuery = window.$ = jQuery;
    }




    return jQuery;

}));

/*!
 * MiniQuery JavaScript Library
 */
;( function (
    global,
    Array,
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String,
    undefined
    ) {


    /**
     * 内部用的一个 MiniQuery 容器
     * @namespace
     * @inner
     */
    function MiniQuery() {

    }

    var $ = MiniQuery; //内部使用的 $ 符号


    /**
     * 定义一个针对 MiniQuery 的全局名称，可用作当前运行时确定的标识符。
     */
    MiniQuery.expando = 'MiniQuery' + String(Math.random()).replace(/\D/g, '');



    /**
     * 用指定的值去扩展指定的目标对象，返回目标对象。
     */
    MiniQuery.extend = function (target, obj1, obj2) {

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
        if (startIndex >= len) { //已处理完所有参数
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
    };





    /**
     * @fileOverview 对象工具
     */



    /**
     * 对象工具
     * @class
     * @param {Object} obj 要进行包装的对象
     * @return {MiniQuery.Object} 返回一个经过包装后的 MiniQuery.Object 对象
     * @example
     $.Object( {a:1, b:2} );
     或  new $.Object( {a:1, b:2} );
     */
    MiniQuery.Object = function (obj) {
        return new MiniQuery.Object.prototype.init(obj);
    };



    ; (function ($, This) {





        $.extend(This, { /**@lends MiniQuery.Object */


            /**
             * 用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
             * @function
             * @param {Object} arguments[0] 要进行扩展的对象
             * @param {Object} arguments[1] 要进行复制的第1个对象
             * @param {Object} arguments[n] 要进行复制的第n个对象，依次类推
             * @return {Object} 返回被扩展的对象，即第一个参数。
             如果参数为空，则返回 {}。
             如果只有一个参数，则直接返回该参数。
             否则：把第二个参数到最后一个参数的成员拷贝到第一个参数对应中去，并返回第一个参数。
             * @example
             var obj = {
            a: 1, 
            b: 2
        };
             var obj2 = $.Object.extend(obj, {b:3}, {c:4});
             //结果：
             obj = {a:1, b:3, c:4};
             //并且
             obj === obj2 //为 true
             */
            extend: $.extend,

            /**
             * 用一种安全的方式来扩展对象。
             * 当目标对象不存在指定的成员时，才给该目标对象添加(扩展)该成员。
             */
            extendSafely: function () {
                var len = arguments.length;
                if (len == 0) {
                    return null;
                }

                var target = arguments[0];
                if (len == 1) {
                    return target;
                }

                for (var i = 1; i < len; i++) {
                    var obj = arguments[i];

                    for (var key in obj) {
                        if (key in target) //目标对象中已含有该成员，略过
                        {
                            continue;
                        }

                        //否则，添加
                        target[key] = obj[key];
                    }
                }

                return target;
            },

            /**
             * 用多个对象深度扩展一个对象。
             */
            extendDeeply: function (target, obj1, obj2) {

                function fn(A, B) {
                    A = A || {};

                    for (var key in B) {
                        var value = B[key];

                        if (This.isPlain(value)) {
                            value = fn(A[key], value);
                        }

                        A[key] = value;
                    }

                    return A;
                }


                //针对最常用的情况作优化
                if (obj1 && typeof obj1 == 'object') {
                    target = fn(target, obj1);
                }

                if (obj2 && typeof obj2 == 'object') {
                    target = fn(target, obj2);
                }

                var startIndex = 3;
                var len = arguments.length;
                if (startIndex >= len) { //已处理完所有参数
                    return target;
                }

                //更多的情况
                for (var i = startIndex; i < len; i++) {
                    var objI = arguments[i];
                    target = fn(target, objI);
                }

                return target;

            },


            /**
             * 深度克隆一个纯对象或数组。
             * @param {Object|Array} obj 要进行克隆的对象或数组。
             如果 obj 是数组，则返回一个拷贝数组，并且会对数组中的每项调用 clone 。
             如果 obj 不是纯对象，则直接返回该对象，不进行克隆。
             * @return {Object|Array} 克隆后的对象或数组。
             * @example
             var obj = {a: 1, b: 2, c: {a: 10, b: 20} };
             var obj2 = $.Object.clone( obj );
             console.dir( obj2 );          //与 obj 一致
             console.log( obj2 === obj );  //false
             */
            clone: function (obj) {

                var clone = arguments.callee;

                var $ = MiniQuery;

                if (This.isArray(obj)) {
                    return $.Array.keep(obj, function (item, index) {
                        //优化，避免再次进入 clone 方法
                        if (!item || This.isValueType(item) || !This.isPlain(item)) {
                            return item;
                        }

                        return clone(item);
                    });
                }

                // null、undefined、0、NaN、false、''
                // 值类型：string、number、boolean
                // 非纯对象
                if (!obj || This.isValueType(obj) || !This.isPlain(obj)) {
                    return obj;
                }


                var target = {};

                for (var key in obj) {

                    var value = obj[key];

                    switch (typeof value) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                        case 'function':
                        case 'undefined':
                            target[key] = value;
                            break;

                        case 'object':
                            target[key] = clone(value);   //递归调用
                            break;

                    }
                }

                return target;
            },

            /**
             * 对一个对象进行迭代。
             * 该方法可以代替 for in 的语句。
             * 只有在回调函数中明确返回 false 才停止循环。
             * @param {Object} obj 要进行迭代处理的对象
             * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
             * @param {boolean} [isDeep=false]
             指示是否要进行深层次的迭代，如果是，请指定 true；
             否则请指定 false 或不指定。默认为 false，即浅迭代
             * @example
             var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
             $.Object.each(obj, function(key, value) {
            console.log(key, ': ', value);
        }, true);
             输出：
             a: 1,
             b: 2,
             A: 11,
             B: 22
             */
            each: function (obj, fn, isDeep) {

                var each = arguments.callee;

                for (var key in obj) {
                    var value = obj[key];

                    //指定了深迭代，并且当前 value 为非 null 的对象
                    if (isDeep === true && value && typeof value == 'object') {
                        each(value, fn, true); //递归
                    }
                    else {
                        // 只有在 fn 中明确返回 false 才停止循环
                        if (fn(key, value) === false) {
                            break;
                        }
                    }
                }
            },

            /**
             * 获取一个对象的真实类型的字符串描述。
             * @param obj 要检测的对象，可以是任何类型。
             * @return {String} 返回该对象的类型的字符串描述。
             当参数为 null、undefined 时，返回 null、undefined；<br />
             当参数为 string、number、boolean 的值类型时，返回 string、number、boolean；<br />
             否则返回参数的实际类型的字符串描述(构造函数的名称)：<br />
             如 Array、String、Number、Boolean、Object、Function、RegExp、Date 等
             * @example
             $.Object.getType();         //'undefined'
             $.Object.getType(null);     //'null'
             $.Object.getType('hello');  //'string'
             $.Object.getType(100);      //'number'
             $.Object.getType(false);    //'boolean'
             $.Object.getType({});       //'Object'
             $.Object.getType(function(){});//'Function'
             $.Object.getType([0, 1, 2]);   //'Array'
             */
            getType: function (obj) {
                return obj === null ? 'null' :
                        obj === undefined ? 'undefined' :

                    //处理值类型
                        typeof obj == 'string' ? 'string' :
                        typeof obj == 'number' ? 'number' :
                        typeof obj == 'boolean' ? 'boolean' :

                    //处理对象类型、包装类型
                    Object.prototype.toString.call(obj).slice(8, -1); //去掉 "[object" 和 "]"
            },

            /**
             * 判断一个对象是否为数组类型。<br />
             * 注意：如果是跨窗口取得的数组，请使用非严格判断。<br />
             * 由于 IE 的兼容性问题，对于跨窗口取得的数组，请在使用其实例方法之前把它转成真正的数组，否则会报错。
             * @param {Object} obj 要进行判断的对象，可以是任何类型
             * @param {boolean} [useStrict] 指定是否要进行严格判断，如果是请传入 true；否则当成非严格判断
             * @return {boolean} 一个判断结果，如果为数组则返回 true；否则返回 false
             * @example
             $.Object.isArray([]) //true
             $.Object.isArray({}) //false
             */
            isArray: function (obj, useStrict) {
                if (useStrict === true) { //指定了要严格判断
                    return obj instanceof Array;
                }

                //高端浏览器，如 IE9+、Firefox 4+、Safari 5+、Opera 10.5+ 和 Chrome
                if (typeof Array.isArray == 'function') { //优先使用原生的
                    return Array.isArray(obj);
                }

                //加上 obj instanceof Array 并且优先检测，是为了优化，也是为了安全起见。
                return (obj instanceof Array) ||
                    (This.getType(obj) == 'Array');
            },

            /**
             * 判断一个对象是否为字符串字类型。
             * @param {Object} obj 要进行判断的对象，可以是任何类型。
             * @return {boolean} 一个判断结果，如果为字符串则返回 true；否则返回 false。
             * @example
             $.Object.isString( new String(100) ) //false
             $.Object.isString( '100' ) //true
             */
            isString: function (obj) {
                return typeof obj == 'string';
            },

            /**
             * 判断一个对象是否为数字类型。
             * @param {Object} obj 要进行判断的对象，可以是任何类型。
             * @return {boolean} 一个判断结果，如果为数字则返回 true；否则返回 false。
             * @example
             $.Object.isNumber( new Number(100) ) //false
             $.Object.isNumber( 100 ) //true
             */
            isNumber: function (obj) {
                return typeof obj == 'number';
            },

            /**
             * 判断一个对象是否为函数类型。
             * @param {Object} obj 要进行判断的对象，可以是任何类型。
             * @return {boolean} 一个判断结果，如果为函数则返回 true；否则返回 false。
             * @example
             $.Object.isFunction([]) //false
             $.Object.isFunction(function(){}) //true
             */
            isFunction: function (obj) {
                return typeof obj == 'function';
            },


            /**
             * 判断一个对象是否为内置类型。<br />
             * 内置类型是指 String, Number, Boolean, Array, Date, RegExp, Function。
             * @param {Object} obj 要进行判断的对象，可以是任何类型
             * @return {boolean} 一个判断结果，如果为内置类型则返回 true；否则返回 false
             * @example
             $.Object.isBuiltinType( 100 );   //false
             $.Object.isBuiltinType( new Number(100) ); //true
             $.Object.isBuiltinType( {} );    //false
             $.Object.isBuiltinType( [] );    //true
             */
            isBuiltinType: function (obj) {
                var types = [String, Number, Boolean, Array, Date, RegExp, Function];

                for (var i = 0, len = types.length; i < len; i++) {
                    if (obj instanceof types[i]) {
                        return true;
                    }
                }

                return false;
            },


            /**
             * 检测对象是否是空对象(不包含任何属性)。<br />
             * 该方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使用 hasOwnProperty )。<br />
             * 该实现为 jQuery 的版本。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果为空对象则返回 true；否则返回 false
             * @example
             $.Object.isEmpty( {} );      //true

             function Person(){ }
             Person.prototype.name = 'abc';
             var p = new Person();
             $.Object.isEmpty( p );   //false
             */
            isEmpty: function (obj) {
                for (var name in obj) {
                    return false;
                }

                return true;
            },



            /**
             * 检测一个对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。
             * 该实现为 jQuery 的版本。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果为纯粹的对象则返回 true；否则返回 false
             * @example
             $.Object.isPlain( {} );             //true
             $.Object.isPlain( {a: 1, b: {} } );  //true

             function Person(){ }
             var p = new Person();
             $.Object.isPlain( p );   //false
             */
            isPlain: function (obj) {
                if (!obj || typeof obj != 'object' /*|| obj.nodeType || This.isWindow(obj) */ ) {
                    return false;
                }

                var hasOwnProperty = Object.prototype.hasOwnProperty;
                var constructor = obj.constructor;

                try {
                    // Not own constructor property must be Object
                    if (constructor &&
                        !hasOwnProperty.call(obj, "constructor") &&
                        !hasOwnProperty.call(constructor.prototype, "isPrototypeOf")) {
                        return false;
                    }
                }
                catch (e) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return false;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.
                var key;
                for (key in obj) {
                }

                return key === undefined || hasOwnProperty.call(obj, key);
            },

            /**
             * 判断一个对象是否为值类型。<br />
             * 即 typeof 的结果是否为 string、number、boolean 中的一个。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果为 值类型则返回 true；否则返回 false
             * @example
             $.Object.isValueType(100);              //true
             $.Object.isValueType( new Number(100) );//false
             */
            isValueType: function (obj) {
                //不要用这种，否则在 rhino 的 js 引擎中会不稳定
                //return (/^(string|number|boolean)$/g).test(typeof obj); 
                var type = typeof obj;
                return type == 'string' || type == 'number' || type == 'boolean';
            },




            /**
             * 判断一个对象是否为包装类型。<br />
             * 包装类型是指 String, Number, Boolean 的 new 的实例。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果包装类型则返回 true；否则返回 false
             * @example
             console.log( $.Object.isWrappedType(100) ); //false
             console.log( $.Object.isWrappedType( new Number(100) ) );  //true
             console.log( $.Object.isWrappedType('abc') );  //false
             console.log( $.Object.isWrappedType( new String('abc') ) );  //true
             console.log( $.Object.isWrappedType(true) );  //false
             console.log( $.Object.isWrappedType( new Boolean(true) ) );  //true
             */
            isWrappedType: function (obj) {
                var types = [String, Number, Boolean];
                for (var i = 0, len = types.length; i < len; i++) {
                    if (obj instanceof types[i]) {
                        return true;
                    }
                }

                return false;
            },

            /**
             * 判断一个对象是否为非空的对象。
             * 非空对象是指 typeof 结果为 object 或 function，并且不是 null。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果是非空的对象则返回 true；否则返回 false。
             * @example
             console.log( $.Object.isNonNull( null ) );  //false
             console.log( $.Object.isNonNull( {} ) );  //true
             console.log( $.Object.isNonNull(100) ); //false
             console.log( $.Object.isNonNull( new Number(100) ) );  //true
             console.log( $.Object.isNonNull('abc') );  //false
             console.log( $.Object.isNonNull( new String('abc') ) );  //true
             console.log( $.Object.isNonNull(true) );  //false
             console.log( $.Object.isNonNull( new Boolean(true) ) );  //true
             */
            isNonNull: function (obj) {
                if (!obj) { //false、null、undefined、''、NaN、0
                    return false;
                }

                var type = typeof obj;
                return type == 'object' || type == 'function';
            },


            /**
             * 一个简单的方法来判断一个对象是否为 window 窗口。
             * 该实现为 jQuery 的版本。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果为 window 窗口则返回 true；否则返回 false
             * @example
             $.Object.isWindow( {} ); //false
             $.Object.isWindow(top);  //true
             */
            isWindow: function (obj) {
                return obj &&
                    typeof obj == 'object' &&
                    'setInterval' in obj;
            },

            /**
             * 一个简单的方法来判断一个对象是否为 document 对象。
             * @param {Object} obj 要进行检测的对象，可以是任何类型
             * @return {boolean} 一个检测结果，如果为  document 对象则返回 true；否则返回 false
             * @example
             $.Object.isDocument( {} );      //false
             $.Object.isDocument(document);  //true
             */
            isDocument: function (obj) {
                return obj &&
                    typeof obj == 'object' &&
                    'getElementById' in obj;
            },



            /**
             * 对象映射转换器，返回一个新的对象。
             * @param {Object} obj 要进行迭代处理的对象
             * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
             * @param {boolean} [isDeep=false] 指示是否要进行深层次的迭代。
             如果是，请指定 true；
             否则请指定 false 或不指定。
             默认为 false，即浅迭代
             * @return {Object} 返回一个新的对象，key 仍为原来的 key，value 由回调函数得到
             * @example
             var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
             var obj2 = $.Object.map(obj, function(key, value) {
            return value * 100;
        }, true);
             console.dir(obj2);
             结果：
             obj2 = {a: 100, b: 200, c: {A: 1100, B: 2200}};
             */
            map: function (obj, fn, isDeep) {
                var map = arguments.callee; //引用自身，用于递归
                var target = {};

                for (var key in obj) {
                    var value = obj[key];

                    if (isDeep && value && typeof value == 'object') //指定了深迭代，并且当前 value 为非 null 的对象
                    {
                        target[key] = map(value, fn, isDeep); //递归
                    }
                    else {
                        target[key] = fn(key, value);
                    }
                }

                return target;
            },


            /**
             * 给指定的对象快速创建多层次的命名空间，返回创建后的最内层的命名空间所指的对象。
             * @param {Object} [arg0=global]
             要在其上面创建命名空间的对象容器。当不指定时，则默认为当前的 global 对象。
             * @param {string} arg1 命名空间，以点号进行分隔
             * @param {Object} arg2 命名空间最终指向的对象
             * @return {Object} 返回创建后的最内层的命名空间所指的对象
             * @example
             //给 obj 对象创建一个 A.B.C 的命名空间，其值为 {a:1, b:2}
             $.Object.namespace(obj, 'A.B.C', {a:1, b:2});
             console.dir( obj.A.B.C ); //结果为 {a:1, b:2}

             //给当前的 global 对象创建一个 A.B.C 的命名空间，其值为 {a:1, b:2}
             $.Object.namespace('A.B.C', {a:1, b:2});
             console.dir( A.B.C ); //结果为 {a:1, b:2}

             //给当前的 global 象分别创建一个 $.AA 和 $.BB 的命名空间，其值为分别 source.A 和 source.B
             $.Object.namespace(source, {
            'A': '$.AA', //source.AA -> $.A
            'B': '$.BB'  //source.BB -> $.B
        });

             //给 obj 对象分别创建 obj.A 和 obj.B 命名空间，其值分别为  source.A 和 source.B
             $.Object.namespace(obj, source, ['A', 'B']);
             *
             */
            namespace: function (arg0, arg1, arg2) {

                //这个是最原始的方式：This.namespace(obj, 'A.B.C', {a:1, b:2});
                function fn(container, path, value) {
                    var list = path.split('.'); //路径
                    var obj = container;

                    var len = list.length;      //路径长度
                    var lastIndex = len - 1;    //路径中最后一项的索引

                    var isGet = value === undefined; //指示是否为取值操作，当不指定 value 时，则认为是取值操作

                    for (var i = 0; i < len; i++) //迭代路径
                    {
                        var key = list[i];

                        //是获取操作，但不存在该级别
                        if (isGet && !(key in obj) ) {
                            return; //退出，避免产生副作用(创建对象)
                        }

                        if (i < lastIndex) {
                            obj[key] = obj[key] || {};
                            obj = obj[key]; //为下一轮做准备
                        }
                        else //最后一项
                        {
                            if (value === undefined) //不指定值时，则为获取
                            {
                                return obj[key];
                            }

                            //指定了值
                            obj[key] = value; //全量赋值

                        }
                    }

                    return value;
                }

                //此时为最原始的
                //This.namespace(container, 'A.B.C', value );
                if (typeof arg1 == 'string') {
                    var container = arg0;
                    var path = arg1;
                    var value = arg2;

                    return fn(container, path, value);
                }

                //此时为
                //This.namespace('A.B.C', value)
                if (typeof arg0 == 'string') {
                    var container = global;
                    var path = arg0;
                    var value = arg1;

                    return fn(container, path, value);
                }


                /*
                 此时为：
                 This.namespace(source, {
                 'Object': '$.Object',   //source.Object -> $.Object
                 'Array': '$.Array'      //source.Array -> $.Array
                 });
                 要实现的功能：
                 $.Object = source.Object;
                 $.Array = source.Array;
                 */
                if (This.isPlain(arg1) && arg2 === undefined) {
                    //换个名称更容易理解
                    var source = arg0;      //此时第一个参数为要被遍历拷贝的对象 source
                    var maps = arg1;        //此时第二个参数为键值对映射表 maps
                    var container = global; //此时目标容器为当前的 global

                    //遍历映射表
                    This.each(maps, function (key, path) {
                        if (typeof path != 'string') {
                            throw new Error('当指定第二个参数为键值对映射表时，值必须为 string 类型');
                        }

                        var value = source[key];
                        fn(container, path, value);
                    });

                    return container;
                }

                //
                /*
                 此时为： 
                 This.namespace(container, source, ['Object', 'Array']);
                 要实现的功能：
                 container.Object = source.Object;
                 container.Array = source.Array;    
                 */
                if (This.isArray(arg2)) {
                    //换个名称更容易理解
                    var container = arg0;   //此时第一个参数为目标容器 container
                    var source = arg1;      //此时第二个参数为要被遍历拷贝的对象 source
                    var keys = arg2;        //此时第三个参数是要拷贝的键列表

                    //遍历键列表
                    $.Array.each(keys, function (key) {
                        container[key] = source[key];
                    });

                    return container;
                }
            },

            /**
             * 把 JSON 字符串解析成一个 Object 对象。
             * 该方法是 jQuery 的实现。
             * @param {String} data 要进行解析的 JSON 字符串
             * @return {Object} 返回一个等价的对象
             */
            parseJson: function (data) {
                if (typeof data !== "string" || !data) {
                    return null;
                }

                data = $.String.trim(data);

                if (global.JSON && global.JSON.parse) //标准方法
                {
                    return global.JSON.parse(data);
                }

                var rvalidchars = /^[\],:{}\s]*$/,
                    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                    rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

                data = data.replace(rvalidescape, '@')
                    .replace(rvalidtokens, ']')
                    .replace(rvalidbraces, '');

                if (!rvalidchars.test(data)) {
                    throw new Error('非法的 JSON 数据: ' + data);
                }

                return (new Function('return ' + data))();
            },


            /**
             * 把 Url 中的查询字符串解析为等价结构的 Object 对象。
             * @param {string} url 要进行解析的查询字符串。
             * @param {boolean} [isShallow=false] 指示是否使用浅层次进行解析。
             当显式指定 isShallow 参数为 true 时，则使用浅层次来解析(只解析一层，不进行递归解析)；
             否则(默认)使用深层次解析。
             * @param {boolean} [isCompatible=false] 指示是否使用兼容模式进行解码。
             当指定 isCompatible 参数为 true 时，将使用 unescape 来编码；
             否则(默认)使用 decodeURIComponent。
             * @return {Object} 返回一个包含键值对的 Object 对象。
             当参数 url 非法时，返回空对象 {}。
             * @example
             var url = 'a=1&b=2&c=A%3D100%26B%3D200';
             var obj = $.Object.parseQueryString(url);
             得到 obj = {a: 1, b:2, c: {A: 100, B: 200}};
             */
            parseQueryString: function (url, isShallow, isCompatible) {

                if (!url || typeof url != 'string') {
                    return {}; //这里不要返回 null，免得外部调用出错
                }

                var fn = arguments.callee;
                var decode = isCompatible ? unescape : decodeURIComponent;  //解码方法，默认用后者
                var isDeep = !isShallow;    //深层次解析，为了语义上更好理解，换个名称
                var toValue = $.String.toValue; //缓存一下方法，以提高循环中的性能


                var obj = {};

                var pairs = url.split('&');

                for (var i = 0, len = pairs.length; i < len; i++) {

                    var name_value = pairs[i].split('=');

                    var name = decode(name_value[0]);
                    var value = name_value.length > 1 ? decode(name_value[1]) : ''; //后者针对没有'='号的情况

                    //深层次解析
                    if (isDeep && value.indexOf('=') > 0) { //还出现=号，说明还需要进一层次解码
                        value = fn(value); //递归调用
                    }
                    else { //处理一下字符串类型的 0|1|true|false|null|undefined|NaN
                        value = toValue(value); //还原常用的数据类型
                    }

                    if (name in obj) {
                        var a = obj[name];
                        if (a instanceof Array) {
                            a.push(value);
                        }
                        else {
                            obj[name] = [a, value];
                        }
                    }
                    else {
                        obj[name] = value;
                    }
                }

                return obj;
            },


            /**
             * 删除对象中指定的成员，返回一个新对象。
             * 指定的成员可以以单个的方式指定，也可以以数组的方式指定(批量)。
             * @param {Object} obj 要进行处理的对象。
             * @param {String|Array|Object} keys 要删除的成员名称，可以是单个，也可以是批量。
             * @return {Object} 返回一个被删除相应成员后的新对象。
             * @example
             var obj = {
            a: 1, 
            b: 2, 
            c: 3
        };

             var o = $.Object.remove(obj, ['a', 'c']); //移除成员 a 和 c
             console.dir(o); //得到 o = { b: 2 };

             o = $.Object.remove(obj, {a: 1, b: 2});
             console.dir(o); //得到 o = { c: 3 };
             */
            remove: function (obj, keys) {
                var target = This.extend({}, obj); //浅拷贝一份

                if (typeof keys == 'string') {
                    delete target[keys];
                }
                else if (This.isArray(keys)) {
                    for (var i = 0, len = keys.length; i < len; i++) {
                        delete target[keys[i]];
                    }
                }
                else {
                    for (var key in keys) {
                        delete target[key];
                    }
                }

                return target;
            },


            /**
             * 用一组指定的名称-值对中的值去替换指定名称对应的值。
             * 当指定第三个参数为 true 时，将进行第一层次的搜索与替换，否则替换所有同名的成员为指定的值
             */
            replaceValues: function (target, nameValues, isShallow) {
                for (var key in target) {
                    var val = target[key];
                    switch (typeof val) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                            for (var name in nameValues) {
                                if (key == name) {
                                    target[key] = nameValues[name];
                                    break;
                                }
                            }
                            break;
                        case 'object':
                            !isShallow && arguments.callee(val, nameValues);
                            break;
                    }
                }
                return target;
            },




            /**
             * 把一个 Object 对象转成一个数组。
             * @param {Object} obj 要进行转换的对象
             * @param {Array|boolean|function} [rule=undefined] 转换映射规则。<br />
             *   当未指定参数 rule 时，则使用 for in 迭代收集 obj 中的值，返回一个一维的值数组；<br />
             *   当指定参数 rule 为一个数组时，则按 rule 中的顺序迭代收集 obj 中的值，返回一个一维的值的数组；<br />
             *   当指定参数 rule 为 true 时，则使用 for in 迭代收集 obj 中的名称和值，返回一个[key, value] 的二维数组，<br />
             *       即该数组中的每一项的第0个元素为名称，第1个元素为值。<br />
             *   当指定参数 rule 为一个处理函数时，将使用该处理函数的返回值作为收集到数组的值，<br />
             *       处理函数会接收到两个参数：该对象迭代的 key 和 value。<br />
             *       当返回值为 null 时，将忽略它（相当于 continue）；<br />
             *       当返回值为 undefined 时，将停止迭代（相当于 break）；<br />
             * @param {boolean} [isDeep=false] 指定是否递归处理。
             若要递归转换，请指定 true；否则请指定 false 或不指定
             * @return 返回一个数组
             * @example
             var obj = { 
            a: 1, 
            b: 2, 
            c: {
                A: 100, 
                B: 200, 
                C: {
                    aa: 'a', 
                    bb: 'b'
                } 
            } 
        };

             var a = $.Object.toArray(obj, null, true);
             console.dir(a);

             var b = $.Object.toArray(obj, ['b', 'c', 'a']);
             console.dir(b);

             var c = $.Object.toArray(obj, true, true);
             console.dir(c);

             var d = $.Object.toArray(obj, function(key, value) {
            return value + 1000;
        }, true);

             console.dir(d);
             *
             */
            toArray: function (obj, rule, isDeep) {

                var toArray = arguments.callee; //引用自身，用于递归

                if (!rule) //未指定 rule: undefined|null|false
                {
                    return This.getValues(obj, isDeep);
                }

                //否则，指定了 rule 转换规则。

                // 传进来的是一个 key 数组
                if (rule instanceof Array) {
                    //注意，这里不要用 $.Array.map 来过滤，
                    //因为 map 会忽略掉 null 和 undefined 的值，这是不合适的

                    var keys = rule; //换个名称更好理解
                    var a = [];

                    for (var i = 0, len = keys.length; i < len; i++) //此时没有深迭代，因为 keys 只用于第一层
                    {
                        var value = obj[keys[i]]; //取得当前 key 所对应的 value
                        a.push(value); // keys[i] -> key -> value
                    }

                    return a;
                }

                //指定了保留 key，则返回一个二维数组
                if (rule === true) {
                    var a = [];
                    for (var key in obj) {
                        var value = obj[key];
                        if (isDeep === true && value && typeof value == 'object') {
                            value = toArray(value, rule, isDeep);
                        }
                        a.push([key, value]);
                    }

                    return a; //此时为 [ [key, value], [key, value], ... ]
                }

                //传进来的是处理函数
                if (typeof rule == 'function') {
                    var fn = rule;
                    var a = [];

                    for (var key in obj) {
                        var value = obj[key];

                        if (isDeep === true && value && typeof value == 'object') {
                            value = toArray(value, rule, isDeep);
                        }
                        else {
                            value = fn(key, value); //调用处理函数以取得返回值
                        }

                        if (value === null) {
                            continue;
                        }

                        if (value === undefined) {
                            break;
                        }

                        a.push(value);
                    }

                    return a;
                }
            },

            /**
             * 把一个对象转成 JSON 字符串
             * @param {Object} obj 要进行转换的对象
             * @return {String} 返回一个 JSON 字符串
             */
            toJson: function (obj) {
                if (obj == null) // null 或 undefined
                {
                    return String(obj);
                }

                switch (typeof obj) {
                    case 'string':
                        return '"' + obj + '"';
                    case 'number':
                    case 'boolean':
                        return obj;
                    case 'function':
                        return obj.toString();
                }

                //处理包装类和日期
                if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
                    return arguments.callee(obj.valueOf());
                }

                //处理正则表达式
                if (obj instanceof RegExp) {
                    return arguments.callee(obj.toString());
                }

                //处理数组
                if (This.isArray(obj)) {
                    var list = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        list.push(arguments.callee(obj[i]));
                    }

                    return '[' + list.join(', ') + ']';
                }

                var pairs = [];
                for (var name in obj) {
                    pairs.push('"' + name + '": ' + arguments.callee(obj[name]));
                }
                return '{ ' + pairs.join(', ') + ' }';
            },


            /**
             * 把一个对象编码成等价结构的 Url 查询字符串。
             * @param {Object} obj 要进行编码的对象
             * @param {boolean} [isCompatible=false]
             指定是否要使用兼容模式进行编码。<br />
             当需要使用 escape 进行编码时，请指定 true；<br />
             否则要使用 encodeURIComponent 进行编码，请指定 false 或不指定。
             * @return {string} 返回一个经过编码的 Url 查询字符串
             * @example
             var obj = {
            a: 1,
            b: 2,
            c: { A: 100, B: 200 },
            d: null,
            e: undefined,
            f: ['a', 'b', 'c']
        };
             var s = $.Object.toQueryString(obj);
             console.log(s);
             //结果 a=1&b=2&c=A%3D100%26B%3D200&d=null&e=undefined&f=%5Ba%2C%20b%5D
             */
            toQueryString: function (obj, isCompatible) {

                if (obj == null) {     // null 或 undefined
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

                if (This.isArray(obj)) {
                    return '[' + obj.join(', ') + ']';
                }

                var fn = arguments.callee;
                var encode = isCompatible ? escape : encodeURIComponent;

                var pairs = [];
                for (var name in obj) {
                    pairs.push(encode(name) + '=' + encode(fn(obj[name])));
                }

                return pairs.join('&');

            },



            /**
             * 删除对象的成员中值为指定的值列表中的成员，返回一个新对象。
             * @param {Object} obj 要进行处理的对象
             * @param {Array} [values=[undefined, null]] 要进行删除的值的列表。
             只要成员中包含该列表中的值，就会给删除。
             默认会删除值为 undefined 和 null 的成员。
             * @param {boolean} [isDeep=false] 指定是否深层次(递归)搜索。
             如果要深层次搜索，请指定 true；
             否则，请指定 false 或不指定。
             * @return {Object} 返回一个经过删除成员的新对象。
             该对象中不包含值为指定的值列表中的项的成员。
             * @example
             var d = {
            A: 11, 
            B: null, 
            C: undefined,
            D: '0'
        };
             var obj = {
            a: 1, 
            b: null, 
            c: undefined, 
            d: d
        };
             var obj2 = $.Object.trim(obj, [null, undefined, '0'], true );

             console.dir(obj);   //结果没变
             console.dir(obj2);  //结果为 {a: 1, d: {AA: 11}}
             console.dir(d);     //结果没变
             console.log(obj.d === d); //true
             */
            trim: function (obj, values, isDeep) {

                if (!values && !isDeep) { //针对最常用的情况 trim(obj) 作优化
                    var target = {};

                    for (var key in obj) {
                        var value = obj[key];
                        if (value == null) { // undefined、null
                            continue;
                        }

                        target[key] = value;
                    }

                    return target;
                }


                var trim = arguments.callee; //引用自身，递归要用到
                var contains = $.Array.contains;  //缓存一下，提高循环中的性能
                var extend = This.extend;     //缓存一下，提高循环中的性能

                if (typeof values == 'boolean') { //重载 trim(obj, isDeep);
                    isDeep = values;
                    values = undefined;
                }

                if (!values) {
                    values = [null, undefined];
                }

                var target = extend({}, obj); //浅拷贝一份

                for (var key in target) {
                    var value = target[key];

                    if (contains(values, value)) {
                        delete target[key]; //注意，这里不能用 delete value
                        continue;
                    }

                    if (isDeep === true && typeof value == 'object' && value) {
                        value = extend({}, value);          //浅拷贝一份
                        target[key] = trim(value, values, true);  //递归
                    }
                }

                return target;
            },

            /**
             * 跨浏览器的 Object.create 方法。
             * 该方法会优化使用原生的 Object.create 方法，当不存在时，才使用自己的实现。
             * @example
             var obj = $.Object.create({
            name: 'micty',
            sayHi: function() {
                console.log( this.name );
            }
        });

             obj.sayHi();
             */
            create: function (obj) {
                //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
                var fn = typeof Object.create === 'function' ? Object.create : function (obj) {
                    function F() {
                    }

                    F.prototype = obj;
                    F.prototype.constructor = F;

                    return new F();
                }

                This.create = fn;

                return fn(obj);
            },

            /**
             * 对一个对象进行成员过滤，返回一个过滤后的新对象。
             * 该方法可以以某个模板对指定对象进行成员拷贝。
             * @param {Object} src 要进行拷贝的对象，即数据来源。
             * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
             * @return {Object} 返回一个过滤后的新对象。
             * @example
             var src = {
            a: 100,
            b: 200,
            c: 300,
            d: 400
        };

             var samples = {
            a: 1,
            b: 2
        };

             //或 samples = ['a', 'b'];

             var obj = $.Object.filter(src, samples);
             console.dir(obj); //得到 obj = { a: 100, b: 200 }; 只保留 samples 中指定的成员，其他的去掉.
             */
            filter: function (src, samples) {

                var obj = {};

                if (This.isArray(samples)) {
                    $.Array.each(samples, function (key, index) {

                        if (key in src) {
                            obj[key] = src[key];
                        }
                    });
                }
                else if (This.isPlain(samples)) {
                    This.each(samples, function (key, value) {

                        if (key in src) {
                            obj[key] = src[key];
                        }
                    });
                }
                else if (typeof samples == 'string') {
                    var key = samples;
                    if (key in src) {
                        obj[key] = src[key];
                    }

                }
                else {
                    throw new Error('无法识别参数 samples 的类型');
                }


                return obj;
            },


            /**
             * 对一个源对象进行成员过滤，并把过滤后的结果扩展到目标对象上。
             * 该方法可以从指定的对象上拷贝指定的成员到目标对象上。
             * @param {Object} target 接收成员的目标对象。
             * @param {Object} src 要进行拷贝的对象，即数据来源。
             * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
             * @return {Object} 返回一个过滤后的新对象。
             * @example
             var target = {
            myName: 'micty'
        };

             var src = {
            a: 100,
            b: 200,
            c: 300,
            d: 400
        };

             var samples = {
            a: 1,
            b: 2
        };

             //或 samples = ['a', 'b'];

             $.Object.filterTo(target, src, samples);
             console.dir(target); //得到 target = { myName: 'micty', a: 100, b: 200 };
             */
            filterTo: function (target, src, samples) {
                var obj = This.filter(src, samples);
                return This.extend(target, obj);
            },

            /**
             * 使用过滤函数对指定的对象进行过滤数，返回一个新对象。
             * @param {Object} target 要进行过滤的对象。
             * @param {function} fn 过滤函数。
             *   过滤函数会接收到两个参数：当前对象中迭代中的 key 和 value。
             *   过滤函数必须明确返回 true 以保留该成员，其它值则删除该成员。
             * @return {Object} 返回一个过滤后的纯对象。
             */
            grep: function (target, fn) {

                var obj = {};

                for (var key in target) {
                    var value = target[key];
                    if (fn(key, value) === true) { //只有回调函数中明确返回 true 才保留该成员
                        obj[key] = value;
                    }
                }

                return obj;
            },

            /**
             * 判断符合条件的元素是否存在。
             * 只有在回调函数中明确返回 true，才算找到，此时本方法停止迭代，并返回 true 以指示找到；
             * 否则迭代继续直至完成，并返回 false 以指示不存在符合条件的元素。
             * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
             * @param {function} fn 自定义查找的函数。
             只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
             * @param {boolean} isDeep 指示是否深层次迭代查找。
             * @return {boolean} 如果找到符合条件的元素，则返回 true；否则返回 false。
             * @example
             var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 1,
                b: 1,
                c: 2
            }
        };

             var found = $.Object.find(obj, function (key, value) {
            if (key == 'b' && value == 1) {
                return true;
            }
        }, true);
             console.log(found); //true
             */
            find: function (obj, fn, isDeep) {

                var found = false;

                This.each(obj, function (key, value) {
                    if (fn(key, value) === true) {
                        found = true;
                        return false;  // break
                    }
                }, isDeep);

                return found;
            },

            /**
             * 查找符合条件的元素，返回一个键值的二元组[key, value]。
             * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
             * @param {function} fn 自定义查找的函数。
             只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
             * @param {boolean} isDeep 指示是否深层次迭代查找。
             * @return {boolean} 如果找到符合条件的元素，则返回该项的键值二元组[key, value]。
             * @example
             var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 10,
                b: 10,
                c: 20
            }
        };

             var item = $.Object.findItem(obj, function (key, value) {
            return value == 20;
        }, true);
             console.log(item); //['c', 20]
             */
            findItem: function (obj, fn, isDeep) {

                var item = [];

                This.each(obj, function (key, value) {

                    if (fn(key, value) === true) {
                        item = [key, value];
                        return false;  // break
                    }

                }, isDeep);

                return item;
            },

            /**
             * 查找符合条件的元素，返回该元素的键。
             * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
             * @param {function} fn 自定义查找的函数。
             只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
             * @param {boolean} isDeep 指示是否深层次迭代查找。
             * @return {boolean} 如果找到符合条件的元素，则返回该项的键；否则返回 undefined。
             * @example
             var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 10,
                b: 10,
                c: 20
            }
        };

             var key = $.Object.findKey(obj, function (key, value) {
            return value == 20;
        }, true);
             console.log(key); // 'c'
             */
            findKey: function (obj, fn, isDeep) {
                var item = This.findItem(obj, fn, isDeep);
                return item[0];
            },

            /**
             * 查找符合条件的元素，返回该元素的值。
             * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
             * @param {function} fn 自定义查找的函数。
             只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
             * @param {boolean} isDeep 指示是否深层次迭代查找。
             * @return {boolean} 如果找到符合条件的元素，则返回该元素的值；否则返回 undefined。
             * @example
             var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 10,
                b: 10,
                cc: 20
            }
        };

             var value = $.Object.findValue(obj, function (key, value) {
            return key == 'cc';
        }, true);
             console.log(value); //20
             */
            findValue: function (obj, fn, isDeep) {
                var item = This.findItem(obj, fn, isDeep);
                return item[1];
            },

            /**
             * 获取指定的对象指定成员所对应的值。
             * 当对象中不存在该成员时，返回一个备用值。
             * @param {Object} obj 要获取值的对象。
             * @param key 要获取值的成员。
             * @param backupValue 备用值。。
             * @return 如果对象中存在该成员，则返回该成员所对应的值；否则，返回备用值。
             * @example
             var value = $.Object.get({}, 'a', 2);
             console.log(value); //得到 2;

             var value = $.Object.get({a: 1 }, 'a', 2);
             console.log(value); //得到 1;

             var value = $.Object.get(null, 'a', 1);
             console.log(value); //得到 1;
             */
            get: function (obj, key, backupValue) {

                if (!obj) {
                    return backupValue;
                }

                if (key in obj) {
                    return obj[key];
                }

                return backupValue;
            },

            /**
             * 给指定的对象设置一个键和一个值。
             * @param {Object} obj 要设置的对象。
             * @param key 设置对象所用的键。
             * @param value 设置对象所用的值。
             * @return {Object} 返回第一个参数 obj，即设置的对象。
             * @example
             var obj = $.Object.set({}, 'a', 1);
             console.dir(obj); //得到 obj = { a: 1 };
             */
            set: function (obj, key, value) {
                obj[key] = value;
                return obj;
            },

            /**
             * 用指定的键和值组合生成一个对象，支持批量操作。
             * @param {string|number|boolean|Array} key 生成对象所用的键。
             当是数组时，表示批量操作，格式必须是二元组。
             * @param value 生成对象所用的值。
             * @return {Object} 返回一个生成后的对象。
             * @example

             //单个操作
             var obj = $.Object.make('a', 1);
             console.dir(obj); //得到 obj = { a: 1 };

             //批量操作
             var obj = $.Object.make(
             ['a', 1],
             ['b', 2],
             ['c', 3]
             );
             console.dir(obj); //得到 obj = { a: 1, b: 2, c: 3};
             */
            make: function (key, value) {

                var $ = MiniQuery;
                var obj = {};

                if (This.isArray(key)) {
                    $.Array(arguments).each(function (pair, index) {
                        obj[pair[0]] = pair[1];
                    });
                }
                else {
                    obj[key] = value;
                }

                return obj;
            },


            /**
             * 获取指定对象的所有成员中的键，返回一个数组。
             * @param {Object} obj 要进行获取值的对象。
             * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
             如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
             否则指定为 false，此时为返回一个一维数组。
             * @return 返回一个由值组成的一维或多维数组。
             */
            getKeys: function (obj, isDeep) {

                var fn = arguments.callee;

                var a = [];

                for (var key in obj) {

                    var value = obj[key];

                    if (isDeep === true &&
                        typeof value == 'object' &&
                        value !== null) {

                        key = fn(value, isDeep);
                    }

                    a.push(key);
                }

                return a;
            },

            /**
             * 获取指定对象的所有成员中的值，返回一个数组。
             * @param {Object} obj 要进行获取值的对象。
             * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
             如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
             否则指定为 false，此时为返回一个一维数组。
             * @return 返回一个由值组成的一维或多维数组。
             */
            getValues: function (obj, isDeep) {

                var fn = arguments.callee;

                var a = [];

                for (var key in obj) {
                    var value = obj[key];

                    if (isDeep === true &&
                        typeof value == 'object' &&
                        value !== null) {

                        value = fn(value, isDeep);
                    }

                    a.push(value);
                }

                return a;
            },

            /**
             * 获取指定对象的所有成员中的键和值，返回一个二元组 [key, value] 的数组。
             * @param {Object} obj 要进行获取值的对象。
             * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
             如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
             否则指定为 false，此时为返回一个一维数组。
             * @return 返回一个由二元组 [key, value] 组成的数组。
             */
            getItems: function (obj, isDeep) {

                return This.toArray(obj, true, isDeep);
            },

            /**
             * 把一个对象的名称-值对转成用指定分隔符连起来的字符串。
             * @param {Object} nameValues 键值表
             * @param {String} [nameValueSeparator='='] name_value 的分隔符。
             如果不指定则默认为 "=" 号
             * @param {String} [pairSeparator='&'] 键值对的分隔符。
             如果不指定则默认为 "&" 号
             * @return {String} 用分隔符进行连接的字符串。
             * @example
             var a = $.Object.join( {a:1, b:2, c:3}, '=', '&' ); //得到 'a=1&b=2&c=3'
             var b = $.Object.join( {a:1, b:2, c:3} );   //得到 'a=1&b=2&c=3'
             */
            join: function (nameValues, nameValueSeparator, pairSeparator) {
                nameValueSeparator = nameValueSeparator || '=';
                pairSeparator = pairSeparator || '&';

                var pairs = [];
                for (var name in nameValues) {
                    pairs.push(name + nameValueSeparator + nameValues[name]);
                }

                return pairs.join(pairSeparator);
            }



        });




    })(MiniQuery, MiniQuery.Object);


//----------------------------------------------------------------------------------------------------------------
//MiniQuery.Object 包装类的实例方法

    ; (function (This) {


        var slice = Array.prototype.slice;

        This.prototype = { /**@inner*/

        constructor: This,
            value: {},


            init: function (obj) {
                this.value = Object(obj);
            },

            /**
             * 拆包装，获取 Object 对象。
             */
            valueOf: function () {
                return this.value;
            },


            clone: function () {
                return This.clone(this.value);
            },


            each: function (fn, isDeep) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                This.each.apply(null, args);

                return this;
            },


            extend: function () {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.extend.apply(null, args);
                return this;
            },

            extendSafely: function () {

                var args = [this.value].concat(slice.call(arguments, 0));

                this.value = This.extendSafely.apply(null, args);
                return this;
            },


            getType: function () {
                return This.getType(this.value);
            },


            isArray: function (isStrict) {
                return This.isArray(this.value, isStrict);
            },


            isBuiltinType: function () {
                return This.isBuiltinType(this.value);
            },


            isEmpty: function () {
                return This.isEmpty(this.value);
            },


            isPlain: function () {
                return This.isPlain(this.value);
            },


            isValueType: function () {
                return This.isValueType(this.value);
            },


            isWindow: function () {
                return This.isWindow(this.value);
            },


            isWrappedType: function () {
                return This.isWrappedType(this.value);
            },


            map: function (fn, isDeep) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.map.apply(null, args);
                return this;
            },


            namespace: function (path, value) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.namespace.apply(null, args);
                return this;
            },


            parseJson: function (data) {
                this.value = This.parseJson(data);
                return this;
            },


            parseQueryString: function (url, isShallow, isCompatible) {

                var args = slice.call(arguments, 0);

                this.value = This.parseQueryString.apply(null, args);
                return this;
            },


            remove: function (keys) {
                this.value = This.remove(this.value, keys);
                return this;
            },


            replaceValues: function (nameValues, isShallow) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.replaceValues.apply(null, args);
                return this;
            },


            toArray: function (rule, isDeep) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                return This.toArray.apply(null, args);
            },


            toJson: function () {
                return This.toJson(this.value);
            },


            toQueryString: function (isCompatible) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                return This.toQueryString.apply(null, args);
            },


            join: function (innerSeparator, pairSeparator) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                return This.join.apply(null, args);
            },


            trim: function (values, isDeep) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.trim.apply(null, args);
                return this;
            },

            filter: function (samples) {
                this.value = This.filter(this.value, samples);
                return this;
            },

            filterTo: function (src, samples) {
                this.value = This.filterTo(this.value, src, samples);
                return this;
            },

            grep: function (fn) {
                this.value = This.grep(this.value, fn);
                return this;
            },

            find: function (fn, isDeep) {
                return This.find(this.value, fn, isDeep);
            },

            findItem: function (fn, isDeep) {
                return This.findItem(this.value, fn, isDeep);
            },

            findKey: function (fn, isDeep) {
                return This.findKey(this.value, fn, isDeep);
            },

            findValue: function (fn, isDeep) {
                return This.findValue(this.value, fn, isDeep);

            },

            get: function (key, backupValue) {
                return This.get(this.value, key, backupValue);
            },

            set: function (key, value) {
                This.set(this.value, key, value);
                return this;
            },

            make: function (key, value) {
                this.value = This.make(key, value);
                return this;
            },

            getKeys: function (isDeep) {
                return This.getKeys(this.value, isDeep);
            },

            getValues: function (isDeep) {
                return This.getValues(this.value, isDeep);
            },

            getItems: function (isDeep) {
                return This.getItems(this.value, isDeep);
            }


        };

        This.prototype.init.prototype = This.prototype;




    })(MiniQuery.Object);

    /**
     * 数组工具
     * @class
     */
    MiniQuery.Array = function (array) {
        return new MiniQuery.Array.prototype.init(array);
    };



    ; (function ($, This) {


        $.extend(This, { /**@lends MiniQuery.Array*/

            /**
             * 对数组进行迭代，即对数组中的每个元素执行指定的操作。
             * @param {Array} array 要进行迭代的数组。
             * @param {function} fn 要执行处理的回调函数，会接受到当前元素和其索引作为参数。<br />
             *   只有在 fn 中明确返回 false 才停止循环(相当于 break)。
             * @param {boolean} [isReversed=false] 指定是否使用倒序进行迭代。
             如果要使用倒序来进行迭代，请指定 true；否则默认按正序。
             * @return {Array} 返回当前数组。
             * @example
             $.Array.each([0, 1, 2, 3], function(item, index) {
            if(index == 2) {
                return false;
            }
            console.log(index, ': ', item);
        });
             */
            each: function (array, fn, isReversed) {
                var len = array.length;

                if (isReversed === true) { //使用反序。 根据<<高性能 JavaScript>>的论述，这种循环性能可以比 else 中的提高 50% 以上
                    for (var i = len; i--;) { //这里只能用后减减，而不能用前减减，因为这里是测试条件，先测试，再减减
                        //如果用 callback.call(array[i], i)，
                        //则在 callback 中的 this 就指参数中的 array[i]，但类型全部为 object
                        if (fn(array[i], i) === false) { // 只有在 fn 中明确返回 false 才停止循环
                            break;
                        }
                    }
                }
                else {
                    for (var i = 0; i < len; i++) {
                        if (fn(array[i], i) === false) {
                            break;
                        }
                    }
                }

                return array;
            },

            /**
             * 把一个对象转成数组。
             * @param {Object} obj 要进行转换的对象。<br />
             * @param {boolean} [useForIn=false] 指示是否使用 for in 来枚举要 obj 对象。<br />
             * @return {Array} 返回一个数组。<br />
             如果 obj 本身就是数组，则直接返回该对象（数组）。<br />
             如果 obj 没有 length 属性，或者不方便使用 length，请指定 useForIn 为 true，
             则使用 for in 来枚举该对象并填充到一个新数组中然后返回该数组；<br />
             否则如果 useForIn 指定为 false 或者不指定，并且该对象：<br />
             1.为 undefined <br />
             2.或 null <br />
             3.或不是对象<br />
             4.或该对象不包含 length 属性<br />
             5.或 length 为 0<br />

             则返回空数组；<br />
             否则按 obj.length 进行枚举并填充到一个数组里进行返回。
             */
            parse: function (obj, useForIn) {
                //本身就是数组。
                //这里不要用 $.Object.isArray(obj)，因为跨页面得到的obj，即使 $.Object.getType(obj) 返回 'Array'，
                //但在 IE 下 obj instanceof Array 仍为 false，从而对 obj 调用数组实例的方法就会出错。
                //即使该方法确实存在于 obj 中，但 IE 仍会报“意外地调用了方法或属性访问”的错误。
                //
                if (obj instanceof Array) {
                    return obj;
                }


                var a = [];

                if (useForIn === true) { //没有 length 属性，或者不方便使用 length，则使用 for in

                    for (var name in obj) {
                        if (name === 'length') //忽略掉 length 属性
                        {
                            continue;
                        }

                        a.push(obj[name]);
                    }

                    return a;
                }


                if (!obj || !obj.length) { //参数非法
                    return [];
                }



                try { //标准方法

                    a = Array.prototype.slice.call(obj, 0);
                }
                catch (ex) {
                    for (var i = 0, len = obj.length; i < len; i++) {
                        a.push(obj[i]);
                    }
                }

                return a;
            },

            /**
             * 已重载。
             * 把一个数组转成 Object 对象。
             * @param {Array} array 要进行转换的数组。
             * @param {Array|Object|Function} [maps] 转换的映射规则。
             <pre>
             1.当不指定第二个参数 maps 时，将得到一个类数组的对象（arguments 就是这样的对象）。
             否则，用参数 maps 指定的映射规则去填充一个新的对象并返回该对象，其中：
             2.当 maps 为数组时，则作为键的列表[ key0,…, keyN ]一一对应去建立键值映射关系，即 {keyN: array[N]}；
             3.当 maps 为对象时，则作为键-索引的映射关系去建立对象；
             4.当 maps 为函数时，则会调用该函数取得一个处理结果。
             其中该处理函数会接受到当前处理的数组项 item 和索引 index 作为参数。
             如果处理函数返回一个数组，则第1个元素作为键，第2个元素作为值，存到目标对象上。
             如果处理函数返回一个对象，则第1个成员的键作为键，第1个成员的值作为值，存到目标对象上，其他的忽略。

             如果参数非法，则返回 null；
             否则把数组的元素拷贝到一个新的 Object 对象上并返回它。
             </pre>
             * @return {Object} 返回一个 Object 对象，该对象上包含数组的处理结果，并且包含一个 length 成员。
             * @example
             //例子1: 不指定第二个参数 maps，得到一个类数组的对象（arguments 就是这样的对象）。
             var obj = $.Array.toObject(array);
             //等价于：
             var obj = {
            0: array[0],
            1: array[1],
            //...
            length: array.length    
        };

             //例子2: maps 为数组，则作为键的列表[key0,…, keyN]一一对应去建立键值映射关系，即{keyN: array[N]}
             var obj = $.Array.toObject(array, ['a', 'b', 'c']);
             //等价于
             var obj = {
            a: array[0], //maps[0] --> array[0]
            b: array[1], //maps[1] --> array[1]
            c: array[2]  //maps[2] --> array[2]
        };

             //例子3:  maps 为对象，则作为键-索引的映射关系去建立对象
             var obj = $.Array.toObject(array, {
            a: 1,
            b: 1,
            c: 2
        });
             //等价于
             var obj = {
            a: array[1], //maps['a'] --> array[1]
            b: array[1], //maps['b'] --> array[1]
            c: array[2]  //maps['c'] --> array[2]
        };

             //例子4: maps 为函数，则会调用该函数取得一个处理结果
             var obj = $.Array.toObject(['a', 'b', 'c'], function(item, index) {
            return [item, index + 1000]; //第1个元素作为键，第2个元素作为值
        });
             //得到
             obj = {
            a: 1000,
            b: 1001
            c: 1002
        };

             //又如：
             var obj = $.Array.toObject(['a', 'b', 'c'], function(item, index) {
            //处理函数返回一个对象，则第1个成员的键作为键，第1个成员的值作为值，存到目标对象上，其他的忽略。
            var obj = {};
            obj[item] = index + 1000;
            return obj;
            
        });
             //得到
             obj = {
            a: 1000,
            b: 1001
            c: 1002
        };
             */
            toObject: function (array, maps) {

                //参数非法
                if (!array || !$.Object.isArray(array)) {
                    return null;
                }

                var obj = {};

                //未指定参数 maps
                if (maps === undefined) {
                    var len = array.length;
                    obj.length = len;

                    for (var i = 0; i < len; i++) {
                        obj[i] = array[i];
                    }

                    return obj;
                }

                // maps 是数组 [ key0, key1, … ]，即键的列表
                if ($.Object.isArray(maps)) {

                    var count = 0;
                    var len = maps.length; //键的个数

                    for (var i = 0; i < len; i++) {
                        var key = maps[i];
                        if (key in obj) {
                            continue;
                        }

                        obj[key] = array[i];
                        count++;
                    }

                    obj.length = count; //maps 中可能含有相同的元素

                    return obj;
                }


                // maps 是对象 { key0: 0, key1: 1, … }，即键跟索引的映射
                if ($.Object.isPlain(maps)) {
                    var len = 0;

                    for (var key in maps) {
                        obj[key] = array[maps[key]];
                        len++; //计数
                    }

                    obj.length = len;

                    return obj;
                }

                //maps 是一个处理函数
                if (typeof maps == 'function') {
                    var len = array.length;

                    for (var i = 0; i < len; i++) {
                        var v = maps(array[i], i); //调用处理函数以获得处理结果

                        if (v instanceof Array) { //处理函数返回的是数组
                            var key = v[0];     //第0个元素作为键
                            var value = v[1];   //第1个元素作为值

                            obj[key] = value;   //建立键值的映射关系
                        }
                        else if ($.Object.isPlain(v)) { //返回的是一个对象
                            for (var key in v) { //只处理第一个key，其他的忽略
                                obj[key] = v[key]; //建立键值的映射关系
                                break;
                            }
                        }
                        else {
                            throw new Error('处理函数 maps 返回结果的格式不可识别');
                        }
                    }

                    obj.length = len;

                    return obj;
                }

                return obj;
            },

            /**
             * 把一个数组中的元素转换到另一个数组中，返回一个新的数组。
             * @param {Array} 要进行转换的数组。
             * @param {function} 转换函数。
             该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
             * 转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
             *   null：忽略当前数组元素，即该元素在新的数组中不存在对应的项（相当于 continue）；
             *   undefined：忽略当前数组元素到最后一个元素（相当于break）；
             * @return {Array} 返回一个转换后的新数组。
             */
            map: function (array, fn) {

                var a = [];

                for (var i = 0, len = array.length; i < len; i++) {
                    var value = fn(array[i], i);

                    if (value === null) {
                        continue;
                    }

                    if (value === undefined) { //注意，当回调函数 fn 不返回值时，迭代会给停止掉
                        break;
                    }

                    a.push(value);
                }

                return a;
            },

            /**
             * 将一个数组中的元素转换到另一个数组中，并且保留所有的元素，返回一个新数组。
             * 作为参数的转换函数会为每个数组元素调用，并把当前元素和索引作为参数传给转换函数。
             * 该方法与 map 的区别在于本方法会保留所有的元素，而不管它的返回是什么。
             */
            keep: function (array, fn) {

                var a = [];

                for (var i = 0, len = array.length; i < len; i++) {
                    var value = fn(array[i], i);
                    a.push(value);
                }

                return a;
            },

            /**
             * 使用过滤函数过滤数组元素，返回一个新数组。
             * 此函数至少传递两个参数：待过滤数组和过滤函数。过滤函数必须返回 true 以保留元素或 false 以删除元素。
             * 转换函数可以返回转换后的值：
             */
            grep: function (array, fn) {
                var a = [];

                for (var i = 0, len = array.length; i < len; i++) {
                    var item = array[i];

                    if (fn(item, i) === true) {
                        a.push(item);
                    }
                }

                return a;
            },

            /**
             * 检索特定的元素在数组中第一次出现的索引位置。
             * 注意，该方法用的是全等的比较操作。
             * @param {Array} array 要进行检索的数组。
             * @param {任意类型} item 要进行检索的项。
             * @return 返回一个整数，表示检索项在数组第一次出现的索引位置。
             *   如果不存在该元素，则返回 -1。
             * @example
             $.Array.indexOf(['a', '10', 10, 'b'], 10); //使用的是全等比较，结果为 2

             */
            indexOf: function (array, item) {
                if (typeof array.indexOf == 'function') { //内置方法
                    return array.indexOf(item);
                }

                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i] === item) {
                        return i;
                    }
                }

                return -1;
            },

            /**
             * 判断数组中是否包含特定的元素，返回 true 或 false。
             */
            contains: function (array, item) {
                return This.indexOf(array, item) > -1;
            },


            /**
             * 从数组中删除特定的元素，返回一个新数组。
             */
            remove: function (array, target) {

                //不要用 map 方法，因为会把原有的 null 或 undefined 也删除掉，这不是本意。
                var a = [];
                for (var i = 0, len = array.length; i < len; i++) {

                    var item = array[i];
                    if (item === target) {
                        continue;
                    }

                    a.push(item);
                }

                return a;
            },

            /**
             * 从数组中删除特定索引位置的元素，返回一个新数组。
             */
            removeAt: function (array, index) {
                var a = array.slice(0); //拷贝一份。
                a.splice(index, 1);
                return a;
            },

            /**
             * 反转数组，返回一个新数组。
             */
            reverse: function (array) {
                var a = [];

                for (var i = array.length - 1; i >= 0; i--) {
                    a.push(array[i]);
                }

                return a;
            },

            /**
             * 批量合并数组，返回一个新数组。
             */
            merge: function () {
                var a = [];

                for (var i = 0, len = arguments.length; i < len; i++) {
                    var arg = arguments[i];
                    if (arg === undefined) {
                        continue;
                    }

                    a = a.concat(arg);
                }

                return a;
            },

            /**
             * 批量合并数组，并删除重复的项，返回一个新数组。
             */
            mergeUnique: function () {
                var list = [];

                var argsLen = arguments.length;
                var contains = This.contains; //缓存一下方法引用，以提高循环中的性能

                for (var index = 0; index < argsLen; index++) {
                    var arg = arguments[index];
                    var len = arg.length;

                    for (var i = 0; i < len; i++) {
                        if (!contains(list, arg[i])) {
                            list.push(arg[i]);
                        }
                    }
                }

                return list;
            },

            /**
             * 删除重复的项，返回一个新数组。
             * 定义该接口，是为了语义上更准确。
             */
            unique: function (a) {
                return This.mergeUnique(a);
            },

            /**
             * 给数组删除（如果已经有该项）或添加（如果还没有项）一项，返回一个新数组。
             */
            toggle: function (array, item) {

                if (This.contains(array, item)) {
                    return This.remove(array, item);
                }
                else {
                    var list = array.slice(0);
                    list.push(item);
                    return list;
                }

            },


            /**
             * 判断符合条件的元素是否存在。
             * 只有在回调函数中明确返回 true，才算找到，此时本方法停止迭代，并返回 true 以指示找到；
             * 否则迭代继续直至完成，并返回 false 以指示不存在符合条件的元素。
             */
            find: function (array, fn, startIndex) {
                return This.findIndex(array, fn, startIndex) > -1;
            },


            /**
             * 查找符合条件的单个元素的索引，返回第一次找到的元素的索引值，否则返回 -1。
             * 只有在回调函数中明确返回 true，才算找到。
             */
            findIndex: function (array, fn, startIndex) {
                startIndex = startIndex || 0;

                for (var i = startIndex, len = array.length; i < len; i++) {
                    if (fn(array[i], i) === true) { // 只有在 fn 中明确返回 true 才停止循环
                        return i;
                    }
                }

                return -1;
            },

            /**
             * 查找符合条件的单个元素，返回第一次找到的元素，否则返回 null。
             * 只有在回调函数中中明确返回 true 才算是找到。
             */
            findItem: function (array, fn, startIndex) {
                startIndex = startIndex || 0;

                for (var i = startIndex, len = array.length; i < len; i++) {
                    var item = array[i];
                    if (fn(item, i) === true) { // 只有在 fn 中明确返回 true 才算是找到
                        return item;
                    }
                }

                return null;
            },

            /**
             * 对此数组的元素进行随机排序，返回一个新数组。
             * @param {Array} list 要进行排序的数组。
             * @return {Array} 返回一个随机排序的新数组。
             * @example
             $.Array.random( ['a', 'b', 'c', 'd'] );
             */
            random: function (list) {
                var array = list.slice(0);

                for (var i = 0, len = array.length; i < len; i++) {
                    var index = parseInt(Math.random() * i);
                    var tmp = array[i];
                    array[i] = array[index];
                    array[index] = tmp;
                }

                return array;
            },

            /**
             * 随机获取数组中的一个元素。
             * @param {Array} array 要进行获取元素的数组。
             * @return 随机返回一个数组项。
             当数组为空时，返回 undefined。
             * @example
             $.Array.randomItem( ['a', 'b', 'c', 'd'] );
             */
            randomItem: function (array) {
                var len = array.length;
                if (len < 1) {
                    return undefined;
                }

                var index = $.Math.randomInt(0, len - 1);
                return array[index];

            },

            /**
             * 获取数组中指定索引位置的元素。
             * 如果传入负数，则从后面开始算起。如果不传参数，则返回一份拷贝的新数组。
             */
            get: function (array, index) {
                var len = array.length;

                if (index >= 0 && index < len) {  //在常规区间
                    return array[index];
                }

                var pos = index + len;
                if (index < 0 && pos >= 0) {
                    return array[pos];
                }

                if (index == null) { // undefined 或 null

                    return array.slice(0);
                }
            },

            /**
             * 删除数组中为 null 或 undefined 的项，返回一个新数组
             */
            trim: function (array) {
                return This.map(array, function (item, index) {
                    return item == null ? null : item;  //删除 null 或 undefined 的项
                });
            },

            /**
             * 创建分组，即把转成二维数组。返回一个二维数组。
             * 当指定第三个参数为 true 时，可在最后一组向右对齐数据。
             */
            group: function (array, size, isPadRight) {
                var groups = This.slide(array, size, size);

                if (isPadRight === true) {
                    groups[groups.length - 1] = array.slice(-size); //右对齐最后一组
                }

                return groups;
            },

            /**
             * 用滑动窗口的方式创建分组，即把转成二维数组。返回一个二维数组。
             * 可以指定窗口大小和步长。步长默认为1。
             */
            slide: function (array, windowSize, stepSize) {
                if (windowSize >= array.length) { //只够创建一组
                    return [array];
                }

                stepSize = stepSize || 1;

                var groups = [];

                for (var i = 0, len = array.length; i < len; i = i + stepSize) {
                    var end = i + windowSize;

                    groups.push(array.slice(i, end));

                    if (end >= len) {
                        break; //已达到最后一组
                    }
                }

                return groups;
            },

            /**
             * 用圆形的方式截取数组片段，返回一个新的数组。
             * 即把数组看成一个首尾相接的圆圈，然后从指定位置开始截取指定长度的片段。
             */
            circleSlice: function (array, startIndex, size) {
                var a = array.slice(startIndex, startIndex + size);
                var b = [];

                var d = size - a.length;
                if (d > 0) { //该片段未达到指定大小，继续从数组头部开始截取
                    b = array.slice(0, d);
                }

                return a.concat(b);
            },

            /**
             * 用圆形滑动窗口的方式创建分组，返回一个二维数组。
             * 可以指定窗口大小和步长。步长默认为 1。
             * 即把数组看成一个首尾相接的圆圈，然后开始滑动窗口。
             */
            circleSlide: function (array, windowSize, stepSize) {
                if (array.length < windowSize) {
                    return [array];
                }

                stepSize = stepSize || 1;

                var groups = [];
                var circleSlice = This.circleSlice; //缓存方法的引用，以提高循环中的性能

                for (var i = 0, len = array.length; i < len; i = i + stepSize) {
                    groups.push(circleSlice(array, i, windowSize));
                }

                return groups;
            },

            /**
             * 对一个数组的所有元素进行求和。
             * @param {Array} array 要进行求和的数组。
             * @param {boolean} [ignoreNaN=false] 指示是否忽略掉值为 NaN 的项。
             如果要忽略掉值为 NaN 的项，请指定为 true；否则为 false 或不指定。
             * @param {string} [key] 要读取的项的成员的键名称。
             *   如果指定第三个参数时，将读取数组元素中的对应的成员，该使用方式主要用于由 json 组成的的数组中。
             * @return {Number} 返回数组所有元素之和。
             * @example
             var a = [1, 2, 3, 4];
             var sum = $.Array.sum(a); //得到 10
             //又如
             var a = [
             { value: 1 },
             { value: NaN },
             { value: 3 },
             { value: 4 },
             ];
             var sum = $.Array.sum(a, true, 'value'); //得到 8

             */
            sum: function (array, ignoreNaN, key) {
                var sum = 0;

                var hasKey = !(key === undefined);

                for (var i = 0, len = array.length; i < len; i++) {
                    var value = hasKey ? array[i][key] : array[i];

                    if (isNaN(value)) {
                        if (ignoreNaN === true) {
                            continue;
                        }
                        else {
                            throw new Error('第 ' + i + ' 个元素的值为 NaN');
                        }
                    }
                    else {
                        sum += Number(value); //可以处理 string
                    }
                }

                return sum;
            },

            /**
             * 查找一个数组的所有元素中的最大值。
             * 当指定第二个参数为 true 时，可以忽略掉 NaN 的元素。
             * 当指定第三个参数时，将读取数组元素中的对应的成员，该使用方式主要用于由 json 组成的的数组中。
             */
            max: function (array, ignoreNaN, key) {
                var max = 0;

                var hasKey = !(key === undefined);

                for (var i = 0, len = array.length; i < len; i++) {
                    var value = hasKey ? array[i][key] : array[i];

                    if (isNaN(value)) {
                        if (ignoreNaN === true) {
                            continue;
                        }
                        else {
                            throw new Error('第 ' + i + ' 个元素的值为 NaN');
                        }
                    }
                    else {
                        value = Number(value); //可以处理 string
                        if (value > max) {
                            max = value;
                        }
                    }
                }

                return max;
            },

            /**
             * 判断数组中是否包含元素。
             * 当传入的参数为数组，并且其 length 大于 0 时，返回 true；否则返回 false。
             */
            hasItem: function (array) {
                return $.Object.isArray(array) &&
                    array.length > 0;
            },

            /**
             * 给数组降维，返回一个新数组。
             * 可以指定降维次数，当不指定次数，默认为 1 次。
             */
            reduceDimension: function (array, count) {
                count = count || 1;

                var a = array;
                var concat = Array.prototype.concat; //缓存一下方法引用，以提高循环中的性能

                for (var i = 0; i < count; i++) {
                    a = concat.apply([], a);
                }

                return a;
            },


            /**
             * 求两个或多个数组的笛卡尔积，返回一个二维数组。
             * @param {Array} arrayA 要进行求笛卡尔积的数组A。
             * @param {Array} arrayB 要进行求笛卡尔积的数组B。
             * @return {Array} 返回一个笛卡尔积的二维数组。
             * @example：
             var A = [a, b];
             var B = [0, 1, 2]; 求积后结果为：
             var C = $.Array.descartes(A, B);
             //得到
             C = [
             [a, 0], [a, 1], [a, 2],
             [b, 0], [b, 1], [b, 2]
             ];
             * 注意：
             *   $.Array.descartes(A, B, C)并不等于（但等于$.Array(A).descartes(B, C)的结果）
             *   $.Array.descartes($.Array.descartes(A, B), C)（但等于$.Array(A).descartes(B).descartes(C)的结果）
             */
            descartes: function (arrayA, arrayB) {
                var list = fn(arrayA, arrayB); //常规情况，两个数组

                for (var i = 2, len = arguments.length; i < len; i++) { //(如果有)多个数组，递归处理
                    list = fn(list, arguments[i], true);
                }

                return list;


                /*仅内部使用的一个方法*/
                function fn(A, B, reduced) {
                    var list = [];

                    for (var i = 0, len = A.length; i < len; i++) {
                        for (var j = 0, size = B.length; j < size; j++) {
                            var item = [];

                            if (reduced) { //参数多于两个的情况，降维
                                item = item.concat(A[i]); //此时的 A[i] 为一个数组，如此相较于 item[0] = A[i] 可降维
                                item.push(B[j]); //把 A[i] 的所有元素压入 item 后，再把 B[j] 作为一个元素压入item
                            }
                            else { //下面组成一个有序的二元组
                                item[0] = A[i];
                                item[1] = B[j]; //这里也相当于 item.push( B[j] )
                            }

                            list.push(item);
                        }
                    }

                    return list;
                }
            },

            /**
             * 把笛卡尔积分解成因子，返回一个二维数组。
             * 该方法是求笛卡尔积的逆过程。
             * 参数 sizes 是各因子的长度组成的一维数组。
             */
            divideDescartes: function (array, sizes) {
                var rows = array.length; // "局部数组"的长度，从整个数组开始

                var list = [];

                for (var i = 0, len = sizes.length; i < len; i++) { //sizes的长度，就是因子的个数
                    var size = sizes[i];    //当前因子的长度
                    var step = rows / size;   //当前因子中的元素出现的步长(也是每个元素重复次数)

                    var a = []; //分配一个数组来收集当前因子的 size 个元素

                    for (var s = 0; s < size; s++) { //收集当前因子的 size 个元素
                        a.push(array[s * step][i]); //因为因子中的每个元素重复出现的次数为 step，因此采样步长为 step
                    }

                    rows = step; //更新下一次迭代中的"局部数组"所指示的长度
                    list[i] = a; //引用到因子收集器中
                }

                return list;
            },

            /**
             * 对数组进行转置。
             * 即把数组的行与列对换，返回一个新数组。
             * @param {Array} array 要进行转置的数组。
             * @return {Array} 返回一个转置后的数组。
             * @example
             *   var A = [
             ['a', 'b', 'c'],
             [100, 200, 300]
             ];
             var B = $.Array.transpose(A);
             //得到
             C = [
             ['a', 100],
             ['b', 200],
             ['c', 300],
             ]
             */
            transpose: function (array) {
                var A = array; //换个名称，代码更简洁，也更符合线性代数的表示

                var list = [];

                var rows = A.length;    //行数
                var cols = 1;           //列数，先假设为 1 列，在扫描行时，会更新成该行的最大值

                for (var c = 0; c < cols; c++) { //从列开始扫描

                    var a = [];

                    for (var r = 0; r < rows; r++) { //再扫描行
                        if (A[r].length > cols) { //当前行的列数比 cols 要大，更新 cols
                            cols = A[r].length;
                        }

                        a.push(A[r][c]);
                    }

                    list[c] = a;
                }

                return list;
            },

            /**
             * 求两个或多个数组的交集，返回一个最小集的新数组。
             * 即返回的数组中，已对元素进行去重。
             * 元素与元素的比较操作用的是全等关系
             */
            intersection: function (arrayA, arrayB) {
                var list = arrayA;

                for (var i = 1, len = arguments.length; i < len; i++) {
                    list = fn(list, arguments[i]);
                }

                return list;


                function fn(A, B) {
                    var list = [];

                    for (var i = 0, len = A.length; i < len; i++) {
                        var item = A[i];

                        for (var j = 0, size = B.length; j < size; j++) {
                            if (item === B[j]) {
                                list.push(item);
                                break;
                            }
                        }
                    }

                    return This.unique(list);
                }
            },

            /**
             * 判断两个数组是否相等。
             * 只有同为数组并且长度一致时，才有可能相等。
             * 如何定义两个元素相等，或者定义两个元素相等的标准，由参数 fn 指定。
             * 当不指定 fn 时，由使用全等(严格相等)来判断
             */
            equals: function (A, B, fn) {
                //确保都是数组，并且长度一致
                if (!(A instanceof Array) || !(B instanceof Array) || A.length != B.length) {
                    return false;
                }

                //如何定义两个元素相等，或者定义两个元素相等的标准，由参数 fn 指定。
                //当不指定时，由使用全等来判断(严格相等)
                fn = fn || function (x, y) {
                    return x === y;
                };

                for (var i = 0, len = A.length; i < len; i++) {

                    if (!fn(A[i], B[i])) { //只要有一个不等，整个结果就是不等
                        return false;
                    }
                }

                return true;
            },

            /**
             * 判断第一个数组 A 是否包含于第二个数组 B，即 A 中所有的元素都可以在 B 中找到。
             */
            isContained: function (A, B) {
                return This.intersection(A, B).length == A.length;
            },


            /**
             * 右对齐此数组，在左边用指定的项填充以达到指定的总长度，返回一个新数组。
             * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
             */
            padLeft: function (array, totalLength, paddingItem) {
                var delta = totalLength - array.length; //要填充的数目

                if (delta <= 0) {
                    return array.slice(-delta); //-delta为正数
                }

                var a = [];
                for (var i = 0; i < delta; i++) {
                    a.push(paddingItem);
                }

                a = a.concat(array);

                return a;
            },

            /**
             * 左对齐此数组，在右边用指定的项填充以达到指定的总长度，返回一个新数组。
             * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
             */
            padRight: function (array, totalLength, paddingItem) {
                var delta = totalLength - array.length;

                if (delta <= 0) {
                    return array.slice(0, totalLength);
                }


                var a = array.slice(0); //克隆一份

                for (var i = 0; i < delta; i++) {
                    a.push(paddingItem);
                }

                return a;
            },

            /**
             * 产生一个区间为 [start, end) 的半开区间的数组。
             * @param {number} start 半开区间的开始值。
             * @param {number} end 半开区间的结束值。
             * @param {number} [step=1] 填充的步长，默认值为 1。可以指定为负数。
             * @return {Array} 返回一个递增（减）的数组。<br />
             *   当 start 与 end 相等时，返回一个空数组。
             * @example
             $.Array.pad(1, 9, 2); //产生一个从1到9的数组，步长为2，结果为[1, 3, 5, 7]
             $.Array.pad(5, 2, -1); //产生一个从5到2的数组，步长为-1，结果为[5, 4, 3]
             */
            pad: function (start, end, step) {
                if (start == end) {
                    return [];
                }

                step = Math.abs(step || 1);

                var a = [];

                if (start < end) { //升序
                    for (var i = start; i < end; i += step) {
                        a.push(i);
                    }
                }
                else { //降序
                    for (var i = start; i > end; i -= step) {
                        a.push(i);
                    }
                }

                return a;
            },

            /**
             * 对一个数组进行分类聚合。<br />
             * 该方法常用于对一个 JSON 数组按某个字段的值进行分组而得到一个新的 Object 对象。
             * @param {Array} array 要进行分类聚合的数组。一般是 JSON 数组。
             * @param {string|function} getKey 用于分类聚合的键，即要对 JSON 数组中的每项取哪个成员进行分类。<br />
             可以提供一个字符串值，也可以提供一个函数以返回一个键值。<br />
             如果提供的是函数，则会在参数中接收到当前处理的数组项和索引。
             * @param {function} [getValue] 用于处理当前数组项的函数，返回一个新值代替原来的数组项。<br />
             如果指定该参数，则会在参数中接收到当前处理的数组项和索引，然后返回一个新值来代替原来的数组项。<br />
             注意：类似于 $.Array.map 的规定用法，<br />
             当返回 null 时，则会 continue，忽略该返回值；<br />
             当返回 undefined 时，则会 break，停止再迭代数组；
             * @return {Object} 返回一个经过分类聚合的 Object 对象。
             * @example
             var books = [
             { name: 'C++', type: '计算机', year: 2012 },
             { name: 'JavaScript', type: '计算机', year: 2011 },
             { name: '简爱', type: '文学', year: 2011 },
             { name: '数据结构', type: '计算机', year: 2013 },
             { name: '人生', type: '文学', year: 2012 },
             { name: '大学物理', type: '物理', year: 2012 },
             { name: '高等数学', type: '数学', year: 2011 },
             { name: '微积分', type: '数学', year: 2013 }
             ];
             //按 type 进行聚合(分组)
             var byTypes = $.Array.aggregate( books, 'type' );

             //按 year 进行聚合(分组)，并重新返回一个值。
             var byYears = $.Array.aggregate( books, 'year', function(item, index) {
            return { name: item.name, type: item.type, year: '出版年份：' + item.year };
        });

             则 byTypes = {
            '计算机': [
                { name: 'C++', type: '计算机', year: 2012 },   
                { name: 'JavaScript', type: '计算机', year: 2011 },
                { name: '数据结构', type: '计算机', year: 2013 }
            ],
            '文学': [
                { name: '简爱', type: '文学', year: 2011 }
            ],
            '物理': [
                { name: '大学物理', type: '物理', year: 2012 }
            ],
            '数学': [
                { name: '高等数学', type: '数学', year: 2011 },
                { name: '微积分', type: '数学', year: 2013 }
            ]
        };

             byYears = {
            2011: [
                { name: 'JavaScript', type: '计算机', year: '出版年份：2011' },
                { name: '简爱', type: '文学', year: '出版年份：2011' },
                { name: '高等数学', type: '数学', year: '出版年份：2011' }
            ],
            2012: [
                { name: 'C++', type: '计算机', year: '出版年份：2012' },
                { name: '人生', type: '文学', year: '出版年份：2012' },
                { name: '大学物理', type: '物理', year: '出版年份：2012' }
            ],
            2013: [
                { name: '数据结构', type: '计算机', year: '出版年份：2013' },
                { name: '微积分', type: '数学', year: '出版年份：2013' }
            ]
        };
             */
            aggregate: function (array, getKey, getValue) {
                var isKey = typeof getKey == 'string';
                var changed = typeof getValue == 'function';

                var obj = {};

                for (var i = 0, len = array.length; i < len; i++) {
                    var item = array[i];
                    var key = isKey ? item[getKey] : getKey(item, i);

                    if (!obj[key]) {
                        obj[key] = [];
                    }

                    var value = item;

                    if (changed) { //指定了要变换值
                        value = getValue(item, i);

                        if (value === null) {
                            continue;
                        }

                        if (value === undefined) {
                            break;
                        }
                    }

                    obj[key].push(value);
                }

                return obj;


            },

            /**
             * 从一个数组拷贝一份并添加一个项目，返回一个新的数组。
             * @param {Array} array 要进行拷贝的数组。
             * @param item 要进行添加的元素。
             * @return {Array} 返回一个包含新添加的元素的新数组。
             * @example
             var a = ['a', 'b'];
             var b = $.Array.add(a, 'c');
             console.dir(a); //结果没变，仍为 ['a', 'b']
             console.dir(b); //结果为 ['a', 'b', 'c'];

             */
            add: function (array, item) {
                var a = array.slice(0);
                a.push(item);
                return a;
            },

            /**
             * 统计一个数组中特定的项的个数。
             */
            count: function (array, fn) {

                if (arguments.length < 2) {
                    return array.length;
                }

                if (typeof fn != 'function') {
                    var value = fn;

                    fn = function (item, index) {
                        return item === value;
                    };
                }

                var a = This.grep(array, fn);
                return a.length;

            }



        });


    })(MiniQuery, MiniQuery.Array);



//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

    ; (function (This) {


        This.prototype = { /**@inner*/

        constructor: This,
            value: [],


            init: function (array) {
                this.value = This.parse(array);
            },


            toString: function (separator) {
                separator = separator === undefined ? '' : separator;
                return this.value.join(separator);
            },

            valueOf: function () {
                return this.value;
            },


            each: function (fn, isReversed) {
                var args = Array.prototype.slice.call(arguments, 0);
                args = [this.value].concat(args);
                This.each.apply(null, args);
                return this;
            },


            toObject: function (maps) {
                var args = Array.prototype.slice.call(arguments, 0);
                args = [this.value].concat(args);
                return This.toObject.apply(null, args);
            },


            map: function (fn) {
                var args = Array.prototype.slice.call(arguments, 0);
                args = [this.value].concat(args);
                This.map.apply(null, args);
                return this;
            },

            keep: function (fn) {

                var args = Array.prototype.slice.call(arguments, 0);
                args = [this.value].concat(args);
                this.value = This.keep.apply(null, args);

                return this;
            },


            grep: function (fn) {
                this.value = This.grep(this.value, fn);
                return this;
            },


            indexOf: function (item) {
                return This.indexOf(this.value, item);
            },


            contains: function (item) {
                return This.contains(this.value, item);
            },


            remove: function (target) {
                this.value = This.remove(this.value, target);
                return this;
            },


            removeAt: function (index) {
                this.value = This.removeAt(this.value, index);
                return this;
            },


            reverse: function () {
                this.value = This.reverse(this.value);
                return this;
            },


            merge: function () {
                //其实是想执行 MiniQuery.Array.merge(this.value, arguments[0], arguments[1], …);
                var args = [this.value];
                args = args.concat(Array.prototype.slice.call(arguments, 0));
                this.value = This.merge.apply(null, args);
                return this;
            },


            mergeUnique: function () {
                //其实是想执行 MiniQuery.Array.mergeUnique(this.value, arguments[0], arguments[1], …);
                var args = [this.value];
                args = args.concat(Array.prototype.slice.call(arguments, 0));
                this.value = This.mergeUnique.apply(null, args);
                return this;
            },


            unique: function () {
                this.value = This.unique(this.value);
                return this;
            },


            toggle: function (item) {
                this.value = This.toggle(this.value, item);
                return this;
            },


            find: function (fn, startIndex) {
                return This.find(this.value, fn, startIndex);
            },


            findIndex: function (fn, startIndex) {
                return This.findIndex(this.value, fn, startIndex);
            },


            findItem: function (fn, startIndex) {
                return This.findItem(this.value, fn, startIndex);
            },


            random: function () {
                this.value = This.random(this.value);
                return this;
            },


            randomItem: function () {
                return This.randomItem(this.value);
            },


            get: function (index) {
                return This.get(this.value, index);
            },


            trim: function () {
                this.value = This.trim(this.value);
                return this;
            },


            group: function (size, isPadRight) {
                this.value = This.group(this.value, size, isPadRight);
                return this;
            },


            slide: function (windowSize, stepSize) {
                this.value = This.slide(this.value, windowSize, stepSize);
                return this;
            },


            circleSlice: function (startIndex, size) {
                this.value = This.circleSlice(this.value, startIndex, size);
                return this;
            },


            circleSlide: function (windowSize, stepSize) {
                this.value = This.circleSlide(this.value, windowSize, stepSize);
                return this;
            },


            sum: function (ignoreNaN, key) {
                return This.sum(this.value, ignoreNaN, key);
            },


            max: function (ignoreNaN, key) {
                return This.max(this.value, ignoreNaN, key);
            },


            hasItem: function () {
                return This.hasItem(this.value);
            },


            reduceDimension: function (count) {
                this.value = This.reduceDimension(this.value, count);
                return this;
            },

            //注意：
            //  $.Array(A).descartes(B, C) 并不等于
            //  $.Array(A).descartes(B).descartes(C) 中的结果

            descartes: function () {
                var args = This.parse(arguments); //转成数组
                args = [this.value].concat(args);

                this.value = This.descartes.apply(null, args);
                return this;
            },


            divideDescartes: function (sizes) {
                this.value = This.divideDescartes(this.value, sizes);
                return this;
            },


            transpose: function () {
                this.value = This.transpose(this.value);
                return this;
            },

            //注意：
            // $.Array(a).intersection(b, c) 等于
            // $.Array(a).intersection(b).intersection(c)

            intersection: function () {
                var args = This.parse(arguments); //转成数组
                args = [this.value].concat(args);

                this.value = This.intersection.apply(null, args);
                return this;
            },


            equals: function (array, fn) {
                return This.equals(this.value, array, fn);
            },


            isContained: function (B) {
                return This.isContained(this.value, B);
            },


            padLeft: function (totalLength, paddingItem) {
                this.value = This.padLeft(this.value, totalLength, paddingItem);
                return this;
            },


            padRight: function (totalLength, paddingItem) {
                this.value = This.padRight(this.value, totalLength, paddingItem);
                return this;
            },


            pad: function (start, end, step) {
                this.value = This.pad(start, end, step);
                return this;
            }
        };

        This.prototype.init.prototype = This.prototype;

    })(MiniQuery.Array);


    /**
     * 字符串工具类
     * @class
     */
    MiniQuery.String = function (string) {
        if (arguments.length > 1) // 此时当作 $.String('{0}{1}..', arg1, arg2); 这样的调用
        {
            var args = Array.prototype.slice.call(arguments, 1);
            return MiniQuery.String.format(string, args);
        }

        return new MiniQuery.String.prototype.init(string);
    };


    ; (function ($, This) {



        $.extend(This, { /**@lends MiniQuery.String */

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
            format: function (string, obj, arg2) {

                var s = string;

                if (typeof obj == 'object') {
                    for (var key in obj) {
                        s = This.replaceAll(s, '{' + key + '}', obj[key]);
                    }

                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    for (var i = 0, len = args.length; i < len; i++) {
                        s = This.replaceAll(s, '{' + i + '}', args[i]);
                    }
                }

                return s;

            },



            /**
             * 对字符串进行全局替换。
             * @param {String} target 要进行替换的目标字符串。
             * @param {String} src 要进行替换的子串，旧值。
             * @param {String} dest 要进行替换的新子串，新值。
             * @return {String} 返回一个替换后的字符串。
             * @example
             $.String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
             */
            replaceAll: function (target, src, dest) {
                return target.split(src).join(dest);
            },


            /**
             * 对字符串进行区间内的替换。
             * 该方法会把整个区间替换成新的字符串，包括区间标记。
             * @param {String} string 要进行替换的目标字符串。
             * @param {String} startTag 区间的开始标记。
             * @param {String} endTag 区间的结束标记
             * @param {String} newString 要进行替换的新子串，新值。
             * @return {String} 返回一个替换后的字符串。<br />
             *   当不存在开始标记或结束标记时，都会不进行任何处理而直接返回原字符串。
             * @example
             $.String.replaceBetween('hello #--world--# this is #--good--#', '#--', '--#', 'javascript')
             //结果为 'hello javascript this is javascript'
             */
            replaceBetween: function (string, startTag, endTag, newString) {
                var startIndex = string.indexOf(startTag);
                if (startIndex < 0) {
                    return string;
                }

                var endIndex = string.indexOf(endTag);
                if (endIndex < 0) {
                    return string;
                }

                var prefix = string.slice(0, startIndex);
                var suffix = string.slice(endIndex + endTag.length);

                return prefix + newString + suffix;
            },


            /**
             * 移除指定的字符子串。
             * @param {String} target 要进行替换的目标字符串。
             * @param {String|Array} src 要进行移除的子串。
             支持批量的形式，传一个数组。
             * @return {String} 返回一个替换后的字符串。
             * @example
             $.String.removeAll('hi js hi abc', 'hi')
             //结果为 ' js  abc'
             */
            removeAll: function (target, src) {

                var replaceAll = This.replaceAll;

                if ($.Object.isArray(src)) {
                    $.Array.each(src, function (item, index) {
                        target = replaceAll(target, item, '');
                    });
                    return target;
                }

                return replaceAll(target, src, '');
            },

            /**
             * 从当前 String 对象移除所有前导空白字符和尾部空白字符。
             * @param {String} 要进行操作的字符串。
             * @return {String} 返回一个新的字符串。
             * @expample
             $.String.trim('  abc def mm  '); //结果为 'abc def mm'
             */
            trim: function (string) {
                return string.replace(/(^\s*)|(\s*$)/g, '');
            },

            /**
             * 从当前 String 对象移除所有前导空白字符。
             * @param {String} 要进行操作的字符串。
             * @return {String} 返回一个新的字符串。
             * @expample
             $.String.trimStart('  abc def mm '); //结果为 'abc def mm  '
             */
            trimStart: function (string) {
                return string.replace(/(^\s*)/g, '');
            },

            /**
             * 从当前 String 对象移除所有尾部空白字符。
             * @param {String} 要进行操作的字符串。
             * @return {String} 返回一个新的字符串。
             * @expample
             $.String.trimEnd('  abc def mm '); //结果为 '  abc def mm'
             */
            trimEnd: function (string) {
                return string.replace(/(\s*$)/g, '');
            },

            /**
             * 右对齐此实例中的字符，在左边用指定的 Unicode 字符填充以达到指定的总长度。
             * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
             * @param {String} string 要进行填充对齐的字符串。
             * @param {Number} totalWidth 填充后要达到的总长度。
             * @param {String} paddingChar 用来填充的模板字符串。
             * @return {String} 返回一个经过填充对齐后的新字符串。
             * @example
             $.String.padLeft('1234', 6, '0'); //结果为 '001234'，右对齐，从左边填充 '0'
             $.String.padLeft('1234', 2, '0'); //结果为 '34'，右对齐，从左边开始截断
             */
            padLeft: function (string, totalWidth, paddingChar) {
                string = String(string); //转成字符串

                var len = string.length;
                if (totalWidth <= len) //需要的长度短于实际长度，做截断处理
                {
                    return string.substr(-totalWidth); //从后面算起
                }

                paddingChar = paddingChar || ' ';

                var arr = [];
                arr.length = totalWidth - len + 1;


                return arr.join(paddingChar) + string;
            },


            /**
             * 左对齐此字符串中的字符，在右边用指定的 Unicode 字符填充以达到指定的总长度。
             * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
             * @param {String} string 要进行填充对齐的字符串。
             * @param {Number} totalWidth 填充后要达到的总长度。
             * @param {String} paddingChar 用来填充的模板字符串。
             * @return {String} 返回一个经过填充对齐后的新字符串。
             * @example
             $.String.padLeft('1234', 6, '0'); //结果为 '123400'，左对齐，从右边填充 '0'
             $.String.padLeft('1234', 2, '0'); //结果为 '12'，左对齐，从右边开始截断
             */
            padRight: function (string, totalWidth, paddingChar) {
                string = String(string); //转成字符串

                var len = string.length;
                if (len >= totalWidth) {
                    return string.substring(0, totalWidth);
                }

                paddingChar = paddingChar || ' ';

                var arr = [];
                arr.length = totalWidth - len + 1;


                return string + arr.join(paddingChar);
            },

            /**
             * 获取位于两个标记子串之间的子字符串。
             * @param {String} string 要进行获取的大串。
             * @param {String} tag0 区间的开始标记。
             * @param {String} tag1 区间的结束标记。
             * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
             * @example
             $.String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello'
             */
            between: function (string, tag0, tag1) {
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
            },

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
            random: function (formater) {
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

        });//--------------------------------------------------------------------------------------





//---------------判断部分 -----------------------------------------------------
        $.extend(This, { /**@lends MiniQuery.String */

            /**
             * 确定一个字符串的开头是否与指定的字符串匹配。
             * @param {String} str 要进行判断的大字符串。
             * @param {String} dest 要进行判断的子字符串，即要检测的开头子串。
             * @param {boolean} [ignoreCase=false] 指示是否忽略大小写。默认不忽略。
             * @return {boolean} 返回一个bool值，如果大串中是以小串开头，则返回 true；否则返回 false。
             * @example
             $.String.startsWith('abcdef', 'abc') //结果为 true。
             $.String.startsWith('abcdef', 'Abc', true) //结果为 true。
             */
            startsWith: function (str, dest, ignoreCase) {
                if (ignoreCase) {
                    var src = str.substring(0, dest.length);
                    return src.toUpperCase() === dest.toString().toUpperCase();
                }

                return str.indexOf(dest) == 0;
            },


            /**
             * 确定一个字符串的末尾是否与指定的字符串匹配。
             * @param {String} str 要进行判断的大字符串。
             * @param {String} dest 要进行判断的子字符串，即要检测的末尾子串。
             * @param {boolean} [ignoreCase=false] 指示是否忽略大小写。默认不忽略。
             * @return {boolean} 返回一个bool值，如果大串中是以小串结尾，则返回 true；否则返回 false。
             * @example
             $.String.endsWith('abcdef', 'def') //结果为 true。
             $.String.endsWith('abcdef', 'DEF', true) //结果为 true。
             */
            endsWith: function (str, dest, ignoreCase) {
                var len0 = str.length;
                var len1 = dest.length;
                var delta = len0 - len1;

                if (ignoreCase) {
                    var src = str.substring(delta, len0);
                    return src.toUpperCase() === dest.toString().toUpperCase();
                }

                return str.lastIndexOf(dest) == delta;
            },

            /**
             * 确定一个字符串是否包含指定的子字符串。
             * @param {String} src 要进行检测的大串。
             * @param {String} target 要进行检测模式子串。
             * @return {boolean} 返回一个 bool 值。如果大串中包含模式子串，则返回 true；否则返回 false。
             * @example
             $.String.contains('javascript is ok', 'scr');   //true
             $.String.contains('javascript is ok', 'iis');      //false
             */
            contains: function (src, target, useOr) {

                src = String(src);

                if ($.Object.isArray(target)) {

                    var existed;

                    if (useOr === true) { // or 关系，只要有一个存在，则结果为 true
                        existed = false;
                        $.Array.each(target, function (item, index) {
                            existed = src.indexOf(item) > -1;
                            if (existed) {
                                return false; //break;
                            }
                        });
                    }
                    else { // and 关系，只要有一个不存在，则结果为 false
                        existed = true;
                        $.Array.each(target, function (item, index) {
                            existed = src.indexOf(item) > -1;
                            if (!existed) {
                                return false; //break;
                            }
                        });
                    }

                    return existed;
                }

                return src.indexOf(target) > -1;
            }


        });//--------------------------------------------------------------------------------------




//---------------转换部分 -----------------------------------------------------
        $.extend(This, { /**@lends MiniQuery.String */


            /**
             * 转成骆驼命名法。
             *
             */
            /**
             * 把一个字符串转成骆驼命名法。。
             * 如 'font-size' 转成 'fontSize'。
             * @param {String} string 要进行转换的字符串。
             * @return 返回一个骆驼命名法的新字符串。
             * @example
             $.String.toCamelCase('background-item-color') //结果为 'backgroundItemColor'
             */
            toCamelCase: function (string) {
                var rmsPrefix = /^-ms-/;
                var rdashAlpha = /-([a-z]|[0-9])/ig;

                return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, function (all, letter) {
                    return letter.toString().toUpperCase();
                });

                /* 下面的是 mootool 的实现
                 return string.replace(/-\D/g, function(match) {
                 return match.charAt(1).toUpperCase();
                 });
                 */
            },

            /**
             * 把一个字符串转成短线连接法。
             * 如 fontSize 转成 font-size
             * @param {String} string 要进行转换的字符串。
             * @return 返回一个用短线连接起来的新字符串。
             * @example
             $.String.toHyphenate('backgroundItemColor') //结果为 'background-item-color'
             */
            toHyphenate: function (string) {
                return string.replace(/[A-Z]/g, function (match) {
                    return ('-' + match.charAt(0).toLowerCase());
                });
            },

            /**
             * 把一个字符串转成 UTF8 编码。
             * @param {String} string 要进行编码的字符串。
             * @return {String} 返回一个 UTF8 编码的新字符串。
             * @example
             $.String.toUtf8('你好'); //结果为 ''
             */
            toUtf8: function (string) {
                var encodes = [];

                $.Array.each(string.split(''), function (ch, index) {
                    var code = ch.charCodeAt(0);
                    if (code < 0x80) {
                        encodes.push(code);
                    }
                    else if (code < 0x800) {
                        encodes.push(((code & 0x7C0) >> 6) | 0xC0);
                        encodes.push((code & 0x3F) | 0x80);
                    }
                    else {
                        encodes.push(((code & 0xF000) >> 12) | 0xE0);
                        encodes.push(((code & 0x0FC0) >> 6) | 0x80);
                        encodes.push(((code & 0x3F)) | 0x80);
                    }
                });

                return '%' + $.Array.map(encodes, function (item, index) {
                    return item.toString(16);
                }).join('%');
            },


            /**
             * 把一个字符串转成等价的值。
             * 主要是把字符串形式的 0|1|true|false|null|undefined|NaN 转成原来的数据值。
             * 当参数不是字符串或不是上述值之一时，则直接返回该参数，不作转换。
             * @param {Object} value 要进行转换的值，可以是任何类型。
             * @return {Object} 返回一个等价的值。
             * @example
             $.String.toValue('NaN') //NaN
             $.String.toValue('null') //null
             $.String.toValue('true') //true
             $.String.toValue({}) //不作转换，直接原样返回
             */
            toValue: function (value) {
                if (typeof value != 'string') { //拦截非字符串类型的参数
                    return value;
                }


                var maps = {
                    //'0': 0,
                    //'1': 1,
                    'true': true,
                    'false': false,
                    'null': null,
                    'undefined': undefined,
                    'NaN': NaN
                };

                return value in maps ? maps[value] : value;

            }


        });//--------------------------------------------------------------------------------------





//---------------分裂和提取部分 -----------------------------------------------------
        $.extend(This, { /**@lends MiniQuery.String */


            /**
             * 对一个字符串进行多层次分裂，返回一个多维数组。
             * @param {String} string 要进行分裂的字符串。
             * @param {Array} separators 分隔符列表数组。
             * @return {Array} 返回一个多维数组，该数组的维数，跟指定的分隔符 separators 的长度一致。
             * @example
             var string = 'a=1&b=2|a=100&b=200;a=111&b=222|a=10000&b=20000';
             var separators = [';', '|', '&', '='];
             var a = $.String.split(string, separators);
             //结果 a 为
             a =
             [                           // ';' 分裂的结果
             [                       // '|'分裂的结果
             [                   // '&'分裂的结果
             ['a', '1'],     // '='分裂的结果
             ['b', '2']
             ],
             [
             ['a', '100'],
             ['b', '200']
             ]
             ],
             [
             [
             ['a', '111'],
             ['b', '222']
             ],
             [
             ['a', '10000'],
             ['b', '20000']
             ]
             ]
             ];
             *
             */
            split: function (string, separators) {
                var list = String(string).split(separators[0]);

                for (var i = 1, len = separators.length; i < len; i++) {
                    list = fn(list, separators[i], i);
                }

                return list;


                //一个内部方法
                function fn(list, separator, dimension) {
                    dimension--;

                    return $.Array.map(list, function (item, index) {
                        return dimension == 0 ?

                            String(item).split(separator) :

                            fn(item, separator, dimension); //递归
                    });
                }


            },


            /**
             * 用滑动窗口的方式创建分组，返回一个子串的数组。
             * @param {string|number} string 要进行分组的字符串。会调用 String(string) 转成字符串。
             * @param {number} windowSize 滑动窗口的大小。
             * @param {number} [stepSize=1] 滑动步长。默认为1。
             * @return {Array} 返回一个经过滑动窗口方式得到的子串数组。
             * @example
             *   $.String.slide('012345678', 4, 3); //滑动窗口大小为4，滑动步长为3
             //得到 [ '0123', '3456', '678' ] //最后一组不足一组
             */
            slide: function (string, windowSize, stepSize) {
                var chars = String(string).split(''); //按字符切成单个字符的数组

                return $.Array(chars).slide(windowSize, stepSize).map(function (group, index) {
                    return group.join('');
                }).valueOf();

            },

            /**
             * 对一个字符串进行分段，返回一个分段后的子串数组。
             * @param {string|number} string 要进行分段的字符串。会调用 String(string) 转成字符串。
             * @param {number} size 分段的大小。
             * @return {Array} 返回一个分段后的子串数组。
             * @example
             *   $.String.segment('0123456789', 3); //进行分段，每段大小为3
             //得到 [ '012', '345', '678', '9' ] //最后一组不足一组
             */
            segment: function (string, size) {
                return This.slide(string, size, size);
            }


        });//--------------------------------------------------------------------------------------



        $.extend(This, { /**@lends MiniQuery.String */

            /**
             * 对一个字符串进行多层级模板解析，返回一个带有多个子名称的模板。
             * @param {string} text 要进行解析的模板字符串。
             * @param {Array} tags 多层级模板中使用的标记。
             * @return {Object} 返回一个带有多个子名称的模板。
             */
            getTemplates: function (text, tags) {

                var item0 = tags[0];

                if (item0 instanceof Array) { //传进来的是数组的数组，转成 json 数组
                    tags = $.Array.keep(tags, function (item, index) {
                        var obj = {
                            name: item[0],
                            begin: item[1],
                            end: item[2]
                        };

                        if (item.length > 3) {
                            obj.outer = item[3];
                        }

                        return obj;
                    });

                    item0 = tags[0]; //回写，因为后面要用到
                }



                //缓存一下，以提高 for 中的性能
                var between = This.between;
                var replaceBetween = This.replaceBetween;


                var samples = {};

                //先处理最外层，把大字符串提取出来。 因为内层的可能在总字符串 text 中同名
                var s = between(text, item0.begin, item0.end);

                //倒序处理子模板。 注意: 最外层的不在里面处理
                $.Array.each(tags.slice(1), function (item, index) {

                    var name = item.name || index;
                    var begin = item.begin;
                    var end = item.end;

                    samples[name] = between(s, begin, end);

                    if ('outer' in item) { //指定了 outer
                        s = replaceBetween(s, begin, end, item.outer);
                    }

                }, true);

                samples[item0.name] = s; //所有的子模板处理完后，就是最外层的结果


                return samples;

            },

            /**
             * 获取一个字符串的字节长度。
             * 普通字符的字节长度为 1；中文等字符的字节长度为 2。
             * @param {string} s 要进行解析的字符串。
             * @return {Number} 返回参数字符串的字节长度。
             */
            getByteLength: function (s) {
                if (!s) {
                    return 0;
                }

                return s.toString().replace(/[\u0100-\uffff]/g, '  ').length;
            }
        });



//---------------过滤部分 -----------------------------------------------------
        $.extend(This, {/**@lends MiniQuery.String */

            /**
             * 用做过滤直接放到HTML里的
             * @return {String}
             */
            escapeHtml: function (string) {
                string = String(string);

                var reg = /[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g;
                string = string.replace(reg, function (r) {
                    return "&#" + r.charCodeAt(0) + ";"

                });

                string = string.replace(/ /g, "&nbsp;");
                string = string.replace(/\r\n/g, "<br />");
                string = string.replace(/\n/g, "<br />");
                string = string.replace(/\r/g, "<br />");

                return string;

            },

            /**
             * 用做过滤HTML标签里面的东东 比如这个例子里的<input value="XXX"> XXX就是要过滤的
             * @return {String}
             */
            escapeElementAttribute: function (string) {
                string = String(string);
                var reg = /[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g;

                return string.replace(reg, function (r) {
                    return "&#" + r.charCodeAt(0) + ";"
                });

            },

            /**
             * 用做过滤直接放到HTML里js中的
             * @return {String}
             */
            escapeScript: function (string) {
                string = String(string);
                var reg = /[\\"']/g;

                string = string.replace(reg, function (r) {
                    return "\\" + r;
                })

                string = string.replace(/%/g, "\\x25");
                string = string.replace(/\n/g, "\\n");
                string = string.replace(/\r/g, "\\r");
                string = string.replace(/\x01/g, "\\x01");

                return string;
            },

            /**
             * 用做过滤直接 Url 参数里的 比如 http://www.baidu.com/?a=XXX XXX就是要过滤的
             * @return {String}
             */
            escapeQueryString: function (string) {
                string = String(string);
                return escape(string).replace(/\+/g, "%2B");
            },

            /**
             * 用做过滤直接放到<a href="javascript:alert('XXX')">中的XXX
             * @return {String}
             */
            escapeHrefScript: function (string) {
                string = This.escapeScript(string);
                string = string.replace(/%/g, "%25"); //escMiniUrl
                string = This.escapeElementAttribute(string);
                return string;

            },

            /**
             * 用做过滤直接放到正则表达式中的
             * @return {String}
             */
            escapeRegExp: function (string) {
                string = String(string);

                var reg = /[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g;

                return string.replace(reg, function (a, b) {
                    return "\\" + a;
                });
            }




        });//--------------------------------------------------------------------------------------



    })(MiniQuery, MiniQuery.String);

//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

    ; (function (This) {


        var slice = Array.prototype.slice;

        This.prototype = { /**@inner*/

        constructor: This,
            value: '',

            init: function (string) {
                this.value = String(string);
            },


            toString: function () {
                return this.value;
            },

            valueOf: function () {
                return this.value;
            },


            format: function (arg1, arg2) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.format.apply(null, args);
                return this;
            },

            replaceAll: function (src, dest) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.replaceAll.apply(null, args);
                return this;
            },


            replaceBetween: function (startTag, endTag, newString) {

                var args = slice.call(arguments, 0);
                args = [this.value].concat(args);

                this.value = This.replaceBetween.apply(null, args);
                return this;
            },


            removeAll: function (src) {

                this.value = This.replaceAll(this.value, src, '');
                return this;
            },

            random: function (size) {
                this.value = This.random(size);
                return this;
            },


            trim: function () {
                this.value = This.trim(this.value);
                return this;
            },


            trimStart: function () {
                this.value = This.trimStart(this.value);
                return this;
            },


            trimEnd: function () {
                this.value = This.trimEnd(this.value);
                return this;
            },


            split: function (separators) {
                return This.split(this.value, separators);
            },


            startsWith: function (dest, ignoreCase) {
                return This.startsWith(this.value, dest, ignoreCase);
            },


            endsWith: function (dest, ignoreCase) {
                return This.endsWith(this.value, dest, ignoreCase);
            },


            contains: function (target, useOr) {
                return This.contains(this.value, target, useOr);
            },


            padLeft: function (totalWidth, paddingChar) {
                this.value = This.padLeft(this.value, totalWidth, paddingChar);
                return this;
            },


            padRight: function (totalWidth, paddingChar) {
                this.value = This.padRight(this.value, totalWidth, paddingChar);
                return this;
            },


            toCamelCase: function () {
                this.value = This.toCamelCase(this.value);
                return this;
            },


            toHyphenate: function () {
                this.value = This.toHyphenate(this.value);
                return this;
            },


            between: function (tag0, tag1) {
                this.value = This.between(this.value, tag0, tag1);
                return this;
            },


            toUtf8: function () {
                this.value = This.toUtf8(this.value);
                return this;
            },


            toValue: function (value) {
                return This.toValue(this.value);
            },

            slide: function (windowSize, stepSize) {
                return This.slide(this.value, windowSize, stepSize);
            },

            segment: function (size) {
                return This.segment(this.value, size, size);
            }
        };

        This.prototype.init.prototype = This.prototype;

    })(MiniQuery.String);

    /**
     * Boolean 工具类
     * @class
     * @param {Object} b 要进行进换的值，可以是任何类型。
     * @return {MiniQuery.Boolean} 返回一个 MiniQuery.Boolean 的实例。
     */
    MiniQuery.Boolean = function (b) {
        return new MiniQuery.Boolean.prototype.init(b);
    };



    ; (function ($, This) {



        $.extend(This, { /**@lends MiniQuery.Boolean */

            /**
             * 解析指定的参数为 bool 值。
             * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 false；
             * 其它的转成 true
             * @param {Object} arg 要进行进换的值，可以是任何类型。
             * @return {boolean} 返回一个 bool 值。
             * @example
             $.Boolean.parse(null); //false;
             $.Boolean.parse('null'); //false;
             $.Boolean.parse(undefined); //false;
             $.Boolean.parse('undefined'); //false;
             $.Boolean.parse(0); //false;
             $.Boolean.parse('0'); //false;
             $.Boolean.parse(NaN); //false;
             $.Boolean.parse('NaN'); //false;
             $.Boolean.parse(false); //false;
             $.Boolean.parse('false'); //false;
             $.Boolean.parse(''); //false;
             $.Boolean.parse(true); //true;
             $.Boolean.parse({}); //true;
             */
            parse: function (arg) {
                if (!arg) // null、undefined、0、NaN、false、''
                {
                    return false;
                }

                if (typeof arg == 'string' || arg instanceof String) {
                    var reg = /^(false|null|undefined|0|NaN)$/g;

                    return !reg.test(arg);
                }


                return true;
            },

            /**
             * 解析指定的参数为 int 值：0 或 1。
             * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 0；
             * 其它的转成 1
             * @param {Object} 要进行转换的值，可以是任何类型。
             * @return {int} 返回一个整型值 0 或 1。
             * @example
             $.Boolean.toInt(null); //0;
             $.Boolean.toInt('null'); //0;
             $.Boolean.toInt(undefined); //0;
             $.Boolean.toInt('undefined'); //0;
             $.Boolean.toInt(0); //0;
             $.Boolean.toInt('0'); //0;
             $.Boolean.toInt(NaN); //0;
             $.Boolean.toInt('NaN'); //0;
             $.Boolean.toInt(false); //0;
             $.Boolean.toInt('false'); //0;
             $.Boolean.toInt(''); //0;
             $.Boolean.toInt(true); //1;
             $.Boolean.toInt({}); //1;
             */
            toInt: function (arg) {
                return This.parse(arg) ? 1 : 0;
            },

            /**
             * 反转一个 boolean 值，即 true 变成 false；false 变成 true。
             * @param {Object} 要进行反转的值，可以是任何类型。
             * @return {int} 返回一个 bool 值。
             * @example
             $.Boolean.reverse(null); //true;
             $.Boolean.reverse('null'); //true;
             $.Boolean.reverse(undefined); //true;
             $.Boolean.reverse('undefined'); //true;
             $.Boolean.reverse(0); //true;
             $.Boolean.reverse('0'); //true;
             $.Boolean.reverse(NaN); //true;
             $.Boolean.reverse('NaN'); //true;
             $.Boolean.reverse(false); //true;
             $.Boolean.reverse('false'); //true;
             $.Boolean.reverse(''); //true;
             $.Boolean.reverse(true); //false;
             $.Boolean.reverse({}); //false;
             */
            reverse: function (arg) {
                return !This.parse(arg);
            },

            /**
             * 产生一个随机布尔值。
             * @return {boolean} 返回一个随机的 true 或 false。
             * @example
             $.Boolean.random();
             */
            random: function () {
                return !!Math.floor(Math.random() * 2); //产生随机数 0 或 1
            }
        });

    })(MiniQuery, MiniQuery.Boolean);



//----------------------------------------------------------------------------------------------------------------
//MiniQuery.Boolean 包装类的实例方法

    ; (function (This) {


        This.prototype = { /**@inner*/

        constructor: This,
            value: false,


            init: function (b) {
                this.value = This.parse(b);
            },


            valueOf: function () {
                return this.value;
            },


            toString: function () {
                return this.value.toString();
            },


            toInt: function () {
                return this.value ? 1 : 0;
            },


            reverse: function () {
                this.value = !this.value;
                return this;
            },

            random: function () {
                this.value = This.random();
                return;
            }
        };


        This.prototype.init.prototype = This.prototype;

    })(MiniQuery.Boolean);

    /**
     * 日期时间工具
     * @class
     */
    MiniQuery.Date = function (date) {
        return new MiniQuery.Date.prototype.init(date);
    };

    ; (function ($, This) { /**@lends MiniQuery.Date */




    $.extend(This, { /**@lends MiniQuery.Date */
        /**
         * 获取当前系统时间。
         * @return 返回当前系统时间实例。
         * @example
         $.Date.now();
         */
        now: function () {
            return new Date();
        },

        /**
         * 把参数 value 解析成等价的日期时间实例。
         * 当无法解析时，返回 null。
         * @param {Date|string} value 要进行解析的参数，可接受的类型为：
         *   1.Date 实例<br />
         *   2.string 字符串，包括调用 Date 实例的 toString 方法得到的字符串，也包括以下格式:
         <pre>
         yyyy-MM-dd
         yyyy.MM.dd
         yyyy/MM/dd
         yyyy_MM_dd

         HH:mm:ss

         yyyy-MM-dd HH:mm:ss
         yyyy.MM.dd HH:mm:ss
         yyyy/MM/dd HH:mm:ss
         yyyy_MM_dd HH:mm:ss
         </pre>
         * @return 返回一个日期时间的实例。
         * @example
         $.Date.parse('2013-04-29 09:31:20');
         */
        parse: function (value) {
            if (value instanceof Date) {
                if (isNaN(value.getTime())) {
                    //throw new Error('参数是非法的日期实例');
                    return null;
                }

                return value;
            }

            if (typeof value != 'string') {
                //throw new Error('不支持该类型的参数：' + typeof value);
                return null;
            }


            //标准方式
            var date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }

            /*
             自定义方式：
             yyyy-MM-dd
             yyyy.MM.dd
             yyyy/MM/dd
             yyyy_MM_dd

             HH:mm:ss

             yyyy-MM-dd HH:mm:ss
             yyyy.MM.dd HH:mm:ss
             yyyy/MM/dd HH:mm:ss
             yyyy_MM_dd HH:mm:ss

             */

            function GetDate(s) {
                var now = new Date();

                var separator =
                        s.indexOf('.') > 0 ? '.' :
                        s.indexOf('-') > 0 ? '-' :
                        s.indexOf('/') > 0 ? '/' :
                        s.indexOf('_') > 0 ? '_' : null;

                if (!separator) {
                    //throw new Error('无法识别的日期格式：' + s);
                    return null;

                }

                var ps = s.split(separator);

                return {
                    yyyy: ps[0],
                    MM: ps[1] || 0,
                    dd: ps[2] || 1
                };
            }

            function GetTime(s) {
                var separator = s.indexOf(':') > 0 ? ':' : null;
                if (!separator) {
                    //throw new Error('无法识别的时间格式：' + s);
                    return null;

                }

                var ps = s.split(separator);

                return {
                    HH: ps[0] || 0,
                    mm: ps[1] || 0,
                    ss: ps[2] || 0
                };
            }


            var parts = value.split(' ');
            if (!parts[0]) {
                //throw new Error('无法识别的格式：' + value);
                return null;

            }

            var date = parts[0].indexOf(':') > 0 ? null : parts[0];
            var time = parts[0].indexOf(':') > 0 ? parts[0] : (parts[1] || null);

            if (date || time) {
                if (date && time) {
                    var d = GetDate(date);
                    var t = GetTime(time);
                    return new Date(d.yyyy, d.MM - 1, d.dd, t.HH, t.mm, t.ss);
                }

                if (date) {
                    var d = GetDate(date);
                    return new Date(d.yyyy, d.MM - 1, d.dd);
                }

                if (time) {
                    var now = new Date();
                    var t = GetTime(time);
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.HH, t.mm, t.ss);
                }
            }

            //throw new Error('无法识别的格式：' + value);
            return null;




        },

        /**
         * 把日期时间格式化指定格式的字符串。
         * @param {Date} datetime 要进行格式化的日期时间。
         * @param {string} formater 格式化的字符串。<br />
         其中保留的占位符有：
         <pre>
         'yyyy': 4位数年份
         'yy': 2位数年份
         'MM': 2位数的月份(01-12)
         'M': 1位数的月份(1-12)
         'dddd': '星期日|一|二|三|四|五|六'
         'dd': 2位数的日份(01-31)
         'd': 1位数的日份(1-31)
         'HH': 24小时制的2位数小时数(00-23)
         'H': 24小时制的1位数小时数(0-23)
         'hh': 12小时制的2位数小时数(00-12)
         'h': 12小时制的1位数小时数(0-12)
         'mm': 2位数的分钟数(00-59)
         'm': 1位数的分钟数(0-59)
         'ss': 2位数的秒钟数(00-59)
         's': 1位数的秒数(0-59)
         'tt': 上午：'AM'；下午: 'PM'
         't': 上午：'A'；下午: 'P'
         'TT': 上午： '上午'； 下午: '下午'
         'T': 上午： '上'； 下午: '下'
         </pre>
         * @return {string} 返回一个格式化的字符串。
         * @example
         //返回当前时间的格式字符串，类似 '2013年4月29日 9:21:59 星期一'
         $.Date.format(new Date(), 'yyyy年M月d日 h:m:s dddd')
         */
        format: function (datetime, formater) {

            var year = datetime.getFullYear();
            var month = datetime.getMonth() + 1;
            var date = datetime.getDate();
            var hour = datetime.getHours();
            var minute = datetime.getMinutes();
            var second = datetime.getSeconds();

            var padLeft = function (value, length) {
                return $.String.padLeft(value, length, '0');
            };


            var isAM = hour <= 12;

            //这里不要用 {} 来映射，因为 for in 的顺序不确定
            var maps = [
                ['yyyy', padLeft(year, 4)],
                ['yy', String(year).slice(2)],
                ['MM', padLeft(month, 2)],
                ['M', month],
                ['dddd', '星期' + ('日一二三四五六'.charAt(datetime.getDay()))],
                ['dd', padLeft(date, 2)],
                ['d', date],
                ['HH', padLeft(hour, 2)],
                ['H', hour],
                ['hh', padLeft(isAM ? hour : hour - 12, 2)],
                ['h', isAM ? hour : hour - 12],
                ['mm', padLeft(minute, 2)],
                ['m', minute],
                ['ss', padLeft(second, 2)],
                ['s', second],
                ['tt', isAM ? 'AM' : 'PM'],
                ['t', isAM ? 'A' : 'P'],
                ['TT', isAM ? '上午' : '下午'],
                ['T', isAM ? '上' : '下']
            ];


            var s = formater;

            var replaceAll = $.String.replaceAll;
            for (var i = 0, len = maps.length; i < len; i++) {

                var item = maps[i];
                s = replaceAll(s, item[0], item[1]);
            }

            return s;

        },

        /**
         * 将指定的年份数加到指定的 Date 实例上。
         * @param {Date} [datetime=new Date()] 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的年份数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addYear(new Date(), 5); //假如当前时间是2013年，则返回的日期实例的年份为2018
         $.Date.addYear(-5);//假如当前时间是2013年，则返回的日期实例的年份为2008
         */
        addYears: function (datetime, value) {

            value = value * 12;
            return This.addMonths(datetime, value);
        },

        /**
         * 将指定的月份数加到指定的 Date 实例上。
         * @param {Date} [datetime=new Date()] 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的月份数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addMonths(new Date(), 15); //给当前时间加上15个月
         */
        addMonths: function (datetime, value) {
            //重载 addMonths( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setMonth(datetime.getMonth() + value);

            return dt;
        },


        /**
         * 将指定的周数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的周数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。
         此方法不更改参数 datetime 的值。 而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addWeeks(new Date(), 3); //给当前时间加上3周
         */
        addWeeks: function (datetime, value) {
            value = value * 7;
            return This.addDays(datetime, value);
        },

        /**
         * 将指定的天数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的天数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。。<br />
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addDays(new Date(), 35); //给当前时间加上35天
         */
        addDays: function (datetime, value) {
            //重载 addDays( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setDate(datetime.getDate() + value);

            return dt;
        },

        /**
         * 将指定的小时数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的小时数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。<br />
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addHours(new Date(), 35); //给当前时间加上35小时
         */
        addHours: function (datetime, value) {
            //重载 addHours( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setHours(datetime.getHours() + value);

            return dt;
        },

        /**
         * 将指定的分钟数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的分钟数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。<br />
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addMinutes(new Date(), 90); //给当前时间加上90分钟
         */
        addMinutes: function (datetime, value) {
            //重载 addMinutes( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setMinutes(datetime.getMinutes() + value);

            return dt;
        },

        /**
         * 将指定的秒数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的秒数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。<br />
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addSeconds(new Date(), 90); //给当前时间加上90秒
         */
        addSeconds: function (datetime, value) {
            //重载 addSeconds( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setSeconds(datetime.getSeconds() + value);

            return dt;
        },



        /**
         * 将指定的毫秒数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
         * @param {Number} value 要增加/减少的毫秒数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。<br />
         此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
         $.Date.addMilliseconds(new Date(), 2000); //给当前时间加上2000毫秒
         */
        addMilliseconds: function (datetime, value) {
            //重载 addMilliseconds( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setMilliseconds(datetime.getMilliseconds() + value);

            return dt;
        }

    });


    })(MiniQuery, MiniQuery.Date);



    ;(function(This){


        This.prototype = { /**@inner*/

        constructor: This,
            value: new Date(),


            init: function (date) {
                // 注意 Date(xxx)只返回一个 string，而不是一个 Date 实例。
                this.value = date === undefined ?
                    new Date() :                    //未指定参数，则使用当前日期时间
                    This.parse(date);   //把参数解析成日期时间
            },


            valueOf: function () {
                return this.value;
            },


            toString: function (formater) {
                return This.format(this.value, formater);
            },


            format: function (formater) {
                return This.format(this.value, formater);
            },


            addYears: function (value) {
                this.value = This.addYears(this.value, value);
                return this;
            },

            addMonths: function (value) {
                this.value = This.addMonths(this.value, value);
                return this;
            },

            addDays: function (value) {
                this.value = This.addDays(this.value, value);
                return this;
            },

            addHours: function (value) {
                this.value = This.addHours(this.value, value);
                return this;
            },

            addMinutes: function (value) {
                this.value = This.addMinutes(this.value, value);
                return this;
            },

            addSeconds: function (value) {
                this.value = This.addSeconds(this.value, value);
                return this;
            },

            addMilliseconds: function (value) {
                this.value = This.addMilliseconds(this.value, value);
                return this;
            }

        };

        This.prototype.init.prototype = This.prototype;

    })(MiniQuery.Date);

    /**
     * 数学工具类
     * @namespace
     */
    MiniQuery.Math = (function ($, This) {


        return $.extend(This, {  /**@lends MiniQuery.Math*/
            /**
             * 产生指定闭区间的随机整数。
             * @param {number} [minValue=0] 闭区间的左端值。
             当只指定一个参数时，minValue 默认为 0；
             * @param {number} [maxValue] 闭区间的右端值。
             * @return 返回一个整数。<br />
             当不指定任何参数时，则用 Math.random() 产生一个已移除了小数点的随机整数。
             * @example
             $.Math.randomInt(100, 200); //产生一个区间为 [100, 200] 的随机整数。
             $.Math.randomInt(100); //产生一个区间为 [0, 200] 的随机整数。
             $.Math.randomInt(); //产生一个随机整数。
             */
            randomInt: function (minValue, maxValue) {
                if (minValue === undefined && maxValue === undefined) { // 此时为  Math.randomInt()

                    //先称除小数点，再去掉所有前导的 0，最后转为 number
                    return Number(String(Math.random()).replace('.', '').replace(/^0*/g, ''));
                }
                else if (maxValue === undefined) {
                    maxValue = minValue;    //此时相当于 Math.randomInt(minValue)
                    minValue = 0;
                }

                var count = maxValue - minValue + 1;
                return Math.floor(Math.random() * count + minValue);
            },

            /**
             * 圆形求模方法。
             * 即用圆形链表的方式滑动一个数，返回一个新的数。
             * 即可正可负的双方向求模。
             * 可指定圆形链表的长度(size) 和滑动的步长(step)，滑动步长的正负号指示了滑动方向
             */
            slide: function (index, size, step) {
                step = step || 1; //步长默认为1

                index += step;
                if (index >= 0) {
                    return index % size;
                }

                return (size - (Math.abs(index) % size)) % size;
            },

            /**
             * 下一个求模数
             */
            next: function (index, size) {
                return This.slide(index, size, 1);
            },

            /**
             * 上一个求模数
             */
            previous: function (index, size, step) {
                return This.slide(index, size, -1);
            },

            /**
             * 把一个字符串解析成十进制的整型
             */
            parseInt: function (string) {
                return parseInt(string, 10);
            },

            /**
             * 把一个含有百分号的字符串解析成等值的小数。
             * @param {string} v 要解析的参数。
             期望得到 string 类型，实际可传任何类型。
             * @return {Number} 返回一个小数。
             只有参数是字符串，并且去掉前后空格后以百分号结尾才会进行转换；否则直接返回参数。
             如果解析失败，则返回 NaN。
             */
            parsePercent: function (v) {

                if (typeof v == 'string' && $.String(v).trim().endsWith('%')) {
                    return parseInt(v) / 100;
                }

                return v;
            }

        });


    })(MiniQuery, {});

    /**
     * Url 工具类
     * @namespace
     */
    MiniQuery.Url = (function ($, This) {


        return $.extend(This, {  /**@lends MiniQuery.Url */

            /**
             * 获取指定 Url 的查询字符串中指定的键所对应的值。
             * @param {string} url 要进行获取的 url 字符串。
             * @param {string} [key] 要检索的键。
             * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
             如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
             当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
             * @retun {string|Object|undefined} 返回一个查询字符串值。
             当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
             当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
             * @example
             $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 '1'
             $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 undefined
             $.Url.getQueryString('http://www.demo.com?a=1&A=2#hash', 'A');  //返回 2
             $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true);//返回 1
             $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', '');   //返回 'a=1&b=2'
             $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 {a: '1', b: '2'}
             $.Url.getQueryString('http://www.demo.com?a=&b=');              //返回 {a: '', b: ''}
             $.Url.getQueryString('http://www.demo.com?a&b');                //返回 {a: '', b: ''}
             $.Url.getQueryString('http://www.demo.com?a', 'a');             //返回 ''
             */
            getQueryString: function (url, key, ignoreCase) {

                var beginIndex = url.indexOf('?');
                if (beginIndex < 0) { //不存在查询字符串
                    return;
                }

                var endIndex = url.indexOf('#');
                if (endIndex < 0) {
                    endIndex = url.length;
                }

                var qs = url.substring(beginIndex + 1, endIndex);
                if (key === '') { //获取全部查询字符串的 string 类型
                    return qs;
                }


                var obj = $.Object.parseQueryString(qs);

                if (key === undefined) { //未指定键，获取整个 Object 对象
                    return obj;
                }

                if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键
                    return obj[key];
                }

                //以下是不区分大小写
                for (var name in obj) {
                    if (name.toLowerCase() == key.toString().toLowerCase()) {
                        return obj[name];
                    }
                }

            },




            /**
             * 把指定的 Url 和查询字符串组装成一个新的 Url。
             * @param {string} url 组装前的 url。
             * @param {string|Object} key 要添加的查询字符串的键。
             当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
             * @param {string} [value] 要添加的查询字符串的值。
             * @retun {string} 返回组装后的新的 Url。
             * @example
             //返回 'http://www.demo.com?a=1&b=2&c=3#hash'
             $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', 'c', 3);

             //返回 'http://www.demo.com?a=3&b=2&d=4#hash'
             $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', {a: 3, d: 4});

             //返回 'http://www.demo.com?a=3&b=2&d=4&E=aa%3D1111%26bb%3D2222#hash'
             $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', {
            a: 3, 
            d: 4,
            E: {
                aa: 1111,
                bb: 2222
            }
        });
             */
            setQueryString: function (url, key, value) {

                var obj = This.getQueryString(url) || {};

                if ($.Object.isPlain(key)) { //setQueryString(url, {...});
                    $.Object.extendDeeply(obj, key);
                }
                else {
                    obj[key] = value;
                }

                var qs = $.Object.toQueryString(obj);

                var hasQuery = url.indexOf('?') > -1;
                var hasHash = url.indexOf('#') > -1;
                var a;

                if (hasQuery && hasHash) {
                    a = url.split(/\?|#/g);
                    return a[0] + '?' + qs + '#' + a[2];
                }

                if (hasQuery) {
                    a = url.split('?');
                    return a[0] + '?' + qs;
                }

                if (hasHash) {
                    a = url.split('#');
                    return a[0] + '?' + qs + '#' + a[1];
                }

                return url + '?' + qs;

            },

            /**
             * 判断指定的 Url 是否包含特定名称的查询字符串。
             * @param {string} url 要检查的 url。
             * @param {string} [key] 要提取的查询字符串的键。
             * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
             如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
             当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
             * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
             * @example
             $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 true
             $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'b');  //返回 true
             $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 false
             $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true); //返回 true
             $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 true
             */
            hasQueryString: function (url, key, ignoreCase) {

                var obj = This.getQueryString(url); //获取全部查询字符串的 Object 形式

                if (!obj) {
                    return false;
                }

                if (!key) { //不指定名称，
                    return !$.Object.isEmpty(obj); //只要有数据，就为 true
                }

                if (key in obj) { //找到完全匹配的
                    return true;
                }

                if (ignoreCase) { //明确指定了忽略大小写
                    for (var name in obj) {
                        if (name.toLowerCase() == key.toString().toLowerCase()) {
                            return true;
                        }
                    }
                }

                //区分大小写，但没找到
                return false;

            }

        });


    })(MiniQuery, {});








    /**
     * 全局唯一标识符工具类（GUID: Globally Unique Identifier）。
     * 提供全局 ID 生成和管理的方法，可用于给组件创建 ID。
     * @namespace
     */
    MiniQuery.Guid = (function ($, This) {



        var anonymousName = '__anonymousName_' + $.String.random();

        var group$counter = {}; //分组计数器，从 1 开始
        var guids = {};         //用于 id 的注册，以判断某个 id 在全局内是否已存在




        return $.extend(This, { /**@lends MiniQuery.Guid */

            /**
             * 获取指定分组的下一个计数器。
             * 如果尚未存在该分组，则从 1 开始计数。
             * @param {string} groupName 分组的名称。
             * @return {int} 返回一个整数。
             * @example
             $.Guid.next('group1'); //1
             $.Guid.next('group2'); //1
             $.Guid.next('group2'); //2
             $.Guid.next('group1'); //2
             $.Guid.next(); //1
             $.Guid.next(); //2
             */
            next: function (groupName) {

                if (arguments.length == 0) { // next()
                    groupName = anonymousName;
                }

                var id = group$counter[groupName] || 0;
                id = id + 1;
                group$counter[groupName] = id;

                return id;
            },

            /**
             * 给指定分组的下计数器清零。
             * 如果尚未存在该分组，则先创建该分组。
             * @param {string} groupName 分组的名称。
             * @example
             $.Guid.reset('group1');
             $.Guid.reset('group2');
             $.Guid.reset();
             */
            reset: function (groupName) {
                if (arguments.length == 0) { // reset()
                    groupName = anonymousName;
                }

                group$counter[groupName] = 0;
            },

            /**
             * 获取指定分组的并且按指定字符串格式化的 id 值。
             * 如果尚未存在该分组，则从 1 开始计数。
             * @param {string} groupName 分组的名称。
             * @param {string} [formater='{0}'] 要填充的格式化字符串。
             * @return {string} 返回格式化后的 id 字符串。
             * @example
             $.Guid.get('group1', 'label_{0}_{1}'); // 'label_1_2'
             $.Guid.get('group1', 'label_{0}_{1}'); // 'label_3_4'
             $.Guid.get('group2', 'button_{0}_{1}'); // 'button_1_2'
             $.Guid.get('group2', 'button_{0}_{0}'); // 'button_3_3'
             */
            get: function (groupName, formater) {

                formater = formater || '{0}';

                var reg = /\{\d+\}/g;
                var items = formater.match(reg); //把所有的 {0}、{1} 等提取出来

                var ids = $.Array.map(items, function (item, index) {
                    return This.next(groupName);
                });

                var id = $.String.format(formater, ids);
                This.add(id);

                return id;
            },

            /**
             * 把指定的 id 值添加(注册)到 guid 列表中，以表示该 id 已被占用。
             * @param {string} id 字符串的 ID 值。
             * @example
             $.Guid.add('myId');
             */
            add: function (id) {
                guids[id] = true;
            },

            /**
             * 把指定的 id 值从 guid 列表中移除，以表示该 id 已被释放。
             * @param {string} id 字符串的 ID 值。
             * @example
             $.Guid.remove('myId');
             */
            remove: function (id) {
                delete guids[id];
            },

            /**
             * 判断指定的 id 值已给占用。
             * @param {string} id 字符串的 ID 值。
             * @example
             $.Guid.exist('myId');
             */
            exist: function (id) {
                return !!guids[id];
            }
        });


    })(MiniQuery, {});




    /**
     * 映射器工具类。
     * 实现任意类型的两个变量的关联。
     * @class
     * @param
     * @example
     var mapper = new $.Mapper();
     */

    MiniQuery.Mapper = (function ($) {






        var guidKey = '__guid__' + $.String.random();
        var guid$type$object = {}; //容纳所有 Mapper 实例的数据


        /**@inner*/
        function Mapper(key, value) {

            //分配本实例对应的容器
            var guid = $.String.random();
            this[guidKey] = guid;

            guid$type$object[guid] = {
                'guid': {},     //针对有 guid 属性的对象作特殊存取，以求一步定位。
                'false': {},    //针对 false|null|undefined|''|0|NaN
                'string': {},
                'number': {},
                'boolean': {}, //只针对 true
                'object': {},
                'function': {},
                'undefined': {} //这个用不到
            };

            if (arguments.length > 0) { //这里不要判断 key，因为 key 可以为任何值。
                this.set(key, value);
            }
        }



        function getString(obj) {

            //函数的 length 属性表示形参的个数，而且是只读的。 详见 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length
            //函数的 name 属性表示函数的名称，而且是只读的。 匿名函数的名称为空字符串。 详见 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
            if (typeof obj == 'function') {

                var a = [];

                if ('name' in obj) {
                    a.push(obj.name);
                }

                if ('length' in obj) {
                    a.push(obj.length);
                }

                if (a.length > 0) {
                    return a.join('#');
                }
            }


            return $.Object.getType(obj); //返回相应构造器的名称，不要用　toString，因为可能会变

        }



//静态方法
        $.extend(Mapper, { /**@lends MiniQuery.Mapper */
        getGuidKey: function () {
            return guidKey;
        }
        });



//原型方法
        $.extend(Mapper.prototype, { /**@lends MiniQuery.Mapper# */

            /**
             * 设置一对映射关系。
             * @param src 映射关系的键，可以是任何类型。
             * @param target 映射关系要关联的值，可是任何类型。
             * @return 返回第二个参数 target。
             * @example
             var obj = { a: 1, b: 2 };
             var fn = function(a, b) {
            console.log(a+b);
        };
             var mapper = new $.Mapper();
             mapper.set(obj, fn);
             mapper.set('a', 100);
             mapper.set(100, 'abc');
             mapper.set('100', 'ABC');
             mapper.set(null, 'abc');

             */
            set: function (src, target) {

                var all = guid$type$object[this[guidKey]];

                if (!src) { // false|null|undefined|''|0|NaN
                    all['false'][String(src)] = target;
                    return target;
                }

                var type = typeof src;

                if (type == 'object' && guidKey in src) { //针对含有 guid 属性的对象作优先处理
                    var guid = src[guidKey];
                    all['guid'][guid] = target; //一步定位
                    return;
                }


                switch (type) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        all[type][String(src)] = target;
                        break;

                    case 'object':
                    case 'function':
                        var key = getString(src); //这里确保 key 一定是一个 string
                        var list = all[type][key];
                        if (list) { //已存在对应字符串的列表
                            var pair = $.Array.findItem(list, function (pair, index) {
                                return pair[0] === src;
                            });

                            if (pair) { //已存在，
                                pair[1] = target; //改写值
                            }
                            else { //未找到，创建新的，添加进去一对二元组 [src, target]
                                list.push([src, target]);
                            }
                        }
                        else { //未存在，则创建并添加
                            list = [[src, target]];
                        }

                        all[type][key] = list; //回写
                }

                return target;
            },

            /**
             * 批量设置映射关系。
             * @param {Array} list 映射关系的列表，是一个二维数组，每个数组项为[src, target] 的格式。
             * @example
             var mapper = new $.Mapper();
             mapper.setBatch([
             ['a', 100],
             ['b', 200]
             ['c', false]
             ]);
             */
            setBatch: function (list) {
                var self = this;

                $.Array.each(list, function (item, index) {
                    self.set(item[0], item[1]);
                });
            },

            /**
             * 获取一对映射关系所关联的值。<br />
             * 注意：根据映射关系的键查找所关联的值时，对键使用的是全等比较，即区分数据类型。
             * @param src 映射关系的键，可以是任何类型。
             * @return 返回映射关系所关联的值。
             * @example
             var obj = { a: 1, b: 2 };
             var fn = function(a, b) {
            console.log(a+b);
        };

             var mapper = new $.Mapper();
             mapper.set(obj, fn);

             var myFn = mapper.get(obj); //获取到之前关联的 fn
             myFn(100, 200);
             */
            get: function (src) {

                var all = guid$type$object[this[guidKey]];

                // false|null|undefined|''|0|NaN
                if (!src) {
                    return all['false'][String(src)];
                }


                var type = typeof src;

                if (type == 'object' && guidKey in src) { //针对含有 guid 属性的对象作优先处理
                    var guid = src[guidKey];
                    return all['guid'][guid]; //一步定位
                }



                switch (type) {
                    //值类型的，直接映射
                    case 'string':
                    case 'number':
                    case 'boolean':
                        return all[type][String(src)];


                    //引用类型的，通过 key 映射到一个二维数组，每个二维数组项为 [src, target]
                    case 'object':
                    case 'function':
                        var key = getString(src);
                        var list = all[type][key];
                        if (list) { //已存在对应字符串的列表
                            var pair = $.Array.findItem(list, function (pair, index) {
                                return pair[0] === src;
                            });

                            if (pair) {
                                return pair[1];
                            }
                        }
                }

                return undefined;
            },


            /**
             * 根据给定的键移除一对映射关系。
             * 注意：根据映射关系的键查找所关联的值时，对键使用的是全等比较，即区分数据类型。
             * @param src 映射关系的键，可以是任何类型。
             * @example
             var obj = { a: 1, b: 2 };
             var fn = function(a, b) {
            console.log(a+b);
        };

             var mapper = new $.Mapper();
             mapper.set(obj, fn);

             mapper.remove(obj);
             fn = mapper.get(obj);
             console.log( typeof fn); // undefined
             */
            remove: function (src) {

                var all = guid$type$object[this[guidKey]];

                // false|null|undefined|''|0|NaN
                if (!src) {
                    delete all['false'][String(src)];
                    return;
                }

                var type = typeof src;

                if (type == 'object' && guidKey in src) { //针对含有 guid 属性的对象作优先处理
                    var guid = src[guidKey];
                    delete all['guid'][guid]; //一步定位
                    return;
                }


                switch (type) {
                    //值类型的，直接映射
                    case 'string':
                    case 'number':
                    case 'boolean':
                        delete all[type][String(src)];
                        break;

                    //引用类型的，通过 key 映射到一个二维数组，每个二维数组项为 [src, target]
                    case 'object':
                    case 'function':
                        var key = getString(src);
                        var list = all[type][key];
                        if (list) { //已存在对应字符串的列表
                            //移除 src 的项
                            all[type][key] = $.Array.grep(list, function (pair, index) {
                                return pair[0] !== src;
                            });
                        }
                }
            },


            /**
             * 销毁本实例。
             * 这会移除所有的映射关系，并且移除本实例内部使用的存放映射关系的容器对象。
             */
            dispose: function () {

                guid$type$object[this[guidKey]] = null;
                delete this[guidKey];
            }

        });

//for test
//Mapper.guid$type$object = guid$type$object;

        return Mapper;


    })(MiniQuery);






    /**
     * 自定义事件工具类。
     * 该模式也叫观察者模式，该模式的另外一个别名是 订阅/发布 模式。
     * 设计这种模式背后的主要动机是促进松散耦合。
     * 在这种模式中，并不是一个对象调用另一对象的方法，
     * 而是一个对象订阅另一个对象的特定活动并在该活动发生改变后获得通知。
     * 订阅者也称之为观察者，而被观察的对象成为发布者。
     * 当发生了一个重要的事件时，发布者将通知（调用）所有订阅者并且以事件对象的形式传递消息。
     * @class
     * @param {Object} obj 要进行绑定事件的目标对象。
     * @return {MiniQuery.Event} 返回一个 MiniQuery.Event 的实例。
     */
    MiniQuery.Event = function Event(obj) {
        return new MiniQuery.Event.prototype.init(obj);
    };


    ; (function ($, This, Mapper) {


        var mapper = new Mapper();
        var slice = Array.prototype.slice;


        $.extend(This, { /**@lends MiniQuery.Event*/

            /**
             * 给指定的对象绑定指定类型的事件处理函数。
             * @param {Object} obj 要进行绑定事件的目标对象。
             * @param {string} eventName 要绑定的事件名称。
             * @param {function} fn 事件处理函数。
             在处理函数内部， this 指向参数 obj 对象。
             * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
             如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
             * @example
             var obj = { value: 100 };
             $.Event.bind(obj, 'show', function(){
            console.log(this.value); // this 指向 obj
        });
             $.Event.bind(obj, {
            myEvent: function(){
                console.log(this.value);
            },
            add: function(value1, value2){
                this.value += (value1 * value2);
            }
        });
             $.Event.trigger(obj, 'show'); //输出 100
             $.Event.trigger(obj, 'add', [2, 3]);
             $.Event.trigger(obj, 'myEvent'); //输出 106
             */
            bind: function (obj, eventName, fn, isOnce) {

                var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
                if (!all) { // 首次对 obj 进行绑定事件 
                    all = {};
                    mapper.set(obj, all);
                }

                switch (typeof eventName) {

                    case 'string':  //标准的，单个绑定
                        bindItem(eventName, fn);
                        break;

                    case 'object':  //此时类似为 bind(obj, {click: fn, myEvent: fn}, isOnce)
                        if (!$.Object.isPlain(eventName)) {
                            throw new Error('当别参数 eventName 为 object 类型时，必须指定为纯对象 {}');
                        }

                        isOnce = fn; //参数位置修正
                        $.Object.each(eventName, function (key, value) {
                            bindItem(key, value);   //批量绑定
                        });
                        break;

                    default:
                        throw new Error('无法识别参数 eventName 的类型');
                        break;

                }

                isOnce = !!isOnce; //转成 boolean


                //一个内部的共用函数
                function bindItem(eventName, fn) {
                    if (typeof fn != 'function') {
                        throw new Error('参数 fn 必须为一个 function');
                    }

                    var list = all[eventName] || [];

                    list.push({
                        fn: fn,
                        isOnce: isOnce
                    });

                    all[eventName] = list;
                }

            },

            /**
             * 给指定的对象绑定一个一次性的事件处理函数。
             * @param {Object} obj 要进行绑定事件的目标对象。
             * @param {string} eventName 要绑定的事件名称。
             * @param {function} fn 事件处理函数。
             在函数内部，this 指向参数 obj 对象。
             */
            once: function (obj, eventName, fn) {

                var args = slice.call(arguments, 0).concat([true]);
                This.bind.apply(null, args);

            },

            /**
             * 给指定的对象解除绑定指定类型的事件处理函数。
             * @param {Object} obj 要进行解除绑定事件的目标对象。
             * @param {string} [eventName] 要解除绑定的事件名称。
             如果不指定该参数，则移除所有的事件。
             如果指定了该参数，其类型必须为 string，否则会抛出异常。
             * @param {function} [fn] 要解除绑定事件处理函数。
             如果不指定，则移除 eventName 所关联的所有事件。
             */
            unbind: function (obj, eventName, fn) {

                var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
                if (!all) { //尚未存在对象 obj 所关联的事件列表
                    return;
                }


                //未指定事件名，则移除所有的事件
                if (eventName === undefined) {
                    mapper.remove(obj);
                    return;
                }

                //指定了事件名
                if (typeof eventName != 'string') {
                    throw new Error('如果指定了参数 eventName，则其类型必须为 string');
                }

                var list = all[eventName];
                if (!list) { //尚未存在该事件名所对应的事件列表
                    return;
                }

                //未指定事件处理函数，则移除该事件名的所有事件处理函数
                if (!fn) {
                    all[eventName] = [];
                    return;
                }

                //移除所有 fn 的项
                all[eventName] = $.Array.grep(list, function (item, index) {
                    return item.fn !== fn;
                });
            },

            /**
             * 触发指定的对象上的特定类型事件。
             * @param {Object} obj 要触发事件的目标对象。
             * @param {string} eventName 要触发的事件名称。
             * @param {Array} [args] 要向事件处理函数传递的参数数组。
             * @return {Array} 返回所有事件处理函数的返回值所组成的一个数组。
             */
            trigger: function (obj, eventName, args) {

                var returns = [];

                var all = mapper.get(obj); // all = {...}
                if (!all) {
                    return returns;
                }


                var list = all[eventName]; //取得回调列表
                if (!list) {
                    return returns;
                }

                args = args || [];


                //依次执行回调列表中的函数，并且移除那些只需要执行一次的
                all[eventName] = $.Array.grep(list, function (item, index) {

                    var value = item.fn.apply(obj, args); //让 fn 内的 this 指向 obj
                    returns.push(value);

                    return !item.isOnce;
                });

                return returns;
            },

            /**
             * 触发指定的对象上的特定类型事件，当事件处理函数返回指定的值时将停止继续调用。
             * @param {Object} obj 要触发事件的目标对象。
             * @param {string} eventName 要触发的事件名称。
             * @param {Array} [args] 要向事件处理函数传递的参数数组。
             * @param [stopValue=false] 要停止继续调用时的返回值。
             当事件处理函数返回参数 stopValue 所指定的值时，将停止调用后面的处理函数。
             * @return {Array} 返回已调用的事件处理函数的返回值所组成的一个数组。
             */
            triggerStop: function (obj, eventName, args, stopValue) {

                var returns = [];

                var all = mapper.get(obj); // all = {...}
                if (!all) {
                    return returns;
                }


                var list = all[eventName]; //取得回调列表
                if (!list) {
                    return returns;
                }

                args = args || [];

                if (arguments.length == 3) { //不传 stopValue 时，默认为 false
                    stopValue = false;
                }

                var items = [];


                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i];
                    var value = item.fn.apply(obj, args); //让 fn 内的 this 指向 obj

                    if (!item.isOnce) {
                        items.push(item);
                    }

                    returns.push(value);

                    if (value === stopValue) {
                        break;
                    }
                }

                list = list.slice(i + 1);
                all[eventName] = items.concat(list);

                return returns;
            },

            /**
             * 检测指定的对象上是否包含特定类型的事件。
             * @param {Object} obj 要检测的目标对象。
             * @param {string} [eventName] 要检测的事件名称。
             当不指定时，则判断是否包含了任意类型的事件。
             * @param {function} [fn] 要检测的事件处理函数。
             * @return {boolean} 返回一个布尔值，该布尔值指示目标对象上是否包含指否类型的事件以及指定的处理函数。
             如果是则返回 true；否则返回 false。
             */
            has: function (obj, eventName, fn) {

                var all = mapper.get(obj); // all = {...}
                if (!all) {   //尚未绑定任何类型的事件
                    return false;
                }

                if (eventName === undefined) {   //未指定事件名，则判断是否包含了任意类型的事件
                    if ($.Object.isEmpty(all)) { // 空对象 {}
                        return false;
                    }

                    var hasEvent = false;

                    $.Object.each(all, function (eventName, list) {
                        if (list && list.length > 0) {
                            hasEvent = true;
                            return false; // break, 只有在回调函数中明确返回 false 才停止循环。
                        }
                    });

                    return hasEvent;
                }


                //指定了事件名
                if (typeof eventName != 'string') {
                    throw new Error('如果指定了参数 eventName，则其类型必须为 string');
                }

                var list = all[eventName]; //取得回调列表
                if (!list || list.length == 0) {
                    return false;
                }

                if (fn === undefined) { //未指定回调函数
                    return true;
                }

                //从列表中搜索该回调函数
                return $.Array.find(list, function (item, index) {
                    return item.fn === fn;
                });

            },

            /**
             * 给指定的对象绑定/解除绑定指定类型的事件处理函数。
             * 如果目标对象的指定类型事件中存在该处理函数，则移除它；否则会添加它。
             * @param {Object} obj 要进行绑定/解除绑定事件的目标对象。
             * @param {string} eventName 要绑定/解除绑定的事件名称。
             * @param {function} fn 事件处理函数。
             * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
             如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
             * @example
             var obj = { value: 100 };
             var fn = function() {
            console.log(this.value); // this 指向 obj
        }
             $.Event.bind(obj, 'show', fn);
             $.Event.trigger(obj, 'show'); //输出 100

             $.Event.toggle(obj, 'show', fn); //因为 'show' 事件列表中已存在 fn 函数，所以会给移除
             $.Event.trigger(obj, 'show'); //fn 函数已给移除，因为不产生输出
             */
            toggle: function (obj, eventName, fn, isOnce) {

                if (This.has(obj, eventName, fn)) {
                    This.unbind(obj, eventName, fn);
                }
                else {
                    This.bind(obj, eventName, fn, isOnce);
                }
            },

            /**
             * 给指定的对象只绑定一次指定类型的事件处理函数。
             * 只有当目标对象的指定类型事件中不存在该处理函数时才添加；否则忽略操作。
             * @param {Object} obj 要进行绑定事件的目标对象。
             * @param {string} eventName 要绑定的事件名称。
             * @param {function} fn 事件处理函数。
             * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
             如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
             * @example
             var obj = { value: 100 };
             var fn = function() {
            console.log(this.value); // this 指向 obj
        }
             $.Event.bind(obj, 'show', fn);
             $.Event.trigger(obj, 'show'); //输出 100

             $.Event.unique(obj, 'show', fn); //因为 'show' 事件列表中已存在 fn 函数，所以不会重复绑定
             $.Event.trigger(obj, 'show'); //依然只输出 100
             */
            unique: function (obj, eventName, fn, isOnce) {

                if (This.has(obj, eventName, fn)) {
                    return;
                }

                This.bind(obj, eventName, fn, isOnce);

            }

            //for test
            //, __mapper__: mapper

        });


    })(MiniQuery, MiniQuery.Event, MiniQuery.Mapper);







//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法


    ; (function (This) {

        var slice = Array.prototype.slice;

        This.prototype = { /**@inner*/

        constructor: This,
            value: {},

            init: function (obj) {
                this.value = obj;
            },


            valueOf: function () {
                return this.value;
            },

            on: function (eventName, fn, isOnce) {
                //This.bind(this.value, eventName, fn, isOnce);
                var args = [this.value].concat(slice.call(arguments, 0));
                This.bind.apply(null, args);
                return this;
            },

            off: function (eventName, fn) {
                //This.unbind(this.value, eventName, fn);
                var args = [this.value].concat(slice.call(arguments, 0));
                This.unbind.apply(null, args);
                return this;
            },

            bind: function (eventName, fn, isOnce) {
                //This.bind(this.value, eventName, fn, isOnce);
                var args = [this.value].concat(slice.call(arguments, 0));
                This.bind.apply(null, args);
                return this;
            },

            unbind: function (eventName, fn) {
                //This.unbind(this.value, eventName, fn);
                var args = [this.value].concat(slice.call(arguments, 0));
                This.unbind.apply(null, args);
                return this;
            },

            once: function (eventName, fn) {
                //This.once(this.value, eventName, fn);
                var args = [this.value].concat(slice.call(arguments, 0));
                This.once.apply(null, args);
                return this;
            },

            trigger: function (eventName, args) {
                var args = [this.value].concat(slice.call(arguments, 0));
                return This.trigger.apply(null, args);
                //return This.trigger(this.value, eventName, args);
            },

            triggerStop: function (eventName, args, stopValue) {
                var args = [this.value].concat(slice.call(arguments, 0));
                return This.triggerStop.apply(null, args);
            },

            fire: function (eventName, args) {
                var args = [this.value].concat(slice.call(arguments, 0));
                return This.trigger.apply(null, args);
                //return This.trigger(this.value, eventName, args);
            },

            fireStop: function (eventName, args, stopValue) {
                var args = [this.value].concat(slice.call(arguments, 0));
                return This.triggerStop.apply(null, args);
            },

            has: function (eventName, fn) {
                var args = [this.value].concat(slice.call(arguments, 0));
                return This.has.apply(null, args);
                //return This.has(this.value, eventName, fn);
            },

            toggle: function (eventName, fn, isOnce) {
                //This.toggle(this.value, eventName, fn, isOnce);
                var args = [this.value].concat(slice.call(arguments, 0));
                This.toggle.apply(null, args);
                return this;
            },

            unique: function (eventName, fn, isOnce) {
                var args = [this.value].concat(slice.call(arguments, 0));
                return This.unique.apply(null, args);
            },


        };


        This.prototype.init.prototype = This.prototype;

    })(MiniQuery.Event);



    /**
     * 回调列表类。
     * @class
     */
    MiniQuery.Callbacks = (function ($, Mapper) {


        var guidKey = Mapper.getGuidKey();
        var eventName = '__callback__' + $.String.random();
        var slice = Array.prototype.slice;

        /**
         * @inner
         * 构造函数
         */
        function Callbacks() {

            this[guidKey] = $.String.random();
        }


        $.extend(Callbacks.prototype, { /**@lends MiniQuery.Callbacks#*/

            /**
             * 添加一个回调函数到回调列表中。
             * @param {function} fn 要添加的回调函数
             * @param {boolean} [isOnce=false] 指示回调函数是否只给调用一次。
             如果要让回调函数给调用一次后被移除，请指定为 true；否则不指定或指定为 false。
             */
            add: function (fn, isOnce) {
                var args = [this, eventName].concat(slice.call(arguments, 0));
                $.Event.bind.apply(null, args);
            },

            /**
             * 添加一个只调用一次的回调函数到回调列表中。
             * @param {function} fn 要添加的回调函数。
             该回调函数给调用一次后会被移除。
             */
            once: function (fn) {
                var args = [this, eventName].concat(slice.call(arguments, 0));
                $.Event.once.apply(null, args);
            },

            /**
             * 从回调列表中移除指定的回调函数。
             * @param {function} fn 要移除的回调函数。
             */
            remove: function (fn) {
                var args = [this, eventName].concat(slice.call(arguments, 0));
                $.Event.unbind.apply(null, args);
            },

            /**
             * 调用回调列表中的回调函数，并可选地传递一些参数。
             * @return {Array} 返回由被调用的回调函数的返回值所组成的数组。
             */
            fire: function () {
                var args = slice.call(arguments, 0);
                return $.Event.trigger(this, eventName, args);
            },

            /**
             * 切换到指定的上下文来调用回调列表中的回调函数，并可选传递一些参数。
             * @param {Object} context 要切换到上下文对象。
             指定该参数后，回调函数中的 this 均指向该上下文对象。
             * @return {Array} 返回由被调用的回调函数的返回值所组成的数组。
             * @example
             var callbacks = new $.Callbacks();
             callbacks.add(function (a, b) {
            console.log(this.value, a, b);
        });
             callbacks.fireWith({ value: 100 }, 'aa', 'bb'); //输出 100, 'aa', 'bb'
             */
            fireWith: function (context) {

                var hasGuid = guidKey in context;

                var old = context[guidKey];
                context[guidKey] = this[guidKey];

                var args = slice.call(arguments, 1); //从索引为 1 开始后的所有参数都当作要传递给回调函数的参数
                var values = $.Event.trigger(context, eventName, args);

                if (hasGuid) {
                    context[guidKey] = old;
                }
                else {
                    delete context[guidKey];
                }

                return values;


            },

            /**
             * 调用回调列表中的回调函数直到某个回调函数返回指定的值为止，并可选地传递一些参数。
             * @param {Object} stopValue 要使回调列表停止调用的值。
             回调列表依次调用列表中的回调函数，当回调函数返回值为 stopValue 指定的值时，将会停止调用后面的。
             * @return {Array} 返回由被调用的回调函数的返回值所组成的数组。
             */
            fireStop: function (stopValue) {
                var args = slice.call(arguments, 1); //从索引为 1 开始后的所有参数都当作要传递给回调函数的参数
                return $.Event.triggerStop(this, eventName, args, stopValue);
            },

            /**
             * 判断回调列表中是否包含指定的回调函数。
             * @param {function} fn 要判断的回调函数。
             * @return {boolean} 如果回调列表中包含指定的回调函数，则返回 true；否则返回 false。
             */
            has: function (fn) {
                var args = [this, eventName].concat(slice.call(arguments, 0));
                return $.Event.has.apply(null, args);
            },


            /**
             * 给回调列表添加/移除指定的回调函数。
             * 如果回调列表中存在该回调函数，则移除它；否则会添加它。
             * @param {function} fn 回调函数。
             * @param {boolean} [isOnce=false] 指示回调函数是否只给调用一次。
             如果要让回调函数给调用一次后被移除，请指定为 true；否则不指定或指定为 false。
             */
            toggle: function (fn, isOnce) {
                var args = [this, eventName].concat(slice.call(arguments, 0));
                $.Event.toggle.apply(null, args);
            },

            /**
             * 给回调列表只添加一次指定的回调函数。
             * 只有当回调列表中不存在该回调函数时才添加它；否则会忽略。
             * @param {function} fn 要添加的回调函数。
             * @param {boolean} [isOnce=false] 指示回调函数是否只给调用一次。
             如果要让回调函数给调用一次后被移除，请指定为 true；否则不指定或指定为 false。
             */
            unique: function (fn, isOnce) {
                var args = [this, eventName].concat(slice.call(arguments, 0));
                $.Event.unique.apply(null, args);
            }

        });


        return Callbacks;





    })(MiniQuery, MiniQuery.Mapper);




    /**
     * 有限状态机类
     * @class
     * 有限状态机是一个非常有用的模型，可以模拟世界上大部分事物。
     * 简单说，它有三个特征：
     *   1.状态总数（state）是有限的。
     *   2.任一时刻，只处在一种状态之中。
     *   3.状态转换规则是确定的。
     * 它对 JavaScript 的意义在于，很多对象可以写成有限状态机。
     * 当对象的状态发生变化时，可以触发特定事件进行回调函数的调用。
     * 有限状态机的写法，逻辑清晰，表达力强，有利于封装事件。
     * 一个对象的状态越多、发生的事件越多，就越适合采用有限状态机的写法。
     */
    MiniQuery.States = (function ($, Mapper) {


        var guidKey = Mapper.getGuidKey();
        var mapper = new Mapper();


        /**
         * @inner
         * 构造函数
         */
        function States(current, list) {


            this[guidKey] = $.String.random();


            var states = {};//状态集合
            var paths = {}; //路径集合

            mapper.set(this, {
                states: states,
                paths: paths,
                histories: [current] //经历过的状态
            });

            var self = this;
            var bind = $.Event.bind;
            list = normalize(list);

            $.Array.each(list, function (item, index) {

                var from = item.from;
                var to = item.to;
                var fn = item.fn;

                if (from && to) {
                    bind(self, from + '->' + to, fn);
                    paths[from + '->' + to] = true;
                    states[from] = true;
                    states[to] = true;
                }
                else if (from) {
                    bind(self, from + '->', fn);
                    states[from] = true;
                }
                else if (to) {
                    bind(self, '->' + to, fn);
                    states[to] = true;
                }
                else {
                    bind(self, '->', fn);
                }

            });

        }


        /**
         * @inner
         * 静态方法
         * 标准化参数 states，以获得统一的描述格式
         */
        function normalize(states) {

            var list = [];

            if ($.Object.isPlain(states)) { //此时为 { ... }

                $.Object.each(states, function (key, fn) {

                    var pair = key.split('->');
                    var from = pair[0];
                    var to = pair[1];

                    if (from.indexOf('|') > 0 || to.indexOf('|') > 0) { // from 和 to 中至少有一个含有 '|'
                        from = from.split('|');
                        to = to.split('|');
                        var a = combine(from, to, fn);
                        list = list.concat(a);
                    }
                    else {
                        list.push({
                            from: from,
                            to: to,
                            fn: fn
                        });
                    }

                });
            }
            else if ($.Object.isArray(states)) { // 此时为 [ ... ]

                $.Array.each(states, function (item, index) {

                    var from = item.from;
                    var to = item.to;
                    var fn = item.fn;

                    var from_isArray = from instanceof Array;
                    var to_isArray = to instanceof Array;

                    if (from_isArray || to_isArray) { // from 和 to 中至少有一个为数组

                        if (!from_isArray) { //此时 to 必为 []
                            from = [from];
                        }
                        else if (!to_isArray) { //此时 from 必为 []
                            to = [to];
                        }

                        var a = combine(from, to, fn);
                        list = list.concat(a);
                    }
                    else {
                        list.push(item);
                    }

                });
            }

            return list;
        }


        /**
         * @inner
         */
        function combine(A, B, fn) {

            var groups = $.Array.descartes(A, B);

            return $.Array.map(groups, function (item, index) {
                return {
                    from: item[0],
                    to: item[1],
                    fn: fn
                };
            });
        }





        $.extend(States.prototype, { /**@lends MiniQuery.States#*/

            /**
             * 把当前状态转换到指定的状态。
             * @param {string} name 要转换到的目标状态。
             * @param {Array} [args] 要向状态转换时触发的处理函数传递的参数数组。
             * @example
             *
             */
            to: function (name, args) {

                var current = this.current();

                if (!this.has(current, name)) {
                    throw new Error($.String.format('不存在从状态 {0} 到状态 {1} 的路径', current, name));
                }

                mapper.get(this).histories.push(name); //先改变状态，再触发事件

                $.Event.trigger(this, current + '->', args);
                $.Event.trigger(this, current + '->' + name, args);
                $.Event.trigger(this, '->' + name, args);
                $.Event.trigger(this, '->', args);


            },

            backward: function (args) {
                var histories = mapper.get(this).histories;
                var index = histories.length - 2;
                if (index >= 0) {
                    this.to(histories[index], args);
                }
            },

            current: function () {
                var histories = mapper.get(this).histories;
                return histories[histories.length - 1];
            },

            has: function (from, to) {

                var states = mapper.get(this).states;
                if (to === undefined) { //此时为 has(from) 即确定是否包含某个状态
                    return !!states[from];

                }

                //此时为 has(from, to) 即是否存在从 from 到 to 的路径
                var paths = mapper.get(this).paths;
                return !!paths[from + '->' + to];
            },

            states: function () {
                var states = mapper.get(this).states;
                return $.Object.getKeys(states);
            },

            paths: function () {
                var paths = mapper.get(this).paths;
                return $.Object.getKeys(paths);
            },

            histories: function () {
                var histories = mapper.get(this).histories;
                return histories.slice(0);
            },

            length: function () {
                return this.states().length;
            }

        });

//for test
//States.mapper = mapper;

        return States;



    })(MiniQuery, MiniQuery.Mapper);





    (function ($, This, Mapper) {



//用来记录 window 是否已绑定了 hashchange 事件 
        var window$bind = new Mapper();

//避免意外绑定到 window 中同名的事件。 
//也可阻止用户手动去触发该事件，因为外部无法得知该事件名。
        var eventName = '__hashchange__' + $.String.random();

        return $.extend(This, {  /**@lends MiniQuery.Url */

            /**
             * 监听指定窗口 Url 的 Hash 变化，并触发一个回调函数。
             * @param {Window} window 要监听的 window 窗口。
             * @param {function} fn 当监听窗口的 hash 发生变化时，要触发的回调函数。
             *   该回调函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
             *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
             *   如果 oldHash 不存在，则为 null。
             *   该回调函数内部的 this 指向监听的窗口。
             * @example
             $.Url.hashchange(top, function (newHash, oldHash) {
            console.log('new hash: ' + newHash);
            console.log('old hash: ' + oldHash);
            console.log(this === top); //true

        });
             */
            hashchange: function (window, fn) {

                $.Event.bind(window, eventName, fn);

                var location = window.document.location;
                var hash = location.hash;

                if (hash) { //如果有 hash，则立即触发
                    fn.call(window, hash.slice(1), null); //不要用 trigger，因为可能会影响之前绑定的
                }

                if (window$bind.get(window)) { // window 所对应的窗口已绑定
                    return;
                }

                // window 所对应的窗口首次绑定 
                if ('onhashchange' in window) {
                    window.onhashchange = function () {
                        var oldHash = hash;
                        hash = location.hash;
                        $.Event.trigger(window, eventName, [hash.slice(1), oldHash.slice(1)]);
                    };
                }
                else {
                    setInterval(function () {
                        var oldHash = hash;
                        hash = location.hash;
                        if (hash != oldHash) {
                            $.Event.trigger(window, eventName, [hash.slice(1), oldHash.slice(1)]);
                        }
                    }, 500);
                }

                window$bind.set(window, true);



            },

            /**
             * 监听指定窗口 Url 的 Hash 变化，并触发相应的路由分支函数。
             * @param {Window} window 要监听的 window 窗口。
             * @param {Object} routes 路由分支函数。
             *   分支函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
             *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
             *   如果 oldHash 不存在，则为 null。
             *   分支函数内部的 this 指向监听的窗口。
             * @example
             $.Url.route(window, {
            'abc': function (newHash, oldHash) { },
            'user/': function (newHash, oldHash){ },
            'user/1234': function (newHash, oldHash) { }
        });

             $.Url.route(window, 'abc', function (newHash, oldHash) {

        });

             */
            route: function (window, routes) {

                if (!$.Object.isPlain(routes)) { //此时为 route(window, hash, fn) 的形式
                    routes = $.Object.make(routes, arguments[2]); //用 hash 和 fn 组成一个 {}
                }

                This.hashchange(window, function (newHash, oldHash) {
                    var fn = routes[newHash];
                    if (fn) {
                        fn.call(window, newHash, oldHash);
                    }
                });


            }

        });


    })(MiniQuery, MiniQuery.Url, MiniQuery.Mapper);









    /**
     * Cookie 工具
     * @namespace
     */
    MiniQuery.Cookie = (function ($, This) {


//缓存 toObject 中的结果
        var cookie$object = {
            'true': {},
            'false': {}
        };


        /**
         * 解析字符串描述的 expires 字段
         * @inner
         */
        var parseExpires = (function () {

            var reg = /^\d+([y|M|w|d|h|m|s]|ms)$/; //这里不要使用 /g

            var fns = {
                y: 'Year',
                M: 'Month',
                w: 'Week',
                d: 'Day',
                h: 'Hour',
                m: 'Minute',
                s: 'Second',
                ms: 'Millisecond'
            };

            //parseExpires = 
            return function (s) {

                var now = new Date();

                if (typeof s == 'number') {
                    return $.Date.addMilliseconds(now, s);
                }


                if (reg.test(s)) {
                    var value = parseInt(s);
                    var unit = s.replace(/^\d+/g, '');
                    return $.Date['add' + fns[unit] + 's'](now, value);
                }

                return $.Date.parse(s);
            };


        })();


        return $.extend(This, { /**@lends MiniQuery.Cookie*/

            /**
             * 把一个 cookie 字符串解析成等价的 Object 对象。
             * @param {String} cookie 要进行解析的 cookie 字符串。
             * @param {boolean} [deep=false] 指定是否要进行深层次解析。
             如果要对 cookie 中的值进行查询字符串方式的深层次解析，请指定 true；
             否则请指定 false 或不指定。
             * @return {Object} 返回一个解析后的等价的 Object 对象。
             * @example
             var obj = $.Cookie.toObject('A=1; B=2; C=a=100&b=200', true); //深层次解析
             //得到
             obj = {
            A: 1,
            B: 2,
            C: {
                a: 100,
                b: 200
            }
        };

             var obj = $.Cookie.toObject('A=1; B=2; C=a=100&b=200'); //浅解析
             //得到
             obj = {
            A: 1,
            B: 2,
            C: 'a=100&b=200'
        };

             $.Cookie.toObject('a=1; b=2');
             $.Cookie.toObject('a=1; b=2', true);
             $.Cookie.toObject();
             $.Cookie.toObject(true);

             */
            toObject: function (cookie, deep) {

                if (typeof cookie != 'string') { //此时为 toObject(true|false) 或 toObject()
                    deep = cookie;
                    cookie = document.cookie;
                }

                if (!cookie) {
                    return {};
                }

                deep = !!deep; //转成 true|false，因为有以它为键的存储

                var obj = cookie$object[deep][cookie];
                if (obj) { //缓存中找到
                    return obj;
                }


                obj = {};

                var parseQueryString = $.Object.parseQueryString;

                $.Array.each(cookie.split('; '), function (item, index) {

                    var pos = item.indexOf('=');

                    var name = item.slice(0, pos);
                    name = decodeURIComponent(name);


                    var value = item.slice(pos + 1);

                    if (deep && value.indexOf('=') > -1) { //指定了深层次解析，并且还包含 '=' 号
                        value = parseQueryString(value); //深层次解析复合值
                    }
                    else {
                        value = decodeURIComponent(value);
                    }


                    if (name in obj) {
                        var a = obj[name];
                        if (a instanceof Array) {
                            a.push(value);
                        }
                        else {
                            obj[name] = [a, value]
                        }
                    }
                    else {
                        obj[name] = value;
                    }

                });

                cookie$object[deep][cookie] = obj; //缓存起来

                return obj;
            },


            /**
             * 从当前 document.cookie 中获取指定名称和键所对应的值。
             * @param {boolean} [name] 要获取的项的名称。
             当不指定该参数时，全量返回 document.cookie 字符串。
             * @param {String} [key] 要获取的项的键。
             当不指定该参数时，返回参数 name 对应的项。
             * @return 返回指定项的值。
             * @example
             $.Cookie.get();
             $.Cookie.get(true);
             $.Cookie.get('A');
             $.Cookie.get('A', true);
             $.Cookie.get('A', 'b');
             */
            get: function (name, key) {


                if (name === undefined) { //此时为 get()
                    return This.toObject(); //返回一个浅解析的全量 Object
                }

                if (name === true) { //此时为 get(true)
                    return This.toObject(true); //返回一个深解析的全量 Object
                }



                //下面的 name 为一个具体的值


                if (key === undefined) { //此时为 get(name)
                    var obj = This.toObject(); //浅解析
                    return obj[name];
                }


                //下面的指定了 key

                var obj = This.toObject(true); //深解析
                var value = obj[name];

                if (key === true) {
                    return value;
                }

                //下面的 key 为一个具体的值

                if (value instanceof Array) { //同一个 name 得到多个值，主要是由于 path 不同导致的

                    //过滤出含有 key 的 object 项
                    var items = $.Array.grep(value, function (item, index) {
                        return item &&
                            typeof item == 'object' &&
                            key in item;
                    });

                    if (items.length == 0) {
                        return;
                    }

                    if (items.length == 1) { //只有一个
                        return items[0][key];
                    }

                    return $.Array.keep(items, function (item, index) {
                        return item[key];
                    });
                }


                if (value && typeof value == 'object') {
                    return value[key];
                }

            },


            /**
             * 给当前的 document.cookie 设置一个 Cookie。
             * @param {Document} document 要进行操作的 Document 对象。
             * @param {String} name 要设置的 Cookie 名称。
             * @param {String|Object} value 要设置的 Cookie 值。
             当传入一个 Object 对象时，会对它进行查询字符串的编码以获取一个 String 类型值。
             * @param {String|Number|Date} [expires] 过期时间。
             参数 expires 接受以下格式的字符串：
             y: 年
             M: 月
             w: 周
             d: 天
             h: 小时
             m: 分钟
             s: 秒
             ms: 毫秒
             或传入一个 $.Date.parse 识别的格式字符串，并会被解析成一个实际的日期实例。
             * @example
             //设置一个 A=100 的 Cookie，过期时间为12天后
             $.Cookie.set('A', 100, '12d');

             //设置一个 B=200 的 Cookie，过期时间为2周后
             $.Cookie.set('B', 200, '2w');

             //设置一个 C=300 的 Cookie，过期时间为 '2014-9-10'
             $.Cookie.set('C', 300, '2014-9-10');

             $.Cookie.set({
            name: 'A',
            value: 100,
            expires: '2w',
            path: '/',
            domain: 'localhost',
            secure: true
        });
             */
            set: function (name, value, expires, path, domain, secure) {


                if ($.Object.isPlain(name)) { // 此时为 set({ ... });
                    var config = name;
                    name = config.name;
                    value = config.value;
                    expires = config.expires;
                    path = config.path;
                    domain = config.domain;
                    secure = config.secure;
                }

                name = encodeURIComponent(name);
                if (!name) { // 空字符串
                    throw new Error('参数 name 不能为空字符串');
                }


                if ($.Object.isPlain(value)) {
                    value = $.Object.toQueryString(value);
                }
                else {
                    value = encodeURIComponent(value);
                }

                var cookie = name + '=' + value + '; ';

                if (expires) {
                    expires = parseExpires(expires);
                    cookie += 'expires=' + expires.toGMTString() + '; '; //不推荐使用 toGMTString 方法
                }

                if (path) {
                    cookie += 'path=' + path + '; ';
                }

                if (domain) {
                    cookie += 'domain=' + domain + '; ';
                }

                if (secure) {
                    cookie += 'secure';
                }

                document.cookie = cookie;
            },


            /**
             * 从当前的 document.cookie 中移除指定名称的 Cookie。
             * @param {String} [name] 要移除的 Cookie 的名称。
             当不指定参数 name 时，则会把所有的 Cookie 都移除。
             * @example
             //给 document 名称为 A 的 Cookie 移除
             $.Cookie.remove(document, 'A');

             //把 document 的所有 Cookie 都移除
             $.Cookie.remove(document);
             */
            remove: function (name, path, domain, secure) {

                var config = $.Object.isPlain(name) ? name : {
                    name: name,
                    path: path,
                    domain: domain,
                    secure: secure
                };

                config.expires = new Date(0);

                name = config.name;

                if (name === undefined) { //未指定名称，则全部移除
                    var obj = This.toObject();
                    $.Object.each(obj, function (name, value) {
                        config.name = name;
                        This.set(config);
                    });

                    return;
                }

                This.set(config);

            }


        });


    })(MiniQuery, {});







    /**
     * Script 脚本工具
     * @namespace
     */
    MiniQuery.Script = (function ($, This) {



        /**
         * 加载单个
         * @inner
         */
        function loadSingle(url, charset, document, fn) {

            var script = document.createElement('script');
            script.type = 'text/javascript';

            if (charset) {
                script.charset = charset;
            }

            var head = document.getElementsByTagName('head')[0];

            if (script.readyState) { //IE
                script.onreadystatechange = function () {

                    var readyState = script.readyState;
                    if (readyState == 'loaded' || readyState == 'complete') {
                        script.onreadystatechange = null; //避免重复执行回调
                        //head.removeChild(script); //已加载完毕，移除该 script 标签，减少 DOM 节点
                        fn && fn();
                    }
                };
            }
            else { //标准
                script.onload = function () {
                    //head.removeChild(script); //已加载完毕，移除该 script 标签，减少 DOM 节点
                    fn && fn();
                };
            }

            script.src = url;
            head.appendChild(script);
        }

        /**
         * 顺序加载批量
         * @inner
         */
        function loadBatch(urls, charset, document, fn) {
            var index = 0;

            (function () {
                var next = arguments.callee;
                var url = urls[index];

                loadSingle(url, charset, document, function () {
                    index++;

                    if (index < urls.length) {
                        next();
                    }
                    else {
                        fn && fn();
                    }
                });

            })();

            return;

        }


        /**
         * 单个写入
         * @inner
         */
        function document_write(url, charset, document) {
            var html = $.String.format('<script type="text/javascript" src="{src}" {charset} ><\/script>', {
                'src': url,
                'charset': charset ? $.String.format('charset="{0}"', charset) : ''
            });

            document.write(html);
        }



// MiniQuery.Script = 
        return $.extend(This, { /**@lends MiniQuery.Script*/

            /**
             * 跨浏览器动态加载 JS 文件，并在加载完成后执行指定的回调函数。
             * @memberOf MiniQuery.Script
             * @param {string|Array} params.url
             要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
             * @param {string} [params.charset="utf-8"]
             要加载的 JS 文件的字符编码，默认为 utf-8。
             * @param {Document} [params.document=window.document]
             要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
             * @param {function} [params.onload]
             加载成功后的回调函数。
             * @example
             $.Script.load({
            url: 'a.js',
            charset: 'utf-8',
            document: document,
            onload: function (){ }
        });

             $.Script.load('a.js', 'utf-8', document, function(){});
             $.Script.load('a.js', 'utf-8', function(){});
             $.Script.load('a.js', document, function(){});
             $.Script.load('a.js', function(){});
             */
            load: function (params) {

                var obj = {
                    url: '',
                    charset: 'utf-8',
                    document: window.document,
                    onload: function () { }
                };

                if ($.Object.isPlain(params)) {
                    $.Object.extend(obj, params);
                }
                else {
                    obj.url = params;

                    switch (typeof arguments[1]) {
                        case 'string':
                            obj.charset = arguments[1];
                            break;
                        case 'object':
                            obj.document = arguments[1];
                            break;
                        case 'function':
                            obj.onload = arguments[1];
                            break;
                    }

                    switch (typeof arguments[2]) {
                        case 'object':
                            obj.document = arguments[2];
                            break;
                        case 'function':
                            obj.onload = arguments[2];
                            break;
                    }

                    if (arguments[3]) {
                        obj.onload = arguments[3];
                    }
                }

                if ($.Object.isArray(obj.url)) {
                    loadBatch(obj.url, obj.charset, obj.document, obj.onload);
                }
                else if (typeof obj.url == 'string') {
                    loadSingle(obj.url, obj.charset, obj.document, obj.onload);
                }
                else {
                    throw new Error('参数 params.url 必须为 string 或 string 的数组');
                }
            },

            /**
             * 创建一个 script 标签，并插入 JavaScript 代码。
             * @param {string} params.code 要插入的 JS 代码。
             * @param {string} [params.id] 创建的 script 标签中的 id。
             * @param {Document} [params.document=window.document]
             创建的 script 标签的上下文环境的 document。默认为当前窗口的 document 对象。
             * @example
             $.Script.insert({
            code: 'alert(0);',
            id: 'myScript',
            document: document
        });
             $.Script.insert('alert(0);', 'myScript', document);
             $.Script.insert('alert(0);', 'myScript');
             $.Script.insert('alert(0);', document);
             */
            insert: function (params) {
                var obj = {
                    code: '',
                    id: '',
                    document: window.document
                };

                if ($.Object.isPlain(params)) {
                    $.Object.extend(obj, params);
                }
                else {
                    obj.code = params;

                    switch (typeof arguments[1]) {
                        case 'string':
                            obj.id = arguments[1];
                            break;
                        case 'object':
                            obj.document = arguments[1];
                            break;
                    }

                    if (arguments[2]) {
                        obj.document = arguments[2];
                    }
                }

                var script = obj.document.createElement('script');
                script.type = 'text/javascript';

                if (obj.id) {
                    script.id = obj.id;
                }

                try { // 标准，IE 除外
                    script.appendChild(obj.document.createTextNode(obj.code));
                }
                catch (ex) { // IE，但不限于 IE
                    script.text = obj.code;
                }

                obj.document.getElementsByTagName('head')[0].appendChild(script);
            },

            /**
             * 用 document.write 的方式加载 JS 文件。
             * @memberOf MiniQuery.Script
             * @param {string|Array} params.url
             要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
             * @param {string} [params.charset="utf-8"]
             要加载的 JS 文件的字符编码，默认为 utf-8。
             * @param {Document} [params.document=window.document]
             要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
             * @example
             $.Script.write({
            url: 'a.js',
            charset: 'utf-8',
            document: document
        });
             $.Script.write('a.js', 'utf-8', document);
             $.Script.write('a.js', 'utf-8');
             $.Script.write('a.js', document);
             */
            write: function (params) {
                var obj = {
                    url: '',
                    charset: '',
                    document: window.document
                };

                if ($.Object.isPlain(params)) {
                    $.Object.extend(obj, params);
                }
                else {
                    obj.url = params;
                    switch (typeof arguments[1]) {
                        case 'string':
                            obj.charset = arguments[1];
                            break;
                        case 'object':
                            obj.document = arguments[1];
                            break;
                    }

                    if (arguments[2]) {
                        obj.document = arguments[2];
                    }

                }

                if ($.Object.isArray(obj.url)) {
                    var urls = obj.url;
                    for (var i = 0, len = urls.length; i < len; i++) {
                        document_write(urls[i], obj.charset, obj.document);
                    }
                }
                else {
                    document_write(obj.url, obj.charset, obj.document);
                }
            }
        });





    })(MiniQuery, {});



    /**
     * XMLHttpRequest 类工具
     * @namespace
     */
    MiniQuery.Xhr = (function ($, This) {


        return $.extend(This, {  /**@lends MiniQuery.Xhr*/

            /**
             * 跨浏览器创建一个 XMLHttpRequest 对象。
             * 由于内存原因，不建议重用创建出来的 xhr 对象。
             */
            create: function () {

                //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
                var fn = window.XMLHttpRequest ? function () { //标准方法

                    return new XMLHttpRequest();

                } : window.ActiveXObject ? function () { //IE

                    var cache = arguments.callee;
                    var key = 'version';

                    if (!cache[key]) { //首次创建

                        var versions = [
                            'MSXML2.XMLHttp.6.0',
                            'MSXML2.XMLHttp.3.0',
                            'MSXML2.XMLHttp'
                        ];

                        for (var i = 0, len = versions.length; i < len; i++) {
                            try {
                                var xhr = new ActiveXObject(versions[i]);
                                cache[key] = versions[i];
                                return xhr;
                            }
                            catch (ex) { //跳过

                            }
                        }
                    }

                    return new ActiveXObject(cache[key]);

                } : function () {
                    throw new Error('没有可用的 XHR 对象');
                };


                This.create = fn;

                return fn();
            }
        });


    })(MiniQuery, {});


    /**
     * XML 工具类
     * @namespace
     */
    MiniQuery.Xml = (function ($, This) {


        /**
         * 针对 IE 创建最优版本的 XMLDocument 对象。
         * @inner
         */
        function createDocument() {
            var cache = arguments.callee;

            if (!cache['version']) { //首次创建
                var versions = [
                    'MSXML2.DOMDocument.6.0',
                    'MSXML2.DOMDocument.3.0',
                    'MSXML2.DOMDocument'
                ];

                for (var i = 0, len = versions.length; i < len; i++) {
                    try {
                        var xmldoc = new ActiveXObject(versions[i]);
                        cache['version'] = versions[i]; //缓存起来
                        return xmldoc;
                    }
                    catch (ex) { //跳过

                    }
                }
            }

            return new ActiveXObject(cache['version']);
        }


        /**
         * 解析一个 XML 节点的属性集合成一个键/值形式的 Object 对象。
         * 可以指定第二个参数是否为深层解析，即属性值中包含查询字符串编码时，可以进一步解析成对象。
         * @inner
         */
        function parseAttributes(node, deep) {

            var obj = {};
            var parseQueryString = $.Object.parseQueryString;

            //把类数组对象转成真正的数组
            $.Array(node.attributes).each(function (item, index) {

                if (item.specified) { //兼容性写法，过滤出自定义特性，可用于 HTML 节点的 attributes

                    var value = item.value;

                    if (deep && value.indexOf('=') > 0) { //深层次解码
                        obj[item.name] = parseQueryString(value);
                    }
                    else {
                        obj[item.name] = value;
                    }
                }

            });

            return obj;
        }

        /**
         * 跨浏览器解析 XML 数据(字符串)，返回一个 XMLDocument 对象。
         * @inner
         */
        function parseString(data) {
            var xmldoc = null;
            var impl = document.implementation;

            if (window.DOMParser) { //标准

                xmldoc = (new DOMParser()).parseFromString(data, 'text/xml');
                var errors = xmldoc.getElementsByTagName('parsererror');
                if (errors.length > 0) {
                    throw new Error('XML 解析错误: ' + errors[0].textContent);
                }
            }
            else if (impl.hasFeature('LS', '3.0')) { // DOM3

                var parser = impl.createLSParser(impl.MODE_SYNCHRONOUS, null);
                var input = impl.createInput();
                input.stringData = data;
                xmldoc = parser.parse(input); //如果解析错误，则抛出异常
            }
            else { // IE

                xmldoc = createDocument();
                xmldoc.loadXML(data);
                if (xmldoc.parseError.errorCode != 0) {
                    throw new Error('XML 解析错误: ' + xmldoc.parseError.reason);
                }
            }

            if (!xmldoc) {
                throw new Error('没有可用的 XML 解析器');
            }

            return xmldoc;
        }

        /**
         * 把一个 Object 对象转成等价的 XML 字符串。
         *
         * 注意：传入的 Object 对象中，简单属性表示该节点自身的属性；
         数组表示该节点的子节点集合；
         *       属性值只能是 string、number、boolean 三种值类型。
         * @inner
         */
        function Object_to_String(obj, name) {
            var fn = arguments.callee;

            if (!name) { //处理(重载) Object_to_String(obj) 的情况

                for (name in obj) {
                    return fn(obj[name], name);
                }

                throw new Error('参数 obj 中不包含任何成员');
            }


            //正常情况 Object_to_String(obj, name)

            var attributes = [];
            var children = [];

            for (var key in obj) {
                if ($.Object.isArray(obj[key])) { //处理子节点

                    $.Array.each(obj[key], function (child, index) {
                        children.push(fn(child, key));
                    });
                    continue;
                }

                //处理属性
                var type = typeof obj[key];
                if (type == 'string' || type == 'number' || type == 'boolean') {
                    var value = String(obj[key]).replace(/"/g, '\\"');
                    attributes.push($.String.format('{0}="{1}"', key, value));
                }
                else {
                    throw new Error('非法数据类型的属性值: ' + key);
                }
            }

            return $.String.format('<{name} {attributes}>{children}</{name}>', {
                name: name,
                attributes: attributes.join(' '),
                children: children.join(' \r\n')
            });
        }











//MiniQuery.Xml = 
        return $.extend(This, { /**@lends MiniQuery.Xml*/

            /**
             * 跨浏览器解析 XML 数据(字符串)或者一个等价结构的 Object 对象成一个 XMLDocument 对象。
             * @param {string|Object} data 要进行解析的 XML 数据，可以为字符串或等价结构的对象。
             * @return {XMLDocument} 返回一个 XMLDocument 对象。
             * @example
             <xmp>
             var data =
             '<Person num="2" code="0"> \
             <user id="1" name="micty" age="28"> \
             <book id="1" name="C++" price="100"></book> \
             <book id="2" name="C#.NET" price="256"></book> \
             <book id="3" name="JavaScript" price="218"></book> \
             </user> \
             <user id="2" name="solomon" age="25"> \
             <book id="1" name="CPP" price="100"></book> \
             <book id="2" name="Linux" price="156"></book> \
             </user> \
             </Person>';
             var xmldoc = $.XML.parse(data);
             console.dir(xmldoc);
             </xmp>
             */
            parse: function (data) {
                var string = '';
                if (typeof data == 'string') {
                    string = data;
                }
                else if (typeof data == 'object' && data) {
                    string = Object_to_String(data);
                }

                if (!string) {
                    throw new Error('非法的参数 data');
                }

                return parseString(string);
            },


            /**
             * 把一个 XMLDocument 对象或一个 XML 节点或一个 Object 对象解析成等价的 XML 字符串。
             * @param {Object} obj 要进行解析的对象。<br />
             * 注意：<br />
             *   传入的 Object 对象中，简单属性表示该节点自身的属性；<br />
             *   数组表示该节点的子节点集合；<br />
             *   属性值只能是 string、number、boolean 三种值类型。
             * @return 返回一个 XML 字符串。
             * @example
             var obj = {
            Person: {
                num: "2", code: "0",
                user: [
                    {
                        id: "1", name: "micty", age: "28",
                        book: [
                            { id: "1", name: "C++", price: "100" },
                            { id: "2", name: "C#.NET", price: "256" },
                            { id: "3", name: "JavaScript", price: "218" }
                        ]
                    },
                    {
                        id: "2", name: "solomon", age: "25",
                        book: [
                            { id: "1", name: "CPP", price: "100" },
                            { id: "2", name: "Linux", price: "156" }
                        ]
                    }
                ]
            }
        };
             var xml = $.XML.toString(obj);
             console.log(xml);
             得到：<xmp>
             xml = '
             <Person num="2" code="0"> \
             <user id="1" name="micty" age="28"> \
             <book id="1" name="C++" price="100"></book> \
             <book id="2" name="C#.NET" price="256"></book> \
             <book id="3" name="JavaScript" price="218"></book> \
             </user> \
             <user id="2" name="solomon" age="25"> \
             <book id="1" name="CPP" price="100"></book> \
             <book id="2" name="Linux" price="156"></book> \
             </user> \
             </Person>'     </xmp>
             */
            toString: function (obj) {
                if (!obj || typeof obj != 'object') {
                    return '';
                }

                if (obj.nodeName) { //传入的是 node 节点( XMLDocument 对象 或 XML 节点)

                    var node = obj; //换个名称更容易理解

                    if (window.XMLSerializer) { //标准
                        return (new XMLSerializer()).serializeToString(node);
                    }

                    if (document.implementation.hasFeature('LS', '3.0')) { // DOM3
                        return document.implementation.createLSSerializer().writeToString(node);
                    }

                    //IE
                    return node.xml;
                }

                //否则，使用标准的
                return Object_to_String(obj);

            },


            /**
             * 把一个 XML 字符串或 XMLDocument 对象或 XML 节点解析成等价结构的 Object 对象
             * @param {string|XMLDocument|XMLNode} node
             要进行解析的 XML 字符串或 XMLDocument 对象或 XML 节点。<br />
             注意：表示 XML 节点中的属性名不能跟直接子节点中的任何一个节点名相同。
             * @param {boolean} deep
             指示是否对节点值中进一步按查询字符串的解析成等价的对象。<br />
             如 "a=1&b=2&c=A%3D100%26B%3D200" 会被解析成对象 {a:1, b:2, c:{A:100, B:200}}
             * @return {Object} 返回一个等价的对象。<br />
             返回的 Object 对象中，属性表示该节点自身的属性；数组表示该节点的子节点集合。
             *@example
             <xmp>
             var xml = '
             <Person num="2" code="0"> \
             <user id="1" name="micty" age="28"> \
             <book id="1" name="C++" price="100"></book> \
             <book id="2" name="C#.NET" price="256"></book> \
             <book id="3" name="JavaScript" price="218"></book> \
             </user> \
             <user id="2" name="solomon" age="25"> \
             <book id="1" name="CPP" price="100"></book> \
             <book id="2" name="Linux" price="156"></book> \
             </user> \
             </Person>';
             </xmp>
             var obj = $.XML.toObject(xml);
             得到：
             obj = {
            Person: {
                num: "2", code: "0",
                user: [
                {
                    id: "1", name: "micty", age: "28",
                    book: [
                        { id: "1", name: "C++", price: "100" },
                        { id: "2", name: "C#.NET", price: "256" },
                        { id: "3", name: "JavaScript", price: "218" }
                    ]
                },
                {
                    id: "2", name: "solomon", age: "25",
                    book: [
                        { id: "1", name: "CPP", price: "100" },
                        { id: "2", name: "Linux", price: "156" }
                    ]
                }]
            }
        };
             */
            toObject: function (node, deep) {

                var fn = arguments.callee;  //引用自身，递归用到

                if (typeof node == 'string') { //传入的是 XML 的字符串
                    var data = node;
                    var xmlDoc = parseString(data); //把字符串解析成 XMLDocument 对象
                    return fn(xmlDoc, deep);
                }

                if (node && node.documentElement) { //传入的是 XMLDocument 对象
                    var xmlDoc = node;
                    var obj = {};
                    obj[xmlDoc.documentElement.nodeName] = fn(xmlDoc.documentElement, deep); //取根节点进行解析
                    return obj;
                }


                //以下处理的是 XML 节点的情况

                if (!node || !node.nodeName) {
                    throw new Error('参数 node 错误：非法的 XML 节点');
                }


                var obj = parseAttributes(node, deep); //把节点属性转成键值对 obj

                var childNodes = $.Array.parse(node.childNodes); //把类数组的子节点列表转成真正的数组

                //处理 <abc ...>xxx</abc> 这样的情况：obj.value = xxx;
                if (childNodes.length == 1) { //只有一个子节点
                    var leaf = childNodes[0];
                    if (leaf.nodeType == 3) { // TextNode 文本节点
                        obj['value'] = leaf.nodeValue; //增加一个默认字段 value
                        return obj;
                    }
                }

                //过虑出真正的元素节点。IE 中 node 节点 没有 children 属性，因此用 childNodes 是兼容的写法
                $.Array(childNodes).grep(function (item, index) {
                    return item.nodeType === 1; //元素节点

                }).each(function (child, index) {
                    var name = child.nodeName; //标签名，如 div

                    if (!obj[name]) { //同类标签名，汇合到同一个数组中
                        obj[name] = [];
                    }

                    obj[name].push(fn(child));
                });

                return obj;

            }

        }); //结束 return



    })(MiniQuery, {}); //结束 MiniQuery.XML 模块的定义







    /**
     * 当前运行窗口的 Url 工具类
     * @namespace
     */
    MiniQuery.Url.Current = (function (Url, window, location) {


        var slice = Array.prototype.slice;

        return {  /**@lends MiniQuery.Url.Current */

            /**
             * 获取当前窗口的 Url 的查询字符串中指定的键所对应的值。
             * @param {string} [key] 要检索的键。
             * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
             如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
             当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
             * @retun {string|Object|undefined} 返回一个查询字符串值。
             当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
             当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
             */
            getQueryString: function (key, ignoreCase) {

                var args = slice.call(arguments, 0);
                args = [location.href].concat(args);

                return Url.getQueryString.apply(null, args);
            },


            /**
             * 把当前窗口的 Url 和查询字符串组装成一个新的 Url。
             * @param {string|Object} key 要添加的查询字符串的键。
             当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
             * @param {string} [value] 要添加的查询字符串的值。
             * @retun {string} 返回组装后的新的 Url。
             */
            setQueryString: function (key, value) {

                var args = slice.call(arguments, 0);
                args = [location.href].concat(args);

                return Url.setQueryString.apply(null, args);
            },

            /**
             * 判断当前窗口的 Url 是否包含特定名称的查询字符串。
             * @param {string} [key] 要提取的查询字符串的键。
             * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
             如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
             当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
             * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
             */
            hasQueryString: function (key, ignoreCase) {

                var args = slice.call(arguments, 0);
                args = [location.href].concat(args);

                return Url.hasQueryString.apply(null, args);
            },


            /**
             * 监听当前窗口的 hash 变化，并触发一个回调函数。
             * @param {function} fn 当本窗口的 hash 发生变化时，要触发的回调函数。
             *   该回调函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
             *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
             *   如果 oldHash 不存在，则为 null。
             *   该回调函数内部的 this 指向当前窗口。
             * @example
             $.Url.Current.hashchange(function (newHash, oldHash) {
            console.log('new hash: ' + newHash);
            console.log('old hash: ' + oldHash);
            console.log(this === window); //true
        });
             */
            hashchange: function (fn) {

                var args = slice.call(arguments, 0);
                args = [window].concat(args);

                Url.hashchange.apply(null, args);
            },

            /**
             * 监听当前窗口 Url 的 Hash 变化，并触发相应的路由分支函数。
             * @param {Object} routes 路由分支函数。
             *   分支函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
             *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
             *   如果 oldHash 不存在，则为 null。
             *   分支函数内部的 this 指向监听的窗口。
             * @example
             $.Url.route({
            'abc': function () { },
            'user/': function(){},
            'user/1234': function () { }
        });
             */
            route: function (routes) {

                var args = slice.call(arguments, 0);
                args = [window].concat(args);

                Url.route.apply(null, args);
            }

        };


    })(MiniQuery.Url, window, document.location);


















    /**
     * 以安全的方式给 MiniQuery 使用一个新的命名空间。
     * 比如 MiniQuery.use('$')，则 global.$ 基本上等同于 global.MiniQuery；
     * 当 global 中未存在指定的命名空间或参数中指定了要全量覆盖时，则使用全量覆盖的方式，
     * 该方式会覆盖原来的命名空间，可能会造成成一些错误，不推荐使用；
     * 当 global 中已存在指定的命名空间时，则只拷贝不冲突的部分到该命名空间，
     * 该方式是最安全的方式，也是默认和推荐的方式。
     */
    MiniQuery.use = function (newNamespace, isOverried) {

        if (!global[newNamespace] || isOverried) { //未存在或明确指定了覆盖
            global[newNamespace] = MiniQuery; //全量覆盖
            return;
        }


        //已经存在，则拷贝不冲突的成员部分
        var obj = global[newNamespace];

        for (var key in MiniQuery) {
            if (!(key in obj)) //只拷贝不冲突的部分
            {
                obj[key] = MiniQuery[key];
            }
        }

    };


//暴露
    if (typeof exports != 'undefined') { // node.js

        if (typeof module != 'undefined' && module.exports) {
            exports = module.exports = MiniQuery;
        }
        exports.MiniQuery = MiniQuery;
    }
    else if (typeof define == 'function' && define.amd) { //amd
        define(function (require) {
            return MiniQuery;
        });
    }
    else { //browser
        global.MiniQuery = MiniQuery;
    }

})(
        typeof global == 'object' ? global : this, // 在 Node 中，全局对象是 global；其他环境是 this
    Array,
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String
    /*, undefined */
);
/*!
 * iScroll v5.1.2
 * ~ (c) 2008-2014 Matteo Spinelli
 * ~ http://cubiq.org/license
 */
(function (window, document, Math) {
    var rAF = window.requestAnimationFrame	||
        window.webkitRequestAnimationFrame	||
        window.mozRequestAnimationFrame		||
        window.oRequestAnimationFrame		||
        window.msRequestAnimationFrame		||
        function (callback) { window.setTimeout(callback, 1000 / 60); };

    var utils = (function () {
        var me = {};

        var _elementStyle = document.createElement('div').style;
        var _vendor = (function () {
            var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                transform,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                transform = vendors[i] + 'ransform';
                if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
            }

            return false;
        })();

        function _prefixStyle (style) {
            if ( _vendor === false ) return false;
            if ( _vendor === '' ) return style;
            return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
        }

        me.getTime = Date.now || function getTime () { return new Date().getTime(); };

        me.extend = function (target, obj) {
            for ( var i in obj ) {
                target[i] = obj[i];
            }
        };

        me.addEvent = function (el, type, fn, capture) {
            el.addEventListener(type, fn, !!capture);
        };

        me.removeEvent = function (el, type, fn, capture) {
            el.removeEventListener(type, fn, !!capture);
        };

        me.prefixPointerEvent = function (pointerEvent) {
            return window.MSPointerEvent ?
                'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
                pointerEvent;
        };

        me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
            var distance = current - start,
                speed = Math.abs(distance) / time,
                destination,
                duration;

            deceleration = deceleration === undefined ? 0.0006 : deceleration;

            destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
            duration = speed / deceleration;

            if ( destination < lowerMargin ) {
                destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
                distance = Math.abs(destination - current);
                duration = distance / speed;
            } else if ( destination > 0 ) {
                destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
                distance = Math.abs(current) + destination;
                duration = distance / speed;
            }

            return {
                destination: Math.round(destination),
                duration: duration
            };
        };

        var _transform = _prefixStyle('transform');

        me.extend(me, {
            hasTransform: _transform !== false,
            hasPerspective: _prefixStyle('perspective') in _elementStyle,
            hasTouch: 'ontouchstart' in window,
            hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
            hasTransition: _prefixStyle('transition') in _elementStyle
        });

        // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
        me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

        me.extend(me.style = {}, {
            transform: _transform,
            transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
            transitionDuration: _prefixStyle('transitionDuration'),
            transitionDelay: _prefixStyle('transitionDelay'),
            transformOrigin: _prefixStyle('transformOrigin')
        });

        me.hasClass = function (e, c) {
            var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
            return re.test(e.className);
        };

        me.addClass = function (e, c) {
            if ( me.hasClass(e, c) ) {
                return;
            }

            var newclass = e.className.split(' ');
            newclass.push(c);
            e.className = newclass.join(' ');
        };

        me.removeClass = function (e, c) {
            if ( !me.hasClass(e, c) ) {
                return;
            }

            var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
            e.className = e.className.replace(re, ' ');
        };

        me.offset = function (el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;

            // jshint -W084
            while (el = el.offsetParent) {
                left -= el.offsetLeft;
                top -= el.offsetTop;
            }
            // jshint +W084

            return {
                left: left,
                top: top
            };
        };

        me.preventDefaultException = function (el, exceptions) {
            for ( var i in exceptions ) {
                if ( exceptions[i].test(el[i]) ) {
                    return true;
                }
            }

            return false;
        };

        me.extend(me.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,

            mousedown: 2,
            mousemove: 2,
            mouseup: 2,

            pointerdown: 3,
            pointermove: 3,
            pointerup: 3,

            MSPointerDown: 3,
            MSPointerMove: 3,
            MSPointerUp: 3
        });

        me.extend(me.ease = {}, {
            quadratic: {
                style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fn: function (k) {
                    return k * ( 2 - k );
                }
            },
            circular: {
                style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                fn: function (k) {
                    return Math.sqrt( 1 - ( --k * k ) );
                }
            },
            back: {
                style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fn: function (k) {
                    var b = 4;
                    return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
                }
            },
            bounce: {
                style: '',
                fn: function (k) {
                    if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
                        return 7.5625 * k * k;
                    } else if ( k < ( 2 / 2.75 ) ) {
                        return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
                    } else if ( k < ( 2.5 / 2.75 ) ) {
                        return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
                    } else {
                        return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
                    }
                }
            },
            elastic: {
                style: '',
                fn: function (k) {
                    var f = 0.22,
                        e = 0.4;

                    if ( k === 0 ) { return 0; }
                    if ( k == 1 ) { return 1; }

                    return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
                }
            }
        });

        me.tap = function (e, eventName) {
            var ev = document.createEvent('Event');
            ev.initEvent(eventName, true, true);
            ev.pageX = e.pageX;
            ev.pageY = e.pageY;
            e.target.dispatchEvent(ev);
        };

        me.click = function (e) {
            var target = e.target,
                ev;

            if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent('click', true, true, e.view, 1,
                    target.screenX, target.screenY, target.clientX, target.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                    0, null);

                ev._constructed = true;
                target.dispatchEvent(ev);
            }
        };

        return me;
    })();

    function IScroll (el, options) {
        this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
        this.scroller = this.wrapper.children[0];
        this.scrollerStyle = this.scroller.style;		// cache style for better performance

        this.options = {
            resizeScrollbars: true,
            mouseWheelSpeed: 20,
            snapThreshold: 0.334,

            startX: 0,
            startY: 0,
            scrollY: true,
            directionLockThreshold: 5,
            momentum: true,

            bounce: true,
            bounceTime: 600,
            bounceEasing: '',

            preventDefault: true,
            preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

            HWCompositing: true,
            useTransition: true,
            useTransform: true,

            mouseWheel:true,
            interactiveScrollbars:true
        };

        for ( var i in options ) {
            this.options[i] = options[i];
        }

        // Normalize options
        this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

        this.options.useTransition = utils.hasTransition && this.options.useTransition;
        this.options.useTransform = utils.hasTransform && this.options.useTransform;

        this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

        // If you want eventPassthrough I have to lock one of the axes
        this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
        this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

        // With eventPassthrough we also need lockDirection mechanism
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

        this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

        this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

        if ( this.options.tap === true ) {
            this.options.tap = 'tap';
        }

        if ( this.options.shrinkScrollbars == 'scale' ) {
            this.options.useTransition = false;
        }

        this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

        if ( this.options.probeType == 3 ) {
            this.options.useTransition = false;	}

// INSERT POINT: NORMALIZATION

        // Some defaults
        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;
        this._events = {};

// INSERT POINT: DEFAULTS

        this._init();
        this.refresh();

        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();
    }

    IScroll.prototype = {
        version: '5.1.2',

        _init: function () {
            this._initEvents();

            if ( this.options.scrollbars || this.options.indicators ) {
                this._initIndicators();
            }

            if ( this.options.mouseWheel ) {
                this._initWheel();
            }

            if ( this.options.snap ) {
                this._initSnap();
            }

            if ( this.options.keyBindings ) {
                this._initKeys();
            }

// INSERT POINT: _init

        },

        destroy: function () {
            this._initEvents(true);

            this._execEvent('destroy');
        },

        _transitionEnd: function (e) {
            if ( e.target != this.scroller || !this.isInTransition ) {
                return;
            }

            this._transitionTime();
            if ( !this.resetPosition(this.options.bounceTime) ) {
                this.isInTransition = false;
                this._execEvent('scrollEnd');
            }
        },

        _start: function (e) {
            // React to left mouse button only
            if ( utils.eventType[e.type] != 1 ) {
                if ( e.button !== 0 ) {
                    return;
                }
            }

            if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
                return;
            }

            if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
                e.preventDefault();
            }

            var point = e.touches ? e.touches[0] : e,
                pos;

            this.initiated	= utils.eventType[e.type];
            this.moved		= false;
            this.distX		= 0;
            this.distY		= 0;
            this.directionX = 0;
            this.directionY = 0;
            this.directionLocked = 0;

            this._transitionTime();

            this.startTime = utils.getTime();

            if ( this.options.useTransition && this.isInTransition ) {
                this.isInTransition = false;
                pos = this.getComputedPosition();
                this._translate(Math.round(pos.x), Math.round(pos.y));
                this._execEvent('scrollEnd');
            } else if ( !this.options.useTransition && this.isAnimating ) {
                this.isAnimating = false;
                this._execEvent('scrollEnd');
            }

            this.startX    = this.x;
            this.startY    = this.y;
            this.absStartX = this.x;
            this.absStartY = this.y;
            this.pointX    = point.pageX;
            this.pointY    = point.pageY;

            this._execEvent('beforeScrollStart');
        },

        _move: function (e) {
            if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
                return;
            }

            if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
                e.preventDefault();
            }

            var point		= e.touches ? e.touches[0] : e,
                deltaX		= point.pageX - this.pointX,
                deltaY		= point.pageY - this.pointY,
                timestamp	= utils.getTime(),
                newX, newY,
                absDistX, absDistY;

            this.pointX		= point.pageX;
            this.pointY		= point.pageY;

            this.distX		+= deltaX;
            this.distY		+= deltaY;
            absDistX		= Math.abs(this.distX);
            absDistY		= Math.abs(this.distY);

            // We need to move at least 10 pixels for the scrolling to initiate
            if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
                return;
            }

            // If you are scrolling in one direction lock the other
            if ( !this.directionLocked && !this.options.freeScroll ) {
                if ( absDistX > absDistY + this.options.directionLockThreshold ) {
                    this.directionLocked = 'h';		// lock horizontally
                } else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
                    this.directionLocked = 'v';		// lock vertically
                } else {
                    this.directionLocked = 'n';		// no lock
                }
            }

            if ( this.directionLocked == 'h' ) {
                if ( this.options.eventPassthrough == 'vertical' ) {
                    e.preventDefault();
                } else if ( this.options.eventPassthrough == 'horizontal' ) {
                    this.initiated = false;
                    return;
                }

                deltaY = 0;
            } else if ( this.directionLocked == 'v' ) {
                if ( this.options.eventPassthrough == 'horizontal' ) {
                    e.preventDefault();
                } else if ( this.options.eventPassthrough == 'vertical' ) {
                    this.initiated = false;
                    return;
                }

                deltaX = 0;
            }

            deltaX = this.hasHorizontalScroll ? deltaX : 0;
            deltaY = this.hasVerticalScroll ? deltaY : 0;

            newX = this.x + deltaX;
            newY = this.y + deltaY;

            // Slow down if outside of the boundaries
            if ( newX > 0 || newX < this.maxScrollX ) {
                newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
            }
            if ( newY > 0 || newY < this.maxScrollY ) {
                newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
            }

            this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

            if ( !this.moved ) {
                this._execEvent('scrollStart');
            }

            this.moved = true;

            this._translate(newX, newY);

            /* REPLACE START: _move */
            if ( timestamp - this.startTime > 300 ) {
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y;

                if ( this.options.probeType == 1 ) {
                    this._execEvent('scroll');
                }
            }

            if ( this.options.probeType > 1 ) {
                this._execEvent('scroll');
            }
            /* REPLACE END: _move */

        },

        _end: function (e) {
            if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
                return;
            }

            if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
                e.preventDefault();
            }

            var point = e.changedTouches ? e.changedTouches[0] : e,
                momentumX,
                momentumY,
                duration = utils.getTime() - this.startTime,
                newX = Math.round(this.x),
                newY = Math.round(this.y),
                distanceX = Math.abs(newX - this.startX),
                distanceY = Math.abs(newY - this.startY),
                time = 0,
                easing = '';

            this.isInTransition = 0;
            this.initiated = 0;
            this.endTime = utils.getTime();

            this._execEvent('beforeScrollEnd'); //这行是我加的


            // reset if we are outside of the boundaries
            if ( this.resetPosition(this.options.bounceTime) ) {
                return;
            }

            this.scrollTo(newX, newY);	// ensures that the last position is rounded

            // we scrolled less than 10 pixels
            if ( !this.moved ) {
                if ( this.options.tap ) {
                    utils.tap(e, this.options.tap);
                }

                if ( this.options.click ) {
                    utils.click(e);
                }

                this._execEvent('scrollCancel');
                return;
            }

            if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
                this._execEvent('flick');
                return;
            }

            // start momentum animation if needed
            if ( this.options.momentum && duration < 300 ) {
                momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
                momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
                newX = momentumX.destination;
                newY = momentumY.destination;
                time = Math.max(momentumX.duration, momentumY.duration);
                this.isInTransition = 1;

                var that=this;
                setTimeout(function(){
                    that._execEvent('inertiaScrollEnd'); //这行是我加的hong
                },time);
            }


            if ( this.options.snap ) {
                var snap = this._nearestSnap(newX, newY);
                this.currentPage = snap;
                time = this.options.snapSpeed || Math.max(
                    Math.max(
                        Math.min(Math.abs(newX - snap.x), 1000),
                        Math.min(Math.abs(newY - snap.y), 1000)
                    ), 300);
                newX = snap.x;
                newY = snap.y;

                this.directionX = 0;
                this.directionY = 0;
                easing = this.options.bounceEasing;
            }

// INSERT POINT: _end


            if ( newX != this.x || newY != this.y ) {
                // change easing function when scroller goes out of the boundaries
                if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
                    easing = utils.ease.quadratic;
                }

                this.scrollTo(newX, newY, time, easing);

                return;
            }

            this._execEvent('scrollEnd');

        },

        _resize: function () {
            var that = this;

            clearTimeout(this.resizeTimeout);

            this.resizeTimeout = setTimeout(function () {
                that.refresh();
            }, this.options.resizePolling);
        },

        resetPosition: function (time) {
            var x = this.x,
                y = this.y;

            time = time || 0;

            if ( !this.hasHorizontalScroll || this.x > 0 ) {
                x = 0;
            } else if ( this.x < this.maxScrollX ) {
                x = this.maxScrollX;
            }

            if ( !this.hasVerticalScroll || this.y > 0 ) {
                y = 0;
            } else if ( this.y < this.maxScrollY ) {
                y = this.maxScrollY;
            }

            if ( x == this.x && y == this.y ) {
                return false;
            }

            if (!this.isWaitingForManualReset) { //指定了等待手动 reset
                this.scrollTo(x, y, time, this.options.bounceEasing);
            }

            return true;
        },

        disable: function () {
            this.enabled = false;
        },

        enable: function () {
            this.enabled = true;
        },

        refresh: function () {
            var rf = this.wrapper.offsetHeight;		// Force reflow

            this.wrapperWidth	= this.wrapper.clientWidth;
            this.wrapperHeight	= this.wrapper.clientHeight;

            /* REPLACE START: refresh */

            this.scrollerWidth	= this.scroller.offsetWidth;
            this.scrollerHeight	= this.scroller.offsetHeight;

            this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
            this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

            /* REPLACE END: refresh */

            this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
            this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

            if ( !this.hasHorizontalScroll ) {
                this.maxScrollX = 0;
                this.scrollerWidth = this.wrapperWidth;
            }

            if ( !this.hasVerticalScroll ) {
                this.maxScrollY = 0;
                this.scrollerHeight = this.wrapperHeight;
            }

            this.endTime = 0;
            this.directionX = 0;
            this.directionY = 0;

            this.wrapperOffset = utils.offset(this.wrapper);

            this._execEvent('refresh');

            this.resetPosition();

// INSERT POINT: _refresh

        },

        on: function (type, fn) {
            if ( !this._events[type] ) {
                this._events[type] = [];
            }

            this._events[type].push(fn);
        },

        off: function (type, fn) {
            if ( !this._events[type] ) {
                return;
            }

            var index = this._events[type].indexOf(fn);

            if ( index > -1 ) {
                this._events[type].splice(index, 1);
            }
        },

        _execEvent: function (type) {
            if ( !this._events[type] ) {
                return;
            }

            var i = 0,
                l = this._events[type].length;

            if ( !l ) {
                return;
            }

            for ( ; i < l; i++ ) {
                this._events[type][i].apply(this, [].slice.call(arguments, 1));
            }
        },

        scrollBy: function (x, y, time, easing) {
            x = this.x + x;
            y = this.y + y;
            time = time || 0;

            this.scrollTo(x, y, time, easing);
        },

        scrollTo: function (x, y, time, easing) {
            easing = easing || utils.ease.circular;

            this.isInTransition = this.options.useTransition && time > 0;

            if ( !time || (this.options.useTransition && easing.style) ) {
                this._transitionTimingFunction(easing.style);
                this._transitionTime(time);
                this._translate(x, y);
            } else {
                this._animate(x, y, time, easing.fn);
            }

        },

        scrollToElement: function (el, time, offsetX, offsetY, easing) {
            el = el.nodeType ? el : this.scroller.querySelector(el);

            if ( !el ) {
                return;
            }

            var pos = utils.offset(el);

            pos.left -= this.wrapperOffset.left;
            pos.top  -= this.wrapperOffset.top;

            // if offsetX/Y are true we center the element to the screen
            if ( offsetX === true ) {
                offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
            }
            if ( offsetY === true ) {
                offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
            }

            pos.left -= offsetX || 0;
            pos.top  -= offsetY || 0;

            pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
            pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

            time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

            this.scrollTo(pos.left, pos.top, time, easing);
        },

        _transitionTime: function (time) {
            time = time || 0;

            this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

            if ( !time && utils.isBadAndroid ) {
                this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
            }


            if ( this.indicators ) {
                for ( var i = this.indicators.length; i--; ) {
                    this.indicators[i].transitionTime(time);
                }
            }


// INSERT POINT: _transitionTime

        },

        _transitionTimingFunction: function (easing) {
            this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


            if ( this.indicators ) {
                for ( var i = this.indicators.length; i--; ) {
                    this.indicators[i].transitionTimingFunction(easing);
                }
            }


// INSERT POINT: _transitionTimingFunction

        },

        _translate: function (x, y) {
            if ( this.options.useTransform ) {

                /* REPLACE START: _translate */

                this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

                /* REPLACE END: _translate */

            } else {
                x = Math.round(x);
                y = Math.round(y);
                this.scrollerStyle.left = x + 'px';
                this.scrollerStyle.top = y + 'px';
            }

            this.x = x;
            this.y = y;


            if ( this.indicators ) {
                for ( var i = this.indicators.length; i--; ) {
                    this.indicators[i].updatePosition();
                }
            }


// INSERT POINT: _translate

        },

        _initEvents: function (remove) {
            var eventType = remove ? utils.removeEvent : utils.addEvent,
                target = this.options.bindToWrapper ? this.wrapper : window;

            eventType(window, 'orientationchange', this);
            eventType(window, 'resize', this);

            if ( this.options.click ) {
                eventType(this.wrapper, 'click', this, true);
            }

            if ( !this.options.disableMouse ) {
                eventType(this.wrapper, 'mousedown', this);
                eventType(target, 'mousemove', this);
                eventType(target, 'mousecancel', this);
                eventType(target, 'mouseup', this);
            }

            if ( utils.hasPointer && !this.options.disablePointer ) {
                eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
                eventType(target, utils.prefixPointerEvent('pointermove'), this);
                eventType(target, utils.prefixPointerEvent('pointercancel'), this);
                eventType(target, utils.prefixPointerEvent('pointerup'), this);
            }

            if ( utils.hasTouch && !this.options.disableTouch ) {
                eventType(this.wrapper, 'touchstart', this);
                eventType(target, 'touchmove', this);
                eventType(target, 'touchcancel', this);
                eventType(target, 'touchend', this);
            }

            eventType(this.scroller, 'transitionend', this);
            eventType(this.scroller, 'webkitTransitionEnd', this);
            eventType(this.scroller, 'oTransitionEnd', this);
            eventType(this.scroller, 'MSTransitionEnd', this);
        },

        getComputedPosition: function () {
            var matrix = window.getComputedStyle(this.scroller, null),
                x, y;

            if ( this.options.useTransform ) {
                matrix = matrix[utils.style.transform].split(')')[0].split(', ');
                x = +(matrix[12] || matrix[4]);
                y = +(matrix[13] || matrix[5]);
            } else {
                x = +matrix.left.replace(/[^-\d.]/g, '');
                y = +matrix.top.replace(/[^-\d.]/g, '');
            }

            return { x: x, y: y };
        },

        _initIndicators: function () {
            var interactive = this.options.interactiveScrollbars,
                customStyle = typeof this.options.scrollbars != 'string',
                indicators = [],
                indicator;

            var that = this;

            this.indicators = [];

            if ( this.options.scrollbars ) {
                // Vertical scrollbar
                if ( this.options.scrollY ) {
                    indicator = {
                        el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenX: false
                    };

                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }

                // Horizontal scrollbar
                if ( this.options.scrollX ) {
                    indicator = {
                        el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenY: false
                    };

                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }
            }

            if ( this.options.indicators ) {
                // TODO: check concat compatibility
                indicators = indicators.concat(this.options.indicators);
            }

            for ( var i = indicators.length; i--; ) {
                this.indicators.push( new Indicator(this, indicators[i]) );
            }

            // TODO: check if we can use array.map (wide compatibility and performance issues)
            function _indicatorsMap (fn) {
                for ( var i = that.indicators.length; i--; ) {
                    fn.call(that.indicators[i]);
                }
            }

            if ( this.options.fadeScrollbars ) {
                this.on('scrollEnd', function () {
                    _indicatorsMap(function () {
                        this.fade();
                    });
                });

                this.on('scrollCancel', function () {
                    _indicatorsMap(function () {
                        this.fade();
                    });
                });

                this.on('scrollStart', function () {
                    _indicatorsMap(function () {
                        this.fade(1);
                    });
                });

                this.on('beforeScrollStart', function () {
                    _indicatorsMap(function () {
                        this.fade(1, true);
                    });
                });
            }


            this.on('refresh', function () {
                _indicatorsMap(function () {
                    this.refresh();
                });
            });

            this.on('destroy', function () {
                _indicatorsMap(function () {
                    this.destroy();
                });

                delete this.indicators;
            });
        },

        _initWheel: function () {
            utils.addEvent(this.wrapper, 'wheel', this);
            utils.addEvent(this.wrapper, 'mousewheel', this);
            utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

            this.on('destroy', function () {
                utils.removeEvent(this.wrapper, 'wheel', this);
                utils.removeEvent(this.wrapper, 'mousewheel', this);
                utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
            });
        },

        _wheel: function (e) {
            if ( !this.enabled ) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var wheelDeltaX, wheelDeltaY,
                newX, newY,
                that = this;

            if ( this.wheelTimeout === undefined ) {
                that._execEvent('scrollStart');
            }

            // Execute the scrollEnd event after 400ms the wheel stopped scrolling
            clearTimeout(this.wheelTimeout);
            this.wheelTimeout = setTimeout(function () {
                that._execEvent('scrollEnd');
                that.wheelTimeout = undefined;
            }, 400);

            if ( 'deltaX' in e ) {
                wheelDeltaX = -e.deltaX;
                wheelDeltaY = -e.deltaY;
            } else if ( 'wheelDeltaX' in e ) {
                wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
            } else if ( 'wheelDelta' in e ) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
            } else if ( 'detail' in e ) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
            } else {
                return;
            }

            wheelDeltaX *= this.options.invertWheelDirection;
            wheelDeltaY *= this.options.invertWheelDirection;

            if ( !this.hasVerticalScroll ) {
                wheelDeltaX = wheelDeltaY;
                wheelDeltaY = 0;
            }

            if ( this.options.snap ) {
                newX = this.currentPage.pageX;
                newY = this.currentPage.pageY;

                if ( wheelDeltaX > 0 ) {
                    newX--;
                } else if ( wheelDeltaX < 0 ) {
                    newX++;
                }

                if ( wheelDeltaY > 0 ) {
                    newY--;
                } else if ( wheelDeltaY < 0 ) {
                    newY++;
                }

                this.goToPage(newX, newY);

                return;
            }

            newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
            newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

            if ( newX > 0 ) {
                newX = 0;
            } else if ( newX < this.maxScrollX ) {
                newX = this.maxScrollX;
            }

            if ( newY > 0 ) {
                newY = 0;
            } else if ( newY < this.maxScrollY ) {
                newY = this.maxScrollY;
            }

            this.scrollTo(newX, newY, 0);

            if ( this.options.probeType > 1 ) {
                this._execEvent('scroll');
            }

// INSERT POINT: _wheel
        },

        _initSnap: function () {
            this.currentPage = {};

            if ( typeof this.options.snap == 'string' ) {
                this.options.snap = this.scroller.querySelectorAll(this.options.snap);
            }

            this.on('refresh', function () {
                var i = 0, l,
                    m = 0, n,
                    cx, cy,
                    x = 0, y,
                    stepX = this.options.snapStepX || this.wrapperWidth,
                    stepY = this.options.snapStepY || this.wrapperHeight,
                    el;

                this.pages = [];

                if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
                    return;
                }

                if ( this.options.snap === true ) {
                    cx = Math.round( stepX / 2 );
                    cy = Math.round( stepY / 2 );

                    while ( x > -this.scrollerWidth ) {
                        this.pages[i] = [];
                        l = 0;
                        y = 0;

                        while ( y > -this.scrollerHeight ) {
                            this.pages[i][l] = {
                                x: Math.max(x, this.maxScrollX),
                                y: Math.max(y, this.maxScrollY),
                                width: stepX,
                                height: stepY,
                                cx: x - cx,
                                cy: y - cy
                            };

                            y -= stepY;
                            l++;
                        }

                        x -= stepX;
                        i++;
                    }
                } else {
                    el = this.options.snap;
                    l = el.length;
                    n = -1;

                    for ( ; i < l; i++ ) {
                        if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
                            m = 0;
                            n++;
                        }

                        if ( !this.pages[m] ) {
                            this.pages[m] = [];
                        }

                        x = Math.max(-el[i].offsetLeft, this.maxScrollX);
                        y = Math.max(-el[i].offsetTop, this.maxScrollY);
                        cx = x - Math.round(el[i].offsetWidth / 2);
                        cy = y - Math.round(el[i].offsetHeight / 2);

                        this.pages[m][n] = {
                            x: x,
                            y: y,
                            width: el[i].offsetWidth,
                            height: el[i].offsetHeight,
                            cx: cx,
                            cy: cy
                        };

                        if ( x > this.maxScrollX ) {
                            m++;
                        }
                    }
                }

                this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

                // Update snap threshold if needed
                if ( this.options.snapThreshold % 1 === 0 ) {
                    this.snapThresholdX = this.options.snapThreshold;
                    this.snapThresholdY = this.options.snapThreshold;
                } else {
                    this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
                    this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
                }
            });

            this.on('flick', function () {
                var time = this.options.snapSpeed || Math.max(
                    Math.max(
                        Math.min(Math.abs(this.x - this.startX), 1000),
                        Math.min(Math.abs(this.y - this.startY), 1000)
                    ), 300);

                this.goToPage(
                        this.currentPage.pageX + this.directionX,
                        this.currentPage.pageY + this.directionY,
                    time
                );
            });
        },

        _nearestSnap: function (x, y) {
            if ( !this.pages.length ) {
                return { x: 0, y: 0, pageX: 0, pageY: 0 };
            }

            var i = 0,
                l = this.pages.length,
                m = 0;

            // Check if we exceeded the snap threshold
            if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
                Math.abs(y - this.absStartY) < this.snapThresholdY ) {
                return this.currentPage;
            }

            if ( x > 0 ) {
                x = 0;
            } else if ( x < this.maxScrollX ) {
                x = this.maxScrollX;
            }

            if ( y > 0 ) {
                y = 0;
            } else if ( y < this.maxScrollY ) {
                y = this.maxScrollY;
            }

            for ( ; i < l; i++ ) {
                if ( x >= this.pages[i][0].cx ) {
                    x = this.pages[i][0].x;
                    break;
                }
            }

            l = this.pages[i].length;

            for ( ; m < l; m++ ) {
                if ( y >= this.pages[0][m].cy ) {
                    y = this.pages[0][m].y;
                    break;
                }
            }

            if ( i == this.currentPage.pageX ) {
                i += this.directionX;

                if ( i < 0 ) {
                    i = 0;
                } else if ( i >= this.pages.length ) {
                    i = this.pages.length - 1;
                }

                x = this.pages[i][0].x;
            }

            if ( m == this.currentPage.pageY ) {
                m += this.directionY;

                if ( m < 0 ) {
                    m = 0;
                } else if ( m >= this.pages[0].length ) {
                    m = this.pages[0].length - 1;
                }

                y = this.pages[0][m].y;
            }

            return {
                x: x,
                y: y,
                pageX: i,
                pageY: m
            };
        },

        goToPage: function (x, y, time, easing) {
            easing = easing || this.options.bounceEasing;

            if ( x >= this.pages.length ) {
                x = this.pages.length - 1;
            } else if ( x < 0 ) {
                x = 0;
            }

            if ( y >= this.pages[x].length ) {
                y = this.pages[x].length - 1;
            } else if ( y < 0 ) {
                y = 0;
            }

            var posX = this.pages[x][y].x,
                posY = this.pages[x][y].y;

            time = time === undefined ? this.options.snapSpeed || Math.max(
                Math.max(
                    Math.min(Math.abs(posX - this.x), 1000),
                    Math.min(Math.abs(posY - this.y), 1000)
                ), 300) : time;

            this.currentPage = {
                x: posX,
                y: posY,
                pageX: x,
                pageY: y
            };

            this.scrollTo(posX, posY, time, easing);
        },

        next: function (time, easing) {
            var x = this.currentPage.pageX,
                y = this.currentPage.pageY;

            x++;

            if ( x >= this.pages.length && this.hasVerticalScroll ) {
                x = 0;
                y++;
            }

            this.goToPage(x, y, time, easing);
        },

        prev: function (time, easing) {
            var x = this.currentPage.pageX,
                y = this.currentPage.pageY;

            x--;

            if ( x < 0 && this.hasVerticalScroll ) {
                x = 0;
                y--;
            }

            this.goToPage(x, y, time, easing);
        },

        _initKeys: function (e) {
            // default key bindings
            var keys = {
                pageUp: 33,
                pageDown: 34,
                end: 35,
                home: 36,
                left: 37,
                up: 38,
                right: 39,
                down: 40
            };
            var i;

            // if you give me characters I give you keycode
            if ( typeof this.options.keyBindings == 'object' ) {
                for ( i in this.options.keyBindings ) {
                    if ( typeof this.options.keyBindings[i] == 'string' ) {
                        this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
                    }
                }
            } else {
                this.options.keyBindings = {};
            }

            for ( i in keys ) {
                this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
            }

            utils.addEvent(window, 'keydown', this);

            this.on('destroy', function () {
                utils.removeEvent(window, 'keydown', this);
            });
        },

        _key: function (e) {
            if ( !this.enabled ) {
                return;
            }

            var snap = this.options.snap,	// we are using this alot, better to cache it
                newX = snap ? this.currentPage.pageX : this.x,
                newY = snap ? this.currentPage.pageY : this.y,
                now = utils.getTime(),
                prevTime = this.keyTime || 0,
                acceleration = 0.250,
                pos;

            if ( this.options.useTransition && this.isInTransition ) {
                pos = this.getComputedPosition();

                this._translate(Math.round(pos.x), Math.round(pos.y));
                this.isInTransition = false;
            }

            this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

            switch ( e.keyCode ) {
                case this.options.keyBindings.pageUp:
                    if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
                        newX += snap ? 1 : this.wrapperWidth;
                    } else {
                        newY += snap ? 1 : this.wrapperHeight;
                    }
                    break;
                case this.options.keyBindings.pageDown:
                    if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
                        newX -= snap ? 1 : this.wrapperWidth;
                    } else {
                        newY -= snap ? 1 : this.wrapperHeight;
                    }
                    break;
                case this.options.keyBindings.end:
                    newX = snap ? this.pages.length-1 : this.maxScrollX;
                    newY = snap ? this.pages[0].length-1 : this.maxScrollY;
                    break;
                case this.options.keyBindings.home:
                    newX = 0;
                    newY = 0;
                    break;
                case this.options.keyBindings.left:
                    newX += snap ? -1 : 5 + this.keyAcceleration>>0;
                    break;
                case this.options.keyBindings.up:
                    newY += snap ? 1 : 5 + this.keyAcceleration>>0;
                    break;
                case this.options.keyBindings.right:
                    newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
                    break;
                case this.options.keyBindings.down:
                    newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
                    break;
                default:
                    return;
            }

            if ( snap ) {
                this.goToPage(newX, newY);
                return;
            }

            if ( newX > 0 ) {
                newX = 0;
                this.keyAcceleration = 0;
            } else if ( newX < this.maxScrollX ) {
                newX = this.maxScrollX;
                this.keyAcceleration = 0;
            }

            if ( newY > 0 ) {
                newY = 0;
                this.keyAcceleration = 0;
            } else if ( newY < this.maxScrollY ) {
                newY = this.maxScrollY;
                this.keyAcceleration = 0;
            }

            this.scrollTo(newX, newY, 0);

            this.keyTime = now;
        },

        _animate: function (destX, destY, duration, easingFn) {
            var that = this,
                startX = this.x,
                startY = this.y,
                startTime = utils.getTime(),
                destTime = startTime + duration;

            function step () {
                var now = utils.getTime(),
                    newX, newY,
                    easing;

                if ( now >= destTime ) {
                    that.isAnimating = false;
                    that._translate(destX, destY);

                    if ( !that.resetPosition(that.options.bounceTime) ) {
                        that._execEvent('scrollEnd');
                    }

                    return;
                }

                now = ( now - startTime ) / duration;
                easing = easingFn(now);
                newX = ( destX - startX ) * easing + startX;
                newY = ( destY - startY ) * easing + startY;
                that._translate(newX, newY);

                if ( that.isAnimating ) {
                    rAF(step);
                }

                if ( that.options.probeType == 3 ) {
                    that._execEvent('scroll');
                }
            }

            this.isAnimating = true;
            step();
        },

        handleEvent: function (e) {
            switch ( e.type ) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this._resize();
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    this._transitionEnd(e);
                    break;
                case 'wheel':
                case 'DOMMouseScroll':
                case 'mousewheel':
                    this._wheel(e);
                    break;
                case 'keydown':
                    this._key(e);
                    break;
                case 'click':
                    if ( !e._constructed ) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;
            }
        }
    };
    function createDefaultScrollbar (direction, interactive, type) {
        var scrollbar = document.createElement('div'),
            indicator = document.createElement('div');

        if ( type === true ) {
            scrollbar.style.cssText = 'position:absolute;z-index:9999';
            indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
        }

        indicator.className = 'iScrollIndicator';

        if ( direction == 'h' ) {
            if ( type === true ) {
                scrollbar.style.cssText += ';height:0.14rem;left:0.04rem;right:0.04rem;bottom:0';
                indicator.style.height = '100%';
            }
            scrollbar.className = 'iScrollHorizontalScrollbar';
        } else {
            if ( type === true ) {
                scrollbar.style.cssText += ';width:0.14rem;bottom:0.04rem;top:0.04rem;right:0.02rem';
                indicator.style.width = '100%';
            }
            scrollbar.className = 'iScrollVerticalScrollbar';
        }

        scrollbar.style.cssText += ';overflow:hidden';

        if ( !interactive ) {
            scrollbar.style.pointerEvents = 'none';
        }

        scrollbar.appendChild(indicator);

        return scrollbar;
    }

    function Indicator (scroller, options) {
        this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
        this.wrapperStyle = this.wrapper.style;
        this.indicator = this.wrapper.children[0];
        this.indicatorStyle = this.indicator.style;
        this.scroller = scroller;

        this.options = {
            listenX: true,
            listenY: true,
            interactive: false,
            resize: true,
            defaultScrollbars: false,
            shrink: false,
            fade: false,
            speedRatioX: 0,
            speedRatioY: 0
        };

        for ( var i in options ) {
            this.options[i] = options[i];
        }

        this.sizeRatioX = 1;
        this.sizeRatioY = 1;
        this.maxPosX = 0;
        this.maxPosY = 0;

        if ( this.options.interactive ) {
            if ( !this.options.disableTouch ) {
                utils.addEvent(this.indicator, 'touchstart', this);
                utils.addEvent(window, 'touchend', this);
            }
            if ( !this.options.disablePointer ) {
                utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
            }
            if ( !this.options.disableMouse ) {
                utils.addEvent(this.indicator, 'mousedown', this);
                utils.addEvent(window, 'mouseup', this);
            }
        }

        if ( this.options.fade ) {
            this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
            this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
            this.wrapperStyle.opacity = '0';
        }
    }

    Indicator.prototype = {
        handleEvent: function (e) {
            switch ( e.type ) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
            }
        },

        destroy: function () {
            if ( this.options.interactive ) {
                utils.removeEvent(this.indicator, 'touchstart', this);
                utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.removeEvent(this.indicator, 'mousedown', this);

                utils.removeEvent(window, 'touchmove', this);
                utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                utils.removeEvent(window, 'mousemove', this);

                utils.removeEvent(window, 'touchend', this);
                utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
                utils.removeEvent(window, 'mouseup', this);
            }

            if ( this.options.defaultScrollbars ) {
                this.wrapper.parentNode.removeChild(this.wrapper);
            }
        },

        _start: function (e) {
            var point = e.touches ? e.touches[0] : e;

            e.preventDefault();
            e.stopPropagation();

            this.transitionTime();

            this.initiated = true;
            this.moved = false;
            this.lastPointX	= point.pageX;
            this.lastPointY	= point.pageY;

            this.startTime	= utils.getTime();

            if ( !this.options.disableTouch ) {
                utils.addEvent(window, 'touchmove', this);
            }
            if ( !this.options.disablePointer ) {
                utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
            }
            if ( !this.options.disableMouse ) {
                utils.addEvent(window, 'mousemove', this);
            }

            this.scroller._execEvent('beforeScrollStart');
        },

        _move: function (e) {
            var point = e.touches ? e.touches[0] : e,
                deltaX, deltaY,
                newX, newY,
                timestamp = utils.getTime();

            if ( !this.moved ) {
                this.scroller._execEvent('scrollStart');
            }

            this.moved = true;

            deltaX = point.pageX - this.lastPointX;
            this.lastPointX = point.pageX;

            deltaY = point.pageY - this.lastPointY;
            this.lastPointY = point.pageY;

            newX = this.x + deltaX;
            newY = this.y + deltaY;

            this._pos(newX, newY);


            if ( this.scroller.options.probeType == 1 && timestamp - this.startTime > 300 ) {
                this.startTime = timestamp;
                this.scroller._execEvent('scroll');
            } else if ( this.scroller.options.probeType > 1 ) {
                this.scroller._execEvent('scroll');
            }


// INSERT POINT: indicator._move

            e.preventDefault();
            e.stopPropagation();
        },

        _end: function (e) {
            if ( !this.initiated ) {
                return;
            }

            this.initiated = false;

            e.preventDefault();
            e.stopPropagation();

            utils.removeEvent(window, 'touchmove', this);
            utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
            utils.removeEvent(window, 'mousemove', this);

            if ( this.scroller.options.snap ) {
                var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

                var time = this.options.snapSpeed || Math.max(
                    Math.max(
                        Math.min(Math.abs(this.scroller.x - snap.x), 1000),
                        Math.min(Math.abs(this.scroller.y - snap.y), 1000)
                    ), 300);

                if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
                    this.scroller.directionX = 0;
                    this.scroller.directionY = 0;
                    this.scroller.currentPage = snap;
                    this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
                }
            }

            if ( this.moved ) {
                this.scroller._execEvent('scrollEnd');
            }
        },

        transitionTime: function (time) {
            time = time || 0;
            this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

            if ( !time && utils.isBadAndroid ) {
                this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
            }
        },

        transitionTimingFunction: function (easing) {
            this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
        },

        refresh: function () {
            this.transitionTime();

            if ( this.options.listenX && !this.options.listenY ) {
                this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
            } else if ( this.options.listenY && !this.options.listenX ) {
                this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
            } else {
                this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
            }

            if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
                utils.addClass(this.wrapper, 'iScrollBothScrollbars');
                utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

                if ( this.options.defaultScrollbars && this.options.customStyle ) {
                    if ( this.options.listenX ) {
                        this.wrapper.style.right = '0.16rem';
                    } else {
                        this.wrapper.style.bottom = '0.16rem';
                    }
                }
            } else {
                utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
                utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

                if ( this.options.defaultScrollbars && this.options.customStyle ) {
                    if ( this.options.listenX ) {
                        this.wrapper.style.right = '0.04rem';
                    } else {
                        this.wrapper.style.bottom = '0.04rem';
                    }
                }
            }

            var r = this.wrapper.offsetHeight;	// force refresh

            if ( this.options.listenX ) {
                this.wrapperWidth = this.wrapper.clientWidth;
                if ( this.options.resize ) {
                    this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
                    this.indicatorStyle.width = this.indicatorWidth + 'px';
                } else {
                    this.indicatorWidth = this.indicator.clientWidth;
                }

                this.maxPosX = this.wrapperWidth - this.indicatorWidth;

                if ( this.options.shrink == 'clip' ) {
                    this.minBoundaryX = -this.indicatorWidth + 8;
                    this.maxBoundaryX = this.wrapperWidth - 8;
                } else {
                    this.minBoundaryX = 0;
                    this.maxBoundaryX = this.maxPosX;
                }

                this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
            }

            if ( this.options.listenY ) {
                this.wrapperHeight = this.wrapper.clientHeight;
                if ( this.options.resize ) {
                    this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
                    this.indicatorStyle.height = this.indicatorHeight + 'px';
                } else {
                    this.indicatorHeight = this.indicator.clientHeight;
                }

                this.maxPosY = this.wrapperHeight - this.indicatorHeight;

                if ( this.options.shrink == 'clip' ) {
                    this.minBoundaryY = -this.indicatorHeight + 8;
                    this.maxBoundaryY = this.wrapperHeight - 8;
                } else {
                    this.minBoundaryY = 0;
                    this.maxBoundaryY = this.maxPosY;
                }

                this.maxPosY = this.wrapperHeight - this.indicatorHeight;
                this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
            }

            this.updatePosition();
        },

        updatePosition: function () {
            var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
                y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

            if ( !this.options.ignoreBoundaries ) {
                if ( x < this.minBoundaryX ) {
                    if ( this.options.shrink == 'scale' ) {
                        this.width = Math.max(this.indicatorWidth + x, 8);
                        this.indicatorStyle.width = this.width + 'px';
                    }
                    x = this.minBoundaryX;
                } else if ( x > this.maxBoundaryX ) {
                    if ( this.options.shrink == 'scale' ) {
                        this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
                        this.indicatorStyle.width = this.width + 'px';
                        x = this.maxPosX + this.indicatorWidth - this.width;
                    } else {
                        x = this.maxBoundaryX;
                    }
                } else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
                    this.width = this.indicatorWidth;
                    this.indicatorStyle.width = this.width + 'px';
                }

                if ( y < this.minBoundaryY ) {
                    if ( this.options.shrink == 'scale' ) {
                        this.height = Math.max(this.indicatorHeight + y * 3, 8);
                        this.indicatorStyle.height = this.height + 'px';
                    }
                    y = this.minBoundaryY;
                } else if ( y > this.maxBoundaryY ) {
                    if ( this.options.shrink == 'scale' ) {
                        this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
                        this.indicatorStyle.height = this.height + 'px';
                        y = this.maxPosY + this.indicatorHeight - this.height;
                    } else {
                        y = this.maxBoundaryY;
                    }
                } else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
                    this.height = this.indicatorHeight;
                    this.indicatorStyle.height = this.height + 'px';
                }
            }

            this.x = x;
            this.y = y;

            if ( this.scroller.options.useTransform ) {
                this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
            } else {
                this.indicatorStyle.left = x + 'px';
                this.indicatorStyle.top = y + 'px';
            }
        },

        _pos: function (x, y) {
            if ( x < 0 ) {
                x = 0;
            } else if ( x > this.maxPosX ) {
                x = this.maxPosX;
            }

            if ( y < 0 ) {
                y = 0;
            } else if ( y > this.maxPosY ) {
                y = this.maxPosY;
            }

            x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
            y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

            this.scroller.scrollTo(x, y);
        },

        fade: function (val, hold) {
            if ( hold && !this.visible ) {
                return;
            }

            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;

            var time = val ? 250 : 500,
                delay = val ? 0 : 300;

            val = val ? '1' : '0';

            this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

            this.fadeTimeout = setTimeout((function (val) {
                this.wrapperStyle.opacity = val;
                this.visible = +val;
            }).bind(this, val), delay);
        }
    };

    IScroll.utils = utils;

    if ( typeof module != 'undefined' && module.exports ) {
        module.exports = IScroll;
    } else {
        window.IScroll = IScroll;
    }

})(window, document, Math);

;
(function (global, Array, Boolean, Date, Error, Function, Math, Number, Object, RegExp, String, undefined) {


    MiniQuery.use('$');

    var MD5 = (function () {


        /*md5 生成算法*/
        var hexcase = 0;
        var chrsz = 8;


        function core_md5(x, len) {
            x[len >> 5] |= 0x80 << ((len) % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;

                a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return Array(a, b, c, d);
        }

        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
        }

        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        function str2binl(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
            }
            return bin;
        }

        function binl2hex(binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
            }
            return str;
        }


        return {

            //md5加密主方法
            encrypt: function (s) {

                if (arguments.length > 1) {
                    s = Array.prototype.slice.call(arguments, 0).join('');
                }

                return binl2hex(core_md5(str2binl(s), s.length * chrsz));
            }

        };


    })();


    var ServerConfig = (function () {


        var cache = (function () {

            var key = '__ServerConfig__';
            var storage = window.sessionStorage;

            return function (data) {

                //return null;

                if (arguments.length == 0) { //get
                    data = storage.getItem(key);
                    data = $.Object.parseJson(data);
                    return data;
                }
                else { //set
                    data = $.Object.toJson(data);
                    storage.setItem(key, data);
                }

            };

        })();


        function GetQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                var qstr = r[2];
                if (qstr == "null") {
                    qstr = "";
                }
                return qstr;
            }
            return "";
        }

        var eid = GetQueryString('eid');
        var keyv = "wdhlogininfo" + eid;
        var appParam = {};
        if (window.localStorage) {
            var storage = window.localStorage;
            var objstr = storage.getItem(keyv);
            appParam = JSON.parse(objstr) || {};
        }
        var isdebug = appParam.isdebug || '';
        if (isdebug != 2) {
            isdebug = GetQueryString("isdebug") || '';
        }

        function ajax(fn) {

            var url = 'http://mob.cmcloud.cn/kisplus/kisplusconfig.aspx?callback=?';
            //var url = 'http://mob.cmcloud.cn/kisplus/kisplusconfig_test.aspx?callback=?';

            $.getJSON(url, function (json) {

                var data = null;
                try {

                    var host = json['kisplusServerS'];
                    var path = json['kisplusAppsecret'];
                    //isdebug =2 表示走旗舰版4.2的测试环境
                    host = isdebug == 2 ? (host + ':8080') : host;
                    data = {
                        version: json['ver'],
                        fromTag: json['fromtag'],
                        key: json['AccKey'],
                        secret: json['AccSecret'],
                        host: host,
                        path: path,
                        route: json['kisplusApiRouter'],
                        url: host + path,
                    };

                }
                catch (ex) {
                    data = null;
                }

                console.log('ServerConfig (ajax):');
                console.dir(data);

                fn && fn(data);
            });
        }


        function get(fn) {

            var data = cache();
            if (data) {
                console.log('ServerConfig (cache):');
                console.dir(data);
                fn && fn(data);
                return;
            }


            ajax(function (data) {
                cache(data);
                fn && fn(data);
            });
        }


        return {
            get: get
        };


    })();


    var ServerUrl = (function (ServerConfig, MD5) {


        var Cache = (function () {

            var key = '__ServerUrl__';
            //var storage = window.localStorage;
            var storage = window.sessionStorage;

            var all = storage.getItem(key);
            all = all ? $.Object.parseJson(all) || {} : {};


            function get(eid) {
                //return null;
                return all[eid];
            }

            function set(eid, data) {
                all[eid] = data;

                var json = $.Object.toJson(all);
                storage.setItem(key, json);
            }

            function remove(eid) {
                if (eid) { //指定了 eid, 则移除该项
                    if (eid in all) {
                        delete all[eid];
                        var json = $.Object.toJson(all);
                        storage.setItem(key, json);
                    }
                }
                else { //否则全部移除
                    all = {};
                    storage.setItem(key, '{}');
                }
            }

            return {
                get: get,
                set: set,
                remove: remove
            };

        })();


        function ajax(config, fnSucess, fnFail, fnError) {

            config = config || {
                eid: '',
                appid: '',
                secret: '',
                key: '',
                url: ''
            };

            var eid = config['eid'];
            var timestamp = $.Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var random = $.String.random(16); //16位随机数
            var data = {
                'EID': eid,
                'NetID': -1,
                'AppID': config['appid'],
                'AccKey': config['key'],
                'Timestamp': timestamp,
                'State': random,
                'Sign': MD5.encrypt(eid, config['secret'], timestamp, random)
            };

            var url = config['url'] + '?callback=?';
            $.getJSON(url, data, function (json) {

                if (json) {

                    var code = json['Result'];
                    var data = {};
                    if (code == 302) {
                        //4.2产品多实例
                        var item = json['NetIDList'][0];
                        data = {
                            url: item['ServerUrl'],
                            secret: item['AppSecret'],
                            NetID: item['NetID']
                        };
                        try {
                            window.kis$NetID = item['NetID'];
                        } catch (e) {
                        }
                        fnSucess && fnSucess(data, json);
                    }
                    else if (code == 200) {
                        data = {
                            url: json['ServerUrl'],
                            secret: json['AppSecret'],
                            NetID: json['NetID']
                        };
                        try {
                            window.kis$NetID = json['NetID'];
                        } catch (e) {
                        }
                        fnSucess && fnSucess(data, json);
                    }
                    else {
                        fnFail && fnFail(code, json['ErrMsg'], json);
                    }

                }
                else {
                    fnError && fnError();
                }

            });
        }


        function get(config, fnSucess, fnFail, fnError) {

            config = config || {
                eid: '',
                appid: ''
            };

            var eid = config['eid'];

            var data = Cache.get(eid);

            if (data) {
                //console.log('ServerUrl (cache):');
                //console.dir(data);
                fnSucess && fnSucess(data);
                try{
                    window.kis$NetID = data['NetID'];
                }catch(e){}
                return;
            }


            ServerConfig.get(function (server) {

                if (!server) {
                    fnError && fnError();
                    return;
                }


                ajax({
                    eid: eid,
                    appid: config['appid'],

                    secret: server['secret'],
                    key: server['key'],
                    url: server['url']

                }, function (data, json) { //成功

                    var url = data['url'] || '';
                    if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
                        url = url + server['route'];
                    }
                    else {
                        url = 'http://' + url + server['route'];
                    }

                    var obj = {
                        secret: data['secret'],
                        version: server['version'],
                        fromTag: server['fromTag'],
                        url: url,
                        NetID: data['NetID'],
                        //url: 'http://xx.oo.com/Webapi/Router',
                    };

                    Cache.set(eid, obj);

                    fnSucess && fnSucess(obj, json);

                }, fnFail, fnError);

            });
        }


        return {
            get: get,
            removeCache: Cache.remove
        };


    })(ServerConfig, MD5);


    var API = (function (ServerUrl, MD5) {


        function parseJSON(data) {

            try {
                return window.JSON.parse(data);
            }
            catch (ex) {
                try {
                    data = data.replace(/^(\r\n)+/g, '');
                    return (new Function('return ' + data))();
                }
                catch (ex) {
                    return null;
                }
            }

            return null;

        }


        function ajax(config, fnSuccess, fnFail, fnError) {

            config = config || {
                name: '',
                eid: '',
                secret: '',
                version: '',
                fromTag: '',
                url: '',
                openid: '',
                appid: '',

                pubacckey: '',
                timestamp: '',
                nonce: '',
                pubaccid: '',

                data: {}
            };


            var eid = config['eid'];
            var name = config['name'];

            var timestamp = $.Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var random = $.String.random(16); //16位随机数
            var data = {
                'EID': eid,
                'Method': name,
                'Timestamp': timestamp,
                'Ver': config['version'],
                'FromTag': config['fromTag'],
                'AppID': config['appid'],
                'IsNewJson': 'Y',
                'IsEncrypt': 'N',
                //签名，值为md5(EID + AppSecret + Method + Timetamp + State )
                'Sign': MD5.encrypt(eid, config['secret'], name, timestamp, random),
                'State': random,
                'CustData': encodeURIComponent($.Object.toJson(config['data']))
            };


            var url = $.Url.setQueryString(config['url'], {
                eid: eid,
                openid: config['openid'],

                pubacckey: config['pubacckey'],
                timestamp: config['timestamp'],
                nonce: config['nonce'],
                pubaccid: config['pubaccid'],
                NetID: config['NetID']
            });

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);


            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var json = parseJSON(xhr.responseText);
                        if (!json) {
                            fnError && fnError();
                            return;
                        }
                        var code = json['Result'];
                        if (code == 200) {
                            fnSuccess && fnSuccess(json['DataJson'] || {}, json);
                        }
                        else {
                            fnFail && fnFail(code, json['ErrMsg'], json);
                        }
                    }
                    else {
                        fnError && fnError(xhr.status + ':' + xhr.statusText);
                    }
                }
            };


            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            data = $.Object.toQueryString(data);
            xhr.send(data);

        }


        function post(config, fnSuccess, fnFail, fnError) {


            config = config || {
                name: '',
                eid: '',
                openid: '',
                appid: '',

                pubacckey: '',
                timestamp: '',
                nonce: '',
                pubaccid: '',

                data: {}
            };


            var eid = config['eid'];

            ServerUrl.get({
                eid: eid,
                appid: config['appid'] || '',

            }, function (data, json) {//成功

                ajax({
                    //必选的
                    name: config['name'],
                    eid: eid,
                    openid: config['openid'],

                    //可选的
                    appid: config['appid'] || '',
                    pubacckey: config['pubacckey'] || '',
                    timestamp: config['timestamp'] || '',
                    nonce: config['nonce'] || '',
                    pubaccid: config['pubaccid'] || '',
                    data: config['data'] || {},

                    //来自 ServerUrl 的
                    secret: data['secret'],
                    version: data['version'],
                    fromTag: data['fromTag'],
                    url: data['url'],
                    NetID: data['NetID'],

                }, fnSuccess, fnFail, function (errCode) {

                    ServerUrl.removeCache(eid);
                    fnError && fnError(errCode);

                });

            }, fnFail, fnError);

        }

        return {
            post: post,

        };


    })(ServerUrl, MD5);


    var Scroller = (function (MiniQuery, IScroll) {


        document.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);


        //重载 IScroll.prototype 中的一些方法
        var on = IScroll.prototype.on;
        var refresh = IScroll.prototype.refresh;


        $.Object.extend(IScroll.prototype, {
            on: function (name, fn) {

                var self = this;

                if ($.Object.isPlain(name)) { // on({ name: fn })
                    $.Object.each(name, function (name, fn) {
                        var args = [name, fn];
                        on.apply(self, args);
                    });
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 0);
                    on.apply(self, args);
                }
            },

            //原来的刷新后会出现滚动条，这里使用钩子函数覆盖原实现
            refresh: function () {

                var args = Array.prototype.slice.call(arguments, 0);
                refresh.apply(this, args);

                //隐藏滚动条
                if (this.indicators != undefined) {
                    $.Array.each(this.indicators, function (item, index) {
                        $(item.indicator).hide();
                    });
                }
            },


            //下拉刷新
            pulldown: function (config) {

                var start = config.start;
                var end = config.end;
                var fn = config.fn;

                var el = $(config.selector);

                //避免重重复复执行

                //state 采用 3 bit 来表示 2-1-0，最多只有一个位为 1，因此有 001、010、100 三种情况
                //即对应的值为 1、2、4，采用与操作即可判断第几位为 1
                var state = 0;


                this.on({

                    'scrollStart': function () {
                        state = 0;
                        this.isWaitingForManualReset = false;
                    },

                    'scroll': function () { //该事件会给频繁触发，要注意性能控制

                        var y = this.y;
                        //console.log(y >> 0);

                        if (y < 0) { //向上拉，忽略
                            return;
                        }


                        if (y < start) {
                            if ((state & 1) == 0) { //第 0 位为 0
                                el.hide();
                                state = 1;  //001
                            }
                        }
                        else if (start <= y && y < end) {
                            if ((state & 2) == 0) { //第 1 位为 0
                                el.html('下拉刷新').show().css({
                                    top: (config.top || 10) + 'px'
                                });
                                state = 2; //010
                            }
                        }
                        else if (y >= end) {
                            if ((state & 4) == 0) { //第 2 位为 0
                                el.html('释放立即刷新');
                                state = 4; //100
                            }
                        }
                    },

                    'beforeScrollEnd': function () {

                        if ((state & 4) == 4) { //第 2 位为 1
                            this.isWaitingForManualReset = true;
                            el.html('正在刷新...');

                            var self = this;

                            fn && fn(function () {

                                el.html('刷新成功');

                                setTimeout(function () { //reset
                                    el.hide();
                                    self.scrollTo(0, 0, 500, self.options.bounceEasing);
                                }, 250);
                            });
                        }
                        else {
                            el.hide();
                        }
                    }
                });


            },


            pullup: function (config) {

                var start = config.start;
                var end = config.end;
                var fn = config.fn;
                var scroller = config.scroll;
                var el = $(config.selector);

                this.on({

                    'scrollStart': function () {
                        this.isWaitingForManualReset = false;
                    },

                    'scroll': function () {

                        var y = this.y;
                        if (y > 0) { //向下拉，忽略
                            return;
                        }
                        var maxy = scroller.maxScrollY;

                        var ih = y - maxy;

                        if (ih > 50) {
                            el.hide();
                        } else if (ih < -start && ih > -end) {
                            el.html('上拉加载更多').show().css({
                                bottom: (config.bottom || 10) + 'px'
                            });
                        } else if (ih < -end) {
                            el.html('释放立即刷新');
                        }
                    },

                    'beforeScrollEnd': function () {
                        el.hide();
                        var ih = this.y - scroller.maxScrollY;
                        if (ih < -end) {
                            //el.html('正在刷新...');
                            fn && fn(function () {
                                //el.html('刷新成功');
                                setTimeout(function () {
                                    el.hide();
                                    //scroller.scrollTo(0, 0, 500, scroller.options.bounceEasing);
                                }, 250);
                            });
                        } else {
                            el.hide();
                        }

                    }
                });
            }

        });


        function create(el, config) {

            var obj = $.Object.extend({
                scrollbars: true,
                //fadeScrollbars: true,
                shrinkScrollbars: 'scale',
                preventDefault: false, /**默认为 true*/
                probeType: 2, //设置了此值， scroll 事件才会触发，可取的值为 1，2，3

            }, config);

            var self = new IScroll(el, obj);


            var indicators = $.Array.keep(self.indicators || [], function (item, index) {
                var indicator = item.indicator;
                $(indicator).hide();
                return indicator;
            }) || [];


            //有延迟，要实时获取
            var hasScrollBar = function () {
                var hasX = self.hasHorizontalScroll;
                var hasY = self.hasVerticalScroll;
                var len = indicators.length;
                return (len == 1 && (hasX || hasY)) ||
                    (len == 2 && (hasX && hasY));
            };


            self.on('scroll', function () {
                /*            if (this.hasHorizontalScroll) {
                 }else{
                 //hong 去掉了 允许横向滚动，但会导致 垂直方向数据不够时，不能滚动
                 this._translate(0, (this.distY * 0.5) >> 0);
                 }*/
                if (this.hasHorizontalScroll) {
                } else if (!this.hasVerticalScroll) {
                    this._translate(0, (this.distY * 0.5) >> 0);
                }
            });


            var timeoutId = null;
            var isScrolling = false;

            //按下时并开始滚动时触发
            self.on('scrollStart', function () {

                isScrolling = true;
                clearTimeout(timeoutId);

                if (hasScrollBar()) {
                    $.Array.each(indicators, function (item, index) {
                        $(item).show();
                    });
                }
            });

            self.on('scrollEnd', function () {

                isScrolling = false;

                //当第一个 scrollEnd 中的 fadeOut 还没执行完就又开始第二个 beforeScrollStart 时，
                //就会有时间先后的竞争关系。 这会导致第二个 beforeScrollStart 中的 show 失效
                timeoutId = setTimeout(function () {
                    if (hasScrollBar()) {
                        $.Array.each(indicators, function (item, index) {
                            $(item).fadeOut('fast', function () {
                                if (isScrolling) {
                                    $(item).show();
                                }
                            });
                        });
                    }
                }, 100);
            });

            return self;
        }


        return {
            create: create
        };


    })(MiniQuery, IScroll);


//扩展 jQuery
    $.Object.extend(jQuery.fn, {

        touch: function (selector, fn) {

            var isMoving = false;

            //是否PC浏览器
            function isPcBrower() {
                var userAgentInfo = navigator.userAgent;
                var Agents = new Array("Android", "iPhone", "iPad", "iPod");
                var flag = true;
                for (var v = 0; v < Agents.length; v++) {
                    if (userAgentInfo.indexOf(Agents[v]) > 0) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            }

            if (typeof selector == 'function') { //$(div).touch(fn)

                fn = selector;

                if (isPcBrower()) {
                    return $(this).on({
                        'click': function (e) {
                            var args = Array.prototype.slice.call(arguments, 0);
                            fn.apply(this, args);
                        }
                    });
                } else {

                    return $(this).on({
                        'touchmove': function () {
                            isMoving = true;
                        },

                        'touchend': function (e) {
                            if (isMoving) {
                                isMoving = false;
                                return;
                            }

                            var args = Array.prototype.slice.call(arguments, 0);
                            fn.apply(this, args);
                        }
                    });
                }
            }

            //此时为 $(div).touch(selector, fn)
            if (isPcBrower()) {
                return $(this).on({
                    'click': function (e) {
                        var args = Array.prototype.slice.call(arguments, 0);
                        fn.apply(this, args);
                    }
                });
            } else {
                return $(this).delegate(selector, {

                    'touchmove': function () {
                        isMoving = true;
                    },

                    'touchend': function (e) {
                        if (isMoving) {
                            isMoving = false;
                            return;
                        }

                        var args = Array.prototype.slice.call(arguments, 0);
                        fn.apply(this, args);
                    }
                });
            }
        }
    });


    var KISP = {
        API: API,
        Scroller: Scroller,
        MD5: MD5
    };


//暴露
    if (typeof define == 'function' && define.amd) { //amd
        define(function (require) {
            return KISP;
        });
    }
    else { //browser
        global.KISP = KISP;
    }


})(
    this,
    Array,
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String
    /*, undefined */
);
