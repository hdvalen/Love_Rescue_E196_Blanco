require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const [tables] = await conn.execute("SHOW TABLES");
  console.log('Tablas en la BD:');
  tables.forEach(t => console.log(' -', Object.values(t)[0]));

  // Check for solicitud tables
  for (const t of tables) {
    const name = Object.values(t)[0];
    if (name.includes('solicitud')) {
      const [cols] = await conn.execute(`DESCRIBE ${name}`);
      console.log(`\n--- ${name} ---`);
      cols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${c.Default !== null ? 'DEFAULT ' + c.Default : ''}`));
    }
  }

  await conn.end();
}
run().catch(e => console.error(e.message));
