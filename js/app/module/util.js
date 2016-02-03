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

	var o = app.u = app.module.util;

    o.objClone = function(obj){
        if (obj === null || typeof obj !== 'object') return obj;
        var temp = obj.constructor();
        for (var key in obj)
            temp[key] = o.objClone(obj[key]);
        return temp;
    };
    o.objLen = function(obj){
        var it = 0;
        for(var k in obj) it ++;
        return it;
    };
    o.isStr = function(param) {
        return (typeof param === 'string');
    };
    o.isArr = function(arr) {
        return Array.isArray(arr);
    };
    o.isObj = function(param) {
        return (param !== null && typeof param == 'object');
    };
    // Finds whether a variable is a number or a numeric string
    o.isNum = function(param) {
        return !isNaN(param);
    };
    // Determine whether a variable is empty
    o.isEmpty = function(param) {
        return (param===""||param===0||param==="0"||param===null||param===undefined||param===false||(o.isArr(param)&&param.length===0));
    };
    // Javascript object to JSON data
    o.objToJson = function(data) {
        return JSON.stringify(data);
    };
    // JSON data to Javascript object
    o.jsonToObj = function(data) {
        return JSON.parse(data);
    };
    // Return type of data as name object "Array", "Object", "String", "Number", "Function"
    o.typeOf = function(data) {
        return Object.prototype.toString.call(data).slice(8, -1);
    };
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
    // HTML string convert to DOM Elements Object
    o.toNode = function(data) {
        var parser = new DOMParser();
        var node = parser.parseFromString(data, "text/xml");
        console.log(node);
        if(typeof node == 'object' && node.firstChild.nodeType == Node.ELEMENT_NODE)
            return node.firstChild;
        else return false;
    };
    // Removes duplicate values from an array
    o.uniqueArr = function (arr) {
        var tmp = [];
        for (i = 0; i < arr.length; i++) {
            if (tmp.indexOf(arr[i]) == "-1") tmp.push(arr[i]);
        }
        return tmp;
    };
    // Reads entire file into a string
    // This function uses XmlHttpRequest and cannot retrieve resource from different domain.
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

})(jQuery, OC, app);
