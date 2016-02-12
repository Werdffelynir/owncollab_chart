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
        o.icoSort.start.style.width = '245px';
        o.icoSort.resource.style.width = '15px';

        o.icoFilter.task.style.width = '112px';
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
        task1 = task1.id;
        task2 = task2.id;

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

        console.log(task1);
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

    o.filtersNames = '';

    o.filtersGroups = '';

    function onBeforeTaskDisplayFilters(id, task){

        var child = gantt.getChildren(id);

        if(o.filtersNames.length > 0 && task.text.toLowerCase().indexOf(o.filtersNames.toLowerCase()) !== -1 && child.length == 0) {
            return true;
        }
        if(o.filtersGroups.length > 0 && task.text.toLowerCase().indexOf(o.filtersGroups.toLowerCase()) !== -1 && child.length > 0) {
            return true;
        }
        if(o.filtersNames.length == 0 && o.filtersGroups.length == 0) return true;

        return false;
    }

    /**
     * Filter Event For Resource
     * @param event
     */
    o.onFilterForResource = function(event){
        var div = document.createElement('div'),
            inner = '<p>Filter by task groups or resource</p>';

        inner += '<p><input id="gantt_filter_resource" type="text" placeholder="Enter passphrase to be part of task name"></p>';

        div.innerHTML = inner;

        var popup = app.action.lightbox.showPopup(o.icoFilter.task, div);
        popup.style.width = '350px';
        popup.style.zIndex = '999';
        popup.style.left = '490px';
    };

})(jQuery, OC, app);
