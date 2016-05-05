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
     * @type {{taskGroup: Array, taskUsers: Array, resGroup: Array, resUsers: Array}}
     */
    sort.dynamic = {taskGroup:[],taskUsers:[],resGroup:[],resUsers:[]};


    /**
     *
     * @namespace App.Action.Sort.init
     */
    sort.init = function(){

        Project = App.Action.Project;

        gantt.attachEvent("onColumnResizeEnd", sort.onEventGridResizeEnd);
        gantt.attachEvent("onGridResizeEnd", sort.onEventGridResizeEnd);

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

        if (sort.icoSort.start.direction){
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

        var inputName = Util.createElement( 'input', {
            'id':           'gantt_filter_name',
            'type':         'text',
            'placeholder':  App.t('Enter passphrase to be part of task name'),
            'value':        ''
        } );
        inputName.addEventListener('keyup', onFilterClickTask);

        var inputGroup = Util.createElement( 'input', {
            'id':           'gantt_filter_group',
            'type':         'text',
            'placeholder':  App.t('Enter passphrase to be part of group name'),
            'value':        ''
        } );
        inputGroup.addEventListener('keyup', onFilterClickTask);

        var clearFields = Util.createElement( 'div', {'class':'ico_clear'});

        wrap.appendChild(inputName);
        wrap.appendChild(inputGroup);
        wrap.appendChild(clearFields);

        return wrap;
    }


    function filterGroupView(){
        var dataGroupsusers = sort.dataGroupsusers;
        var inner = Util.createElement('p', {}, '<p><b>' +App.t('Filter by task groups or resource')+ '</b><span class="ico_clear clear_filter"></span></p>');
        for(var groupName in dataGroupsusers){
            var fragment = createUsersGroup(groupName, dataGroupsusers[groupName]);
            inner.appendChild(fragment);
        }
        return inner
    }

    function createUsersGroup(group, users){
        var oneElement = document.createDocumentFragment();
        oneElement.appendChild(createInputWrapper(false, group));
        for(var i = 0; i < users.length; i ++){
            oneElement.appendChild(createInputWrapper(users[i]['uid'], group))
        }
        return oneElement
    }

    function createInputWrapper(user, group) {

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
        input.addEventListener('click', onFilterClickResource);

        var label = Util.createElement( 'label', {'for':attr_id},'<span></span>'+ (attr_type == 'user' ? attr_name : '<b>'+attr_name+'</b>' ));

        wrap.appendChild(input);
        wrap.appendChild(label);
        return wrap;
    }

    function onFilterClickResource(event){
        var id = this.id.split('_')[1];
        var name = this.getAttribute('name');
        var type = this.getAttribute('data-type');
        var group = this.getAttribute('data-gid');
        var checked = this.checked;

        console.log(id, name, checked, type, group);

        if(type === 'user') {

            if(checked && sort.dynamic.resUsers.indexOf(name) === -1) {
                sort.dynamic.resUsers.push(name);
            }else if(!checked && sort.dynamic.resUsers.indexOf(name) !== -1) {
                sort.dynamic.resUsers = Util.rmItArr(name, sort.dynamic.resUsers);
            }

        } else {

            if(checked && sort.dynamic.resGroup.indexOf(name) === -1) {
                sort.dynamic.resGroup.push(name);
                sort.dynamic.resUsers = Util.arrMerge(sort.dynamic.resUsers, sort.dataGroupsusers[name]);
                // sort.dynamic.resUsers
                //console.log(sort.dynamic.resUsers, sort.dataGroupsusers);

            }else if(!checked && sort.dynamic.resGroup.indexOf(name) !== -1) {
                sort.dynamic.resGroup = Util.rmItArr(name, sort.dynamic.resGroup);
                sort.dynamic.resUsers = Util.arrDiff(sort.dynamic.resUsers, sort.dataGroupsusers[name]);
            }

        }

        // handler for filtering
        if(sort.startFilteringReady){
            sort.startFilteringReady = false;
            Timer.after(2000, sort.startFiltering);
        }
    }




    function onFilterClickTask(event){
        var type = this.id == 'gantt_filter_name' ? 'task' : 'group';
        var value = this.value;

        if(type === 'task')
            sort.dynamic.taskUsers[0] = value;
        else
            sort.dynamic.taskGroup[0] = value;



        // handler for filtering
        if(sort.startFilteringReady){
            sort.startFilteringReady = false;
            Timer.after(2000, sort.startFiltering);
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





    sort.startFilteringReady = true;
    sort.startFiltering = function(){

        sort.startFilteringReady = true;

        // apply filtering
        gantt.attachEvent("onBeforeTaskDisplay", function(id, task){

        });
        gantt.refreshData();

        console.log(sort.dynamic);
    };
    sort.getUsersIdsByGroup = function(gid){
        // ................
    };

    return sort

})}