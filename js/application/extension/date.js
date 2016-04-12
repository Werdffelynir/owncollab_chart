if(App.namespace) { App.namespace('Extension.Date', function(App) {

    /**
     * @namespace App.Extension.Date
     */
    var date = {
        stack: [],
        stackError: []
    };

    /**
     * Convert date to gantt time format
     * @namespace App.Extension.Date.toString
     * @param date
     * @param mask
     */
    date.toString = function (date, mask) {
        mask = mask || "%d.%m.%Y %H:%i";
        var formatFunc = gantt.date.date_to_str(mask);
        return formatFunc(date);
    };

    /**
     * Convert string format to date object
     * @namespace App.Extension.Date.fromString
     * @param date
     * @param mask
     */
    date.fromString = function (date, mask) {
        mask = mask || "%d.%m.%Y %H:%i";
        var formatFunc = gantt.date.str_to_date(mask);
        return formatFunc(date);
    };

    /**
     * Added days to date
     * @namespace App.Extension.Date.addDays
     * @param day       day - 0.04, 1, .5, 10
     * @param startDate
     * @returns {Date}
     */
    date.addDays = function (day, startDate){
        var date = startDate ? new Date(startDate) : new Date();
        date.setTime(date.getTime() + (day * 86400000));
        return date;
    };


    /**
     * Get days between Dates
     * @namespace App.Extension.Date.daysBetween
     * @param date1
     * @param date2
     * @returns {number}
     */
    date.daysBetween = function (date1, date2) {
        var date1_ms = date1.getTime(),
            date2_ms = date2.getTime();
        return Math.round((Math.abs(date1_ms - date2_ms))/86400000)
    };

    /**
     * get timestamp of Date
     * @namespace App.Extension.Date.time
     * @param date
     * @returns {number}
     */
    date.time = function(date){
        return date instanceof Date ? date.getTime() : (new Date).getTime();
    };

    return date

})}