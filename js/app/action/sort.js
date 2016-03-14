/**
 * Action module.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.sort !== 'object')
        app.action.sort = {};

    // alias of app.action.module
    var o = app.action.sort;

    /**
     * button for sorting columns grid
     * @type {{}}
     */
    o.icoSort = {};

    /**
     * button for filter columns grid
     * @type {{}}
     */
    o.icoFilter = {};

    o.init = function(){

        o.icoSort = {
            id: app.select('#ganttsort_id'),
            task: app.select('#ganttsort_task'),
            start: app.select('#ganttsort_start'),
            resource: app.select('#ganttsort_resource')
        };

        o.icoFilter = {
            task: app.select('#ganttfilter_task'),
            resource: app.select('#ganttfilter_resource')
        };
        o.icoSort.id.direction = false;
        o.icoSort.id.addEventListener('click', o.onSortById, false);
        o.icoSort.task.direction = false;
        o.icoSort.task.addEventListener('click', o.onSortByTask, false);
        o.icoSort.start.direction = false;
        o.icoSort.start.addEventListener('click', o.onSortByStart, false);
        o.icoSort.resource.direction = false;
        o.icoSort.resource.addEventListener('click', o.onSortByResource, false);

        o.icoFilter.task.addEventListener('click', o.onFilterForTask, false);
        o.icoFilter.resource.addEventListener('click', o.onFilterForResource, false);

        o.applyStyle();

    };

    o.applyStyle = function(){
        o.icoSort.id.style.width = '80px';
        o.icoSort.task.style.width = '15px';
        o.icoSort.start.style.width = '200px';
        o.icoSort.resource.style.width = '15px';

        o.icoFilter.task.style.width = '105px';
        o.icoFilter.resource.style.width = '90px';
    };

    /**
     * Sorted Event By Id
     * @param event
     */
    o.onSortById = function(event){
        o.icoSort.id.direction = !o.icoSort.id.direction;
        gantt.sort(sortById);
    };

    function sortById(task1, task2){
        task1 = parseInt(task1.id);
        task2 = parseInt(task2.id);

        if (o.icoSort.id.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     * Sorted Event By Task
     * @param event
     */
    o.onSortByTask = function(event){
        o.icoSort.task.direction = !o.icoSort.task.direction;
        gantt.sort(sortByTask);
    };

    function sortByTask(task1, task2){
        task1 = task1.text;
        task2 = task2.text;

        if (o.icoSort.task.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     * Sorted Event By Start
     * @param event
     */
    o.onSortByStart = function(event){
        o.icoSort.start.direction = !o.icoSort.start.direction;
        gantt.sort(sortByStart);
    };

    function sortByStart(task1, task2){
        task1 = task1.start_date;
        task2 = task2.start_date;

        if (o.icoSort.start.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     * Sorted Event By Resource
     * @param event
     */
    o.onSortByResource = function(event){
        o.icoSort.resource.direction = !o.icoSort.resource.direction;
        gantt.sort(sortByResource);
    };

    function sortByResource(task1, task2){
        task1 = task1.users;
        task2 = task2.users;

        if (o.icoSort.resource.direction){
            return task1 > task2 ? 1 : (task1 < task2 ? -1 : 0);
        } else {
            return task1 > task2 ? -1 : (task1 < task2 ? 1 : 0);
        }
    }

    /**
     *
     * @type {null}
     */
    //o.tasksState = null;

    /**
     * Filter Event For Task
     * @param event
     */
    o.onFilterForTask = function(event){

        // save all tasks
        //o.tasksState = gantt._get_tasks_data();
        o.filteringType = 'text';

        // apply filtering
        gantt.attachEvent("onBeforeTaskDisplay", onBeforeTaskDisplayFilters);

        var div = document.createElement('div'),
            inner = '<p>Filter by task groups or tasks</p>';

        inner += '<p><input id="gantt_filter_name" type="text" placeholder="Enter passphrase to be part of task name" value="' + o.filtersNames + '"></p>';
        inner += '<p>and / or</p>';
        inner += '<p><input id="gantt_filter_group" type="text" placeholder="Enter passphrase to be part of task group" value="' + o.filtersGroups + '"></p>';

        div.innerHTML = inner;

        var popup = app.action.lightbox.showPopup(o.icoFilter.task, div);
        popup.style.width = '350px';
        popup.style.zIndex = '999';
        popup.style.left = '110px';

        var gantt_filter_name = document.getElementById('gantt_filter_name'),
            gantt_filter_group = document.getElementById('gantt_filter_group');

        gantt_filter_name.addEventListener('keyup', function(event){
            o.filtersNames = event.target.value;
            gantt.refreshData();
        }, false);
        gantt_filter_group.addEventListener('keyup', function(event){
            o.filtersGroups = event.target.value;
            gantt.refreshData();
        }, false);

    };

    // this variables consists filter words
    o.filteringType = null;
    o.filtersNames = '';
    o.filtersGroups = '';
    o.filtersResourceNames = '';
    o.filtersResourceGroups = '';

    function onBeforeTaskDisplayFilters(id, task){

        if(o.filteringType === null){
            return true;
        }

        // filter task name - text field
        else if(o.filteringType == 'text'){
            var child = gantt.getChildren(id),
                text = task.text.toLowerCase(),
                filterName = o.filtersNames.toLowerCase(),
                filterGroup = o.filtersGroups.toLowerCase();

            if(filterName.length > 0 && text.indexOf(filterName) !== -1 && child.length == 0) {
                return true;
            }
            if(filterGroup.length > 0 && text.indexOf(filterGroup) !== -1 && child.length > 0) {
                return true;
            }

            if(filterName.length == 0 && filterGroup.length == 0) return true;

            // filter over
            return false;
        }

        // filter task with resources - users field
        else if(o.filteringType == 'users'){
            var users = task.users.split(',').map(function(item){return item.trim()}),
                usersArr = (app.u.isArr(users)) ? users : [],
                resourceName = o.filtersResourceNames.toLowerCase(),
                resourceGroup = (o.filtersResourceGroups instanceof Array)
                    ? o.filtersResourceGroups.map(function(item){return item['uid'].trim()})
                    : [];

            if(resourceName.length > 0 && users.indexOf(resourceName) !== -1) {
                return true;
            }
            if(usersArr.length > 0 && resourceGroup.length > 0 &&
                    usersArr instanceof Array &&
                    resourceGroup instanceof Array &&
                    app.u.arrDiff(usersArr, resourceGroup).length === 0) {

                return true;
            }

            // clear filter
            if(resourceName.trim().length == 0 && resourceGroup.length == 0) return true;

            // filter over
            return false;
        }

        return false;
    }

    /**
     * Filter Event For Resource
     * @param event
     */
    o.onFilterForResource = function(event){
        var div = document.createElement('div'),
            inner = '<p>Filter by task groups or resource</p>';

        var viewFilterResource = o.getViewFilterResource();
        div.appendChild(viewFilterResource);

        var popup = app.action.lightbox.showPopup(o.icoFilter.task, div);
        popup.style.width = '450px';
        popup.style.zIndex = '999';
        popup.style.left = '440px';

        o.filterResourceOnClickListener(popup);
    };

    o.getViewFilterResource = function(){

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

            _inputGroup.id = 'sort_g_' + groupName;
            _inputLabel.setAttribute('for', 'sort_g_' + groupName);
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

                _inputUser.id = 'sort_u_' + users[i]['uid'];
                _inputUserLabel.setAttribute('for', 'sort_u_' + users[i]['uid']);
                _inputUserLabel.appendChild(_inputUserSpan);
                _inputUserLabel.innerHTML += users[i]['uid'];

                _inlineUser.appendChild(_inputUser);
                _inlineUser.appendChild(_inputUserLabel);

                _lineUsers.appendChild(_inlineUser);

/*                _inlineUser.appendChild(_inputUser);
                _lineUsers.appendChild(_inlineUser);
                _lineUsers.innerHTML += ' <strong>' + users[i]['uid'] + '</strong>';*/
            }

            fragment.appendChild(_lineGroup);
            fragment.appendChild(_lineUsers);
        }
        return fragment;
    };

    /**
     * @param popup
     */
    o.filterResourceOnClickListener = function  (popup){
        $('input', popup).on('change', function(event){

            o.filteringType = 'users';

            // apply filtering
            gantt.attachEvent("onBeforeTaskDisplay", onBeforeTaskDisplayFilters);

            var input = event.target,
                name = input.name,
                checked = input.checked,
                gid = input.getAttribute('data-gid'),
                type = input.getAttribute('data-type');

            if(type == 'user'){

                if(checked) o.filtersResourceNames = name;
                else o.filtersResourceNames = '';

                gantt.refreshData();
            }
            else if(type == 'group'){

                if(app.data.groupsusers[name]){
                    if(checked) o.filtersResourceGroups = app.data.groupsusers[name];
                    else o.filtersResourceGroups = '';
                }

                gantt.refreshData();
            }

            //console.log(name);
            //console.log(o.filtersResourceNames);

        });
    };

})(jQuery, OC, app);
