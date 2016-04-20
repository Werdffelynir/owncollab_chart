//# sourceMappingURL=http://example.com/path/to/your/sourcemap.map

window.App = new NamespaceApplication({
    debug: true,
    name: 'owncollab_chart',
    url: OC.generateUrl('/apps/owncollab_chart'),
    urlScript: '/apps/owncollab_chart/js/',
    urlGantt: '/apps/owncollab_chart/js/commercial/',
    host: OC.getHost(),
    locale: OC.getLocale(),
    protocol: OC.getProtocol(),
    isAdmin: null,
    corpotoken: null,
    requesttoken: oc_requesttoken ? encodeURIComponent(oc_requesttoken) : null,
    uid: oc_current_user ? encodeURIComponent(oc_current_user) : null,
    constructsType: false
});

App.require('libs',
    [
        App.urlScript + 'libs/util.js',
        App.urlScript + 'libs/timer.js',
        App.urlScript + 'libs/jquery-ui-timepicker.js',
        App.urlScript + 'libs/jquery.custom-scrollbar.js'
    ],
    initLibrary, initError);

App.require('dependence',
    [
        // App Extensions
        App.urlScript + 'application/extension/dom.js',
        App.urlScript + 'application/extension/linker.js',
        App.urlScript + 'application/extension/datetime.js',

        // Modules
        App.urlScript + 'application/module/datastore.js',

        // Config
        App.urlScript + 'application/config/ganttconfig.js',

        // Events
        App.urlScript + 'application/event/gantteve.js',

        // Actions
        App.urlScript + 'application/action/api.js',
        App.urlScript + 'application/action/sort.js',
        App.urlScript + 'application/action/buffer.js',
        App.urlScript + 'application/action/error.js',
        App.urlScript + 'application/action/ganttext.js',
        App.urlScript + 'application/action/sidebar.js',
        App.urlScript + 'application/action/lightbox.js',
        App.urlScript + 'application/action/project.js',
        App.urlScript + 'application/action/export.js',
        App.urlScript + 'application/action/chart.js',

        // Controllers
        App.urlScript + 'application/controller/page.js',
        App.urlScript + 'application/controller/public.js'

    ],
    initDependence, initError);

function initError(error){
    console.error('onRequireError' , error);
}

// start loading resources 'libs'
App.requireStart('libs');

function initLibrary(list){
    App.requireStart('dependence');
}

function initDependence(list){
    console.log('Gantt Application start!');

    /**
     * @namespace App.t
     */
    App.t = function(name, params) {
        params = typeof params === 'object' ? params : {};
        return t('owncollab_chart', name, params)
    };

    App.Controller.Page.construct();
}



