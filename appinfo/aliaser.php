<?php

namespace OCA\Owncollab_Chart\AppInfo;

use OCP\IUserManager;

class Aliaser
{
    private $serverHost = '';
    /** @var IUserManager  */
    private $userManager;
    private $groupManager;
    private $session;
    private $userSession;

    /**
     * Aliaser constructor.
     */
    public function __construct()
    {
        $this->serverHost = \OC::$server->getRequest()->getServerHost();
        $this->userManager = \OC::$server->getUserManager();
        $this->groupManager = \OC::$server->getGroupManager();
        $this->session = new \OC\Session\Memory('');
        $this->userSession = new \OC\User\Session($this->userManager, $this->session);

        $this->connectToMTA();
        $this->initListeners($this->userSession, $this->groupManager);
    }

    public function onPreCreateUser($uid, $password)
    {
        if(!empty($uid) && !empty($password)){
            $this->insertNewAlias(strtolower($uid).'@'.$this->serverHost, $password);
        }
    }

    public function onPreDeleteUser($uid){}

    public function onPreCreateGroup($gid)
    {
        if(!empty($gid)){
            $this->insertNewAlias(strtolower($gid).'@'.$this->serverHost, 'pass'.strtolower($gid));
        }
    }

    public function onPreDeleteGroup($gid){}

    private function initListeners($userSession, $groupManager)
    {
        $userSession->listen('\OC\User', 'preCreateUser', [$this, 'onPreCreateUser']);
        $userSession->listen('\OC\User', 'preDelete', [$this, 'onPreDeleteUser']);

        $groupManager->listen('\OC\Group', 'preCreate', [$this, 'onPreCreateGroup']);
        $groupManager->listen('\OC\Group', 'preDelete', [$this, 'onPreDeleteGroup']);
    }


    /** @var \Doctrine\DBAL\Connection */
    private static $connectionMTA = null;

    public function connectToMTA()
    {
        if(!self::$connectionMTA){
            $config = new \Doctrine\DBAL\Configuration();
            self::$connectionMTA = \Doctrine\DBAL\DriverManager::getConnection(
                [
                    'url' => 'mysql://mailuser:aMq3PFWsGpvGd2Ja@localhost/mailserver'
                ],
                $config);
        }
        return self::$connectionMTA;
    }

    public function insertNewAlias($newemail, $newpassword)
    {
        if(self::$connectionMTA){
            $sql = "INSERT INTO `mailserver`.`virtual_users`
                  (`domain_id`, `password` , `email`) VALUES
                  ('1', ENCRYPT(?, CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))) , ?);";
            $stmt = self::$connectionMTA->prepare($sql);
            $stmt->bindValue(1, $newpassword);
            $stmt->bindValue(2, $newemail);
            $stmt->execute();
        }
    }
}