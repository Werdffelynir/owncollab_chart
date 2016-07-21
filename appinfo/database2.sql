SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `oc_collab_links`;
CREATE TABLE `oc_collab_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `deleted` int(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `oc_collab_project`;
CREATE TABLE `oc_collab_project` (
  `name` varchar(255) NOT NULL,
  `create_uid` varchar(255) NOT NULL,
  `show_today_line` int(1) NOT NULL DEFAULT '1',
  `show_task_name` int(1) NOT NULL DEFAULT '1',
  `show_user_color` int(1) NOT NULL DEFAULT '0',
  `critical_path` int(1) NOT NULL DEFAULT '0',
  `scale_type` varchar(16) NOT NULL DEFAULT 'week',
  `scale_fit` int(1) DEFAULT '0',
  `is_share` int(1) DEFAULT '0',
  `share_link` varchar(255) DEFAULT NULL,
  `share_is_protected` int(1) NOT NULL DEFAULT '0',
  `share_password` varchar(255) DEFAULT NULL,
  `share_email_recipient` varchar(255) DEFAULT NULL,
  `share_is_expire` int(1) DEFAULT '0',
  `share_expire_time` timestamp NULL DEFAULT NULL,
  `open` int(1) NOT NULL DEFAULT '1',
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `oc_collab_tasks`;
CREATE TABLE `oc_collab_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `is_project` int(11) DEFAULT '0',
  `type` varchar(16) NOT NULL DEFAULT 'task',
  `text` varchar(255) DEFAULT NULL,
  `users` varchar(2048) DEFAULT '',
  `start_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `progress` float DEFAULT '0',
  `sortorder` int(1) DEFAULT '0',
  `parent` int(11) DEFAULT '1',
  `open` int(1) DEFAULT '1',
  `buffer` int(11) DEFAULT '0',
  `buffers` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `oc_collab_messages`;
CREATE TABLE `oc_collab_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rid` int(11) NOT NULL DEFAULT '0',
  `date` datetime NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `text` text COLLATE utf8_bin,
  `attachements` varchar(1024) COLLATE utf8_bin DEFAULT NULL,
  `author` varchar(64) COLLATE utf8_bin NOT NULL,
  `subscribers` text COLLATE utf8_bin NOT NULL,
  `hash` varchar(32) COLLATE utf8_bin DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;