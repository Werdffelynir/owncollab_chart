<?php
/**
 * Tables models
 */

namespace OCA\Owncollab_Chart\Db;


class Link
{
    /** @var Connect $connect object instance working with database */
    private $connect;

    /** @var string $tableName table name in database */
    private $tableName;

    /**
     * Link constructor.
     * @param $connect
     * @param $tableName
     */
    public function __construct($connect, $tableName) {
        $this->connect = $connect;
        $this->tableName = '*PREFIX*' . $tableName;
    }

    /**
     * Get last id
     * @return mixed
     */
    public function getLastId() {
        $data = $this->connect->query("SELECT id FROM `{$this->tableName}` ORDER BY id DESC LIMIT 1");
        return (!$data) ? 1 : $data['id'];
    }

    /**
     * Retrieve one record by id
     *
     * @param $id
     * @return mixed
     */
    public function getById($id) {
        $project = $this->connect->select("*", $this->tableName, "id = :id", [':id' => $id]);
        if(count($project)===1) return $project[0];
        else return false;
    }

    /**
     * Retrieve all date of links project-tasks
     *
     * @return array|null
     */
    public function get(){
        return $this->connect->select('*', $this->tableName, 'deleted != 1');
    }


}