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
            //start:  exp.projectTask.start_date,
            //end:    exp.projectTask.end_date
            start:  exp.projectTask.start_date,
            end:    exp.projectTask.end_date
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
            currentText: App.t('Now'),
            closeText: App.t('Done'),
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
            else if(elem.name == 'pdf_end_date')
                elem.value = DateTime.dateToStr(exp.projectTask.end_date);
            else
                elem.value = '';
        });
    };

    exp.toPDF.config = {};

    exp.onChangeExportToPDFInputDate = function(date) {

        if(this.name == "pdf_start_date") {
            exp.toPDF.config['start'] = DateTime.strToDate(date);
        }
        if(this.name == "pdf_end_date") {
            exp.toPDF.config['end'] = DateTime.strToDate(date);
        }
    };

    exp.onSubmitExportToPDF = function (event) {

        jQuery('.export_loader').show();
        event.preventDefault();

        var utcNumber = parseInt(App.utc.slice(0, -2));

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

        // todo: for proda\re
        if (App.debug)
            header += '<link rel="stylesheet" href="http://62.149.13.59/apps/owncollab_chart/css/dhtmlxgantt.css">';
        else
            header += '<link rel="stylesheet" href="' + App.urlBase +'/apps/owncollab_chart/css/dhtmlxgantt.css">';

        // style for hide gantt.templates.task_text
        // and stylize gantt.templates.rightside_text

        header += '<style>' +
            '.gantt_task_content{color: rgba(0,0,0,0) !important;} ' +
            '.gantt_side_content.gantt_right {bottom: 0 !important; color: #1c2c42; background-color: rgba(255,255,255,0.5) !important;}' +
            '</style>';

        var config = defaults((config || {}), {
            name: "gantt.png",
            locale: App.locale,
            data: gantt._serialize_all(),
            config: gantt.config,
            version: gantt.version,
            header: header
        });

        config['start'] = gantt.config.start_date   = exp.toPDF.config['start'];
        config['end']   = gantt.config.end_date     = exp.toPDF.config['end'];

        fix_columns(gantt, config.config.columns);

        var _tmpConfig = {
            server_utc: gantt.config.server_utc,
            scaleLastChangeType: App.Config.GanttConfig.scaleLastChangeType,
            autofit: gantt.config.autofit,
            fit_tasks: gantt.config.fit_tasks,
            duration_unit: gantt.config.duration_unit,
            duration_step: gantt.config.duration_step,
            column2width: gantt.config.columns[2].width,
            column3width: gantt.config.columns[3].width,
            column6: Util.objClone(gantt.config.columns[6]),
            column7: Util.objClone(gantt.config.columns[7]),
            column8: Util.objClone(gantt.config.columns[8])
        };

        // todo: экспортировать только в одном состоянии
        //App.Config.GanttConfig.scaleLastChangeType
        App.Config.GanttConfig.scale('day');

        config.config.server_utc = false;
        config.config.autofit = false;
        config.config.fit_tasks = false;
        config.config.columns.length = 6;
        config.config.columns[2].width = 120;
        config.config.columns[3].width = 120;

        // change visual for Dates
        config.config.date_grid = gantt.config.task_date = "%d.%m.%Y %H:%i";
        config.config.duration_unit = "day";
        config.config.duration_step = 1;

        config.data.data.map(function (item) {
            // change visual for Resources
            var usersObj = {groups:[],users:[]};

            item = exp.changTaskUTC(item, utcNumber);

            if(typeof item.users === 'string' && item.users.length > 5) {
                try {usersObj = JSON.parse(item.users);} catch (e) {}
            }

            var groupsString = Util.cleanArr(usersObj.groups).join(', ');
            var usersString = Util.cleanArr(usersObj.users).join(', ');
            item.users = (!Util.isEmpty(groupsString) ? '<strong>' + groupsString + '</strong>, ' : '') + usersString;

            // change visual for Duration
            var task = gantt.getTask(item.id);
            var days = (Math.abs((task.start_date.getTime() - task.end_date.getTime())/(86400000)) ).toFixed(1);
            item.duration = ((days%1==0) ? Math.round(days) : days) + ' d';
        });

        //return ;

        App.Action.Api.request('getsourcepdf', function(response) {
            //console.log('getsourcepdf response >>>', response);
            $('.export_loader').hide();
            if(typeof  response === 'object' && response.download) {
                var file_uri = response.download.substr(response.download.indexOf('/apps/'));
                window.open(file_uri, '_blank');
            }
        }, {data:JSON.stringify(config), printconf:printconf, pagenotes:pagenotes});

        //console.log(gantt.config.start_date);
        //console.log(gantt.config.end_date);
        //gantt.exportToPDF();

        // Возврат изминений
        gantt.config.server_utc         = _tmpConfig.server_utc;
        gantt.config.autofit            = _tmpConfig.autofit;
        gantt.config.fit_tasks          = _tmpConfig.fit_tasks;
        gantt.config.duration_unit      = _tmpConfig.duration_unit;
        gantt.config.duration_step      = _tmpConfig.duration_step;
        gantt.config.columns[2].width   = _tmpConfig.column2width;
        gantt.config.columns[3].width   = _tmpConfig.column3width;
        gantt.config.columns.push(_tmpConfig.column6);
        gantt.config.columns.push(_tmpConfig.column7);
        gantt.config.columns.push(_tmpConfig.column8);
        gantt.config.start_date         = undefined;
        gantt.config.end_date           = undefined;

        App.Config.GanttConfig.scale(_tmpConfig.scaleLastChangeType);
    };

    exp.changTaskUTC = function (task, utcInt) {
        var sd = App.Extension.DateTime.strToDate(task.start_date, "%d-%m-%Y %H:%i"),
            ed = App.Extension.DateTime.strToDate(task.end_date, "%d-%m-%Y %H:%i");
        sd.setTime(sd.getTime() + (utcInt*60*60*1000));
        ed.setTime(ed.getTime() + (utcInt*60*60*1000));
        task.start_date = App.Extension.DateTime.dateToStr(sd, "%d-%m-%Y %H:%i");
        task.end_date = App.Extension.DateTime.dateToStr(ed, "%d-%m-%Y %H:%i");
        return task;
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