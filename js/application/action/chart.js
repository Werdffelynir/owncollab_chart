if(App.namespace) { App.namespace('Action.Chart', function(App) {


    /**
     * @namespace App.Action.Chart
     * @type {*}
     */
    var chart = {
        contentElement:null,
        tasks:null,
        links:null
    };

    var DataStore = App.Module.DataStore;


    /**
     * @namespace App.Action.Chart.init
     * @param contentElement
     * @param DataStore
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
                app.data.baseProjectTask = o.baseProjectTask = app.u.objClone(task);

                task['parent'] = '0';
                task['is_project'] = '1';

                if(app.data.tasks.length === 1)
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
            task.start_date_origin = app.timeStrToDate(task.start_date);
            task.end_date_origin = app.timeStrToDate(task.end_date);

            return task;
        });
    };

    chart.ganttInit = function (){

        gantt.init(chart.contentElement);

        // run parse data
        var filteringData = chart.filteringTasks();

        //gantt.parse(filteringData);

        return chart;
    };









    return chart

})}