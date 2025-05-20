const levels = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    log: console.log,
};

/**
 * Handles message logging, status code resposes and error messages.
 * @param {string} msg The message to be logged.
 * @param {string} level The level of the log message.
 * @param {object} response The response object.
 * @param {string} error The error message.
 * @param {number} statusCode The status code for the response.
 * 
 */
const logMessage = ({
    msg,
    level = 'info',
    response = null,
    error = null,
    statusCode = null
}) => {
    const logFn = levels[level] || console.log;

    logFn(`[${level.toUpperCase()}]: ${msg}`);

    if (error && response) {
        response.status(statusCode);
        throw new Error(error);
    }
};

module.exports = { logMessage };