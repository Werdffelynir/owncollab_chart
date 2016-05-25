if(App.namespace) { App.namespace('Action.Chart', function(App) {

    'use strict';

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
        zoomValue: 2,
        isInit: false
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

            // fixed date if
            /*if(DateTime.strToDate(task.start_date).getTime() >= DateTime.strToDate(task.end_date).getTime()) {
                task.end_date = DateTime.dateToStr( DateTime.addDays(7, DateTime.strToDate(task.start_date)) );
            }*/

/*            if(task['duration'] < 1){
                task['duration'] = 1;
            }*/

            // Buffer update date position to time with buffer
            task.is_buffered = false;
            //console.log('START INIT --------->>>>>>',task.start_date,DateTime.strToDate(task.start_date) );
            //task.start_date_origin = DateTime.strToDate(task.start_date);
            //task.end_date_origin = DateTime.strToDate(task.end_date);

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
        gantt.attachEvent("onBeforeLinkAdd", chart.onBeforeLinkAdd);
        gantt.attachEvent("onAfterLinkAdd", chart.onAfterLinkAdd);
        gantt.attachEvent("onAfterLinkDelete", chart.onAfterLinkDelete);
        //gantt.attachEvent("onAfterLinkUpdate", chart.onAfterLinkUpdate);
        gantt.attachEvent("onTaskClick", chart.onTaskClick);

        // tasks events
        //gantt.attachEvent("onBeforeTaskDelete", chart.onBeforeTaskDelete);
        gantt.attachEvent("onAfterTaskAdd", chart.onAfterTaskAdd);
        gantt.attachEvent("onAfterTaskUpdate", chart.onAfterTaskUpdate);
        gantt.attachEvent("onAfterTaskDelete", chart.onAfterTaskDelete);
        gantt.attachEvent("onBeforeTaskUpdate", chart.onBeforeTaskUpdate);

        gantt.attachEvent("onBeforeGanttRender", chart.onBeforeGanttRender);
        gantt.attachEvent("onGanttRender", chart.onGanttRender);
        gantt.attachEvent("onBeforeTaskDrag", chart.onBeforeTaskDrag);

        if(App.isPublic) {
            gantt.config.readonly = true;
            Error.inline('Read-only', 'Access ')
        }


        // ------------------ configure ------------------
        //gantt.config.work_time = true;
        //gantt.config.correct_work_time = true;

        gantt.config.initial_scroll = true;
        gantt.config.server_utc = true;

        //gantt.config.keep_grid_width = true;
        //gantt.config.drag_resize = false;
        //gantt.config.autofit = false;

        // ------------------ run gantt init ------------------
        gantt.init(chart.contentElement);

        // run parse data
        var filteringTasks = chart.filteringTasks();

        // Project Control
        Project.init();

        // run Sort
        if(!App.isPublic)
            App.Action.Sort.init();

        // run gantt configs
        GanttConfig.init();

        // run Sidebar
        if(!App.isPublic)
            Sidebar.init();

        // run Lightbox
        Lightbox.init();

        // Enable function save gantt data
        if(!App.isPublic)
            chart.savedButtonInit();

        // Enable zoom slider
        if(!App.isPublic)
            chart.enableZoomSlider();

        // Gantt attachEvent OnAfterTaskAutoSchedule
        //App.Action.Buffer.attachEventOnAfterTaskAutoSchedule();

        //gantt.attachEvent("onAfterTaskAutoSchedule", App.Action.Buffer.onAfterTaskAutoSchedule);

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
     * @param is_init
     * @returns {number}
     */
    chart.taskIdIterator = function(index){
        if(index)
            chart.lasttaskid = index;
        else
            return ++ chart.lasttaskid ;
    };



    chart.savedButtonInit = function(){
        var ganttSave = App.node('ganttSave');
        var ganttSaveLoadIco = App.node('ganttSaveLoadIco');

        ganttSaveLoadIco.style.visibility = 'hidden';

        ganttSave.onclick = function(event){
            ganttSaveLoadIco.style.visibility = 'visible';

            App.Action.Api.saveAll(function(response){
                ganttSaveLoadIco.style.visibility = 'hidden';
                console.log('saveAll >>>', response);
            });

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
        var pos = gantt.getTaskNode(task_id); //$(gantt.getTaskNode(task_id)).position();
        // offsetLeft // offsetTop
        //console.log('scrollToTask >>>', task_id, pos, pos.offsetLeft, pos.offsetTop);
        if(typeof pos === 'object'){
            //console.log(task_id, pos, pos.offsetLeft, pos.offsetTop);
            //gantt.scrollTo(pos.left, pos.top)
            gantt.scrollTo(pos.offsetLeft - 100, pos.offsetTop)
        }
    };

    /**
     * @namespace App.Action.Chart.scrollToTaskOnlyHorizontal
     * @param task_id
     */
    chart.scrollToTaskOnlyHorizontal = function(task_id){
        var pos = gantt.getTaskNode(task_id);
        //console.log('scrollToTaskOnlyHorizontal >>>', pos.offsetLeft, pos.offsetTop);
        gantt.scrollTo(pos.offsetLeft - 100, null)
    };


    // Gantt events
    chart.onBeforeLinkAdd = function  (id, link){
        /**
         * Removed other links
         */

        var sourceTask = gantt.getTask(link.source);
        var targetTask = gantt.getTask(link.target);

        var predecessor = App.Action.Buffer.getTaskPredecessor(link.target);
        if(predecessor && targetTask.id != predecessor.id) {
            App.Action.Lightbox.predecessorLast = {dataTaskid:predecessor.id};
            App.Action.Lightbox.deleteLink(predecessor.id, link.target);
            gantt.render();
        }

        try{
            var buffersObject = JSON.parse(targetTask.buffers);
            buffersObject.p = sourceTask.id;
            targetTask.buffers = JSON.stringify(buffersObject);
        }catch(error){}

        return true;
    };
    chart.onAfterLinkAdd = function  (id, item){
        gantt.changeLinkId(id, chart.linkIdIterator());
    };

    chart.onAfterLinkUpdate = function  (id, item){
        chart.readySave = true;
    };

    chart.onAfterLinkDelete = function  (id, item){
        chart.readySave = true;
    };

    chart.onBeforeTaskUpdate = function (id, item) {
        //var predecessor = App.Action.Buffer.getTaskPredecessor(id);
        //if(predecessor){}
        return true;
    };

    /**
     * @namespace App.Action.Chart.bufferReady
     * @type {boolean}
     */
    //chart.bufferReady = true;

    chart.onAfterTaskUpdate = function(id, task){

        chart.readySave = true;

        //task.start_date_origin = Util.objClone(task.start_date);
        //task.end_date_origin = Util.objClone(task.end_date);

        var predecessor = App.Action.Buffer.getTaskPredecessor(id);

        //console.log('task predecessor', task, predecessor);

        if(predecessor){
            App.Action.Buffer.accept(predecessor, task);
        }

        var successors = App.Action.Buffer.getTaskSuccessors(id);
        if(successors){
            chart.readySave = false;
            successors.map(function(successor_item){
                App.Action.Buffer.accept(task, successor_item);
                gantt.updateTask(successor_item.id);
            });
            gantt.render();
        }

        // change types task and project by nesting
        if(task.id != 1) {
            var parent = gantt.getTask(task.parent);
            if(parent.type != 'project'){
                parent.type = 'project';
                gantt.updateTask(parent.id);
            }
            if(gantt.getChildren(id).length == 0 && task.type == 'project'){
                task.type = 'task';
                gantt.updateTask(parent.id);
            }
        }

        task.is_buffered = false;
        return false;
    };



    /**
     *
     * @namespace App.Action.Chart.onBeforeTaskDelete
     * @param id
     * @param task
     * @returns {boolean}
     */
    chart.onBeforeTaskDelete = function (id, task){
        //console.log(this, this);
        //console.log(task.type, task.id);
        //
        //dhtmlx.message({type:"error", text:"Enter task description!"});
        //return false;

        //if(task.type == 'project')
        //return true;
        //else
        //    return true;
    };

    chart.onAfterTaskDelete = function (id, task){
        chart.readySave = true;
        chart.onGanttRender();
    };

    chart.onTaskClick = function (id, event){
        var target = event.target;

        // scroll to Horizontal
        //chart.scrollToTaskOnlyHorizontal(id);

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
                    //console.log('_id', _id, 'parent-id', id);

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
                    if(_task.type == 'project' && id == 1)
                        break;

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


    /**
     * Dynamic change size of chart, when browser window on resize
     */
    chart.ganttDynamicResize = function(){
        window.addEventListener('resize', function onWindowResize(event){
            chart.ganttFullSize();
            gantt.render();
        }, false);
    };

    /**
     * Performs resize the HTML Element - gantt chart, establishes the dimensions to a full page by width and height
     * Use: app.action.chart.ganttFullSize()
     */
    chart.ganttFullSize = function (){
        $(app.dom.gantt)
            .css('height',(window.innerHeight-100) + 'px')
            .css('width',(window.innerWidth) + 'px');
    };

    /**
     * Performs resize the HTMLElement - gantt chart, establishes the dimensions to a size HTMLElement - #content
     * @namespace App.Action.Chart.ganttInblockSize
     */
    chart.ganttInblockSize = function (){
        $(App.node('gantt'))
            .css('height',(window.innerHeight-100) + 'px')
            .css('width', $(App.node('content')).outerHeight() + 'px');
    };

    /**
     * @namespace App.Action.Chart.enabledZoomFit
     */
    chart.enabledZoomFit = function (btnElem){
        $(btnElem).click(function(){
            App.Action.Fitmode.toggle();
        });
    };

    chart.onAfterTaskAdd = function  (id, item){
        Timer.after(200, function(){
            chart.scrollToTask(id);
            gantt.showLightbox(id);
        });
    };

    chart.onBeforeGanttRender = function () {

        //gantt.eachTask(function(task){
        //
        //    console.log(gantt.getChildren(task.id));
        //}, 1);

        //else if( gantt.getChildren(task.id).length > 0 )
        //    task['type'] = 'project';
        //else {
        //    task['type'] = 'task';
        //}

    };

    chart.readySave = false;
    chart.readyRequest = true;
    chart.onGanttRender = function () {

        // AUTO-SAVE
        var ganttSaveLoadIco = App.node('ganttSaveLoadIco');
        if(chart.readySave === true && chart.readyRequest === true){

            ganttSaveLoadIco.style.visibility = 'visible';
            chart.readySave = false;
            chart.readyRequest = false;

            //console.log('SAVE REQUEST START');
            //Timer.after(1000, function(){ });
            setTimeout(function(){
                App.Action.Api.saveAll(function(response){
                    console.log('SAVE REQUEST END');
                    chart.readyRequest = true;
                    ganttSaveLoadIco.style.visibility = 'hidden';
                });

            }, 1000);

        }

    };

    /**
     * @namespace App.Action.Chart.taskReplace
     * @param task_id
     */
    chart.taskReplace = function (task_id) {
        var task = gantt.getTask(task_id);
        var ds = DateTime.addDays(-1.6, task.start_date);
        var de = DateTime.addDays(-1.6, task.end_date);
    };


    /**
     * @namespace App.Action.Chart.taskReplace
     * @param ms
     */
    chart.saveTimerStart = function (ms) {
/*        ms = parseInt(ms) < 5000 ? 5000 : parseInt(ms);
        var ganttSaveLoadIco = App.node('ganttSaveLoadIco');
        var timer = new Timer(ms);

        timer.onprogress = function(){
            ganttSaveLoadIco.style.visibility = 'visible';
            App.Action.Api.saveAll(function(response){
                ganttSaveLoadIco.style.visibility = 'hidden';
                console.log('Auto save complete! ' + timer.iterator);
            });
        };
        timer.start();*/
    };

    /**
     * @namespace App.Action.Chart.saveConfirmExit
     * @param switcher
     * @returns {boolean}
     */
    chart.saveConfirmExit = function (switcher) {
        console.log('Switcher Confirm Exit! ' + switcher);
        return false;
    };

    /**
     * Disabled drag-and-drop operation for task with predecessor
     * @param id
     * @param mode
     * @param e
     * @returns {boolean}
     */
    chart.onBeforeTaskDrag = function (id, mode, e) {
        var predecessor = App.Action.Buffer.getTaskPredecessor(id);

        if(mode == 'move' && predecessor){
            return false;
        }
        else if(mode == 'resize' && predecessor && e.target.className.indexOf('task_left') !== -1){
            return false;
        }

        return true
    };


    return chart

})}




