/**
 * Controller public.js
 */

(function($, OC, app){

    var o = app.controller.public;

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

        var jData = JSON.parse($(app.dom.ganttdatajson).text());

        if(typeof jData === 'object' && jData['tasks'] && jData['links'] && jData['project']){

            // project default information
            app.data.project = jData.project;
            app.data.tasks = jData.tasks;
            app.data.links = jData.links;

            console.log(app.data);

            // clear ganttdatajson
            app.dom.ganttdatajson.textContent = '';

            gantt.init(app.dom.gantt);

            gantt.attachEvent("onParse", function(){
                app.action.chart.ganttFullSize();
            });

            /**
             * Configuration public set
             */
            app.action.config.init();
            app.action.config.external();

            // parse data
            gantt.parse({
                data: app.data.tasks,
                links: app.data.links
            });

        }

    }

    /**
     * Query Base DOM Elements
     * Appointment links DOM Elements necessary for use
     */
    function queryDomElements(){

        app.dom.gantt           = app.controller.main.select('#gantt-chartpublic');
        app.dom.ganttdatajson   = app.controller.main.select('#ganttdatajson');

    }


})(jQuery, OC, app);
