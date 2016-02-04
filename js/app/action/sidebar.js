/**
 * Action sidebar.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.sidebar !== 'object')
        app.action.sidebar = {};

    // alias of app.action.sidebar
    var o = app.action.sidebar;

    o.fieldElements = null;

    o.init = function(){

        // Open / Close of sidebar block
        o.toggle();

        // Switcher of tabs inside the sidebar
        o.tabsClick();

        // definition form elements fields
        o.fieldElements = o.definitionFields();

    };

    o.toggle = function(){
        $(app.dom.sidebar.toggle).click(function(e){

            if($(app.dom.sidebar).hasClass('disappear')){
                $(app.dom.content).css('overflowX','hidden');
                OC.Apps.showAppSidebar($(app.dom.sidebar));

            }else{
                $(app.dom.content).css('overflowX','auto');
                OC.Apps.hideAppSidebar($(app.dom.sidebar));
            }
        });
    };

    o.tabsClick = function(){
        $(app.dom.sidebar.tabs).click(function(event){
            if(event.target.nodeName == 'SPAN' && event.target.id){
                var tab = event.target;
                $('#sidebar-content>div').each(function(index,item){$(item).hide()});
                $('#sidebar-tab>span').each(function(index,item){$(item).removeClass('sidebar_tab_active')});
                $('#'+tab.id.replace(/tab/gi,'content')).show();
                $(tab).addClass('sidebar_tab_active');
            }
        });
    };


    /**
     * Put project data params into form fields.
     * all tabs Share Export Settings
     * @param project
     */
    o.putProjectSettings = function(project){

        //console.log(o.fieldElements);
        //console.log(project);

        /*if(typeof project !== 'object') {
         console.error('Project settings not an object:', project);
         return;
         }

         try{
         for(var settName in projStg){
         var tagName = projStg[settName].tagName,
         tagType = projStg[settName].type;

         switch(tagType){
         case 'checkbox':
         if(parseInt(project[settName])===1){
         projStg[settName].setAttribute('checked','checked');
         }else {
         projStg[settName].removeAttribute('checked');
         }
         projStg[settName].addEventListener('change', fn.changeEventSettingsField, false);
         break;
         case 'text':
         case 'textarea':
         if(settName === 'share_link'){
         project[settName] = fn.generateShareLink(project[settName]);
         projStg[settName].onclick =  function() {
         this.focus();
         this.select();
         }
         }
         else
         projStg[settName].addEventListener('change', fn.changeEventSettingsField, false);

         projStg[settName].value = project[settName];
         break;
         }
         if(settName === 'radio'){
         projStg['radio'][project['scale_type']].setAttribute('checked','checked');
         for(var radioInp in projStg['radio']){
         projStg['radio'][radioInp].addEventListener('change', fn.changeEventSettingsField, false);
         }
         }

         if(settName === 'is_share'){
         if(projStg[settName].checked === true) $('.chart_share_on').show();
         else $('.chart_share_on').hide();
         }
         else if(settName === 'share_is_protected'){
         if(projStg[settName].checked === true) $('.chart_share_password').show();
         else $('.chart_share_password').hide();
         }
         else if(settName === 'share_is_expire'){
         if(projStg[settName].checked === true) $('.chart_share_expiration').show();
         else $('.chart_share_expiration').hide();
         }
         }
         }catch(error){
         console.error('Error in setDataProjectSettings: ' + error.message);
         }*/
    };


    o.definitionFields = function (){
        var inpStg = $('#chart_settings input'),
            inpShare = $('#chart_share input'),
            data = {};

        for(var i = 0; i < inpStg.length; i++){
            if(inpStg[i].type === 'radio'){
                if(!data['radio'])
                    data['radio'] = {};
                data['radio'][inpStg[i]['value']] = inpStg[i];
            }else
                data[inpStg[i]['name']] = inpStg[i];
        }

        for(var j = 0; j < inpShare.length; j ++){
            data[inpShare[j]['name']] = inpShare[j];
        }

        return data;
    };

    /*Settings*/



    /*Share*/

    o.share = function(){}

    /*Export*/

    o.export = function(){}






})(jQuery, OC, app);