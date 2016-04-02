/**
 * Module util.js
 * Its static common helpers methods
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.module.util !== 'object') {
        app.module.util = {};
    }

    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    // alias of app.u and app.module.util
    var o = app.u = app.module.util;

    /**
     * Clone object
     * @param obj
     * @returns {*}
     */
    o.objClone = function(obj){
        if (obj === null || typeof obj !== 'object') return obj;
        var temp = obj.constructor();
        for (var key in obj)
            temp[key] = o.objClone(obj[key]);
        return temp;
    };

    /**
     * Count object length
     * @param obj
     * @returns {number}
     */
    o.objLen = function(obj){
        var it = 0;
        for(var k in obj) it ++;
        return it;
    };

    /**
     * Merge two objects into one - 'obj'
     * @param obj       main object of merge
     * @param src       the elements of this object will be added/replaced to main object `obj`
     * @returns {*}     object result
     */
    o.objMerge = function(obj, src){
        if (typeof obj !== 'object' || typeof src !== 'object')
            return false;

        if(Object.key){
            Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
            return obj;
        }else{
            for (var key in src)
                if (src.hasOwnProperty(key)) obj[key] = src[key];
            return obj;
        }
    };

    /**
     * Check on typeof is string a param
     * @param param
     * @returns {boolean}
     */
    o.isStr = function(param) {
        return typeof param === 'string';
    };

    /**
     * Check on typeof is array a param
     * @param param
     * @returns {boolean}
     */
    o.isArr = function(param) {
        return Array.isArray(param);
    };

    /**
     * Check on typeof is object a param
     * @param param
     * @returns {boolean}
     */
    o.isObj = function(param) {
        return (param !== null && typeof param == 'object');
    };

    /**
     * Finds whether a variable is a number or a numeric string
     * @param param
     * @returns {boolean}
     */
    o.isNum = function(param) {
        return !isNaN(param);
    };

    /**
     * Determine param to undefined type
     * @param param
     * @returns {boolean}
     */
    o.defined = function(param) {
        return typeof(param) != 'undefined';
    };

    // Determine whether a variable is empty
    o.isEmpty = function(param) {
        return (param===""||param===0||param==="0"||param===null||param===undefined||param===false||(o.isArr(param)&&param.length===0));
    };

    /**
     * Javascript object to JSON data
     * @param data
     */
    o.objToJson = function(data) {
        return JSON.stringify(data);
    };

    /**
     * JSON data to Javascript object
     * @param data
     */
    o.jsonToObj = function(data) {
        return JSON.parse(data);
    };

    /**
     * Cleans the array of empty elements
     * @param src
     * @returns {Array}
     */
    o.cleanArr = function (src) {
        var arr = [];
        for (var i = 0; i < src.length; i++)
            if (src[i]) arr.push(src[i]);
        return arr;
    };

    /**
     * Return type of data as name object "Array", "Object", "String", "Number", "Function"
     * @param data
     * @returns {string}
     */
    o.typeOf = function(data) {
        return Object.prototype.toString.call(data).slice(8, -1);
    };

    /**
     * Convert HTML form to encode URI string
     * @param form
     * @param asObject
     * @returns {*}
     */
    o.formData = function (form, asObject){
        var obj = {}, str = '';
        for(var i=0;i<form.length;i++){
            var f = form[i];
            if(f.type == 'submit' || f.type == 'button') continue;
            if((f.type == 'radio' || f.type == 'checkbox') && f.checked == false) continue;
            var fName = f.nodeName.toLowerCase();
            if(fName == 'input' || fName == 'select' || fName == 'textarea'){
                obj[f.name] = f.value;
                str += ((str=='')?'':'&') + f.name +'='+encodeURIComponent(f.value);
            }
        }
        return (asObject === true)?obj:str;
    };

    /**
     * HTML string convert to DOM Elements Object
     * @param data
     * @returns {*}
     */
    o.toNode = function(data) {
        var parser = new DOMParser();
        var node = parser.parseFromString(data, "text/xml");
        console.log(node);
        if(typeof node == 'object' && node.firstChild.nodeType == Node.ELEMENT_NODE)
            return node.firstChild;
        else return false;
    };

    /**
     * Removes duplicate values from an array
     * @param arr
     * @returns {Array}
     */
    o.uniqueArr = function (arr) {
        var tmp = [];
        for (var i = 0; i < arr.length; i++) {
            if (tmp.indexOf(arr[i]) == "-1") tmp.push(arr[i]);
        }
        return tmp;
    };

    /**
     * Reads entire file into a string
     * This function uses XmlHttpRequest and cannot retrieve resource from different domain.
     * @param url
     * @returns {*|string|null|string}
     */
    o.fileGetContents = function(url) {
        var req = null;
        try { req = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {
            try { req = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {
                try { req = new XMLHttpRequest(); } catch(e) {}
            }
        }
        if (req == null) throw new Error('XMLHttpRequest not supported');
        req.open("GET", url, false);
        req.send(null);
        return req.responseText;
    };

    /**
     * Calculates the position and size of elements.
     *
     * @param elem
     * @returns {{y: number, x: number, width: number, height: number}}
     */
    o.getPosition = function(elem) {
        var top=0, left=0;
        if (elem.getBoundingClientRect) {
            var box = elem.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            top  = box.top +  scrollTop - clientTop;
            left = box.left + scrollLeft - clientLeft;
            return { y: Math.round(top), x: Math.round(left), width:elem.offsetWidth, height:elem.offsetHeight };
        } else { //fallback to naive approach
            while(elem) {
                top = top + parseInt(elem.offsetTop,10);
                left = left + parseInt(elem.offsetLeft,10);
                elem = elem.offsetParent;
            }
            return { y: top, x: left, width:elem.offsetWidth, height: elem.offsetHeight};
        }
    };

    /**
     * Computes the difference of arrays
     * Compares arr1 against one or more other arrays and returns the values in arr1
     * that are not present in any of the other arrays.
     * @param arr1
     * @param arr2
     * @returns {*}
     */
    o.arrDiff = function (arr1, arr2) {
        if(o.isArr(arr1) && o.isArr(arr2)){
            return arr1.slice(0).filter(function(item) {
                return arr2.indexOf(item) === -1;
            })
        }
        return false;
    };


    /**
     * Create style element or style text.
     *
     * @param selector      name of selector styles
     * @param property      string "display:object" or object {'background-color':'red'}
     * @returns {*}         return object with methods : getString(), getObject(), add()
     */
    o.createStyle = function(selector, property){
        var o = {
            content : '',
            getString : function(){
                return '<style rel="stylesheet">' + "\n" + o.content + "\n" + '</style>';
            },
            getObject : function(){
                var st = document.createElement('style');
                st.setAttribute('rel','stylesheet');
                st.textContent = o.content;
                return st;
            },
            add : function(select, prop){
                if(typeof prop === 'string'){
                    o.content += select + "{" + ( (prop.substr(-1)==';') ? prop : prop + ';' ) + "}";
                }else if(typeof prop === 'object'){
                    o.content += select + "{";
                    for(var key in prop)
                        o.content += key + ':' + prop[key] + ';';
                    o.content += "}";
                }
                return this;
            }
        };
        return o.add(selector, property);
    };

    /**
     * Create new NodeElement
     * @param tag       element tag name 'p, div, h3 ... other'
     * @param attrs     object with attributes key=value
     * @param inner     text, html or NodeElement
     * @returns {Element}
     */
    o.createNode = function(tag, attrs, inner){
        var elem = document.createElement(tag);
        if(typeof attrs === 'object'){
            for(var key in prop)
                elem.setAttribute(key,prop[key]);
        }

        if(typeof inner === 'string'){
            elem.innerHTML = inner;
        } else if(typeof inner === 'object'){
            elem.appendChild(elem);
        }
        return elem;
    };

    /**
     * Multi function to work with the object localStorage combines in self:
     * .Storage(name)           identically .Storage.get(name)
     * .Storage(name, false)    identically .Storage.remove(name)
     * .Storage(name, value)    identically .Storage.set(name, value)
     * @param name
     * @param value
     * @returns {boolean}
     * @constructor
     */
    o.Storage = function(name, value){
        if(!name){
            return false;
        }else if(value === undefined){
            return o.Storage.get(name);
        }else if(!value){
            return o.Storage.remove(name);
        }else{
            return o.Storage.set(name, value);
        }
    };
    o.Storage.set = function (name, value) {
        try{value = JSON.stringify(value)}catch(error){}
        return window.localStorage.setItem(name, value);
    };
    o.Storage.get = function (name) {
        var value = window.localStorage.getItem(name);
        if(value)
            try{value = JSON.parse(value)}catch(error){}
        return value;
    };
    o.Storage.remove = function (name) {
        return window.localStorage.removeItem(name);
    };
    o.Storage.key = function (name) {
        return window.localStorage.key(key);
    };

    o.each = function (data, callback) {
        if(o.isArr(data)){
            for(var i = 0; i < data.length; i ++) callback.call(null, data[i]);
        }else if(o.isObj(data)){
            for(var k in data) callback.call(null, k, data[k]);
        }else return false;
    };

    o.ucfirst = function (string){
        return string && string[0].toUpperCase() + string.slice(1);
    };

    o.node2html = function (element){
        var container = document.createElement("div");
        container.appendChild(element.cloneNode(true));
        return container.innerHTML;
    };


    o.base64encode = function (str){
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var b64encoded = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        for (var i=0; i<str.length;) {
            chr1 = str.charCodeAt(i++);
            chr2 = str.charCodeAt(i++);
            chr3 = str.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = isNaN(chr2) ? 64:(((chr2 & 15) << 2) | (chr3 >> 6));
            enc4 = isNaN(chr3) ? 64:(chr3 & 63);
            b64encoded += b64chars.charAt(enc1) + b64chars.charAt(enc2) +
                b64chars.charAt(enc3) + b64chars.charAt(enc4);
        }
        return b64encoded;
    };


    o.base64decode = function (str) {
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var b64decoded = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        str = str.replace(/[^a-z0-9\+\/\=]/gi, '');
        for (var i=0; i<str.length;) {
            enc1 = b64chars.indexOf(str.charAt(i++));
            enc2 = b64chars.indexOf(str.charAt(i++));
            enc3 = b64chars.indexOf(str.charAt(i++));
            enc4 = b64chars.indexOf(str.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            b64decoded = b64decoded + String.fromCharCode(chr1);
            if (enc3 < 64) {
                b64decoded += String.fromCharCode(chr2);
            }
            if (enc4 < 64) {
                b64decoded += String.fromCharCode(chr3);
            }
        }
        return b64decoded;
    };



    /**
     * Calls the callback in a given interval until it returns true
     * @param {function} callback
     * @param {number} interval in milliseconds
     */
    o.waitFor = function(callback, interval) {
        var internalCallback = function() {
            if(callback() !== true) {
                setTimeout(internalCallback, interval);
            }
        };
        internalCallback();
    };

})(jQuery, OC, app);
