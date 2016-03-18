/**
 * Action chart.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.chart !== 'object')
        app.action.chart = {};

    // alias of app.action.chart
    var o = app.action.chart;

    /**
     * Dynamic action options
     */
    o.opt = {
        // Supported scales sizes
        typesScales : ["minute", "hour", "day", "week", "quarter", "month", "year"],
        // Current scale type on gantt chart size
        currentScaleType: null,
        // Current scale type on gantt chart size
        weekCount: 0,
        // true if the grant is the initialization occurred
        ganttIsInit: false,
        // show new task edit
        isNewTask: false
    };

    /**
     * Run action chart
     */
    o.init = function(){

        gantt.init(app.dom.gantt);

        // grant of initialized
        o.opt.ganttIsInit = true;

        //gantt.attachEvent("onGanttRender", onGanttReady);
        //gantt.attachEvent("onGanttReady", app.action.event.onGanttReady);

        //gantt.attachEvent("onGanttRender", app.action.event.onGanttRender);
        gantt.attachEvent("onTaskClick", app.action.event.onTaskClick);
        //gantt.attachEvent("onBeforeTaskAdd", app.action.event.onBeforeTaskAdd);
        //gantt.attachEvent("onAfterTaskAdd", app.action.event.onAfterTaskAdd);
        gantt.attachEvent("onBeforeTaskUpdate", app.action.event.onBeforeTaskUpdate);
        gantt.attachEvent("onAfterTaskDelete", app.action.event.onAfterTaskDelete);

        /*gantt.$click.advanced_details_button=function(e, id, trg){
            alert("These are advanced details");
            return false; //blocks the default behavior
        };*/

        //console.log(app.data.tasks);
        // run parse data
        gantt.parse({
            data:   app.data.tasks,
            links:  app.data.links
        });

        // Dynamic chart resize when change window
        //o.ganttDynamicResize();

        // Catcher of gantt events
        //gantt.attachEvent("onGanttReady", app.action.event.onGanttReady);



/* on_task_edit
        gantt.attachEvent("onBeforeTaskUpdate", eventBeforeTaskUpdate);
        gantt.attachEvent("onAfterTaskUpdate", eventAfterTaskUpdate);
        gantt.attachEvent("onAfterTaskDelete", eventAfterTaskDelete);
        gantt.attachEvent("onBeforeTaskAdd", eventBeforeTaskAdd);
        */

        //

        //gantt.attachEvent("onBeforeTaskDisplay", onBeforeTaskDisplayDateFixer);
    };



    o.ganttDynamicResize = function(){
        window.addEventListener('resize', function onWindowResize(event){
            app.action.chart.ganttFullSize();
            gantt.render();
        }, false);
    };

    /**
     * Performs resize the HTML Element - gantt chart, establishes the dimensions to a full page by width and height
     * Use: app.action.chart.ganttFullSize()
     */
    o.ganttFullSize = function (){
        $(app.dom.gantt)
            .css('height',(window.innerHeight-100) + 'px')
            .css('width',(window.innerWidth) + 'px');
    };

    /**
     * Performs resize the HTMLElement - gantt chart, establishes the dimensions to a size HTMLElement - #content
     * Use: app.action.chart.ganttInblockSize()
     */
    o.ganttInblockSize = function (){
        $(app.dom.gantt)
            .css('height',(window.innerHeight-100) + 'px')
            .css('width', $(app.dom.content).outerHeight() + 'px');
    };


    /**
     * Setting up the gantt chart scale
     * Use: app.action.chart.scale(type)
     * @param type scale size
     */
    o.scale = function (type){

        /**
         * Gantt Event
         * @type {null}
         */
        var event = null;

        // Type of scale size
        o.opt.currentScaleType = type = (o.opt.typesScales.indexOf(type) === -1) ? "month" : type;

        /* Common for all scales */

        // Sets the unit of the time scale (X-Axis) can be: "minute", "hour", "day", "week", "quarter", "month", "year"
        gantt.config.scale_unit = type;

        // Sets the height of the time scale and the header of the grid
        gantt.config.scale_height = 50;

        // Sets the minimum width for a column in the timeline area
        gantt.config.min_column_width = 20;

        // Scale switch
        switch (type){

            case 'minute':
                gantt.config.step = 1;
                gantt.config.date_scale = "%g %a";
                gantt.config.min_column_width = 20;
                gantt.config.duration_unit = "minute";
                gantt.config.duration_step = 60;
                gantt.config.scale_height = 75;

                gantt.config.subscales = [
                    {unit:"day", step:1, date : "%j %F, %l"},
                    {unit:"minute", step:15, date : "%i"}
                ];
                break;

            case 'hour':
                event = gantt.attachEvent("onBeforeGanttRender", function(){
                    gantt.templates.date_scale = function(date) {
                        var h = gantt.date.date_to_str("%G");
                        return "<strong>" + (parseInt(h(date)) + 1) + "</strong>";
                    };
                    gantt.detachEvent(event);
                });

                gantt.config.subscales = [
                    {unit:"month", step:1, date:"%F %Y" },
                    {unit:"day", step:1, date:"%l, %j" }
                ];
                break;

            case 'day':

                gantt.templates.date_scale = null;
                gantt.config.date_scale = "%j";

                gantt.config.subscales = [
                    {unit:"year", step:1, date:"%Y" },
                    {unit:"month", step:1, date:"%F" }
                ];
                break;

            case 'week':

                var eventName = (o.opt.ganttIsInit === false) ? 'onGanttRender' : 'onBeforeGanttRender';

                event = gantt.attachEvent(eventName, function(){
                    o.opt.weekCount = 0;
                    gantt.templates.date_scale = function(date) {
                        return "<strong>Week " + ( ++ o.opt.weekCount ) + "</strong>";
                    };
                    gantt.detachEvent(event);
                });

                gantt.config.subscales = [
                    {unit:"year", step:1, date:"%Y" },
                    {unit:"month", step:1, date:"%F" }
                ];
                break;

            case 'month':

                gantt.templates.date_scale = null;
                gantt.config.date_scale = "%F";

                gantt.config.subscales = [
                    {unit:"year", step:1, date:"%Y" },
                    {unit:"week", step:1, date:"Week %W" }
                ];
                break;

        }
    };

    /**
     * Adds a marker "today" to the timeline area
     */
    o.showMarkers = function (show){
        gantt.config.show_markers = !!show;
    };


    o.showTodayLine = function (){
        var date_to_str = gantt.date.date_to_str(gantt.config.task_date),
            today = new Date();

        gantt.addMarker({
            css: "today",
            title:"Today: "+ date_to_str(today),
            start_date: today
        });
    };


    o.showTaskNames = function (show){
        gantt.templates.task_text = function(start, end, task){
            if(show)
                return "<strong>"+task.text+"</strong>";
            else
                return "";
        };
    };


    o.showUserColor = function (show){

    };


    o.showCriticalPath = function (show){

        gantt.config.highlight_critical_path = !!show;

    };




    /**
     * Gantt chart resize. Apply a scale fit
     */
    o.scaleFit = function (){


    };

    /**
     * Generate Share Link for event
     * Use: app.action.chart.generateShareLink()
     * @param key
     * @returns {string}
     */
    o.generateShareLink = function(key){
        var link = OC.generateUrl('apps/' + app.name + '/s/' + key);
        return OC.getProtocol() + '://' + OC.getHost() + link;
    };

    /**
     * Run ZoomSlider
     */
    o.enableZoomSlider = function (value) {

        /*switch (value) {
            case 'hour':
                value = 3;
                break;
            case 'day':
                value = 2;
                break;
            case 'week':
                value = 1;
                break;
            default :
                value = 1;
        }*/
        $(app.dom.zoomSlider)
            .show()
            .slider({
                min: 0, max: 90, value: 0, change: function (event, ui) {

                    app.dom.gantt.style.transform = 'scale(1.'+ String((ui.value/10)).replace(/\./,'') +')';

                    /*switch (parseInt(ui.value)) {
                        case 3:
                            app.action.chart.scale('hour');
                            break;
                        case 2:
                            app.action.chart.scale('day');
                            break;
                        case 1:
                            app.action.chart.scale('week');
                            break;
                    }
                    gantt.render();*/
                }
            });
    };


})(jQuery, OC, app);
