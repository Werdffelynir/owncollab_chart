if(App.namespace) { App.namespace('Action.Sort', function(App) {

    /**
     * @namespace App.Action.Sort
     * @type {*}
     */
    var sort = {};

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
     * @namespace App.Action.Sort.init
     */
    sort.init = function(){

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
        sort.icoSort.start.style.left = '208px';
        sort.icoSort.resource.style.left = '410px';

        sort.icoFilter.task.style.left = '107px';
        sort.icoFilter.resource.style.left = '430px';
    };

    /**
     * change icons position
     * @namespace App.Action.Sort.onEventGridResizeEnd
     * @param column_id
     * @param column_target
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

    /**
     * Filter Event For Task
     * @param event
     */
    sort.onFilterForTask = function(event){

        // save all tasks
        sort.filteringType = 'text';

        // apply filtering
        gantt.attachEvent("onBeforeTaskDisplay", onBeforeTaskDisplayFilters);

        var div = document.createElement('div'),
            inner = '<p>' +App.t('Filter by task groups or tasks')+ '</p>';

        inner += '<div class="tbl">';
        inner += '<div class="tbl_cell"><input id="gantt_filter_name" type="text" placeholder="'+App.t('Enter passphrase to be part of task name')+'" value="' + sort.filtersNames + '"></div>';
        //inner += '<div class="tbl_cell ico_clear"></div>';
        inner += '</div>';

        inner += '<div class="tbl">';
        inner += '<div class="tbl_cell"><input id="gantt_filter_group" type="text" placeholder="'+App.t('Enter passphrase to be part of group name')+'" value="' + sort.filtersNames + '"></div>';
        inner += '<div class="tbl_cell ico_clear"></div>';
        inner += '</div>';

        div.innerHTML = inner;

        var popup = App.Action.Lightbox.showPopup(sort.icoFilter.task, div);
        popup.style.width = '350px';
        popup.style.zIndex = '999';
        popup.style.left = '110px';

        var gantt_filter_name = document.getElementById('gantt_filter_name'),
            gantt_filter_group = document.getElementById('gantt_filter_group'),
            clear_btn = document.querySelector('.ico_clear'),
            clear_btn_group = document.querySelector('.ico_clear_group');


        // -------------------------------------------------------------
        // events sotrings
        gantt_filter_name.addEventListener('keyup', function(event){
            sort.filtersNames = event.target.value;
            gantt.refreshData();
        }, false);

        gantt_filter_group.addEventListener('keyup', function(event){
            sort.filtersGroups = event.target.value;
            gantt.refreshData();
        }, false);


        // -------------------------------------------------------------
        // clear fields
        clear_btn.addEventListener('click', function(event){
            sort.filtersNames = sort.filtersGroups = gantt_filter_group.value = gantt_filter_name.value = '';
            gantt.refreshData();
        }, false);

    };

    // this variables consists filter words
    sort.filteringType = null;
    sort.filtersNames = '';
    sort.filtersGroups = '';
    sort.filtersResourceNames = '';
    sort.filtersResourceGroups = [];

    function onBeforeTaskDisplayFilters(id, task){

        //console.log('gantt_filter_group', id, task);

        if(sort.filteringType === null){
            return true;
        }

        // filter task name - text field
        else if(sort.filteringType == 'text'){
            var child = gantt.getChildren(id),
                text = task.text.toLowerCase(),
                filterName = sort.filtersNames.toLowerCase(),
                filterGroup = sort.filtersGroups.toLowerCase();

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
        else if(sort.filteringType == 'users'){
            var users = task.users.split(',').map(function(item){return item.trim()}),
                usersArr = (Util.isArr(users)) ? users : [],
                resourceName = sort.filtersResourceNames.toLowerCase(),
                resourceGroup = (sort.filtersResourceGroups instanceof Array)
                    ? sort.filtersResourceGroups.map(function(item){return item['uid'].trim()})
                    : [];

            if(resourceName.length > 0 && users.indexOf(resourceName) !== -1) {
                return true;
            }
            if(usersArr.length > 0 && resourceGroup.length > 0 &&
                    usersArr instanceof Array &&
                    resourceGroup instanceof Array &&
                    Util.arrDiff(usersArr, resourceGroup).length === 0) {

                return true;
            }

            //console.log('resourceName', resourceName);
            //console.log('resourceGroup', resourceGroup);

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
    sort.onFilterForResource = function(event){

        var div = document.createElement('div'),
            inner = '<p>'+App.t('Filter by task groups or resource')+'</p>';

        var viewFilterResource = sort.getViewFilterResource();
        div.innerHTML = inner;
        div.appendChild(viewFilterResource);

        var popup = App.Action.Lightbox.showPopup(sort.icoFilter.task, div);
        popup.style.width = '450px';
        popup.style.zIndex = '999';
        popup.style.left = '440px';

        sort.filterResourceOnClickListener(popup);
    };

    sort.getViewFilterResource = function(){

        // calculation already checked items
        var groupFilter = [];
        var usersFilter = Util.isArr(sort.filtersResourceGroups) && sort.filtersResourceGroups.length > 0
            ? sort.filtersResourceGroups.map(function(item){
                groupFilter.push(item['gid']);
                return item['uid']})
            : [];
        if(!Util.isEmpty(sort.filtersResourceNames.length)){
            var _users = sort.filtersResourceNames.split(',');
            _users.map(function(item){
                if(typeof item === 'string' && item.length > 2)
                    usersFilter.push(item.trim())
            });
        }

        var fragment = document.createDocumentFragment();
        for(var groupName in sort.dataGroupsusers){

            var _lineGroup = document.createElement('div'),
                _lineUsers = document.createElement('div'),
                _inputGroup = document.createElement('input'),
                _inputLabel = document.createElement('label'),
                _inputSpan = document.createElement('span'),
                users = sort.dataGroupsusers[groupName],
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
            _inputLabel.innerHTML += ' <strong>' + Util.ucfirst(groupName) + '</strong>';

            // checked for groupName to reopen
            if(groupFilter.indexOf(groupName) !== -1)
                _inputGroup.checked = true;

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
                _inputUserLabel.setAttribute('data-group', users[i]['gid']);
                _inputUserLabel.appendChild(_inputUserSpan);
                _inputUserLabel.innerHTML += users[i]['uid'];

                // checked for users to reopen
                if(usersFilter.indexOf(users[i]['uid']) !== -1)
                    _inputUser.checked = true;

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
    sort.filterResourceOnClickListener = function  (popup){

        $('input', popup).on('change', function(event){

            sort.filteringType = 'users';

            // apply filtering
            gantt.attachEvent("onBeforeTaskDisplay", onBeforeTaskDisplayFilters);

            var input = event.target,
                name = input.name,
                checked = input.checked,
                gid = input.getAttribute('data-gid'),
                type = input.getAttribute('data-type');

            if(type == 'user'){

                if(checked) sort.filtersResourceNames = name;
                else sort.filtersResourceNames = '';

                gantt.refreshData();
            }
            else if(type == 'group'){
                //console.log('group', this.checked);
                //$('input[data-gid='+name+']').prop('checked');
                //$('label[data-group='+name+']').click();

                if(sort.dataGroupsusers[name]){
                    if(checked) sort.filtersResourceGroups = sort.dataGroupsusers[name];
                    else sort.filtersResourceGroups = '';
                }

                gantt.refreshData();
            }

            //console.log(name);
            //console.log(sort.filtersResourceNames);

        });
    };

    return sort

})}