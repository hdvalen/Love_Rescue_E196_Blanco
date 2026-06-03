CREATE TABLE IF NOT EXISTS solicitud_historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_solicitud INT NOT NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  usuario_responsable INT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  motivo TEXT,
  INDEX idx_historial_solicitud (id_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
