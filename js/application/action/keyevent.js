if(App.namespace) { App.namespace('Action.Keyevent', function(App) {

    /**
     * @namespace App.Action.Keyevent
     * @type {*}
     */
    var tableEditableEnabled, Error, keyevent = {};

    /**
     * @namespace App.Action.Keyevent.init
     * @param error
     */
    keyevent.init = function(error) {
        Error = App.Action.Error;

        keyevent.bindSpace();


        //
        //gantt.batchUpdate(function () {
        //    gantt.eachSelectedTask(function(task_id){
        //        console.log(task_id);
        //
        //        //if(gantt.isTaskExists(task_id))
        //        //    gantt.deleteTask(task_id);
        //    });
        //});

        /*gantt.attachEvent("onTaskSelected", function(id,item){
         //any custom logic here
         });*/
    };


    keyevent.bindSpace = function () {
        EventKeyManager.init();
        EventKeyManager.add('space',32, function(event){
            if(!tableEditableEnabled && gantt.getSelectedId()) {
                var taskId = gantt.getSelectedId();
                var taskNode = $('.gantt_row.gc_default_row.gantt_selected[task_id='+taskId+']');
                var taskFields = $('.gantt_tree_content', taskNode);

                //todo: выборка полей редактирования по индексам. ибо продвязатся некчему
                var fieldName, field, fieldsEditable = {
                    name: taskFields[1],
                    dateStart: taskFields[2],
                    dateEnd: taskFields[3],
                    duration: taskFields[4],
                    resources: taskFields[5]
                };

                for(fieldName in fieldsEditable) {
                    field = fieldsEditable[fieldName];
                    //console.log(field);
                    field.setAttribute('contenteditable', true);
                    //field.style.backgroundColor = '#D7D7D7';
                    //field.style.textDecoration = 'underline';
                    field.style.fontStyle = 'italic';
                    //field.style.fontWeight = 'bold';
                    field.style.cursor = 'text';
                }

            }
        });
    };

    return keyevent;

})}