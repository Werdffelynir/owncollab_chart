<?php

namespace OCA\Owncollab_Chart\Controller;

use OC\OCS\Exception;
use OCA\Owncollab_Chart\Helper;
use OCA\Owncollab_Chart\Db\Connect;
use OCA\Owncollab_Chart\PHPMailer\PHPMailer;
use OCP\IConfig;
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use OCP\Template;

class ApiController extends Controller
{

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
    )
    {
        parent::__construct($appName, $request);

        $this->userId = $userId;
        $this->isAdmin = $isAdmin;
        $this->l10n = $l10n;
        $this->connect = $connect;
    }

    /**
     * @PublicPage
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index()
    {
        $key = Helper::post('key');
        $data = Helper::post('data', false);
        $this->userIdAPI = Helper::post('uid');

        if (method_exists($this, $key))
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
    public function getproject()
    {

        $uid = $this->userIdAPI;
        $lang = $this->connect->project()->getCurrentLang($uid);

        $params = [
            'access' => 'deny',
            'errorinfo' => '',
            'isadmin' => $this->isAdmin,
            'uid' => $uid,
            'lang' => is_array($lang) ? $lang['configvalue'] : 'en',
            'requesttoken' => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
        ];

        $tasks = $this->connect->task()->get();
        $taskCount = count($tasks);

        // reset autoincrement
        if ($taskCount === 1 && $tasks[0]['id'] == 1)
            $this->connect->task()->resetAutoIncrement(2);

        // filtering tasks
        if ($tasks) {
            $taskProject = null;
            for ($i = 0; $i < $taskCount; $i++) {
                if ($tasks[$i]['is_project'] == 1 && $tasks[$i]['type'] == 'project')
                    $taskProject = $tasks[$i];
                continue;
            }
            if ($taskProject) {
                for ($j = 0; $j < $taskCount; $j++) {
                    if (strtotime($tasks[$j]['start_date']) < strtotime($taskProject['start_date']))
                        $tasks[$j]['start_date'] = $taskProject['start_date'];
                    if (strtotime($tasks[$j]['end_date']) < strtotime($taskProject['start_date']))
                        $tasks[$j]['end_date'] = $taskProject['end_date'];
                }
            }
        }

        $links = $this->connect->link()->get();

        $params['origin_links'] = $links;
        $linkCount = count($links);
        $linksTrash = [];

        for ($li = 0; $li < $linkCount; $li++) {
            if (!$this->findTask($tasks, $links[$li]['target']) ||
                !$this->findTask($tasks, $links[$li]['source'])
            ) {
                array_push($linksTrash, $links[$li]['id']);
                unset($links[$li]);
            }
        }
        if (!empty($linksTrash)) {
            $this->connect->link()->deleteAllById($linksTrash);
        }


//        if($uid){    }else
//            $params['errorinfo'] 	= 'API method require uid';
        $params['isadmin'] = $this->isAdmin;
        $params['access'] = 'allow';
        $params['project'] = $this->connect->project()->get();
        $params['tasks'] = $tasks;
        $params['links'] = array_values($links);
        $params['groupsusers'] = $this->connect->project()->getGroupsUsersList();
        $params['lasttaskid'] = $this->connect->task()->getLastId();
        $params['lastlinkid'] = $this->connect->link()->getLastId();


        return new DataResponse($params);
    }


    public function findTask($tasks, $id)
    {
        $c = count($tasks);
        $r = false;
        for ($i = 0; $i < $c; $i++) {
            if ($tasks[$i]['id'] == $id) {
                $r = true;
                break;
            }
        }
        return $r;
    }


    /**
     * Common updater, save all task and links
     * @param $data
     * @return DataResponse
     */
    public function useshare($data)
    {

        $params = [
            'error' => null,
            'requesttoken' => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister()
        ];

        if ($this->isAdmin && isset($data['field']) && isset($data['value'])) {

            $field = trim(strip_tags($data['field']));
            $value = trim(strip_tags($data['value']));

            // value for bool param
            if ($value == 'true') $value = 1;
            else if ($value == 'false') $value = 0;

            if ($field == 'is_share') {

                $share_link = $value ? Helper::randomString(16) : null;
                $result = $this->connect->project()->updateShared($field, $value, $share_link);

                if (!$result)
                    $params['error'] = 'Error operation update project';
                else
                    $params['share_link'] = $share_link;

            } else if ($field == 'share_is_protected' || $field == 'share_password') {

                if ($field == 'share_password') $value = md5(trim($value));

                $params[$field] = $value;

                $result = $this->connect->project()->updateField($field, $value);
                if (!$result)
                    $params['error'] = 'Error operation share protected password an update project table';
                else
                    $params['result'] = $result;

            } else if ($field == 'share_is_expire' || $field == 'share_expire_time') {

                $params[$field] = $value;

                if ($field == 'share_expire_time')
                    $value = Helper::toTimeFormat($value);

                $result = $this->connect->project()->updateField($field, $value);

                if (!$result)
                    $params['error'] = 'Error operation share protected password an update project table';
                else
                    $params['result'] = $result;

            }

        } else
            $params['error'] = 'API method require - uid and request as admin';

        return new DataResponse($params);

    }

    /**
     * Common updater, save all task and links
     * @param $data
     * @return DataResponse
     */
    public function saveall($data)
    {

        $params = [
            //'data'     => $data,
            'error' => null,
            'errorinfo' => '',
            'requesttoken' => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lastlinkid' => null
        ];

        $project = false;
        $tasks = false;
        $links = false;

        $params['tasksdecode'] = json_decode($data['tasks']);

        try {
            $tasks = isset($data['tasks']) ? json_decode($data['tasks'], true) : false;
        } catch (\Exception $error) {
            $params['errorinfo'] .= "tasks json_decode error";
        }

        try {
            $links = isset($data['links']) ? json_decode($data['links'], true) : false;
        } catch (\Exception $error) {
            $params['errorinfo'] .= "links json_decode error";
        }

        try {
            $project = isset($data['project']) ? json_decode($data['project'], true) : false;
        } catch (\Exception $error) {
            $params['errorinfo'] .= "project json_decode error";
        }

        if ($this->isAdmin && ($tasks || $links)) {

            $params['isadmin'] = true;

            $this->connect->db->beginTransaction();

            if (is_array($tasks) and count($tasks) > 0) {

                $this->connect->task()->clear();
                $params['SQL_tasks'] = $this->connect->task()->add($tasks);
                $params['SQL_tasks_Error'] = $this->connect->db->errorInfo();
            }

            if (is_array($links) and count($links) > 0) {

                $this->connect->link()->clear();
                $params['SQL_links'] = $this->connect->link()->add($links);
                $params['SQL_links_Error'] = $this->connect->db->errorInfo();
            }

            $this->connect->db->commit();
        }

        return new DataResponse($params);
    }

/*
    public function mailer($data) {

        $params = [
            'data'     => $data,
            'error'     => null,
            'errorinfo'     => '',
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lastlinkid'    => null
        ];

        if ($this->isAdmin && isset($data['list']) && isset($data['resources'])) {
            $list = is_array($data['list']) && count($data['list']) > 0 ? $data['list'] : [];

            // подготовка данных к запросу
            $sqlIn = "";
            foreach($list as $item){
                $sqlIn .= strlen($sqlIn) && isset($item['id']) > 0
                    ? ",'" . $item['id'] . "'"
                    : "'" . $item['id'] . "'";
            }
            $list = $this->connect->project()->getUsersEmails($sqlIn);
            $sendResult = $this->sendInviteMail($list);
            $params['send_result'] = $sendResult;
        }

        return new DataResponse($params);
    }


    private function sendInviteMail(array $list){

        $project = $this->connect->project()->get();

        if($project['is_share'] != 1 || empty($project['share_link'])) {
            return false;
        }

        $from = 'no-replay@' . Helper::getHost();
        $nameFrom = 'OwnCollab Chart';
        $subject = 'OwnCollab Chart Invite';
        $link = Helper::getProtocol() .'://'. Helper::getHost() .'/index.php/s/'. $project['share_link'];
        $sendResult = [];

        foreach($list as $item) {
            $to = trim($item['email']);
            $nameTo = !empty($item['name']) ? $item['name'] : $item['uid'];

            if(Helper::validEmailAddress($to)) {

                $mail = new PHPMailer();
                $mail->setFrom($from, $nameFrom);
                $mail->addAddress($to, $nameTo);

                $mail->Subject = $subject;
                $mail->Body    = Helper::renderPartial($this->appName, 'mailinvite', [
                    'p_name' => $project['name'],
                    'u_name' => $nameTo,
                    's_link' => $link,
                    'protocol' => Helper::getProtocol(),
                    'domain' => Helper::getHost()
                ]);
                $mail->isHTML();

                if (!$mail->send())
                    $sendResult[$item['uid']] = $mail->ErrorInfo;
                else
                    $sendResult[$item['uid']] = true;
            }
        }

        return $sendResult;
    }
*/


    public function invite($data) {

        $params = [
            'data'     => $data,
            'error'     => null,
            'errorinfo'     => '',
            'requesttoken'  => (!\OC_Util::isCallRegistered()) ? '' : \OC_Util::callRegister(),
            'lastlinkid'    => null
        ];

        if ($this->isAdmin && isset($data['email_to'])) {

            $email_to = trim($data['email_to']);
            $email_from = 'no-replay@' . Helper::getHost();

            if(Helper::validEmailAddress($email_to)) {

                $result = $this->sendMail($email_to, $email_from);

                if($result !== true){
                    $params['error'] = true;
                    $params['errorinfo'] = $result;
                }
                return new DataResponse($params);

            }
        }

        return new DataResponse($params);
    }


    /**
     * @param $mail_to
     * @param null $mail_from
     * @return bool|string
     * @throws \OCA\Owncollab_Chart\PHPMailer\phpmailerException
     */
    private function sendMail( $mail_to, $mail_from = null) {

        $project = $this->connect->project()->get();

        if($project['is_share'] != 1 || empty($project['share_link'])) {
            return false;
        }

        $mail_from = ($mail_from === null) ? 'no-replay@' . Helper::getHost() : $mail_from;
        $nameFrom = 'OwnCollab Project';
        $subject = 'OwnCollab Project Invite';
        $link = Helper::getProtocol() .'://'. Helper::getHost() .'/index.php/s/'. $project['share_link'];
        $nameTo = 'User';


        if(Helper::validEmailAddress($mail_to) && Helper::validEmailAddress($mail_from)) {

            $mail = new PHPMailer();
            $mail->setFrom($mail_from, $nameFrom);
            $mail->addAddress($mail_to, $nameTo);

            $mail->Subject = $subject;
            $mail->Body    = Helper::renderPartial($this->appName, 'mailinvite', [
                'p_name' => $project['name'],
                'u_name' => $nameTo,
                's_link' => $link,
                'protocol' => Helper::getProtocol(),
                'domain' => Helper::getHost()
            ]);

            $mail->isHTML();

            if ($mail->send())
                return true;
            else
                return $mail->ErrorInfo;

        }

        return 'no-valid';
    }

}
