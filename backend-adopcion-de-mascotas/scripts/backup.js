const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `backup_${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '3306';
const dbName = process.env.DB_NAME || 'adopcion_mascotas';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || '';

const mysqldump = process.platform === 'win32'
    ? `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"`
    : 'mysqldump';

const command = `${mysqldump} -h ${dbHost} -P ${dbPort} -u ${dbUser}${dbPass ? ` -p${dbPass}` : ''} ${dbName}`;

console.log(`Iniciando backup: ${dbname} -> ${filepath}`);

const stream = fs.createWriteStream(filepath);
const child = exec(command);

child.stdout.pipe(stream);

child.stderr.on('data', (data) => {
    console.error(data.toString());
});

stream.on('finish', () => {
    const size = fs.statSync(filepath).size;
    console.log(`Backup completado: ${filepath} (${(size / 1024).toFixed(1)} KB)`);

    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup_'))
        .sort();

    while (files.length > 7) {
        const old = files.shift();
        fs.unlinkSync(path.join(backupDir, old));
        console.log(`Backup antiguo eliminado: ${old}`);
    }

    process.exit(0);
});

child.on('error', (err) => {
    console.error('Error ejecutando mysqldump:', err.message);
    process.exit(1);
});
