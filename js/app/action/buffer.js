/**
 * Action buffer.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.buffer !== 'object')
        app.action.buffer = {};

    // alias of app.action.chart
    var o = app.action.buffer;

    /**
     * Dynamic action options
     */
    o.temp = {};
    o.opt = {};

    /**
     * First buffer setup
     * Uses: app.action.buffer.init();
     */
    o.init = function(){
        gantt.eachTask(function(task){
            if(task.buffer > 0) o.set(task.id, task.buffer);
        });
    };

    /**
     * Set temp param app.action.buffer.temp[task_id] = buffer seconds time
     * Uses: app.action.buffer.set(task_id, buffer)
     * @param task_id
     * @param buffer
     */
    o.set = function(task_id, buffer){
        o.temp[task_id] = buffer;
    };

    /**
     * Uses: app.action.buffer.get()
     * @param task_id
     * @returns {*}
     */
    o.get = function(task_id){
        if(task_id === undefined) {
            return o.temp;
        }else
            return o.temp[task_id];
    };

    /**
     * Delete temp param
     * Uses: app.action.buffer.remove()
     * @param task_id
     */
    o.remove = function(task_id){
        if(task_id === undefined){
            o.temp = {};
        }else{
            if(o.temp[task_id] !== undefined)
                delete o.temp[task_id]
        }
    };

    /**
     * toString formats: DD/HH:MM:SS = '0/00:00:00'
     * Uses: app.action.buffer.toDayHHMMSS()
     * @param seconds
     * @return {*} Object {toString:null, days:null, hours:null, minutes:null, seconds:null}
     */
    o.toDayHHMMSS = function (seconds) {
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
     * Uses: app.action.buffer.convertBufferToSeconds()
     * @param bufferString
     * @returns {number}
     */
    o.convertBufferToSeconds = function (bufferString) {
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
     * Uses: app.action.buffer.convertSecondsToBuffer()
     * @param seconds
     * @returns {string}
     */
    o.convertSecondsToBuffer = function (seconds) {
        var dHMS = o.toDayHHMMSS(seconds);
        return dHMS.days + "d " + dHMS.hours + "h";
    };


    /**
     * Uses: app.action.buffer.getTaskPredecessor(id);
     * @param id
     * @returns {boolean}
     */
    o.getTaskPredecessor = function (id) {
        var links = gantt.getLinks(),
            predecessor = false;
        for(var i = 0; i < links.length; i ++){
            var item = links[i];
            if(item.target == id){
                predecessor = gantt.getTask(item.source);
                break;
            }
        }
        return predecessor;
    };


    /**
     * Uses: app.action.buffer.getTaskSuccessor(id);
     * @param id
     * @returns {boolean}
     */
    o.getTaskSuccessor = function (id) {
        var links = gantt.getLinks(),
            predecessor = false;
        for(var i = 0; i < links.length; i ++){
            var item = links[i];
            if(item.source == id){
                predecessor = gantt.getTask(item.target);
                break;
            }
        }
        return predecessor;
    };

    /**
     *
     * Uses: app.action.buffer.addBufferFS()
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    o.addBufferFS = function (predecessor, successor, buffer) {
        successor.start_date = o.calcBuffer(successor.start_date, buffer);
        successor.end_date = o.calcBuffer(successor.end_date, buffer);
        successor.is_buffered = true;
    };

    /**
     *
     * Uses: app.action.buffer.addBufferSS()
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    o.addBufferSS = function (predecessor, successor, buffer) {
        successor.start_date = o.calcBuffer(predecessor.start_date, buffer);
        successor.end_date = o.calcBuffer(successor.end_date, buffer);
        successor.is_buffered = true;
    };

    /**
     *
     * Uses: app.action.buffer.addBufferSF()
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    o.addBufferSF = function (predecessor, successor, buffer) {
        successor.start_date = o.calcBuffer(successor.start_date, buffer);
        successor.end_date = o.calcBuffer(predecessor.start_date, buffer);
        successor.is_buffered = true;
    };

    /**
     *
     * Uses: app.action.buffer.addBufferFF()
     * @param predecessor
     * @param successor
     * @param buffer
     * @returns {*}
     */
    o.addBufferFF = function (predecessor, successor, buffer) {
        successor.start_date = o.calcBuffer(successor.start_date, buffer);
        successor.end_date = o.calcBuffer(predecessor.end_date, buffer);
        successor.is_buffered = true;
    };

    o.reset = function(){};

    o.calcBuffer = function(task_date, buffer){
        var d = new Date(task_date);
        d.setTime(d.getTime() + buffer);
        return d;
    };

})(jQuery, OC, app);
