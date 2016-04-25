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

        // enabled jquery plugin datetimepicker for all elements with class name 'datetimepic'
/*        $('.datetimepic').datetimepicker({
            //minDate: new Date((new Date()).getFullYear() - 1, 1, 1),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect:function(val,eve){
                if(this.name == "share_expire_time"){
                    var elemTime = $('input[name=share_expire_time]')[0];
                    elemTime.value = val;

                    app.action.event.changeValueProject({target:elemTime});
                }
            }
        });*/

        // autocomplete for email sends
        var usersEmails = function(){
            var resources = Project.resources(true),
                group,
                userIter = 0,
                project = Project.urlName(),
                domain = OC.getHost(),
                list = [],
                all = dataStoreGroupsusers;

            for(group in all){
                var inGroup = false;
                for(userIter = 0; userIter < all[group].length; userIter ++) {
                    if(resources.indexOf(all[group][userIter]['uid']) !== -1) {
                        inGroup = true;
                        list.push({
                            value: all[group][userIter]['uid'],
                            type: 'user',
                            email: all[group][userIter]['uid'] + '@' + domain
                            //email: all[group][userIter]['uid'] + '@' + project + '.' + domain
                        });
                    }
                }

                if(inGroup){
                    list.push({
                        value: group,
                        type: 'group',
                        email: group + '@' + domain
                        //email: group + '@' + project + '.' + domain
                    });
                }
            }
            // static emails
            list.push({
                value: 'team',
                type: 'static',
                email: 'team@' + domain
                //email: 'team@' + project + '.' + domain
            });
            list.push({
                value: 'support',
                type: 'static',
                email: 'support@' + domain
                //email: 'support@' + project + '.' + domain
            });
            return list;
        };

        $(document).on('focus', "#owc_email_autocomplete", function (event) {
            $( this ).autocomplete({
                    minLength: 0,
                    source: usersEmails(),
                    select: function( event, ui ) {
                        this.value = "";
                        sidebar.emailsList(ui.item);
                        return false;
                    }
            }).data("ui-autocomplete")._renderItem = function( ul, item ) {
                var emailLabel = (item.type == 'user') ? item.email : "<strong>"  +item.email+ "</strong>";
                return $('<li>')
                    .append('<a>' +  emailLabel + '</a>' )
                    .appendTo( ul );
            };
        });

        // send email list to server
        $('input[name=share_email_submit]').click(function(event){
            event.preventDefault();
            var emailsList = [];
            $('.share_email', App.node('sidebar')).each(function(index, item){
                var id = item.getAttribute('data-id');
                var type = item.getAttribute('data-type');
                var email = item.getAttribute('data-email');
                emailsList.push(type+ ':' +id);
            });
            App.Action.Api.sendEmails(
                Util.uniqueArr(emailsList),
                Project.resources(true)
            );
        });

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
        $('#sidebar_tabs>span').each(function(index,item){
            if(item.classList.contains('sidebar_tab_active'))
                tabElem = item;
        });
        return (tabElem && sidebar.active) ? parseInt(tabElem.id.substr(-1)) : 0;
    };


    /**
     * Blocked current active tab
     * @namespace App.Action.Sidebar.lock
     */
    sidebar.lock = function(){
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

                if(param == 'is_share'){
                    if(fields[param].checked === true) {
                        $('.chart_share_on').show();
                    }
                    else {
                        $('.chart_share_on').hide();
                    }
                }
                else
                if(param === 'share_is_protected'){
                    if(fields[param].checked === true) $('.chart_share_password').show();
                    else $('.chart_share_password').hide();
                }
                else
                if(param === 'share_is_expire'){
                    if(fields[param].checked === true) $('.chart_share_expiration').show();
                    else $('.chart_share_expiration').hide();
                }
            }


        }
        catch(error){
            console.log(error);
            Error.inline("Error assignment value fields, the project parameters. Error message: " + error.message);

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
        console.log(Project);
        console.log(target, name, type, value);

        // Dynamic show today line in gantt chart
        if(name === 'show_today_line'){

            App.Action.GanttExt.showMarkers(target.checked);
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



        // local saved some params
        //    localParams = ['show_today_line','show_task_name','show_user_color','scale_type','scale_fit','critical_path'];
        //
        //if(localParams.indexOf(name) !== -1){
        //
        //    // Dynamic show today line in gantt chart
        //    if(name === 'show_today_line'){
        //
        //        app.action.chart.showMarkers(target.checked);
        //        app.storageSetItem('show_today_line', target.checked);
        //        gantt.refreshData();
        //
        //    }else
        //
        //    // Dynamic show user color in gantt chart tasks an resources
        //    if(name === 'show_user_color'){
        //
        //        app.action.chart.showUserColor(target.checked);
        //        app.storageSetItem('show_user_color', target.checked);
        //        gantt.refreshData();
        //
        //    }else
        //
        //    // Dynamic show task name in gantt chart
        //    if(name === 'show_task_name'){
        //
        //        app.action.chart.showTaskNames(target.checked);
        //        app.storageSetItem('show_task_name', target.checked);
        //        gantt.refreshData();
        //
        //    }else
        //
        //    // Dynamic scale type gantt chart
        //    if(name === 'scale_type'){
        //
        //        app.action.chart.scale(value);
        //        //if(value == 'week') app.action.chart.enableZoomSlider(1);
        //        //if(value == 'day') app.action.chart.enableZoomSlider(2);
        //        //if(value == 'hour') app.action.chart.enableZoomSlider(3);
        //        app.storageSetItem('scale_type', value);
        //        gantt.render();
        //
        //    }else
        //
        //    // Dynamic resize scale fit gantt chart
        //    if(name === 'scale_fit'){
        //
        //        //app.action.chart.showTaskNames(target.checked);
        //        app.action.fitmode.toggle(target.checked);
        //        gantt.render();
        //        app.storageSetItem('scale_fit', target.checked);
        //
        //    }else
        //
        //    // Dynamic resize scale fit gantt chart
        //    if(name === 'critical_path'){
        //
        //        app.action.chart.showCriticalPath(target.checked);
        //        app.storageSetItem('critical_path', target.checked);
        //        gantt.render();
        //
        //    }
        //
        //    return false;
        //}

    };



    /**
     *
     * @namespace App.Action.Sidebar.definitionFields
     * @returns {{}}
     */
    sidebar.definitionFields = function (){
        var fieldsSettings = $('#chart_settings input'),
            fieldsShare = $('#chart_share input'),
            data = {};

        for(var i = 0; i < fieldsSettings.length; i++){
            if(fieldsSettings[i].type === 'radio'){
                if(!data['radio'])
                    data['radio'] = {};
                data['radio'][fieldsSettings[i]['value']] = fieldsSettings[i];
            }else
                data[fieldsSettings[i]['name']] = fieldsSettings[i];
        }

        for(var j = 0; j < fieldsShare.length; j ++){
            data[fieldsShare[j]['name']] = fieldsShare[j];
        }

        return data;
    };

    return sidebar

})}