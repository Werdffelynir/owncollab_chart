/**
 * Action chart.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.chart !== 'object')
        app.action.chart = {};

    var o = app.action.chart;

    o.init = function(){

        gantt.init(app.dom['gantt']);

        /**/
        gantt.parse({
            data:   app.data.tasks,
            links:  app.data.links
        });

        o.fixedSize();
/*
        gantt.attachEvent("onBeforeTaskUpdate", eventBeforeTaskUpdate);
        gantt.attachEvent("onAfterTaskUpdate", eventAfterTaskUpdate);
        gantt.attachEvent("onAfterTaskDelete", eventAfterTaskDelete);
        gantt.attachEvent("onBeforeTaskAdd", eventBeforeTaskAdd);
        */
        gantt.attachEvent("onGanttReady", onGanttReady);
        //gantt.attachEvent("onGanttRender", onGanttReady);
    };

    o.fixedSize = function (){
        $(app.dom['gantt'])
            .css('height',(window.innerHeight-100) + 'px')
            .css('width',(window.innerWidth) + 'px');
    };

    function onGanttReady(e){
        o.fixedSize();
    }




})(jQuery, OC, app);
