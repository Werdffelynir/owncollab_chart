if(App.namespace) { App.namespace('Extension.DateTime', function(App) {

    /**
     * @namespace App.Extension.DateTime
     */
    var dateTime = {
        stack: [],
        stackError: [],
        toUTC: false
    };

    /**
     * Convert date to gantt time format
     * @namespace App.Extension.DateTime.dateToStr
     * @param date
     * @param mask
     */
    dateTime.dateToStr = function (date, mask) {
        mask = mask || "%d.%m.%Y %H:%i";
        var formatFunc = gantt.date.date_to_str(mask, dateTime.toUTC);
        return formatFunc(date);
    };

    /**
     * Convert string format to date object
     * @namespace App.Extension.DateTime.strToDate
     * @param date
     * @param mask
     */
    dateTime.strToDate = function (date, mask) {
        mask = mask || "%d.%m.%Y %H:%i:s";
        var formatFunc = gantt.date.str_to_date(mask, dateTime.toUTC);
        return formatFunc(date);
    };

    /**
     * Added days to date
     * @namespace App.Extension.DateTime.addDays
     * @param day       day - 0.04, 1, .5, 10
     * @param startDate
     * @returns {Date}
     */
    dateTime.addDays = function (day, startDate){
        var date = startDate ? new Date(startDate) : new Date();
        date.setTime(date.getTime() + (day * 86400000));
        return date;
    };


    /**
     * Get days between Dates
     * @namespace App.Extension.DateTime.daysBetween
     * @param date1
     * @param date2
     * @returns {number}
     */
    dateTime.daysBetween = function (date1, date2) {
        var date1_ms = date1.getTime(),
            date2_ms = date2.getTime();
        return Math.round((Math.abs(date1_ms - date2_ms))/86400000)
    };

    /**
     * get timestamp of Date
     * @namespace App.Extension.DateTime.time
     * @param date
     * @returns {number}
     */
    dateTime.time = function(date){
        return date instanceof Date ? date.getTime() : (new Date).getTime();
    };

    return dateTime

})}