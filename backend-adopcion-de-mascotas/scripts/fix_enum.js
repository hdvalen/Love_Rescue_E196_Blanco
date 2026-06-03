require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  await conn.execute("ALTER TABLE solicitud MODIFY COLUMN estado_solicitud ENUM('PENDIENTE','EN_EVALUACION','APROBADA','RECHAZADA') DEFAULT 'PENDIENTE'");
  console.log('ENUM actualizado correctamente');
  await conn.end();
}

run().catch(err => console.error('Error:', err.message));
