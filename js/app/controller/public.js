/**
 * Controller public.js
 */

(function($, OC, app){

    var o = app.controller.public;

    if(window.location.href.indexOf('apps/owncollab_chart/s/') !== -1){
        window.history.replaceState({}, document.title, window.location.href.replace(/apps\/owncollab_chart\//,''));
    }
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

        var jData = false;

        /**
         * Query DOM Elements
         */
        queryDomElements();

        try{
            jData = JSON.parse($(app.dom.ganttdatajson).text());

            if(typeof jData === 'object' && jData['tasks'] && jData['links'] && jData['project']){

                // project default information
                app.data.project = jData.project;
                app.data.tasks = jData.tasks;
                app.data.links = jData.links;

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

        }catch(error){
            window.location = '/';
        }

    }

    /**
     * Query Base DOM Elements
     * Appointment links DOM Elements necessary for use
     */
    function queryDomElements(){

        app.dom.gantt           = $('#gantt-chartpublic')[0];
        app.dom.ganttdatajson   = $('#ganttdatajson')[0];

    }


})(jQuery, OC, app);
