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
        app.action.page.init();

        /**
         * The next step is to load the project data via a special API
         */
        app.api('getproject', onProjectLoaded);

    }


    /**
     * API execute function, load full data project
     * @param response - is a Object {
     *                                  access:     "allow|deny",
     *                                  errorInfo:  "",
     *                                  uid:        "",
     *                                  project:    Object,
     *                                  tasks:      Array,
     *                                  links:      Array,
     *                                  resources:  Array
     *                                }
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

    o.loader = function(name){};

})(jQuery, OC, app);
