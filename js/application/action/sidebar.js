if(App.namespace) { App.namespace('Action.Sidebar', function(App) {

    /**
     * @namespace App.Action.Sidebar
     * @type {*}
     */
    var sidebar = {
        active: false,
        elemLocker: null,
        elemFields: null
    };

    /** @type {App.Extension.DateTime} */
    var DateTime = null;

    /** @type {App.Action.Error} */
    var Error = null;

    /** @type {App.Action.Chart} */
    var Chart = null;

    /** @type {App.Action.Project} */
    var Project = null;

    /** @type {App.Module.DataStore} */
    var DataStore = null;

    /** @type {*} */
    var dataStoreProject = null;

    /** @type {*} */
    var dataStoreGroupsusers = null;

    /**
     * @namespace App.Action.Sidebar.init
     */
    sidebar.init = function(){

        DateTime = App.Extension.DateTime;
        Error = App.Action.Error;
        Chart = App.Action.Chart;
        Project = App.Action.Project;
        DataStore = App.Module.DataStore;
        dataStoreProject = DataStore.get('project');
        dataStoreGroupsusers = DataStore.get('groupsusers');

        // Open/Close of sidebar block
        sidebar.toggle();

        // Switcher of tabs inside the sidebar
        sidebar.tabsClick();

        // definition form elements fields
        sidebar.elemFields = sidebar.definitionFields();

        // Element for locking the side panel
        sidebar.elemLocker = sidebar.createLocker();


        // put project settings to sidebar fields
        sidebar.putProjectSettings();

    };

    /**
     *
     * @namespace App.Action.Sidebar.emailsList
     * @param item
     */
    sidebar.emailsList = function(item){
        var wrap = document.createElement('div');
        var icon = document.createElement('div');
        var text = document.createElement('div');
        var butn = document.createElement('div');

        wrap.className = 'tbl share_email';
        wrap.setAttribute('data-id', item.value );
        wrap.setAttribute('data-type', item.type);
        wrap.setAttribute('data-email', item.email);

        icon.className = 'tbl_cell share_email_icon';
        text.className = 'tbl_cell share_email_text';
        butn.className = 'tbl_cell share_email_butn';

        butn.onclick = function(event){$(wrap).remove()};

        icon.innerHTML = '<strong> &#149; </strong>';
        text.innerHTML = item.email;

        wrap.appendChild(icon);
        wrap.appendChild(text);
        wrap.appendChild(butn);
        $('#share_emails_list').append(wrap);
    };


    /**
     * Toggle sidebar
     * @namespace App.Action.Sidebar.toggle
     */
    sidebar.toggle = function(){
        var sidebar = App.node('sidebar');
        var sidebarToggle = App.node('sidebarToggle');
        var appContent = App.node('appContent');

        $(sidebarToggle).click(function(e){
            if($(sidebar).hasClass('disappear')){
                sidebar.active = true;
                $(appContent).css('overflowX','hidden');
                OC.Apps.showAppSidebar($(sidebar));

                // todo kostil
                if(!sidebar.exportInit){
                    sidebar.exportInit = true;
                    // Run Export settings
                    App.Action.Export.init();
                }

            }else{
                sidebar.active = false;
                $(appContent).css('overflowX','auto');
                OC.Apps.hideAppSidebar($(sidebar));

                App.Action.Chart.readySave = false;
                gantt.render();
            }
        });
    };

    /**
     * Switch tabs on sidebar
     * @namespace App.Action.Sidebar.tabsClick
     */
    sidebar.tabsClick = function(){
        var sidebarTabs = App.node('sidebarTabs');

        $(sidebarTabs).click(function(event){
            if(event.target.nodeName == 'SPAN' && event.target.id){
                var tab = event.target;
                $('#sidebar-content>div').each(function(index,item){
                    $(item).hide()
                });
                $('#sidebar-tab>span').each(function(index,item){
                    $(item).removeClass('sidebar_tab_active')
                });
                $('#'+tab.id.replace(/tab/gi,'content')).show();
                $(tab).addClass('sidebar_tab_active');
            }
        });
    };


    /**
     * Get number index active tab, starts with 1. If sidebar or tab not active return 0
     * app.action.sidebar.getActiveTabIndex()
     *
     * @namespace App.Action.Sidebar.getActiveTabIndex
     * @returns {number}
     */
    sidebar.getActiveTabIndex = function(){
        var tabElem = 0;
        var sidebarTabs = App.node('sidebarTabs');
        $('#sidebar_tabs>span').each(function(index,item) {
            if(item.classList.contains('sidebar_tab_active'))
                tabElem = item;
        });
        return (tabElem && sidebar.active) ? parseInt(tabElem.id.substr(-1)) : 0;
    };


    /**
     * Blocked current active tab
     * @namespace App.Action.Sidebar.lock
     */
    sidebar.lock = function() {
        if(sidebar.getActiveTabIndex() !== 0){
            $(App.node('sidebar')).prepend(sidebar.elemLocker);
            sidebar.elemLocker.style.height = $(App.node('sidebar')).outerHeight() + 'px';
        }
    };


    /**
     * Unlock current active tab
     * @namespace App.Action.Sidebar.unlock
     */
    sidebar.unlock= function(){
        $(sidebar.elemLocker).remove();
    };


    /**
     * Return HTMLElement for sidebar-locker
     * @namespace App.Action.Sidebar.createLocker
     * @returns {Element}
     */
    sidebar.createLocker = function(){
        var div = document.createElement('div'),
            img = document.createElement('img');
        div.id = 'sidebar_locker';
        div.className = 'tbl';
        img.src = OC.linkTo(App.name, 'img/loading.gif');
        img.className = 'tbl_cell';
        div.appendChild(img);
        div.addEventListener('click', sidebar.unlock, false);
        return div;
    };


    /**
     * Put project data params into form fields.
     * into all tabs: Share, Export, Settings
     * @namespace App.Action.Sidebar.putProjectSettings
     */
    sidebar.putProjectSettings = function(){

        var project = Project.dataProject,

            // all field of sidebar
            fields = sidebar.elemFields,

            // field names
            param;

        try{

            for(param in fields){
                var tagName = fields[param].tagName,
                    tagType = fields[param].type;

                switch(String(tagType).toLowerCase()){

                    case 'checkbox':
                        if(parseInt(project[param]) === 1)
                            fields[param].setAttribute('checked','checked');
                        else
                            fields[param].removeAttribute('checked');

                        fields[param].addEventListener('change', sidebar.onChangeValueProject, false);

                        break;

                    case 'text':
                    case 'date':
                    case 'password':
                    case 'textarea':

                        if(param == 'share_expire_time' && project[param] != null && project[param].length > 8) {
                            //var dateTime = app.timeDateToStr(app.timeStrToDate(project[param]));
                            var _date = DateTime.dateToStr(DateTime.strToDate(project[param]));
                            fields[param].value = _date;
                        }
                        else if(param == 'share_link') {
                            fields[param].value = App.Action.GanttExt.generateShareLink(project[param]);
                            fields[param].onclick =  function() {
                                this.focus();
                                this.select();
                            }
                        }
                        else {
                            if(project[param] !== undefined){
                                fields[param].addEventListener('change', sidebar.onChangeValueProject, false);
                                fields[param].value = project[param];
                            }
                        }

                        break;
                }

                if(param === 'radio'){
                    fields['radio'][project['scale_type']].setAttribute('checked','checked');
                    for(var radioInp in fields['radio']){
                        fields['radio'][radioInp].addEventListener('change', sidebar.onChangeValueProject, false);
                    }
                }

                // First show sets share settings
                if(param == 'is_share'){
                    if(fields[param].checked === true) $('.chart_share_on').show();
                    else $('.chart_share_on').hide();
                }
                else if(param === 'share_is_protected'){
                    if(fields[param].checked === true) $('.chart_share_password').show();
                    else $('.chart_share_password').hide();
                }
                else if(param === 'share_is_expire'){
                    if(fields[param].checked === true) $('.chart_share_expiration').show();
                    else $('.chart_share_expiration').hide();
                }

            }


        }
        catch(error){
            console.log(error);
            Error.inline(App.t("Error assignment value fields, the project parameters. Error message: ") + error.message);

        }

    };

    /**
     * Event on execute when change setting param
     * @namespace App.Action.Sidebar.onChangeValueProject
     * @param event
     * @returns {boolean}
     */
    sidebar.onChangeValueProject = function (event){

        var target  = event.target,
            name    = target.name,
            type    = target.type,
            value   = target.value;


        // Project.dataProject
        //console.log(Project);
        //console.log(target, name, type, value);



        // Dynamic show today line in gantt chart
        if(name === 'show_today_line'){

            App.Action.GanttExt.showMarkers(target.checked);

            if(target.checked)
                App.Action.GanttExt.showTodayLine();

            Util.Storage('show_today_line', target.checked);
            gantt.refreshData();

        }else

        // Dynamic show user color in gantt chart tasks an resources
        if(name === 'show_user_color'){

            App.Action.GanttExt.showUserColor(target.checked);
            Util.Storage('show_user_color', target.checked);
            gantt.refreshData();

        }else

        // Dynamic show task name in gantt chart
        if(name === 'show_task_name'){

            App.Action.GanttExt.showTaskNames(target.checked);
            Util.Storage('show_task_name', target.checked);
            gantt.refreshData();

        }else

        // Dynamic scale type gantt chart
        if(name === 'scale_type'){

            App.Config.GanttConfig.scale(value);
            Util.Storage('scale_type', value);
            gantt.render();

        }else

        // Dynamic resize scale fit gantt chart
        if(name === 'scale_fit'){

            //app.action.chart.showTaskNames(target.checked);
            App.Action.Fitmode.toggle(target.checked);
            gantt.render();
            Util.Storage('scale_fit', target.checked);

        }else

        // Dynamic resize scale fit gantt chart
        if(name === 'critical_path'){

            App.Action.GanttExt.showCriticalPath(target.checked);
            Util.Storage('critical_path', target.checked);
            gantt.render();

        }

        // Show sharing settings
        App.Action.Share.changeValue(target, name, target.checked);

    };



    /**
     *
     * @namespace App.Action.Sidebar.definitionFields
     * @returns {{}}
     */
    sidebar.definitionFields = function () {
        var fieldsSettings = $('#chart_settings input'),
            fieldsShare = $('#chart_share input'),
            data = {};

        for(var i = 0; i < fieldsSettings.length; i++) {
            if(fieldsSettings[i].type === 'radio') {
                if(!data['radio'])
                    data['radio'] = {};
                data['radio'][fieldsSettings[i]['value']] = fieldsSettings[i];
            }else
                data[fieldsSettings[i]['name']] = fieldsSettings[i];
        }

        for(var j = 0; j < fieldsShare.length; j ++) {
            data[fieldsShare[j]['name']] = fieldsShare[j];
        }

        return data;
    };

    return sidebar

})}