/**
 * Controller main.js
 */

(function($, OC, app){

    // using depending on the base application
    var o = app.controller.main;

    /**
     * Construct call first when this controller run
     */
    o.construct = function() {


        /**
         * First we need to select all the elements necessary for work.
         * But after the DOM is loaded
         */
        $(document).ready(onDocumentLoaded);
    };

    function onDocumentLoaded(){

        /**
         * Query DOM Elements
         */
        queryDomElements();

        /**
         * Enable external plugins
         */
        enablePlugins();

        /**
         * The next step is to load the project data via a special API
         */
        app.api('getproject', onProjectLoaded);

    }


    /**
     * API execute function, load full data project
     *
     * response is a Object:
     *   access:     "allow|deny",  // It contains "deny" if execute method not exist or permission deny or uid not send
     *   errorinfo:  "",            // It contains error message
     *   uid:        "",            // now auth
     *   isadmin:    "",            // user is admin
     *   project:    Object,        // project settings
     *   tasks:      Array,         // gantt tasks data
     *   links:      Array,         // gantt links data
     *   resources:  Array          // tasks resources
     *   groupsusers:Object         // classify users into groups
     *
     * @type {{access,errorinfo,uid,isadmin,project,tasks,links,resources,groupsusers,requesttoken}} response
     * @param response
     */
    function onProjectLoaded(response){

        //console.log(response);

        if(typeof response === 'object' &&
            response.project &&
            response.tasks &&
            response.links &&
            response.groupsusers
        ){

            // Response data type errors
            var error = [],
                errorString = "";


            // Defined response data per conformity/discrepancy, and throw an errors
            if(!app.u.isObj(response.project))
                error.push("Variable the response.project. Object must be of type Array, but returned type the: " + String(typeof response.project));

            if(!app.u.isArr(response.tasks))
                error.push("Variable the response.tasks. Array must be of type Array, but returned type the: " + typeof response.tasks);

            if(!app.u.isArr(response.links))
                error.push("Variable the response.links. Array must be of type Array, but returned type the: " + typeof response.links);

            if(error.length > 0){
                error.map(function(item){
                    errorString += "<p>Response data Error! " + item + "</p>";
                });
                app.action.error.page(errorString);
                return;
            }

            // check truth of response
            if(!response.requesttoken.length || response.requesttoken.length < 36){
                app.requesttoken = response.requesttoken;
                app.action.error.page('Security at risk. Suspicious response from the server. Possible substitution of data.');
                return;
            }
            if(!response.uid || app.uid !== response.uid){
                app.action.error.page('Security at risk. Suspicious response from the server.');
                return;
            }

            // appoint response as data
            app.data = response;
            app.data.lasttaskid = parseInt(response['lasttaskid']) + 1;
            app.data.lastlinkid = parseInt(response['lastlinkid']) + 1;
            app.data.isAdmin = response['isadmin'];

            // accept localStorage settings
            o.dataStorageAccept();

            app.action.chart.ganttFullSize();

            // run action.lightbox
            app.action.lightbox.init();

            // run action.chart
            app.action.chart.init();

            // run action.sidebar
            app.action.sidebar.init();

            // run action.export
            app.action.export.init();

            // run action.sort
            app.action.sort.init();

            // Put project data settings into fields of sidebar
            app.action.sidebar.putProjectSettings(app.data.project);

            // display elements
            app.dom.topbar.style['display'] = 'block';

        }else{

            /**
             * Show error message on main content
             */
            app.action.error.page("Project database not loaded");

        }

    }

    /**
     * Applying external handlers libraries and plug-ins
     */
    function enablePlugins(){


    }

    /**
     * Query Base DOM Elements
     * Appointment links DOM Elements necessary for use
     */
    function queryDomElements(){

        app.dom.contentWrap     = o.select('#content-wrapper');
        app.dom.content         = o.select('#content');
        app.dom.app             = o.select('#app');
        app.dom.appContent      = o.select('#app-content');
        app.dom.appContentError = o.select('#app-content-error');
        app.dom.appContentWrap  = o.select('#app-content-wrapper');
        app.dom.sidebar         = o.select('#app-sidebar');
        app.dom.sidebarTabs     = o.select('#sidebar-tab');
        app.dom.sidebarToggle   = o.select('#sidebar-toggle');
        app.dom.sidebarContent  = o.select('#sidebar-content');
        app.dom.sidebarWrap     = o.select('#sidebar-wrapper');
        app.dom.sidebarExpPdf   = o.select('#sidebar-export-pdf');
        app.dom.inlineError     = o.select('#app-content-inline-error');
        app.dom.topbar          = o.select('.topbar');
        app.dom.lbox            = o.select('#app-lbox');
        app.dom.gantt           = o.select('#gantt-chart');
        app.dom.zoomSlider      = o.select('#chart_gantt_zoom_slider');
        app.dom.actionUndo      = o.select('#act_undo');
        app.dom.actionRedo      = o.select('#act_redo');

    }

    /**
     * Query element by selector and return, if element not found display error message
     *
     * @param param
     * @returns {Element}
     */
    o.select = app.select = function(param){
        var elem = document.querySelector(param);
        if(!elem)
            app.action.error.page("Can`t query DOM Element by selector: " + param);
        else
            return elem;
    };

    o.dataStorageAccept = function(){

        var show_today_line = app.storageGetItem('show_today_line'),
            show_task_name = app.storageGetItem('show_task_name'),
            show_user_color = app.storageGetItem('show_user_color'),
            scale_type = app.storageGetItem('scale_type'),
            scale_fit = app.storageGetItem('scale_fit'),
            critical_path = app.storageGetItem('critical_path');

        if(show_today_line === 'true')          app.data.project['show_today_line'] = 1;
        else if(show_today_line === 'false')    app.data.project['show_today_line'] = 0;

        if(show_task_name === 'true')           app.data.project['show_task_name'] = 1;
        else if(show_task_name === 'false')     app.data.project['show_task_name'] = 0;

        if(show_user_color === 'true')          app.data.project['show_user_color'] = 1;
        else if(show_user_color === 'false')    app.data.project['show_user_color'] = 0;

        if(scale_fit === 'true')                app.data.project['scale_fit'] = 1;
        else if(scale_fit === 'false')          app.data.project['scale_fit'] = 0;

        if(critical_path === 'true')            app.data.project['critical_path'] = 1;
        else if(critical_path === 'false')      app.data.project['critical_path'] = 0;

        if(scale_type)
            app.data.project['scale_type'] = scale_type;
    };

    app.taskIdIterator = function(){
        return app.data.lasttaskid ++;
    };
    app.linkIdIterator = function(){
        return app.data.lastlinkid ++;
    };

})(jQuery, OC, app);
