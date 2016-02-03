/**
 * Controller main.js
 */

(function($, OC, app){

    // using depending on the base application
    var o = app.controller.main;

    /**
     * Construct call first when this controller run
     */
    o.construct = function() {

        /**
         * First we need to select all the elements necessary for work.
         * But after the DOM is loaded
         */
        $(document).ready(onDocumentLoaded);
    };

    function onDocumentLoaded(){

        /**
         * Query DOM Elements
         */
        queryDomElements();

        /**
         * The next step is to load the project data via a special API
         */
        app.api('getproject', onProjectLoaded);

    }


    /**
     * API execute function, load full data project
     *
     * response is a Object:
     *   access:     "allow|deny",  // It contains "deny" if execute method not exist or permission deny or uid not send
     *   errorInfo:  "",            // It contains error message
     *   uid:        "",            // now auth
     *   project:    Object,        // project settings
     *   tasks:      Array,         // gantt tasks data
     *   links:      Array,         // gantt links data
     *   resources:  Array          // tasks resources
     *
     * @param response
     */
    function onProjectLoaded(response){
        if(typeof response === 'object' && response.project && response.tasks && response.links && response.resources){

            app.data = response;

            app.action.chart.init();

            //console.log(response.access);
            //console.log(app.data.project);
            //console.log(app.action.page);

        }else{

            /**
             * Show error message on main content
             */
            app.action.error.page("Project database not loaded");

        }


    }


    /**
     * Query DOM Elements
     * Appointment links DOM Elements necessary for use
     */
    function queryDomElements(){

        app.dom['app'] = $('#app')[0];
        app.dom['app-content'] = $('#app-content')[0];
        app.dom['app-content-error'] = $('#app-content-error')[0];
        app.dom['app-content-wrapper'] = $('#app-content-wrapper')[0];
        app.dom['app-sidebar'] = $('#app-sidebar')[0];
        app.dom['app-lbox'] = $('#app-lbox')[0];
        app.dom['gantt'] = $('#chart_gantt_visual')[0];

    }

    o.loader = function(name){};

})(jQuery, OC, app);
