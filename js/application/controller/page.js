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
            actionRedo:      App.query('#act_redo'),
            ganttSave:       App.query('#ganttsave'),
            ganttSaveLoadIco:App.query('#ganttsaveloading'),
            sortedfilters:   App.query('#sortedfilters')
        });


        Error.init(node.appContentWrap, node.appContentError, node.inlineError);


        /**
         * The next step is to load the project data via a special API
         */
        Api.request('getproject', onProjectLoaded);
        //App.uid = $(App.node('gantt')).attr('data-id');
        App.isPublic = Util.isEmpty($(App.node('gantt')).attr('data-id'));
    }

    function onProjectLoaded(response){

        if( typeof response !== 'object' || typeof response.project !== 'object' ||
            typeof response.tasks !== 'object' || typeof response.links !== 'object' ||
            typeof response.groupsusers !== 'object') {
            Error.page(App.t('The necessary modules of application are not loaded!'));
            return;
        }


        //console.log('onProjectLoaded >>> ', response);

        if(response.errorinfo.length > 2) {
            Error.inline(App.t('Response error info') + '[' + response.errorinfo + ']');
        }

        // check truth of response (only for owncloud version 8)
        // if(!response.requesttoken.length || response.requesttoken.length < 36){
        //     App.requesttoken = response.requesttoken;
        //     Error.page('Security at risk. Suspicious response from the server. Possible substitution of data.');
        //     return;
        // }

        if((!response.uid || App.uid !== response.uid) && !App.isPublic) {
            Error.page(App.t('Security at risk. Suspicious response from the server.'));
            return;
        }

        Chart.linkIdIterator((function(){
            if(response.links.length == 0) return 1;
            else return Math.max.apply( Math, response.links.map(function(item){return item.id}) )
        })());

        Chart.taskIdIterator(Math.max.apply( Math, response.tasks.map(function(item){
            return item.id;
        })));

        App.isAdmin = response['isadmin'];
        App.lang = response['lang'];

        //console.log(response.groupsusers);

        // merge with local saved settings
        if(response.project.show_today_line == '0' && Util.Storage('show_today_line'))
            response.project.show_today_line = '1';

        if(response.project.show_user_color == '0' && Util.Storage('show_user_color'))
            response.project.show_user_color = '1';

        if(response.project.show_task_name == '0' && Util.Storage('show_task_name'))
            response.project.show_task_name = '1';

        if(Util.Storage('scale_type'))
            response.project.scale_type = Util.Storage('scale_type');

        DataStore.put('data', response);
        DataStore.put('groupsusers', response.groupsusers);
        DataStore.put('project', response.project);
        DataStore.put('tasks', response.tasks);
        DataStore.put('links', response.links);

        // Language
        var languagePathScript = null;
        if(App.locale.toLowerCase().indexOf('de') !== -1)
            languagePathScript = App.urlGantt + 'locale/locale_de.js';
        else if(App.locale=='ru')
            languagePathScript = App.urlGantt + 'locale/locale_ru.js';

        App.require('gantt',
            [
                App.urlGantt + 'dhtmlxgantt.js',
                languagePathScript,
                App.urlGantt + 'api.js',
                App.urlGantt + 'ext/dhtmlxgantt_undo.js',
                App.urlGantt + 'ext/dhtmlxgantt_marker.js',
                App.urlGantt + 'ext/dhtmlxgantt_grouping.js',
                App.urlGantt + 'ext/dhtmlxgantt_critical_path.js',
                App.urlGantt + 'ext/dhtmlxgantt_auto_scheduling.js'
            ],
            initGantt, initGanttError).requireStart();

        // display elements
        App.node('topbar').style['display'] = 'block';

        if (App.isAdmin) {
            // init Event Key Manager
            App.Action.Keyevent.init();
            // Editable grit bar
            App.Action.EditGrid.init();
        }
    }

    function initGanttError(){
        Error.page(App.t('The necessary scripts of dhtmlxgantt are not loaded!'));
    }
    function initGantt(list){
        if(!gantt) {
            initGanttError();
            return;
        }
        Chart.init(node.gantt, ganttBefore, ganttReady);
    }


    function ganttBefore(){
        //console.log('ganttBefore');
    }

    function ganttReady(){
        //console.log('ganttReady');

        // Buffer enabled
        App.Action.Buffer.init();
        Chart.enabledZoomFit(App.node('zoomSliderFit'));

        App.Action.Share.init();

        // Dynamic chart resize when change window
        //App.Action.GanttExt.ganttDynamicResize();

        // Alignment sorting and filter icon buttons
        if(!Chart.isInit){
            Chart.isInit = true;
            //App.Action.Sort.onEventGridResizeEnd();
        }

        //window.onbeforeunload = Chart.saveConfirmExit;
        //Chart.saveTimerStart(300000);

        // Start mouse event for show visual focus on cells
        App.Action.Chart.tableHover();

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
