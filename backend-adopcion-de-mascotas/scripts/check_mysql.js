const sequelize = require('../src/config/db');

async function check() {
    await sequelize.authenticate();
    const [trx] = await sequelize.query('SELECT trx_id, trx_state, trx_started FROM information_schema.innodb_trx');
    console.log('Active transactions:', trx.length);
    trx.forEach(t => console.log('  id:', t.trx_id, 'state:', t.trx_state, 'started:', t.trx_started));
    
    const [threads] = await sequelize.query("SELECT id, user, command, time, state FROM information_schema.processlist WHERE db = 'adopcion_mascotas'");
    console.log('Threads:', threads.length);
    threads.forEach(t => console.log('  id:', t.id, 'command:', t.command, 'time:', t.time, 'state:', t.state));
    
    await sequelize.close();
}

check().catch(e => console.log(e.message));
