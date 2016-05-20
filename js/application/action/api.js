if(App.namespace) { App.namespace('Action.Api', function(App) {

    /**
     * @namespace App.Action.Api
     * @type {*}
     */
    var api = {};
    var Error = null;

    /**
     * @namespace App.Action.Api.init
     * @param error
     */
    api.init = function(error) {
        Error = App.Action.Error;
    };

    /**
     * identifier ready the request to the server
     * @type {boolean}
     */
    api.saveAllReady = true;


    /**
     * Save all tasks, links and project data
     * @namespace App.Action.Api.saveAll
     * @param callback
     */
    api.saveAll = function(callback) {

        var store = App.Module.DataStore,
            tasks = App.Action.Project.tasks(),

            dataSend = {
                tasks: JSON.stringify( tasks ),
                links: JSON.stringify( gantt.getLinks() ),
                project: JSON.stringify( store.get('project') )
            };

        //console.log(tasks);

        if(api.saveAllReady){
            api.saveAllReady = false;
            api.request('saveall', function(response){

                api.saveAllReady = true;
                callback.call(this, response);

            }, dataSend);
        }

    };

    /**
     * @namespace App.Action.Api.request
     * @param key
     * @param callback
     * @param args
     */
    api.request = function(key, callback, args) {
        //console.log('dataSend-request', args);
        $.ajax({
            url: App.url + '/api',
            data: {key: key, uid: App.uid, data: args},
            type: 'POST',
            timeout: 60000,
            headers: {requesttoken: App.requesttoken},

            success: function (response) {
                if (typeof callback === 'function') {
                    callback.call(App, response);
                }
            },

            error: function (error) {
                Error.page("API request error to the key: [" + key + "] Error message");
            },

            complete: function (jqXHR, status) {
                if (status == 'timeout') {
                    Error.page("You have exceeded the request time. possible problems with the Internet, or an error on the server");
                }
            }
        });
    };


    /**
     * @namespace App.Action.Api.sendEmails
     * @param emails
     * @param resources
     * @param link
     */
    api.sendEmails = function(emails, resources, link){

        // change all icon to loading emails
        $('.share_email_butn')
            .css('background', 'url("/apps/owncollab_chart/img/loading-small.gif") no-repeat center center');

        app.api('sendshareemails', function(response) {
            if(typeof response === 'object' && !response['error'] && response['requesttoken']) {

                App.requesttoken = response.requesttoken;
                $('.share_email_butn')
                    .css('background', 'url("/apps/owncollab_chart/img/sent.png") no-repeat center center');

            } else {
                Error.inline('Error Request on send share emails');
            }
        } , {
            emails: emails,
            resources: resources,
            link: link,
            projemail: App.Action.Project.urlName()
        });
    };


    return api;

})}