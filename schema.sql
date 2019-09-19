# ************************************************************
# Sequel Pro SQL dump
# Version 5446
#
# https://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: mysql (MySQL 5.5.5-10.3.17-MariaDB-1:10.3.17+maria~bionic)
# Database: runelogs
# Generation Time: 2019-09-19 13:19:50 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table clan
# ------------------------------------------------------------

CREATE TABLE `clan` (
                        `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                        `name` text DEFAULT NULL,
                        PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table event
# ------------------------------------------------------------

CREATE TABLE `event` (
                         `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                         `user_id` int(11) unsigned NOT NULL,
                         `title` text DEFAULT NULL,
                         `details` text DEFAULT NULL,
                         `timestamp` int(11) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         KEY `User_event_new` (`user_id`),
                         CONSTRAINT `User_event_new` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table log
# ------------------------------------------------------------

CREATE TABLE `log` (
                       `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                       `user_id` int(11) unsigned NOT NULL,
                       `skill_id` int(11) unsigned NOT NULL,
                       `day` int(11) NOT NULL,
                       `value` int(11) DEFAULT NULL,
                       `level` int(11) DEFAULT NULL,
                       PRIMARY KEY (`id`),
                       KEY `Skill` (`skill_id`),
                       KEY `User_log` (`user_id`),
                       CONSTRAINT `Skill` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                       CONSTRAINT `User_log` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table skill
# ------------------------------------------------------------

CREATE TABLE `skill` (
                         `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                         `name` text DEFAULT NULL,
                         PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table user
# ------------------------------------------------------------

CREATE TABLE `user` (
                        `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                        `clan_id` int(11) unsigned DEFAULT NULL,
                        `name` text DEFAULT NULL,
                        `last_visited` int(11) DEFAULT NULL,
                        PRIMARY KEY (`id`),
                        KEY `Clan` (`clan_id`),
                        CONSTRAINT `Clan` FOREIGN KEY (`clan_id`) REFERENCES `clan` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
