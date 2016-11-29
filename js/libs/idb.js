
(function(window){

    "use strict";
    
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    
    var proto = { version:'0.0.1'
            , store:null
            , openRequest:null
            , onerror:null
            , onsuccess:null
            , onblocked:null
            , onupgradeneeded:null
        }

        
        , db = function(conf){

        if(!(this instanceof Idb)) return new Idb(conf);

        var name = 'name' in conf ? conf.name : 'database'
            , version = 'version' in conf ? conf.version : 1
            , onerror = 'onerror' in conf ? conf.onerror : null
            , onsuccess = 'onsuccess' in conf ? conf.onsuccess : null
            , onblocked = 'onblocked' in conf ? conf.onblocked : null
            , onupgradeneeded = 'onupgradeneeded' in conf ? conf.onupgradeneeded : null
            ;

        this.openRequest = indexedDB.open(name, version);
        this.openRequest.onerror = onerror;
        this.openRequest.onsuccess = onsuccess;
        this.openRequest.onblocked = onblocked;
        this.openRequest.onupgradeneeded = onupgradeneeded;



        }
    ;
    
    proto.open = function(name, version){
    };
    
    proto.close = function(name){
        var transaction = db.transaction(["people"],"readwrite")
            , store = transaction.objectStore("people");
    };
    proto.transaction = function (name) {
        var transaction = this.openRequest.transaction(["people"],"readwrite");
        //      var store = transaction.objectStore("people");  
    };
    proto.store = function(name, version){
        this.open = indexedDB.open(name, version);
    };

    
    window.Idb = db;
    window.Idb.prototype = proto;
    window.Idb.prototype.constructor = db;

})(window);