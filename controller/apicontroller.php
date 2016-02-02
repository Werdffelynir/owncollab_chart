<?php

namespace OCA\Owncollab_Chart\Controller;

use OCA\Owncollab\Helper;
use OCA\Owncollab_Chart\Db\Connect;
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use OCP\Template;

class ApiController extends Controller {


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
		$pid = Helper::post('pid');
		$uid = Helper::post('uid');

        if(method_exists($this, $key))
            return $this->$key($data);
        else return new DataResponse();
	}


    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     *
     * @param $data
     * @return DataResponse
     */
	public function getproject($data) {

		$uid = Helper::post('uid');
		$hash = Helper::post('data')['hash'];
        $params = [];

        if($this->isAdmin && $uid && $hash){

            $params['project'] = $this->connect->project()->findByNameWithSettings($hash);

        }

		/*$hash = urldecode($this->apiArgsData['hash']);
		if(!empty($hash)){
			$project = $this->projectMapper->findByName($hash);
			$tasks = $this->ganttTasksMapper->findAllByProjectId($project['id']);
			$groupsUsers = $this->getGroupsUsersList();
			$resources = $this->taskResourcesMapper->findResourcesByProject($project['id']);
			$tasksWithResources = $this->addResourcesIntoTasks($tasks, $resources, $groupsUsers);
			$settings = $this->projectSettingsMapper->findById($project['id']);

			//if($settings['is_share']===1){ }
			//var_dump($settings);
			//die;

			if($project){
				$data = [
					'project' => $project,
					'groups_users' => $groupsUsers,
					'resources' => $resources,
					'settings' => $settings,
					'gantt_tasks' => $tasksWithResources,
					'gantt_links' => $this->ganttLinksMapper->findAllByProjectId($project['id'])
				];
				$this->apiResultData = ['result'=>$data];
			}
		}*/

        return new DataResponse([
			'uid' => $uid,
			'hash' => $hash
		]);
	}

}