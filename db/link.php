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

    /** @var string $fields table fields name in database */
    private $fields = [
        'id',
        'source',
        'target',
        'type',
        'delete',
    ];

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

    public function insertWithId($data) {

        $task['id'] = $data['id'];
        $task['source'] = $data['source'];
        $task['target'] = $data['target'];
        $task['type'] = $data['type'];

        $result = $this->connect->db->insertIfNotExist($this->tableName, $task);

        if($result)
            return $this->connect->db->lastInsertId();
        return $result;
    }

    public function deleteById($id) {
        $result = false;
        try{
            $result = $this->connect->delete($this->tableName, 'id = :id', [':id' => $id]);
            if($result){
                $result = $result->rowCount();
            }
        }catch(\AbstractDriverException $error ){}
        return $result;
    }

    public function deleteAllById(array $ids) {
        $result = false;
        $prep = '';
        $bind = [];
        try{
            for($i = 0; $i < count($ids); $i ++){
                if(!empty($prep)) $prep .= " OR ";
                $prep .= "id = :id$i";
                $bind[":id$i"] = $ids[$i];
            }
            $result = $this->connect->delete($this->tableName, $prep, $bind);
            if($result){
                $result = $result->rowCount();
            }
        }catch(\AbstractDriverException $error ){}
        return $result;
    }



}