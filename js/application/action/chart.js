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
     * App.Action.Chart.lastlinkid
     * App.Action.Chart.lasttaskid
     * @type {*}
     */
    var chart = {
        contentElement:null,
        lastlinkid:0,
        lasttaskid:0,
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
        gantt.attachEvent("onAfterLinkAdd", chart.onAfterLinkAdd);
        //gantt.attachEvent("onAfterLinkDelete", lbox.onAfterLinkDelete);
        //gantt.attachEvent("onAfterLinkUpdate", lbox.onAfterLinkUpdate);
        gantt.attachEvent("onTaskClick", chart.onTaskClick);

        // tasks events
        gantt.attachEvent("onAfterTaskAdd", chart.onAfterTaskAdd);
        gantt.attachEvent("onAfterTaskUpdate", chart.onAfterTaskUpdate);



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

        // inti function save data
        chart.savedButtonInit();

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

        $(App.node('zoomSliderMin')).click(function(){
            chart.zoomValue --;
            chart.changeScaleByStep();
        });
        $(App.node('zoomSliderPlus')).click(function(){
            chart.zoomValue ++;
            chart.changeScaleByStep();
        });
        $(App.node('zoomSliderFit')).click(GanttExt.scaleFit);

        $(App.node('zoomSlider'))
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
     * @param index
     * @returns {number}
     */
    chart.linkIdIterator = function(index){
        if(index) chart.lastlinkid = index;
        return chart.lastlinkid ++;
    };

    /**
     * internal iterator for tasks
     * @namespace App.Action.Chart.taskIdIterator
     * @param index
     * @returns {number}
     */
    chart.taskIdIterator = function(index){
        if(index) chart.lasttaskid = index;
        return chart.lasttaskid ++;
    };



    chart.savedButtonInit = function(){
        var ganttSave = App.node('ganttSave');
        var ganttSaveLoadIco = App.node('ganttSaveLoadIco');

        ganttSaveLoadIco.style.visibility = 'hidden';


        ganttSave.onclick = function(event){
            ganttSaveLoadIco.style.visibility = 'visible';

            App.Action.Api.saveAll(function(response){
                ganttSaveLoadIco.style.visibility = 'hidden';
                console.log(response);
            });

            //setTimeout(function(){
            //    ganttSaveLoadIco.style.visibility = 'hidden';
            //},2000);
        };

    };




    /**
     * @namespace App.Action.Chart.durationDisplay
     * @param task
     * @returns {string}
     */
    chart.durationDisplay = function (task) {
        var days = (Math.abs((task.start_date.getTime() - task.end_date.getTime())/(86400000)) ).toFixed(1);
        return ((days%1==0) ? Math.round(days) : days) + ' d';
    };


    /**
     * @namespace App.Action.Chart.getLinkOnTask
     * @param task_id
     * @returns {{source: Array, target: (Array|*)}}
     */
    chart.getLinkOnTask = function(task_id){
        return {
            source:gantt.getTask(task_id).$source,
            target:gantt.getTask(task_id).$target
        }
    };

    /**
     * @namespace App.Action.Chart.scrollToTask
     * @param task_id
     */
    chart.scrollToTask = function(task_id){
        var pos = $(gantt.getTaskNode(task_id)).position();
        console.log(task_id, pos);
        //gantt.scrollTo(pos.left, pos.top)
    };



    // Gantt events


    chart.onAfterLinkAdd = function  (id, item){
        gantt.changeLinkId(id, chart.linkIdIterator());
    };

    chart.onAfterLinkUpdate = function  (id, item){
        //app.action.event.requestLinkUpdater('update', id, item);
    };

    chart.onAfterLinkDelete = function  (id, item){
        //app.action.event.requestLinkUpdater('delete', id, item);
    };

    chart.onAfterTaskUpdate = function(id, task){

        task.start_date_origin = Util.objClone(task.start_date);
        task.end_date_origin = Util.objClone(task.end_date);

        if(task.is_new == 1)
            gantt.changeTaskId(id, chart.taskIdIterator());

        // change types task and project by nesting
        if(task.id != 1){
            var parent = gantt.getTask(task.parent);
            if(parent.type != 'project'){
                parent.type = 'project';
                gantt.updateTask(parent.id);
            }
        }

        return false;
    };


    chart.onTaskClick = function (id, event){
        var target = event.target;

        // control buttons
        if(target.tagName == 'A' && target.getAttribute('data-control')){
            event.preventDefault();
            //app.action.chart.opt.isNewTask = false;
            var action = target.getAttribute('data-control');
            switch (action) {

                case "edit":
                    gantt.showLightbox(id);
                    break;

                case "add":
                    //app.action.chart.opt.isNewTask = true;
                    var _id = chart.taskIdIterator();
                    console.log(_id);
                    console.log(id);
                    var _date = new Date(gantt.getTask(id).start_date);
                    var _task = {
                        id: _id,
                        type: gantt.config.types.task,
                        text: "New Task",
                        users: '',
                        start_date: _date,
                        end_date: DateTime.addDays(5, _date),
                        predecessor: '',
                        is_buffered: false,
                        is_new: true,
                        progress: 0,
                        duration: 0,
                        order: 0,
                        sortorder: 0,
                        open: 0,
                        buffer: 0
                    };
                    gantt.addTask(_task, id);
                    break;

                case "remove":
                    var _task = gantt.getTask(id);

                    // binding for find parent after delete
                    //o.taskToDelete = {id:_task.id, parent:_task.parent};

                    gantt.confirm({
                        title: gantt.locale.labels.confirm_deleting_title,
                        text: _task.text + " " +(_task.id)+ " - " + App.t('will be deleted permanently, are you sure?'),
                        callback: function(res){
                            if(res)
                                gantt.deleteTask(id);
                        }
                    });
                    break;
            }
            return false;
        }
        // important
        return event;
    };


    chart.onAfterTaskAdd = function  (id, item){
        chart.scrollToTask(id);
        gantt.showLightbox(id);
    };


    return chart

})}