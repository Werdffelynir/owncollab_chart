
var app = app || {

        /*application name and folder*/
        name: 'owncollab_chart',

        /*url address to current application*/
        url: OC.generateUrl('/apps/owncollab_chart'),

        /*user is admin*/
        isAdmin: null,

        /*public oc_requesttoken*/
        requesttoken: oc_requesttoken ? encodeURIComponent(oc_requesttoken) : null,

        /*current user*/
        uid: oc_current_user ? encodeURIComponent(oc_current_user) : null,

        /*current project*/
        pid: null,

        /*DOM Elements*/
        dom: {},

		/*dependent controllers*/
		controller: {
			main: {},
			settings: {}
		},

		/*dependent modules*/
		module: {
			db: {},
			util: {}
		},

		/*dependent actions*/
		action: {
            chart: {},
			error: {},
            event: {},
            export: {},
            config: {},
            sidebar: {},
            lightbox: {}
		},

        /*db project data*/
        data: {
			access:null,
			errorinfo:null,
			uid:null,
			project:null,
			tasks:null,
			links:null,
			resources:null
		},

		/*link of app.module.util object*/
		u:{},

        /*edit data to save*/
        edit: {
			project:null,
            tasks:null,
			links:null,
			resources:null
		}
	};

(function ($, OC, app) {

	var inc = new Inc(),
        path = '/apps/' + app.name;

	inc.require(path+'/js/app/controller/main.js');
	inc.require(path+'/js/app/controller/settings.js');

    inc.require(path+'/js/app/action/chart.js');
	inc.require(path+'/js/app/action/error.js');
    inc.require(path+'/js/app/action/event.js');
    inc.require(path+'/js/app/action/export.js');
    inc.require(path+'/js/app/action/config.js');
	inc.require(path+'/js/app/action/sidebar.js');
	inc.require(path+'/js/app/action/lightbox.js');

	inc.require(path+'/js/app/module/db.js');
	inc.require(path+'/js/app/module/util.js');

	inc.onerror = onError;
	inc.onload = onLoaded;

	inc.init();

    /**
     * Executed if any errors occur while loading scripts
     *
     * @param error
     */
	function onError(error) {
		console.error('Error on loading script. Message: ' + error);
        app.action.error.page('Error on loading script');
	}

    /**
     * Running when all scripts loaded is successfully
     */
	function onLoaded() {
		console.log('application loaded...');

        if(typeof gantt === 'object'){

            /**
             * Set application options
             */
            app.uid = OC.currentUser == app.uid ? app.uid : null;

            /**
             * Start controller handler
             */
            app.controller.main.construct();

        }else{

            /**
             * Show error message on main content
             */
            app.action.error.page("JavaScript library dhtmlxGantt not loaded. Object gantt is: " + (typeof gantt));

        }

	}

	/*app methods*/

    /**
     * The method requests to the server. The application should use this method for asynchronous requests
     *
     * @param key  Its execute method on server
     * @param func After request, a run function
     * @param args Arguments to key method
     */
    app.api = function (key, func, args){
        $.ajax({
            url: app.url + '/api',
            data: {key:key, uid:app.uid, pid:app.pid, data:args},
            type: 'POST',
            headers: {requesttoken: app.requesttoken},
            success: function(response){
                if(typeof func === 'function')
                    func.call(app, response);
            },
            error: function(error){
                console.error("API request error to the key: [" + key + "] Error message: " + error);
                app.action.error.inline("API request error to the key: [" + key + "] Error message: " + error);
            }
        });
    };



})(jQuery, OC, app);