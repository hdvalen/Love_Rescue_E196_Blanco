const winston = require('winston');

const transports = [];

if (process.env.NODE_ENV === 'production') {
    transports.push(
        new winston.transports.Console()
    );
} else {
    const path = require('path');

    const logDir = path.join(__dirname, '../../logs');

    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log')
        }),
        new winston.transports.Console()
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports
});

module.exports = logger;
