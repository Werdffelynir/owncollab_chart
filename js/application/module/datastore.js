if(App.namespace) { App.namespace('Module.DataStore', function(App) {

    /**
     * Internal data store
     * Object { groupsusers: Object, project: Object, tasks: Array[39], links: Array[2], projectTask: Object }
     * @type {{}}
     */
    var dataStore = {},
        /**
         * @namespace App.Module.DataStore
         * @type {*}
         */
        store = {};

    /**
     * @namespace App.Module.DataStore.put
     * @param name
     * @param data
     * @returns {*}
     */
    store.put = function(name, data){
        return dataStore[name] = data;
    };


    /**
     * @namespace App.Module.DataStore.get
     * @param name
     * @returns {*}
     */
    store.get = function(name){
        return dataStore[name];
    };


    /**
     * @namespace App.Module.DataStore.getAll
     */
    store.getAll = function(){
        return dataStore;
    };

    /**
     * @namespace App.Module.DataStore.delete
     * @param name
     */
    store.delete = function(name){
        delete dataStore[name];
    };


    return store

})}