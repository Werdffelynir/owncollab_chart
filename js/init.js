//# sourceMappingURL=http://example.com/path/to/your/sourcemap.map

window.App = new NamespaceApplication({
    debug: true,
    name: 'ownCollab Chart',
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

// loadings styles
//App.style(App.url + 'css/desktop.css', null,initError);
//App.style(App.url + 'css/mobile.css',null,initError);
//App.script(App.url + 'js/test.js',null,initError);


App.require('libs',
    [
        App.urlScript + 'libs/util.js',
        App.urlScript + 'libs/timer.js'
    ],
    initLibrary, initError);

App.require('dependence',
    [
        // App Extensions
        App.urlScript + 'application/extension/dom.js',
        App.urlScript + 'application/extension/date.js',
        App.urlScript + 'application/extension/linker.js',

        // Modules
        App.urlScript + 'application/module/datastore.js',

        // Actions
        App.urlScript + 'application/action/api.js',
        App.urlScript + 'application/action/error.js',
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

    App.Controller.Page.construct();
}



