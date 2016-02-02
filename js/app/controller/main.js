/**
 * Controller main.js
 */

(function($, OC, app){

    // using depending on the base application
    var o = app.controller.main;

    /**
     * Construct call first when this controller run
     * @param hash
     */
    o.construct = function(hash) {

        // First loaded all project data on API
        app.api('getproject', onProjectLoaded, {hash:hash});

        // Next step, after loaded DOM elements, get gantt block
        $(document).ready(onDocumentLoaded);

    };

    function onProjectLoaded(res){

        console.log(res);

    }

    function onDocumentLoaded(){



    }

    o.loader = function(name){};

})(jQuery, OC, app);
