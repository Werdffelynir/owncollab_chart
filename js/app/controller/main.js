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
     *   errorInfo:  "",            // It contains error message
     *   uid:        "",            // now auth
     *   project:    Object,        // project settings
     *   tasks:      Array,         // gantt tasks data
     *   links:      Array,         // gantt links data
     *   resources:  Array          // tasks resources
     *
     * @param response
     */
    function onProjectLoaded(response){
        if(typeof response === 'object' && response.project && response.tasks && response.links && response.resources){

            app.data = response;

            app.action.chart.init();
            app.action.sidebar.init();

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

        app.dom.app             = o.select('#app');
        app.dom.content         = o.select('#app-content');
        app.dom.contentError    = o.select('#app-content-error');
        app.dom.contentWrap     = o.select('#app-content-wrapper');
        app.dom.sidebar         = o.select('#app-sidebar');
        app.dom.sidebar.tabs    = o.select('#sidebar-tab');
        app.dom.sidebar.toggle  = o.select('#sidebar-toggle');
        app.dom.sidebar.content = o.select('#sidebar-content');
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
