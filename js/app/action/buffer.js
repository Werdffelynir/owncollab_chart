/**
 * Action buffer.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.buffer !== 'object')
        app.action.buffer = {};

    // alias of app.action.chart
    var o = app.action.buffer;

    /**
     * Dynamic action options
     */
    o.opt = {};

    o.init = function(){};

    o.transactionBegin = function(){};

    o.transactionCommit = function(){};

    o.addToStart = function(){};

    o.addToEnd = function(){};

    o.reset = function(){};

})(jQuery, OC, app);
