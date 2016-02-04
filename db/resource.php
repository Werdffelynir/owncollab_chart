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


    /**
     * Retrieve all registered resource
     *
     * @return array|null
     */
    public function getGroupsUsersList(){

        $records = $this->getGroupsUsers();
        $result = [];

        // Operation iterate and classify users into groups
        foreach($records as $record){
            $result[$record['gid']][] = [
                'gid'=> $record['gid'],
                'uid'=> $record['uid'],
                'displayname'=> ($record['displayname'])?$record['displayname']:$record['uid']
            ];
        }
        return $result;
    }


    /**
     * Retrieve all records from Users
     *
     * @return mixed
     */
    public function getGroupsUsers() {

        $sql = "SELECT gu.uid, gu.gid, u.displayname
                FROM *PREFIX*group_user gu
                LEFT JOIN *PREFIX*users u ON (u.uid = gu.uid)";

        return $this->connect->queryAll($sql);
    }



}