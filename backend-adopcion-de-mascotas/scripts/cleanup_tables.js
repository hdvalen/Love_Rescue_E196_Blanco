require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  await conn.execute("ALTER TABLE solicitud MODIFY COLUMN estado_solicitud ENUM('PENDIENTE','EN_EVALUACION','APROBADA','RECHAZADA','EN_SEGUIMIENTO') DEFAULT 'PENDIENTE'");
  console.log('ENUM actualizado');

  // Find all FKs referencing solicitud_adopcion
  const [rows] = await conn.execute(`
    SELECT CONSTRAINT_NAME, TABLE_NAME
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE REFERENCED_TABLE_NAME = 'solicitud_adopcion'
      AND CONSTRAINT_SCHEMA = DATABASE()
  `);

  for (const row of rows) {
    try {
      await conn.execute(`ALTER TABLE \`${row.TABLE_NAME}\` DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
      console.log('FK eliminada:', row.CONSTRAINT_NAME, 'de', row.TABLE_NAME);
    } catch (e) {
      console.log('Error:', e.message);
    }
  }

  await conn.execute("DROP TABLE IF EXISTS documento_adopcion");
  await conn.execute("DROP TABLE IF EXISTS solicitud_adopcion");
  console.log('Tablas eliminadas');

  await conn.end();
}

run().catch(err => console.error('Error:', err.message));
