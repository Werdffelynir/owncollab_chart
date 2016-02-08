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

        //
        //o.resourcesViewGenerate();

        //console.log(o.resourcesView);

        //Add the section to the lightbox configuration:
        gantt.config.lightbox.sections = [
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
    };

    o.onBeforeLightbox = function (id){
        o.task = gantt.getTask(id);
        o.task.base_template = '<div id="generate-lbox-wrapper">' + app.dom.lbox.innerHTML + '</div>';
        return true;
    };
    // `id`, `is_project`, `type`, `text`, `users`, `start_date`, `end_date`, `duration`, `order`, `progress`, `sortorder`, `parent`, `deadline`, `planned_start`, `planned_end`, `milestone`, `link`, `open`, `title`, `deleted`)
    //lbox_popup_text
    //

    o.onLightbox = function (id){
        o.field = (function(){
            var fsn = document.querySelectorAll('#generate-lbox-wrapper input'),
                fso = {};

            for(var i=0;i<fsn.length;i++){
                var _name = fsn[i]['name'].substr(5);
                fso[_name] = fsn[i];

                if(o.task[_name] !== undefined){
                    switch(_name){
                        case 'users':
                        case 'predecessor':
                            fso[_name].value = o.task[_name];
                            fso[_name].onclick = o.onClickLightboxInput;
                            break;
                        case 'buffer': break;
                        case 'start_date':
                        case 'end_date':
                            fso[_name].value = app.timeDateToStr(o.task[_name]);
                            break;
                        default:
                            fso[_name].value = o.task[_name];
                            fso[_name].onchange = o.onChangeLightboxInput;
                    }
                }

            }
            return fso;
        })();

        app.setTimepicker('input[name=lbox_start_date], input[name=lbox_end_date]', o.onChangeLightboxInputDate);

    };


    o.onAfterLightbox = function (){};

    o.onChangeLightboxInput = function (event){
        if(!o.task || !o.field) return;
        var target = event.target,
            name = target['name'].substr(5),
            value = target['value'],
            type = target['type'];

        if(o.task[name] !== undefined){
            o.task[name] = value;
        }
    };
    o.onChangeLightboxInputDate = function (date){
        if(!o.task || !o.field) return;
        o.task[this['name'].substr(5)] = app.timeStrToDate(date);
    };

    o.onClickLightboxInput = function (event){
        if(!o.task || !o.field) return;
        var target = this || event.target;


        if(target['name'] == 'lbox_users'){
            o.resourcesViewGenerate();
            var popup = o.showPopup(target, o.resourcesView);
            //console.log(popup);

            o.resourcesAppoint(popup);
            o.resourceOnClickListener(popup, target);

            //console.log('lbox_users',o.task);
        }
        else if(target['name'] == 'lbox_predecessor'){
            o.showPopup(target, 'aaaaaaaaaaaalbox_predecessoraaaaaaaaaaaaa');
            console.log('lbox_predecessor',o.task);
        }

        // gid, uid, displayname
        //console.log(target.name, target.value, target.type);
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
            _popupClose.onclick = function(e){o.showHide()};
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
    o.showHide = function (){
        $('#lbox_popup').remove()
    };



    o.onLightboxSave = function (id,task,isNew){
        app.u.objMerge(task, o.task);
        gantt.updateTask(id);
        return true;
    };
    o.onLightboxCancel = function (){
        o.task = o.field = null;
    };
    o.onLightboxDelete = function (){
        o.task = o.field = null;
    };

    o.resourcesView = null;

    o.resourcesViewGenerate = function (){
        var fragment = document.createDocumentFragment();

        for(var groupName in app.data.groupsusers){

            var _lineGroup = document.createElement('div'),
                _lineUsers = document.createElement('div'),
                _inputGroup = document.createElement('input'),
                users = app.data.groupsusers[groupName],
                usersCount =  users.length;

            _inputGroup.name = String(groupName).trim();
            _inputGroup.type = 'checkbox';
            _inputGroup.className = 'group';
            _inputGroup.setAttribute('data-type', 'group');

            _lineGroup.appendChild(_inputGroup);
            _lineGroup.innerHTML += ' <strong>' + groupName + '</strong>';

            for(var i=0; i<usersCount; i++){
                var _inlineUser = document.createElement('span'),
                    _inputUser = document.createElement('input');

                _inputUser.name = users[i]['uid'];
                _inputUser.type = 'checkbox';
                _inputUser.className = 'user';
                _inputUser.setAttribute('data-type', 'user');
                _inputUser.setAttribute('data-gid', users[i]['gid']);

                _inlineUser.appendChild(_inputUser);
                _lineUsers.appendChild(_inlineUser);
                _lineUsers.innerHTML += ' <strong>' + users[i]['displayname'] + '</strong>';
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
        popup.addEventListener('click', function(event){
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
                else if(type === 'group'){
                    var _users = app.data.groupsusers[name].map(function(e){return e['uid']});
                    if(checked){
                        $('input[data-gid='+name+'][data-type=user]', popup).prop('checked', true);
                        fieldUsers.value = o.addResource(_users);
                    }else {
                        $('input[data-gid='+name+'][data-type=user]', popup).prop('checked', false);
                        fieldUsers.value = o.removeResource(_users);
                    }
                }
            }
        });
    };

    o.getResources = function(){
        var res = (o.task.users.split(',').map(function(item){return item.trim()})).filter(function(v){return v.length > 1});
        return (app.u.isArr(res)) ? res : [];
    };
    o.isResourceUser = function(user) {
        var users = o.getResources();
        if(users.indexOf(user) !== 1 ) return true;
        return false;
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

    /*onLightbox
     onLightboxButton
     onLightboxCancel
     onLightboxChange
     onLightboxDelete
     onLightboxSave

     lbox_popup
     lbox_popup_hide
     lbox_popup_wrap

     lbox_start_date
     lbox_end_date
     lbox_predecessor
     lbox_buffer
     lbox_progress
     lbox_end_milestone




     */
























    o.createField = function(name, value){};

    o.getNode = function(where, name){
        //var e = where.querySelectorAll(name);
    };

    o.addLightboxEvents = function(){};

    o.RemoveLightboxEvents = function(){};

})(jQuery, OC, app);
