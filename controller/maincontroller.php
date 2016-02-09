<?php
/**
 * ownCloud
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Your Name <mail@example.com>
 * @copyright Your Name 2016
 */

namespace OCA\Owncollab_Chart\Controller;

use OCA\Owncollab_Chart\Helper;
use OCA\Owncollab_Chart\Db\Connect;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;

class MainController extends Controller {

	/** @var string $userId
     * current auth user id  */
	private $userId;
	/** @var bool $isAdmin
     * true if current auth user consists into admin group */
	private $isAdmin;
	/** @var \OC_L10N $l10n
     * languages translations */
	private $l10n;
    /** @var Connect $connect
     * instance working with database */
    private $connect;

    /**
     * MainController constructor.
     * @param string $appName
     * @param IRequest $request
     * @param $userId
     * @param $isAdmin
     * @param \OC_L10N $l10n
     * @param Connect $connect
     */
	public function __construct(
		$appName,
		IRequest $request,
		$userId,
		$isAdmin,
		\OC_L10N $l10n,
		Connect $connect

    ){
		parent::__construct($appName, $request);
		$this->userId = $userId;
		$this->isAdmin = $isAdmin;
		$this->l10n = $l10n;
		$this->connect = $connect;
	}

	/**
	 * CAUTION: the @Stuff turns off security checks; for this page no admin is
	 *          required and no CSRF check. If you don't know what CSRF is, read
	 *          it up in the docs or you might create a security hole. This is
	 *          basically the only required method to add this exemption, don't
	 *          add it to any other method if you don't exactly know what it does
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {

        if( $this->isAdmin ){
            $params = [
                'current_user' => $this->userId,
            ];
            return new TemplateResponse($this->appName, 'main', $params);
        }
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return DataResponse
	 */
	public function page() {
        //$project = $this->connect->project()->getById(2);
		//return new DataResponse(['echo' => $project]);
	}

	/**
	 * Simply method that posts back the payload of the request
	 * @NoAdminRequired
	 */
	public function doEcho($echo) {
		return new DataResponse(['echo' => $echo]);
	}


	/**
	 *
	 * @PublicPage
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @param $share
	 * @return TemplateResponse
	 */
	public function publicChart($share){

		$project = $this->connect->project()->getShare($share);
        $params = [
            'access' => 'deny'
        ];

		if($project){

			if($project['share_is_protected'] == 1){

				$link = $project['share_link'];
				$password = $project['share_password'];
				$publickey = (isset($_SESSION['publickey'])) ? trim($_SESSION['publickey']) : false;

				if($publickey === md5($password.$link)){

					$params['project'] 		= $project;
					$params['tasks'] 		= $this->connect->task()->get();
					$params['links'] 		= $this->connect->link()->get();

					$response = new TemplateResponse($this->appName, 'public', $params);
				}
				else if( isset($_POST['requesttoken']) && isset($_POST['password']) ){

					if(trim($_POST['requesttoken']) === md5(trim($_POST['password']).$link)){
						Helper::session('publickey', $_POST['requesttoken']);
						return new RedirectResponse($link);
					}else{
						$response =  new TemplateResponse($this->appName, 'authenticate', [
							'wrongpw' => true,
							'requesttoken' => md5($password.$link)
						], 'guest');
					}

				} else{

					$response =  new TemplateResponse($this->appName, 'authenticate', ['requesttoken' => md5($password.$link)], 'guest');
				}

				if($project['share_is_expire'] == 1 && time() > strtotime($project['share_expire_time'])){
					$template = new \OCP\Template('', '404', 'guest');
                    $template->printPage();
				}else
					return $response;
			}

            $params['access'] = 'allow';

            if($params['access'] == 'allow'){

                if($project['share_is_expire'] == 1 && time() > strtotime($project['share_expire_time'])){
                    $template = new \OCP\Template('', '404', 'guest');
                    $template->printPage();
                }else {
                    unset($project['is_share']);
                    unset($project['share_password']);
                    return new TemplateResponse($this->appName, 'public', [
                        'json' => [
                            'project' => $project,
                            'tasks' => $this->connect->task()->get(),
                            'links' => $this->connect->link()->get()
                        ]
                    ]);
                }
            }
		}
		else {
            $template = new \OCP\Template('', '404', 'guest');
            $template->printPage();
		}
	}


}