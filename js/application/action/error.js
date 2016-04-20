if(App.namespace) { App.namespace('Action.Error', function(App) {

    /**
     * @namespace App.Action.Error
     * @type {*}
     */
    var error = {
        contentElement:null,
        contentErrorElement:null,
        lineElement:null
    };


    /**
     * @namespace App.Action.Error.init
     * @param contentElement
     * @param contentErrorElement
     * @param lineElement
     */
    error.init = function (contentElement, contentErrorElement, lineElement){
        error.contentElement = contentElement;
        error.contentErrorElement = contentErrorElement;
        error.lineElement = lineElement;
        return error;
    };

    /**
     * @namespace App.Action.Error.page
     * @param text
     */
    error.page = function (text){

        var title = 'Application throw error';

        if(text){
            $(error.contentElement).hide();
            $(error.contentErrorElement).html('<h1>' + title + '</h1><p>' + text + '</p>').show();
        }else{
            $(error.contentErrorElement).hide();
            $(error.contentElement).show();
        }

    };

    /**
     * @namespace App.Action.Error.inline
     * @param text
     * @param title
     */
    error.inline = function (text, title){

        title = title || 'Application throw error: ';

        if(text){
            $(error.lineElement)
                .show()
                .html(title + text).show();
        }else{
            $(error.lineElement)
                .hide()
                .html();
        }

    };

    return error

})}