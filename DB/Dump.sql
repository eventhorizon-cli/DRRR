-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: drrr
-- ------------------------------------------------------
-- Server version	5.7.18-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat_room`
--

DROP TABLE IF EXISTS `chat_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_room` (
  `id` int(10) unsigned zerofill NOT NULL AUTO_INCREMENT COMMENT '房间ID',
  `name` varchar(20) NOT NULL COMMENT '房间名',
  `owner_id` int(10) unsigned zerofill NOT NULL COMMENT '房主ID',
  `max_users` int(11) unsigned NOT NULL COMMENT '最大用户数',
  `current_users` int(11) unsigned NOT NULL DEFAULT '1' COMMENT '当前用户数',
  `is _encrypted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否被加密',
  `salt` varchar(36) DEFAULT NULL COMMENT '盐',
  `password_hash` varchar(44) DEFAULT NULL COMMENT '哈希密码',
  `is_hidden` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否为加密房',
  `is_permanent` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否为永久房',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  KEY `user_id_idx` (`owner_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COMMENT='聊天室';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_room`
--

LOCK TABLES `chat_room` WRITE;
/*!40000 ALTER TABLE `chat_room` DISABLE KEYS */;
INSERT INTO `chat_room` VALUES (0000000001,'测试房间',0000000015,20,20,0,NULL,NULL,0,0,'2017-08-12 14:59:33','2017-08-24 15:30:54'),(0000000002,'测试房间1',0000000015,5,4,0,NULL,NULL,0,0,'2017-08-20 03:04:13','2017-08-24 15:31:00'),(0000000003,'测试房间3',0000000015,10,6,0,'',NULL,0,0,'2017-08-21 14:24:23','2017-08-24 14:31:05'),(0000000007,'测试房间4',0000000015,10,5,0,'',NULL,0,0,'2017-08-21 14:39:25','2017-08-24 14:31:07'),(0000000008,'测试房间5',0000000015,10,3,0,'',NULL,0,0,'2017-08-21 14:40:39','2017-08-24 14:31:10'),(0000000009,'房间名称房间名称房间名称房间名称房间名称',0000000015,10,1,0,NULL,NULL,0,0,'2017-08-22 15:59:11','2017-08-24 14:30:54');
/*!40000 ALTER TABLE `chat_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(1) unsigned NOT NULL COMMENT '角色ID',
  `name` varchar(5) NOT NULL COMMENT '角色名',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'普通用户');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(10) unsigned zerofill NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(10) NOT NULL COMMENT '用户名',
  `password_hash` char(44) NOT NULL COMMENT '哈希密码',
  `salt` char(36) NOT NULL COMMENT '盐',
  `role_id` int(1) unsigned NOT NULL DEFAULT '1' COMMENT '角色ID',
  `status_code` int(1) unsigned NOT NULL DEFAULT '0' COMMENT '用户状态',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id_idx` (`role_id`),
  KEY `status_code_idx` (`status_code`),
  CONSTRAINT `role_id` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `status_code` FOREIGN KEY (`status_code`) REFERENCES `user_status` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8 COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (0000000015,'测试','XYer5pNJzzBxlBtE1vF0NE44qautZXLZLlnpXWSni8w=','8fd372fb-609a-4b4a-bcbd-022cb38132b4',1,0,'2017-08-12 08:09:31','2017-08-12 13:57:26'),(0000000019,'测试2','Fd7X8Xu/bSNSw56iT/GwSSfq3j10h7wDcAgFXA13OY0=','4dc50f07-272d-4a84-acca-484aefa4fed1',1,0,'2017-08-13 00:40:57','2017-08-13 00:40:57'),(0000000020,'测试用户','oJCFjMUYI5aHLoO5Afs27XSn/Pj8DIjlWrL+DSu/050=','2b5eced2-e7d5-4fea-81f9-116f9b22cdb7',1,0,'2017-08-19 12:56:50','2017-08-19 12:56:50'),(0000000025,'13','nL3ga7f4Vi5IiwrgA4LFaW2Z5bpLPtQ5XZvK6fHndJw=','fdd58586-707f-4aec-9216-39618eca4e97',1,0,'2017-08-19 14:58:00','2017-08-19 14:58:00'),(0000000053,'测试3','C/gcfDLHdjbWlbUNEMlRR3eCMU414u9nZxs+Xx3pwW0=','90e9f868-514a-444c-a920-a94bde33cd15',1,0,'2017-08-19 15:30:22','2017-08-19 15:30:22');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_status`
--

DROP TABLE IF EXISTS `user_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_status` (
  `code` int(1) unsigned NOT NULL COMMENT '状态代码',
  `name` varchar(10) NOT NULL COMMENT '状态名',
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户状态表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_status`
--

LOCK TABLES `user_status` WRITE;
/*!40000 ALTER TABLE `user_status` DISABLE KEYS */;
INSERT INTO `user_status` VALUES (0,'正常');
/*!40000 ALTER TABLE `user_status` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-08-26  0:26:43
