require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const uploadsDir = path.join(__dirname, '..', 'uploads');

  const [docs] = await conn.execute('SELECT id_doc, nombre_archivo FROM solicitud_documento WHERE estado_revision = ?', ['PENDIENTE']);
  console.log('Documentos PENDIENTE encontrados:', docs.length);

  let deleted = 0;
  for (const d of docs) {
    if (!d.nombre_archivo) {
      await conn.execute('DELETE FROM solicitud_documento WHERE id_doc = ?', [d.id_doc]);
      console.log(' Eliminado id_doc=' + d.id_doc + ' (sin archivo)');
      deleted++;
      continue;
    }
    const filePath = path.join(uploadsDir, d.nombre_archivo);
    if (!fs.existsSync(filePath)) {
      await conn.execute('DELETE FROM solicitud_documento WHERE id_doc = ?', [d.id_doc]);
      console.log(' Eliminado id_doc=' + d.id_doc + ' archivo="' + d.nombre_archivo + '" (no existe en disco)');
      deleted++;
    } else {
      console.log(' Mantenido id_doc=' + d.id_doc + ' archivo="' + d.nombre_archivo + '" (existe en disco)');
    }
  }

  console.log('Total eliminados:', deleted);
  await conn.end();
}

run().catch(e => console.error('Error:', e.message));
