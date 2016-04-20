if(App.namespace) { App.namespace('Config.GanttConfig', function(App) {

    /**
     * @namespace App.Config.GanttConfig
     * @type {*}
     */
    var conf = {
        type: 'public',
        dataProject: null,
        option: {}
    };

    /** @type {App.Extension.DateTime} */
    var DateTime = null;

    /** @type {App.Module.DataStore} */
    var DataStore = null;

    /** @type {App.Action.GanttExt} */
    var GanttExt = null;

    /** @type {App.Action.Error} */
    var Error = null;

    /**
     * @namespace App.Config.GanttConfig.init
     */
    conf.init = function () {

        DateTime = App.Extension.DateTime;
        DataStore = App.Module.DataStore;
        GanttExt = App.Action.GanttExt;
        Error = App.Action.Error;

        conf.type = App.Controller.Page.whoIs();
        conf.dataProject = DataStore.get('project');

        // base configs
        conf.base();

        // user configs, check users role
        if (App.uid) {
            // prov configs
            conf.prov();
            conf.user(App.isAdmin);
        }
        else conf.public();

    };


    /**
     * - Critical path calculation
     * - Auto Scheduling
     *
     * - Support of baselines, deadlines and other custom elements
     * - Simple API for hiding/showing columns of the grid
     * - Ability to resize grid columns and the grid itself from the UI
     * - Dynamic loading
     * - Tasks Grouping
     * @namespace App.Config.GanttConfig.prov
     */
    conf.prov = function(){

        // Auto scheduling makes the start date of the second task update according to the end date
        // of the first task each when it changes.
        gantt.config.auto_scheduling = true;

        // Enables the auto scheduling mode, in which tasks will always be rescheduled to the earliest possible date
        gantt.config.auto_scheduling_strict = true;

        // Defines whether gantt will do autoscheduling on data loading
        gantt.config.auto_scheduling_initial = false;

        // allows or forbids creation of links from parent tasks (projects) to their children
        gantt.config.auto_scheduling_descendant_links = false;

        // Making the Gantt chart to display the critical path
        if(conf.dataProject['critical_path'] == 1) {
            gantt.config.highlight_critical_path = true;
        }
    };


    /**
     * Base settings gantt.config
     * @namespace App.Config.GanttConfig.base
     */
    conf.base = function(){

        gantt.config.grid_resize = true;
        gantt.config.undo = true;
        gantt.config.redo = true;

        // add style class to milestone display object
        gantt.templates.task_class  = function(start, end, task){
            if(task.type == 'milestone'){ return "gantt_milestone_size" }
        };

        //Visibly task text
        gantt.templates.task_text = function(start, end, task){
            if(task.type == 'project') return "";
            else {
                if(conf.dataProject['show_task_name'] == 1) return task.text;
                else return "";
            }
        };

        // Defines the style of task bars
        gantt.templates.grid_row_class = gantt.templates.task_row_class = function(start, end, task){
            return "gc_default_row";
        };

        // Styling the gantt chart. Column tasks names size width
        gantt.config.row_height = 22;



        // Add red line "today"
        if(conf.dataProject['show_today_line'] == 1) {
            GanttExt.showTodayLine();
        }

        // Apply scaling chart
        conf.scale(conf.dataProject['scale_type']);

        // Enable zoom slider
        //GanttExt.enableZoomSlider(conf.dataProject['scale_type']);

        // Enables automatic adjusting of the grid's columns to the grid's width
        gantt.config.autofit = true;

        // Chart to re-render the scale each time a task doesn't fit into the existing scale interval
        gantt.config.fit_tasks = true;

        // Apply scale fit
        //if(conf.dataProject['scale_fit']) {
            //app.action.chart.scaleFit();
        //}


        // Configures the columns of the table
        var columnWidth = {
            id: 25,
            name: 150,
            start: 70,
            end: 70,
            duration: 50,
            resources: 100
        };

        // Styling the gantt chart. Tasks column grid width size
        gantt.config.grid_width = 550;

        gantt.config.columns = [

            {name:"id", label:"ID", width: columnWidth.id, template: function(item) {
                //return (item.$index + 1);
                return item.id;
            }},

            {name:"text", label: App.t('Taskname'), tree:true, width: columnWidth.name, resize:true},

            {name:"start_date", label: App.t('Start'), align: "center", width: columnWidth.start, template: function(item) {
                return DateTime.dateToStr(item.start_date, "%d.%m.%Y");
            }},

            {name:"end_date", label: App.t('End'), align: "center", width: columnWidth.end, template: function(item) {
                return DateTime.dateToStr(item.end_date, "%d.%m.%Y");
            }},

            {name:"duration", label: App.t('Duration'), align: "center", width: columnWidth.duration, template: function(item) {
                var days = (Math.abs((item.start_date.getTime() - item.end_date.getTime())/(86400000)) ).toFixed(1);
                return ((days%1==0) ? Math.round(days) : days) + ' d';
            }},

            {name:"users", label: App.t('Resources'), align: "center", width: columnWidth.resources, template: function(item) {
                if (Util.isArr(item.users)) {
                    return Util.uniqueArr(item.users).join(', ');
                }else if(Util.isStr(item.users)){
                    return item.users;
                }
                return '';
            }}

        ];

    };


    /**
     * Settings gantt.config, for authorized user
     * @namespace App.Config.GanttConfig.user
     */
    conf.user = function(isAdmin){

        gantt.config.columns.push({name:"added", label:"", width: 22, template: function(item) {
            return conf.createUITaskBtn('add', item.id);
        }});
        gantt.config.columns.push({name:"remove", label:"", width: 22, template: function(item) {
            return conf.createUITaskBtn('remove', item.id);
        }});
        gantt.config.columns.push({name:"edit", label:"", width: 22, template: function(item) {
            return conf.createUITaskBtn('edit', item.id);
        }});

        // gantt lightbox disable for usually users (not admins)
        if(!isAdmin){
            gantt.showLightbox = function(id){};
            gantt.hideLightbox = function(id){};
            Error.inline(App.t('You do not have the right to modify the chart'), App.t('Information') + ': ');
        }
    };


    /**
     * Settings gantt.config, for public sharing
     * @namespace App.Config.GanttConfig.public
     */
    conf.public = function(){

        // gantt lightbox disable
        gantt.showLightbox = function(id){};
        gantt.hideLightbox = function(id){};

        // Styling the gantt chart. Tasks column grid width size
        gantt.config.grid_width = 650;

    };


    /**
     *
     * @namespace App.Config.GanttConfig.createUITaskBtn
     * @param type
     * @param id
     * @returns {string}
     */
    conf.createUITaskBtn = function(type, id){
        var span = document.createElement('a');
        span.className = 'task_control_btn icon_' + type;
        span.setAttribute('data-control',type);
        span.setAttribute('data-id',id);
        return span.outerHTML;
    };



    /**
     * Setting up the gantt chart scale
     * @namespace App.Config.GanttConfig.scale
     * @param type scale size
     */
    conf.scale = function (type){

        var event = null;

        // Type of scale size
        type = type || 'month';
        //o.opt.currentScaleType = type = (o.opt.typesScales.indexOf(type) === -1) ? "month" : type;

        /* Common for all scales */
        gantt.config.scale_unit = type; // Sets the unit of the time scale (X-Axis) can be: "minute", "hour", "day", "week", "quarter", "month", "year"
        gantt.config.scale_height = 50; // Sets the height of the time scale and the header of the grid
        gantt.config.min_column_width = 20; // Sets the minimum width for a column in the timeline area

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
                var eventName = (conf.option.ganttIsInit == false) ? 'onGanttRender' : 'onBeforeGanttRender';
                event = gantt.attachEvent(eventName, function(){
                    conf.option.ganttIsInit = true;
                    conf.option.weekCount = 0;
                    gantt.templates.date_scale = function(date) {
                        if(!conf.option.weekRecount) {
                            conf.option.weekRecount = app.timeDateToStr(date);
                        }else if(conf.option.weekRecount == app.timeDateToStr(date)){
                            conf.option.weekCount = 0;
                        }
                        return "<strong>" + ( ++ conf.option.weekCount ) + " Week</strong>";
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



    return conf;

})}