
var app = app || {

        /*current user*/
        uid: null,

        /*current project*/
        pid: null,

        /*DOM Elements*/
        elem: {},

        /*application name and folder*/
        name: 'owncollab_chart',

        /*url address to current application*/
		url: OC.generateUrl('/apps/owncollab_chart'),

		/*dependent controllers*/
		controller: {
			main: {},
			settings: {}
		},

		/*dependent modules*/
		module: {
			db: {},
			cookie: {}
		},

		/*dependent actions*/
		action: {
            chart: {},
            config: {},
			error: {},
            lightbox: {},
            page: {},
            sidebar: {}
		},

        /*db project data*/
        data: {
			access:null,
			errorInfo:null,
			uid:null,
			project:null,
			tasks:null,
			links:null,
			resources:null
		},

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
	inc.require(path+'/js/app/action/config.js');
	inc.require(path+'/js/app/action/error.js');
	inc.require(path+'/js/app/action/sidebar.js');
	inc.require(path+'/js/app/action/page.js');
	inc.require(path+'/js/app/action/lightbox.js');

	inc.require(path+'/js/app/module/db.js');

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

    app.api = function (key, func, args){
        $.ajax({
            url: app.url + '/api',
            data: {key:key, uid:app.uid, pid:app.pid, data:args},
            type: 'POST',
            success: function(response){
                if(typeof func === 'function')
                    func.call(app, response);
            }
        });
    };


})(jQuery, OC, app);