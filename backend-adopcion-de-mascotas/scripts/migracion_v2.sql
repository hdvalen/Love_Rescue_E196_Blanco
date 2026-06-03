-- =============================================================
-- Migración v2 — AdoptaMe
-- Mejoras: seguridad, normalización, rendimiento
-- Compatible con sync({}) — sin alter:true
-- =============================================================

-- ====================================
-- 1. USUARIO: nuevos campos
-- ====================================
ALTER TABLE usuario
  ADD COLUMN email_verified_at DATETIME NULL AFTER foto_url,
  ADD COLUMN last_login DATETIME NULL AFTER email_verified_at,
  ADD COLUMN refresh_token VARCHAR(500) NULL AFTER last_login;

-- ====================================
-- 2. SOLICITUD: datos_adoptante → JSON + nuevos campos
-- ====================================
-- 2a. No hay datos actuales, pero por seguridad validamos
UPDATE solicitud SET datos_adoptante = NULL
WHERE datos_adoptante IS NOT NULL
  AND datos_adoptante != ''
  AND NOT (JSON_VALID(datos_adoptante) OR datos_adoptante IS NULL);

-- 2b. Cambiar columna a JSON nativo
ALTER TABLE solicitud
  MODIFY COLUMN datos_adoptante JSON DEFAULT NULL;

-- 2c. Agregar campos de respuesta
ALTER TABLE solicitud
  ADD COLUMN fecha_respuesta DATETIME NULL AFTER respuesta,
  ADD COLUMN respondido_por INT NULL AFTER fecha_respuesta,
  ADD INDEX idx_solicitud_respondido (respondido_por),
  ADD CONSTRAINT fk_solicitud_respondido
    FOREIGN KEY (respondido_por) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ====================================
-- 3. SOLICITUD CITA: VARCHAR → TIME + FK
-- ====================================
-- Las horas existentes ("16:20") son compatibles con TIME
ALTER TABLE solicitud_cita
  MODIFY COLUMN hora_inicio TIME NULL,
  MODIFY COLUMN hora_fin TIME NULL;

ALTER TABLE solicitud_cita
  ADD INDEX idx_cita_creado_por (creado_por),
  ADD CONSTRAINT fk_cita_creado_por
    FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ====================================
-- 4. SOLICITUD NOTA: id_autor FK
-- (se mantiene autor VARCHAR para display name existente)
-- ====================================
ALTER TABLE solicitud_nota
  ADD COLUMN id_autor INT NULL AFTER autor,
  ADD INDEX idx_nota_id_autor (id_autor),
  ADD CONSTRAINT fk_nota_id_autor
    FOREIGN KEY (id_autor) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ====================================
-- 5. FAVORITOS: agregar FK faltantes
-- ====================================
-- Limpiar posibles huérfanos antes de crear FKs
DELETE f FROM favorito f
  LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
  WHERE u.id_usuario IS NULL;

DELETE f FROM favorito f
  LEFT JOIN mascota m ON f.id_mascota = m.id_mascota
  WHERE m.id_mascota IS NULL;

ALTER TABLE favorito
  ADD INDEX idx_favorito_usuario (id_usuario),
  ADD INDEX idx_favorito_mascota (id_mascota),
  ADD CONSTRAINT fk_favorito_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_favorito_mascota
    FOREIGN KEY (id_mascota) REFERENCES mascota(id_mascota)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ====================================
-- 6. NOTIFICACIONES: nuevos campos
-- ====================================
ALTER TABLE notificacion
  ADD COLUMN fecha_leido DATETIME NULL AFTER leido,
  ADD COLUMN accion_url VARCHAR(500) NULL AFTER fecha_leido,
  ADD COLUMN remitente_id INT NULL AFTER accion_url,
  ADD INDEX idx_notif_remitente (remitente_id),
  ADD CONSTRAINT fk_notif_remitente
    FOREIGN KEY (remitente_id) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ====================================
-- 7. SEGUIMIENTO: fusionar visita
-- ====================================
-- 7a. Agregar tipo_visita a seguimiento
ALTER TABLE seguimiento
  ADD COLUMN tipo_visita ENUM('VIRTUAL','PRESENCIAL') NULL AFTER tipo;

-- 7b. Migrar datos de visita (vacíos actualmente, pero script listo)
INSERT INTO seguimiento (id_solicitud, id_usuario, fecha_seguimiento, tipo, tipo_visita, descripcion, observaciones, estado_seguimiento)
SELECT
  v.id_solicitud,
  s.id_usuario,
  v.fecha_visita,
  'VISITA',
  v.tipo_visita,
  COALESCE(v.observaciones, 'Visita registrada'),
  v.observaciones,
  CASE v.estado_visita
    WHEN 'REALIZADA' THEN 'REALIZADO'
    WHEN 'CANCELADA' THEN 'CANCELADO'
    ELSE 'PENDIENTE'
  END
FROM visita v
JOIN solicitud s ON v.id_solicitud = s.id_solicitud;

-- 7c. Eliminar tabla visita
DROP TABLE IF EXISTS visita;
