const winston = require('winston');
const { combine, timestamp, printf, colorize, errors, json } = winston.format;

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
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Defines the default logging level (can be overridden by LOG_LEVEL env variable).
 */
const logLevel = process.env.LOG_LEVEL || 'debug';

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

/**
 * Logger instance using Winston.
 * Currently logs only to the console. File logging can be added later.
 */
const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  transports: [consoleTransport],
  defaultMeta: { service: 'blog-api' }
});

module.exports = logger;