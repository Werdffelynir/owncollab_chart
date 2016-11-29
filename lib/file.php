<?php
//chdir('/var/www/');
// /var/www/owncloud.loc/config/conf.php
// php -f /var/www/owncloud.loc/apps/owncollab_chart/lib/file.php
$path = realpath('./../')."/config/conf.php";
include ($path);
print_r($CONFIG);

