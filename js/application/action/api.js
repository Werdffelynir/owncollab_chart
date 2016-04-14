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
        Error = error;
    };

    /**
     * @namespace App.Action.Api.request
     */
    api.request = function(key, func, args) {
        $.ajax({
            url: App.url + '/api',
            data: {key: key, uid: App.uid, data: args},
            type: 'POST',
            timeout: 10000,
            headers: {requesttoken: App.requesttoken},

            success: function (response) {
                if (typeof func === 'function') {
                    func.call(App, response);
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

                app.requesttoken = response.requesttoken;
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