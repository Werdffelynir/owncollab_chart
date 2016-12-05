if(App.namespace) { App.namespace('Action.Lightbox', function(App) {

    /**
     * @namespace App.Action.Lightbox
     * @type {*}
     */
    var lbox = {
        task:null,
        field:null,
        popup:null,
        datetimepickerEnd:null
    };

    /** @type {App.Extension.DateTime} */
    var DateTime = App.Extension.DateTime;

    /** @type {App.Module.DataStore} */
    var DataStore = App.Module.DataStore;

    /**
     * @namespace App.Action.Lightbox.init
     */
    lbox.init = function(){

        /**
         * Add the section to the lightbox configuration:
         *
         * gantt.config.lightbox.sections - for regular tasks.
         * gantt.config.lightbox.project_sections - for project tasks.
         * gantt.config.lightbox.milestone_sections - for milestones.
         * @type {*[]}
         */
        gantt.config.lightbox.sections =
            gantt.config.lightbox.project_sections =
                gantt.config.lightbox.milestone_sections = [
            {name:"template", height:260, type:"template", map_to:"base_template"}
        ];

        // Set the label for the section:
        gantt.locale.labels.section_template = "Edit task detail";

        // Set the content of the control with the help of some event, e.g. the onBeforeLightbox event:
        gantt.attachEvent("onBeforeLightbox", lbox.onBeforeLightbox);

        // Set
        gantt.attachEvent("onLightbox", lbox.onLightbox);
        //gantt.attachEvent("onAfterLightbox", lbox.onAfterLightbox);
        gantt.attachEvent("onLightboxSave", lbox.onLightboxSave);
        //gantt.attachEvent("onLightboxCancel", lbox.onLightboxCancel);
        gantt.attachEvent("onLightboxDelete", lbox.onLightboxDelete);

    };

    /**
     * @param id
     * @returns {boolean}
     */
    lbox.onBeforeLightbox = function (id){

        // disable grid table editable mode
        if(App.Action.Keyevent.tableEditableEnabled) {
            return false;
        }

        // added task ti edit
        lbox.task = gantt.getTask(id);
        lbox.task.base_template = '<div id="generate-lbox-wrapper">' + App.node('lbox').innerHTML + '</div>';
        return true;
    };


    lbox.onLightbox = function (id){

        App.Action.Keyevent.tableEditableShutOff();

        // delete predecessor button if task is first child in the project
        var t = gantt.getTask(id);

        // Clean view for types
        if(t.parent == 0){
            jQuery('#generate-lbox-wrapper [name=lbox_predecessor]').remove();
        }
        if(t.type == 'project'){
            jQuery('#generate-lbox-wrapper .lbox_buffer_wrapp').remove();
        }else if(t.type == 'milestone'){
            //$('#generate-lbox-wrapper input[name=lbox_users]').parent().remove();
            jQuery('#generate-lbox-wrapper input[name=lbox_progress]').parent().parent().hide();
            jQuery('#generate-lbox-wrapper input[name=lbox_end_date]').parent().parent().hide();
        }

        lbox.field = (function(){
            var fsn = document.querySelectorAll('#generate-lbox-wrapper input'),
                fso = {},
                fch = ['predecessor','milestone','buffer']; // added params if is undefined as lbox.task property

            for(var i=0;i<fsn.length;i++){
                var _name = fsn[i]['name'].substr(5);
                fso[_name] = fsn[i];

                if(lbox.task[_name] !== undefined || fch.indexOf(_name) !== -1){

                    switch(_name){

                        case 'progress':
                            fso[_name].value = lbox.progressToPercent(lbox.task[_name]) + ' %';
                            fso[_name].onclick = lbox.onClickLightboxInput;
                            fso[_name].onkeyup = lbox.onChangeWithPrefix;
                            break;

                        case 'users':
                            var usersObj = {groups:[],users:[]};
                            try{
                                usersObj = JSON.parse(lbox.task[_name]);
                            }catch (e){}
                            //if(typeof usersObj == null)
                            //    usersObj = {groups:[],users:[]};

                            var groupsString = Util.cleanArr(usersObj.groups).join(', ');
                            var usersString = Util.cleanArr(usersObj.users).join(', ');

                            fso[_name].value =  (!Util.isEmpty(groupsString) ? groupsString + ', ' : '') + usersString;
                            fso[_name].onclick = lbox.onClickLightboxInput;
                            break;

                        case 'predecessor':
                            fso[_name].onclick = lbox.onClickLightboxInput;
                            break;

                        case 'milestone':
                            fso[_name].checked = lbox.task.type == 'milestone';
                            fso[_name].onclick = lbox.onClickLightboxInputMilestone;
                            break;

                        case 'start_date':
                        case 'end_date':
                            fso[_name].value = DateTime.dateToStr(lbox.task[_name]);
                            break;

                        default:
                            fso[_name].value = lbox.task[_name];
                            fso[_name].onkeyup = lbox.onChangeLightboxInput;
                    }
                }
            }
            return fso;
        })();


        var startDate = DataStore.get('projectTask').start_date;

        jQuery('input[name=lbox_start_date]', document.querySelector('#generate-lbox-wrapper')).datetimepicker({
            //showButtonPanel: false,
            //closeText: 'Close',
            currentText: App.t('Now'),
            closeText: App.t('Done'),
            minDate: DateTime.addDays(-365, startDate),
            maxDate: DateTime.addDays(365, startDate),
            //timezone: '0000',
            controlType: 'slider',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            //showTimezone: true,
            //altFieldTimeOnly: false,
            //altRedirectFocus: false,
            timeInput: false,
            onSelect: lbox.onChangeLightboxInputDate
        });

        // readonly
        //console.log(dtp);

        lbox.datetimepickerEnd = jQuery('input[name=lbox_end_date]', document.querySelector('#generate-lbox-wrapper')).datetimepicker({
            //showButtonPanel: false,
            //closeText: 'Close',
            currentText: App.t('Now'),
            closeText: App.t('Done'),
            minDate: (function(){
                var fsd = $('input[name=lbox_start_date]').val();
                return DateTime.strToDate(fsd?fsd:startDate);
            })(),
            maxDate: DateTime.addDays(365, startDate),
            //timezone: '0000',
            controlType: 'slider',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            timeInput: false,
            onSelect: lbox.onChangeLightboxInputDate
        });

        jQuery('#generate-lbox-wrapper [name=lbox_text]').select().focus();
        //var tpickerInput = jQuery('.ui_tpicker_time_input', $.datepicker.dpDiv);
        //tpickerInput.attr('readonly', 'readonly');


        //var timezone = jstz.determine();
        //timezone.name();
        //console.log(timezone);
    };


    lbox.onAfterLightbox = function (){};

    lbox.onChangeWithPrefix = function (event){
        if(!lbox.task || !lbox.field) return;

        var target = event.target,
            name = target.name,
            value = target.value;

        if(name == 'lbox_progress'){
            target.value = lbox.progressToPercent( lbox.percentToProgress(value) ) + ' %';
            lbox.task['progress'] = lbox.percentToProgress(value);
        }

    };


    lbox.onChangeLightboxInput = function (event){

        var target = event.target,
            name = target['name'].substr(5),
            value = target['value'],
            type = target['type'];

        if(lbox.task[name] !== undefined){
            lbox.task[name] = value;
        }
    };

    //lbox._tmpCurrentMinDate = null;

    lbox.onChangeLightboxInputDate = function (date, picObj){
        /*        if(!lbox.task || !lbox.field) return;
        var name = this['name'].substr(5);
        var value_date = DateTime.strToDate(date);

        // change end date
        if(name == 'start_date') {
            if(lbox.task.end_date < value_date) {
                var newEndDate = DateTime.addDays(7, value_date);
                lbox.task.end_date = newEndDate;
                $('input[name=lbox_end_date]').val(DateTime.dateToStr(newEndDate));
            }
        }

        lbox.task[name] = DateTime.strToDate(date);
        */



        if(!lbox.task || !lbox.field) return;
        var id = lbox.task.id;
        var name = this['name'].substr(5);
        var value_date = DateTime.strToDate(date);
        // change end date
        if(name == 'start_date') {
            if(lbox.task.end_date < value_date) {
                var oldTaskDuration = App.Action.Chart.getState(id);
                // is new task
                if (!oldTaskDuration) {
                    lbox.task.end_date = gantt.calculateEndDate(value_date, lbox.task.duration);
                    jQuery('input[name=lbox_end_date]').val(DateTime.dateToStr(lbox.task.end_date));
                } else {
                    lbox.task.end_date = gantt.calculateEndDate(value_date, oldTaskDuration.duration);
                    jQuery('input[name=lbox_end_date]').val(DateTime.dateToStr(lbox.task.end_date));
                }
            }
        }
        lbox.task[name] = DateTime.strToDate(date);
    };

    lbox.onClickLightboxInputMilestone = function (event) {
        if(!lbox.task || !lbox.field) return;
        var target = event.target;

        //console.log(target);

        if(target.checked == true){
            lbox.task.type = gantt.config.types.milestone;
            jQuery('#generate-lbox-wrapper input[name=lbox_progress]').parent().parent().hide();
            jQuery('#generate-lbox-wrapper input[name=lbox_end_date]').parent().parent().hide();

        } else{
            lbox.task.type = gantt.config.types.task;
            jQuery('#generate-lbox-wrapper input[name=lbox_progress]').parent().parent().show();
            jQuery('#generate-lbox-wrapper input[name=lbox_end_date]').parent().parent().show();

            // date fix for task
            lbox.task.end_date = DateTime.addDays(7, lbox.task.start_date);
        }
    };

    lbox.onClickLightboxInput = function (event){

        if(!lbox.task || !lbox.field) return;
        var target = this || event.target,
            popup = null;

        if(target['name'] == 'lbox_users'){
            lbox.resourcesViewGenerate();
            popup = lbox.showPopup(target, lbox.resourcesView);

            popup.style.width = '510px';
            popup.style.height = 'auto';
            popup.style.zIndex = '999';
            popup.style.left = '10px';
            popup.style.overflowY = 'none';
            //popup.style.paddingTop = '10px';

            //$('.lbox_popup_wrap', popup).customScrollbar("remove");
            $(popup).customScrollbar("remove");

            lbox.resourcesAppoint(popup);
            lbox.resourceOnClickListener(popup, target);
        }
        else if(target['name'] == 'lbox_progress'){

            target.select();

        }

        // todo buffer
        /*else if(target['name'] == 'lbox_buffer'){
            target.select();
        }*/
        else if(target['name'] == 'lbox_end_date'){

            //app.timeStrToDate($('input[name=lbox_start_date]').val())

        }
        else if(target['name'] == 'lbox_predecessor'){
            lbox.predecessorViewGenerate();

            var view = lbox.predecessorView,
                labels = document.createElement('div'),
                btns = document.createElement('div');

            labels.className = 'predecessor_labels';
            labels.innerHTML = '<span class="lbox_pl_id">ID</span>' +
                '<span class="lbox_pl_name">' + App.t('Taskname') + '</span>' +
                '<span class="lbox_pl_buffer">' + App.t('Buffer') + '</span>' +
                '<span class="lbox_pl_link">' + App.t('Link type') + '</span>';

            view.insertBefore(labels, view.firstChild);
            //view.insertAdjacentHTML('afterend', '<div id="predecessor_labels">two</div>');
            popup = lbox.showPopup(target, view);

            popup.style.width = '510px';
            popup.style.zIndex = '999';
            popup.style.left = '10px';
            //popup.style.top = '10px';

            $('.lbox_popup_wrap', popup)
                .css('overflow-y','auto')   // styled
                //.css('margin-top','10px')
                .css('margin-right','10px') //
                .css('min-height','180px')
                //.css('height','212px')
                .addClass('default-skin')   // scrollbar skin
                .customScrollbar();         // add style to scrollbar

            lbox.predecessorOnClickListener(popup, target);
            //$(".lbox_popup_wrap")
        }
    };

    lbox.showPopup = function (afterElement, content){
        if(!lbox.popup){

            var _popup = document.createElement('div'),
                _popupWrap = document.createElement('div'),
                _popupClose = document.createElement('div');

            _popup.id = 'lbox_popup';
            _popup.className = 'lbox_popup';
            _popupWrap.className = 'lbox_popup_wrap';
            _popupClose.className = 'lbox_popup_close icon-close';
            _popupClose.onclick = function(e){lbox.hidePopup()};
            _popup.appendChild(_popupClose);
            _popup.appendChild(_popupWrap);
            lbox.popup =  _popup;
            lbox.popup.content = _popupWrap;
        }

        lbox.popup.content.innerHTML = '';

        if(content.nodeType === Node.ELEMENT_NODE || content.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
            lbox.popup.content.appendChild(content);
        else if(typeof content === 'string')
            lbox.popup.content.innerHTML = content;

        afterElement.parentNode.appendChild(lbox.popup);
        return lbox.popup;
    };
    lbox.hidePopup = function (){
        $('#lbox_popup').remove()
    };


    /**
     * Click the Save button
     * Data transfer has already taken place in the event
     * @param id
     * @param task
     * @param is_new
     * @returns {boolean}
     */
    lbox.onLightboxSave = function (id, task, is_new){
        App.Action.Chart.readySave = true;
        App.Action.Chart.readyRequest = true;

        /*
        var _id = null;
        // after entry in the database, you need to update the id
        if(is_new === true){
            lbox.task.id_origin = task.id;
            lbox.task.start_date_timestamp = task.start_date.getTime();
            lbox.task.end_date_timestamp = task.end_date.getTime();
            lbox.task.id_origin = task.id;
            lbox.task.is_new = true;
        }

        // updates all the properties editing task with the current internal object
        Util.objMerge(task, lbox.task);
        gantt.updateTask(id);*/

        // Accept buffer if it set
        task.is_buffered = false;
        var predecessor, successor;
        if(predecessor = App.Action.Buffer.getTaskPredecessor(id)) {
            if(!isNaN(predecessor.buffer) && predecessor.buffer != 0) {
                //App.Action.Chart.taskReplace(id);
                //setTimeout(function(){ //},300);
                gantt.autoSchedule(predecessor.id);
            }
        } else {
            Timer.after(500, function(){
                App.Action.Chart.scrollToTaskOnlyHorizontal(id)
            });
        }

        //console.log('Is new save', task.is_new);
        //if (task.is_new) {
            //App.Action.Chart.readySave = true;
        //}
        //App.Action.Chart.scrollToTask(id);

        App.Action.Chart.onGanttRender();
        return true;
    };
    lbox.onLightboxCancel = function (){
        lbox.task = lbox.field = null;
        return true;
    };
    lbox.onLightboxDelete = function (id){
        var task = gantt.getTask(id);
        if(task.type == 'project' && id == 1)
            return false;
        else {
            gantt.locale.labels.confirm_deleting = task.text + " " + (task.id) + " - will be deleted permanently, are you sure?";
            lbox.task = lbox.field = null;
            return true;
        }
    };

    lbox.resourcesView = null;

    lbox.resourcesViewGenerate = function (){
        var fragment = document.createDocumentFragment();
        var groupsusers = DataStore.get('groupsusers');
        var deprecatedUsers = ['collab_user'];

        for(var groupName in groupsusers){

            var _lineGroup = document.createElement('div'),
                _lineUsers = document.createElement('div'),
                _inputGroup = document.createElement('input'),
                _inputLabel = document.createElement('label'),
                _inputSpan = document.createElement('span'),
                users = groupsusers[groupName],
                usersCount =  users.length;

            _inputGroup.name = String(groupName).trim();
            _inputGroup.type = 'checkbox';
            _inputGroup.className = 'group';
            _inputGroup.setAttribute('data-type', 'group');

            _lineGroup.appendChild(_inputGroup);
            _inputLabel.appendChild(_inputSpan);
            _lineGroup.appendChild(_inputLabel);

            _inputGroup.id = 'group' + groupName;
            _inputLabel.setAttribute('for', 'group' + groupName);
            _inputLabel.innerHTML += ' <strong>' + Util.ucfirst(groupName) + '</strong>';

            for(var i=0; i<usersCount; i++){
                // hide deprecated users
                if (deprecatedUsers.indexOf(users[i]['uid']) !== -1) continue;

                var _inlineUser = document.createElement('span'),
                    _inputUser = document.createElement('input'),
                    _inputUserLabel = document.createElement('label'),
                    _inputUserSpan = document.createElement('span');

                _inputUser.name = users[i]['uid'];
                _inputUser.type = 'checkbox';
                _inputUser.className = 'user';
                _inputUser.setAttribute('data-type', 'user');
                _inputUser.setAttribute('data-gid', users[i]['gid']);

                _inputUser.id = 'u_' + users[i]['uid'];
                _inputUserLabel.setAttribute('for', 'u_' + users[i]['uid']);
                _inputUserLabel.appendChild(_inputUserSpan);
                _inputUserLabel.innerHTML += users[i]['uid'];

                _inlineUser.appendChild(_inputUser);
                _inlineUser.appendChild(_inputUserLabel);

                _lineUsers.appendChild(_inlineUser);
            }

            fragment.appendChild(_lineGroup);
            fragment.appendChild(_lineUsers);
        }

        lbox.resourcesView = fragment;
    };

    lbox.resourcesAppoint = function (popup){
        var usersTask = [];
        var groupsusers = DataStore.get('groupsusers');
        var resource = App.Action.Chart.getJSONResource(lbox.task['id']);

        //lbox.getResources();
        //usersTask = Util.extend(resource['groups'],resource['users']);

        if(resource['users'].length > 0){
            var inputs = popup.querySelectorAll('input[type=checkbox][data-type=user]');
            for(var i = 0; i<inputs.length; i++){
                var name = inputs[i]['name'];
                if(resource['users'].indexOf(name) !== -1){
                    inputs[i].checked = true;
                }
            }
        }

        if(resource['groups'].length > 0){
            var inputsGr = popup.querySelectorAll('input[type=checkbox][data-type=group]');
            for(var j = 0; j<inputsGr.length; j++){
                var nameGr = inputsGr[j]['name'];
                if(resource['groups'].indexOf(nameGr) !== -1){
                    inputsGr[j].checked = true;
                }
            }
        }


/*
        if(usersTask.length > 0){
            var inputs = popup.querySelectorAll('input[type=checkbox][data-type=user]'),
                groupIn = {};
            for(var i = 0; i<inputs.length; i++){
                var gid = inputs[i].getAttribute('data-gid'),
                    name = inputs[i]['name'];

                if(usersTask.indexOf(name) !== -1){
                    inputs[i].checked = true;
                    if(groupIn[gid] === undefined) groupIn[gid] = 0;
                    groupIn[gid] ++
                }
            }
            // checked groups
            for(var k in groupIn){
                if(groupsusers[k] && groupsusers[k].length === groupIn[k])
                    $('input[name='+k+'][data-type=group]', popup).prop('checked', true);
            }
        }*/
    };


    lbox.resourceOnClickListener = function (popup, fieldUsers) {
        var groupsusers = DataStore.get('groupsusers');
        popup.addEventListener('click', function(event) {
            if (event.target.tagName == 'INPUT') {
                var target = event.target,
                    type = target.getAttribute('data-type'),
                    name = target['name'],
                    checked = target.checked ? true : false;

                if(type === 'user'){
                    if(checked){
                        jQuery('input[name='+name+'][data-type=user]', popup).prop('checked', true);
                        //fieldUsers.value = lbox.addResource(name);
                        App.Action.Chart.addJSONResource(lbox.task['id'], 'users', name);
                    }
                    else {
                        jQuery('input[name='+name+'][data-type=user]', popup).prop('checked', false);
                        //fieldUsers.value = lbox.removeResource(name);
                        App.Action.Chart.removeJSONResource(lbox.task['id'], 'users', name);
                    }
                }
                else if(type === 'group') {
                    var _users = groupsusers[name].map(function(e){return e['uid']});
                    if(checked) {
                        // todo: отк/вкл чик юзеров
                        //jQuery('input[data-gid='+name+'][data-type=user]', popup).prop('checked', true);
                        //fieldUsers.value = lbox.addResource(_users);
                        App.Action.Chart.addJSONResource(lbox.task['id'], 'groups', name);
                    } else {
                        // todo: отк/вкл чик юзеров
                        //jQuery('input[data-gid='+name+'][data-type=user]', popup).prop('checked', false);
                        //fieldUsers.value = lbox.removeResource(_users);
                        App.Action.Chart.removeJSONResource(lbox.task['id'], 'groups', name);
                    }
                }
            }

            // Запрет на авто обновления
            App.Action.Chart.readySave = false;

            var input = document.querySelector('#generate-lbox-wrapper input[name=lbox_users]');
            input.value = App.Action.Lightbox.usersJSONToString(lbox.task);
        });
    };

    lbox.getResources = function () {
        var res = [];
        if(lbox.task.users) {
            res = (lbox.task.users.split(',').map(function(item){return item.trim()})).filter(function(v){return v.length > 1});
        }
        return res;
    };
    lbox.isResourceUser = function(user) {
        var users = lbox.getResources();
        //if(users.indexOf(user) !== 1 ) return true;
        //return false;
        return users.indexOf(user) !== 1;
    };
    lbox.addResource = function(user){
        var users = lbox.getResources(),
            usersString = '';
        if(typeof user === 'string') user = [user];
        if(Util.isArr(user) && user.length > 0){
            for(var i=0; i<user.length; i ++)
                users.push(user[i]);

            lbox.field['users'] = lbox.task['users'] = usersString =
                Util.cleanArr(Util.uniqueArr(users)).join(', ');
        }
        return usersString;
    };
    lbox.removeResource = function(user){
        var users = lbox.getResources(),
            usersString = '';
        if(typeof user === 'string') user = [user];
        if(Util.isArr(user) && user.length > 0){
            for(var i=0; i<user.length; i ++){
                if(users.indexOf(user[i]) !== -1)
                    users.splice(users.indexOf(user[i]),1);
            }
            lbox.field['users'] = lbox.task['users'] = usersString =
                Util.cleanArr(Util.uniqueArr(users)).join(', ');
        }
        return usersString;
    };

    lbox.predecessorView = null;

    lbox.predecessorViewGenerate = function(){
        if(!lbox.task || !lbox.field) return;

        var tasks = gantt._get_tasks_data(),
            fragment = document.createDocumentFragment();

        var buffer = 0;
        try{
            buffer = JSON.parse(lbox.task.buffers).b;
        }catch (error){}

        tasks.forEach(function(item){

            if(item.id == lbox.task.id || item.id == 1) return;

            var _line = document.createElement('div'),
                _name = document.createElement('div'),
                _link = document.createElement('div'),
                _linkElems = lbox.predecessorLinkGenerate2(item.id, buffer);
                //_linkElems = lbox.predecessorLinkGenerate2(item.id, item.buffer);

            _line.className = 'tbl predecessor_line';
            _name.className = _link.className = 'tbl_cell';

            _name.innerHTML = '<span class="predecessor_item_id">' + (item.id) + '</span>' + (item.type == 'project'?'<b>'+item.text+'</b>':item.text);
            _link.appendChild(_linkElems);
            _line.appendChild(_name);
            _line.appendChild(_link);
            _link.setAttribute('data-taskid', item.id);
            fragment.appendChild(_line);
        });

        lbox.predecessorView = fragment;
    };

    lbox.predecessorLinkGenerate2 = function(id, buffer){
        var
            fragment = document.createDocumentFragment(),

            _isChecked = false,
            _inpBuffer = document.createElement('input'),

            _inpFS = document.createElement('input'),
            _inpFSLabel = document.createElement('label'),
            _inpFSSpan = document.createElement('span'),

            _inpSS = document.createElement('input'),
            _inpSSLabel = document.createElement('label'),
            _inpSSSpan = document.createElement('span'),

            _inpFF = document.createElement('input'),
            _inpFFLabel = document.createElement('label'),
            _inpFFSpan = document.createElement('span'),

            _inpSF = document.createElement('input'),
            _inpSFLabel = document.createElement('label'),
            _inpSFSpan = document.createElement('span'),

            _inpClear = document.createElement('input'),
            _inpClearLabel = document.createElement('label'),
            _inpClearSpan = document.createElement('span'),

            linksSource = gantt.getTask(id).$source,
            linksTarget = gantt.getTask(id).$target;

        _inpBuffer.setAttribute('placeholder', '0d 0h');
        _inpBuffer.setAttribute('buffer', id);
        _inpBuffer.setAttribute('data-buffer-value', buffer);
        _inpBuffer.name = 'buffer_' + id;
        _inpBuffer.type = 'text';

        //if(!isNaN(buffer)) {
            //_inpBuffer.value = App.Action.Buffer.convertSecondsToBuffer(buffer);
        //    _inpBuffer.value = App.Action.Buffer.convertSecondsToBuffer(0);
        //}
        var inpsName = 'inpsname'; //'plg_' + id;

        _inpFS.id = 'plg_fs_' + id;
        _inpFS.name = inpsName;
        _inpFS.type = 'radio';
        _inpFS.value = 0;
        _inpFSLabel.setAttribute('for', 'plg_fs_' + id);
        _inpFSLabel.appendChild(_inpFSSpan);
        _inpFSLabel.appendChild(document.createTextNode('FS'));

        _inpSS.id = 'plg_ss_' + id;
        _inpSS.name = inpsName;
        _inpSS.type = 'radio';
        _inpSS.value = 1;
        _inpSSLabel.setAttribute('for', 'plg_ss_' + id);
        _inpSSLabel.appendChild(_inpSSSpan);
        _inpSSLabel.appendChild(document.createTextNode('SS'));

        _inpFF.id = 'plg_ff_' + id;
        _inpFF.name = inpsName;
        _inpFF.type = 'radio';
        _inpFF.value = 2;
        _inpFFLabel.setAttribute('for', 'plg_ff_' + id);
        _inpFFLabel.appendChild(_inpFFSpan);
        _inpFFLabel.appendChild(document.createTextNode('FF'));

        _inpSF.id = 'plg_sf_' + id;
        _inpSF.name = inpsName;
        _inpSF.type = 'radio';
        _inpSF.value = 3;
        //_inpSF.setAttribute('data-pid',id);
        _inpSFLabel.setAttribute('for', 'plg_sf_' + id);
        _inpSFLabel.appendChild(_inpSFSpan);
        _inpSFLabel.appendChild(document.createTextNode('SF'));

/*        _inpClear.id = 'plg_clear_' + id;
        _inpClear.name = 'plg_' + id;
        _inpClear.type = 'radio';
        _inpClear.value = 'clear';
        _inpClearLabel.setAttribute('for', 'plg_clear_' + id);
        _inpClearLabel.appendChild(_inpClearSpan);
        _inpClearLabel.appendChild(document.createTextNode('no'));*/

        // todo:linksTarget to linksSource, change _link.source to _link.target
        if(linksSource.length > 0){
            var linkTarget = null;
            linksSource.map(function(_item){
                var _link = gantt.getLink(_item);

                // 18 19 Object {id: "54", source: "18", target: "19", type: "0", deleted: null}


                if(_link.target == lbox.task.id && _link.source == id && linkTarget == null) linkTarget = _link;

                if(_link.target == lbox.task.id) {
                    lbox.predecessorLast = { dataTaskid: _link.source };
                    _isChecked = true;
                    switch (_link.type){
                        case '0': _inpFS.checked = true; break;
                        case '1': _inpSS.checked = true; break;
                        case '2': _inpFF.checked = true; break;
                        case '3': _inpSF.checked = true; break;
                    }
                }
            });

            //
            if(!_isChecked) {
                //_inpClear.checked = true;
            }else if (typeof linkTarget === 'object' && !isNaN(buffer) ){
                _inpBuffer.value = App.Action.Buffer.convertSecondsToBuffer(buffer);
            }

        } else {
            //_inpClear.checked = true;
        }

        fragment.appendChild(_inpBuffer);

        fragment.appendChild(_inpFS);
        fragment.appendChild(_inpFSLabel);

        fragment.appendChild(_inpSS);
        fragment.appendChild(_inpSSLabel);

        fragment.appendChild(_inpSF);
        fragment.appendChild(_inpSFLabel);

        fragment.appendChild(_inpFF);
        fragment.appendChild(_inpFFLabel);

        //fragment.appendChild(_inpClear);
        //fragment.appendChild(_inpClearLabel);

        return fragment;
    };


    //lbox.predecessorLinkGenerate3 = function(id, buffer){
        //var fragment = document.createDocumentFragment();
        //var line = Util.createElement('');
    //};
    lbox.predecessorLast = null;
    lbox.predecessorOnClickListener = function  (popup, target){
        if(!lbox.task || !lbox.field) return;


        $('input[type=radio]', popup).on('change', function(event){
            //var that = this;
            //console.log('change >>>>>>> ', that);
        });

        $('input[type=radio]', popup).on('click', function(event){

            var that = this;
            var id = that.parentNode.getAttribute('data-taskid');
            var type = that.value;
            var inpBuffer = $('input[type=text][name=buffer_' + id + ']');


            if(that === lbox.predecessorLast ){
                lbox.predecessorLast = null;
                //console.log('that >>>>>>> ', that);
                that.checked = false;

                //lbox.deleteLinksWithSource(id);
                lbox.deleteLink(id, lbox.task.id);

            }else{
                if(lbox.predecessorLast){
                    var pid = lbox.predecessorLast.dataTaskid;
                    var pidInpBuffer = $('input[type=text][name=buffer_'+pid+']');
                    pidInpBuffer.val('');

                    if( id !== pid ) {
                        lbox.deleteLink(pid, lbox.task.id);
                    } else if ( id === pid ) {
                        lbox.deleteLink(pid, lbox.task.id);
                    }
                }

                try{
                    var buffersObject = JSON.parse(lbox.task.buffers);
                    buffersObject.p = id;
                    console.log('buffersObject', buffersObject);
                    lbox.task.buffers = JSON.stringify(buffersObject);
                }catch(error){}

                if(parseInt(inpBuffer.attr('data-buffer-value')) > 0)
                    inpBuffer.val(App.Action.Buffer.convertSecondsToBuffer(inpBuffer.attr('data-buffer-value')));


                lbox.predecessorLast = that;
                lbox.predecessorLast.dataTaskid = id;
                lbox.predecessorLast.dataLink = gantt.addLink({
                    id: App.Action.Chart.linkIdIterator(),
                    source:  id,
                    target: lbox.task['id'],
                    type: type
                });
            }

        });

        // todo: buffer fix
        $('input[type=text]', popup).on('change', function(event) {
            var id = this.name.split('_')[1],
                stask = lbox.task,
                inputElem = this;

            if (stask) {
                var bufferSeconds = App.Action.Buffer.convertBufferToSeconds(this.value);
                var bufferValue = App.Action.Buffer.convertSecondsToBuffer(bufferSeconds);
                setTimeout(function(){
                    App.Action.Buffer.set(stask.id, bufferSeconds);
                    inputElem.value = bufferValue;
                    stask['buffers'] = '{"p":"'+id+'","b":"'+bufferSeconds+'"}';
                    gantt.updateTask(stask.id);
                },300);
            }

        });

        $('input[type=text]', popup).on('click', function(event){
            this.select();
        });

        $('input[type=text]', popup).on('keyup', function(event){});

    };

    /**
     *
     * @namespace App.Action.Lightbox.deleteLink
     * @param source
     * @param target
     */
    lbox.deleteLink = function  (source, target){
        var link = null;
        var links = gantt.getLinks();
        if(target && source && links.length > 0){
            for(var i = 0; i < links.length; i ++){
                link = links[i];
                if (link.target == target && link.source == source){
                    gantt.deleteLink(link.id);
                    break
                }
            }
        }
    };

    /**
     * @namespace App.Action.Lightbox.deleteLinksWithTarget
     * @param target
     */
    lbox.deleteLinksWithTarget = function  (target){
        var task = gantt.getTask(target);

            //links = task.$target;
        if(task.$target && task.$target.length > 0){
            task.$target.map(function(linkId){
                gantt.deleteLink(linkId);
            });
        }
    };

    /**
     * @namespace App.Action.Lightbox.deleteLinksWithSource
     * @param source
     */
    lbox.deleteLinksWithSource = function  (source) {
        var task = gantt.getTask(source),
            links = task.$source;
        if(links.length > 0) {
            links.map(function(linkId){
                gantt.deleteLink(linkId);
            });
        }
    };




    /**
     * @namespace App.Action.Lightbox.progressToPercent
     * @param num
     * @returns {Number}
     */
    lbox.progressToPercent = function (num) {
        var progress = parseFloat(num) || 0;
        progress = parseInt(progress*100);
        return progress > 100 ? 100 : progress;
    };


    /**
     *
     * Uses: app.action.lightbox.percentToProgress()
     * @param num
     * @returns {Number}
     */
    lbox.percentToProgress = function (num) {
        var progress = num ? (typeof num === 'string') ? num.replace(/[^\d]+/,'') : num : 0;
        progress = parseFloat(progress/100);
        return (progress > 1) ? 1 : progress;
    };

    /**
     * @namespace App.Action.Lightbox.usersJSONToString
     * @param item
     * @returns {string}
     */
    lbox.usersJSONToString = function (item) {
        var usersObj = {groups:[],users:[]};
        if(typeof item.users === 'string' && item.users.length > 5) {
            try {
                usersObj = JSON.parse(item.users);
            } catch (e) {}
        }
        var groupsString = Util.cleanArr(usersObj.groups).join(', ');
        var usersString = Util.cleanArr(usersObj.users).join(', ');
        return (!Util.isEmpty(groupsString) ? groupsString + ', ' : '') + usersString;
    };

    return lbox

})}