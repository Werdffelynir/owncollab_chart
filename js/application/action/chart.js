if(App.namespace) { App.namespace('Action.Chart', function(App) {

    //var GanttEve = App.Event.GanttEve;
    var GanttConfig = App.Config.GanttConfig;
    var DataStore = App.Module.DataStore;
    var DateTime = App.Extension.DateTime;
    var Project = App.Action.Project;
    var Error = App.Action.Error;
    var GanttExt = App.Action.GanttExt;
    var Sidebar = App.Action.Sidebar;
    var Lightbox = App.Action.Lightbox;

    /**
     * @namespace App.Action.Chart
     * @type {*}
     */
    var chart = {
        contentElement:null,
        lastLinkId:0,
        tasks:null,
        links:null,
        zoomValue: 2
    };

    /**
     * @namespace App.Action.Chart.init
     * @param contentElement
     * @param callbackGanttReady
     * @param callbackGanttLoaded
     */
    chart.init = function (contentElement, callbackGanttReady, callbackGanttLoaded){

        chart.contentElement = contentElement;
        chart.tasks = DataStore.get('tasks');
        chart.links = DataStore.get('links');

        chart.ganttInit(callbackGanttReady, callbackGanttLoaded);
    };


    /**
     * @namespace App.Action.Chart.filteringTasks
     * @returns {*}
     */
    chart.filteringTasks = function (){

        return chart.tasks.map( function(task) {

            if(task['id'] == 1){

                // Cloning project task to property app.action.chart.baseProjectTask
                DataStore.put('projectTask', task);

                task['parent'] = '0';
                task['is_project'] = '1';

                if(chart.tasks.length === 1)
                    task['type'] = 'task';
                else {
                    task['type'] = 'project';
                }
            }

            if(task['duration'] < 1){
                task['duration'] = 1;
            }

            // Buffer update date position to time with buffer
            task.is_buffered = false;
            task.start_date_origin = DateTime.strToDate(task.start_date);
            task.end_date_origin = DateTime.strToDate(task.end_date);

            return task;
        });
    };

    /**
     *
     * @namespace App.Action.Chart.ganttInit
     * @param callbackGanttReady
     * @param callbackGanttLoaded
     */
    chart.ganttInit = function (callbackGanttReady, callbackGanttLoaded){

        // Int first app parts modules
        gantt.attachEvent('onGanttReady', callbackGanttReady);
        gantt.attachEvent('onParse', callbackGanttLoaded);

        // run gantt init
        gantt.init(chart.contentElement);


        // run parse data
        var filteringTasks = chart.filteringTasks();

        // Project Control
        Project.init();

        // run Sort
        App.Action.Sort.init();

        // run gantt configs
        GanttConfig.init();

        // run Sidebar
        Sidebar.init();

        // run Lightbox
        Lightbox.init();

        gantt.parse({
            data: filteringTasks,
            links: chart.links
        });

    };



    /**
     * Run ZoomSlider
     * @namespace App.Action.Chart.enableZoomSlider
     */
    chart.enableZoomSlider = function () {

        $(app.dom.zoomSliderMin).click(function(){
            chart.zoomValue --;
            chart.changeScaleByStep();
        });
        $(app.dom.zoomSliderPlus).click(function(){
            chart.zoomValue ++;
            chart.changeScaleByStep();
        });
        $(app.dom.zoomSliderFit).click(GanttExt.scaleFit);

        $(app.dom.zoomSlider)
            .show()
            .slider({
                min: 1,
                max: 3,
                value: chart.zoomValue,
                step:1,
                change: function (event, ui) {
                    chart.zoomValue = parseInt(ui.value);
                    chart.changeScaleByStep();
                }
            });
    };

    /**
     *
     * @namespace App.Action.Chart.changeScaleByStep
     */
    chart.changeScaleByStep = function(){
        var value = parseInt(chart.zoomValue);
        if(value > 3) value = 0;
        if(value < 0) value = 3;

        switch (value) {
            case 3:
                GanttConfig.scale('hour');
                break;
            case 2:
                GanttConfig.scale('day');
                break;
            case 1:
                GanttConfig.scale('week');
                break;
        }
        gantt.render();
    };


    /**
     * internal iterator for links
     * @namespace App.Action.Chart.linkIdIterator
     * @returns {number}
     */
    chart.linkIdIterator = function(){
        return chart.lastLinkId ++;
    };


    return chart

})}