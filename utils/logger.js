const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
    const rawLevel = level.replace(/\u001b\[.*?m/g, '');
    const upperLevel = rawLevel.toUpperCase();
    return `${timestamp} [${upperLevel}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp(),
        customFormat,
        colorize({ all: true }) // Apply color after formatting
    ),
    transports: [new winston.transports.Console()]
});

module.exports = logger;