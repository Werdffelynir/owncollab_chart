if(App.namespace) { App.namespace('Action.Chart', function(App) {


    /**
     * @namespace App.Action.Chart
     * @type {*}
     */
    var chart = {
        contentElement:null,
        tasks:null,
        links:null,
        zoomValue: 2
    };

    var GanttConfig = App.Config.GanttConfig;
    var DataStore = App.Module.DataStore;
    var DateTime = App.Extension.DateTime;
    var Error = App.Action.Error;
    var GanttExt = App.Action.GanttExt;
    var Sidebar = App.Action.Sidebar;


    /**
     * @namespace App.Action.Chart.init
     * @param contentElement
     */
    chart.init = function (contentElement){
        chart.contentElement = contentElement;
        chart.tasks = DataStore.get('tasks');
        chart.links = DataStore.get('links');

        chart.ganttInit();
    };


    /**
     *
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

    chart.ganttInit = function (){

        gantt.init(chart.contentElement);

        var filteringTasks = chart.filteringTasks();

        // include gantt configs
        GanttConfig.init(gantt, 'admin');


        // run parse data
        gantt.parse({
            data: filteringTasks,
            links: chart.links
        });
    };


    /**
     * Run ZoomSlider
     * Uses: app.action.chart.enableZoomSlider()
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






    return chart

})}