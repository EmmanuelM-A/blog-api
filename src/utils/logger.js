const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf, colorize, errors } = winston.format;
const { settings } = require('../config/configs');

const LOG_DIR = settings.logging.LOG_DIR;

/**
 * Formats log output for development.
 * Includes timestamp, log level, message, and stack trace (if present).
 */
const devConsoleFormat = printf(info => {
  let output = `${info.timestamp} [${info.level}]: ${info.message}`;
  if (info.stack) output += `\n${info.stack}`;
  return output;
});

/**
 * Formats log output as pretty JSON.
 * Useful for structured logging in production.
 */
const prettyJsonFormat = printf(info => {
  return JSON.stringify(info, null, 4);
});

/**
 * Determines if the environment is production.
 */
const isProduction = settings.server.NODE_ENV === 'production';

/**
 * Defines the default logging level (can be overridden by LOG_LEVEL env variable).
 */
const logLevel = settings.logging.LOG_LEVEL;

/**
 * Sets up the console transport (always enabled).
 */
const consoleTransport = new winston.transports.Console({
  level: logLevel,
  format: isProduction
    ? combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        prettyJsonFormat
      )
    : combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        devConsoleFormat
      )
});

const errorFileTransport = new DailyRotateFile({
  level: 'error',
  dirname: LOG_DIR,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), winston.format.json()),
});

const combinedFileTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), winston.format.json()),
});

const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
  defaultMeta: { service: 'blog-api' }
});

module.exports = logger;