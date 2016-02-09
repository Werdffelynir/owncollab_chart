<?php

namespace OCA\Owncollab_Chart\Controller;

use OCA\Owncollab_Chart\Helper;
use OCA\Owncollab_Chart\Db\Connect;
use OCP\IConfig;
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use OCP\Template;

class ApiController extends Controller {

	/** @var string $userId
	 * current auth user id */
	private $userId;

	/** @var string $userIdAPI
	 * user id which accesses by API */
	private $userIdAPI;

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
	 * ApiController constructor.
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
		$key = Helper::post('key');
		$data = Helper::post('data',false);
        $this->userIdAPI = Helper::post('uid');

        if(method_exists($this, $key))
            return $this->$key($data);
        else
            return new DataResponse([
                'access' => 'deny',
                'errorinfo' => 'API method not exists',
            ]);
	}


    /**
	 * This method is initialized only once for loading gantt chart
	 *
     * @NoAdminRequired
     * @NoCSRFRequired
     *
     * @return DataResponse
     */
	public function getproject() {

		//return new DataResponse($_POST);
		$uid = $this->userIdAPI;
        $params = [
            'access' 	    => 'deny',
            'errorinfo'     => '',
            'isadmin' 	    => $this->isAdmin,
            'uid' 		    => $uid,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
        ];

        if($this->isAdmin && $uid){
            $params['access'] 		= 'allow';
            $params['project'] 		= $this->connect->project()->get();
            $params['tasks'] 		= $this->connect->task()->get();
            $params['links'] 		= $this->connect->link()->get();
            $params['groupsusers'] 	= $this->connect->project()->getGroupsUsersList();
            $params['lasttaskid'] 	= $this->connect->task()->getLastId();
            $params['lastlinkid'] 	= $this->connect->link()->getLastId();
        }else
            $params['errorinfo'] 	= 'API method require - uid and request as admin';

        return new DataResponse($params);
	}

	/**
     * @NoAdminRequired
     * @NoCSRFRequired
     *
	 * @param $data
	 * @return DataResponse
	 */
	public function updatetask($data) {

        $params = [
            'errorinfo'     => null,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lasttaskid'    => null
        ];

		if($data['worker']&&is_array($data['task_data'])){
            if($data['worker'] == 'update'){
                $result = $this->connect->task()->update($data['task_data']);
                $params['errorinfo'] = $result ? null : 'server error update database';
            }
            else if($data['worker'] == 'insert'){
                $result = $this->connect->task()->insertWithId($data['task_data']);
                $params['errorinfo'] = $result ? null : 'server error insert database';
                $params['lasttaskid'] = $result;
            }
        }

		return new DataResponse($params);
	}


    public function deletetask($data) {

        $params = [
            'errorinfo'     => null,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister()
        ];

        if($data['task_id'] && is_array($data['task_data']) && $data['task_id'] === $data['task_data']['id']){
            $result = $this->connect->task()->deleteById($data['task_id']);
            if($result) $params['result'] = $result;
            else $params['errorinfo'] = 'Error operation delete';
        }

        return new DataResponse($params);
    }


    /**
     * @param $data
     * @return DataResponse
     */
    public function updateprojectsetting($data) {

        $params = [
            'errorinfo'     => null,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister()
        ];



        return new DataResponse($data);
    }




}