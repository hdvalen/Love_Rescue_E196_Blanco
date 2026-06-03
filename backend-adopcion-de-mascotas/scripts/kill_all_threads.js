const sequelize = require('../src/config/db');

async function killAll() {
    await sequelize.authenticate();
    
    // Get all non-sleeping threads for our database
    const [threads] = await sequelize.query("SELECT id, user, command, time FROM information_schema.processlist WHERE db = 'adopcion_mascotas' AND id != CONNECTION_ID()");
    console.log('Threads to kill:', threads.length);
    
    for (const t of threads) {
        try {
            await sequelize.query(`KILL ${t.id}`);
            console.log('Killed thread:', t.id);
        } catch(e) {
            console.log('Kill failed for', t.id, ':', e.message);
        }
    }
    
    // Check remaining transactions
    const [trx] = await sequelize.query('SELECT trx_id, trx_state, trx_started FROM information_schema.innodb_trx');
    console.log('Remaining transactions:', trx.length);
    
    await sequelize.close();
}

killAll().catch(e => console.log(e.message));
