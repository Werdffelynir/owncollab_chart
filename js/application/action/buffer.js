if(App.namespace) { App.namespace('Action.Buffer', function(App) {

    /**
     * @namespace App.Action.Buffer
     * @type {*}
     */
    var act = {};

    /**
     * Dynamic action options
     */
    act.temp = {};
    act.opt = {};

    /**
     * First buffer setup
     * @namespace App.Action.Buffer.init
     */
    act.init = function(){
        gantt.eachTask(function(task){
            if(task.buffer > 0) act.set(task.id, task.buffer);
        });


        gantt.attachEvent("onAfterTaskAutoSchedule",function(task, startDate, link, predecessor){

            // todo buffer recalculate
            var buffer = Util.isNum(predecessor.buffer) ? parseInt(predecessor.buffer) : 0;

            if(!isNaN(buffer)) {

                buffer *= 1000;

                switch (parseInt(link.type)){
                    case parseInt(gantt.config.links.finish_to_start):
                        act.addBufferFS(predecessor, task, buffer);
                        break;
                    case parseInt(gantt.config.links.start_to_start):
                        act.addBufferSS(predecessor, task, buffer);
                        break;
                    case parseInt(gantt.config.links.start_to_finish):
                        act.addBufferSF(predecessor, task, buffer);
                        break;
                    case parseInt(gantt.config.links.finish_to_finish):
                        act.addBufferFF(predecessor, task, buffer);
                        break;
                }
                task.is_buffered = true;
            }
            return false
        });
    };

    /**
     * Set temp param App.Action.Buffer.temp[task_id] = buffer seconds time
     * @namespace App.Action.Buffer.set
     * @param task_id
     * @param buffer
     */
    act.set = function(task_id, buffer){
        act.temp[task_id] = buffer;
    };

    /**
     * @namespace App.Action.Buffer.get
     * @param task_id
     * @returns {*}
     */
    act.get = function(task_id){
        if(task_id === undefined) {
            return act.temp;
        }else
            return act.temp[task_id];
    };

    /**
     * Delete temp param
     * @namespace App.Action.Buffer.remove
     * @param task_id
     */
    act.remove = function(task_id){
        if(task_id === undefined){
            act.temp = {};
        }else{
            if(act.temp[task_id] !== undefined)
                delete act.temp[task_id]
        }
    };

    /**
     * toString formats: DD/HH:MM:SS = '0/00:00:00'
     * @namespace App.Action.Buffer.toDayHHMMSS
     * @param seconds
     * @return {*} Object {toString:null, days:null, hours:null, minutes:null, seconds:null}
     */
    act.toDayHHMMSS = function (seconds) {
        var value = parseInt(seconds);
        var units = { day:24*60*60, hour:60*60, minute:60, second:1 };
        var result = { days: 0, hours: 0, minutes: 0, seconds: 0, toString: 0 };

        //console.log(value, units);

        for(var name in units) {
            var p =  Math.floor(value/units[name]);
            if(name=='day') result.days = p;
            else if(name=='hour') result.hours = p;
            else if(name=='minute') result.minutes = p;
            else if(name=='second') result.seconds = p;
            value %= units[name];
        }
        //console.log(result.days);
        //if(result.days < 0) result.days ++;

        result.toString = result.days+"/"+result.hours+":"+result.minutes+":"+result.seconds;
        return result;
    };

    /**
     * Convert buffer type "1d 1h" to seconds
     * @namespace App.Action.Buffer.convertBufferToSeconds
     * @param bufferString
     * @returns {number}
     */
    act.convertBufferToSeconds = function (bufferString) {
        var min = false, s = 0, d, h, bs = bufferString.trim();
        if(d = bs.match(/^-/)){min = true}
        if(d = bs.match(/(\d+)d/)){s += parseInt(d) * 86400}
        if(h = bs.match(/(\d+)h/)){s += parseInt(h) * 3600}
        if(bs.indexOf('d') === -1 && bs.indexOf('h') === -1 && !isNaN(bs)){
            s = parseInt(bs) * 3600;
            if(s < 0) min = false;
        }
        return min ? -s : s;
    };

    /**
     * Convert seconds to buffer type "1d 1h"
     * @namespace App.Action.Buffer.convertSecondsToBuffer
     * @param seconds
     * @returns {string}
     */
    act.convertSecondsToBuffer = function (seconds) {
        var dHMS = act.toDayHHMMSS(seconds);
        return dHMS.days + "d " + dHMS.hours + "h";
    };


    /**
     * @namespace App.Action.Buffer.getTaskPredecessor
     * @param id
     * @returns {null|object}
     */
    act.getTaskPredecessor = function (id) {
        var links = gantt.getLinks(),
            link = false,
            predecessor = false;
        for(var i = 0; i < links.length; i ++){
            var item = links[i];
            if(item.target == id){
                link = item;
                predecessor = gantt.getTask(item.source);
                break;
            }
        }
        return predecessor;
    };


    /**
     * @namespace App.Action.Buffer.getTaskSuccessor
     * @param id
     * @returns {null|object}
     */
    act.getTaskSuccessor = function (id) {
        var links = gantt.getLinks(),
            link = false,
            successor = false;
        for(var i = 0; i < links.length; i ++){
            var item = links[i];
            if(item.source == id){
                link = item;
                successor = gantt.getTask(item.target);
                break;
            }
        }
        return successor;
    };

    /**
     * @namespace App.Action.Buffer.addBufferFS
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    act.addBufferFS = function (predecessor, successor, buffer) {
        successor.start_date = act.calcBuffer(successor.start_date, buffer);
        successor.end_date = act.calcBuffer(successor.end_date, buffer);
        successor.is_buffered = true;
    };

    /**
     * @namespace App.Action.Buffer.addBufferSS
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    act.addBufferSS = function (predecessor, successor, buffer) {
        successor.start_date = act.calcBuffer(predecessor.start_date, buffer);
        successor.end_date = act.calcBuffer(successor.end_date, buffer);
        successor.is_buffered = true;
    };

    /**
     * @namespace App.Action.Buffer.addBufferSF
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    act.addBufferSF = function (predecessor, successor, buffer) {
        successor.start_date = act.calcBuffer(successor.start_date, buffer);
        successor.end_date = act.calcBuffer(predecessor.start_date, buffer);
        successor.is_buffered = true;
    };

    /**
     * @namespace App.Action.Buffer.addBufferFF
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    act.addBufferFF = function (predecessor, successor, buffer) {
        successor.start_date = act.calcBuffer(successor.start_date, buffer);
        successor.end_date = act.calcBuffer(predecessor.end_date, buffer);
        successor.is_buffered = true;
    };

    act.reset = function(){};



    /**
     * @namespace App.Action.Buffer.accept
     * @param predecessor
     * @param successor
     * @param buffer
     */
    act.accept = function(predecessor, successor, buffer){

        var link = act.getTargetLink(successor.id);

        if(link && link.source == predecessor.id){

            console.log('accept predecessor:', predecessor);
            console.log('accept successor:', successor);
            console.log('accept buffer:', buffer);
            console.log('accept link.type:', link.type);


           // setTimeout(function(){
            switch (parseInt(link.type)){
                case parseInt(gantt.config.links.finish_to_start):
                    act.addBufferFS(predecessor, successor, buffer);
                    break;
                case parseInt(gantt.config.links.start_to_start):
                    act.addBufferSS(predecessor, successor, buffer);
                    break;
                case parseInt(gantt.config.links.start_to_finish):
                    act.addBufferSF(predecessor, successor, buffer);
                    break;
                case parseInt(gantt.config.links.finish_to_finish):
                    act.addBufferFF(predecessor, successor, buffer);
                    break;
            }
           // },500);
        }

    };

    /**
     * @namespace App.Action.Buffer.calcBuffer
     * @param task_date
     * @param buffer
     * @returns {Date}
     */
    act.calcBuffer = function(task_date, buffer){
        var d = new Date(task_date);
        d.setTime(d.getTime() + buffer);
        return d;
    };


    /**
     * @namespace App.Action.Buffer.getTargetLink
     * @param id
     * @returns {boolean}
     */
    act.getTargetLink = function(id){
        var links = gantt.getLinks(),
            link = false;
        for(var i = 0; i < links.length; i ++){
            var item = links[i];
            if(item.target == id){
                link = item;
                break;
            }
        }
        return link;
    };


    return act;

})}