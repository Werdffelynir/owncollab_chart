<?php
namespace OCA\Owncollab_Chart\Controller;

use \OCP\AppFramework\ApiController;
use \OCP\IRequest;

class ApiClient extends ApiController {

    private $maxAge;

	public function __construct($appName, IRequest $request) {

        $this->maxAge = 1728000;

		parent::__construct($appName, $request, 'PUT, POST, GET, DELETE, PATCH', 'Authorization, Content-Type, Accept', $this->maxAge);

	}

}