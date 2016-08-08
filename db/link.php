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
        'deleted',
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
     * @return array|null
     */
    public function get() {
        return $this->connect->select('*', $this->tableName);
    }

    public function clear() {
        return $this->connect->delete($this->tableName, 'id != 999999');
    }

    public function add(array $data) {
        $SQL = "INSERT INTO oc_collab_links (`id`, `source`, `target`, `type`, `deleted`) VALUES ";
        $rowData = [];
        for($iRow=0; $iRow < count($data); $iRow++) {

            $SQL .= (empty($rowData)?'':',') . "( :id_$iRow, :source_$iRow, :target_$iRow, :type_$iRow, :deleted_$iRow )";

            for($i = 0; $i < count($this->fields); $i++) {
                $field = $this->fields[$i];

                if(isset($data[$iRow][$field])) {
                    $value = $data[$iRow][$field];

                    if($field == 'id')              $value = (int) $value;
                    if($field == 'source')          $value = (int) $value;
                    if($field == 'target')          $value = (int) $value;
                    if($field == 'type')            $value = (int) ((empty($value) || $value < 0) ? 0 : $value);
                    if($field == 'deleted')         $value = (int) (empty($value) ? 0 : $value);

                    $rowData[":{$field}_{$iRow}"] = $value;
                }else{
                    $rowData[":{$field}_{$iRow}"] = null;
                }
            }
        }
        return $this->connect->db->prepare($SQL)->execute($rowData);
        //return [$SQL, $rowData];
    }




/*
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
            if($result) {
                $result = $result->rowCount();
            }
        }catch(\AbstractDriverException $error ){}
        return $result;
    }*/

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