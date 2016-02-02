/**
 * Action sidebar.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.sidebar !== 'object')
        app.action.sidebar = {};

    var o = app.action.sidebar;

    o.elem = null;

    o.init = function(selector){
        o.elem = $(selector);
    };

    o.open = function(){};

})(jQuery, OC, app);
