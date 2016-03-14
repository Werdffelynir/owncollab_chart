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
            value   = target.value,
            // local saved some params
            localParams = ['show_today_line','show_task_name','show_user_color','scale_type','scale_fit','critical_path'];

        if(localParams.indexOf(name) !== -1){

            // Dynamic show today line in gantt chart
            if(name === 'show_today_line'){

                app.action.chart.showMarkers(target.checked);
                app.storageSetItem('show_today_line', target.checked);
                gantt.refreshData();

            }else

            // Dynamic show user color in gantt chart tasks an resources
            if(name === 'show_user_color'){

                app.action.chart.showUserColor(target.checked);
                app.storageSetItem('show_user_color', target.checked);
                gantt.refreshData();

            }else

            // Dynamic show task name in gantt chart
            if(name === 'show_task_name'){

                app.action.chart.showTaskNames(target.checked);
                app.storageSetItem('show_task_name', target.checked);
                gantt.refreshData();

            }else

            // Dynamic scale type gantt chart
            if(name === 'scale_type'){

                app.action.chart.scale(value);
                app.storageSetItem('scale_type', value);
                gantt.render();

            }else

            // Dynamic resize scale fit gantt chart
            if(name === 'scale_fit'){

                //app.action.chart.showTaskNames(target.checked);
                app.action.fitmode.toggle(target.checked);
                gantt.render();
                app.storageSetItem('scale_fit', target.checked);

            }else

            // Dynamic resize scale fit gantt chart
            if(name === 'critical_path'){

                app.action.chart.showCriticalPath(target.checked);
                app.storageSetItem('critical_path', target.checked);
                gantt.render();

            }

            return false;
        }


        /**
         * Send data to server
         * @type {{pid: number, uid: string, field: string, value: string}}
         */
        var sendData = (function() {
            var data = { field: name, value: null };

            if(type == 'checkbox') {
                data.value = target.checked ? 'true' : 'false';
            }

            else if(type == 'radio'){
                if(target.name == 'scale_type'){
                    data.field = 'scale_type';
                    data.value = target.value;
                }
            }
            else if(type == 'text' || type == 'password'){
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
        // dynamic update interface after update on server
        app.api('updateprojectsetting', function(response) {

            //console.log(sendData);
            console.log(response);

            if (typeof response === 'object' && !response['error'] && response['requesttoken']) {

                if(sendData.field === 'is_share'){

                    if(sendData.value === "true"){
                         var shareLink =  app.action.chart.generateShareLink(response['share_link']);
                         $('input[name=share_link]').val(shareLink);
                         $('.chart_share_on').show();
                    }else{
                        app.action.sidebar.elemFields['share_is_protected'].checked = false;
                        app.action.sidebar.elemFields['share_is_expire'].checked = false;
                        app.action.sidebar.elemFields['share_password'].value = '';
                        app.action.sidebar.elemFields['share_expire_time'].value = '';
                        $('.chart_share_on').hide();
                    }

                }else if(sendData.field === 'share_is_protected'){

                    if(sendData.value === "true"){
                        $('.chart_share_password').show();
                        $('input[name=share_password]')[0].focus();
                        $('input[name=share_password]')[0].select();
                    }else{
                        $('.chart_share_password').hide();
                    }

                }else if(sendData.field === 'share_is_expire'){

                    if(sendData.value === "true"){
                        $('.chart_share_expiration').show();
                    }else{
                        $('.chart_share_expiration').hide();
                    }

                }

            }

        }, sendData );

    };


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
                            //parent: id,
                            type: gantt.config.types.task,
                            users: ''
                        };
                    gantt.createTask(_task, id);
                    break;

                case "remove":
                    var _task = gantt.getTask(id);

                    // binding for find parent after delete
                    o.taskToDelete = {id:_task.id, parent:_task.parent};

                    gantt.confirm({
                        title: gantt.locale.labels.confirm_deleting_title,
                        //text: gantt.locale.labels.confirm_deleting,
                        text: _task.text + " " +(_task.id)+ " - will be deleted permanently, are you sure?",
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

    /**
     * Событие "onBeforeTaskUpdate" обявление слушателя в app.action.chart
     * @param id
     * @param task
     */
    o.onBeforeTaskUpdate = function(id, task){
        o.requestTaskUpdater((task.$new === true) ? 'insert' : 'update', id, task);
    };
    o.onAfterTaskDelete = function(id, task){

        // update the parent task type, if it does not have children
        if(typeof o.taskToDelete === 'object' && o.taskToDelete.id == id){
            var parent = gantt.getTask(o.taskToDelete.parent),
                children = gantt.getChildren(o.taskToDelete.parent);
            if(children.length == 0){
                parent.type = 'task';
                gantt.updateTask(parent.id);
            }
        }
        o.requestTaskUpdater('delete', id, task);
    };

    o.onAfterTaskUpdate = function(id, task){
        if(task.is_project != 1){
            var parent = gantt.getTask(task.parent),
                children = gantt.getChildren(task.parent);

            if(parent.type != 'project'){
                parent.type = 'project';
                gantt.updateTask(parent.id);
            }
        }
        return true;
    };



    o.requestIsProcessed = false;

    /**
     * Common task operation for insert, delete or update
     *
     * @param id
     * @param task
     * @param worker
     */
    o.requestTaskUpdater = function (worker, id, task) {

        app.api('updatetask', function(response) {

            //console.log(response);
            if(typeof response === 'object' && !response['error'] && response['requesttoken']) {
                app.requesttoken = response.requesttoken;
                if(worker == 'insert') {
                    if(response.lasttaskid)
                        app.data.lasttaskid = response.lasttaskid;
                    else
                        app.action.error.inline('Error Request: ' + worker + '. Inset ID not response.');
                }
            } else {
                app.action.error.inline('Error Request: ' + worker );
            }
            console.log('save close');
            $('#lboxsave').hide();


        },{ worker:worker, id:id, task:task });

    };

    o.requestLinkUpdater = function (worker, id, link) {

        app.api('updatelink', function(response) {

            console.log('updatelink: ', response);

            if(typeof response === 'object' && !response['error'] && response['requesttoken']) {

                app.requesttoken = response.requesttoken;

                if(worker == 'insert') {
                    if(response.lastlinkid)
                        app.data.lastlinkid = (parseInt(response.lastlinkid) + 1);
                    else
                        app.action.error.inline('Error Request: ' + worker + '. Inset ID not response.');
                }

            } else {

                app.action.error.inline('Error Request: ' + worker );
            }

        },{ worker:worker, id:id, link:link });

    };

    o.sendShareEmails = function(emails, resources, link){

        // change all icon to loading emails
        // background: url("/apps/owncollab_chart/img/loading-icon.gif") no-repeat center center;
        $('.share_email_butn').css('background', 'url("/apps/owncollab_chart/img/loading-small.gif") no-repeat center center');

        app.api('sendshareemails', function(response) {

            if(typeof response === 'object' && !response['error'] && response['requesttoken']) {

                app.requesttoken = response.requesttoken;

                $('.share_email_butn').css('background', 'url("/apps/owncollab_chart/img/sent.png") no-repeat center center');
                console.log('response: ', response);

            } else {

                app.action.error.inline('Error Request on send share emails');
            }

        },{ emails:emails, resources:resources, link:link });

    };








})(jQuery, OC, app);
