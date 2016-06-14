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
        keyevent.bindEscape();

    };


    keyevent.bindSpace = function () {
        EventKeyManager.add('space',32, keyevent.tableEditableTurnOn);
    };
    keyevent.bindEscape = function () {
        EventKeyManager.add('esc',27, function(event){
            keyevent.tableEditableShutOff(event);
        });
    };

    keyevent.bindEnter = function () {

        window.addEventListener('keydown', function(event) {
            if(event.keyCode == 13 && keyevent.tableEditableEnabled) {
                event.preventDefault();
                return false;
            }
        });

        EventKeyManager.add('enter',13, function(event) {

            //event.target.textContent = event.target.textContent.replace(/(\r\n|\n|\r)/gm,"");
            event.target.textContent = event.target.textContent.trim();
            event.target.removeAttribute('contenteditable');



            keyevent.tableEditableShutOff(event);

            // save change
            //console.log(keyevent.fieldsValues);

            var task = gantt.getTask(keyevent.editableTaskId);
            task.text = keyevent.fieldsValues['name'];
            //task.start_date = keyevent.fieldsValues['dateStart'];
            //task.end_date = keyevent.fieldsValues['dateEnd'];
            //task.duration = keyevent.fieldsValues['duration'];
            //task.users = keyevent.fieldsValues['resources'];
            gantt.updateTask(keyevent.editableTaskId);

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
            for(var key in keyevent.fieldsEditable) {
                keyevent.fieldsValues[key] = keyevent.fieldsEditable[key].textContent;
            }
            //console.log(keyevent.fieldsEditable.dateStart);

            //keyevent.fieldsEditable.dateStart.innerHTML = '<span class="dtp_inline">'+keyevent.fieldsValues['dateStart']+'</span>'

            for(fieldName in keyevent.fieldsEditable) {
                field = keyevent.fieldsEditable[fieldName];
                field.setAttribute('contenteditable', true);
                field.style.fontStyle = 'italic';
                field.style.cursor = 'text';
            }

            taskFields[1].focus();



            keyevent.fieldsEditable.dateStart.classList.add('dtp_inline');
            keyevent.fieldsEditable.dateEnd.classList.add('dtp_inline');

            //$('.dtp_inline').datetimepicker({
            //    //timezone: '0000',
            //    //controlType: 'slider',
            //    oneLine: false,
            //    dateFormat: 'dd.mm.yy',
            //    timeFormat: 'HH:mm'
            //});

            /*$($(keyevent.fieldsEditable.dateStart).parent().parent()).datetimepicker({
                altField: ".dtp_inline",
                altFieldTimeOnly: false
            });*/

            //$(keyevent.fieldsEditable.dateStart).parent().parent()
/*            if(!keyevent.dtpAdded) {
                $('#app-content-wrapper').append('<form><input id="dtp_inline_base"  type="text" style="display:none"></form>');
                keyevent.dtpAdded = true;
            }

            $('#dtp_inline_base').datetimepicker({
                altField: ".dtp_inline",
                altFieldTimeOnly: false
            });*/

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