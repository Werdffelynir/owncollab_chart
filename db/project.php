<?php

namespace OCA\Owncollab_Chart\Db;


class Project
{
    /** @var Connect $connect object instance working with database */
    private $connect;

    /** @var string $tableName table name in database */
    private $tableName;

    /**
     * Project constructor.
     * @param $connect
     * @param $tableName
     */
    public function __construct($connect, $tableName) {
        $this->connect = $connect;
        $this->tableName = '*PREFIX*' . $tableName;
    }

    /**
     * Retrieve all date of project settings
     *
     * @return array|null
     */
    public function get(){
        $sql = "SELECT *, DATE_FORMAT( `share_expire_time`, '%d-%m-%Y %H:%i:%s') as share_expire_time
                FROM `{$this->tableName}`";
        return $this->connect->query($sql);
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