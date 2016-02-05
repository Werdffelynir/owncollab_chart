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

        if(typeof response === 'object' && response.project && response.tasks && response.links && response.resources && response.groupsusers){

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

            if(!app.u.isArr(response.resources))
                error.push("Variable the response.resources. Array must be of type Array, but returned type the: " + typeof response.resources);

            if(error.length > 0){
                error.map(function(item){
                    errorString += "<p>Response data Error! " + item + "</p>";
                });
                app.action.error.page(errorString);
                return;
            }

            // check truth of response
            if(!response.requesttoken.length || response.requesttoken.length < 100){
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

            // run action.config
            app.action.config.init();

            // run action.chart
            app.action.chart.init();

            // run action.sidebar
            app.action.sidebar.init();

            // run action.export
            app.action.export.init();

            // Put project data settings into fields of sidebar
            app.action.sidebar.putProjectSettings(app.data.project);

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

        /**
         * init jq plugin datetimepicker for all elements with class name 'datetimepic'
         */
        $('.datetimepic').datetimepicker({
            minDate: new Date((new Date()).getFullYear() - 1, 1, 1),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect:function(val,eve){
                if(this.name == "share_expire_time"){
                    var elemTime = $('input[name=share_expire_time]')[0];
                    elemTime.value = val;
                    //app.fn.changeEventSettingsField({target:elemTime});
                }
            }
        });

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
        app.dom.inlineError     = o.select('#app-content-inline-error');
        app.dom.lbox            = o.select('#app-lbox');
        app.dom.lbox.save       = o.select('#lbox-save');
        app.dom.lbox.cancel     = o.select('#lbox-cancel');
        app.dom.lbox.delete     = o.select('#lbox-delete');
        app.dom.gantt           = o.select('#gantt-chart');

    }

    /**
     * Query element by selector and return, if element not found display error message
     *
     * @param param
     * @returns {Element}
     */
    o.select = function(param){
        var elem = document.querySelector(param);
        if(!elem)
            app.action.error.page("Can`t query DOM Element by selector: " + param);
        else
            return elem;
    };




})(jQuery, OC, app);
