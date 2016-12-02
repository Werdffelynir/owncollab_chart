if(App.namespace) { App.namespace('Action.GanttExt', function(App) {

    /**
     * Extension methods for graphics dhtmlxgantt
     */


    /**
     *
     * @namespace App.Action.GanttExt
     * @type {*}
     */
    var ganttExt = {};
    var Error = null;

    /**
     * @namespace App.Action.GanttExt.init
     * @param error
     */
    ganttExt.init = function(error) {
        Error = error;
    };

    /**
     * Dynamic change size of chart, when browser window on resize
     * @namespace App.Action.GanttExt.ganttDynamicResize
     */
    ganttExt.ganttDynamicResize = function() {
        window.addEventListener('resize', function onWindowResize(event){
            ganttExt.ganttFullSize();
            gantt.render();
        }, false);
    };

    /**
     * Performs resize the HTML Element - gantt chart, establishes the dimensions to a full page by width and height
     * @namespace App.Action.GanttExt.ganttFullSize
     */
    ganttExt.ganttFullSize = function (){
        $(App.node('gantt'))
            .css('height',(window.innerHeight-100) + 'px')
            .css('width',(window.innerWidth) + 'px');
    };

    /**
     * Performs resize the HTMLElement - gantt chart, establishes the dimensions to a size HTMLElement - #content
     * @namespace App.Action.GanttExt.ganttInblockSize
     */
    ganttExt.ganttInblockSize = function (){
        $(App.node('gantt'))
            .css('height',(window.innerHeight-100) + 'px')
            .css('width', $(App.node('content')).outerHeight() + 'px');
    };

    /**
     * Adds a marker "today" to the timeline area
     * @namespace App.Action.GanttExt.showMarkers
     */
    ganttExt.showMarkers = function (show){
        gantt.config.show_markers = !!show;
    };

    /**
     * Show today red line
     * @namespace App.Action.GanttExt.showTodayLine
     */
    ganttExt.showTodayLine = function (){
        var date_to_str = gantt.date.date_to_str(gantt.config.task_date, true),
            today = new Date();

        gantt.addMarker({
            css: "today",
            title:"Today: "+ date_to_str(today),
            start_date: today
        });
    };

    /**
     * Show task names on time lines
     * @namespace App.Action.GanttExt.showTaskNames
     * @param show
     */
    ganttExt.showTaskNames = function (show){
        //Visibly task text
        gantt.templates.task_text = function(start, end, task){
            return "";
        };
        gantt.templates.rightside_text = function(start, end, task){
            if(show &&  task.type != 'project')
                return task.text;
            else
                return "";
        };

        /*gantt.templates.task_text = function(start, end, task){
            if(show &&  task.type != 'project')
                return task.text;
            else
                return "";
        };*/

    };

    /**
     * Show tasks in User Colors
     * @namespace App.Action.GanttExt.showUserColor
     * @param show
     */

    ganttExt.showUserColor = function (show){
        if(show) {

            App.Action.Project.dataProject['show_user_color'] = 1;

            var project = App.Action.Project.dataProject;
            var tasks = App.Action.Project.tasks(true);

            Timer.after(500, function(t){
                tasks.forEach(function(t){
                    if(typeof t !== 'object') return;

                    var firstUser = false;
                    try {
                        var resources = JSON.parse(t.users);
                        firstUser = resources.users[0];
                    } catch (e) {}
                    if (firstUser)
                        App.Action.Chart.colorByUid(firstUser, gantt.getTaskNode(t.id));

/*                    var firstUser = t.users.split(',')[0].trim();
                    if(firstUser.length > 2)
                        App.Action.Chart.colorByUid(t.users.split(',')[0].trim(), gantt.getTaskNode(t.id));*/
                });
            }, [tasks]);

        }else
            App.Action.Project.dataProject['show_user_color'] = 0;
    };

    /**
     * Show critical path
     * @namespace App.Action.GanttExt.showCriticalPath
     * @param show
     */
    ganttExt.showCriticalPath = function (show){
        gantt.config.highlight_critical_path = !!show;
    };

    /**
     * Gantt chart resize. Apply a scale fit
     * @namespace App.Action.GanttExt.scaleFit
     */
    ganttExt.scaleFit = function (){
        //App.Action.Fitmode.toggle()
    };

    /**
     * Generate Share Link for event
     * @namespace App.Action.GanttExt.generateShareLink
     * @param key
     * @returns {string}
     */
    ganttExt.generateShareLink = function(key){
        return OC.getProtocol() + '://' + OC.getHost() + OC.generateUrl('s/' + key);
    };


    return ganttExt;

})}