var app = app || {

        /*application name and folder*/
        name: 'owncollab_chart',

        /*url address to current application*/
        /*OC.webroot + '/index.php' + OC.appswebroots['owncollab_chart']*/
        url: OC.generateUrl('/apps/owncollab_chart'),

        host: OC.getHost(),

        protocol: OC.getProtocol(),

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
            public: {}
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
            access: null,
            errorinfo: null,
            uid: null,
            project: null,
            baseProjectTask: null,
            tasks: null,
            links: null,
            resources: null,
            groupsusers: null,
            lasttaskid: null,
            lastlinkid: null
        },

        /*alias for app.module.util object*/
        u: {},

        /*edit data to save*/
        edit: {
            project: null,
            tasks: null,
            links: null,
            resources: null
        }
    };

(function ($, OC, app) {

    var inc = new Inc(),
        path = '/apps/' + app.name;

    inc.require(path + '/js/app/controller/main.js');
    inc.require(path + '/js/app/controller/public.js');
    inc.require(path + '/js/app/action/chart.js');
    inc.require(path + '/js/app/action/error.js');
    inc.require(path + '/js/app/action/event.js');
    inc.require(path + '/js/app/action/export.js');
    inc.require(path + '/js/app/action/config.js');
    inc.require(path + '/js/app/action/sidebar.js');
    inc.require(path + '/js/app/action/lightbox.js');
    inc.require(path + '/js/app/action/fitmode.js');
    inc.require(path + '/js/app/action/sort.js');
    inc.require(path + '/js/app/module/db.js');
    inc.require(path + '/js/app/module/util.js');
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

        if (typeof gantt === 'object') {

            /**
             * Set application options
             */
            app.uid = OC.currentUser == app.uid ? app.uid : null;


            /**
             * Start controller handler
             */
            if (app.uid) {
                if (window.location.pathname.indexOf('/s/') === -1)
                    app.controller.main.construct();
                else
                    window.location = app.url;
            }
            else
                app.controller.public.construct();
            //app.action.error.page("Page not loaded. Controller not find.");
        } else {

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
    app.api = function (key, func, args) {
        $.ajax({
            url: app.url + '/api',
            data: {key: key, uid: app.uid, pid: app.pid, data: args},
            type: 'POST',
            timeout: 5000,
            headers: {requesttoken: app.requesttoken},
            success: function (response) {
                if (typeof func === 'function')
                    func.call(app, response);
            },
            error: function (error) {
                console.log("API request error to the key: [" + key + "] Error message: ", error);
                app.action.error.inline("API request error to the key: [" + key + "] Error message: " + error);
            },
            complete: function (jqXHR, status) {
                //console.log("API request complete, status: " + status);
                if (status == 'timeout') {
                    app.action.error.inline("You have exceeded the request time. possible problems with the Internet, or an error on the server server");
                }
            }
        });
    };

    // data-time picker
    app.setTimepicker = function (selector, onSelect) {
        selector = selector || '.datetimepicker';
        $(selector).datetimepicker({
            minDate: new Date((new Date()).getFullYear() - 1, 1, 1),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect: onSelect || null
        });
    };

    /**
     * Convert date to gantt time format
     * @param date
     * @param mask
     */
    app.timeDateToStr = function (date, mask) {
        mask = mask || "%d.%m.%Y %H:%i";
        var formatFunc = gantt.date.date_to_str(mask);
        return formatFunc(date);
    };
    app.timeStrToDate = function (date, mask) {
        mask = mask || "%d.%m.%Y %H:%i";
        var formatFunc = gantt.date.str_to_date(mask);
        return formatFunc(date);
    };

    /**
     * Added days to date
     * @param day       day - 0.04, 1, .5, 10
     * @param startDate
     * @returns {Date}
     */
    app.addDaysToDate = function (day, startDate){
        var date = startDate ? new Date(startDate) : new Date();
        date.setTime(date.getTime() + (day * 86400000));
        return date;
    };

    app.injectBufferToDate = function  (_task, _buffer){
        _buffer = (_buffer === undefined) ? (_task.buffer ? _task.buffer : 0) : _buffer;
        _task.start_date = app.addDaysToDate(parseFloat(_buffer), _task.start_date);
        _task.end_date = app.addDaysToDate(parseFloat(_buffer), _task.end_date);
        return _task;
    };

    /**
     * Saved data to local storage
     * @param name
     * @param value
     */
    app.storageSetItem = function (name, value) {
        return window.localStorage.setItem(name, value);
    };

    /**
     * Pull data to local storage
     * @param name
     * @param orValue
     * @returns {*}
     */
    app.storageGetItem = function (name, orValue) {
        var value = window.localStorage.getItem(name);
        return (value === null) ? orValue : value;
    };

    /**
     * Remove data to local storage
     * @param name
     */
    app.storageRemoveItem = function (name) {
        return window.localStorage.removeItem(name);
    };


    app.t = function (name, params) {
        params = typeof params === 'object' ? params : {};
        return t('owncollab_chart', name, params)
    };


    /**
     * Uses: app.modSampleHeight();
     */
    app.modSampleHeight = function () {
        var headHeight = 60;
        app.dom.gantt.style.height = (parseInt(document.body.offsetHeight) - headHeight) + "px";


        var sidebarWidth = (app.dom.sidebar.classList.contains('disappear')) ? 0 : app.dom.sidebar.offsetWidth;

        app.dom.appContent.style.width = (parseInt(document.body.offsetWidth) - parseInt(sidebarWidth)) + "px";
        gantt.setSizes();
    }


})(jQuery, OC, app);