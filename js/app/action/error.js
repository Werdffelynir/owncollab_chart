/**
 * Action error.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.error !== 'object')
        app.action.error = {};

    var o = app.action.error;

    o.page = function (text){

        var title = 'Application throw error',
            wrapper = '#app-content-wrapper',
            error = '#app-content-error';

        if(text){

            $(wrapper).hide();
            $(error).html('<h1>' +title+ '</h1><p>' +text+ '</p>').show();

        }else{

            $(error).hide();
            $(wrapper).show();

        }

    };


})(jQuery, OC, app);
