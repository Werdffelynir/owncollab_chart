<?php
/**
 * ownCloud - owncollab_chart
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author ownCollab Team <info@owncollab.com>
 * @copyright ownCollab Team 2015
 */

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\OwnCollab\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */

$application = new \OCA\Owncollab_Chart\AppInfo\Application();

$application->registerRoutes($this, ['routes' => [

    ['name' => 'main#index', 'url' => '/', 'verb' => 'GET'],
    ['name' => 'api#index', 'url' => '/api', 'verb' => 'POST'],
    ['name' => 'main#public_chart', 'url' => '/s/{share}', 'verb' => 'GET'],
    ['name' => 'main#export', 'url' => '/pdf', 'verb' => 'GET'],
    ['name' => 'main#test', 'url' => '/test', 'verb' => 'GET'],

]]);