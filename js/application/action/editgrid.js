if(App.namespace) { App.namespace('Action.EditGrid', function(App) {

    /**
     * @namespace App.Action.EditGrid.popupLast
     * @namespace App.Action.EditGrid
     * @type {*}
     */
    var act = {
        popupResources: null,
        popupLast: null,
        fieldResources: null,
        //selectedResourcesIds: [],
        realResources: {groups:[],users:[]},
        currentFieldsValues: []
    };
    var Project = null;

    /**
     * @namespace App.Action.EditGrid.init
     */
    act.init = function() {

        Project = App.Action.Project;

    };

    /**
     * @namespace App.Action.EditGrid.createPopupResourcesEdit
     */
    act.createPopupResourcesEdit = function(field){

        act.fieldResources = field || null;

        act.task = gantt.getTask(field.parentNode.parentNode.getAttribute('task_id'));

        try {
            act.realResources = JSON.parse(act.task.users);
        } catch(e) {
            act.task.users = '{"groups":[],"users":[]}';
            //App.Action.Error.inline("Error on createPopupResourcesEdit. Message: " + e.message.toString()) ;
        }

        var dataGroupsusers = Project.dataGroupsUsers;
        var fragment = document.createDocumentFragment();

        for(var groupName in dataGroupsusers){
            var line = act.createUsersGroup(groupName, dataGroupsusers[groupName]);
            fragment.appendChild(line);
        }

        return act.createPopup(fragment, 'grid_edit_resources', onAcceptChangeResources, null);

    };

    function onAcceptChangeResources (event) {

        //var ids = act.selectedResourcesIds;
        //console.log(this);
        //console.log(  );
        //Util.cleanArr(Util.uniqueArr(users)).join(', ');
        // act.fieldResources
    }

    /**
     * @namespace App.Action.EditGrid.removePopup
     */
    act.removePopup = function(){jQuery(act.popupResources).remove();};

    /**
     * @namespace App.Action.EditGrid.createPopup
     * @param content
     * @param specialClass
     * @param on_accept
     * @param on_cancel
     * @returns {null|Element|*}
     */
    act.createPopup = function(content, specialClass, on_accept, on_cancel){

        act.popupResources = document.createElement('div');
        var icoClose = document.createElement('i');

        icoClose.className = 'icon-close ocb_close_ico';
        icoClose.onclick = function(e){  act.removePopup() };

        act.popupResources.className = 'ocb_popup' + (specialClass?' '+specialClass:'');

        if(typeof content === 'object') act.popupResources.appendChild(content);
        else act.popupResources.innerHTML = content;

        act.popupResources.appendChild(icoClose);

        /*var footer = document.createElement('div');
        var button_Accept = document.createElement('button');
        var button_Cancel = document.createElement('button');

        button_Accept.textContent = 'Accept';
        button_Cancel.textContent = 'Cancel';

        footer.appendChild(button_Accept);
        footer.appendChild(button_Cancel);

        if(typeof on_accept === 'function')
            button_Accept.addEventListener('click', on_accept);
        if(typeof on_cancel === 'function')
            button_Cancel.addEventListener('click', on_cancel);

        footer.classList.add('txt_right');

        act.popupResources.appendChild(footer);*/

        return act.popupResources;
    };


    act.createUsersGroup = function(group, users){

        var usersElements = document.createElement('div'),
            oneElement = document.createDocumentFragment();

        oneElement.appendChild(act.createInputWrapper(false, group));

        for(var i = 0; i < users.length; i ++) {
            usersElements.appendChild(act.createInputWrapper(users[i]['uid'], group))
        }

        oneElement.appendChild(usersElements);
        return oneElement
    };


    act.createInputWrapper = function(user, group, listenerHandler) {

        var attr_id = user ? 'user_' + group + '_' + user : 'group_' + group;
        var attr_gid = group;
        var attr_type = user ? 'user' : 'group';
        var attr_name = user ? user : group;

        var wrap = Util.createElement( user ? 'span' : 'div' );
        var input = Util.createElement( 'input', {
            'id':           attr_id,
            'name':         attr_name,
            'type':         'checkbox',
            'class':        '',
            'data-gid':     attr_gid,
            'data-type':    attr_type
        });

        if(attr_type == 'user' && Util.isArr(act.realResources['users']) && act.realResources['users'].indexOf(user) !== -1){
            input.checked = true;
        }
        else if(attr_type == 'group' && Util.isArr(act.realResources['groups']) && act.realResources['groups'].indexOf(group) !== -1){
            input.checked = true;
        }

        /*if(Util.isArr(act.selectedResourcesIds)){

            if(attr_type == 'user' && act.selectedResourcesIds.indexOf(user) !== -1){
                input.checked = true;
            }
            else if(attr_type == 'group' && act.selectedResourcesIds.indexOf(group) !== -1){
                input.checked = true;
            }
        }*/

        input.addEventListener('click', act.onCheckedClickResources);

        var label = Util.createElement( 'label', {'for':attr_id},'<span></span>'+ (attr_type == 'user' ? attr_name : '<b>'+attr_name+'</b>' ));

        wrap.appendChild(input);
        wrap.appendChild(label);

        return wrap;
    };

    act.onCheckedClickResources = function(event){
        //console.log(checked, type, gid, id );
        //console.log(attr_type, user, group, act.selectedResourcesIds);
        //App.Action.Sort.getUsersIdsByGroup

        var checked = !!this.checked;
        var type = this.getAttribute('data-type');
        var gid = this.getAttribute('data-gid');

        var id = this.getAttribute('name');

        var resObj = App.Action.Chart.getJSONResource(act.task.id, false);

        /* */
        if(type == 'user')
        {
            if(checked) resObj['users'].push(id);
            else {
                resObj['users'].forEach(function (item, i, arr) {
                    if(item == id)
                        delete resObj['users'][i];
                    resObj['users'] = Util.cleanArr(resObj['users']);
                });
            }
            //App.Action.Chart.addJSONResource(act.task.id, 'users', id);
            //App.Action.Chart.removeJSONResource(act.task.id, 'users', id);

        }
        else if (type == 'group')
        {
            if(checked) resObj['groups'].push(id); //App.Action.Chart.addJSONResource(act.task.id, 'groups', gid);
            else {
                resObj['groups'].forEach(function (item, i, arr) {
                    if(item == gid)
                        delete resObj['groups'][i];
                    resObj['groups'] = Util.cleanArr(resObj['groups']);
                });
            }
            //App.Action.Chart.removeJSONResource(act.task.id, 'groups', gid);
        }

        //console.log(App.Action.Keyevent.fieldsEditable);

        App.Action.Keyevent.fieldsValues['resources'] = act.task.users = JSON.stringify(resObj);

        var usersString = resObj['users'].join(', ');
        var groupsString = resObj['groups'].join(', ');
        var groupsUsersString = (!Util.isEmpty(groupsString) ? '<strong>' + groupsString + '</strong>, ' : '') + usersString;
        //act.currentFieldsValues['resources'] = groupsUsersString;
        act.fieldResources.innerHTML = groupsUsersString;
        act.removePopup();
        //jQuery(App.Action.Keyevent.fieldsEditable['name']).focus();
        //return false;






        //var getJSONResource = App.Action.Chart.getJSONResource(act.task.id);
        //console.log(getJSONResource);
        //console.log(gantt.getTask(act.task.id).users);
        /*
         App.Action.Chart.addJSONResource(task_id, type, value)
         App.Action.Chart.removeJSONResource(task_id, type, value)
         App.Action.Chart.getJSONResource(task_id, formatJSON)

        if( type == 'user' ) {
            $('#user_'+gid+'_'+id, act.popupResources)[0].checked = checked;
            if(checked)
                act.addResource(id);
            else
                act.removeResource(id);
            //console.log(this);
        }else if( type == 'group' ){
            $('#group_'+gid, act.popupResources)[0].checked = checked;
            $('input[id^=user_'+gid+'_]', act.popupResources).each(function(index, item){
                item.checked = checked;
            });
        }*/
        //console.log(type, id, checked);
        //console.log(this);
    };
/*
    act.addResource = function(id){
        var usersString, users = act.fieldResources.textContent.split(',').map(function(item){return item.trim()});
        users.push(id);
        usersString = Util.cleanArr(Util.uniqueArr(users)).join(', ');
        act.currentFieldsValues['resources'] = usersString;
        act.fieldResources.textContent = usersString;
    };
    act.removeResource = function(id){
        var usersString, users = act.fieldResources.textContent.split(',').map(function(item){return item.trim()});
        if(users.indexOf(id) !== -1){
            users.splice(users.indexOf(id), 1);
        }
        usersString = Util.cleanArr(Util.uniqueArr(users)).join(', ');
        act.currentFieldsValues['resources'] = usersString;
        act.fieldResources.textContent = usersString;
    };*/

    return act;

})}