if(App.namespace){App.namespace('Controller.Public', function(App){

    /**
     * @namespace App.Controller.Public
     */
    var ctrl = {};

    /**
     * @namespace App.Controller.Public.construct
     */
    ctrl.construct = function(){

        // Language
        var languagePathScript = null;
        if(App.locale.toLowerCase().indexOf('de') !== -1)
            languagePathScript = App.urlGantt + 'locale/locale_de.js';
        else if(App.locale=='ru')
            languagePathScript = App.urlGantt + 'locale/locale_ru.js';

        App.require('gantt',
            [
                App.urlGantt + 'dhtmlxgantt.js',
                languagePathScript,
                App.urlGantt + 'ext/dhtmlxgantt_undo.js',
                App.urlGantt + 'ext/dhtmlxgantt_marker.js',
                App.urlGantt + 'ext/dhtmlxgantt_critical_path.js',
                App.urlGantt + 'ext/dhtmlxgantt_grouping.js',
                App.urlGantt + 'ext/dhtmlxgantt_auto_scheduling.js',
                App.urlGantt + 'api.js'
            ],
            ctrl.initPublicGantt , ctrl.initPublicGanttError ).requireStart();

    };

    ctrl.initPublicGantt = function(){
        var jData = false;

        App.node.gantt           = $('#gantt-chartpublic')[0];
        App.node.ganttdatajson   = $('#ganttdatajson')[0];

        //jData = JSON.parse($(App.node.ganttdatajson).text());

        try{
            jData = JSON.parse($(App.node.ganttdatajson).text());

            //console.log(jData);
            if(typeof jData === 'object' && jData['tasks'] && jData['links'] && jData['project']){

                //console.log('jData ++ ');
                // project default information
                //app.data.project = jData.project;
                //app.data.tasks = jData.tasks;
                //app.data.links = jData.links;

                App.Module.DataStore.put('groupsusers', {});
                App.Module.DataStore.put('project', jData.project);
                App.Module.DataStore.put('tasks', jData.tasks);
                App.Module.DataStore.put('links', jData.links);

                App.Action.Chart.groupsusers = jData.groupsusers;
                App.Action.Chart.project = jData.project;
                App.Action.Chart.tasks = jData.tasks;
                App.Action.Chart.links = jData.links;

                //console.log('jData all   ', App.Module.DataStore.getAll());
                //console.log('jData tasks ', App.Action.Chart.filteringTasks());

                // clear ganttdatajson
                App.node.ganttdatajson.textContent = '';
                gantt.config.readonly = true;

                gantt.init(App.node.gantt);

                //console.log(App.Action.Chart.filteringTasks(jData.tasks));
                //gantt.attachEvent("onParse", function(){
                //    app.action.chart.ganttFullSize();
                //});
                //app.action.config.init();
                //app.action.config.external();



                // parse data
                gantt.parse({
                    data: App.Action.Chart.filteringTasks(),
                    links: App.Action.Chart.links
                });
                //Chart.init(App.node.gantt, function(){}, function(){});
            }

        }catch(error){
            //window.location = '/';
        }
    };

    ctrl.initPublicGanttError = function(){

    };

    return ctrl;

})}
