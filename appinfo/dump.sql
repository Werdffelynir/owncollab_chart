-- phpMyAdmin SQL Dump
-- version 4.4.13.1deb1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Фев 09 2016 г., 20:19
-- Версия сервера: 5.6.28-0ubuntu0.15.10.1
-- Версия PHP: 5.6.11-1ubuntu3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `owncloud`
--

-- --------------------------------------------------------

--
-- Структура таблицы `oc_collab_links`
--

CREATE TABLE IF NOT EXISTS `oc_collab_links` (
  `id` int(11) NOT NULL,
  `source` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `deleted` int(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `oc_collab_project`
--

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

--
-- Дамп данных таблицы `oc_collab_project`
--

INSERT INTO `oc_collab_project` (`name`, `create_uid`, `show_today_line`, `show_task_name`, `show_user_color`, `critical_path`, `scale_type`, `scale_fit`, `is_share`, `share_link`, `share_is_protected`, `share_password`, `share_email_recipient`, `share_is_expire`, `share_expire_time`, `open`) VALUES
('Project Base', 'admin', 1, 1, 0, 0, 'day', 0, 1, '8lsPvtYKwniQbFxd', 0, NULL, NULL, 0, NULL, 1);

-- --------------------------------------------------------

--
-- Структура таблицы `oc_collab_tasks`
--

CREATE TABLE IF NOT EXISTS `oc_collab_tasks` (
  `id` int(11) NOT NULL,
  `is_project` int(11) NOT NULL DEFAULT '0',
  `type` varchar(16) NOT NULL DEFAULT 'task',
  `text` varchar(255) DEFAULT NULL,
  `users` varchar(2048) DEFAULT '""',
  `start_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `progress` float NOT NULL DEFAULT '0',
  `sortorder` int(1) NOT NULL DEFAULT '0',
  `parent` int(11) NOT NULL DEFAULT '0',
  `open` int(1) NOT NULL DEFAULT '1',
  `deleted` int(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `oc_collab_tasks`
--

INSERT INTO `oc_collab_tasks` (`id`, `is_project`, `type`, `text`, `users`, `start_date`, `end_date`, `duration`, `order`, `progress`, `sortorder`, `parent`, `open`, `deleted`) VALUES
(1, 1, 'project', 'Base Project', '', '2016-02-01 18:00:00', '2016-02-29 18:00:00', 28, NULL, 0, 0, 0, 1, 0),
(2, 0, 'task', 'Some task', 'dev3', '2016-02-07 20:00:00', '2016-02-14 20:00:00', 7, NULL, 0, 0, 1, 1, 0),
(3, 0, 'task', 'Open task', 'admindev, dev1, admin, admin2, admin3, adminman', '2016-02-14 14:00:00', '2016-02-21 14:00:00', 7, NULL, 0.490166, 1, 0, 1, 0),
(5, 0, 'task', 'New Task', 'admin2, admin3, admindev', '2016-02-21 20:00:00', '2016-02-26 20:00:00', 5, 0, 1, 0, 2, 1, 0),
(7, 0, 'task', 'New Task', '', '2016-02-07 12:00:00', '2016-02-15 12:00:00', 8, 0, 0, 0, 2, 1, 0),
(9, 0, 'task', 'New Task', 'admin2, admin3, adminman', '2016-02-01 20:00:00', '2016-02-07 20:00:00', 6, 0, 0.5, 0, 3, 1, 0),
(11, 0, 'task', 'New Task', '', '2016-02-14 12:00:00', '2016-02-21 14:21:06', 8, 0, 0, 0, 3, 1, 0),
(12, 0, 'task', 'URT', '', '2016-02-04 18:00:00', '2016-02-11 18:00:00', 7, 0, 0, 0, 9, 1, 0),
(14, 0, 'task', 'New Task fsfdsdfwsf', 'admin, admin2, admin3', '2016-02-12 18:00:00', '2016-02-19 18:00:00', 7, 0, 0.666667, 0, 9, 1, 0),
(19, 0, 'task', 'New Task', '', '2016-02-09 16:00:00', '2016-02-16 14:25:49', 7, 0, 0, 0, 9, 1, 0),
(23, 0, 'task', 'New Task', '', '2016-02-03 20:00:00', '2016-02-10 20:00:00', 7, 0, 0, 0, 2, 1, 0),
(25, 0, 'task', 'New Task', '', '2016-02-19 20:00:00', '2016-02-27 20:00:00', 8, 0, 0, 0, 3, 1, 0),
(26, 0, 'task', 'New Task', '', '2016-02-18 18:00:00', '2016-02-23 18:00:00', 5, 0, 0, 0, 3, 1, 0),
(28, 0, 'task', 'WQD', '', '2016-02-01 18:00:00', '2016-02-08 09:59:51', 7, 0, 0, 0, 9, 1, 0);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `oc_collab_links`
--
ALTER TABLE `oc_collab_links`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `oc_collab_project`
--
ALTER TABLE `oc_collab_project`
  ADD UNIQUE KEY `name` (`name`);

--
-- Индексы таблицы `oc_collab_tasks`
--
ALTER TABLE `oc_collab_tasks`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `oc_collab_links`
--
ALTER TABLE `oc_collab_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `oc_collab_tasks`
--
ALTER TABLE `oc_collab_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=31;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
