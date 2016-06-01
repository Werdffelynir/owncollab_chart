if(App.namespace) { App.namespace('Module.KeyEvent', function(App) {

    /**
     * @namespace App.Module.KeyEvent
     */
    var mod = {
        events:[],
        disable:[]
    };

    /**
     * @namespace App.Module.KeyEvent
     */
    mod.init = function(){

        window.addEventListener('keyup', function(event){
/*            if(event.keyCode == 27) {
                event.keyCode
                console.log('Close win');
            }*/
        });
    };

    /**
     *
     * @param id
     * @param keyCode
     * @param callback
     */
    mod.add = function(id, keyCode, callback){
        mod.events.push({id:id, keyCode:keyCode, callback:callback});
    };
    mod.get = function(id){
        for (var i = 0; i < mod.events.length; i ++ ) {
            if(typeof mod.events[i] === 'object' && mod.events[i]['id']) {

            }
        }
    };

    mod.remove = function(){};
    mod.enable = function(){};
    mod.disable = function(){};
    mod.isDisable = function(){};

    return mod


})}