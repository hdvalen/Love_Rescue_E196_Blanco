const sequelize = require('../src/config/db');

async function killStuckThreads() {
    await sequelize.authenticate();
    const [threads] = await sequelize.query(
        "SELECT id, user, host, db, command, time, state, info FROM information_schema.processlist WHERE db = 'adopcion_mascotas' AND command != 'Sleep'"
    );
    console.log('Active threads:', threads.length);
    threads.forEach(t => console.log('  id:', t.id, 'command:', t.command, 'time:', t.time));
    
    for (const t of threads) {
        if (t.id) {
            try {
                await sequelize.query(`KILL ${t.id}`);
                console.log('Killed thread:', t.id);
            } catch(e) {
                console.log('Kill failed:', t.id, e.message);
            }
        }
    }
    
    await sequelize.close();
}

killStuckThreads().catch(e => console.log(e.message));
