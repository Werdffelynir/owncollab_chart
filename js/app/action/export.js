/**
 * Action export.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.export !== 'object')
        app.action.export = {};

    // alias of app.action.event
    var o = app.action.export;

    o.formExportToPDF =  null;

    /**
     * Init event click on export buttons
     */
    o.init = function (){
        $('.export_gantt').click(function(){

            if(this.classList.contains('export_excel'))
                o.toExcel();

            if(this.classList.contains('export_pdf'))
                o.toPDF();

            if(this.classList.contains('export_img'))
                o.toPNG();

            if(this.classList.contains('export_ical'))
                o.toICal();

            if(this.classList.contains('export_mc'))
                o.toMSProject();

        });

        o.formExportToPDF = document.querySelector('form#formExportToPDF');
        o.formExportToPDF.onsubmit = o.onSubmitExportToPDF;

        $('input[name=pdf_start_date], input[name=pdf_end_date]', o.formExportToPDF).datetimepicker({
            minDate: new Date((new Date()).getFullYear() - 1, 1, 1),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect: o.onChangeExportToPDFInputDate
        });
    };

    o.toExcel = function (){
        var config = {};
        gantt.exportToExcel(config);
    };


    o.toPDF = function (){
        app.dom.sidebarExpPdf.style['display'] = 'block';
        //var style = app.u.createStyle('.gantt_container');
        /*var styleString = st.getString();
        var styleObject = st.getObject();
        document.body.insertBefore(styleObject, document.body.firstChild);
        console.log(styleString,styleObject);*/
        /*var config = {
                name:"mygantt.pdf",
                header:"<h1>My company</h1>",
                footer:"<h4>Bottom line</h4>",
                locale:"en",
                start:"01-04-2013",
                end:"11-04-2013",
                skin:'terrace',
                data:{}
            };*/
        //gantt.exportToPDF(config);
        /*gantt.exportToPDF();*/
    };

    o.onChangeExportToPDFInputDate = function(){

    };

    o.onSubmitExportToPDF = function (event){
        event.preventDefault();

        var fd = app.u.formData(o.formExportToPDF, true);

        //console.log(fd);

        /*var style = app.u.createStyle('body','background-color:#000' +
            'transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-webkit-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-moz-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-o-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-ms-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);'
        );*/

        // pdf_start_date: "", pdf_end_date: "", pdf_paper_size: "1", pdf_paper_orientation: "1", pdf_head_left: "",
        // pdf_head_center: "", pdf_head_right: "", pdf_footer_left: "", pdf_footer_center: "", pdf_footer_right: "", pdf_size: ""

        /*var style = app.u.createStyle('body','background-color:#000' +
            'transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-webkit-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-moz-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-o-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            '-ms-transform: rotate(93deg) scale(1.001) skew(1deg) translate(0px);' +
            'margin-left: -50%;'
        );*/

        //var styleLink = '<link rel="stylesheet" href="'+app.protocol+"://"+app.host+app.url+'/css/dhtmlxgantt.css">';
        var styleLink = '<link rel="stylesheet" href="https://owncollab.andreasseiler.com/apps/owncollab_chart/css/dhtmlxgantt.css">';
        var style = app.u.createStyle();

        //style.add('body','margin: auto 25px');
        //style.add('.header','margin-top: 25px !important');
        //style.add('.footer','margin-bottom: 25px !important');
        //style.add('.gantt_container','padding 50px');

        style.add('.tbl','display:table; width:100%');
        style.add('.tbl_cell','display:table-cell');
        style.add('.third','width:32%');
        style.add('.center','text-align:center');
        style.add('.right','text-align:right');

        var rotate = '0deg', scale = 1, marginLeft = '';
        if(fd['pdf_paper_orientation'] == 2){
            rotate = '90deg';
            marginLeft = 'margin-left: -52%;';
        }
        if(parseFloat(fd['pdf_size']) > 0 && parseFloat(fd['pdf_size'])  < 2){
            scale = parseFloat(fd['pdf_size']);
        }
        style.add('body',
            'transform: rotate('+rotate+') scale('+scale+') skew(0deg) translate(0px);' +
            '-webkit-transform: rotate('+rotate+') scale('+scale+') skew(0deg) translate(0px);' +
            '-moz-transform: rotate('+rotate+') scale('+scale+') skew(0deg) translate(0px);' +
            '-o-transform: rotate('+rotate+') scale('+scale+') skew(0deg) translate(0px);' +
            '-ms-transform: rotate('+rotate+') scale('+scale+') skew(0deg) translate(0px);' +
            marginLeft
        );

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

        var config = {
            name:   app.data.baseProjectTask.text,
            header: styleLink + style.getString() + headerString,
            footer: footerString,
            locale: "en",
            //start:"01-04-2013",
            //end:"11-04-2013",
            //skin:'terrace',
            //data:{}
        };
        gantt.exportToPDF(config);

        gantt.config.autofit = tmpConfig.autofit;
        gantt.config.fit_tasks = tmpConfig.fit_tasks;
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
