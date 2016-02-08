/**
 * Action event.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.event !== 'object')
        app.action.event = {};

    // alias of app.action.event
    var o = app.action.event;


    /* Project settings events */

    /**
     * Event on execute when change setting param
     * Uses: action.sidebar, action.chart, action.lightbox
     */
    o.changeValueProject  = function(event){

        var target  = event.target,
            name    = target.name,
            type    = target.type,
            
            /**
             * Send data
             * @type {{pid: number, uid: string, field: string, value: string}}
             */
            sendData = (function()
                {
                    var data = { pid: app.pid, uid: app.uid, field: name, value: null };

                    if(type == 'checkbox') {
                        data.value = target.checked?'true':'false';
                    }
                    else if(type == 'radio'){

                        if(target.name=='scale'){
                            data.field = 'scale_type';
                            data.value = target.value;
                        }
                    }
                    else if(type == 'text'){
                        data.value = target.value;

                        if(data.field == 'share_expire_time'){
                            var std = gantt.date.str_to_date("%d.%m.%Y %H:%i");
                            var dts = gantt.date.date_to_str("%Y-%m-%d %H:%i:%s");
                            data.value = dts(std(data.value));
                        }
                    }
                    return data;
                })();

        // checks on the user appliances to the administrator group,
        // if the user is the administrator, the data are sent to update
        if(app.isAdmin === true){
            app.api('updateProject', onUpdateProject, {update:sendData});
        }

    };

    function onUpdateProject (response){
        console.log(response);
    }



    /**
     * Catch a gantt event "onGanttReady"
     *
     */
    //o.onGanttReady = function (){};
    //o.onGanttRender = function (){};
    o.onTaskClick = function (id, event){
        var target = event.target;

        // control buttons
        if(target.tagName == 'A' && target.getAttribute('data-control')){
            event.preventDefault();
            app.action.chart.opt.isNewTask = false;
            var action = target.getAttribute('data-control');
            switch (action) {

                case "edit":
                    gantt.showLightbox(id);
                    break;

                case "add":
                    app.action.chart.opt.isNewTask = true;
                    var _id = app.data.lasttaskid ++,
                        _date = new Date(gantt.getTask(id).start_date),
                        _dateEnd = (function(){ var d = new Date(); d.setDate(_date.getDate() + 7); return d;})(),
                        _task = {
                            id: _id,
                            text: "New Task",
                            predecessor: '',
                            buffer: 0,
                            start_date: _date,
                            end_date: _dateEnd,
                            progress: 0,
                            duration: 0,
                            type: gantt.config.types.task,
                            users: ''
                        };
                    gantt.createTask(_task, id);
                    break;

                case "remove":
                    gantt.confirm({
                        title: gantt.locale.labels.confirm_deleting_title,
                        text: gantt.locale.labels.confirm_deleting,
                        callback: function(res){
                            if(res)
                                gantt.deleteTask(id);
                        }
                    });
                    break;
            }
        }

        return event;
    };

    //o.onAfterTaskAdd = function(id, task){};
    //o.onBeforeTaskAdd = function(id, task){};
    //

    o.onBeforeTaskUpdate = function(id, task){
        var worker = (task.$new === true) ? 'insert' : 'update';
        app.api('updatetask', function(response) {
            if(typeof response === 'object' && !response['errorinfo'] && response['requesttoken']) {
                app.requesttoken = response.requesttoken;
                console.log(response.lasttaskid);
                if(worker == 'insert'){
                    if(response.lasttaskid)
                        app.data.lasttaskid = response.lasttaskid;
                    else
                        app.action.error.inline('Error server request operation: Task ' + worker + '. Inset ID not response.');
                }

            } else {
                app.action.error.inline('Error server request operation: Task ' + worker );
            }
        },{ worker:worker, task_id:id, task_data:task });

    };

















})(jQuery, OC, app);
