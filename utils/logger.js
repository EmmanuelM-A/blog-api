const winston = require('winston');

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        colorize(), // Adds colour to the level names
        timestamp(),
        customFormat
    ),
    transports: [new winston.transports.Console()]
});

module.exports = logger;