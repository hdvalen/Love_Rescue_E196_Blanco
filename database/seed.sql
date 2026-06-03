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
-- Dumping data for table `favorito`
--

LOCK TABLES `favorito` WRITE;
/*!40000 ALTER TABLE `favorito` DISABLE KEYS */;
INSERT INTO `favorito` VALUES (3,6,2,'2026-05-14 02:23:14'),(4,10,12,'2026-05-14 03:24:12');
/*!40000 ALTER TABLE `favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `foto_mascota`
--

LOCK TABLES `foto_mascota` WRITE;
/*!40000 ALTER TABLE `foto_mascota` DISABLE KEYS */;
INSERT INTO `foto_mascota` VALUES (49,4,'1779672284090-403b6fe5a868df5271a342bb96d6cfb3.jpg',1),(50,4,'1779672284092-8d2f2df042e47f55162fb78b1470bcf0.png',1),(51,4,'1779672284099-a5d4dbe286fc48ac3a195c03cd28ddbc.jpeg',1),(52,4,'1779672284102-f8e05efbbe73888b5157d0df17351a50.jpeg',1),(53,6,'1779672326594-c2a118f58f48249b59670345e8d0dff6.jpg',1),(54,6,'1779672326594-1ffe9c1a6df597dfba95ed6e01c03adc.jpg',1),(55,6,'1779672326595-8e7afc48d5492353ab6732a3823bfe77.jpg',1),(56,6,'1779672326597-ae454d318b8130a5fe972552ad38f1c8.jpg',1),(57,12,'1779672389318-d0f41f95fccb9a481085121bda1adba9.jpeg',1),(58,12,'1779672389319-519c54bbb3500179df00e58e94785179.jpeg',1),(59,12,'1779672389321-ebbd0c6baa5d80554e800f8d0dc48bd9.jpeg',1),(60,2,'1779672430595-043716709d64530e0da2d62c33f69620.jpeg',1),(61,2,'1779672430595-de0ec21f64675fdf8b8c9abccce9f341.jpeg',1),(62,2,'1779672430595-aed441da045d1648e7f556bbaf8f2ec6.jpeg',1),(63,3,'1779672447278-9a101c11da137f2bd1a7eaa500befd8b.jpg',1),(64,3,'1779672447279-3a6a3fe1e16429d7ed1a8cb601aeea40.jpg',1),(65,3,'1779672447280-dba3f3e82c67e5ddb70dc7ec42409760.jpg',1),(66,3,'1779672447281-3df0e2b8383a4d2df300f991463de9cc.jpg',1),(67,5,'1779672491360-fdc7779af2183eff0b7148d6accc338b.jpg',1),(68,5,'1779672491363-236cea78c042437959867e987be68e9f.jpg',1),(69,5,'1779672491366-a02da086d65283935d8d5403a403de10.jpg',1),(70,7,'1779672513476-e107a7af8fd9b1d8c7580cdde6d1073b.png',1),(71,7,'1779672513482-e64261c93ccf97ff159a9c161ef6aafb.png',1),(72,7,'1779672513491-325c4cec889f1fed456af582271dbb88.png',1),(73,7,'1779672513517-5b5cd130fd1f2caebdb7c7fb371e1a99.png',1),(74,8,'1779672553200-c54185428b221410858a886406dfa189.jpeg',1),(75,8,'1779672553200-27f31bbf149bcc694efb13571f338775.jpeg',1),(76,8,'1779672553202-271ede92c1df693de13b73ad214b1deb.jpeg',1),(77,10,'1779672594232-17a5921605f703cff322f59f01138665.jpeg',1),(78,10,'1779672594233-17bfaff0a717461e604ec0b8d64009fe.jpeg',1),(79,10,'1779672594235-b8f6ba282043a6474e9943318b0a61a5.jpeg',1),(80,9,'1779672637226-1881dc30ffea6f3cd96554fa9271b3ce.jpg',1),(81,9,'1779672637226-293d565ac2e328291907344fef11ffb7.jpg',1),(82,9,'1779672637226-e271bb66c175c3b6c0f8ed2d4386c6c0.jpg',1),(83,9,'1779672637228-0b9996ba09f59fee9678c6b94273cafe.jpg',1),(84,11,'1779672658004-353397bcf09ee47421ef8a4b8c3c5fb6.jpg',1),(85,11,'1779672658006-180ca035bdb2e98b83e0d64ffc0e78d9.jpg',1),(86,11,'1779672658011-504eeb2ee781af1590eef3d442bb1b25.jpg',1),(87,14,'1779672875103-1e1926cf52d4946489305c15b1e68f59.png',1),(88,14,'1779672875109-9f0535ae868dd9b40c57fdfbe738173b.png',1),(89,14,'1779672875113-2b676c543b08521f1776d2770afa48c0.png',1),(90,14,'1779672875120-8e658d31a3674d742d3064b37c31b68e.png',1);
/*!40000 ALTER TABLE `foto_mascota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `fundacion`
--

LOCK TABLES `fundacion` WRITE;
/*!40000 ALTER TABLE `fundacion` DISABLE KEYS */;
INSERT INTO `fundacion` VALUES (4,6,'Huellitas de Amor','','3188759123','Gir├│n','Carrera 34 # 45-30','esta es una fundacion enfocada a','APROBADA','2026-05-13 01:36:26',1,'@huellitas-amo','Nuestra misi├│n es','1780454470433-52da8cc03b521eeb5941ffc33d3fcb46.png','Santander',NULL),(5,9,' Refugio Perrocalle','','3188754210','Bucaramanga','Carrera 45 # 114-30','','APROBADA','2026-05-14 02:29:33',1,'','','1780274790780-c911e511f099aac6d7acb4a48210bfc2.png','Santander',NULL);
/*!40000 ALTER TABLE `fundacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `mascota`
--

LOCK TABLES `mascota` WRITE;
/*!40000 ALTER TABLE `mascota` DISABLE KEYS */;
INSERT INTO `mascota` VALUES (2,4,'Arenita','Gato','Criollo',2,'MEDIANO','HEMBRA',1,1,'Juguetona, Amorosa, Cari├▒osa','Arena lleg├│ siendo apenas un beb├® y en condiciones muy delicadas, su mam├í tuvo su camada en un lugar lleno de basura y en muy malas condiciones.\n\nGracias a los cuidados y al amor de su casa de acogida, sali├│ adelante y aunque ha perdido mucha visi├│n, es una jovencita feliz y llena de energ├¡a.\n\nAhora, esta peque├▒a luchadora esta lista para ser adoptada.','Bucaramanga','DISPONIBLE','2026-05-13 02:37:43',1,'hogar responsable, donde la cuiden y le den una buena vida'),(3,4,'Max','Perro','Golden Retriever',5,'GRANDE','MACHO',1,1,'Cari├▒oso, Juguet├│n, Sociable','Max es un perro incre├¡blemente cari├▒oso y juguet├│n. Le encanta correr al aire libre.','Bogot├í','DISPONIBLE','2026-05-14 02:43:31',1,'Requiere casa con patio amplio'),(4,5,'Rocky','Perro','Border Collie',3,'MEDIANO','MACHO',0,1,'Inteligente, Energ├®tico, Leal','Rocky es muy inteligente y necesita mucha actividad f├¡sica y mental.','Medell├¡n','DISPONIBLE','2026-05-14 02:43:31',1,''),(5,4,'Toby','Perro','Dachshund',1,'PEQUENO','MACHO',0,1,'Juguet├│n, Curioso, Alegre','Toby es un cachorrito lleno de energ├¡a y curiosidad.','Cali','DISPONIBLE','2026-05-14 02:43:31',1,''),(6,5,'Montana','Perro','Labrador',1,'GRANDE','HEMBRA',1,1,'Fiel, Protectora, Tranquila','Luna es una perra tranquila y protectora. Ideal para familias.','Bogot├í','DISPONIBLE','2026-05-14 02:43:31',1,''),(7,4,'Bruno','Perro','Pastor Alem├ín',2,'GRANDE','MACHO',1,1,'Inteligente, Leal, Protector','Bruno est├í bien entrenado. Busca un hogar con experiencia.','Medell├¡n','DISPONIBLE','2026-05-14 02:43:31',1,''),(8,4,'Aleix','Gato','Tabby Naranja',1,'MEDIANO','MACHO',1,1,'Independiente, Cari├▒osa, Tranquila','M├¡a disfruta de las siestas largas y los mimos. Ideal para departamentos.','Bogot├í','DISPONIBLE','2026-05-14 02:43:31',1,''),(9,5,'Nieve','Gato','Persa Blanco',1,'PEQUENO','HEMBRA',0,1,'Dulce, Juguetona, Tierna','Nieve es dulce y juguetona. Su pelo sedoso requiere cepillado regular.','Cali','DISPONIBLE','2026-05-14 02:43:31',1,''),(10,4,'Mayo','Gato','Criollo',3,'MEDIANO','MACHO',1,1,'Juguet├│n, Sociable, Aventurero','Mayo es sociable y disfruta explorar cada rinc├│n.','Medell├¡n','DISPONIBLE','2026-05-14 02:43:31',1,''),(11,5,'Stella','Gato','criollo',2,'MEDIANO','HEMBRA',1,1,'Elegante, Adaptable, Silenciosa','Stella es elegante y se adapta bien a espacios peque├▒os.','Bogot├í','DISPONIBLE','2026-05-14 02:43:31',1,''),(12,5,'Telma','Gato','Mestizo',1,'PEQUENO','HEMBRA',0,0,'Cari├▒osa, Curiosa, Traviesa','Pelusa es una gatita traviesa que llena de alegr├¡a cualquier hogar.','Medell├¡n','ADOPTADO','2026-05-14 02:43:31',1,''),(14,5,'Aquiles','Gato','criollo',2,NULL,'HEMBRA',1,1,'Sociable, Curioso, Adaptable, Juguetona','animal, bonito',NULL,'DISPONIBLE','2026-05-19 02:27:39',1,'requiere');
/*!40000 ALTER TABLE `mascota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `mascota_temperamento`
--

LOCK TABLES `mascota_temperamento` WRITE;
/*!40000 ALTER TABLE `mascota_temperamento` DISABLE KEYS */;
INSERT INTO `mascota_temperamento` VALUES (3,1),(3,2),(5,2),(10,2),(3,3),(10,3),(14,3),(4,4),(7,4),(4,5),(4,6),(7,6),(5,7),(14,7),(5,8),(7,10),(6,11),(8,12),(9,13),(10,15),(11,16),(11,18),(14,18),(2,20),(9,20),(14,20),(2,21),(2,22),(8,22),(12,22),(6,32),(6,33),(8,33),(9,36),(11,40),(12,42),(12,43);
/*!40000 ALTER TABLE `mascota_temperamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
INSERT INTO `notificacion` VALUES (1,9,'Un usuario ha solicitado adoptar a Telma',7,'Nueva solicitud de adopci├│n','SOLICITUD',1,NULL,NULL,NULL,'2026-05-31 22:56:48',1),(3,10,'Tu solicitud para la mascota ha pasado a evaluaci├│n',7,'Solicitud en evaluaci├│n','SOLICITUD',1,NULL,NULL,NULL,'2026-05-31 23:08:26',1),(4,10,'Se ha programado una cita presencial para tu solicitud de la mascota el 2026-06-01 de 09:00 a 10:00',7,'Nueva cita programada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:26:02',1),(5,9,'El adoptante ha rechazado la cita. Motivo: solo cuento con disponiblidad en horas de la tarde',7,'Cita rechazada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:28:39',1),(6,10,'Se ha programado una cita presencial para tu solicitud de la mascota el 2026-06-01 de 16:00 a 17:00',7,'Nueva cita programada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:29:13',1),(7,9,'El adoptante ha aceptado la cita programada',7,'Cita aceptada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:29:22',1),(8,10,'Se ha agregado una tarea a tu solicitud para la mascota: se debe agregar malla en el balcon del apartamento',7,'Nueva tarea pendiente','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:29:52',1),(9,9,'El adoptante ha subido 1 documento(s): Documento de Identidad',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:30:54',1),(10,9,'El adoptante ha subido 1 documento(s): Recibo de Servicios',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:31:51',1),(11,9,'El adoptante ha subido 1 documento(s): Fotos del Hogar',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:32:21',1),(12,9,'El adoptante ha subido 1 documento(s): Fotos del Hogar',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:32:26',1),(13,9,'El adoptante ha subido 1 documento(s): Fotos del Hogar',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:32:30',1),(14,9,'El adoptante ha subido 1 documento(s): Fotos del Hogar',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:32:46',1),(15,10,'Tu documento \"Documento de Identidad\" para la mascota ha sido rechazado. Motivo: Documento no cumple con los requisitos',7,'Documento rechazado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:33:16',1),(16,10,'Tu documento \"Documento de Identidad\" para la mascota ha sido rechazado. Motivo: Documento no cumple con los requisitos',7,'Documento rechazado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-05-31 23:44:32',1),(17,10,'Tu documento \"Documento de Identidad\" para la mascota ha sido rechazado. Motivo: el documento no es legible',7,'Documento rechazado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:04:20',1),(18,10,'Tu documento \"Recibo de Servicios\" para la mascota ha sido aprobado',7,'Documento aprobado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:04:23',1),(19,10,'Tu documento \"Fotos del Hogar\" para la mascota ha sido aprobado',7,'Documento aprobado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:04:23',1),(20,10,'Tu documento \"Fotos del Hogar\" para la mascota ha sido aprobado',7,'Documento aprobado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:04:24',1),(21,10,'Tu documento \"Fotos del Hogar\" para la mascota ha sido aprobado',7,'Documento aprobado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:04:25',1),(22,10,'Tu documento \"Fotos del Hogar\" para la mascota ha sido aprobado',7,'Documento aprobado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:04:25',1),(23,9,'El adoptante ha subido 1 documento(s): Documento de Identidad',7,'Nuevo documento subido','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:05:19',1),(24,10,'Tu documento \"Documento de Identidad\" para la mascota ha sido aprobado',7,'Documento aprobado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 00:06:07',1),(43,10,'┬íFelicidades! Tu solicitud para la mascota ha sido aprobada',7,'┬íSolicitud aprobada!','APROBACION',1,NULL,NULL,NULL,'2026-06-01 02:58:42',1),(44,9,'El adoptante ha aceptado el contrato de adopci├│n',7,'Contrato aceptado','APROBACION',1,NULL,NULL,NULL,'2026-06-01 02:58:56',1),(45,10,'La entrevista para la mascota ha sido completada',7,'Evaluaci├│n actualizada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 03:03:59',1),(46,10,'La visita para la mascota ha sido completada',7,'Evaluaci├│n actualizada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 03:04:02',1),(47,10,'La documentos verificados para la mascota ha sido completada',7,'Evaluaci├│n actualizada','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 03:04:04',1),(48,10,'La adopci├│n de la mascota ha sido finalizada. Bienvenido a la familia.',7,'Adopci├│n finalizada','APROBACION',1,NULL,NULL,NULL,'2026-06-01 03:05:01',1),(49,10,'La fundaci├│n ha programado un visita para el 31/7/2026. Motivo: visita post-seguimiento adopcion',7,'Nuevo seguimiento programado','SEGUIMIENTO',1,NULL,NULL,NULL,'2026-06-01 03:34:44',1);
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `perfil_adoptante`
--

LOCK TABLES `perfil_adoptante` WRITE;
/*!40000 ALTER TABLE `perfil_adoptante` DISABLE KEYS */;
INSERT INTO `perfil_adoptante` VALUES (1,10,'Apartamento',0,'4 horas','demasiada experencia','2 adultos','2026-05-15 04:45:22','2026-05-15 04:45:22'),(2,11,'Casa',1,'1-4','Mucha','2 adultos','2026-05-19 02:29:00','2026-05-19 02:31:22');
/*!40000 ALTER TABLE `perfil_adoptante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'ADMINISTRADOR'),(3,'ADOPTANTE'),(2,'FUNDACION');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `seguimiento`
--

LOCK TABLES `seguimiento` WRITE;
/*!40000 ALTER TABLE `seguimiento` DISABLE KEYS */;
INSERT INTO `seguimiento` VALUES (6,7,1,'realizar visita en un mes',9,'2026-06-01 00:00:00','CONTACTO',NULL,'Seguimiento posterior a la firma del contrato de la mascota','REALIZADO','2026-06-16 00:00:00'),(7,7,1,NULL,9,'2026-06-01 03:34:44','VISITA','PRESENCIAL','visita post-seguimiento adopcion','PENDIENTE','2026-08-01 00:00:00');
/*!40000 ALTER TABLE `seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud`
--

LOCK TABLES `solicitud` WRITE;
/*!40000 ALTER TABLE `solicitud` DISABLE KEYS */;
INSERT INTO `solicitud` VALUES (7,10,12,5,'2026-05-31 22:56:48','ADOPTADA','Quiero adoptar a la gatita Telma porque me encantan los animales y considero que puedo darle un hogar lleno de amor, cuidado y atenci├│n. Tengo el compromiso y la responsabilidad para brindarle una vida segura, tranquila y feliz. Adem├ís, estoy dispuesto/a a cubrir sus necesidades de alimentaci├│n, salud y bienestar para que crezca sana y querida.',NULL,'2026-06-01 03:05:01',9,'{\"ninos\": \"\", \"horasSolo\": \"4 horas\", \"tienePatio\": \"No\", \"experiencia\": \"demasiada experencia\", \"tipoVivienda\": \"Apartamento\", \"otrosAnimales\": \"\"}',1);
/*!40000 ALTER TABLE `solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud_cita`
--

LOCK TABLES `solicitud_cita` WRITE;
/*!40000 ALTER TABLE `solicitud_cita` DISABLE KEYS */;
INSERT INTO `solicitud_cita` VALUES (1,7,'2026-06-01','09:00:00','10:00:00','Presencial','RECHAZADA','solo cuento con disponiblidad en horas de la tarde',9,1),(2,7,'2026-06-01','16:00:00','17:00:00','Presencial','ACEPTADA',NULL,9,1);
/*!40000 ALTER TABLE `solicitud_cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud_documento`
--

LOCK TABLES `solicitud_documento` WRITE;
/*!40000 ALTER TABLE `solicitud_documento` DISABLE KEYS */;
INSERT INTO `solicitud_documento` VALUES (1,7,'Documento de Identidad','cedula','1780270254287-74f7e49885747b348aaae67362500a6c.pdf',79492,'RECHAZADO','el documento no es legible','2026-05-31 23:30:54',0),(2,7,'Recibo de Servicios','recibo','1780270311070-dcc38debd66f3afa8a5a62dc13436f54.jpeg',92571,'APROBADO',NULL,'2026-05-31 23:31:51',1),(3,7,'Fotos del Hogar','foto_hogar','1780270340898-4d3cceaefb3b51a900f47edc8003a29a.jpg',4312470,'APROBADO',NULL,'2026-05-31 23:32:20',1),(4,7,'Fotos del Hogar','foto_hogar','1780270346185-4f002729664d26d02cca7bd7e193684c.jpg',4541162,'APROBADO',NULL,'2026-05-31 23:32:26',1),(5,7,'Fotos del Hogar','foto_hogar','1780270350460-3ce5af4136084bb74255ef6d00fe5484.jpg',4650544,'APROBADO',NULL,'2026-05-31 23:32:30',1),(6,7,'Fotos del Hogar','foto_hogar','1780270365932-ef4273d0e703d0f4fa92210172f80553.jpg',5107911,'APROBADO',NULL,'2026-05-31 23:32:46',1),(7,7,'Documento de Identidad','cedula','1780272319081-bb9b5daea083bda0ede463653391d686.pdf',630001,'APROBADO',NULL,'2026-06-01 00:05:19',1);
/*!40000 ALTER TABLE `solicitud_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud_evaluacion`
--

LOCK TABLES `solicitud_evaluacion` WRITE;
/*!40000 ALTER TABLE `solicitud_evaluacion` DISABLE KEYS */;
INSERT INTO `solicitud_evaluacion` VALUES (7,7,1,1,1,1,'2026-06-01 02:58:56','::1','contrato_7_1780282736430.pdf',1);
/*!40000 ALTER TABLE `solicitud_evaluacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud_historial`
--

LOCK TABLES `solicitud_historial` WRITE;
/*!40000 ALTER TABLE `solicitud_historial` DISABLE KEYS */;
INSERT INTO `solicitud_historial` VALUES (1,7,NULL,'PENDIENTE',10,'2026-05-31 22:56:48','Quiero adoptar a la gatita Telma porque me encantan los animales y considero que puedo darle un hogar lleno de amor, cuidado y atenci├│n. Tengo el compromiso y la responsabilidad para brindarle una vida segura, tranquila y feliz. Adem├ís, estoy dispuesto/a a cubrir sus necesidades de alimentaci├│n, salud y bienestar para que crezca sana y querida.'),(2,7,'EN_EVALUACION','EN_EVALUACION',9,'2026-05-31 23:01:53',NULL),(17,7,'APROBADA','APROBADA',9,'2026-06-01 02:58:42',NULL),(18,7,'APROBADA','CONTRATO_FIRMADO',10,'2026-06-01 02:58:56','Contrato de adopci├│n aceptado electr├│nicamente'),(19,7,'ADOPTADA','ADOPTADA',9,'2026-06-01 03:05:01',NULL);
/*!40000 ALTER TABLE `solicitud_historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud_nota`
--

LOCK TABLES `solicitud_nota` WRITE;
/*!40000 ALTER TABLE `solicitud_nota` DISABLE KEYS */;
INSERT INTO `solicitud_nota` VALUES (1,7,'el adoptante debe subir los documentos para continuar con la evaluaci├│n','COMPARTIDA','2026-05-31 23:30:24',' Refugio Perrocalle',9,1),(2,7,'posible adoptante apto','PRIVADA','2026-06-01 00:07:28',' Refugio Perrocalle',9,1);
/*!40000 ALTER TABLE `solicitud_nota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `solicitud_tarea`
--

LOCK TABLES `solicitud_tarea` WRITE;
/*!40000 ALTER TABLE `solicitud_tarea` DISABLE KEYS */;
INSERT INTO `solicitud_tarea` VALUES (1,7,'se debe agregar malla en el balcon del apartamento',1,1);
/*!40000 ALTER TABLE `solicitud_tarea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `temperamento`
--

LOCK TABLES `temperamento` WRITE;
/*!40000 ALTER TABLE `temperamento` DISABLE KEYS */;
INSERT INTO `temperamento` VALUES (18,'Adaptable'),(8,'Alegre'),(21,'Amorosa'),(15,'Aventurero'),(22,'Cari├▒osa'),(1,'Cari├▒oso'),(42,'Curiosa'),(7,'Curioso'),(13,'Dulce'),(16,'Elegante'),(5,'Energ├®tico'),(11,'Fiel'),(12,'Independiente'),(4,'Inteligente'),(2,'Juguet├│n'),(20,'Juguetona'),(6,'Leal'),(10,'Protector'),(32,'Protectora'),(40,'Silenciosa'),(17,'Silencioso'),(3,'Sociable'),(36,'Tierna'),(14,'Tierno'),(33,'Tranquila'),(9,'Tranquilo'),(43,'Traviesa'),(19,'Travieso');
/*!40000 ALTER TABLE `temperamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Magdali Leon','adoptame.noreply@gmail.com','$2b$10$5E/xjehgjBK/xMYQ9sffyeWlG/BMx/aBmTLBqDOysRq1RhVX5jaJy','3001234567','2026-05-07 02:05:57',1,1,NULL,'2026-05-22 21:19:31','2026-06-03 02:41:30','d231c9dd1f061e0ac70ba7509585eb8fd3caa6d878d4d54e323739b7e3d38d23',NULL,NULL,'2026-07-03 02:41:30',NULL,NULL),(2,'Admin','admin@sistema.com','$2b$10$GTDAw634D7Yujtbfqylz9ek4spZQ28/yO1m7Pzr.ZiSFPxV7EV0dG',NULL,'2026-05-12 17:02:38',3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'Huellitas de Amor','daliileon1998@gmail.com','$2b$10$KHzjl5jHzy5/UwyTB2VWH.p44vj/nwRrACptNfDJaxAis1aYc.dn2',NULL,'2026-05-13 01:36:26',2,1,NULL,'2026-05-19 01:27:53','2026-06-03 02:40:35',NULL,NULL,NULL,NULL,NULL,NULL),(7,'Admin 4710','admin4710@test.com','$2b$10$Adv8IJngLTp3vC3Uknpkc.ZRUe2gcqoX4RSuINt7KvnR9ol2olZUa',NULL,'2026-05-13 01:47:10',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Test','test@test.com','$2b$10$LBxXrfdyurht09hj7wQCfencOnTmBAvAWoJM8EN/2xoVlYNczbvIy',NULL,'2026-05-14 02:22:01',1,1,NULL,NULL,NULL,NULL,'da05619a53f3e444698fdc11f64d6e531ce7f32300c5417a2cbe76df120422e5','2026-05-20 01:54:39',NULL,NULL,NULL),(9,' Refugio Perrocalle','magdalileon1998@gmail.com','$2b$10$VIE.U88irI9tWyEpn7OaUu05X/qTe/w7lm83.FrQJbAIynBz1UpAG',NULL,'2026-05-14 02:29:33',2,1,'1779914445526-513c198e3a86a057d2ab46d3619953f7.jpg','2026-05-18 16:27:21','2026-06-03 01:23:54','d3e74738328dcd6bd27f1ef46b04a309422abc561452affb6a9df7ef1b0137d3',NULL,NULL,'2026-07-03 01:23:54',NULL,NULL),(10,'Jhoan Mantilla','manuelleon225@hotmail.com','$2b$10$q4ayfvo9UIb8s73bdTbIZemOG53aqwr2LuiELRbjE6Yvu/JXQAAkC','3174091984','2026-05-14 03:23:52',3,1,'1779667432070-04710ae7302686f8c6c4b6ac4f38aeb1.png','2026-05-24 23:29:07','2026-06-03 02:17:59',NULL,NULL,NULL,NULL,NULL,NULL),(11,'Doris Mantilla','congregacion2001@hotmail.com','$2b$10$mCG2VUezpPopVxem4hnooevBNFJx2kgEhQ3DsdKU9qASENbC85BsG','3178297944','2026-05-18 03:46:38',3,1,NULL,'2026-05-18 03:58:23','2026-05-22 21:20:57','62b9669e2c69b022702a8516e78e3bf611e1abc7537210e816c971a56802349e',NULL,NULL,'2026-06-21 21:20:57',NULL,NULL),(12,'Test Fundacion','testfund@test.com','$2b$10$reaUkC2FJv2KPxvtV.Ah2ej4LI3rfqwUC5uhJIxUpXuLQs4uA9tVC','3000000000','2026-05-21 03:47:33',2,1,'1779665647521-f90adc1248484911e3a8f7e93fcc323e.png','2026-05-20 22:47:42','2026-05-24 23:34:07','71bb9ac5667ab6c8dcb33b2c14d1419c25c48482bff6f0b81c8746a88cc7f74a','b07d221c5a0b3bd12df182d53a7d2be931d94083c90f96b56ff95efa29c2e1fb','2026-05-22 03:47:33','2026-06-23 23:34:07',NULL,NULL),(13,'Test Adoptante','testadopt@test.com','$2b$10$EvjTsRCnrbVx6hcixYneXeGHYKJq3gbvl.6smoy5SqmRWHmeWl0zO','3000000001','2026-05-21 03:48:29',3,1,'1779666080308-65a2f9c59cf1e681f4a372b9f2fba36a.png','2026-05-20 22:48:38','2026-05-27 00:16:09','7ed31c9b6d9d5a1b8538051741ea299641361cda3764fa513cccc770f2d94841','bc39d45afafd127d6a5140dd4f0ec2457f670a1fc0ea9f6fe77279fb87c118e0','2026-05-22 03:48:29','2026-06-26 00:16:09',NULL,NULL),(14,'Admin Dashboard','admin@dashboard.com','$2b$10$v8crLTm46js.Yy1a2RFhiuWiiy7ByDKijX5vk1PRCkOxny9yjB3xK',NULL,NULL,1,1,NULL,'2026-05-21 16:38:34','2026-05-22 19:54:28','5d79ee501b5e5a7e51a10516fad7faa73709c0ea9f11ae94576a691bd86eb413',NULL,NULL,'2026-06-21 19:54:28',NULL,NULL),(15,'Evil User','evil@test.com','$2b$10$2/YpmayRqgnCHfAIMz0q3eBK4AHxR7LZ.7tWSCELW6CQ8dGpMmgra','3000000999','2026-05-21 21:50:24',3,1,NULL,'2026-05-21 16:50:25','2026-05-21 21:50:26','9aa3ea734f92f9e6f2a4732ee61c271873f225e2470c6f1e29cfe1dba61e17c2','0acfe970effcc92168c88f4b2e0dbc74b1d56a5f59e7597fdcf68a8d28004d41','2026-05-22 21:50:24','2026-06-20 21:50:26',NULL,NULL);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-02 21:59:43
