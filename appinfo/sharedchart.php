<?php
namespace OCA\Owncollab_Chart\AppInfo;

use OCA\Owncollab_Chart\Db\Connect;

class Sharedchart {

    static private $close = false;
    private $appName = 'owncollab_chart';
    private $uri;
    private $connect;
    private $urlGenerator;

	public function __construct() {
        if(!self::$close) {
            $this->uri = \OC::$server->getRequest()->getRequestUri();
            $this->connect = new Connect(\OC::$server->getDatabaseConnection());
            $this->urlGenerator = \OC::$server->getURLGenerator();
        }
    }

	public function match() {
        if(!self::$close) {
            $uriArr = explode('/', $this->uri);
            if (is_array($uriArr) && count($uriArr) > 2) {
                $link = $uriArr[count($uriArr)-1];
                $s = $uriArr[count($uriArr)-2];
                $appName = $uriArr[count($uriArr)-3];
                $project = $this->connect->project()->get();

                if($s == 's' && $appName != $this->appName) {
                    self::$close = true;
                    if($project['is_share'] == '1' && $link == $project['share_link']){
                        $uriReal = '/index.php/apps/owncollab_chart/s/'.$project['share_link'];
                        header('Location: '.$uriReal);
                        exit;
                    }
                }
            }
        }
    }
}