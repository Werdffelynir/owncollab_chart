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
     * Filter Event For Task
     * @param event
     */
    o.onFilterForTask = function(event){

        var div = document.createElement('div');
        div.innerHTML = '<h2>Filter</h2>';

        var popup = app.action.lightbox.showPopup(o.icoFilter.task, div);

        console.log(o.icoFilter.task);
    };

    /**
     * Filter Event For Resource
     * @param event
     */
    o.onFilterForResource = function(event){

    };

})(jQuery, OC, app);
