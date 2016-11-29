if(App.namespace) { App.namespace('Action.Project', function(App) {

    /**
     * @namespace App.Action.Project
     * @type {*}
     */
    var proj = {
        dataGroupsUsers:null,
        dataProjectTask:null,
        dataProject: null,
        dataTasks: null,
        dataLinks: null
    };


    /** @type {App.Module.DataStore} */
    var DataStore = null;

    /**
     *
     * @namespace App.Action.Project.init
     */
    proj.init = function(){
        DataStore = App.Module.DataStore;

        proj.dataGroupsUsers = DataStore.get('groupsusers');
        proj.dataProjectTask = DataStore.get('projectTask');
        proj.dataProject = DataStore.get('project');
        proj.dataTasks = DataStore.get('tasks');
        proj.dataLinks = DataStore.get('links');

/*        console.log(proj.dataProject.show_today_line, Util.Storage('show_today_line'));
        console.log(proj.dataProject.show_user_color, Util.Storage('show_user_color'));
        console.log(proj.dataProject.show_task_name, Util.Storage('show_task_name'));
        console.log(proj.dataProject.scale_type, Util.Storage('scale_type'));*/

/*        App.Action.Project.dataProject['show_today_line']
        App.Action.Project.dataProject['show_user_color']
        App.Action.Project.dataProject['show_task_name']
        App.Action.Project.dataProject['scale_type']
        */
    };


    /**
     * @namespace App.Action.Project.tasks
     * @returns {Array}
     */
    proj.tasks = function (toUTC){
        var cleanTasks = [];
        for(var key in gantt._pull){
            var cleanTask = {};
            for (var prop in gantt._pull[key]){
                if(prop.indexOf('$') === -1 && prop != 'start_date_origin' && prop != 'end_date_origin'){
                    if (toUTC === true && (prop == 'start_date') || prop != 'end_date')
                        cleanTask[prop] = gantt._pull[key][prop];
                    else
                        cleanTask[prop] = gantt._pull[key][prop];
                }
            }
            cleanTasks.push(cleanTask)
        }
        return cleanTasks;
    };

    proj.onlyVisiblyTasks = function (){
        return gantt._get_tasks_data();
    };

    /**
     * @namespace App.Action.Project.links
     * @returns {Array}
     */
    proj.links = function (){
        return gantt.getLinks();
    };


    /**
     * @namespace App.Action.Project.urlName
     * @returns {String}
     */
    proj.urlName = function (){
        return String(proj.dataProjectTask.text).trim().toLowerCase().replace(/\W+/gm, '_');
    };

    /**
     * @namespace App.Action.Project.resources
     * @returns {Array}
     */
    proj.resources = function (){
        var res = [],
            mapper = function (item) {
                if(item.users.length > 1){
                    item.users.split(" ").map(function(user){res.push(user.trim())});
                }
            };
        proj.tasks().map(mapper);
        return Util.uniqueArr(res)
    };


    return proj

})}