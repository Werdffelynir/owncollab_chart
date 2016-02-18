/**
 * Action sidebar.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.sidebar !== 'object')
        app.action.sidebar = {};

    // alias of app.action.sidebar
    var o = app.action.sidebar;

    o.active = false;

    o.elemLocker = null;

    o.elemFields = null;

    o.init = function(){

        // Open / Close of sidebar block
        o.toggle();

        // Switcher of tabs inside the sidebar
        o.tabsClick();

        // definition form elements fields
        o.elemFields = o.definitionFields();

        // Element for locking the side panel
        o.elemLocker = o.createLocker();

        // put project settings to sidebar fields
        //o.putProjectSettings();

        // enabled jquery plugin datetimepicker for all elements with class name 'datetimepic'
        $('.datetimepic').datetimepicker({
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
        });

        // autocomplete for email sends
        var usersEmails = (function(){
            var group, userIter = 0, user, list = [], all = app.data.groupsusers;
            for(group in all){
                list.push({
                    value: group,
                    label: 'group:' + group
                });
                for(userIter = 0; userIter < all[group].length; userIter ++){
                    list.push({
                        value: all[group][userIter]['uid'],
                        label: all[group][userIter]['uid']
                    });
                }
            }
            return list;
        })();
        $(document).on('focus', "#owc_email_autocomplete", function (event) {
            $( this ).autocomplete({
                    minLength: 0,
                    source: usersEmails,
                    select: function( event, ui ) {
                        this.value = "";
                        o.addEmailToList(ui.item.value, ui.item.value, (ui.item.label.indexOf('group:')===0));
                        //$( this ).val( ui.item.value );
                        //$( "#owc_email" ).val( ui.item.value );
                        return false;
                    }

            }).data("ui-autocomplete")._renderItem = function( ul, item ) {
                return $('<li>')
                    .append('<a>' + (item.label.indexOf('group:')===0 ? "<strong>" + (item.label.split(':')[1]) + " (group)</strong>"  : item.label ) + '</a>' )
                    .appendTo( ul );
            };
        });

        // send email list to server
        $('input[name=share_email_submit]').click(function(event){

            var emailsList = [];

            $('.share_email', app.dom.sidebar).each(function(index,item){
                var type = item.getAttribute('data-type');
                var id = item.getAttribute('data-id');
                if(type == 'user') emailsList.push(id);
                else if(type == 'group' && app.data.groupsusers[id]){
                    app.data.groupsusers[id].map(function(item){emailsList.push(item.uid)});
                }
            });

            app.action.event.sendShareEmails(app.u.uniqueArr(emailsList));
            //console.log(app.u.uniqueArr(emailsList));

        });

    };


    o.addEmailToList = function(id, name, isGroup){
        var wrap = document.createElement('div');
        var icon = document.createElement('div');
        var text = document.createElement('div');
        var butn = document.createElement('div');

        wrap.className = 'tbl share_email';
        wrap.setAttribute('data-type', (isGroup?'group':'user'));
        wrap.setAttribute('data-id', id);

        icon.className = 'tbl_cell share_email_icon';
        text.className = 'tbl_cell share_email_text';
        butn.className = 'tbl_cell share_email_butn';

        butn.onclick = function(event){$(wrap).remove()};

        icon.innerHTML = '<strong> &#149; </strong>';
        text.innerHTML = isGroup? '<strong>' + name + ' (group) </strong>' : name;

        wrap.appendChild(icon);
        wrap.appendChild(text);
        wrap.appendChild(butn);
        $('#share_emails_list').append(wrap);
    };


    /**
     * Toggle sidebar
     */
    o.toggle = function(){
        $(app.dom.sidebarToggle).click(function(e){
            if($(app.dom.sidebar).hasClass('disappear')){
                o.active = true;
                $(app.dom.appContent).css('overflowX','hidden');
                OC.Apps.showAppSidebar($(app.dom.sidebar));
            }else{
                o.active = false;
                $(app.dom.appContent).css('overflowX','auto');
                OC.Apps.hideAppSidebar($(app.dom.sidebar));

            }
        });
    };

    /**
     * Switch tabs on sidebar
     */
    o.tabsClick = function(){
        $(app.dom.sidebarTabs).click(function(event){
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
     * @returns {number}
     */
    o.getActiveTabIndex = function(){
        var tabElem = 0;
        $('#' + app.dom.sidebarTabs.id + '>span').each(function(index,item){
            if(item.classList.contains('sidebar_tab_active'))
                tabElem = item;
        });
        return (tabElem && o.active) ? parseInt(tabElem.id.substr(-1)) : 0;
    };


    /**
     * Blocked current active tab
     * app.action.sidebar.lock()
     */
    o.lock = function(){
        if(o.getActiveTabIndex() !== 0){
            $(app.dom.sidebar).prepend(o.elemLocker);
            o.elemLocker.style.height = $(app.dom.sidebar).outerHeight() + 'px';
        }
    };


    /**
     * Unlock current active tab
     * app.action.sidebar.unlock()
     */
    o.unlock= function(){
        $(o.elemLocker).remove();
    };


    /**
     * Return HTMLElement for sidebar-locker
     * @returns {Element}
     */
    o.createLocker = function(){
        var div = document.createElement('div'),
            img = document.createElement('img');
        div.id = 'sidebar_locker';
        div.className = 'tbl';
        img.src = OC.linkTo(app.name, 'img/loading.gif');
        img.className = 'tbl_cell';
        div.appendChild(img);
        div.addEventListener('click', o.unlock, false);
        return div;
    };


    /**
     * Put project data params into form fields.
     * into all tabs: Share, Export, Settings
     */
    o.putProjectSettings = function(){

        var project = app.data.project,

            // all field of sidebar
            fields = o.elemFields,

            // field names
            param;

        try{

            for(param in fields){
                var tagName = fields[param].tagName,
                    tagType = fields[param].type;

                switch(String(tagType).toLowerCase()){

                    case 'checkbox':

                        if(parseInt(project[param])===1) {
                            fields[param].setAttribute('checked','checked');
                        } else {
                            fields[param].removeAttribute('checked');
                        }

                        fields[param].addEventListener('change', app.action.event.changeValueProject, false);

                        break;

                    case 'text':
                    case 'date':
                    case 'password':
                    case 'textarea':

                        if(param == 'share_expire_time' && project[param] != null && project[param].length > 8) {
                            var dateTime = app.timeDateToStr(app.timeStrToDate(project[param]));
                            fields[param].value = dateTime;
                        }
                        else if(param == 'share_link') {
                            fields[param].value = app.action.chart.generateShareLink(project[param]);
                            fields[param].onclick =  function() {
                                this.focus();
                                this.select();
                            }
                        }
                        else {
                            if(project[param] !== undefined){
                                fields[param].addEventListener('change', app.action.event.changeValueProject, false);
                                fields[param].value = project[param];
                            }
                        }

                        break;
                }

                if(param === 'radio'){
                    fields['radio'][project['scale_type']].setAttribute('checked','checked');
                    for(var radioInp in fields['radio']){
                        fields['radio'][radioInp].addEventListener('change', app.action.event.changeValueProject, false);
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

            app.action.error.inline("Error assignment value fields, the project parameters. Error message: " + error.message);

        }

    };


    o.definitionFields = function (){
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

    //o.changeSetting = function(){};



    /*Settings*/



    /*Share*/

    o.share = function(){};

    /*Export*/

    o.export = function(){};






})(jQuery, OC, app);