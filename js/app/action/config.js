/**
 * Action config.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.config !== 'object')
        app.action.config = {};

    var o = app.action.config;


    /**
     * Common gantt.config
     */
    o.init = function(){

        gantt.config.api_date = "%Y-%m-%d %H:%i";
        gantt.config.task_date = "%Y-%m-%d %H:%i";
        gantt.config.date_grid = "%Y-%m-%d %H:%i";

    };


    /**
     * Internal gantt.config, for authorized user
     */
    o.internal = function(){


    };



    /**
     * External gantt.config, for public
     */
    o.external = function(){


    };

})(jQuery, OC, app);
