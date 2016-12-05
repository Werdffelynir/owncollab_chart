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

    chart.states = [];

    /**
     * @namespace App.Action.Chart.readySave
     * @type {boolean}
     */
    chart.readySave = false;

    /**
     * @namespace App.Action.Chart.readyRequest
     * @type {boolean}
     */
    chart.readyRequest = true;

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
     * @namespace App.Action.Chart.addStates
     * @param tasks
     */
    chart.addStates = function (tasks) {
        chart.states = tasks;
    };
    /**
     * @namespace App.Action.Chart.addState
     * @param task
     */
    chart.addState = function (task) {
        var i, added = false;
        for (i = 0; i < chart.states.length; i ++) {
            if(chart.states[i].id == task.id) {
                chart.states[i] = task;
                added = true;
                break;
            }
        }
        if(!added && typeof task === 'object' && task.id !== undefined)
            chart.states.push(task);
    };

    /**
     * @namespace App.Action.Chart.getState
     * @param id
     */
    chart.getState = function (id) {
        for (i = 0; i < chart.states.length; i ++)
            if(chart.states[i].id == id)
                return chart.states[i];
        return false;
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
        gantt.attachEvent("onBeforeTaskDelete", chart.onBeforeTaskDelete);
        gantt.attachEvent("onAfterTaskAdd", chart.onAfterTaskAdd);
        gantt.attachEvent("onAfterTaskUpdate", chart.onAfterTaskUpdate);
        gantt.attachEvent("onAfterTaskDelete", chart.onAfterTaskDelete);
        gantt.attachEvent("onBeforeTaskUpdate", chart.onBeforeTaskUpdate);

        gantt.attachEvent("onBeforeGanttRender", chart.onBeforeGanttRender);
        gantt.attachEvent("onGanttRender", chart.onGanttRender);
        gantt.attachEvent("onBeforeTaskDrag", chart.onBeforeTaskDrag);
        gantt.attachEvent("onAfterTaskDrag", chart.onAfterTaskDrag);

        gantt.attachEvent("onTaskRowClick", function(id, row) {

            //console.log(
            //    App.Action.Keyevent.tableEditableEnabled,
            //    App.Action.Keyevent.editableTaskId,
            //    id
            //);

            // disable grid table editable mode
            if(App.Action.Keyevent.tableEditableEnabled && App.Action.Keyevent.editableTaskId != id) {
                console.log('delete onTaskRowClick');
                // удалить popup если есть
                if(App.Action.EditGrid.popupLast) {
                    try {
                        document.body.removeChild(App.Action.EditGrid.popupLast)
                    } catch (error) {}
                    App.Action.EditGrid.popupLast = null;
                }

                App.Action.Keyevent.tableEditableShutOff()
            }

            //console.log('table editable mode', App.Action.Keyevent.tableEditableEnabled);

        });



        if(App.isPublic) {
            gantt.config.readonly = true;
            Error.inline(App.t('Read-only'), App.t('Access '))
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

        gantt.init(chart.contentElement);

        // Run parse data
        var filteringTasks = chart.filteringTasks();

        // Project Control
        Project.init();

        // Run gantt configs
        GanttConfig.init();

        // Run Lightbox
        Lightbox.init();

        if(!App.isPublic) {

            // Run Sidebar
            Sidebar.init();

            // Run Sort Functions
            App.Action.Sort.init();

            // Enable function save gantt data
            chart.savedButtonInit();

        }

        // Enable zoom slider
        chart.enableZoomSlider();

        gantt.parse({
            data: filteringTasks,
            links: chart.links
        });

        chart.addStates(Util.objClone(filteringTasks));


        /*
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
        });*/


    };


    /**
     * @namespace App.Action.Chart.tableHover
     */
    chart.tableHover = function () {
        $('.gantt_grid_data').mouseover(function(event){
            Util.eachTreeElement(event.target, function(elem){
                if($(elem).hasClass('gantt_cell')) {
                    $(elem)
                        .addClass('select-focus')
                        .mouseout(function(event){
                            $(this).removeClass('select-focus');
                        });
                }
            }, 4);

        });
    };

    /**
     * Run ZoomSlider
     * @namespace App.Action.Chart.enableZoomSlider
     */
    chart.enableZoomSlider = function () {

        jQuery(App.node('zoomSliderMin')).click(function(){
            chart.zoomValue --;
            chart.changeScaleByStep();
        });
        jQuery(App.node('zoomSliderPlus')).click(function(){
            chart.zoomValue ++;
            chart.changeScaleByStep();
        });
        jQuery(App.node('zoomSliderFit')).click(GanttExt.scaleFit);

        jQuery(App.node('zoomSlider')).show().slider({
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
    chart.changeScaleByStep = function () {

        var value = parseInt(chart.zoomValue);

        /*if(value > 10) value = 0;
        if(value < 0) value = 10;

        switch (value) {
            case 10:
                GanttConfig.scale('hour');
                break;
            case 9:
                GanttConfig.scale('hour');
                gantt.config.step = 2;
                break;
            case 8:
                GanttConfig.scale('hour');
                gantt.config.step = 3;
                break;
            case 7:
                GanttConfig.scale('hour');
                gantt.config.step = 4;
                break;
            case 6:
                GanttConfig.scale('hour');
                gantt.config.step = 6;
                break;
            case 5:
                GanttConfig.scale('hour');
                gantt.config.step = 12;
                break;
            case 4:
                GanttConfig.scale('day');
                break;
            case 3:
                GanttConfig.scale('day');
                gantt.config.step = 2;
                break;
            case 2:
                GanttConfig.scale('week');
                break;
            case 1:
                GanttConfig.scale('month');
                break;
        }*/

        if (value > 3) value = 0;
        if (value < 0) value = 3;

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

        chart.readySave = false;
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

        ganttSave.onclick = function (event) {
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
        var pos = gantt.getTaskNode(task_id);
        if(typeof pos === 'object'){
            gantt.scrollTo(pos.offsetLeft - 100, pos.offsetTop)
        }
    };

    /**
     * @namespace App.Action.Chart.scrollToTaskOnlyHorizontal
     * @param task_id
     */
    chart.scrollToTaskOnlyHorizontal = function(task_id){
        var pos = gantt.getTaskNode(task_id);
        gantt.scrollTo(pos.offsetLeft - 100, null)
    };

    // Gantt events
    chart.onBeforeLinkAdd = function  (id, link) {
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
    chart.onAfterLinkAdd = function (id, link) {
        gantt.changeLinkId(id, chart.linkIdIterator());

        // buffer to zero
        var sourceTask = gantt.getTask(link.source);
        var targetTask = gantt.getTask(link.target);
        targetTask.buffers = JSON.stringify({p:sourceTask.id, b:1});
        targetTask.is_buffered = false;

        //chart.readySave = true;
        gantt.updateTask(targetTask.id);
        gantt.autoSchedule(sourceTask.id);
    };

    chart.onAfterLinkUpdate = function  (id, task){
        chart.readySave = true;
    };

    chart.onAfterLinkDelete = function  (id, task){
        chart.readySave = true;
    };

    chart.onAfterTaskDrag = function  (id, task){};

    chart.onBeforeTaskUpdate = function (id, item) {
        var oldTaskDuration = chart.getState(id);
        if(oldTaskDuration && item.start_date >= item.end_date) {
            item.end_date = gantt.calculateEndDate(item.start_date, oldTaskDuration.duration);
        }

        // ключ для процесса сохранения
        chart.readySave = true;
        return true;
    };

    /**
     * @namespace App.Action.Chart.bufferReady
     * @type {boolean}
     */
    //chart.bufferReady = true;

    chart.onAfterTaskUpdate = function(id, task) {

        chart.readySave = true;

        var predecessor = App.Action.Buffer.getTaskPredecessor(id);
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
    chart.onBeforeTaskDelete = function (id, task) {

        //
        //console.log('task parent>>>', task.parent);
        var pTask = gantt.getTask(task.parent);
        var children = gantt.getChildren(pTask.id);
        console.log('pTask>>>', pTask);

        if(children.length == 1 && id == children[0]) {
            pTask.type = gantt.config.types.task;
            pTask.duration = 5;
            Timer.after(300, function(){gantt.updateTask(pTask.id);});
        }

/*        var parentTask = gantt.getTask(task.parent);

        */
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

    chart.onAfterTaskDelete = function (id, task) {
        chart.readySave = true;
        chart.onGanttRender();
    };

    chart.onTaskClick = function (id, event){
        var target = event.target;

        // scroll to Horizontal
        //chart.scrollToTaskOnlyHorizontal(id);
        //console.log(App.isAdmin);
        //console.log(App.Controller.Page.whoIs());
        //app.action.chart.opt.isNewTask = false

        // control buttons
        if(target.tagName == 'A' && target.getAttribute('data-control') && App.Controller.Page.whoIs() == 'admin'){
            event.preventDefault();
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

    // AUTO-SAVE
    chart.onGanttRender = function () {
        var ganttSaveLoadIco = App.node('ganttSaveLoadIco');
        if(chart.readySave === true && chart.readyRequest === true) {
            ganttSaveLoadIco.style.visibility = 'visible';
            chart.readySave = false;
            chart.readyRequest = false;

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
     * @namespace App.Action.Chart.colorByUid
     * @param node
     * @param uid
     */
    chart.colorByUid = function (uid, node) {
        var colorStyle,
            hash = md5(uid),
            maxRange = parseInt('ffffffffffffffffffffffffffffffff', 16),
            hue = parseInt(hash, 16) / maxRange * 256;
        colorStyle = 'hsl(' + hue + ', 90%, 65%)';
        if(typeof node === 'object' && node.nodeType === Node.ELEMENT_NODE)
            node.style.backgroundColor = colorStyle;
        return colorStyle;
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

        chart.readyRequest = true;
        chart.readySave = true;

        if(mode == 'move' && predecessor){
            return false;
        }
        else if(mode == 'resize' && predecessor && e.target.className.indexOf('task_left') !== -1){
            return false;
        }

        return true
    };


    /**
     * @namespace App.Action.Chart.shiftTask
     * @param task_id
     * @param direction
     */
    chart.shiftTask = function (task_id, direction) {
        var task = gantt.getTask(task_id);
        task.start_date = gantt.date.add(task.start_date, direction, "day");
        task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
        gantt.updateTask(task.id);
    };

    /**
     * @namespace App.Action.Chart.addJSONResource
     * @param task_id
     * @param type
     * @param value
     */
    chart.addJSONResource = function (task_id, type, value) {
        var usersObj, task = gantt.getTask(task_id);
        try {
            usersObj = JSON.parse(task.users);
        }catch(e){}

        if(typeof usersObj !== 'object') usersObj = {groups: [], users: []};
        if(!(usersObj[type] instanceof Array)) usersObj[type] = [];

        usersObj[type].push(value);
        usersObj[type] = Util.cleanArr(Util.uniqueArr(usersObj[type]));

        task.users = JSON.stringify(usersObj);
        gantt.updateTask(task.id);
    };

    /**
     * @namespace App.Action.Chart.removeJSONResource
     * @param task_id
     * @param type
     * @param value
     */
    chart.removeJSONResource = function (task_id, type, value) {
        var usersObj, task = gantt.getTask(task_id);
        try {
            usersObj = JSON.parse(task.users);
        }catch(e){}

        if(typeof usersObj === 'object' && usersObj[type] instanceof Array) {
            usersObj[type].forEach(function (item, i, arr) {
                if(item == value)
                    delete usersObj[type][i];
                usersObj[type] = Util.cleanArr(usersObj[type]);
            });
            task.users = JSON.stringify(usersObj);
            gantt.updateTask(task.id);
        }
    };

    /**
     * @namespace App.Action.Chart.getJSONResource
     * @param task_id
     * @param formatJSON
     * @returns {*}
     */
    chart.getJSONResource = function (task_id, formatJSON) {
        var usersObj, task = gantt.getTask(task_id);
        try {
            usersObj = JSON.parse(task.users);
        }catch(e){
            usersObj = {groups: [], users: []};
        }

        if(!!formatJSON)
            return JSON.stringify(usersObj);
        else
            return usersObj;
    };

    /**
     * @namespace App.Action.Chart.getTaskResources
     * @param task_id
     * @returns {{groups: Array, users: Array}}
     */
    chart.getTaskResources = function (task_id) {
        var result = null,
            task = gantt.getTask(task_id);

        try {
            result = JSON.parse(task.users);
        } catch (e) {}

        return (result && typeof result === 'object') ? result : {groups: [], users: []}
    };

    return chart

})}




