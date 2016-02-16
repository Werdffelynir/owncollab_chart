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

        if($uid){
            $params['access'] 		= 'allow';
            $params['project'] 		= $this->connect->project()->get();
            $params['tasks'] 		= $this->connect->task()->get();
            $params['links'] 		= $this->connect->link()->get();
            $params['groupsusers'] 	= $this->connect->project()->getGroupsUsersList();
            $params['lasttaskid'] 	= $this->connect->task()->getLastId();
            $params['lastlinkid'] 	= $this->connect->link()->getLastId();
        }else
            $params['errorinfo'] 	= 'API method require uid';

        return new DataResponse($params);
	}


    public function updatetask($data) {

        $params = [
            'error'     => null,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lasttaskid'    => null
        ];

        $params['data'] = $data;
        if($this->isAdmin && isset($data['worker']) && isset($data['task'])){

            $worker = trim(strip_tags($data['worker']));
            $id = trim(strip_tags($data['id']));
            $task = $data['task'];

            if($worker == 'insert'){

                $result = $this->connect->task()->insertWithId($task);
                $params['error'] = $result ? null : 'Server insert error, on task';
                $params['lasttaskid'] = $result;

            }else if($worker == 'update'){

                $result = $this->connect->task()->update($task);
                $params['error'] = $result ? null : 'Server update error, on task';

            }else if($worker == 'delete'){

                $result = $this->connect->task()->deleteById($id);
                $params['error'] = $result ? null : 'Server delete error, on task';

            }
        }

        return new DataResponse($params);
    }


    /**
     * @param $data
     * @return DataResponse
     */
    public function updateprojectsetting($data) {

        $params = [
            'error'     => null,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister()
        ];

        if($this->isAdmin && isset($data['field']) && isset($data['value'])){

            $field = trim(strip_tags($data['field']));
            $value = trim(strip_tags($data['value']));

            // value for bool param

            if($field == 'is_share'){

                if($value == 'true')
                    $value = 1;
                else if($value == 'false')
                    $value = 0;

                $share_link = $value ? Helper::randomString(16) : '';
                $result = $this->connect->project()->updateShared($field, $value, $share_link);

                if(!$result)
                    $params['error'] = 'Error operation update project';
                else{
                    $params['share_link'] = $share_link;
                }
            }
/*

            if($field == 'is_share'){
                $share_link = $value ? Helper::randomString(16) : '';
                $result = $this->connect->project()->updateShared($field, $value, $share_link);

                if(!$result)
                    $params['error'] = 'Error operation update project';
                else{
                    $params['result'] = $result;
                    $params['share_link'] = $share_link;
                }
            }else{

                $result = $this->connect->project()->updateField($field, $value);
                if(!$result)
                    $params['error'] = 'Error operation update project';
                else
                    $params['result'] = $result;
            }
*/
        }else
            $params['error'] = 'API method require - uid and request as admin';

        return new DataResponse($params);
    }




}