<?php
/**
 * ownCloud chart application
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Your Name <mail@example.com>
 * @copyright Your Name 2016
 */

namespace OCA\Owncollab_Chart\AppInfo;

use OCA\Owncollab_Chart\Helper;
use OCP\AppFramework\App;
use OCP\Util;

$appName = 'owncollab_chart';
$app = new App($appName);
$container = $app->getContainer();

/**
 * Navigation menu settings
 */
$container->query('OCP\INavigationManager')->add(function () use ($container, $appName) {
	$urlGenerator = $container->query('OCP\IURLGenerator');

	/**@type \OCP\IL10N $l10n	*/
	$l10n = \OC::$server->getL10NFactory()->get('owncollab_chart');
	//$l10n = $container->query('OCP\IL10N'); $l = \OC::$server->getL10N('owncollab_chart');

	return [
		'id' => $appName,
		'order' => 10,
		'href' => $urlGenerator->linkToRoute($appName.'.main.index'),
		'icon' => $urlGenerator->imagePath($appName, 'gantt.svg'),
		'name' => $l10n->t('Gantt')
	];
});

// Create public accept, only redirecting
$shred = new Sharedchart();
$shred->match();


/**
 * Loading translations
 * The string has to match the app's folder name
 */
Util::addTranslations($appName);


/**
 * Application styles and scripts
 */
if(Helper::isAppPage($appName)) {

	Util::addStyle($appName, 'jquery.custom-scrollbar');
	Util::addStyle($appName, 'jquery-ui-timepicker');
	Util::addStyle($appName, 'main');

    Util::addScript($appName, 'libs/jquery.custom-scrollbar');
    Util::addScript($appName, 'libs/ns.application');
    Util::addScript($appName, 'init');

	// dhtmlxGantt v.4.0.0 Standard
    Util::addStyle($appName, 'dhtmlxgantt');

	Helper::provider('config',[
		'domain' => ''
	]);
}

/**
 * Detect and appoints styles and scripts for particular app page
 */
$currentUri = Helper::getCurrentUri($appName);

if($currentUri == '/') {}