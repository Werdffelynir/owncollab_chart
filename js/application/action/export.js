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

    function defaults(obj, std) {
        for (var key in std)
            if (!obj[key])
                obj[key] = std[key];

        return obj;
    }

    function mark_columns(base) {
        var columns = base.config.columns;
        if (columns) {
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].template)
                    columns[i].$template = true;
            }
        }
    }

    function fix_columns(gantt, columns) {
        for (var i = 0; i < columns.length; i++) {
            columns[i].label = columns[i].label || gantt.locale.labels["column_"+columns[i].name];
            if (typeof columns[i].width == "string") columns[i].width = columns[i].width*1;
        }
    }

    /**
     * Init event click on export buttons
     * @namespace App.Action.Export.init
     */
    exp.init = function (){

        DateTime = App.Extension.DateTime;
        exp.projectTask = gantt.getTask(1); //App.Module.DataStore.get('projectTask');

        exp.toPDF.config = {
            //start:  exp.projectTask.end_date,
            //end:    exp.projectTask.start_date
            start:  exp.projectTask.end_date,
            end:    undefined
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

    exp.onChangeExportToPDFInputDate = function(date) {

        if(this.name == "pdf_start_date")
            exp.toPDF.config['start'] = DateTime.strToDate(date);

        if(this.name == "pdf_end_date")
            exp.toPDF.config['end'] = DateTime.strToDate(date);
    };

    exp.onSubmitExportToPDF = function (event) {

        $('.export_loader').show();
        event.preventDefault();

        var pagenotes = {
            'head_left': $('input[name=pdf_head_left]').val(),
            'head_center': $('input[name=pdf_head_center]').val(),
            'head_right': $('input[name=pdf_head_right]').val(),
            'footer_left': $('input[name=pdf_footer_left]').val(),
            'footer_center': $('input[name=pdf_footer_center]').val(),
            'footer_right': $('input[name=pdf_footer_right]').val()
        };

        var printconf = {
            orientation: $('select[name=pdf_paper_orientation]').val(),
            paper_size: $('select[name=pdf_paper_size]').val(),
            scale: 1
        };

        var header = '<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">';
        // + App.urlBase +
        header += '<link rel="stylesheet" href="http://62.149.13.59/apps/owncollab_chart/css/dhtmlxgantt.css">';

        var config = defaults((config || {}), {
            name:"gantt.png",
            data:gantt._serialize_all(),
            config:gantt.config,
            version:gantt.version,
            header:header
        });

        if (exp.toPDF.config['start']) {
            gantt.config.start_date = config['start'] = exp.toPDF.config['start'];
            //
        }


        if (exp.toPDF.config['end']) {
            gantt.config.end_date = config['end'] = exp.toPDF.config['end'];
            //
        }


        fix_columns(gantt, config.config.columns);

        var _tmpConfig = {
            autofit: gantt.config.autofit,
            fit_tasks: gantt.config.fit_tasks,
            column6: Util.objClone(gantt.config.columns[6]),
            column7: Util.objClone(gantt.config.columns[7]),
            column8: Util.objClone(gantt.config.columns[8])
        };


        gantt.config.autofit = false;
        gantt.config.fit_tasks = false;
        gantt.config.columns.length = 6;

        // change visual for Dates
        gantt.config.date_grid = gantt.config.task_date = "%d.%m.%Y %H:%i";
        gantt.config.duration_unit = "day";
        gantt.config.duration_step = 1;

        config.data.data.map(function(item){

            // change visual for Resources
            var usersObj = {groups:[],users:[]};
            if(typeof item.users === 'string' && item.users.length > 5) {
                try {usersObj = JSON.parse(item.users);} catch (e) {} }
            var groupsString = Util.cleanArr(usersObj.groups).join(', ');
            var usersString = Util.cleanArr(usersObj.users).join(', ');
            item.users = (!Util.isEmpty(groupsString) ? '<strong>' + groupsString + '</strong>, ' : '') + usersString;

            // change visual for Duration
            var task = gantt.getTask(item.id);
            var days = (Math.abs((task.start_date.getTime() - task.end_date.getTime())/(86400000)) ).toFixed(1);
            item.duration = ((days%1==0) ? Math.round(days) : days) + ' d';
        });

        App.Action.Api.request('getsourcepdf', function(response) {
            console.log('getsourcepdf response >>>', response);
            $('.export_loader').hide();
            if(typeof  response === 'object' && response.download) {
                var file_uri = response.download.substr(response.download.indexOf('/apps/'));
                window.open(file_uri, '_blank');
            }
        }, {data:JSON.stringify(config), printconf:printconf, pagenotes:pagenotes});

        // Возврат изминений
        gantt.config.autofit = _tmpConfig.autofit;
        gantt.config.fit_tasks = _tmpConfig.fit_tasks;
        gantt.config.columns.push(_tmpConfig.column6);
        gantt.config.columns.push(_tmpConfig.column7);
        gantt.config.columns.push(_tmpConfig.column8);

        gantt.config.start_date = undefined;
        gantt.config.end_date = undefined;
    };


    exp.toPNG = function () {
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


    /**
     * @namespace App.Action.Export.print
     * @param source
     */
    exp.print = function (source){
        var pwa = window.open("about:blank", "_new");
        pwa.document.open();
        pwa.document.write(source);
        pwa.document.close();
    };



    return exp

})}