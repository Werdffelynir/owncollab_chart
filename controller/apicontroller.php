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

        $tasks = $this->connect->task()->get();
        $taskCount = count($tasks);

        // reset autoincrement
        if($taskCount === 1 && $tasks[0]['id'] == 1)
            $this->connect->task()->resetAutoIncrement(2);

        // filtering tasks
        if($tasks){
            $taskProject = null;
            for($i=0; $i < $taskCount; $i++){
                if($tasks[$i]['is_project'] == 1 && $tasks[$i]['type'] == 'project')
                    $taskProject = $tasks[$i];
                continue;
            }
            if($taskProject){
                for($j=0; $j < $taskCount; $j++){
                    if(strtotime($tasks[$j]['start_date']) < strtotime($taskProject['start_date']))
                        $tasks[$j]['start_date'] = $taskProject['start_date'];
                    if(strtotime($tasks[$j]['end_date']) < strtotime($taskProject['start_date']))
                        $tasks[$j]['end_date'] = $taskProject['end_date'];
                }
            }
        }

        $links = $this->connect->link()->get();
        $linkCount = count($links);
        $linksTrash = [];

        for($li = 0; $li < $linkCount; $li ++ ){
            if( !$this->findTask($tasks, $links[$li]['target']) ||
                !$this->findTask($tasks, $links[$li]['source']) ){
                array_push($linksTrash, $links[$li]['id']);
                unset($links[$li]);
            }
        }
        if(!empty($linksTrash)) {
            $this->connect->link()->deleteAllById($linksTrash);
        }

        if($uid){
            $params['isadmin'] 		= $this->isAdmin;
            $params['access'] 		= 'allow';
            $params['project'] 		= $this->connect->project()->get();
            $params['tasks'] 		= $tasks;
            $params['links'] 		= array_values($links);
            $params['groupsusers'] 	= $this->connect->project()->getGroupsUsersList();
            $params['lasttaskid'] 	= $this->connect->task()->getLastId();
            $params['lastlinkid'] 	= $this->connect->link()->getLastId();
        }else
            $params['errorinfo'] 	= 'API method require uid';

        return new DataResponse($params);
	}


    public function findTask($tasks, $id) {
        $c = count($tasks);
        $r = false;
        for($i = 0; $i < $c; $i ++ )
        {
            if($tasks[$i]['id'] == $id){
                $r = true;
                break;
            }
        }
        return $r;
    }


    public function updatetask($data) {

        $params = [
            'data'     => $data,
            'error'     => null,
            'worker'     => $data['worker'],
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lasttaskid'    => null
        ];

        if($this->isAdmin && isset($data['worker']) && isset($data['task'])){

            $worker = trim(strip_tags($data['worker']));
            $id = trim(strip_tags($data['id']));
            $task = $data['task'];

            if($worker == 'insert'){

                $result = $this->connect->task()->insertTask($task);

                if(is_numeric($result))
                    $params['lasttaskid'] = $result;
                else{
                    $params['error'] = $result ? null : 'Server insert error, on task ';
                    $params['errorMessage'] = $result;
                }

            }else if($worker == 'update'){

                $result = $this->connect->task()->update($task);
                $params['error'] = $result ? null : 'Server update error, on task';

            }else if($worker == 'delete'){
                if( (int) $id !== 1){
                    $result = $this->connect->task()->deleteById($id);
                    $params['error'] = $result ? null : 'Server delete error, on task';
                }else{
                    $params['error'] = 'The main project can not be deleted';
                }

            }
        }

        return new DataResponse($params);
    }

    public function updatelink($data) {

        $params = [
            'data'     => $data,
            'error'     => null,
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lastlinkid'    => null
        ];

        $params['data'] = $data;
        if($this->isAdmin && isset($data['worker']) && isset($data['link'])){

            $worker = trim(strip_tags($data['worker']));
            $id = trim(strip_tags($data['id']));
            $link = $data['link'];

            if($worker == 'insert'){

                $result = $this->connect->link()->insertWithId($link);
                $params['error'] = $result ? null : 'Server insert error, on link';
                $params['lastlinkid'] = $result;

            }else if($worker == 'update'){

                //$result = $this->connect->task()->update($task);
                //$params['error'] = $result ? null : 'Server update error, on task';

            }else if($worker == 'delete'){

                $result = $this->connect->link()->deleteById($id);
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
            if($value == 'true') $value = 1;
            else if($value == 'false') $value = 0;

            if($field == 'is_share'){

                $share_link = $value ? Helper::randomString(16) : '';
                $result = $this->connect->project()->updateShared($field, $value, $share_link);

                if(!$result)
                    $params['error'] = 'Error operation update project';
                else{
                    $params['share_link'] = $share_link;
                }
            }
            else{
                if($field == 'share_password') $value = md5(trim($value));

                $result = $this->connect->project()->updateField($field, $value);
                if(!$result)
                    $params['error'] = 'Error operation update project';
                else
                    $params['result'] = $result;
            }

        }else
            $params['error'] = 'API method require - uid and request as admin';

        return new DataResponse($params);
    }


    /**
     * mail templates:
     * support@project1.domain.com      - to one owncloud admin
     * team@project1.domain.com         - to all project users
     * group_name@project1.domain.com   - to all project group users
     * user_id@project1.domain.com      - to one project users
     *
     * @param $data
     * @return DataResponse
     */
    public function sendshareemails($data)
    {
        $params = [
            'data'     => $data,
            'error'     => null,
            'errorInfo'     => '',
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ?: \OC_Util::callRegister()
        ];

        if(!$this->isAdmin && empty($data['emails'])){
            $params['errorInfo'] = 'Request not auth or emails data is empty';
            return new DataResponse($params);
        }

        //$projectSubDomain = $data['projemail'];$projectSubDomain . '.' .

        $groupsusers = $this->connect->project()->getGroupsUsersList();
        $resources = is_array($data['resources']) ? $data['resources'] : [];
        $emails = $data['emails'];
        $serverHost = \OC::$server->getRequest()->getServerHost();
        $serverProtocol = \OC::$server->getRequest()->getServerProtocol();
        $sharedLink = $this->connect->project()->getShare();
        $sharedALink = ' <a href="'.$serverProtocol.'://'.$serverHost.'/index.php/s/'.$sharedLink.'">'.$serverProtocol.'//'.$serverHost.'/index.php/s/'.$sharedLink.'</a> ';
        $mailSendResult = false;

        $params['TEST'] = [];
        //sleep(1); http://owncloud.loc/index.php/s/zAOe9xvgFplhwaBS

        foreach ($emails as $email) {
            $_emArr = explode(':',$email);
            $_type = $_emArr[0];
            $_id = $_emArr[1];

            if($_type == 'static') {
                if($_id == 'support'){
                    $_mail_from_address = \OC::$server->getConfig()->getSystemValue('mail_from_address');
                    $_mail_domain = \OC::$server->getConfig()->getSystemValue('mail_domain');
                    $_mail_data = [
                        'to'        => $_mail_from_address .'@'. $_mail_domain,
                        'name_to'   => 'Support '.$_mail_domain,
                        'from'      => 'no-reply@' . $serverHost,
                        'name_from' => 'ownCollab chart',
                        'subject'   => $_id,
                        'body'      => 'Access to the project ownCollab chart - '.$sharedALink
                    ];
                    //$params['TEST'][] = $_mail_data;
                    $mailSendResult = Helper::mailSend($_mail_data);

                }
                else if($_id == 'team') {
                    foreach ($resources as $_res_uid) {
                        $_user_email = $this->connect->project()->getUserEmail($_res_uid);
                        if(!empty($_user_email['configvalue'])){
                            $_mail_data = [
                                'to'        => $_user_email['configvalue'],
                                'name_to'   => $_user_email['userid'],
                                'from'      => 'no-reply@' . $serverHost,
                                'name_from' => 'ownCollab chart',
                                'subject'   => 'Access to the project ownCollab chart',
                                'body'      => 'Access to the project ownCollab chart '.$sharedALink
                            ];
                            //$params['TEST'][] = $_mail_data;
                            $mailSendResult = Helper::mailSend($_mail_data);
                        }
                    }
                }
            }
            else if($_type == 'group') {
                $_group = !empty($groupsusers[$_type]) ? $groupsusers[$_id] : [];
                foreach ($_group as $_uid) {
                    $_user_email = $this->connect->project()->getUserEmail($_uid);
                    if(!empty($_user_email['configvalue'])) {
                        $_mail_data = [
                            'to' => $_user_email['configvalue'],
                            'name_to' => $_user_email['userid'],
                            'from' => 'no-reply@' . $serverHost,
                            'name_from' => 'ownCollab chart',
                            'subject' => 'Access to the project ownCollab chart',
                            'body' => 'Access to the project ownCollab chart' . $sharedALink
                        ];
                        //$params['TEST'][] = $_mail_data;
                        $mailSendResult = Helper::mailSend($_mail_data);
                    }
                }
            }
            else if($_type == 'user') {
                $_user_email = $this->connect->project()->getUserEmail($_id);
                if(!empty($_user_email['configvalue'])) {
                    $_mail_data = [
                        'to' => $_user_email['configvalue'],
                        'name_to' => $_user_email['userid'],
                        'from' => 'no-reply@' . $serverHost,
                        'name_from' => 'ownCollab chart',
                        'subject' => 'Access to the project ownCollab chart',
                        'body' => 'Access to the project ownCollab chart' . $sharedALink
                    ];
                    //$params['TEST'][] = $_mail_data;
                    $mailSendResult = Helper::mailSend($_mail_data);
                }
            }
        }

        $params['result'] = $mailSendResult;

        return new DataResponse($params);
    }




}