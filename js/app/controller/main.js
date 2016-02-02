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
        // First loaded all project data on API
        app.api('getproject', onProjectLoaded);

        // Next step, after loaded DOM elements, get gantt block for manipulation
        $(document).ready(onDocumentLoaded);
    };

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

            console.log(response.access);
            console.log(response);

        }


    }

    function onDocumentLoaded(){



    }

    o.loader = function(name){};

})(jQuery, OC, app);
