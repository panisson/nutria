// WOK - the Web Objects Kitchen
//
// Copyright © 2009-2011 Studio Associato Di Nunzio e Di Gregorio
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public Licenseas published by
// the Free Software Foundation, either version 3 of the License, or (at
// your option) any later version. See the file Documentation/GPL3 in the
// original distribution for details. There is ABSOLUTELY NO warranty.

'use strict';

(function($) { // MODULE: wok.core

    window.wok = window.wok || {
        error: function(msg) {
            alert("WOK error: " + msg + ".");
        },
        warning: function(msg) {
            if (console)
                console.log("WOK warning: " + msg + ".");
        }
    };

// Some simple jQuery extensions so short that don't need a separate module.
    
    $.fn.ellipsize = function(height, options) {
        return this.each(function(i) {
            options = $.extend({ellipsis:"…"}, options);
            var ellipsis = options.ellipsis;
            var $this = $(this);
            var $target = $this.children().last();
            if ($target.length == 0)
                $target = $this;
            if ($target != $this && $this.css('overflow') === "hidden") {
                height = $this.height();
                $this = $this.wrapInner('<div></div>').children();
            }
            var i = 0;
            while ($this.height() > height && i != -1) {
                var text = $target.text();
                i = text.lastIndexOf(' ');
                if (i >= 0)
                    $target.text(text.substring(0, i) + ellipsis);
            }
        });
    }
    
    $.fn.replaceClass = function(cls1, cls2) {
        return this.each(function(i) {
            $(this).removeClass(cls1).addClass(cls2);
        });
    };
    
    $.fn.extractArgs = function(data, optionalPattern) {
        if (typeof(data) === "string") {
            optionalPattern = data;
            data = {};
        }
        data = data || {};
        if (this.length > 0) {
            var pattern = optionalPattern ? optionalPattern : "[\\w_-]+";
            var attr = $(this[0]).attr("class");
            var r = new RegExp("ref-("+pattern+")-([\\d\\w_:-]+)", 'g');
            var m = r.exec(attr);
            while (m) {
                data[m[1]] = m[2];
                m = r.exec(attr);
            }
        }
        return data;
    };
    
    $.fn.extractId = function(data, optionalPattern) {
        if (typeof(data) === "string") {
            optionalPattern = data;
            data = null;
        }
        if (this.length > 0) {
            var pattern = optionalPattern ? optionalPattern : "[\\w_-]+";
            var r = new RegExp("("+pattern+")-([\\d\\w_:-]+)");
            var attr = $(this[0]).attr("id");
            if (!attr)
                 attr = $(this[0]).attr("class");
            var m = r.exec(attr);
            if (m) {
                data = data || {};
                data.type = m[1];
                data.id = m[2];
                data.selector = "#"+m[1]+"-"+m[2]
            }
        }
        return data || null;
    };
    
    $.subclass = function(name, superClass, moduleFunction, initFunction) {
        initFunction.prototype = $.extend({}, superClass.prototype, initFunction.prototype, moduleFunction());
        initFunction.prototype.constructor = initFunction;
        initFunction.prototype.constructor.name = name;
        return initFunction;
    }

// Simple JavaScript Inheritance by John Resig http://ejohn.org/ (MIT Licensed)
// See http://ejohn.org/blog/simple-javascript-inheritance/ for details. */

    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // Empty class; root of hierarchy.
    window.Class = function() {};

    Class.extend = function(prop, stat) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance, don't run the
        // init constructor).
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype.
        for (var name in prop) {
            // Check if we're overwriting an existing function.
            prototype[name] =
                typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method but on the super-class.
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we remove it when we're
                        // done executing.
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name])
              : prop[name];
        }

        // The dummy class constructor.
        function Class() {
            // All construction is actually done in the init method.
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object.
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect.
        Class.constructor = Class;

        // And make this class extendable.
        Class.extend = arguments.callee;

        // Add static properties.
        if (stat) {
            for (var name in stat)
                Class[name] = stat[name];
        }

        return Class;
    };

// Add ECMA262-5 method binding if not supported natively.

    if (!('bind' in Function.prototype)) {
        Function.prototype.bind= function(owner) {
            var that= this;
            if (arguments.length<=1) {
                return function() {
                    return that.apply(owner, arguments);
                };
            } else {
                var args= Array.prototype.slice.call(arguments, 1);
                return function() {
                    return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
                };
            }
        };
    }

// Add ECMA262-5 string trim if not supported natively.

    if (!('trim' in String.prototype)) {
        String.prototype.trim= function() {
            return this.replace(/^\s+/, '').replace(/\s+$/, '');
        };
    }

// Add startsWith and endsWith methods if not supported natively.

    if (!('startsWith' in String.prototype)) {
        String.prototype.startsWith = function(s) {
            return this.slice(0, s.length) == s;
        };
    }
    if (!('endsWith' in String.prototype)) {
        String.prototype.endsWith = function(s) {
            return this.slice(-s.length) == s;
        };
    }

// Add ECMA262-5 Array methods if not supported natively.

    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf= function(find, i /*opt*/) {
            if (i===undefined) i= 0;
            if (i<0) i+= this.length;
            if (i<0) i= 0;
            for (var n= this.length; i<n; i++)
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }
    if (!('lastIndexOf' in Array.prototype)) {
        Array.prototype.lastIndexOf= function(find, i /*opt*/) {
            if (i===undefined) i= this.length-1;
            if (i<0) i+= this.length;
            if (i>this.length-1) i= this.length-1;
            for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }
    if (!('forEach' in Array.prototype)) {
        Array.prototype.forEach= function(action, that /*opt*/) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this)
                    action.call(that, this[i], i, this);
        };
    }
    if (!('map' in Array.prototype)) {
        Array.prototype.map= function(mapper, that /*opt*/) {
            var other= new Array(this.length);
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this)
                    other[i]= mapper.call(that, this[i], i, this);
            return other;
        };
    }
    if (!('filter' in Array.prototype)) {
        Array.prototype.filter= function(filter, that /*opt*/) {
            var other= [], v;
            for (var i=0, n= this.length; i<n; i++)
                if (i in this && filter.call(that, v= this[i], i, this))
                    other.push(v);
            return other;
        };
    }
    if (!('every' in Array.prototype)) {
        Array.prototype.every= function(tester, that /*opt*/) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this && !tester.call(that, this[i], i, this))
                    return false;
            return true;
        };
    }
    if (!('some' in Array.prototype)) {
        Array.prototype.some= function(tester, that /*opt*/) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this && tester.call(that, this[i], i, this))
                    return true;
            return false;
        };
    }

})(jQuery);
