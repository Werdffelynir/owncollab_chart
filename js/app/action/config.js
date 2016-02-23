/**
 * Action config.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.config !== 'object')
        app.action.config = {};

    // alias of app.action.config
    var o = app.action.config;

    /**
     * Dynamic action options
     */
    o.opt = {};

    /**
     * Common gantt.config
     */
    o.init = function(){

/*        gantt.config.start_date = app.timeStrToDate(app.action.chart.taskProjectData.start_date);
        gantt.config.end_date = app.timeStrToDate(app.action.chart.taskProjectData.end_date);
        console.log(app.action.chart.taskProjectData);
        console.log();
        console.log();*/

        /**
         * Global Date format
         * @type {string}
         */
        gantt.config.api_date  = "%Y-%m-%d %H:%i";
        gantt.config.task_date = "%Y-%m-%d %H:%i";
        gantt.config.date_grid = "%Y-%m-%d %H:%i";

        gantt.config.grid_resize = true;

        /**
         * Visibly task text
         *
         * @param start
         * @param end
         * @param task
         * @returns {*}
         */
        gantt.templates.task_text = function(start, end, task){
            if(app.data.project['show_task_name'] == 1)
                return task.text;
            else
                return "";
        };

        // Defines the style of task bars
        gantt.templates.grid_row_class = gantt.templates.task_row_class = function(start, end, task){
            return "gc_default_row";
        };

        // Styling the gantt chart. Column tasks names size width
        gantt.config.row_height = 22;

        // Enables automatic adjusting of the grid's columns to the grid's width
        gantt.config.autofit = false;

        // Chart to re-render the scale each time a task doesn't fit into the existing scale interval
        gantt.config.fit_tasks = true;

        // Auto scheduling makes the start date of the second task update according to the end date
        // of the first task each when it changes.
        gantt.config.auto_scheduling = true;

        // Enables the auto scheduling mode, in which tasks will always be rescheduled to the earliest possible date
        gantt.config.auto_scheduling_strict = true;

        // Defines whether gantt will do autoscheduling on data loading
        gantt.config.auto_scheduling_initial = true;

        // Making the Gantt chart to display the critical path
        if(app.data.project['critical_path'] == 1) {
            //console.log(app.data.project['critical_path']);
            //gantt.config.highlight_critical_path = true;
            app.action.chart.showCriticalPath(true);
        }

        // Add red line "today"
        if(app.data.project['show_today_line'] == 1) {
            app.action.chart.showTodayLine();
        }

        // Apply scaling chart
        app.action.chart.scale(app.data.project['scale_type']);

        // Enable zoom slider
        app.action.chart.enableZoomSlider(app.data.project['scale_type']);

        // Apply scale fit
        if(app.data.project['scale_fit']) {
            app.action.chart.scaleFit();
        }

        // add style class to milestone display object
        gantt.templates.task_class  = function(start, end, task){
            switch (task.type){
                case "milestone":
                    return "gantt_milestone_size";
                    break;
            }
        };

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

            {name:"text", label:"Task name", tree:true, width: columnWidth.name, resize:true},

            {name:"start_date", label:"Start", align: "center", width: columnWidth.start, template: function(item) {
                return app.timeDateToStr(item.start_date, "%d.%m.%Y");
            }},

            {name:"end_date", label:"End", align: "center", width: columnWidth.end, template: function(item) {
                return app.timeDateToStr(item.end_date, "%d.%m.%Y");
            }},

            {name:"duration", label:"Duration", align: "center", width: columnWidth.duration, template: function(item) {
                var days = (Math.abs((item.start_date.getTime() - item.end_date.getTime())/(86400000)) ).toFixed(1);
                return ((days%1==0) ? Math.round(days) : days) + ' d';
            }},

            {name:"users", label:"Resources", align: "center", width: columnWidth.resources, template: function(item) {
                if (app.u.isArr(item.users)) {
                    return app.u.uniqueArr(item.users).join(', ');
                }else if(app.u.isStr(item.users)){
                    return item.users;
                }
                return '';
            }}

        ];

        // Advance configuration settings
        // for admin and users and guest (walk share)
        if(app.uid){
            o.internal();
        }
        else{
            o.external();
        }
    };


    /**
     * Internal gantt.config, for authorized user
     */
    o.internal = function(){

        if(!app.uid) return;

        gantt.config.columns.push({name:"added", label:"", width: 22, template: function(item) {
            return o.createTaskBtn('add', item.id);
        }});
        gantt.config.columns.push({name:"remove", label:"", width: 22, template: function(item) {
            return o.createTaskBtn('remove', item.id);
        }});
        gantt.config.columns.push({name:"edit", label:"", width: 22, template: function(item) {
            return o.createTaskBtn('edit', item.id);
        }});
    };



    /**
     * External gantt.config, for public
     */
    o.external = function(){

        // gantt lightbox disable
        gantt.showLightbox = function(id){};
        gantt.hideLightbox = function(id){};

        // Styling the gantt chart. Tasks column grid width size
        gantt.config.grid_width = 650;

    };

    o.createTaskBtn = function(type, id){
        var span = document.createElement('a');
        span.className = 'task_control_btn icon_' + type;
        span.setAttribute('data-control',type);
        span.setAttribute('data-id',id);
        return span.outerHTML;
    };

})(jQuery, OC, app);
