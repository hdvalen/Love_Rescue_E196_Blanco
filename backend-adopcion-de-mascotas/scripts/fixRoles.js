require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

async function main() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    { host: process.env.DB_HOST, dialect: 'mysql', logging: false }
  );
  await sequelize.authenticate();
  await sequelize.query("UPDATE rol SET nombre_rol = '_TEMP_' WHERE id_rol = 1");
  await sequelize.query("UPDATE rol SET nombre_rol = 'ADOPTANTE' WHERE id_rol = 3");
  await sequelize.query("UPDATE rol SET nombre_rol = 'ADMINISTRADOR' WHERE id_rol = 1");
  const [rows] = await sequelize.query('SELECT * FROM rol ORDER BY id_rol');
  console.table(rows);
  console.log('Roles actualizados correctamente');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
