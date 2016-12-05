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

    /** @var string $fields table fields name in database */
    private $fields = [
        'id',
        'type',
        'text',
        'users',
        'start_date',
        'end_date',
        'duration',
        'order',
        'progress',
        'sortorder',
        'parent',
        'open',
        'buffers',
    ];


    /**
     * Task constructor.
     * @param $connect
     * @param $tableName
     */
    public function __construct($connect, $tableName) {
        $this->connect = $connect;
        $this->tableName = '*PREFIX*' . $tableName;
    }

    public function startInsert() {
        $conf = [
            'start_date' => date('Y-m-d H:i:s', time()),
            'end_date' => date('Y-m-d H:i:s', time() + 3600 * 24 * 14),
        ];
        return $this->connect->insert($this->tableName, [
            'id' => 1,
            'is_project' => 1,
            'text'=> 'Project',
            'start_date'=> $conf['start_date'],
            'end_date'=> $conf['end_date']
        ]);
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
     * Retrieve tasks-data of project
     * Database query selects all opened records, and all columns of type timestamp output
     * formatting for JavaScript identification
     * @return array|null
     */
    public function get(){
        $sql = "SELECT *,
                DATE_FORMAT( `start_date`, '%d-%m-%Y %H:%i:%s') as start_date,
                DATE_FORMAT( `end_date`, '%d-%m-%Y %H:%i:%s') as end_date
                FROM `{$this->tableName}`"; // WHERE `open` != 0
        return $this->connect->queryAll($sql);
    }

    public function clear() {
        return $this->connect->delete($this->tableName, 'id != 999999');
    }

    /**
     * @param array $data
     * @return array
     */
    public function add(array $data) {

        $SQL = "INSERT INTO $this->tableName (`id`, `type`, `text`, `users`, `start_date`, `end_date`, `duration`, `order`, `progress`, `sortorder`, `parent`, `open`, `buffers`) VALUES ";

        //$this->connect->setSessionTimeZoneToZero();
        //$this->connect->db->executeQuery("SET @@session.time_zone = '00:00'");
        //$query = \OC_DB::prepare('SET @@session.time_zone = "00:00"');
        //$query = \OC_DB::prepare('SET GLOBAL time_zone = "00:00"');
        $query = \OC_DB::prepare("set @@session.time_zone = '+00:00'");
        $query->execute();




        //$this->connect->db->executeQuery("SET time_zone = 'UTC'");

        $rowData = [];
        for($iRow=0; $iRow < count($data); $iRow++) {

            $SQL .= (empty($rowData)?'':',') . "( :id_$iRow, :type_$iRow, :text_$iRow, :users_$iRow, :start_date_$iRow, :end_date_$iRow, :duration_$iRow, :order_$iRow, :progress_$iRow, :sortorder_$iRow, :parent_$iRow, :open_$iRow, :buffers_$iRow )";

            for($i = 0; $i < count($this->fields); $i++) {
                $field = $this->fields[$i];
                $value = $data[$iRow][$field];

                if(isset($data[$iRow][$field])) {
                    try{
                        if($field == 'id')                  $value = (int) $value;
                        elseif($field == 'type')            $value = (string) $value;
                        elseif($field == 'text')            $value = (string) $value;
                        elseif($field == 'users')           $value = (string) $value;
                        //elseif($field == 'start_date')      $value = empty($value) ? date("Y-m-d H:i:s", time()) : $value;
                        //elseif($field == 'end_date')        $value = empty($value) ? date("Y-m-d H:i:s", time() + 3600*24*7) : $value;
                        elseif($field == 'start_date')      $value = empty($value) ? date("Y-m-d H:i:s", time()) : date("Y-m-d H:i:s", strtotime($value));
                        elseif($field == 'end_date')        $value = empty($value) ? date("Y-m-d H:i:s", time() + 3600*24*7) : date("Y-m-d H:i:s", strtotime($value));
                        elseif($field == 'duration')        $value = (int) (empty($value)?0:$value);
                        elseif($field == 'order')           $value = (int) (empty($value)?0:$value);
                        elseif($field == 'progress')        $value = (float) (empty($value)?0:$value);
                        elseif($field == 'sortorder')       $value = (int) (empty($value)?0:$value);
                        elseif($field == 'parent')          $value = (int) (empty($value)?1:$value);
                        elseif($field == 'open')            $value = (int) (empty($value)?1:$value);
                        elseif($field == 'buffers')         $value = (string) (empty($value)?'':$value);
                    }catch(\Exception $e){};
                    $rowData[":{$field}_{$iRow}"] = $value;
                }else{
                    $rowData[":{$field}_{$iRow}"] = null;
                }
            }
        }
        return $this->connect->db->prepare($SQL)->execute($rowData);
    }


    /**
     * @param int $next
     * @return mixed
     */
    public function resetAutoIncrement($next = 2){
        try{
            $sql = "ALTER TABLE `{$this->tableName}` AUTO_INCREMENT = $next";
            $result = $this->connect->db->executeQuery($sql)->execute();
        }catch(\Exception $e){
            $result = 'error:' . $e->getMessage();
        }
        return $result;
    }


    /**
     * @param $id
     * @return \Doctrine\DBAL\Driver\Statement|int
     */
    public function deleteById($id) {
        $result = $this->connect->delete($this->tableName, 'id = :id', [':id' => $id]);
        return ($result) ? $result->rowCount() : $result;
    }


    /**
     * @param $task
     * @return int
     */
    public function update($task) {
       $sql = "UPDATE {$this->tableName} SET
                  type = :type, text = :text, users = :users, start_date = :start_date, end_date = :end_date, duration = :duration, progress = :progress, parent = :parent, buffer = :buffer
                  WHERE id = :id";

        return  $this->connect->db->executeUpdate($sql, [
            ':type'         => $task['type'] ? $task['type'] : 'task',
            ':text'         => $task['text'] ? $task['text'] : 'text',
            ':users'        => $task['users'] ? $task['users'] : '',
            ':start_date'   => Helper::toTimeFormat($task['start_date']),
            ':end_date'     => Helper::toTimeFormat($task['end_date']),
            ':duration'     => $task['duration'] ? $task['duration'] : 0,
            ':progress'     => $task['progress'] ? $task['progress'] : 0,
            ':parent'       => $task['parent'] ? $task['parent'] : 1,
            ':buffer'       => $task['buffer'] ? "{$task['buffer']}" : "0",
            ':id'           => (int) $task['id']
        ]);
    }

    /**
     * @param $data
     * @return \Doctrine\DBAL\Driver\Statement|int
     */
    public function insertWithId($data) {
        $result = null;
        $task['id'] = $data['id'] > 10000 ? 10000 : (int) $data['id'];
        $task['is_project'] = $data['is_project'];
        $task['type'] = $data['type'] ? $data['type'] : 'task';
        $task['text'] = $data['text'];
        $task['users'] = $task['users'] ? $task['users'] : '';
        $task['start_date'] = Helper::toTimeFormat($data['start_date']);
        $task['end_date'] = Helper::toTimeFormat($data['end_date']);
        $task['duration'] = $data['duration'] ? $data['duration'] : 0;
        $task['order'] = $data['order'] ? $data['order'] : 0;
        $task['progress'] = $data['progress'] ? $data['progress'] : 0;
        $task['sortorder'] = $data['sortorder'] ? $data['sortorder'] : 0;
        $task['parent'] = $data['parent'] ? $data['parent'] : 1;

        try{
            $result = $this->connect->db->insertIfNotExist($this->tableName, $task);
        }catch(\Exception $e){
            $result = 'error:' . $e->getMessage();
        }

        return $result;
    }


    public function insertTask($data) {
        $result = null;
        $task['type'] = $data['type'] ? $data['type'] : 'task';
        $task['text'] = $data['text'];
        $task['users'] = $task['users'] ? $task['users'] : '';
        $task['start_date'] = Helper::toTimeFormat($data['start_date']);
        $task['end_date'] = Helper::toTimeFormat($data['end_date']);
        $task['open'] = 1;
        $task['parent'] = $data['parent'] ? (int) $data['parent'] : 1;

        try{
            $_result = $this->connect->insert($this->tableName, $task);
            if($_result)
                return $this->connect->db->lastInsertId();
        }catch(\Exception $e){
            $result = 'error:' . $e->getMessage();
        }

        return $result;
    }

}