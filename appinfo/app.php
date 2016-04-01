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

//$l = \OC::$server->getL10N('owncollab_chart', 'de_DE');

/**
 * Navigation menu settings
 */
$container->query('OCP\INavigationManager')->add(function () use ($container, $appName) {
	$urlGenerator = $container->query('OCP\IURLGenerator');
	//$l10n = $container->query('OCP\IL10N');
	$l = \OC::$server->getL10N('owncollab_chart');
	return [
		'id' => $appName,
		'order' => 10,
		'href' => $urlGenerator->linkToRoute($appName.'.main.index'),
		'icon' => $urlGenerator->imagePath($appName, 'gantt.svg'),
		'name' => $l->t('Gantt')
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
if(Helper::isAppPage($appName)){
	Util::addStyle($appName, 'main');
	Util::addStyle($appName, 'jquery-ui-timepicker');
	Util::addStyle($appName, 'jquery.custom-scrollbar');
	Util::addScript($appName,'jquery-ui-timepicker');
	Util::addScript($appName, 'jquery.custom-scrollbar');
	Util::addScript($appName, 'inc');
	Util::addScript($appName, 'application');

	// dhtmlxGantt v.4.0.0 Standard
    Util::addStyle($appName, 'dhtmlxgantt');
	//Util::addScript($appName,'dhtmlxgantt/dhtmlxgantt');
	//Util::addScript($appName,'dhtmlxgantt/ext/dhtmlxgantt_marker');

	// dhtmlxGantt v.4.0.0 Professional
	Util::addScript($appName,'dhtmlxganttpro/dhtmlxgantt');
	Util::addScript($appName,'dhtmlxganttpro/ext/dhtmlxgantt_undo');
	Util::addScript($appName,'dhtmlxganttpro/ext/dhtmlxgantt_marker');
	Util::addScript($appName,'dhtmlxganttpro/ext/dhtmlxgantt_critical_path');
	Util::addScript($appName,'dhtmlxganttpro/ext/dhtmlxgantt_grouping');
	Util::addScript($appName,'dhtmlxganttpro/ext/dhtmlxgantt_auto_scheduling');

    // dhtmlxGantt v.4.0.0 Common
	Util::addScript($appName,'dhtmlxgantt/api');
}

/**
 * Detect and appoints styles and scripts for particular app page
 */
$currentUri = Helper::getCurrentUri($appName);

if($currentUri == '/') {}