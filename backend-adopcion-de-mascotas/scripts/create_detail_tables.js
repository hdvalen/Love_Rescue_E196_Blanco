require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const tables = [
    `CREATE TABLE IF NOT EXISTS solicitud_nota (
      id_nota INT AUTO_INCREMENT PRIMARY KEY,
      id_solicitud INT NOT NULL,
      texto TEXT NOT NULL,
      visibilidad ENUM('PRIVADA','COMPARTIDA') DEFAULT 'PRIVADA',
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      autor VARCHAR(150),
      estado TINYINT DEFAULT 1,
      FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS solicitud_tarea (
      id_tarea INT AUTO_INCREMENT PRIMARY KEY,
      id_solicitud INT NOT NULL,
      texto VARCHAR(500) NOT NULL,
      completada TINYINT(1) DEFAULT 0,
      estado TINYINT DEFAULT 1,
      FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS solicitud_cita (
      id_cita INT AUTO_INCREMENT PRIMARY KEY,
      id_solicitud INT NOT NULL,
      fecha DATE NOT NULL,
      hora_inicio VARCHAR(10) NOT NULL,
      hora_fin VARCHAR(10) NOT NULL,
      modalidad VARCHAR(50) DEFAULT 'Presencial',
      estado ENUM('PENDIENTE','ACEPTADA','RECHAZADA') DEFAULT 'PENDIENTE',
      creado_por INT,
      estado_registro TINYINT DEFAULT 1,
      FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS solicitud_documento (
      id_doc INT AUTO_INCREMENT PRIMARY KEY,
      id_solicitud INT NOT NULL,
      nombre VARCHAR(200) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      nombre_archivo VARCHAR(255),
      tamano INT,
      estado_revision ENUM('PENDIENTE','APROBADO','RECHAZADO') DEFAULT 'PENDIENTE',
      comentario_rechazo TEXT,
      fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
      estado TINYINT DEFAULT 1,
      FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS solicitud_evaluacion (
      id_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
      id_solicitud INT NOT NULL UNIQUE,
      entrevista TINYINT(1) DEFAULT 0,
      visita TINYINT(1) DEFAULT 0,
      documentos_verificados TINYINT(1) DEFAULT 0,
      contrato_aceptado TINYINT(1) DEFAULT 0,
      contrato_fecha DATETIME,
      contrato_ip VARCHAR(50),
      estado TINYINT DEFAULT 1,
      FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud) ON DELETE CASCADE
    )`,
  ];

  for (const sql of tables) {
    try {
      await conn.execute(sql);
      console.log('Tabla creada:', sql.split('\n')[0].replace('CREATE TABLE IF NOT EXISTS ', '').trim());
    } catch (e) {
      console.error('Error:', e.message);
    }
  }

  await conn.end();
}

run().catch(err => console.error('Error:', err.message));
