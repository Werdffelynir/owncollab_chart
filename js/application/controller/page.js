if(App.namespace){App.namespace('Controller.Page', function(App){
    /**
     * @namespace App.Controller.Page
     */
    var ctrl = {},

        node = {};

    var Linker = App.Extension.Linker;

    /**  @type {App.Action.Api} */
    var Api = App.Action.Api;

    /**  @type {App.Action.Error} */
    var Error = App.Action.Error;

    /**  @type {App.Action.Chart} */
    var Chart = App.Action.Chart;

    /**  @type {App.Module.DataStore} */
    var DataStore = App.Module.DataStore;

    /**
     * @namespace App.Controller.Page.construct
     */
    ctrl.construct = function(){

        App.domLoaded(build);

    };

    function build (){

        // query base HTML elements in the page
        node = App.node({
            contentWrap:     App.query('#content-wrapper'),
            content:         App.query('#content'),
            app:             App.query('#app'),
            appContent:      App.query('#app-content'),
            appContentError: App.query('#app-content-error'),
            appContentWrap:  App.query('#app-content-wrapper'),
            sidebar:         App.query('#app-sidebar'),
            sidebarTabs:     App.query('#sidebar-tab'),
            sidebarToggle:   App.query('#sidebar-toggle'),
            sidebarContent:  App.query('#sidebar-content'),
            sidebarWrap:     App.query('#sidebar-wrapper'),
            sidebarExpPdf:   App.query('#sidebar-export-pdf'),
            inlineError:     App.query('#app-content-inline-error'),
            topbar:          App.query('#topbar'),
            lbox:            App.query('#app-lbox'),
            gantt:           App.query('#gantt-chart'),
            zoomSlider:      App.query('#chart_gantt_zoom_slider'),
            zoomSliderMin:   App.query('#zoom_min'),
            zoomSliderPlus:  App.query('#zoom_plus'),
            zoomSliderFit:   App.query('#zoom_fit_btn'),
            actionUndo:      App.query('#act_undo'),
            actionRedo:      App.query('#act_redo')
        });


        Error.init(node.appContentWrap, node.appContentError, node.inlineError);


        /**
         * The next step is to load the project data via a special API
         */
        Api.request('getproject', onProjectLoaded);
    }

    function onProjectLoaded(response){

        if( typeof response !== 'object' || typeof response.project !== 'object' ||
            typeof response.tasks !== 'object' || typeof response.links !== 'object' ||
            typeof response.groupsusers !== 'object') {
            Error.page('The necessary modules of application are not loaded!');
            return;
        }

        if(response.errorinfo.length > 2) {
            Error.inline('Response error info [' + response.errorinfo + ']');
        }

        // check truth of response
        if(!response.requesttoken.length || response.requesttoken.length < 36){
            App.requesttoken = response.requesttoken;
            Error.page('Security at risk. Suspicious response from the server. Possible substitution of data.');
            return;
        }

        if(!response.uid || App.uid !== response.uid) {
            Error.page('Security at risk. Suspicious response from the server.');
            return;
        }

        Chart.lastLinkId = response['lastlinkid'];
        App.isAdmin = response['isadmin'];
        App.lang = response['lang'];

        DataStore.put('groupsusers', response.groupsusers);
        DataStore.put('project', response.project);
        DataStore.put('tasks', response.tasks);
        DataStore.put('links', response.links);

        App.require('gantt',
            [
                App.urlGantt + 'dhtmlxgantt.js',
                App.urlGantt + 'ext/dhtmlxgantt_undo.js',
                App.urlGantt + 'ext/dhtmlxgantt_marker.js',
                App.urlGantt + 'ext/dhtmlxgantt_critical_path.js',
                App.urlGantt + 'ext/dhtmlxgantt_grouping.js',
                App.urlGantt + 'ext/dhtmlxgantt_auto_scheduling.js',
                App.urlGantt + 'api.js'
            ],
            initGantt, initGanttError).requireStart();

        //console.log(response);


        // display elements
        App.node('topbar').style['display'] = 'block';
    }

    function initGanttError(){
        Error.page('The necessary scripts of dhtmlxgantt are not loaded!');
    }
    function initGantt(list){
        if(!gantt) {
            initGanttError();
            return;
        }

        Chart.init(node.gantt, ganttBefore, ganttReady);
    }
    function ganttBefore(){
        console.log('ganttBefore');

    }

    function ganttReady(){
        console.log('ganttReady');

    }


    /**
     * Return 'admin','user' or 'guest'
     * @namespace App.Controller.Page.whoIs
     * @returns {*}
     */
    ctrl.whoIs = function(){
        if(App.uid){
            return App.isAdmin ? 'admin' : 'user';
        }else
            return 'guest';
    };






    return ctrl;

})}
