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

        /**
         * Global Date format
         * @type {string}
         */
        gantt.config.api_date  = "%Y-%m-%d %H:%i";
        gantt.config.task_date = "%Y-%m-%d %H:%i";
        gantt.config.date_grid = "%Y-%m-%d %H:%i";

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
                return "<strong>"+task.text+"</strong>";
            else
                return "";
        };

        // Defines the style of task bars
        gantt.templates.grid_row_class = gantt.templates.task_row_class = function(start, end, task){
            return "gc_default_row";
        };

        // Styling the gantt chart. Column tasks names size width
        gantt.config.row_height = 22;

        // Styling the gantt chart. Tasks column grid width size
        gantt.config.grid_width = 605;

        // Enables automatic adjusting of the grid's columns to the grid's width
        gantt.config.autofit = true;

        // Chart to re-render the scale each time a task doesn't fit into the existing scale interval
        gantt.config.fit_tasks = false;

        // Making the Gantt chart to display the critical path
        if(app.data.project['critical_path'] == 1)
            gantt.config.highlight_critical_path = true;

        // add red line "today"
        if(app.data.project['show_today_line'] == 1)
            app.action.chart.todayLine();

        // Apply scaling chart
        app.action.chart.scale(app.data.project['scale_type']);
        app.action.chart.enableZoomSlider(app.data.project['scale_type']);

        // apply scale fit
        if(app.data.project['scale_fit']){
            app.action.chart.scaleFit();
        }

        // Configures the columns of the table
        var columnWidth = {
            id: 20,
            name: 150,
            start: 100,
            end: 100,
            duration: 50,
            resources: 100,
            btn: 22
        };
        gantt.config.columns = [

            {name:"id", label:"ID", width: columnWidth.id, template: function(item) {
                return (item.$index + 1);
            }},

            {name:"text", label:"Task name", tree:true, width: columnWidth.name, resize:true},

            {name:"start_date", label:"Start", align: "center", width: columnWidth.start, template: function(item) {
                return app.timeDateToStr(item.start_date);
            }},

            {name:"end_date", label:"End", align: "center", width: columnWidth.end, template: function(item) {
                return app.timeDateToStr(item.end_date);
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
            }},

            {name:"added", label:"", width: columnWidth.btn, template: function(item) {
                return o.createTaskBtn('add', item.id);
            }},

            {name:"remove", label:"", width: columnWidth.btn, template: function(item) {
                return o.createTaskBtn('remove', item.id);
            }},

            {name:"edit", label:"", width: columnWidth.btn, template: function(item) {
                return o.createTaskBtn('edit', item.id);
            }}
        ];

        // Advance configuration settings
        // for admin and users and guest (walk share)
        if(app.uid && !app.guest){
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



    };



    /**
     * External gantt.config, for public
     */
    o.external = function(){

        // gantt lightbox disable, uses custom lightbox
        gantt.showLightbox = function(id){};
        gantt.hideLightbox = function(id){};

    };

    o.createTaskBtn = function(type, id){
        var span = document.createElement('a');
        span.className = 'task_control_btn icon_' + type;
        span.setAttribute('data-control',type);
        span.setAttribute('data-id',id);
        return span.outerHTML;
    };

})(jQuery, OC, app);
