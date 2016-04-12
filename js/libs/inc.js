(function (window) {

    var version = '0.0.2',
        _self = null,
        proto = {
            source: null,
            options: {
                force: false,
                chain: true,
                debug: true
            },
            isInit: false,
            onload: function(){},
            onerror: function(){},
            oncomplete: function(){},
            onremove: function(){}
        },

        inc = function (options) {

            if (!(this instanceof Inc))
                return new Inc(options);

            if (typeof options === 'object')
                for (var k in options) this.options[k] = options[k]

            this.isInit = true;
            this.source = {scripts: {}, styles: {}};

            this.script = function (src, onload, onerror) {
                var script, id = null;
                if(typeof src === 'object'){
                    var _src = src;
                    try{
                        src = _src.src;
                        id = _src.id || this.encodeId(src);
                    }catch(error){ inc.logError(error) }
                }else
                    id = this.encodeId(src);

                script = this.createScript(src, id);
                script.onload = onload;
                script.onerror = onerror;

                this.source.scripts[script.id] = script;
                if (this.options['force'] === true)
                    this.start();

                return script;
            };

            this.style = function (src, onload, onerror) {
                var id = this.encodeId(src),
                    style = this.createStyle(src, id);
                style.onload = onload;
                style.onerror = onerror;
                this.source.styles[id] = style;
                if (this.options['force'] === true)
                    this.start();
                return style;
            };

            this.require = function (path, oncomplete, onerror) {
                if (typeof path === 'string') {
                    this.script(path);
                } else if (path instanceof Array) {
                    var self = this;
                    path.forEach( function (p) { self.script(p) });
                }
                if (oncomplete) this.oncomplete = oncomplete;
                if (onerror) this.onerror = onerror;
                return this;
            };

            _self = this;
        };


    inc.each = function (arr, func, tmp) {
        tmp = tmp || {};
        if (arr instanceof Array) {
            return arr.map(func)
        } else if (arr instanceof Object) {
            var k, i = 0;
            for (k in arr) {
                func.call([], arr[k], k, tmp);
                i++;
            }
        }
    };

    inc.logError = function(text){
        if(_self && _self.options.debug){
            console.error('Inc throw error: ' + text);
        }
    };
    inc.log = function(text){
        if(_self && _self.options.debug){
            console.log('Inc: ' + text);
        }
    };

    proto.encodeId = function (src) {
        src = typeof src == 'string' ? src : Math.random().toString(36);
        return encodeURIComponent(src.replace(/\W+/gm, ''));
    };

    proto.createStyle = function (href, id) {
        var style = document.createElement('link');
        style.href = (href.substr(-4).toLowerCase() === '.css') ? href : href + '.css';
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.id = id;
        return style;
    };

    proto.getSource = function (which) {
        if (!which) return this.source;
        if (!this.source[which]) return null;
        var elems = this.source[which];
        return proto.objectPropertyLength(elems);
    };


    proto.objectPropertyLength = function (source) {
        if(typeof source === 'object'){
            source.length = (function () {var i = 0; for(var _ in source) i++; return i})();
        }
        return source;
    };

    proto.createScript = function (src, id) {
        var script = document.createElement('script');
        script.src = (src.substr(-3) === '.js') ? src : src + '.js';
        script.type = 'application/javascript';
        script.id = id;
        return script;
    };

    /**
     * <pre>
     * .remove()
     * .remove()
     * </pre>
     * @param id        if set true - remove from sources
     * @param fully     if true - remove from sources, false remove from DOM only
     * @type id {{boolean|number|string}}
     */
    proto.remove = function (id, fully) {

        if(id === true || id === 'styles' || id === 'scripts'){
            var reachGlobal = {count:0};

            if( id !== 'scripts' ){
                inc.each(this.source['styles'], function(item, key, tmp){
                    this.remove(item.id, fully);
                    tmp.count ++;
                }, reachGlobal);
            }

            if( id !== 'styles' ){
                inc.each(this.source['scripts'], function(item, key, tmp){
                    this.remove(item.id, fully);
                    tmp.count ++;
                }, reachGlobal);
            }

        }else if(typeof id === 'string'){
            var elem = document.querySelector('#' + id);
            if (elem instanceof HTMLElement) {
                document.head.removeChild(elem);
                if (!!fully) {
                    var tag = elem.tagName.toLowerCase();
                    delete _self.source[tag=='script'?'scripts':'styles'][elem.id];
                }
                this.onremove.call(this, elem);
            }
        }
    };


    proto.start = function (reload) {

        var self = this,
            styles = this.getSource('styles'),
            scripts = this.getSource('scripts');

        proto.start.params = {
            styles: styles,
            scripts: scripts,
            count: scripts.length + styles.length,
            reload: !!reload,
            loading: [],
            breaking: false,
            currentResult: {}
        };

        inc.each(styles, function (item, key) {
            proto.start.loadItem(item, key, self.onload, self.oncomplete, self.onerror)
        });

        if (this.options.chain)
            proto.start.loadRecursive(scripts, self);
        else
            inc.each(scripts, function (item, key) {proto.start.loadItem(item, key, self.onload, self.oncomplete, self.onerror)});
    };

    proto.start.params = {count: 0, breaking: false};

    proto.start.loadRecursive = function (scripts, self) {
        var k, s, pam = proto.start.params;
        scripts = scripts || pam.scripts;

        for(k in scripts){
            s = scripts[k];
            if(s instanceof HTMLElement && s.tagName === 'SCRIPT' && pam.loading.indexOf(s.id) === -1){
                function _onload(item){
                    pam.loading.push(item.id);
                    self.onload.call(this, item);
                    proto.start.loadRecursive(scripts, self);
                }
                proto.start.loadItem(s, s.id, _onload, self.oncomplete, self.onerror);
                break;
            }
        }
    };

    proto.start.loadItem = function (item, key, onload, oncomplete, onerror) {
        var pam = proto.start.params;

        if (item instanceof HTMLElement) {
            var elem = document.querySelector('#' + key);
            if (!pam.breaking && (!elem || !!pam.reload)) {
                elem ? document.head.removeChild(elem) : null;
                document.head.appendChild(item);

                item.onerror = onerror || null;
                item.onload = function (event) {
                    -- pam.count;

                    if (pam.count >= 0 && onload) {
                        pam.currentResult[this.id] = this;
                        onload.call(event, this);
                    }
                    if (pam.count === 0 && oncomplete) {
                        oncomplete.call(event, proto.objectPropertyLength(pam.currentResult))
                    }
                };
            } else -- pam.count;
        }
    };

    window.Inc = inc;
    window.Inc.prototype = proto;
    window.Inc.prototype.constructor = inc;

})(window);