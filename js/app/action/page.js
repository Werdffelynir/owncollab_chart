/**
 * Action page.js
 * Contains all important Objects of DOM Elements
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.page !== 'object')
        app.action.page = {};

    var o = app.action.page;

    /**
     * Query DOM Elements
     */
    o.init = function(){

        app.elem['app'] = $('#app')[0];
        app.elem['app-content'] = $('#app-content')[0];
        app.elem['app-content-error'] = $('#app-content-error')[0];
        app.elem['app-content-wrapper'] = $('#app-content-wrapper')[0];
        app.elem['app-sidebar'] = $('#app-sidebar')[0];
        app.elem['app-lbox'] = $('#app-lbox')[0];
        app.elem['gantt'] = $('#chart_gantt_visual')[0];



    };



})(jQuery, OC, app);
