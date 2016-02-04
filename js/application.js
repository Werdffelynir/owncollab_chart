
var app = app || {

        /*application name and folder*/
        name: 'owncollab_chart',

        /*url address to current application*/
        url: OC.generateUrl('/apps/owncollab_chart'),

        /*current user*/
        uid: null,

        /*user is admin*/
        isAdmin: null,

        /*public oc_requesttoken*/
        requesttoken: oc_requesttoken ? encodeURIComponent(oc_requesttoken) : null,

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
        path = '/apps/'+app.name,
        hash = window.location.hash.slice(1);

	inc.require(path+'/js/app/controller/main.js');
	inc.require(path+'/js/app/controller/settings.js');

    inc.require(path+'/js/app/action/chart.js');
	inc.require(path+'/js/app/action/error.js');
    inc.require(path+'/js/app/action/event.js');
    inc.require(path+'/js/app/action/config.js');
	inc.require(path+'/js/app/action/sidebar.js');
	inc.require(path+'/js/app/action/lightbox.js');

	inc.require(path+'/js/app/module/db.js');
	inc.require(path+'/js/app/module/util.js');

	inc.onerror = onError;
	inc.onload = onLoaded;

	inc.init();

	function onError(error) {
		console.error('Error on loading script', error);
	}

	function onLoaded() {
		console.log('application loaded...');

        if(typeof gantt === 'object'){

            /**
             * Set application options
             */
            app.uid = OC.currentUser;

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
     * @param key
     * @param func
     * @param args
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
            }
        });
    };

    /*app.api = function (key, func, args){
        var xhr = new XMLHttpRequest(),
            data = {key:key, uid:app.uid, pid:app.pid, data:args};
        if(xhr) {
            xhr.open('POST', app.url + '/api', true);
            xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('requesttoken', app.requesttoken);
            xhr.onreadystatechange = function(response){func.call(app, response)};
            xhr.send(data);
        }

    };*/


})(jQuery, OC, app);