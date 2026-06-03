-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: adopcion_mascotas
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favorito`
--

DROP TABLE IF EXISTS `favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito` (
  `id_favorito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_mascota` int NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_favorito`),
  KEY `idx_favorito_usuario` (`id_usuario`),
  KEY `idx_favorito_mascota` (`id_mascota`),
  CONSTRAINT `fk_favorito_mascota` FOREIGN KEY (`id_mascota`) REFERENCES `mascota` (`id_mascota`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foto_mascota`
--

DROP TABLE IF EXISTS `foto_mascota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foto_mascota` (
  `id_foto` int NOT NULL AUTO_INCREMENT,
  `id_mascota` int NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_foto`),
  KEY `id_mascota` (`id_mascota`),
  CONSTRAINT `foto_mascota_ibfk_1` FOREIGN KEY (`id_mascota`) REFERENCES `mascota` (`id_mascota`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fundacion`
--

DROP TABLE IF EXISTS `fundacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fundacion` (
  `id_fundacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre_fundacion` varchar(150) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `estado_aprobacion` enum('PENDIENTE','APROBADA','RECHAZADA') DEFAULT 'PENDIENTE',
  `fecha_registro` datetime DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  `redes_sociales` varchar(255) DEFAULT NULL,
  `mision` text,
  `logo_url` varchar(500) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `motivo_rechazo` text,
  PRIMARY KEY (`id_fundacion`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fundacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mascota`
--

DROP TABLE IF EXISTS `mascota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mascota` (
  `id_mascota` int NOT NULL AUTO_INCREMENT,
  `id_fundacion` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `especie` varchar(50) NOT NULL,
  `raza` varchar(100) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `tamano` enum('PEQUENO','MEDIANO','GRANDE') DEFAULT NULL,
  `sexo` enum('MACHO','HEMBRA') DEFAULT NULL,
  `esterilizado` tinyint(1) DEFAULT '0',
  `vacunado` tinyint(1) DEFAULT '0',
  `temperamento` text,
  `descripcion` text,
  `ubicacion` varchar(150) DEFAULT NULL,
  `estado_mascota` enum('DISPONIBLE','EN_PROCESO','ADOPTADO') DEFAULT 'DISPONIBLE',
  `fecha_publicacion` datetime DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  `condiciones_adopcion` text,
  PRIMARY KEY (`id_mascota`),
  KEY `id_fundacion` (`id_fundacion`),
  CONSTRAINT `mascota_ibfk_1` FOREIGN KEY (`id_fundacion`) REFERENCES `fundacion` (`id_fundacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mascota_temperamento`
--

DROP TABLE IF EXISTS `mascota_temperamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mascota_temperamento` (
  `id_mascota` int NOT NULL,
  `id_temperamento` int NOT NULL,
  PRIMARY KEY (`id_mascota`,`id_temperamento`),
  KEY `id_temperamento` (`id_temperamento`),
  CONSTRAINT `mascota_temperamento_ibfk_1` FOREIGN KEY (`id_mascota`) REFERENCES `mascota` (`id_mascota`) ON DELETE CASCADE,
  CONSTRAINT `mascota_temperamento_ibfk_2` FOREIGN KEY (`id_temperamento`) REFERENCES `temperamento` (`id_temperamento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `mensaje` text NOT NULL,
  `id_solicitud` int DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `tipo` enum('SOLICITUD','APROBACION','RECHAZO','SEGUIMIENTO','SISTEMA') DEFAULT 'SISTEMA',
  `leido` tinyint(1) DEFAULT '0',
  `fecha_leido` datetime DEFAULT NULL,
  `accion_url` varchar(500) DEFAULT NULL,
  `remitente_id` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_notificacion`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_solicitud` (`id_solicitud`),
  KEY `idx_notif_remitente` (`remitente_id`),
  CONSTRAINT `fk_notif_remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notificacion_ibfk_79` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notificacion_ibfk_80` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `perfil_adoptante`
--

DROP TABLE IF EXISTS `perfil_adoptante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil_adoptante` (
  `id_perfil` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `housing_type` varchar(50) DEFAULT NULL,
  `has_patio` tinyint(1) DEFAULT '0',
  `hours_alone` varchar(50) DEFAULT NULL,
  `experience` text,
  `family_composition` varchar(200) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_perfil`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `perfil_adoptante_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seguimiento`
--

DROP TABLE IF EXISTS `seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguimiento` (
  `id_seguimiento` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `estado` tinyint DEFAULT '1',
  `observaciones` text,
  `id_usuario` int NOT NULL,
  `fecha_seguimiento` datetime DEFAULT NULL,
  `tipo` enum('CONTACTO','VISITA','LLAMADA','CUESTIONARIO') NOT NULL,
  `tipo_visita` enum('VIRTUAL','PRESENCIAL') DEFAULT NULL,
  `descripcion` text NOT NULL,
  `estado_seguimiento` enum('PENDIENTE','REALIZADO','CANCELADO') DEFAULT 'PENDIENTE',
  `proximo_contacto` datetime DEFAULT NULL,
  PRIMARY KEY (`id_seguimiento`),
  KEY `id_solicitud` (`id_solicitud`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `seguimiento_ibfk_91` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seguimiento_ibfk_92` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud`
--

DROP TABLE IF EXISTS `solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_mascota` int NOT NULL,
  `id_fundacion` int NOT NULL,
  `fecha_solicitud` datetime DEFAULT NULL,
  `estado_solicitud` enum('PENDIENTE','EN_EVALUACION','APROBADA','RECHAZADA','EN_SEGUIMIENTO','ADOPTADA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
  `motivo` text NOT NULL,
  `respuesta` text,
  `fecha_respuesta` datetime DEFAULT NULL,
  `respondido_por` int DEFAULT NULL,
  `datos_adoptante` json DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_solicitud`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_mascota` (`id_mascota`),
  KEY `id_fundacion` (`id_fundacion`),
  KEY `idx_solicitud_respondido` (`respondido_por`),
  CONSTRAINT `fk_solicitud_respondido` FOREIGN KEY (`respondido_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `solicitud_ibfk_158` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `solicitud_ibfk_159` FOREIGN KEY (`id_mascota`) REFERENCES `mascota` (`id_mascota`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `solicitud_ibfk_160` FOREIGN KEY (`id_fundacion`) REFERENCES `fundacion` (`id_fundacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud_cita`
--

DROP TABLE IF EXISTS `solicitud_cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_cita` (
  `id_cita` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `modalidad` varchar(50) DEFAULT 'Presencial',
  `estado` enum('PENDIENTE','ACEPTADA','RECHAZADA') DEFAULT 'PENDIENTE',
  `motivo_rechazo` text,
  `creado_por` int DEFAULT NULL,
  `estado_registro` tinyint DEFAULT '1',
  PRIMARY KEY (`id_cita`),
  KEY `id_solicitud` (`id_solicitud`),
  KEY `idx_cita_creado_por` (`creado_por`),
  CONSTRAINT `fk_cita_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `solicitud_cita_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud_documento`
--

DROP TABLE IF EXISTS `solicitud_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_documento` (
  `id_doc` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `tamano` int DEFAULT NULL,
  `estado_revision` enum('PENDIENTE','APROBADO','RECHAZADO') DEFAULT 'PENDIENTE',
  `comentario_rechazo` text,
  `fecha_subida` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_doc`),
  KEY `id_solicitud` (`id_solicitud`),
  CONSTRAINT `solicitud_documento_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud_evaluacion`
--

DROP TABLE IF EXISTS `solicitud_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_evaluacion` (
  `id_evaluacion` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `entrevista` tinyint(1) DEFAULT '0',
  `visita` tinyint(1) DEFAULT '0',
  `documentos_verificados` tinyint(1) DEFAULT '0',
  `contrato_aceptado` tinyint(1) DEFAULT '0',
  `contrato_fecha` datetime DEFAULT NULL,
  `contrato_ip` varchar(50) DEFAULT NULL,
  `contrato_pdf` varchar(255) DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_evaluacion`),
  UNIQUE KEY `id_solicitud` (`id_solicitud`),
  CONSTRAINT `solicitud_evaluacion_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud_historial`
--

DROP TABLE IF EXISTS `solicitud_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) NOT NULL,
  `usuario_responsable` int DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `motivo` text,
  PRIMARY KEY (`id_historial`),
  KEY `idx_historial_solicitud` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud_nota`
--

DROP TABLE IF EXISTS `solicitud_nota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_nota` (
  `id_nota` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `texto` text NOT NULL,
  `visibilidad` enum('PRIVADA','COMPARTIDA') DEFAULT 'PRIVADA',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `autor` varchar(150) DEFAULT NULL,
  `id_autor` int DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_nota`),
  KEY `id_solicitud` (`id_solicitud`),
  KEY `idx_nota_id_autor` (`id_autor`),
  CONSTRAINT `fk_nota_id_autor` FOREIGN KEY (`id_autor`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `solicitud_nota_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitud_tarea`
--

DROP TABLE IF EXISTS `solicitud_tarea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_tarea` (
  `id_tarea` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `texto` varchar(500) NOT NULL,
  `completada` tinyint(1) DEFAULT '0',
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`id_tarea`),
  KEY `id_solicitud` (`id_solicitud`),
  CONSTRAINT `solicitud_tarea_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `temperamento`
--

DROP TABLE IF EXISTS `temperamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temperamento` (
  `id_temperamento` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_temperamento`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT NULL,
  `id_rol` int NOT NULL,
  `estado` tinyint DEFAULT '1',
  `foto_url` varchar(500) DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `refresh_token` varchar(500) DEFAULT NULL,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `refresh_token_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_password_reset_token` (`password_reset_token`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-02 21:59:37
