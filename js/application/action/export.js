if(App.namespace) { App.namespace('Action.Export', function(App) {

    /**
     * @namespace App.Action.Export
     * @type {*}
     */
    var exp = {
        projectTask: null,
        formExportToPDF: null
    };

    /** @type {App.Extension.DateTime} */
    var DateTime = null;

    /**
     * Init event click on export buttons
     * @namespace App.Action.Export.init
     */
    exp.init = function (){

        DateTime = App.Extension.DateTime;
        exp.projectTask = gantt.getTask(1); //App.Module.DataStore.get('projectTask');

        exp.toPDF.config = {
            start:  exp.projectTask.end_date,
            end:    exp.projectTask.start_date
        };

        $('.export_gantt').click(function(){

            if(this.classList.contains('export_excel'))
                exp.toExcel();

            if(this.classList.contains('export_pdf'))
                exp.toPDF();

            if(this.classList.contains('export_img'))
                exp.toPNG();

            if(this.classList.contains('export_ical'))
                exp.toICal();

            if(this.classList.contains('export_mc'))
                exp.toMSProject();

        });

        exp.formExportToPDF = document.querySelector('form#formExportToPDF');
        exp.formExportToPDF.onsubmit = exp.onSubmitExportToPDF;

        $('input[name=pdf_start_date], input[name=pdf_end_date]', exp.formExportToPDF).datetimepicker({
            minDate: exp.projectTask.start_date,
            maxDate: exp.projectTask.end_date,
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect: exp.onChangeExportToPDFInputDate
        });
    };

    exp.toExcel = function (){
        var config = {};
        gantt.exportToExcel(config);
    };


    exp.toPDF = function (){
        App.node('sidebarExpPdf').style['display'] = 'block';

        $('input[type=text], input[type=date]', App.node('sidebarExpPdf')).each(function(im , elem) {
            if(elem.name == 'pdf_start_date')
                elem.value = DateTime.dateToStr(exp.projectTask.start_date);
            else
                if(elem.name == 'pdf_end_date')
                elem.value = DateTime.dateToStr(exp.projectTask.end_date);
            else
                elem.value = '';
        });
    };

    exp.toPDF.config = {};

    exp.onChangeExportToPDFInputDate = function(date){

        if(this.name == "pdf_start_date")
            exp.toPDF.config['start'] = DateTime.strToDate(date);

        if(this.name == "pdf_end_date")
            exp.toPDF.config['end'] = DateTime.strToDate(date);
    };

    exp.onSubmitExportToPDF = function (event){
        event.preventDefault();

        var fd = Util.formData(exp.formExportToPDF, true);

        // pdf_start_date: "", pdf_end_date: "", pdf_paper_size: "1", pdf_paper_orientation: "1", pdf_head_left: "",
        // pdf_head_center: "", pdf_head_right: "", pdf_footer_left: "", pdf_footer_center: "", pdf_footer_right: "", pdf_size: ""

        //var styleLink = '<link rel="stylesheet" href="'+app.protocol+"://"+app.host+app.url+'/css/dhtmlxgantt.css">';
        var styleLink = '<link rel="stylesheet" type="text/css" href="https://owncollab.andreasseiler.com/apps/owncollab_chart/css/dhtmlxgantt.css">';
        var style = Util.createStyle();

        style.add('.tbl','display:table; width:100%');
        style.add('.tbl_cell','display:table-cell');
        style.add('.third','width:32%');
        style.add('.center','text-align:center');
        style.add('.right','text-align:right');

        var headerString = '<div class="tbl header">' +
            '<div class="tbl_cell third">' +fd['pdf_head_left']+ '</div>' +
            '<div class="tbl_cell third center">' +fd['pdf_head_center']+ '</div>' +
            '<div class="tbl_cell third right">' +fd['pdf_head_right']+ '</div>' +
            '</div>';

        var footerString = '<div class="tbl footer">' +
            '<div class="tbl_cell third">' +fd['pdf_footer_left']+ '</div>' +
            '<div class="tbl_cell third center">' +fd['pdf_footer_center']+ '</div>' +
            '<div class="tbl_cell third right">' +fd['pdf_footer_right']+ '</div>' +
            '</div>';

        //console.log(styleLink);
        var tmpConfig = {
            autofit: gantt.config.autofit,
            fit_tasks: gantt.config.fit_tasks
        };

        gantt.config.autofit = false;
        gantt.config.fit_tasks = false;

        exp.toPDF.config['config'] = null;
        exp.toPDF.config['name'] = exp.projectTask.text;
        exp.toPDF.config['header'] = styleLink + style.getString() + headerString;
        exp.toPDF.config['footer'] = footerString;

        console.log(exp.toPDF.config);

        gantt.exportToPDF(exp.toPDF.config);

        gantt.config.autofit = tmpConfig.autofit;
        gantt.config.fit_tasks = tmpConfig.fit_tasks;
    };


    exp.toPNG = function (){
        var config = {};
        gantt.exportToPNG(config);
    };

    exp.toICal = function (){
        var config = {};
        gantt.exportToICal(config);
    };

    exp.toMSProject = function (){
        var config = {
            start:  exp.projectTask.end_date,
            end:    exp.projectTask.start_date
        };
        gantt.exportToMSProject(config);
    };

    return exp

})}