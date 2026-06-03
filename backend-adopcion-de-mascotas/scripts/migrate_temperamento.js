const sequelize = require('../src/config/db');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Conectado a la base de datos');

        // 1. Crear tabla temperamento
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS temperamento (
                id_temperamento INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE
            );
        `);
        console.log('Tabla temperamento creada');

        // 2. Crear tabla pivot mascota_temperamento
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS mascota_temperamento (
                id_mascota INT NOT NULL,
                id_temperamento INT NOT NULL,
                PRIMARY KEY (id_mascota, id_temperamento),
                FOREIGN KEY (id_mascota) REFERENCES mascota(id_mascota) ON DELETE CASCADE,
                FOREIGN KEY (id_temperamento) REFERENCES temperamento(id_temperamento) ON DELETE CASCADE
            );
        `);
        console.log('Tabla mascota_temperamento creada');

        // 3. Extraer todos los temperamentos únicos de los datos existentes + defaults
        const [raw] = await sequelize.query(
            `SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(m.temperamento, ',', n.n), ',', -1)) as val
             FROM mascota m
             JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) n
               ON CHAR_LENGTH(m.temperamento) - CHAR_LENGTH(REPLACE(m.temperamento, ',', '')) >= n.n - 1
             WHERE m.temperamento IS NOT NULL AND m.temperamento != ''`
        );
        const [raw2] = await sequelize.query(
            `SELECT DISTINCT TRIM(temperamento) as val FROM mascota
             WHERE temperamento IS NOT NULL AND temperamento != '' AND temperamento NOT LIKE '%,%'`
        );
        const defaults = [
            'Cariñoso', 'Juguetón', 'Sociable', 'Inteligente', 'Energético',
            'Leal', 'Curioso', 'Alegre', 'Tranquilo', 'Protector',
            'Fiel', 'Independiente', 'Dulce', 'Tierno', 'Aventurero',
            'Elegante', 'Silencioso', 'Adaptable', 'Travieso'
        ];
        const allNames = [...new Set([...defaults, ...raw.map(r => r.val), ...raw2.map(r => r.val)])].filter(Boolean);
        for (const nombre of allNames) {
            await sequelize.query(
                `INSERT IGNORE INTO temperamento (nombre) VALUES (?)`,
                { replacements: [nombre] }
            );
        }
        console.log(`${allNames.length} temperamentos insertados`);

        // 4. Migrar datos existentes de mascota.temperamento a la tabla pivot
        const [mascotas] = await sequelize.query(
            "SELECT id_mascota, temperamento FROM mascota WHERE temperamento IS NOT NULL AND temperamento != ''"
        );
        let migrated = 0;
        for (const mascota of mascotas) {
            const nombres = mascota.temperamento.split(',').map(t => t.trim()).filter(Boolean);
            for (const nombre of nombres) {
                const [rows] = await sequelize.query(
                    'SELECT id_temperamento FROM temperamento WHERE nombre = ?',
                    { replacements: [nombre] }
                );
                if (rows.length) {
                    await sequelize.query(
                        `INSERT IGNORE INTO mascota_temperamento (id_mascota, id_temperamento) VALUES (?, ?)`,
                        { replacements: [mascota.id_mascota, rows[0].id_temperamento] }
                    );
                }
            }
            migrated++;
        }
        console.log(`${migrated} mascotas migradas a mascota_temperamento`);

        console.log('Migración completada');
        process.exit(0);
    } catch (error) {
        console.error('Error en migración:', error);
        process.exit(1);
    }
}

migrate();
