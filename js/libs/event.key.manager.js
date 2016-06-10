/**
 * @url https://github.com/Werdffelynir/EventKeyManagerJS
 */
(function(){
    
    /**
     * @namespace 
     */
    var mod = {
        lastCharCode:null,
        lastEvent:null,
        listEvents:[],
        listDisable:[],
        listenCallback:null,
        defaultEvent: 'keyup'
    };
    
    mod.listen = function(callback){
        mod.listenCallback = callback;
    };
    
    
    /**
     * @namespace 
     */
    mod.init = function(){

        window.addEventListener(mod.defaultEvent, function(event) {
            
            mod.lastEvent = event;
            mod.lastCharCode = event.keyCode;
            
            if(typeof mod.listenCallback === 'function')
                mod.listenCallback.call(mod, event);
            
            var i;
            for (i = 0; i < mod.listEvents.length; i ++ ) {
                if(typeof mod.listEvents[i] === 'object' && 
                   mod.listDisable.indexOf(mod.listEvents[i]['id']) === -1 && mod.listEvents[i]['keyCode'] === event.keyCode ) {
                    
                    if(typeof mod.listEvents[i]['callback'] === 'function')
                        mod.listEvents[i]['callback'].call(mod, event);
                    
                }
            }
            
        });
    };

    /**
     * @param id
     * @param keyCode
     * @param callback
     */
    mod.add = function(id, keyCode, callback){
        if(!mod.getById(id))
            mod.listEvents.push({id:id, keyCode:keyCode, callback:callback});
        else 
            throw new ReferenceError('ID "' + id + '" is exists!');
    };
    
    mod.getById = function(id){
        for (var i = 0; i < mod.listEvents.length; i ++ ) {
            if( typeof mod.listEvents[i] === 'object' && mod.listEvents[i]['id'] === id ) {
                mod.listEvents[i].index = i;
                return mod.listEvents[i];
            }
        }
        return null;
    };
    
    mod.getAllByKeyCode = function(keyCode){
        var result = [];
        for (var i = 0; i < mod.listEvents.length; i ++ ) {
            if(typeof mod.listEvents[i] === 'object' && mod.listEvents[i]['keyCode'] === keyCode) {
                result.push(mod.listEvents[i]);
            }
        }
        return result;
    };
    

    mod.charToCode = function(letter){
        return (letter||'').charCodeAt(0);
    };
    
    mod.codeToChart = function(code){
        return String.fromCharCode(code);
    };
    
    mod.remove = function(id){
        var eventObject;
        if(eventObject = mod.getById(id)) {
            return mod.listEvents.splice(eventObject.index, 1);
        }
    };
    
    mod.enable = function(id){
        var index;
        if ((index = mod.listDisable.indexOf(id)) !== -1) {
            mod.listDisable.splice(index, 1);
        }
    };
    
    mod.disable = function(id){
        if (mod.listDisable.indexOf(id) === -1) {
            mod.listDisable.push(id);
        }
    };
    
    mod.isDisable = function(id){
        return mod.listDisable.indexOf(id) !== -1;
    };
    
    mod.foreachEvent = function(callback){
        return mod.listEvents.map(callback);
    };
    
    window.EventKeyManager = mod;
    
})();