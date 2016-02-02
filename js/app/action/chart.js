/**
 * Action chart.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.chart !== 'object')
        app.action.chart = {};

    var o = app.action.chart;

    o.elem = null;

    o.init = function(selector){
        o.elem = $(selector);
    };



})(jQuery, OC, app);
