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


namespace OCA\Owncollab_Chart\Controller;

use OCA\Owncollab_Chart\Helper;
use OCA\Owncollab_Chart\Db\Connect;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use OCP\IRequest;


\OCP\App::checkAppEnabled('owncollab_chart');

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
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$params = [
			'current_user' => $this->userId,
		];
		return new TemplateResponse($this->appName, 'main', $params);
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
            'template' => 'guest',
            'protected' => false,
            'wrongpw' => false,
            'requesttoken' => false,
        ];

        if( $project['open'] == 1  && $project['is_share'] == 1){

            // static requesttoken
            $params['requesttoken'] = md5($project['share_password'].md5($project['share_link']));

            // share time is over
            if($project['share_is_expire'] == 1 && strtotime($project['share_expire_time']) < time()) {
                //
            }
            else{
                //
                $session_publickey = Helper::session('publickey');
                if(!empty($session_publickey) && $session_publickey == $params['requesttoken']){

                    $params['template'] = 'project';

                }
                else if($project['share_is_protected'] == 1){

                    $post_requesttoken = Helper::post('requesttoken');
                    $post_password = Helper::post('password');

                    $params['protected'] = true;
                    $params['template'] = 'authenticate';

                    if($post_requesttoken == $params['requesttoken'] && md5($post_password) == $project['share_password']){
                        Helper::session('publickey', $params['requesttoken']);
                        $params['template'] = 'project';
                    }else{
                        if(!empty($post_password))
                            $params['wrongpw'] = true;
                    }

                }
                else {
                    $params['template'] = 'project';
                }
            }
        }

        if($params['template'] == 'guest'){
            $template = new \OCP\Template('', '404', 'guest');
            $template->printPage();
            exit;
        }

        if($params['template'] == 'authenticate'){
            return new TemplateResponse($this->appName, 'authenticate', [
                'wrongpw' => $params['wrongpw'],
                'requesttoken' => $params['requesttoken']
            ], 'guest');
        }

        if($params['template'] == 'project'){
            unset($project['is_share']);
            unset($project['share_link']);
            unset($project['share_is_protected']);
            unset($project['share_password']);
            unset($project['share_is_expire']);
            unset($project['share_expire_time']);
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