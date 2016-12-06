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
                jQuery(keyevent.fieldsEditable['name']).focus();
                event.preventDefault();
                return false;
            }
        });

        EventKeyManager.add('enter',13, function(event) {

            event.target.textContent = event.target.textContent.trim();
            event.target.removeAttribute('contenteditable');

            keyevent.tableEditableShutOff(event);

            // save change
            //console.log('save change:', keyevent.fieldsValues);

            var task = gantt.getTask(keyevent.editableTaskId);
            task.text = keyevent.fieldsEditable['name'].textContent;

            //keyevent.fieldsValues['name'];

            /*
            if(keyevent.fieldsValues['change_start_date'] instanceof Date)
                task.start_date = keyevent.fieldsValues['change_start_date'];

            if(keyevent.fieldsValues['change_end_date'] instanceof Date)
                task.end_date = keyevent.fieldsValues['change_end_date'];
            */

            task.users = keyevent.fieldsValues['resources'];

            gantt.updateTask(task.id);

            App.Action.Chart.readySave = true;
            App.Action.Chart.onGanttRender();

            event.preventDefault();
            return false;
        });

        EventKeyManager.disable('enter');
    };

    keyevent.tableEditableVisiblyPoppup = false;

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
                if(key == 'resources')
                    keyevent.fieldsValues[key] = App.Action.Chart.getJSONResource(taskId);
                else
                    keyevent.fieldsValues[key] = keyevent.fieldsEditable[key].textContent;
            }

            for(fieldName in keyevent.fieldsEditable) {
                field = keyevent.fieldsEditable[fieldName];
                if(fieldName == 'name') {
                    field.setAttribute('contenteditable', true);
                    field.style.cursor = 'text';
                }else{
                    field.style.cursor = 'pointer';
                }
                field.style.fontStyle = 'italic';
            }

            taskFields[1].parentNode.parentNode.style.backgroundColor = 'rgb(245, 245, 245)';
            taskFields[1].focus();

            taskFields[2].innerHTML = '<input name="date_start" class="dipicker_grid" type="text" value="'+taskFields[2].textContent+'">';
            taskFields[3].innerHTML = '<input name="date_end" class="dipicker_grid" type="text" value="'+taskFields[3].textContent+'">';

            var startDate = App.Module.DataStore.get('projectTask').start_date;
            //console.log('startDate', startDate);

            $('input.dipicker_grid').datetimepicker({
                currentText: App.t('Now'),
                closeText: App.t('Done'),
                minDate: App.Extension.DateTime.addDays(-365, startDate),
                maxDate: App.Extension.DateTime.addDays(365, startDate),
                timezone: '0000',
                controlType: 'slider',
                oneLine: false,
                dateFormat: 'dd.mm.yy',
                timeFormat: 'HH:mm',
                onSelect: function(time){

                    if(this.name == 'date_start')
                        keyevent.fieldsValues['change_start_date'] = App.Extension.DateTime.strToDate(time, '%d.%m.%Y %H:%i');
                    if(this.name == 'date_end')
                        keyevent.fieldsValues['change_end_date'] = App.Extension.DateTime.strToDate(time, '%d.%m.%Y %H:%i');

                },
                onClose: function(time){

                    var task = gantt.getTask(keyevent.editableTaskId);

                    if(this.name == 'date_start')
                        task['start_date'] = App.Extension.DateTime.strToDate(time, '%d.%m.%Y %H:%i');
                    if(this.name == 'date_end')
                        task['end_date'] = App.Extension.DateTime.strToDate(time, '%d.%m.%Y %H:%i');

                    gantt.updateTask(task.id);
                    //gantt.selectTask(task.id);
                    //keyevent.tableEditableTurnOn();

                }
            });

            App.Action.EditGrid.currentFieldsValues = keyevent.fieldsValues;

            taskFields[5].addEventListener('click', function onClickEditResources(event){

                if(App.Action.EditGrid.popupLast){
                    try {
                        document.body.removeChild(App.Action.EditGrid.popupLast);
                    } catch (error) {}
                    App.Action.EditGrid.popupLast = null;
                }

                var popup = App.Action.EditGrid.createPopupResourcesEdit(taskFields[5]);

                popup.style.position = 'absolute';
                popup.style.top = event.clientY + 'px';
                popup.style.left = event.clientX + 'px';
                popup.style.xIndex= '10002';

                App.Action.EditGrid.popupLast = popup;

                document.body.insertBefore(popup, document.body.firstChild);
            });
            if(taskFields[5].textContent.trim().length == 0) {
                taskFields[5].innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            }

        }

    };

    /**
     * @namespace App.Action.Keyevent.tableEditableShutOff
     * @param event
     */
    keyevent.tableEditableShutOff = function (event) {
        //console.log('keyevent.tableEditableShutOff');
        keyevent.tableEditableEnabled = false;
        EventKeyManager.disable('enter');

        gantt.unselectTask(keyevent.editableTaskId);
        gantt.selectTask(keyevent.editableTaskId);
    };


    return keyevent;

})}