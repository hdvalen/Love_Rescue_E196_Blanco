-- =============================================================
-- Rollback v2 — AdoptaMe
-- Revierte TODOS los cambios de migracion_v2.sql
-- ADVERTENCIA: Recrea tabla visita (vacía) pero NO recupera
--              columnas eliminadas ni tipos originales.
-- =============================================================

-- 7. Restaurar tabla visita
CREATE TABLE `visita` (
  `id_visita` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `fecha_visita` datetime DEFAULT NULL,
  `tipo_visita` enum('VIRTUAL','PRESENCIAL') DEFAULT NULL,
  `estado_visita` enum('PENDIENTE','REALIZADA','CANCELADA') DEFAULT 'PENDIENTE',
  `observaciones` text,
  PRIMARY KEY (`id_visita`),
  KEY `fk_visita_solicitud` (`id_solicitud`)
) ENGINE=InnoDB;

-- Migrar datos de vuelta desde seguimiento (solo tipo='VISITA')
INSERT INTO visita (id_solicitud, fecha_visita, tipo_visita, observaciones, estado_visita)
SELECT id_solicitud, fecha_seguimiento, tipo_visita, observaciones,
  CASE estado_seguimiento
    WHEN 'REALIZADO' THEN 'REALIZADA'
    WHEN 'CANCELADO' THEN 'CANCELADA'
    ELSE 'PENDIENTE'
  END
FROM seguimiento WHERE tipo = 'VISITA';

-- Quitar tipo_visita de seguimiento
ALTER TABLE seguimiento DROP COLUMN tipo_visita;

-- 6. Remover campos de notificacion
ALTER TABLE notificacion
  DROP FOREIGN KEY fk_notif_remitente,
  DROP INDEX idx_notif_remitente,
  DROP COLUMN remitente_id,
  DROP COLUMN accion_url,
  DROP COLUMN fecha_leido;

-- 5. Remover FKs de favorito
ALTER TABLE favorito
  DROP FOREIGN KEY fk_favorito_usuario,
  DROP FOREIGN KEY fk_favorito_mascota,
  DROP INDEX idx_favorito_usuario,
  DROP INDEX idx_favorito_mascota;

-- 4. Remover id_autor de solicitud_nota
ALTER TABLE solicitud_nota
  DROP FOREIGN KEY fk_nota_id_autor,
  DROP INDEX idx_nota_id_autor,
  DROP COLUMN id_autor;

-- 3. Revertir solicitud_cita (TIME → VARCHAR)
-- ADVERTENCIA: pierde segundos si los hay
ALTER TABLE solicitud_cita
  DROP FOREIGN KEY fk_cita_creado_por,
  DROP INDEX idx_cita_creado_por;
ALTER TABLE solicitud_cita
  MODIFY COLUMN hora_inicio VARCHAR(10),
  MODIFY COLUMN hora_fin VARCHAR(10);

-- 2. Revertir solicitud (JSON → TEXT)
ALTER TABLE solicitud
  DROP FOREIGN KEY fk_solicitud_respondido,
  DROP INDEX idx_solicitud_respondido,
  DROP COLUMN respondido_por,
  DROP COLUMN fecha_respuesta;
ALTER TABLE solicitud
  MODIFY COLUMN datos_adoptante TEXT;

-- 1. Remover columnas de usuario
ALTER TABLE usuario
  DROP COLUMN refresh_token,
  DROP COLUMN last_login,
  DROP COLUMN email_verified_at;
