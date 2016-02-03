/**
 * Action module.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.module !== 'object')
        app.action.module = {};

    var o = app.action.module;

    o.init = function(){};

})(jQuery, OC, app);
