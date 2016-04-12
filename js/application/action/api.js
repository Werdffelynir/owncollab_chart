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
                //console.error("API request error to the key: [" + key + "] Error message: ", error);
                Error.page("API request error to the key: [" + key + "] Error message");
            },

            complete: function (jqXHR, status) {
                //console.log("API request complete, status: " + status);

                if (status == 'timeout') {
                    Error.page("You have exceeded the request time. possible problems with the Internet, or an error on the server");
                }
            }
        });
    };

    return api;

})}