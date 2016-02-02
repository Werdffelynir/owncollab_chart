<?php
/**
 * Created by PhpStorm.
 * User: werd
 * Date: 28.01.16
 * Time: 22:29
 */

namespace OCA\Owncollab_Chart\Db;


class Task
{
    /** @var Connect $connect object instance working with database */
    private $connect;

    /** @var string $tableName table name in database */
    private $tableName;

    /**
     * Task constructor.
     * @param $connect
     * @param $tableName
     */
    public function __construct($connect, $tableName) {
        $this->connect = $connect;
        $this->tableName = '*PREFIX*' . $tableName;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getById($id) {
        $project = $this->connect->select("*", $this->tableName, "id = :id", [':id' => $id]);
        if(count($project)===1) return $project[0];
        else return false;
    }

    /**
     * Retrieve tasks-data of project
     * Вatabase query selects all not marked as deleted records, and all columns of type timestamp output
     * formatting for JavaScript identification
     * @return array|null
     */
    public function get(){
        $sql = "SELECT *,
                DATE_FORMAT( `start_date`, '%d-%m-%Y %H:%i:%s') as start_date,
                DATE_FORMAT( `end_date`, '%d-%m-%Y %H:%i:%s') as end_date,
                DATE_FORMAT( `deadline`, '%d-%m-%Y %H:%i:%s') as deadline,
                DATE_FORMAT( `planned_start`, '%d-%m-%Y %H:%i:%s') as planned_start,
                DATE_FORMAT( `planned_end`, '%d-%m-%Y %H:%i:%s') as planned_end
                FROM `{$this->tableName}` WHERE deleted != 1";
        return $this->connect->queryAll($sql);
    }

}