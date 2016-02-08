<?php
/**
 * Created by PhpStorm.
 * User: werd
 * Date: 28.01.16
 * Time: 22:29
 */

namespace OCA\Owncollab_Chart\Db;


use OCA\Owncollab_Chart\Helper;

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
     * Get last id
     * @return mixed
     */
    public function getLastId() {
        $result = $this->connect->query("SELECT id FROM `{$this->tableName}` ORDER BY id DESC LIMIT 1");
        return (!$result) ? 1 : $result['id'];
    }

    /**
     * @param $data
     * @return \Doctrine\DBAL\Driver\Statement|int
     */
    public function deleteId($data) {
        $result = $this->connect->delete($this->tableName, 'id = :id', [':id' => $data['id']]);
        return ($result) ? $result->rowCount() : $result;
    }


    /**
     * @param $task
     * @return int
     */
    public function update($task) {
       $sql = "UPDATE {$this->tableName} SET
                    type = :type, text = :text, users = :users, start_date = :start_date, end_date = :end_date, duration = :duration, progress = :progress, parent = :parent, open = :open
                  WHERE id = :id";

        return  $this->connect->db->executeUpdate($sql, [
            ':type'         => $task['type'] ? $task['type'] : 'task',
            ':text'         => $task['text'] ? $task['text'] : 'text',
            ':users'        => $task['users'] ? $task['users'] : '',
            ':start_date'   => Helper::toTimeFormat($task['start_date']),
            ':end_date'     => Helper::toTimeFormat($task['end_date']),
            ':duration'     => $task['duration'] ? $task['duration'] : 0,
            ':progress'     => $task['progress'] ? $task['progress'] : "0",
            ':parent'       => $task['parent'] ? $task['parent'] : 0,
            ':open'         => $task['open'] ? 1 : 0,
            ':id'           => (int)$task['id']
        ]);
    }

    /**
     * @param $task
     * @return \Doctrine\DBAL\Driver\Statement|int
     */
    public function insertWithId($task) {
        $sql = "INSERT INTO {$this->tableName}
                  (`id`, `is_project`, `type`, `text`, `users`, `start_date`, `end_date`, `duration`, `order`, `progress`, `sortorder`, `parent`)
                VALUES (:id, :is_project, :type, :text, :users, :start_date, :end_date, :duration, :order, :progress, :sortorder, :parent )";
        $result = $this->connect->db->executeQuery($sql, [
            ':id'           => $task['id'],
            ':is_project'   => $task['is_project'] ? 1 : 0,
            ':type'         => $task['type'] ? $task['type'] : 'task',
            ':text'         => $task['text'] ? $task['text'] : 'text',
            ':users'        => $task['users'] ? $task['users'] : '',
            ':start_date'   => Helper::toTimeFormat($task['start_date']),
            ':end_date'     => Helper::toTimeFormat($task['end_date']),
            ':duration'     => $task['duration'] ? $task['duration'] : 0,
            ':order'        => $task['order'] ? $task['order'] : 0,
            ':progress'     => $task['progress'] ? $task['progress'] : '0',
            ':sortorder'    => $task['sortorder'] ? $task['sortorder'] : '0',
            ':parent'       => $task['parent'] ? $task['parent'] : 0
        ]);

        if($result)
            return $this->connect->db->lastInsertId();
        return $result;
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