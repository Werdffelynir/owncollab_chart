if(App.namespace) { App.namespace('Config.Print', function(App) {

    /**
     * @namespace App.Config.Print
     * @type {*}
     */
    var _ = {
        type: 'print',
        dataProject: null,
        option: {}
    };

    /** @type {App.Extension.DateTime} */
    var DateTime = null;

    /** @type {App.Module.DataStore} */
    var DataStore = null;

    /** @type {App.Action.GanttExt} */
    var GanttExt = null;

    /** @type {App.Action.Error} */
    var Error = null;

    /**
     * @namespace App.Config.Print.init
     */
    _.init = function () {

        _.dataProject = DataStore.get('project');

        // Short names of modules
        DateTime = App.Extension.DateTime;
        DataStore = App.Module.DataStore;
        GanttExt = App.Action.GanttExt;
        Error = App.Action.Error;

        // base configs
        _.base();

    };


    /**
     * Base settings gantt.config
     * @namespace App.Config.Print.base
     */
    _.base = function() {

    };




    return _;

})}