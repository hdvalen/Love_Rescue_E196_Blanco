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

  try {
    await conn.execute("ALTER TABLE solicitud ADD COLUMN datos_adoptante TEXT AFTER respuesta");
    console.log('Columna datos_adoptante agregada');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('La columna ya existe');
    } else {
      throw e;
    }
  }

  await conn.end();
}

run().catch(err => console.error('Error:', err.message));
