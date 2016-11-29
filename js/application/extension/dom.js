if(App.namespace) { App.namespace('Extension.Dom', function(App) {


    /**
     * @namespace App.Extension.Dom
     * @param name
     * @param selector
     */
    var dom = function(name, selector){
        if(arguments.length === 1)
            return dom.get(name);
        else
            return dom.add(name, selector);
    };


    /**
     *
     * @type {{}}
     */
    dom.node = {};


    /**
     * Query element by selector, put to nodes stack and return it, if element not found
     * display error message
     * todo: Show error in to page
     * @namespace App.Extension.Dom.add
     * @param name
     * @param selector
     * @returns {NodeList}
     */
    dom.add = function(name, selector){
        var elem = document.querySelectorAll(selector);
        if(!elem)
            console.error("Can`t query DOM Element by selector: " + selector);
        else{
            dom.node[name] = elem;
            return dom.get(name);
        }
    };


    /**
     * @namespace App.Extension.Dom.get
     * @param name
     * @returns {*}
     */
    dom.get = function(name){
        if(dom.node[name] && dom.node[name].length === 1)
            return dom.node[name][0];
        else
            return dom.node[name];
    };


    /**
     * @namespace App.Extension.Dom.getSource
     * @param name
     * @returns {*}
     */
    dom.getSource = function(name){
        if(name)
            return dom.node[name];
        else
            return dom.node;
    };


    /**
     * @namespace App.Extension.Dom.remove
     * @param name
     */
    dom.remove = function(name){
        delete dom.node[name];
    };

    return dom

})}