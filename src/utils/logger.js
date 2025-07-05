const winston = require('winston');
const path = require('path');
const { constants } = require('../config');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Custom human-readable format for console output in development.
 * This function defines how log messages will appear in the console during development.
 * It ensures stack traces for errors are clearly visible.
 *
 * @param {object} info - The log information object (contains level, message, timestamp, stack, etc.).
 * @returns {string} The formatted log string.
 */
const devConsoleFormat = printf(info => {
    // Construct the basic log message.
    let output = `${info.timestamp} [${info.level}]: ${info.message}`;

    // If a stack trace is present (e.g., for 'error' level logs), append it on a new line.
    if (info.stack) {
        output += `\n${info.stack}`;
    }
    return output;
});

// Determine the current environment. This is crucial for applying environment-specific logging configurations.
const isProduction = process.env.NODE_ENV === 'production';

// Set the overall log level for the application. It can be overridden by an environment variable.
const logLevel = process.env.LOG_LEVEL || 'debug';

// Initialize an array to hold all the Winston transports (console, files, etc.).
const transports = [];


// --------------------- CONSOLE TRANSPORT CONFIGURATION ---------------------


// This transport handles logging output to the console.
transports.push(
    new winston.transports.Console({
        level: logLevel, // The level at which logs are processed by this transport.
        format: isProduction
            ? combine( // Production console: Logs are in JSON format for easier parsing by log aggregators.
                  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Consistent ISO 8601 timestamp.
                  errors({ stack: true }), // Ensures stack traces are included for errors.
                  json() // Outputs the log entry as a JSON string.
              )
            : combine( // Development console: Logs are human-readable with colors for developer convenience.
                  colorize({ all: true }), // Applies color to the entire log message.
                  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Consistent timestamp.
                  errors({ stack: true }), // Includes stack traces.
                  devConsoleFormat // Uses our custom human-readable format.
              )
    })
);


// --------------------- FILE TRANSPORTS CONFIGURATION ---------------------


// We check if it's production or if 'LOG_TO_FILES' environment variable is explicitly 'true'.
/*if (isProduction || process.env.LOG_TO_FILES === 'true') {
    // Define the directory where log files will be stored.
    const logDir = path.join(__dirname, constants.LOGS_DIRECTORY);

    // 1. Error Log File: Dedicated file for 'error' level logs.
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'), // Path to the error log file.
            level: 'error', // This transport will only process logs at 'error' level.
            format: combine( // All file logs are in JSON format for machine readability and parsing.
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                //json()
            )
        })
    );

    // 2. Combined Log File: Catches all logs at 'info' level and above.
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'), // Path to the combined log file.
            level: 'info', // This transport will process logs at 'info', 'warn', and 'error' levels.
            format: combine( // JSON format for consistency with other file logs.
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                //json()
            )
        })
    );
}*/


// --------------------- Logger Configuration ---------------------


const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: transports, // Assign the configured transports to the logger.

    /**
     * defaultMeta:
     * This allows you to attach common metadata to every log entry automatically.
     */
    defaultMeta: { service: 'blog-api' },

    /**
     * Exception Handling:
     * The logger will catch uncaught exceptions, preventing the application from crashing.
     */
    /*exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, constants.LOGS_DIRECTORY, 'exceptions.log'),
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                //json()
            )
        })
    ],

    /**
     * Rejection Handling:
     * Similar to exception handlers, this catches unhandled promise rejections, it ensures no errors are silently dropped.
     */
    /*rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, constants.LOGS_DIRECTORY, 'rejections.log'),
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                //json()
            )
        })
    ]*/
});

module.exports = logger;