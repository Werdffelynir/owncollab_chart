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
                    var data = { field: name, value: null };

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

        console.log(sendData);

        // checks on the user appliances to the administrator group,
        // if the user is the administrator, the data are sent to update
        app.api('updateprojectsetting', function(){

            if(response.result === 1){

                // dynamic changes
                // set scale_type
                if(sendData.field === 'scale_type'){

                    //fn.ganttZoom(sendData.value);
                    //gantt.render();
                    //fn.fixedGanttSize();


                // show task name in task line
                }else if(sendData.field === 'show_task_name'){

                    /*gantt.templates.task_text = function(start, end, task){
                        if(sendData.value == 'true') return "<strong>"+task.text+"</strong>";
                        else return "";
                    };
                    gantt.refreshData();*/


                // is share init
                }else if(sendData.field === 'is_share'){

                    /*if(sendData.value === "true"){
                        var shareLink = fn.generateShareLink(response['share_link']);
                        $('input[name=share_link]').val(shareLink);
                        $('.chart_share_on').show();
                    }else{
                        //fn.removeLinkShare();
                        $('.chart_share_on').hide();
                    }*/

                }else if(sendData.field === 'share_is_protected'){

                    /*if(sendData.value === "true"){
                        $('.chart_share_password').show();
                        $('input[name=share_password]')[0].focus();
                        $('input[name=share_password]')[0].select();
                    }else{
                        $('.chart_share_password').hide();
                    }*/

                }else if(sendData.field === 'share_is_expire'){

                    /*if(sendData.value === "true"){
                        $('.chart_share_expiration').show();
                    }else{
                        $('.chart_share_expiration').hide();
                    }*/

                }else if(sendData.field === 'default'){




                }

            }else
                console.error('Error update ProjectSettings');

        }, {update:sendData} );
    };

    function onUpdateProjectSetting (response){







        //console.log(response);

        /*

         is_share

         show_today_line
         show_task_name
         show_user_color
         scale_type
         scale_fit
         critical_path

         Object { pid: null, uid: "admin", field: "show_today_line", value: "false" } event.js:57:9
         Object { update: Object } event.js:65:9
         Object { pid: null, uid: "admin", field: "show_task_name", value: "false" } event.js:57:9
         Object { update: Object } event.js:65:9
         Object { pid: null, uid: "admin", field: "show_user_color", value: "true" } event.js:57:9
         Object { update: Object } event.js:65:9
         Object { pid: null, uid: "admin", field: "scale_type", value: "hour" } event.js:57:9
         Object { update: Object } event.js:65:9
         Object { pid: null, uid: "admin", field: "scale_type", value: "day" } event.js:57:9
         Object { update: Object } event.js:65:9
         Object { pid: null, uid: "admin", field: "scale_fit", value: "true" } event.js:57:9
         Object { update: Object } event.js:65:9
         Object { pid: null, uid: "admin", field: "critical_path", value: "true" }
         Object { pid: null, uid: "admin", field: "is_share", value: "true" }
         */
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

    o.onBeforeTaskUpdate = function(id, task){
        var worker = (task.$new === true) ? 'insert' : 'update';
        app.api('updatetask', function(response) {
            if(typeof response === 'object' && !response['errorinfo'] && response['requesttoken']) {
                app.requesttoken = response.requesttoken;

                if(worker == 'insert') {
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


    o.onAfterTaskDelete = function(id, task){
        app.api('deletetask', function(response) {
            console.log(response);
            if(typeof response === 'object' && !response['errorinfo'] && response['requesttoken']) {
                app.requesttoken = response.requesttoken;


            } else {
                app.action.error.inline('Error server request operation delete task');
            }
        },{ task_id:id, task_data:task });
    };
















})(jQuery, OC, app);
