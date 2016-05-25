
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `oc_collab_links` (
  `id` int(11) NOT NULL,
  `source` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `deleted` int(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `oc_collab_project` (
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
  `open` int(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `oc_collab_project` (`name`, `create_uid`, `show_today_line`, `show_task_name`, `show_user_color`, `critical_path`, `scale_type`, `scale_fit`, `is_share`, `share_link`, `share_is_protected`, `share_password`, `share_email_recipient`, `share_is_expire`, `share_expire_time`, `open`) VALUES
('Project Base', 'admin', 1, 1, 0, 1, 'day', 0, 0, '', 0, '', NULL, 0, NULL, 1);


CREATE TABLE IF NOT EXISTS `oc_collab_tasks` (
  `id` int(11) NOT NULL,
  `is_project` int(11) DEFAULT '0',
  `type` varchar(16) NOT NULL DEFAULT 'task',
  `text` varchar(255) DEFAULT NULL,
  `users` varchar(2048) DEFAULT '',
  `start_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NULL,
  `duration` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `progress` float DEFAULT '0',
  `sortorder` int(1) DEFAULT '0',
  `parent` int(11) DEFAULT '1',
  `open` int(1) DEFAULT '1',
  `buffer` int(11) DEFAULT '0',
  `buffers` varchar(2048) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `oc_collab_tasks` (`id`, `is_project`, `type`, `text`, `users`, `start_date`, `end_date`, `duration`, `order`, `progress`, `sortorder`, `parent`, `open`, `buffer`, `buffers`) VALUES
(1, 0, 'project', 'Base Project', '', '2016-05-13 18:00:00', '2016-06-05 18:00:00', 1104, 0, 0.290582, 0, 1, 1, 0, NULL);

ALTER TABLE `oc_collab_links`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `oc_collab_project`
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `oc_collab_tasks`
  ADD PRIMARY KEY (`id`);