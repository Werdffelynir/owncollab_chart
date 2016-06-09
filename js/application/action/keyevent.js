if(App.namespace) { App.namespace('Action.Keyevent', function(App) {

    /**
     * @namespace App.Action.Keyevent
     * @type {*}
     */
    var Error, keyevent = {

        /**
         * @namespace App.Action.Keyevent.tableEditableEnabled
         */
        tableEditableEnabled: false,
        /**
         * @namespace App.Action.Keyevent.editableTaskId
         */
        editableTaskId: false,
        /**
         * @namespace App.Action.Keyevent.fieldsEditable
         */
        fieldsEditable: {},
        /**
         * @namespace App.Action.Keyevent.fieldsValues
         */
        fieldsValues: {}

    };

    /**
     * @namespace App.Action.Keyevent.init
     * @param error
     */
    keyevent.init = function(error) {
        Error = App.Action.Error;

        EventKeyManager.init();

        keyevent.bindSpace();
        keyevent.bindEnter();

    };


    keyevent.bindSpace = function () {
        EventKeyManager.add('space',32, keyevent.tableEditableTurnOn);
    };

    keyevent.bindEnter = function () {
        EventKeyManager.add('enter',13, function(event){
            event.target.textContent = event.target.textContent.replace(/\n|\r/, '');

            for(var key in keyevent.fieldsEditable) {
                keyevent.fieldsValues[key] = keyevent.fieldsEditable[key].textContent;
            }

            keyevent.tableEditableShutOff(event);

            // save change
            console.log(keyevent.fieldsValues);
        });
        EventKeyManager.disable('enter');
    };

    keyevent.tableEditableTurnOn = function (event) {
        if(!keyevent.tableEditableEnabled && gantt.getSelectedId()) {
            keyevent.tableEditableEnabled = true;

            EventKeyManager.enable('enter');

            var taskId = keyevent.editableTaskId = gantt.getSelectedId();
            var taskNode = $('.gantt_row.gc_default_row.gantt_selected[task_id='+taskId+']');
            var taskFields = $('.gantt_tree_content', taskNode);

            //todo: выборка полей редактирования по индексам. ибо продвязатся некчему
            var fieldName, field;
            keyevent.fieldsEditable = {
                name: taskFields[1],
                dateStart: taskFields[2],
                dateEnd: taskFields[3],
                duration: taskFields[4],
                resources: taskFields[5]
            };

            for(fieldName in keyevent.fieldsEditable) {
                field = keyevent.fieldsEditable[fieldName];
                field.setAttribute('contenteditable', true);
                field.style.fontStyle = 'italic';
                field.style.cursor = 'text';
            }

            //console.log(fieldsEditable);

        }

    };

    keyevent.tableEditableShutOff = function (event) {
        keyevent.tableEditableEnabled = false;
        EventKeyManager.disable('enter');
        gantt.unselectTask(keyevent.editableTaskId);
        gantt.selectTask(keyevent.editableTaskId);
    };


    return keyevent;

})}