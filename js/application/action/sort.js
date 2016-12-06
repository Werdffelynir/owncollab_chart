if(App.namespace) { App.namespace('Action.Sort', function(App) {

    /**
     * @namespace App.Action.Sort
     * @type {*}
     */
    var sort = {};

    /** @type {App.Action.Project} Project */
    var Project = null;


    /**
     * button for sorting columns grid
     * @type {{}}
     */
    sort.icoSort = {};

    /**
     * button for filter columns grid
     * @type {{}}
     */
    sort.icoFilter = {};

    /**
     *
     * @type {{}}
     */
    sort.dataGroupsusers = {};

    /**
     *
     * @type {{taskGroup: Array, taskName: Array, resGroup: Array, resUsers: Array}}
     */
    sort.dynamic = {taskGroup:[],taskName:[],resGroup:[],resUsers:[]};
    sort.clearFilter = true;
    sort.startFilteringReady = true;

    /**
     *
     * @namespace App.Action.Sort.init
     */
    sort.init = function(){

        Project = App.Action.Project;

        gantt.attachEvent("onColumnResizeEnd", sort.onEventGridResizeEnd);
        gantt.attachEvent("onGridResizeEnd", sort.onEventGridResizeEnd);
        gantt.attachEvent("onBeforeTaskDisplay", onBeforeTaskDisplay);

        sort.dataGroupsusers = App.Module.DataStore.get('groupsusers');

        sort.icoSort = {
            id: App.query('#ganttsort_id'),
            task: App.query('#ganttsort_task'),
            start: App.query('#ganttsort_start'),
            resource: App.query('#ganttsort_resource')
        };

        sort.icoFilter = {
            task: App.query('#ganttfilter_task'),
            resource: App.query('#ganttfilter_resource')
        };

        sort.icoSort.id.direction = false;
        sort.icoSort.id.addEventListener('click', sort.onSortById, false);
        sort.icoSort.task.direction = false;
        sort.icoSort.task.addEventListener('click', sort.onSortByTask, false);
        sort.icoSort.start.direction = false;
        sort.icoSort.start.addEventListener('click', sort.onSortByStart, false);
        sort.icoSort.resource.direction = false;
        sort.icoSort.resource.addEventListener('click', sort.onSortByResource, false);

        sort.icoFilter.task.addEventListener('click', sort.onFilterForTask, false);
        sort.icoFilter.resource.addEventListener('click', sort.onFilterForResource, false);

        sort.applyStyle();
    };

    sort.applyStyle = function(){

        App.node('sortedfilters').style.display = 'block';

        sort.icoSort.id.style.left = '5px';
        sort.icoSort.task.style.left = '87px';
        sort.icoSort.start.style.left = '220px';
        sort.icoSort.resource.style.left = '455px';

        sort.icoFilter.task.style.left = '107px';
        sort.icoFilter.resource.style.left = '475px';
    };

    /**
     * change icons position
     * @namespace App.Action.Sort.onEventGridResizeEnd
     */
    sort.onEventGridResizeEnd = function () {
        setTimeout(function(){
            sort.icoSort.id.style.left = sort.getColumnPosition('id') + 'px';
            sort.icoSort.task.style.left = sort.getColumnPosition('text') + 'px';
            sort.icoSort.start.style.left = sort.getColumnPosition('start_date') + 'px';
            sort.icoSort.resource.style.left = sort.getColumnPosition('users') + 'px';

            sort.icoFilter.task.style.left = sort.getColumnPosition('text') + 20 + 'px';
            sort.icoFilter.resource.style.left = sort.getColumnPosition('users') + 20 + 'px';
        }, 600);
    };

    /**
     * @namespace App.Action.Sort.getColumnPosition
     * @param column_id
     * @returns {*}
     */
    sort.getColumnPosition = function(column_id) {
        var selector = 'div[column_id='+column_id+']';
        return ($(selector).width() / 2 + $(selector).position().left) - 15
    };


    /**
     * Sorted Event By Id
     * @param event
     */
    sort.onSortById = function(event){
        sort.icoSort.id.direction = !sort.icoSort.id.direction;
        gantt.sort(sortById);
    };

    function sortById(task1, task2){
        task1 = parseInt(task1.id);
        task2 = parseInt(task2.id);

        if (sort.icoSort.id.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     * Sorted Event By Task
     * @param event
     */
    sort.onSortByTask = function(event){
        sort.icoSort.task.direction = !sort.icoSort.task.direction;
        gantt.sort(sortByTask);
    };

    function sortByTask(task1, task2){
        task1 = task1.text;
        task2 = task2.text;

        if (sort.icoSort.task.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     * Sorted Event By Start
     * @param event
     */
    sort.onSortByStart = function(event){
        sort.icoSort.start.direction = !sort.icoSort.start.direction;
        gantt.sort(sortByStart);
    };

    function sortByStart(task1, task2){
        task1 = task1.start_date;
        task2 = task2.start_date;

        if (sort.icoSort.start.direction) {
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     * Sorted Event By Resource
     * @param event
     */
    sort.onSortByResource = function(event){
        sort.icoSort.resource.direction = !sort.icoSort.resource.direction;
        gantt.sort(sortByResource);
    };

    function sortByResource(task1, task2){
        task1 = task1.users;
        task2 = task2.users;

        if (sort.icoSort.resource.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    sort.createPopup = function(content, specialClass){
        var popup = document.createElement('div'),
            icoClose = document.createElement('i');
        icoClose.className = 'icon-close ocb_close_ico';
        icoClose.onclick = function(e){ $(popup).remove() };
        popup.className = 'ocb_popup' + (specialClass?' '+specialClass:'');

        if(typeof content === 'object') popup.appendChild(content);
        else popup.innerHTML = content;

        popup.appendChild(icoClose);
        return popup;
    };

    function filterTaskView(){

        var wrap = Util.createElement( 'div', null, '<p><b>' +App.t('Filter by task groups or tasks')+ '</b><span class="ico_clear clear_filter"></span></p>');

        var inputNameValue = sort.memory('taskname-task');
        var inputName = Util.createElement( 'input', {
            'id':           'gantt_filter_name',
            'type':         'text',
            'placeholder':  App.t('Enter passphrase to be part of task name'),
            'value':        ''
        } );
        if(inputNameValue && inputNameValue.length > 0)
            inputName.value = inputNameValue;

        inputName.addEventListener('keyup', onFilterClickTask);

        var inputGroupValue = sort.memory('taskname-group');
        var inputGroup = Util.createElement( 'input', {
            'id':           'gantt_filter_group',
            'type':         'text',
            'placeholder':  App.t('Enter passphrase to be part of group name'),
            'value':        ''
        } );
        if(inputGroupValue && inputGroupValue.length > 0)
            inputGroup.value = inputGroupValue;

        inputGroup.addEventListener('keyup', onFilterClickTask);

        var clearBtn, clearFields = Util.createElement( 'div', {'class':'ico_clear'});

        wrap.appendChild(inputName);
        wrap.appendChild(inputGroup);
        wrap.appendChild(clearFields);

        if(clearBtn = wrap.querySelector('.clear_filter')) {
            clearBtn.addEventListener('click',function(event){
                inputName.value = inputGroup.value = '';
                sort.clearFilter = true;
                sort.startFilteringReady = true;
                gantt.render();
            });
        }

        return wrap;
    }


    function filterGroupView(){
        var dataGroupsusers = sort.dataGroupsusers;
        var clearBtn, inner = Util.createElement('p', {}, '<p><b>' +App.t('Filter by task groups or resource')+ '</b><span class="ico_clear clear_filter"></span></p>');

        for(var groupName in dataGroupsusers){
            var fragment = createUsersGroup(groupName, dataGroupsusers[groupName]);
            inner.appendChild(fragment);
        }

        if(clearBtn = inner.querySelector('.clear_filter')) {
            clearBtn.addEventListener('click',function(event){

                /*var i, inputs = inner.querySelectorAll('input[type=checkbox]');
                if(typeof inputs === 'object' && inputs.length > 0) {
                    for( i = 0; i < inputs.length; i++ ){
                        if(inputs[i].checked === true) inputs[i].checked = false;
                    }
                } */

                sort.inputCheckedAll(inner, false);
                sort.clearFilter = true;
                sort.startFilteringReady = true;
                gantt.render();
            });
        }

        return inner
    }


    /**
     * @namespace App.Action.Sort.createInputWrapper
     * @type {createInputWrapper}
     */
    sort.createInputWrapper = createInputWrapper;
    /**
     * @namespace App.Action.Sort.createUsersGroup
     * @type {createUsersGroup}
     */
    sort.createUsersGroup = createUsersGroup;

    function createUsersGroup(group, users){
        var deprecatedUsers = ['collab_user'];
        var usersElements = document.createElement('div'),
            oneElement = document.createDocumentFragment();

        oneElement.appendChild(createInputWrapper(false, group));
        for(var i = 0; i < users.length; i ++) {
            // hide deprecated users
            if (deprecatedUsers.indexOf(users[i]['uid']) !== -1) continue;

            usersElements.appendChild(createInputWrapper(users[i]['uid'], group))
        }
        oneElement.appendChild(usersElements);
        return oneElement
    }

    function createInputWrapper(user, group) {

        var attr_id = user ? 'user_' + group + '_' + user : 'group_' + group;
        var attr_gid = group;
        var attr_type = user ? 'user' : 'group';
        var attr_name = user ? user : group;
        var is_checked = sort.memory('resource-' + attr_type + '-' + attr_name) ? true : false;


        var wrap = Util.createElement( user ? 'span' : 'div' );
        var input = Util.createElement( 'input', {
            'id':           attr_id,
            'name':         attr_name,
            'type':         'checkbox',
            'class':        '',
            'data-gid':     attr_gid,
            'data-type':    attr_type
        });

        if(is_checked)
            input.checked = true;

        input.addEventListener('click', onFilterClickResource);

        var label = Util.createElement( 'label', {'for':attr_id},'<span></span>'+ (attr_type == 'user' ? attr_name : '<b>'+attr_name+'</b>' ));

        wrap.appendChild(input);
        wrap.appendChild(label);

        return wrap;
    }

    function onFilterClickResource (event) {
        var id = this.id.split('_')[1];
        var name = this.getAttribute('name');
        var type = this.getAttribute('data-type');
        var group = this.getAttribute('data-gid');
        var checked = this.checked;
        var uids = sort.getUsersIdsByGroup(name);

        //console.log(id, name, checked, type, group, uids);

        sort.memory('resource-' + type + '-' + name, checked);

        if(type === 'user') {

            if (checked && sort.dynamic.resUsers.indexOf(name) === -1) {
                sort.dynamic.resUsers.push(name);
                //jQuery('input[name="'+name+'"]').checked(true);
                jQuery('input[name="'+name+'"][data-type="user"]').prop('checked', true);
                //console.log();
            } else if (!checked && sort.dynamic.resUsers.indexOf(name) !== -1) {
                sort.dynamic.resUsers = Util.rmItArr(name, sort.dynamic.resUsers);
            }

        } else {
            //console.log(group);
            //console.log(sort.dataGroupsusers);

            if(checked && sort.dataGroupsusers[group]) {
                sort.dynamic.resGroup.push(group);
                //sort.dynamic.resUsers = Util.arrMerge(sort.dynamic.resUsers, uids);
            }
            else if(!checked && sort.dynamic.resGroup.indexOf(name) !== -1) {
                sort.dynamic.resGroup = Util.rmItArr(group, sort.dynamic.resGroup);
                //sort.dynamic.resUsers = Util.arrDiff(sort.dynamic.resUsers, uids);
            }

            // todo: отк/вкл чик юзеров
            //sort.inputCheckedAll(this.parentNode.nextSibling, checked);

            /*
            if(checked && sort.dynamic.resGroup.indexOf(name) === -1) {
                sort.dynamic.resGroup.push(name);
                sort.dynamic.resUsers = Util.arrMerge(sort.dynamic.resUsers, uids);
            }
            else if(!checked && sort.dynamic.resGroup.indexOf(name) !== -1) {
                sort.dynamic.resGroup = Util.rmItArr(name, sort.dynamic.resGroup);
                sort.dynamic.resUsers = Util.arrDiff(sort.dynamic.resUsers, uids);
            }*/
        }

        // handler for filtering
        if(sort.startFilteringReady){
            sort.startFilteringReady = false;
            Timer.after(1000, sort.startFiltering);
        }
    }




    function onFilterClickTask(event){
        var type = this.id == 'gantt_filter_name' ? 'task' : 'group';
        var value = this.value;

        sort.memory('taskname-' + type, value);

        if(type === 'task')
            sort.dynamic.taskName[0] = value;
        else
            sort.dynamic.taskGroup[0] = value;

        // handler for filtering
        if(sort.startFilteringReady){
            sort.startFilteringReady = false;
            Timer.after(1000, sort.startFiltering);
        }
    }








    sort.onFilterForTask = function(event){
        var popup = sort.createPopup(filterTaskView(), 'filter_tasks');
        popup.style.width = '350px';
        popup.style.left = '110px';
        App.node('topbar').appendChild(popup);
    };

    sort.onFilterForResource = function(event){
        var popup = sort.createPopup(filterGroupView(), 'filter_resources');
        popup.style.width = '500px';
        popup.style.left = '480px';
        App.node('topbar').appendChild(popup);

        //console.log(event);
    };


    /**
     * Apply filtering
     */
    sort.startFiltering = function(){

        sort.startFilteringReady = true;

        if( !!sort.dynamic.taskName[0] ||
            !!sort.dynamic.taskGroup[0] ||
            !Util.isEmpty(sort.dynamic.resUsers) ||
            !Util.isEmpty(sort.dynamic.resGroup)
        ) {
            console.log('Filtering enabled');
            sort.clearFilter = false;
            gantt.refreshData();
        }else{
            console.log('Filtering disabled');
            sort.clearFilter = true;
            gantt.refreshData();
        }
    };

    function onBeforeTaskDisplay(id, task) {

        if(!sort.clearFilter) {
            var taskName = sort.dynamic.taskName[0] ? sort.dynamic.taskName[0].toLowerCase() : false;
            var taskGroup = sort.dynamic.taskGroup[0] ? sort.dynamic.taskGroup[0].toLowerCase() : false;
            var resUsers = Util.uniqueArr(sort.dynamic.resUsers);
            var resGroup = sort.dynamic.resGroup;
            var show = false;
            var resources = false;

            if(!!taskName && gantt.getChildren(id).length == 0 && task.text.toLowerCase().indexOf(taskName) !== -1 ) {
                show = true;
            }
            if(!!taskGroup && gantt.getChildren(id).length > 0 && task.text.toLowerCase().indexOf(taskGroup) !== -1 ) {
                show = true;
            }

            if(!!resUsers) {
                for(var iu=0; iu < resUsers.length; iu ++){
                    resources = App.Action.Chart.getTaskResources(id);
                    if(resources.users.indexOf(resUsers[iu]) !== -1) {
                        show = true;
                        break;
                    }
                }
            }
            if(!!resGroup) {
                for(var ig=0; ig < resGroup.length; ig ++){
                    resources = App.Action.Chart.getTaskResources(id);
                    if(resources.groups.indexOf(resGroup[ig]) !== -1) {
                        show = true;
                        break;
                    }
                }
            }

            return show;

        }else
            return true;
    }


    /**
     * @namespace App.Action.Sort.getUsersIdsByGroup
     * @param gid
     * @returns {Array}
     */
    sort.getUsersIdsByGroup = function(gid){
        var ids = [];
        var groupsusers = Util.isArr(sort.dataGroupsusers[gid]) ? sort.dataGroupsusers[gid] : [];
        for(var i = 0; i < groupsusers.length; i ++ ){
            ids.push(groupsusers[i]['uid'])
        }
        return ids;
    };

    sort._memoryStore = {};

    /**
     * @namespace App.Action.Sort.memory
     * @param key
     * @param value
     * @returns {*}
     */
    sort.memory = function(key, value){

        if(key === undefined && value === undefined)
            return sort._memoryStore;

        if(value === undefined)
            return sort._memoryStore[key]
        else
            return sort._memoryStore[key] = value

    };

    /**
     * @namespace App.Action.Sort.inputCheckedAll
     * @param nodeWhere
     * @param checked
     */
    sort.inputCheckedAll = function(nodeWhere, checked){

        var i, inputs = nodeWhere.querySelectorAll('input[type=checkbox]');

        if(typeof inputs === 'object' && inputs.length > 0) {
            for( i = 0; i < inputs.length; i++ ){
                inputs[i].checked = !!checked;
                /*if(!!checked)
                    if(inputs[i].checked !== true) inputs[i].checked = true;
                else
                    if(inputs[i].checked === true) inputs[i].checked = false;*/
            }
        }

    };



    return sort

})}