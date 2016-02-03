/**
 * Action sidebar.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.sidebar !== 'object')
        app.action.sidebar = {};

    var o = app.action.sidebar;

    o.init = function(){

        /*
         * Handlers of the sidebar buttons
         */
        o.toggle();
        o.tabsClick();
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

})(jQuery, OC, app);