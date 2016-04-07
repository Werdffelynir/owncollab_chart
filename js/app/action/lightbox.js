/**
 * Action lightbox.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.lightbox !== 'object') app.action.lightbox = {};

    // alias of app.action.lightbox
    var o = app.action.lightbox;

    o.task = null;

    o.field = null;

    o.popup = null;

    o.init = function(){

        /**
         * Add the section to the lightbox configuration:
         *
         * gantt.config.lightbox.sections - for regular tasks.
         * gantt.config.lightbox.project_sections - for project tasks.
         * gantt.config.lightbox.milestone_sections - for milestones.
         * @type {*[]}
         */
        gantt.config.lightbox.sections = gantt.config.lightbox.project_sections = gantt.config.lightbox.milestone_sections = [
            {name:"template", height:260, type:"template", map_to:"base_template"}
        ];

        //Set the label for the section:
        gantt.locale.labels.section_template = "Edit task detail";

        //Set the content of the control with the help of some event, e.g. the onBeforeLightbox event:
        gantt.attachEvent("onBeforeLightbox", o.onBeforeLightbox);
        gantt.attachEvent("onLightbox", o.onLightbox);
        gantt.attachEvent("onAfterLightbox", o.onAfterLightbox);
        gantt.attachEvent("onLightboxSave", o.onLightboxSave);
        gantt.attachEvent("onLightboxCancel", o.onLightboxCancel);
        gantt.attachEvent("onLightboxDelete", o.onLightboxDelete);
        gantt.attachEvent("onAfterLinkAdd", o.onAfterLinkAdd);
        gantt.attachEvent("onAfterLinkDelete", o.onAfterLinkDelete);
        gantt.attachEvent("onAfterLinkUpdate", o.onAfterLinkUpdate);
    };

    /**
     * @param id
     * @returns {boolean}
     */
    o.onBeforeLightbox = function (id){
        o.task = gantt.getTask(id);

        // todo buffer
        // Buffer update date position to normal
        /*if(o.task.buffer > 0 && o.task.isBuffered === true){
            o.task.isBuffered = false;
            o.task = app.injectBufferToDate(o.task, -parseFloat(o.task.buffer), true);
            gantt.updateTask(id);
        }*/

        o.task.base_template = '<div id="generate-lbox-wrapper">' + app.dom.lbox.innerHTML + '</div>';

        return true;
    };

    o.onLightbox = function (id){

        // delete predecessor button if task is first child in the project
        var t = gantt.getTask(id);
        //console.log(t.parent);
        //if(gantt.getChildren(t.parent)[0] == id){
        if(t.parent == 0){
            $('#generate-lbox-wrapper [name=lbox_predecessor]').remove();
        }
        if(t.type == 'project'){
            $('#generate-lbox-wrapper .lbox_buffer_wrapp').remove();
        }

        o.field = (function(){
            var fsn = document.querySelectorAll('#generate-lbox-wrapper input'),
                fso = {},
                fch = ['predecessor','milestone','buffer']; // added params if is undefined as o.task property

            for(var i=0;i<fsn.length;i++){
                var _name = fsn[i]['name'].substr(5);
                fso[_name] = fsn[i];

                if(o.task[_name] !== undefined || fch.indexOf(_name) !== -1){

                    switch(_name){

                        case 'progress':
                            fso[_name].value = o.progressToPercent(o.task[_name]) + ' %';
                            fso[_name].onclick = o.onClickLightboxInput;
                            fso[_name].onkeyup = o.onChangeWithPrefix;
                            break;

                        case 'users':
                            fso[_name].value = o.task[_name];
                            fso[_name].onclick = o.onClickLightboxInput;
                            break;

                        case 'predecessor':
                            fso[_name].onclick = o.onClickLightboxInput;
                            break;

                        case 'milestone':
                            fso[_name].checked = o.task.type == 'milestone';
                            fso[_name].onclick = o.onClickLightboxInputMilestone;
                            break;

                        // todo buffer
                        /*case 'buffer':
                            fso[_name].value = o.task.buffer + ' days';
                            fso[_name].onclick = o.onClickLightboxInput;
                            fso[_name].onkeyup = o.onChangeWithPrefix;
                            break;*/

                        case 'start_date':
                        case 'end_date':
                            fso[_name].value = app.timeDateToStr(o.task[_name]);
                            break;

                        default:
                            fso[_name].value = o.task[_name];
                            fso[_name].onkeyup = o.onChangeLightboxInput;
                    }
                }
            }
            return fso;
        })();


        var startDate = app.timeStrToDate(app.data.baseProjectTask.start_date);

        $('input[name=lbox_start_date]', document.querySelector('#generate-lbox-wrapper')).datetimepicker({
            minDate: startDate,
            maxDate: app.addDaysToDate(365, startDate),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect: o.onChangeLightboxInputDate
        });

        $('input[name=lbox_end_date]', document.querySelector('#generate-lbox-wrapper')).datetimepicker({
            minDate: (function(){
                var fsd = $('input[name=lbox_start_date]').val();
                return app.timeStrToDate(fsd?fsd:startDate);
            })(),
            maxDate: app.addDaysToDate(365, startDate),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect: o.onChangeLightboxInputDate
        });

    };


    o.onAfterLightbox = function (){

        // todo buffer
        // Buffer update date position to time with buffer
        /*gantt._get_tasks_data().map(function(task){
            if(task.buffer > 0 && task.isBuffered !== true){
                app.injectBufferToDate(task, parseFloat(task.buffer), true);
                task.isBuffered = true;
                gantt.render();
            }
        });*/
    };

    o.onChangeWithPrefix = function (event){
        if(!o.task || !o.field) return;

        var target = event.target,
            name = target.name,
            value = target.value;

        if(name == 'lbox_progress'){
            target.value = o.progressToPercent( o.percentToProgress(value) ) + ' %';
            o.task['progress'] = o.percentToProgress(value);
        }
        /*if(name == 'lbox_buffer'){
            var _value = parseInt(value);
            if(_value > 100) _value = 100;
            setTimeout(function(){
                target.value = _value + ' days';
                o.task['buffer'] = _value;
            },300);
        }*/
    };


    o.onChangeLightboxInput = function (event){

        var target = event.target,
            name = target['name'].substr(5),
            value = target['value'],
            type = target['type'];

        if(o.task[name] !== undefined){
            o.task[name] = value;
        }
    };

    //o._tmpCurrentMinDate = null;

    o.onChangeLightboxInputDate = function (date, picObj){
        if(!o.task || !o.field) return;
        var name = this['name'].substr(5);

        /*if(name == 'start_date')
            o._tmpCurrentMinDate = app.timeStrToDate(date);
        else if(name == 'end_date')
            picObj.settings.minDate = o._tmpCurrentMinDate ? o._tmpCurrentMinDate : picObj.settings.minDate;*/

        o.task[name] = app.timeStrToDate(date);
    };

    o.onClickLightboxInputMilestone = function (event){
        if(!o.task || !o.field) return;
        var target = event.target;

        if(target.checked == true){
            o.task.type = gantt.config.types.milestone;
        } else{
            o.task.type = gantt.config.types.task;

            // date fix for task
            o.task.end_date = app.addDaysToDate(7, o.task.start_date);
        }
    };

    o.onClickLightboxInput = function (event){

        if(!o.task || !o.field) return;
        var target = this || event.target,
            popup = null;

        if(target['name'] == 'lbox_users'){
            o.resourcesViewGenerate();
            popup = o.showPopup(target, o.resourcesView);

            popup.style.width = '510px';
            popup.style.height = 'auto';
            popup.style.zIndex = '999';
            popup.style.left = '10px';
            popup.style.overflowY = 'none';
            //popup.style.paddingTop = '10px';

            //$('.lbox_popup_wrap', popup).customScrollbar("remove");
            $(popup).customScrollbar("remove");

            o.resourcesAppoint(popup);
            o.resourceOnClickListener(popup, target);
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
            o.predecessorViewGenerate();

            var view = o.predecessorView,
                labels = document.createElement('div'),
                btns = document.createElement('div');

            labels.className = 'predecessor_labels';
            labels.innerHTML = '<span class="lbox_pl_id">ID</span>' +
                '<span class="lbox_pl_name">' + app.t('Taskname') + '</span>' +
                '<span class="lbox_pl_buffer">' + app.t('Buffer') + '</span>' +
                '<span class="lbox_pl_link">' + app.t('Link type') + '</span>';

            view.insertBefore(labels, view.firstChild);

            //view.insertAdjacentHTML('afterend', '<div id="predecessor_labels">two</div>');

            popup = o.showPopup(target, view);

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

            o.predecessorOnClickListener(popup, target);
            //$(".lbox_popup_wrap")
        }
    };

    o.showPopup = function (afterElement, content){
        if(!o.popup){

            var _popup = document.createElement('div'),
                _popupWrap = document.createElement('div'),
                _popupClose = document.createElement('div');

            _popup.id = 'lbox_popup';
            _popup.className = 'lbox_popup';
            _popupWrap.className = 'lbox_popup_wrap';
            _popupClose.className = 'lbox_popup_close icon-close';
            _popupClose.onclick = function(e){o.hidePopup()};
            _popup.appendChild(_popupClose);
            _popup.appendChild(_popupWrap);
            o.popup =  _popup;
            o.popup.content = _popupWrap;
        }

        o.popup.content.innerHTML = '';

        if(content.nodeType === Node.ELEMENT_NODE || content.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
            o.popup.content.appendChild(content);
        else if(typeof content === 'string')
            o.popup.content.innerHTML = content;

        afterElement.parentNode.appendChild(o.popup);
        return o.popup;
    };
    o.hidePopup = function (){
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
    o.onLightboxSave = function (id, task, is_new){
        var _id = null;


        // todo not used now.
        /*
        app.eachLinksById(id, 'target', function(link){
            var predecessor = gantt.getTask(link.source);
            var buffer = app.u.isNum(predecessor.buffer) ? parseInt(predecessor.buffer) : 0;
            if(buffer > 0) {
                o.task.start_date = app.addDaysToDate(buffer, predecessor.end_date);
                o.task.end_date = app.addDaysToDate(buffer+app.daysBetween(task.start_date,task.end_date), predecessor.end_date);
                o.task.is_buffered = true;
            }else{
                gantt.autoSchedule(predecessor.id);
            }
        });
        */

        // after entry in the database, you need to update the id
        if(is_new === true){
            o.task.id_origin = task.id;
            o.task.start_date_timestamp = task.start_date.getTime();
            o.task.end_date_timestamp = task.end_date.getTime();
            o.task.id_origin = task.id;
            o.task.is_new = true;
        }

        // updates all the properties editing task with the current internal object
        app.u.objMerge(task, o.task);
        gantt.updateTask(id);
        return true;
    };
    o.onLightboxCancel = function (){
        o.task = o.field = null;
        return true;
    };
    o.onLightboxDelete = function (id, task){
        var _task = gantt.getTask(id);
        gantt.locale.labels.confirm_deleting = _task.text + " " + (_task.id) + " - will be deleted permanently, are you sure?";
        o.task = o.field = null;
        return true;
    };



    o.resourcesView = null;

    o.resourcesViewGenerate = function (){
        var fragment = document.createDocumentFragment();

        for(var groupName in app.data.groupsusers){

            var _lineGroup = document.createElement('div'),
                _lineUsers = document.createElement('div'),
                _inputGroup = document.createElement('input'),
                _inputLabel = document.createElement('label'),
                _inputSpan = document.createElement('span'),
                users = app.data.groupsusers[groupName],
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
            _inputLabel.innerHTML += ' <strong>' + app.u.ucfirst(groupName) + '</strong>';

            for(var i=0; i<usersCount; i++){
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

        o.resourcesView = fragment;
    };

    o.resourcesAppoint = function (popup){
        var usersTask = o.getResources();
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
                if(app.data.groupsusers[k] && app.data.groupsusers[k].length === groupIn[k])
                    $('input[name='+k+'][data-type=group]', popup).prop('checked', true);
            }
        }
    };


    o.resourceOnClickListener = function (popup, fieldUsers) {
        popup.addEventListener('click', function(event) {
            if(event.target.tagName == 'INPUT'){
                var target = event.target,
                    type = target.getAttribute('data-type'),
                    name = target['name'],
                    checked = target.checked ? true : false;

                if(type === 'user'){
                    if(checked){
                        $('input[name='+name+'][data-type=user]', popup).prop('checked', true);
                        fieldUsers.value = o.addResource(name);
                    }
                    else {
                        $('input[name='+name+'][data-type=user]', popup).prop('checked', false);
                        fieldUsers.value = o.removeResource(name);
                    }
                }
                else if(type === 'group') {
                    var _users = app.data.groupsusers[name].map(function(e){return e['uid']});
                    if(checked) {
                        $('input[data-gid='+name+'][data-type=user]', popup).prop('checked', true);
                        fieldUsers.value = o.addResource(_users);
                    } else {
                        $('input[data-gid='+name+'][data-type=user]', popup).prop('checked', false);
                        fieldUsers.value = o.removeResource(_users);
                    }
                }
            }
        });
    };

    o.getResources = function(){
        var res = [];
        if(o.task.users){
             res = (o.task.users.split(',').map(function(item){return item.trim()})).filter(function(v){return v.length > 1});
        }
        return res;
    };
    o.isResourceUser = function(user) {
        var users = o.getResources();
        //if(users.indexOf(user) !== 1 ) return true;
        //return false;
        return users.indexOf(user) !== 1;
    };
    o.addResource = function(user){
        var users = o.getResources(),
            usersString = '';
        if(typeof user === 'string') user = [user];
        if(app.u.isArr(user) && user.length > 0){
            for(var i=0; i<user.length; i ++)
                users.push(user[i]);

            o.field['users'] = o.task['users'] = usersString =
                app.u.cleanArr(app.u.uniqueArr(users)).join(', ');
        }
        return usersString;
    };
    o.removeResource = function(user){
        var users = o.getResources(),
            usersString = '';
        if(typeof user === 'string') user = [user];
        if(app.u.isArr(user) && user.length > 0){
            for(var i=0; i<user.length; i ++){
                if(users.indexOf(user[i]) !== -1)
                    users.splice(users.indexOf(user[i]),1);
            }
            o.field['users'] = o.task['users'] = usersString =
                app.u.cleanArr(app.u.uniqueArr(users)).join(', ');
        }
        return usersString;
    };

    o.predecessorView = null;

    o.predecessorViewGenerate = function(){
        if(!o.task || !o.field) return;

        var tasks = gantt._get_tasks_data(),
            fragment = document.createDocumentFragment();

        tasks.forEach(function(item){
            if(item.id == o.task.id) return;
            if(item.type == 'project') return;

            var _line = document.createElement('div'),
                _name = document.createElement('div'),
                _link = document.createElement('div'),
                _linkElems = o.predecessorLinkGenerate2(item.id, item.buffer);

            _line.className = 'tbl predecessor_line';
            _name.className = _link.className = 'tbl_cell';

            _name.innerHTML = '<span class="predecessor_item_id">' + (item.id) + '</span>' + item.text;
            _link.appendChild(_linkElems);

            _line.appendChild(_name);
            _line.appendChild(_link);
            fragment.appendChild(_line);
        });

        o.predecessorView = fragment;
    };

    o.predecessorLinkGenerate2 = function(id, buffer){
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
        _inpBuffer.name = 'buffer_' + id;
        _inpBuffer.type = 'text';
        if(buffer > 0) {
            _inpBuffer.value = app.action.buffer.convertSecondsToBuffer(buffer);
        }

        _inpFS.id = 'plg_fs_' + id;
        _inpFS.name = 'plg_' + id;
        _inpFS.type = 'radio';
        _inpFS.value = 0;
        _inpFSLabel.setAttribute('for', 'plg_fs_' + id);
        _inpFSLabel.appendChild(_inpFSSpan);
        _inpFSLabel.appendChild(document.createTextNode('FS'));

        _inpSS.id = 'plg_ss_' + id;
        _inpSS.name = 'plg_' + id;
        _inpSS.type = 'radio';
        _inpSS.value = 1;
        _inpSSLabel.setAttribute('for', 'plg_ss_' + id);
        _inpSSLabel.appendChild(_inpSSSpan);
        _inpSSLabel.appendChild(document.createTextNode('SS'));

        _inpFF.id = 'plg_ff_' + id;
        _inpFF.name = 'plg_' + id;
        _inpFF.type = 'radio';
        _inpFF.value = 2;
        _inpFFLabel.setAttribute('for', 'plg_ff_' + id);
        _inpFFLabel.appendChild(_inpFFSpan);
        _inpFFLabel.appendChild(document.createTextNode('FF'));

        _inpSF.id = 'plg_sf_' + id;
        _inpSF.name = 'plg_' + id;
        _inpSF.type = 'radio';
        _inpSF.value = 3;
        _inpSFLabel.setAttribute('for', 'plg_sf_' + id);
        _inpSFLabel.appendChild(_inpSFSpan);
        _inpSFLabel.appendChild(document.createTextNode('SF'));

        _inpClear.id = 'plg_clear_' + id;
        _inpClear.name = 'plg_' + id;
        _inpClear.type = 'radio';
        _inpClear.value = 'clear';
        _inpClearLabel.setAttribute('for', 'plg_clear_' + id);
        _inpClearLabel.appendChild(_inpClearSpan);
        _inpClearLabel.appendChild(document.createTextNode('no'));

        // todo:linksTarget to linksSource, change _link.source to _link.target
        if(linksSource.length > 0){
            linksSource.map(function(_item){
                var _link = gantt.getLink(_item);
                if(_link.target == o.task.id) {
                    _isChecked = true;
                    switch (_link.type){
                        case '0': _inpFS.checked = true; break;
                        case '1': _inpSS.checked = true; break;
                        case '2': _inpFF.checked = true; break;
                        case '3': _inpSF.checked = true; break;
                    }
                }
            });

            if(!_isChecked) _inpClear.checked = true;

        } else {
            _inpClear.checked = true;
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

        fragment.appendChild(_inpClear);
        fragment.appendChild(_inpClearLabel);

        return fragment;
    };

    o.predecessorOnClickListener = function  (popup, target){
        if(!o.task || !o.field) return;

        $('input[type=radio]', popup).on('click', function(event){
            var id = this.name.split('_')[1];
            var type = this.value;

            if(type == 'clear'){
                //o.deleteLinksWithTarget(id);
                o.deleteLinksWithSource(id);
            }else{
                //o.deleteLinksWithTarget(id);
                o.deleteLinksWithSource(id);
                var linkId = gantt.addLink({
                    id: app.linkIdIterator(),
                    source:  id,
                    target: o.task['id'],
                    type: type
                });
            }
        });

        // todo: buffer fix
        $('input[type=text]', popup).on('change', function(event){
            var id = this.name.split('_')[1],
                task = gantt.getTask(id),
                inputElem = this;

            if(task){
                var bufferSeconds = app.action.buffer.convertBufferToSeconds(this.value);
                var bufferValue = app.action.buffer.convertSecondsToBuffer(bufferSeconds);

                //console.log(this.value, bufferSeconds, bufferValue);
                //console.log(task);

                setTimeout(function(){
                    app.action.buffer.set(task.id, bufferSeconds);
                    inputElem.value = bufferValue;
                    //o.task['buffer'] = _value;
                },300);

                //task.buffer = parseFloat(this.value);
                //if(task.is_buffered === true){
                    //app.injectBufferToDate(task, -task.buffer);
                    //task.isBuffered = false;
                //}
                //gantt.updateTask(id);
            }
        });

        /*$('input[type=text]', popup).on('change', function(event){
            var id = this.name.split('_')[1],
                task = gantt.getTask(id);

            if(task){
                task.buffer = parseFloat(this.value);
                if(task.isBuffered === true){
                    app.injectBufferToDate(task, -task.buffer);
                    task.isBuffered = false;
                }
                gantt.updateTask(id);
            }
        });
         var _value = parseInt(value);
         if(_value > 100) _value = 100;
         setTimeout(function(){
         target.value = _value + ' days';
         o.task['buffer'] = _value;
         },300);
        */
        $('input[type=text]', popup).on('click', function(event){
            this.select();
        });
        $('input[type=text]', popup).on('keyup', function(event){

            // todo not used now.
            /*var id = this.name.split('_')[1],
                task = gantt.getTask(id),
                elem = this,
                buffer = parseInt(elem.value);

            if(buffer > 90) buffer = 90;
            else if(buffer < 0) buffer = 0;
            else if(isNaN(buffer)) buffer = 0;

            setTimeout(function(){
                elem.value = buffer + ' d';
                task.buffer = buffer;
                elem.select();
                gantt.updateTask(id);
            },300);*/

            //console.log(task);
            //console.log(task);
            //console.log(value);
        });

    };


    o.onAfterLinkAdd = function  (id, item){
        gantt.changeLinkId(id, app.linkIdIterator());
        app.action.event.requestLinkUpdater('insert', id, item);
    };

    o.onAfterLinkUpdate = function  (id, item){
        app.action.event.requestLinkUpdater('update', id, item);
    };

    o.onAfterLinkDelete = function  (id, item){
        app.action.event.requestLinkUpdater('delete', id, item);
    };

    o.deleteLinksWithTarget = function  (target){
        var task = gantt.getTask(target),
            links = task.$target;
        if(links.length > 0){
            links.map(function(linkId){
                gantt.deleteLink(linkId);
            });
        }
    };

    o.deleteLinksWithSource = function  (source){
        var task = gantt.getTask(source), links = task.$source;
        if(links.length > 0){
            links.map(function(linkId){
                gantt.deleteLink(linkId);
            });
        }
    };




    /**
     * Uses: app.action.lightbox.progressToPercent()
     * @param num
     * @returns {Number}
     */
    o.progressToPercent = function (num){
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
    o.percentToProgress = function (num){
        var progress = num ? (typeof num === 'string') ? num.replace(/[^\d]+/,'') : num : 0;
        progress = parseFloat(progress/100);
        return (progress > 1) ? 1 : progress;
    };





    o.createField = function(name, value){};

    o.getNode = function(where, name){
        //var e = where.querySelectorAll(name);
    };

    o.addLightboxEvents = function(){};

    o.RemoveLightboxEvents = function(){};

})(jQuery, OC, app);
