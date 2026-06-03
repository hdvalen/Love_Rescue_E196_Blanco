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

  const columns = [
    'ADD COLUMN housing_type VARCHAR(50) AFTER foto_url',
    'ADD COLUMN has_patio TINYINT(1) DEFAULT 0 AFTER housing_type',
    'ADD COLUMN hours_alone VARCHAR(50) AFTER has_patio',
    'ADD COLUMN experience TEXT AFTER hours_alone',
    'ADD COLUMN family_composition VARCHAR(200) AFTER experience',
  ];

  for (const col of columns) {
    try {
      await conn.execute(`ALTER TABLE usuario ${col}`);
      console.log(`OK: ${col}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`Skip (exists): ${col}`);
      } else {
        console.error(`Error: ${col}`, e.message);
      }
    }
  }

  await conn.end();
}

run().catch(err => console.error('Error:', err.message));
