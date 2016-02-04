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

    }



    /**
     * Catch a gantt event "onGanttReady"
     *
     * @param id
     * @param item
     */
    o.ganttReady = function (id, item){
        app.action.chart.ganttFullSize();
        console.log(id, item);
    }


})(jQuery, OC, app);
