<?php
/**
 * Created by PhpStorm.
 * User: werd
 * Date: 27.05.16
 * Time: 14:59
 */

$p_name = isset($_['p_name'])?$_['p_name']:'XXX';
$u_name = isset($_['u_name'])?$_['u_name']:'XXX';
$s_link = isset($_['s_link'])?$_['s_link']:'XXX';
$i_link = isset($_['i_link'])?$_['i_link']:'XXX';
$protocol = isset($_['protocol'])?$_['protocol']:'XXX';
$domain = isset($_['domain'])?$_['domain']:'XXX';
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
<style>
    table {
        border-collapse: collapse;
    }

    .file_attached_table tr {
        height: 18px;
    }

    .file_attached_table td, .file_contains_table td{
        border: 1.0pt solid #000000;
        padding: 1px 6px;
    }

    p {
        font-size: 11.0pt;
        font-family: "Calibri", sans-serif;
    }
</style>
<table class="main" style="margin: 0 auto; font-size: 11.0pt;font-family: 'Calibri',sans-serif;" cellpadding="3" cellspacing="0" width="620" border="0">
    <tr>
        <td>
            <table cellspacing="0" cellpadding="3" width="615" class="file_contains_table">
                <tbody>
                <tr style="background: #1D2D44; color:#FFFFFF">
                    <td>
                        <span style="font-size: 18.0pt;">
                            <img src="<?=$protocol.'://'.$domain?>/core/img/logo-mail.gif" alt="">
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>Open access to view the project "<?=$p_name?>".</p>
                        <p>To view chart, click on the link: <a href="<?=$s_link?>" target="_blank"><?=$s_link?></a></p>
                    </td>
                </tr>
                </tbody>
            </table>
            <p>
                This email was created by the <a href="http://www.owncloud.com/">ownCloud</a> system on &lt;<?=$domain?>&gt;.
            </p>
            <p><a href="https://www.ownCollab.com">https://www.ownCollab.com</a> is powered by <a
                    href="http://www.owncloud.com/">ownCloud</a></p>

        </td>
    </tr>
</table>
</body>
</html>
