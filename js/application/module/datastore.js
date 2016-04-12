if(App.namespace) { App.namespace('Module.DataStore', function(App) {

    /**
     * Internal data store
     * @type {{}}
     */
    var dataStore = {},
        /**
         * @namespace App.Controller.DataStore
         * @type {*}
         */
        store = {};

    /**
     * @namespace App.Controller.DataStore.put
     * @param name
     * @param data
     * @returns {*}
     */
    store.put = function(name, data){
        return dataStore[name] = data;
    };


    /**
     * @namespace App.Controller.DataStore.get
     * @param name
     * @returns {*}
     */
    store.get = function(name){
        return dataStore[name];
    };


    /**
     * @namespace App.Controller.DataStore.getAll
     */
    store.getAll = function(){
        return dataStore;
    };

    /**
     * @namespace App.Controller.DataStore.delete
     * @param name
     */
    store.delete = function(name){
        delete dataStore[name];
    };


    return store

})}