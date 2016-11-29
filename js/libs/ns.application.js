/**
 *
 */
(function (window){

    var
        /**
         * NamespaceApplication Prototype
         * @type {*}
         */
        proto = {

            config: {
                /**
                 * Base url
                 */
                url: '/',

                /**
                 * Debug mod
                 */
                debug: true,

                /**
                 * Startup type of constructor for modules
                 * Type: false - off constructor
                 *      'runtime' - perform during the assignment of namespace
                 *      'gather' - save in the stack,
                 *          for call and execute all constructor methods, use .constructsStart()
                 */
                constructsType: 'runtime',
                _lastKey: null,
                _stackRequires: {},
                _stackNodes: {},
                _stackConstructs: []
            },

            merge: function (objectBase, src) {
                for (var key in src)
                    if (objectBase[key] === undefined)
                        objectBase[key] = src[key];
                return objectBase;
            }
        },

        /**
         * NamespaceApplication Constructor
         * @param config
         * @returns {app|NamespaceApplication}
         */
        app = function(config){

            if (!(this instanceof NamespaceApplication))
                return new NamespaceApplication(config);

            this.version = '0.1.0';
            this.setConfig(config);
        };


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * PROTOTYPE METHODS
     */

    /**
     * Apply config object to instance properties
     * @param config
     * @returns {proto}
     */
    proto.setConfig = function(config) {
        config = typeof config === 'object' ? this.merge(config, this.config) : this.config;
        for(var prop in config){
            if(this[prop] === undefined)
                this[prop] = config[prop];
        }
        return this;
    };

    /**
     * Create namespace for module-script
     * @param namespace  "Controller.Name" or "Action.Name"
     * @param callback
     * @param args
     * @returns {{}}
     */
    proto.namespace = function(namespace, callback, args) {

        var
            name,
            path = namespace.split('.'),
            tmp = this || {},
            len = path.length;

        for (var i = 0; i < len; i ++ ){
            name = path[i].trim();
            if (typeof tmp[name] !== 'object'){
                tmp[name] = (i+1 >= len) ? (callback?callback.call(tmp,this,{}):{}) :{};
                tmp = tmp[name];
            }else{
                tmp = tmp[name];
            }
        }

        if(typeof tmp === "object" && tmp.construct) {
            args = Array.isArray(args) ? args : [];
            if(this.constructsType == 'runtime') {
                tmp.construct.apply(tmp, args);
            }else if (this.constructsType == 'gather') {
                this._stackConstructs.push(tmp);
            }
        }

        return  tmp;
    };

    /**
     * Run all modules constructs
     * @param args
     * @returns {proto}
     */
    proto.constructsStart = function(args) {
        this.each(this._stackConstructs, function(item, index){
            item.construct.apply(item, args);
        },args);
        this._stackConstructs = [];
        return this;
    };

    /**
     * Storage of HTML elements
     *      if nodes a Object - Add new elements key = HTMLElements
     *      if nodes a String - Get HTMLElements by key, if exists
     *      if nodes a not set - return object with all elements
     * @param nodes
     * @returns {*}
     */
    proto.node = function (nodes) {
        if(typeof nodes === 'object') {
            for (var key in nodes)
                this._stackNodes[key] = nodes[key];
            return this._stackNodes;
        }
        else if (typeof nodes === 'string')
            return this._stackNodes[nodes] ? this._stackNodes[nodes] : null;

        else if (nodes === undefined)
            return this._stackNodes;
    };



    /**
     * Designate a list of scripts for loading
     * @param key           list key (identifier)
     * @param path          array with scripts url
     * @param oncomplete    executing when all scripts are loaded
     * @param onerror
     * @returns {proto}
     */
    proto.require = function(key, path, oncomplete, onerror){
        this._lastKey = key;
        this._stackRequires[key] = {
            src:  Array.isArray(path) ? path : [path],
            oncomplete : oncomplete,
            onerror : onerror
        };
        return this;
    };
    /**
     * Start loading the list of scripts by key (identifier)
     * @param key
     */
    proto.requireStart = function(key){
        var source;
        key = key || this._lastKey;
        if(this._stackRequires[key]){
            this._recursive_load_script(0, key);
        }else{
            console.error("Require source not found! Key: " + key + " not exist!");
        }
        return this;
    };

    proto._recursive_load_script = function  (i, key) {
        var self = this,
            source = this._stackRequires[key];

        if (source.src[i]) {
            if(!Array.isArray(source.node)) source.node = [];

            source.node.push(this.script(source.src[i], function(){
                self._recursive_load_script(++i, key);
            }, source.onerror));

        } else if (i ===  source.src.length)
            source.oncomplete.call(self, source.node);
        else
            self._recursive_load_script(++i, key);
    };

    /**
     * Loads the script element
     * @param src
     * @param onload
     * @param onerror
     * @returns {Element}
     */
    proto.script = function  (src, onload, onerror) {
        if(!src) return null;

        var script = document.createElement('script'),
            id = "src-" + Math.random().toString(32).slice(2);

        script.src = (src.substr(-3) === '.js') ? src : src + '.js';
        script.type = 'application/javascript';
        script.id = id;
        script.onload = onload;
        script.onerror = onerror;

        document.head.appendChild(script);

        return script;
    };

    /**
     * Loads the CSS link element
     * @param src
     * @param onload
     * @param onerror
     * @returns {Element}
     */
    proto.style = function  (src, onload, onerror) {
        var link = document.createElement('link'),
            id = "src-" + Math.random().toString(32).slice(2);

        link.href = (src.substr(-4) === '.css') ? src : src + '.css';
        link.rel = 'stylesheet';
        link.id = id;
        link.onload = onload;
        link.onerror = onerror;
        document.head.appendChild(link);
        return link;
    };

    /**
     * Loads the file
     * @param url
     * @param onload
     * @param onerror
     */
    proto.file = function  (url, onload, onerror) {
        proto.request('GET', url, function(event){
            if(event.target.status === 200)
                onload.call(this, event.target.responseText, event);
            else
                onerror.call(this, event);
        }, onerror)
    };

    /**
     * Base url request
     * @param method
     * @param url
     * @param callback
     * @param callbackError
     * @returns {XMLHttpRequest}
     */
    proto.request = function(method, url, callback, callbackError) {
        var xhr = new XMLHttpRequest();
        method = method || 'POST';
        url = url || '/';

        xhr.open(method, url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        if(typeof callback === 'function') xhr.onloadend = callback;
        if(typeof callbackError === 'function') xhr.onerror = callbackError;
        xhr.send();
        return xhr;
    };

    /**
     * Templates creator
     * @param stringData
     * @param params
     * @returns {*}
     */
    proto.assign = function  (stringData, params) {
        if(typeof params === 'object')
            for(var k in params)
                stringData = stringData.replace(new RegExp('{{'+k+'}}', 'gi'), params[k]);

        return stringData;
    };

    /**
     * Simple router
     * @param urlPath
     * @param callback
     */
    proto.route = function(urlPath, callback){
        urlPath = urlPath || '';
        var reg = new RegExp('^'+urlPath+'$', 'i'),
            path = window.location.pathname;

        if(path.indexOf(this.url) === 0){
            path = path.substr(this.url.length);
            if(reg.test(path)) callback.call(this)
        }
        return this;
    };

    /**
     * Simple inject data to HTMLElement [by selector]
     * @param selector
     * @param data
     * @returns {*}
     */
    proto.inject = function(selector, data){
        if(typeof selector === 'string') selector = this.query(selector);
        if(typeof selector === 'object' && selector.nodeType === Node.ELEMENT_NODE) {
            selector.textContent = '';
            if(typeof data === 'object')
                selector.appendChild(data);
            else
                selector.innerHTML = data;
            return selector;
        }
        return null;
    };

    /**
     * Query DOM Element by selector
     *
     * @param selector
     * @param parent|callback
     * @returns {Element}
     */
    proto.query = function(selector, parent){
        var callback, elem, from = document;

        if(typeof parent === 'function')
            callback = parent;
        else if(typeof parent === 'string')
            from = document.querySelector(parent);
        else if(typeof parent === 'object' && parent.nodeType === Node.ELEMENT_NODE)
            from = parent;

        if(from)
            elem = from.querySelector(selector);

        if(elem && typeof callback === 'function')
            callback.call(this, elem);

        // debug
        if(this.debug && !elem)
            console.error("Error query DOM Element by selector ", selector);

        return elem;
    };

    /**
     * Query DOM Elements by selector
     * @param selector
     * @param parent|callback
     * @returns {Array.<T>}
     */
    proto.queryAll = function(selector, parent){

        var callback, elems, from = document;

        if(typeof parent === 'function')
            callback = parent;
        else if(typeof parent === 'string')
            from = document.querySelector(parent);
        else if(typeof parent === 'object' && parent.nodeType === Node.ELEMENT_NODE)
            from = parent;

        if(from)
            elems = [].splice.call(from.querySelectorAll(selector));

        if(elems.length > 0 && typeof callback == 'function')
            callback.call(this, elems);

        // debug
        if(this.debug && !elems)
            console.error("Error queryAll DOM Elements by selector ", selector);

        return elems;
    };


    /**
     * Apply an callback to each element of list
     * @param list      Array|Object
     * @param callback
     * @param tmp
     * @returns {*}
     */
    proto.each = function (list, callback, tmp) {
        //tmp = tmp !== undefined ? tmp : {};
        if (list instanceof Array) {
            for (var i = 0; i < list.length; i++) {
                callback.call(this, list[i], i, tmp);
            }
        } else if (list instanceof Object) {
            for (var k in list) {
                callback.call(this, list[k], k, tmp);
            }
        }
        return list;
    };


    /**
     * Execute callback function if DOM is loaded
     * @param callback
     */
    proto.domLoaded = function(callback){
        if(document.querySelector('body')) {
            callback.call({});
        }else{
            document.addEventListener('DOMContentLoaded', function(){callback.call({})}, false);
        }
    };


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * STATIC METHODS
     * uses: NamespaceApplication.afterDOMLoaded()
     * uses: NamespaceApplication.request()
     * uses: NamespaceApplication.assign()
     * uses: NamespaceApplication.script()
     * uses: NamespaceApplication.style()
     * uses: NamespaceApplication.file()
     */
    app.domLoaded = proto.domLoaded;
    app.request = proto.request;
    app.assign = proto.assign;
    app.script = proto.script;
    app.style = proto.style;
    app.file = proto.file;

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * GLOBAL NAME
     */
    window.NamespaceApplication = app;
    window.NamespaceApplication.prototype = proto;
    window.NamespaceApplication.prototype.constructor = app;

})(window);