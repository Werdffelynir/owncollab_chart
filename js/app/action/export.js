/**
 * Action export.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.export !== 'object')
        app.action.export = {};

    // alias of app.action.event
    var o = app.action.export;

    /**
     * Init event click on export buttons
     */
    o.init = function (){
        $('.export_gantt').click(function(){
            if(this.classList.contains('export_excel')) o.toExcel();
            if(this.classList.contains('export_pdf'))   o.toPDF();
            if(this.classList.contains('export_img'))   o.toPNG();
            if(this.classList.contains('export_ical'))  o.toICal();
            if(this.classList.contains('export_mc'))    o.toMSProject();
        });
    };

    o.toExcel = function (){
        var config = {};
        gantt.exportToExcel(config);
    };

    o.toPDF = function (){
        var config = {};
        gantt.exportToPDF(config);
    };

    o.toPNG = function (){
        var config = {};
        gantt.exportToPNG(config);
    };

    o.toICal = function (){
        var config = {};
        gantt.exportToICal(config);
    };

    o.toMSProject = function (){
        var config = {};
        gantt.exportToMSProject(config);
    };

})(jQuery, OC, app);
