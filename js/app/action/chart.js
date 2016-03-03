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
     * Use: app.action.opt[]
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
     * Save data of project task
     * Uses: app.action.chart.baseProjectTask
     * @type {null|object}
     */
    o.baseProjectTask = null;

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
        //gantt.attachEvent("onBeforeTaskAdd", app.action.event.onBeforeTaskAdd);
        //gantt.attachEvent("onAfterTaskAdd", app.action.event.onAfterTaskAdd);

        gantt.attachEvent("onTaskClick", app.action.event.onTaskClick);
        gantt.attachEvent("onBeforeTaskUpdate", app.action.event.onBeforeTaskUpdate);
        gantt.attachEvent("onAfterTaskDelete", app.action.event.onAfterTaskDelete);
        //gantt.attachEvent("onBeforeTaskDelete", app.action.event.onBeforeTaskDelete);

        //gantt.attachEvent("onBeforeTaskDelete", app.action.event.onBeforeTaskDelete);
        gantt.attachEvent("onAfterTaskUpdate", app.action.event.onAfterTaskUpdate);

        // Этот фильтр удаляет с таска проэкта даты,
        // для того что бы таск был интерактивен по отношеню к детям
        var dataTaskFiltering = app.data.tasks.map(function(_task) {
            if(_task['type'] == 'project'){
                // Cloning project task to property app.action.chart.baseProjectTask
                if(_task['id'] == 1)
                    app.data.baseProjectTask = o.baseProjectTask = app.u.objClone(_task);

                //delete _task['start_date'];
                //delete _task['end_date'];
                //delete _task['duration'];
            }
            return _task;
        });

        // run action.config
        app.action.config.init();

        //console.log(dataTaskFiltering);
        // run parse data
        gantt.parse({
            data:   dataTaskFiltering,
            links:  app.data.links
        });

        // Dynamic chart resize when change window
        //o.ganttDynamicResize();

        // Catcher of gantt events
        //gantt.attachEvent("onGanttReady", app.action.event.onGanttReady);

    };


    /**
     * Dynamic change size of chart, when browser window on resize
     */
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
                        if(!o.opt.weekRecount) {
                            o.opt.weekRecount = app.timeDateToStr(date);
                        }else if(o.opt.weekRecount == app.timeDateToStr(date)){
                            o.opt.weekCount = 0;
                        }
                        return "<strong>" + ( ++ o.opt.weekCount ) + " Week</strong>";
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
                return task.text;//"<strong>"+task.text+"</strong>";
            else
                return "";
        };
    };


    o.showUserColor = function (show){

    };


    o.showCriticalPath = function (show){
        gantt.config.highlight_critical_path = !!show;
        //gantt.render();
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

        $(app.dom.zoomSlider)
            .show()
            .slider({
                min: 0, max: 90, value: 0, change: function (event, ui) {

                    //app.dom.gantt.style.transform = 'scale(1.'+ String((ui.value/10)).replace(/\./,'') +')';
                    var _s = ui.value/10,
                        task = $('.gantt_task')[0],
                        grid = $('.gantt_grid')[0];

                    //console.log(_s, app.dom.gantt.clientWidth);
                    //app.dom.gantt.style.width = (app.dom.gantt.clientWidth * _s) + 'px';
                    //console.log(app.dom.gantt.clientWidth);
                    //app.dom.gantt.style.width = app.dom.gantt.clientWidth + 1000 + 'px';
                    //$('.gantt_data_area')[0].style.transform = 'scaleX(1.'+ String(_s).replace(/\./,'') +')';

                    $(grid).css('z-index', '2')
                        .css('position','relative');
                    $(task)
                        .css('z-index', '1')
                        .css('transform', 'scaleX(1.'+ String(_s).replace(/\./,'') +')');

                    //gantt.render();

                    //task.style.transform = 'scaleX(1.'+ String(_s).replace(/\./,'') +')';

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

    /**
     * Uses: app.action.chart.durationDisplay(task)
     * @param task
     * @returns {string}
     */
    o.durationDisplay = function (task) {
        var days = (Math.abs((task.start_date.getTime() - task.end_date.getTime())/(86400000)) ).toFixed(1);
        return ((days%1==0) ? Math.round(days) : days) + ' d';
    }

})(jQuery, OC, app);
