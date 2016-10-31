<?php

namespace OCA\Owncollab_Chart\Db;


use \OCP\IDBConnection;

class Connect
{
    /** @var IDBConnection  */
    public $db;

    /** @var Project model of database table */
    private $project;

    /** @var Task model of database table */
    private $task;

    /** @var Link model of database table */
    private $link;

    /**
     * Connect constructor.
     * @param IDBConnection $db
     */
    public function __construct(IDBConnection $db) {
        $this->db = $db;

        // Register tables models
        $this->project = new Project($this, 'collab_project');
        $this->task = new Task($this, 'collab_tasks');
        $this->link = new Link($this, 'collab_links');
    }

    /**
     * Execute prepare SQL string $query with binding $params, and return one record
     * @param $query
     * @param array $params
     * @return mixed
     */
    public function query($query, array $params = []) {
        return $this->db->executeQuery($query, $params)->fetch();
    }

    /**
     * Execute prepare SQL string $query with binding $params, and return all match records
     * @param $query
     * @param array $params
     * @return mixed
     */
    public function queryAll($query, array $params = []) {
        return $this->db->executeQuery($query, $params)->fetchAll();
    }

    /**
     * Quick selected records
     * @param $fields
     * @param $table
     * @param null $where
     * @param null $params
     * @return mixed
     */
    public function select($fields, $table, $where = [], $params = []) {
        $sql = "SELECT " . $fields . " FROM " . $table . ($where ? " WHERE " . $where : "") . ";";
        return  $this->queryAll($sql, $params);
    }

    /**
     * Quick insert record
     * @param $table
     * @param array $columnData
     * @return \Doctrine\DBAL\Driver\Statement
     */
    public function insert($table, array $columnData) {
        $columns = array_keys($columnData);
        $sql = sprintf("INSERT INTO %s (%s) VALUES (%s);",
            $table,
            implode(', ', $columns),
            implode(', ', array_fill(0, count($columnData), '?'))
        );
        return $this->db->executeQuery($sql, array_values($columnData));
    }

    /**
     * Quick delete records
     * @param $table
     * @param $where
     * @param null $bind
     * @return \Doctrine\DBAL\Driver\Statement
     */
    public function delete($table, $where, $bind = []) {
        $sql = "DELETE FROM " . $table . " WHERE " . $where . ";";
        return $this->db->executeQuery($sql, (array) $bind);
    }

    /**
     * Quick update record
     * @param $table
     * @param array $columnData
     * @param $where
     * @param null $bind
     * @return \Doctrine\DBAL\Driver\Statement
     */
    public function update($table, array $columnData, $where, $bind=[]) {
        $columns = array_keys($columnData);
        $where = preg_replace('|:\w+|','?', $where);
        if(empty($bind)) $bind = array_values($columnData);
        else $bind = array_values(array_merge($columnData, (array) $bind));
        $sql = sprintf("UPDATE %s SET %s WHERE %s;", $table, implode('=?, ', $columns) . '=?', $where);
        return $this->db->executeQuery($sql, (array) $bind);
    }

    public function setSessionTimeZoneToZero() {
        $this->db->executeQuery("SET @@session.time_zone = '+00:00'");
    }

    /**
     * Access to tables
     * @return Project
     */

    /**
     * Retry instance of class working with database
     * Table of collab_project
     * @return Project
     */
    public function project() {
        return $this->project;
    }

    /**
     * Retry instance of class working with database
     * Table of collab_tasks
     * @return Task
     */
    public function task() {
        return $this->task;
    }

    /**
     * Retry instance of class working with database
     * Table of collab_links
     * @return Link
     */
    public function link() {
        return $this->link;
    }
}