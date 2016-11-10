<?php

namespace OCA\Owncollab_Chart;

use OC\User\Session;
use OCA\Owncollab_Chart\PHPMailer\PHPMailer;
use OCA\Owncollab_Chart\PHPMailer\phpmailerException;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\TemplateResponse;

class Helper
{

    /**
     * Check current the application is running.
     * If $name return bool if current application equivalent
     * If $name missing return current application name
     *
     * @param $name
     * @return array|null|bool
     */
    static public function isApp($name = null) {
        $uri = \OC::$server->getRequest()->getRequestUri();
        $start = strpos($uri, '/apps/') + 6;
        $app = substr($uri, $start);

        if (strpos($app, '/'))
            $app = substr($app, 0, strpos($app, '/'));

        if($name)
            return $app == $name;

        return $app;
    }

    /**
     * todo: delete
     * Checked is app now
     * @param $appName
     * @return bool
     */
    static public function isAppPage($appName)
    {
        $requestUri = \OC::$server->getRequest()->getRequestUri();
        $uriParts = explode('/',trim($requestUri,'/'));
        $part = array_search('apps',$uriParts);
        if(isset($uriParts[$part+1]) && strtolower($appName) === strtolower($uriParts[$part+1]))
            return true;
        else return false;
    }

    /**
     * Current URI address path
     * @param $appName
     * @return bool|string
     */
    static public function getCurrentUri($appName)
    {
        $requestUri = \OC::$server->getRequest()->getRequestUri();
        $subPath = 'apps/'.$appName;
        if(strpos($requestUri, $subPath) !== false){
            $ps =  substr($requestUri, strpos($requestUri, $subPath)+strlen($subPath));
            if($ps==='/'||$ps===false) return '/';
            else return trim($ps, '/');
        }else{
            return false;
        }
    }


    /**
     * Check URI address path
     * @param $appName
     * @param $uri
     * @return bool
     */
    static public function isUri($appName, $uri)
    {
        $requestUri = \OC::$server->getRequest()->getRequestUri();
        if ( strpos($requestUri, $appName."/".$uri) !== false)
            return true;
        else return false;
    }

    /**
     * Render views and transmit data to it
     * @param $appName
     * @param $view
     * @param array $data
     * @return string
     */
    static public function renderPartial($appName, $view, array $data = [])
    {
        $response = new TemplateResponse($appName, $view, $data, '');
        return $response->render();
    }


    /**
     * Session worker
     * @param null $key
     * @param null $value
     * @return mixed|Sessioner
     */
    static public function session($key=null, $value=null)
    {
        static $ses = null;
        if($ses === null) $ses = new Sessioner();
        if(func_num_args() == 0)
            return $ses;
        if(func_num_args() == 1)
            return $ses->get($key);
        else
            $ses->set($key,$value);
    }

    /**
     * @param null $key
     * @param bool|true $clear
     * @return bool|string|array
     */
    static public function post($key=null, $clear = true)
    {
        if(func_num_args() === 0)
            return $_POST;
        else{
            if(isset($_POST[$key])) {
                if($clear)
                    return trim(strip_tags($_POST[$key]));
                else return $_POST[$key];
            }
        }
        return false;
    }

    /**
     * @param null $key
     * @param bool $clear
     * @return bool|string
     */
    static public function get($key = null, $clear = true)
    {
        if(func_num_args() === 0)
            return $_GET;
        else{
            if(isset($_GET[$key])) {
                if($clear)
                    return trim(strip_tags($_GET[$key]));
                else return $_GET[$key];
            }
        }
        return false;
    }


    /**
     * Encode string with salt
     * @param $unencoded
     * @param $salt
     * @return string
     */
    static public function encodeBase64($unencoded, $salt)
    {
        $string = base64_encode($unencoded);
        $encodeStr = '';
        $arr = [];
        $x = 0;
        while ($x++< strlen($string)) {
            $arr[$x-1] = md5(md5($salt.$string[$x-1]).$salt);
            $encodeStr = $encodeStr.$arr[$x-1][3].$arr[$x-1][6].$arr[$x-1][1].$arr[$x-1][2];
        }
        return $encodeStr;
    }

    static public function decodeBase64($encoded, $salt){
        $symbols="qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM=";
        $x = 0;
        while ($x++<= strlen($symbols)-1) {
            $tmp = md5(md5($salt.$symbols[$x-1]).$salt);
            $encoded = str_replace($tmp[3].$tmp[6].$tmp[1].$tmp[2], $symbols[$x-1], $encoded);
        }
        return base64_decode($encoded);
    }

    static public function appName($name=false){
        static $_name = null;
        if($name) $_name = $name;
        return $_name;
    }


    static public function toTimeFormat($timeString){
        return date( "Y-m-d H:i:s", strtotime($timeString) );
    }

    /**
     * @return \OCP\IDBConnection
     */
    static public function getConnection(){
        return \OC::$server->getDatabaseConnection();
    }

    static public function randomString($length = 6, $symbols = ''){
        $abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".$symbols;
        $rand = "";
        for($i=0; $i<$length; $i++) {
            $rand .= $abc[rand()%strlen($abc)];
        }
        return $rand;
    }

    /**
     * @param array $conf mailSend(['to'=>0, 'name_to'=>0, 'from'=>0, 'name_from'=>, 'subject'=>0, 'body'=>0])
     * @throws PHPMailer
     */
    /**
     * @param array $conf
     * @return bool|string
     * @throws PHPMailer\phpmailerException
     */
    static public function mailSend(array $conf){

        $to = isset($conf['to'])
            ? $conf['to']
            : false;
        $nameTo = isset($conf['name_to'])
            ? $conf['name_to']
            : 'To';
        $from = isset($conf['from'])
            ? $conf['from']
            : "no-reply@".\OC::$server->getRequest()->getServerHost();
        $nameFrom = isset($conf['name_from'])
            ? $conf['name_from']
            : 'no-reply';
        $subject = isset($conf['subject'])
            ? $conf['subject']
            : 'OwnCollab message';
        $body = isset($conf['body'])
            ? $conf['body']
            : '';

        $mail = new PHPMailer();

        if(filter_var($to, FILTER_VALIDATE_EMAIL))
        {
            $mail->setFrom($from, $nameFrom);
            $mail->addAddress($to, $nameTo);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->isHTML();

            if (!$mail->send())
                return $mail->ErrorInfo;
            else
                return true;
        }
    }

    static public function validEmailAddress($to){
        return filter_var($to, FILTER_VALIDATE_EMAIL);
    }
    static public function getRequest(){
        return \OC::$server->getRequest();
    }
    static public function getPort(){
        return $_SERVER['SERVER_PORT'];
    }
    static public function getProtocol(){
        return \OC::$server->getRequest()->getServerProtocol();
    }
    static public function getHost(){
        return \OC::$server->getRequest()->getServerHost();
    }
    static public function getUri(){
        return \OC::$server->getRequest()->getRequestUri();
    }
    static public function getFullUrl(){
        return \OC::$server->getRequest()->getServerProtocol() ."://". \OC::$server->getRequest()->getServerHost();
    }
    static private $providerData = [];
    static public function provider($key, $value = 'DEFAULTVALUE'){
        if($value === 'DEFAULTVALUE')
            return isset(self::$providerData[$key])?self::$providerData[$key]:null;
        else
            return self::$providerData[$key] = $value;
    }



}
