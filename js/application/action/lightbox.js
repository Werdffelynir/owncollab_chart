if(App.namespace) { App.namespace('Action.Lightbox', function(App) {

    /**
     * @namespace App.Action.Lightbox
     * @type {*}
     */
    var lbox = {
        task:null,
        field:null,
        popup:null
    };

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
        gantt.config.lightbox.sections = gantt.config.lightbox.project_sections = gantt.config.lightbox.milestone_sections = [
            {name:"template", height:260, type:"template", map_to:"base_template"}
        ];

        //Set the label for the section:
        gantt.locale.labels.section_template = "Edit task detail";

        //Set the content of the control with the help of some event, e.g. the onBeforeLightbox event:
        gantt.attachEvent("onBeforeLightbox", lbox.onBeforeLightbox);

        //gantt.attachEvent("onLightbox", lbox.onLightbox);
        //gantt.attachEvent("onAfterLightbox", lbox.onAfterLightbox);
        //gantt.attachEvent("onLightboxSave", lbox.onLightboxSave);
        //gantt.attachEvent("onLightboxCancel", lbox.onLightboxCancel);
        //gantt.attachEvent("onLightboxDelete", lbox.onLightboxDelete);
        //gantt.attachEvent("onAfterLinkAdd", lbox.onAfterLinkAdd);
        //gantt.attachEvent("onAfterLinkDelete", lbox.onAfterLinkDelete);
        //gantt.attachEvent("onAfterLinkUpdate", lbox.onAfterLinkUpdate);
    };

    /**
     * @param id
     * @returns {boolean}
     */
    lbox.onBeforeLightbox = function (id){
        lbox.task = gantt.getTask(id);
        lbox.task.base_template = '<div id="generate-lbox-wrapper">' + App.node('lbox').innerHTML + '</div>';
        return true;
    };










    lbox.onLightbox = function (id){

        // delete predecessor button if task is first child in the project
        var t = gantt.getTask(id);

        if(t.parent == 0){
            $('#generate-lbox-wrapper [name=lbox_predecessor]').remove();
        }
        if(t.type == 'project'){
            $('#generate-lbox-wrapper .lbox_buffer_wrapp').remove();
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
                            fso[_name].value = lbox.task[_name];
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
                            fso[_name].value = App.Extension.dateTime.dateToStr(lbox.task[_name]); // app.timeDateToStr(lbox.task[_name]);
                            break;

                        default:
                            fso[_name].value = lbox.task[_name];
                            fso[_name].onkeyup = lbox.onChangeLightboxInput;
                    }
                }
            }
            return fso;
        })();


/*        var startDate = app.timeStrToDate(app.data.baseProjectTask.start_date);

        $('input[name=lbox_start_date]', document.querySelector('#generate-lbox-wrapper')).datetimepicker({
            minDate: startDate,
            maxDate: app.addDaysToDate(365, startDate),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect: lbox.onChangeLightboxInputDate
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
            onSelect: lbox.onChangeLightboxInputDate
        });*/

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
        if(!lbox.task || !lbox.field) return;
        var name = this['name'].substr(5);

        /*if(name == 'start_date')
         lbox._tmpCurrentMinDate = app.timeStrToDate(date);
         else if(name == 'end_date')
         picObj.settings.minDate = lbox._tmpCurrentMinDate ? lbox._tmpCurrentMinDate : picObj.settings.minDate;*/

        lbox.task[name] = app.timeStrToDate(date);
    };

    lbox.onClickLightboxInputMilestone = function (event){
        if(!lbox.task || !lbox.field) return;
        var target = event.target;

        if(target.checked == true){
            lbox.task.type = gantt.config.types.milestone;
        } else{
            lbox.task.type = gantt.config.types.task;

            // date fix for task
            lbox.task.end_date = app.addDaysToDate(7, lbox.task.start_date);
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
                '<span class="lbox_pl_name">' + app.t('Taskname') + '</span>' +
                '<span class="lbox_pl_buffer">' + app.t('Buffer') + '</span>' +
                '<span class="lbox_pl_link">' + app.t('Link type') + '</span>';

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
        var _id = null;


        // todo not used now.
        /*
         app.eachLinksById(id, 'target', function(link){
         var predecessor = gantt.getTask(link.source);
         var buffer = app.u.isNum(predecessor.buffer) ? parseInt(predecessor.buffer) : 0;
         if(buffer > 0) {
         lbox.task.start_date = app.addDaysToDate(buffer, predecessor.end_date);
         lbox.task.end_date = app.addDaysToDate(buffer+app.daysBetween(task.start_date,task.end_date), predecessor.end_date);
         lbox.task.is_buffered = true;
         }else{
         gantt.autoSchedule(predecessor.id);
         }
         });
         */

        // after entry in the database, you need to update the id
        if(is_new === true){
            lbox.task.id_origin = task.id;
            lbox.task.start_date_timestamp = task.start_date.getTime();
            lbox.task.end_date_timestamp = task.end_date.getTime();
            lbox.task.id_origin = task.id;
            lbox.task.is_new = true;
        }

        // updates all the properties editing task with the current internal object
        app.u.objMerge(task, lbox.task);
        gantt.updateTask(id);



        // Accept buffer if it set
        var predecessor, successor;
        if(predecessor = app.action.buffer.getTaskPredecessor(id)) {
            if(!isNaN(predecessor.buffer) && predecessor.buffer != 0){
                setTimeout(function(){
                    gantt.autoSchedule(predecessor.id);
                },300);
            }
        }

        return true;
    };
    lbox.onLightboxCancel = function (){
        lbox.task = lbox.field = null;
        return true;
    };
    lbox.onLightboxDelete = function (id, task){
        var _task = gantt.getTask(id);
        gantt.locale.labels.confirm_deleting = _task.text + " " + (_task.id) + " - will be deleted permanently, are you sure?";
        lbox.task = lbox.field = null;
        return true;
    };



    lbox.resourcesView = null;

    lbox.resourcesViewGenerate = function (){
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

        lbox.resourcesView = fragment;
    };

    lbox.resourcesAppoint = function (popup){
        var usersTask = lbox.getResources();
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


    lbox.resourceOnClickListener = function (popup, fieldUsers) {
        popup.addEventListener('click', function(event) {
            if(event.target.tagName == 'INPUT'){
                var target = event.target,
                    type = target.getAttribute('data-type'),
                    name = target['name'],
                    checked = target.checked ? true : false;

                if(type === 'user'){
                    if(checked){
                        $('input[name='+name+'][data-type=user]', popup).prop('checked', true);
                        fieldUsers.value = lbox.addResource(name);
                    }
                    else {
                        $('input[name='+name+'][data-type=user]', popup).prop('checked', false);
                        fieldUsers.value = lbox.removeResource(name);
                    }
                }
                else if(type === 'group') {
                    var _users = app.data.groupsusers[name].map(function(e){return e['uid']});
                    if(checked) {
                        $('input[data-gid='+name+'][data-type=user]', popup).prop('checked', true);
                        fieldUsers.value = lbox.addResource(_users);
                    } else {
                        $('input[data-gid='+name+'][data-type=user]', popup).prop('checked', false);
                        fieldUsers.value = lbox.removeResource(_users);
                    }
                }
            }
        });
    };

    lbox.getResources = function(){
        var res = [];
        if(lbox.task.users){
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
        if(app.u.isArr(user) && user.length > 0){
            for(var i=0; i<user.length; i ++)
                users.push(user[i]);

            lbox.field['users'] = lbox.task['users'] = usersString =
                app.u.cleanArr(app.u.uniqueArr(users)).join(', ');
        }
        return usersString;
    };
    lbox.removeResource = function(user){
        var users = lbox.getResources(),
            usersString = '';
        if(typeof user === 'string') user = [user];
        if(app.u.isArr(user) && user.length > 0){
            for(var i=0; i<user.length; i ++){
                if(users.indexOf(user[i]) !== -1)
                    users.splice(users.indexOf(user[i]),1);
            }
            lbox.field['users'] = lbox.task['users'] = usersString =
                app.u.cleanArr(app.u.uniqueArr(users)).join(', ');
        }
        return usersString;
    };

    lbox.predecessorView = null;

    lbox.predecessorViewGenerate = function(){
        if(!lbox.task || !lbox.field) return;

        var tasks = gantt._get_tasks_data(),
            fragment = document.createDocumentFragment();

        tasks.forEach(function(item){
            if(item.id == lbox.task.id) return;
            if(item.type == 'project') return;

            var _line = document.createElement('div'),
                _name = document.createElement('div'),
                _link = document.createElement('div'),
                _linkElems = lbox.predecessorLinkGenerate2(item.id, item.buffer);

            _line.className = 'tbl predecessor_line';
            _name.className = _link.className = 'tbl_cell';

            _name.innerHTML = '<span class="predecessor_item_id">' + (item.id) + '</span>' + item.text;
            _link.appendChild(_linkElems);

            _line.appendChild(_name);
            _line.appendChild(_link);
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
        _inpBuffer.name = 'buffer_' + id;
        _inpBuffer.type = 'text';

        if(!isNaN(buffer)) {
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
                if(_link.target == lbox.task.id) {
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

    lbox.predecessorOnClickListener = function  (popup, target){
        if(!lbox.task || !lbox.field) return;

        $('input[type=radio]', popup).on('click', function(event){
            var id = this.name.split('_')[1];
            var type = this.value;

            if(type == 'clear'){
                //lbox.deleteLinksWithTarget(id);
                lbox.deleteLinksWithSource(id);
            }else{
                //lbox.deleteLinksWithTarget(id);
                lbox.deleteLinksWithSource(id);
                var linkId = gantt.addLink({
                    id: app.linkIdIterator(),
                    source:  id,
                    target: lbox.task['id'],
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
                    task['buffer'] = bufferSeconds;
                    gantt.updateTask(task.id);
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
         lbox.task['buffer'] = _value;
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


    lbox.onAfterLinkAdd = function  (id, item){
        gantt.changeLinkId(id, app.linkIdIterator());
        app.action.event.requestLinkUpdater('insert', id, item);
    };

    lbox.onAfterLinkUpdate = function  (id, item){
        app.action.event.requestLinkUpdater('update', id, item);
    };

    lbox.onAfterLinkDelete = function  (id, item){
        app.action.event.requestLinkUpdater('delete', id, item);
    };

    lbox.deleteLinksWithTarget = function  (target){
        var task = gantt.getTask(target),
            links = task.$target;
        if(links.length > 0){
            links.map(function(linkId){
                gantt.deleteLink(linkId);
            });
        }
    };

    lbox.deleteLinksWithSource = function  (source) {
        var task = gantt.getTask(source), links = task.$source;
        if(links.length > 0) {
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
    lbox.progressToPercent = function (num){
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
    lbox.percentToProgress = function (num){
        var progress = num ? (typeof num === 'string') ? num.replace(/[^\d]+/,'') : num : 0;
        progress = parseFloat(progress/100);
        return (progress > 1) ? 1 : progress;
    };


    return lbox

})}