<?php


namespace OCA\Owncollab_Chart\Db;


class Resource
{
    /** @var Connect $connect object instance working with database */
    private $connect;

    /** @var string $tableName table name in database */
    private $tableName;

    /**
     * Resource constructor.
     * @param $connect
     * @param $tableName
     */
    public function __construct($connect, $tableName) {
        $this->connect = $connect;
        $this->tableName = '*PREFIX*' . $tableName;
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
     * Retrieve all registered resource
     *
     * @return array|null
     */
    public function get(){
        return $this->connect->select('*', $this->tableName, 'deleted != 1');
    }




}