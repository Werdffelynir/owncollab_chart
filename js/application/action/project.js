if(App.namespace) { App.namespace('Action.Project', function(App) {

    /**
     * @namespace App.Action.Project
     * @type {*}
     */
    var proj = {
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

        proj.dataProjectTask = DataStore.get('projectTask');
        proj.dataProject = DataStore.get('project');
        proj.dataTasks = DataStore.get('tasks');
        proj.dataLinks = DataStore.get('links');

    };


    /**
     * @namespace App.Action.Project.tasks
     * @returns {Array}
     */
    proj.tasks = function (){
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
     * @param unique     boolean
     * @returns {Array}
     */
    proj.resources = function (unique){
        unique = unique !== false;
        var res = [],
            mapper = function (item) {
                if(item.users.length > 1){
                    item.users.split(" ").map(function(user){res.push(user.trim())});
                }
            };
        proj.tasks().map(mapper);
        return (!!unique) ? Util.uniqueArr(res) : res
    };


    return proj

})}