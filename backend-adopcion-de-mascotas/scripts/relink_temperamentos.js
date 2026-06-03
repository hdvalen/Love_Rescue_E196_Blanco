const s = require('../src/config/db');
(async () => {
    await s.authenticate();

    // get all distinct temperamento values from existing pets
    const [rows] = await s.query(
        `SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(m.temperamento, ',', n.n), ',', -1)) as val
         FROM mascota m
         JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) n
           ON CHAR_LENGTH(m.temperamento) - CHAR_LENGTH(REPLACE(m.temperamento, ',', '')) >= n.n - 1
         WHERE m.temperamento IS NOT NULL AND m.temperamento != ''`
    );
    const [rows2] = await s.query(
        `SELECT DISTINCT TRIM(temperamento) as val FROM mascota
         WHERE temperamento IS NOT NULL AND temperamento != ''
           AND temperamento NOT LIKE '%,%'`
    );
    const all = [...new Set([...rows.map(r => r.val), ...rows2.map(r => r.val)])].filter(Boolean);
    console.log('Unique temperamentos found:', all.join(', '));

    for (const name of all) {
        await s.query('INSERT IGNORE INTO temperamento (nombre) VALUES (?)', { replacements: [name] });
    }

    const [pets] = await s.query(
        `SELECT id_mascota, temperamento FROM mascota WHERE temperamento IS NOT NULL AND temperamento != ''`
    );
    let linked = 0;
    for (const p of pets) {
        const names = p.temperamento.split(',').map(t => t.trim()).filter(Boolean);
        for (const n of names) {
            const [t] = await s.query('SELECT id_temperamento FROM temperamento WHERE nombre = ?', { replacements: [n] });
            if (t.length) {
                await s.query(
                    'INSERT IGNORE INTO mascota_temperamento (id_mascota, id_temperamento) VALUES (?, ?)',
                    { replacements: [p.id_mascota, t[0].id_temperamento] }
                );
            }
        }
        linked++;
    }
    console.log('Linked', linked, 'pets');
    await s.close();
})().catch(e => { console.error(e); process.exit(1); });
