const levels = {
    info: console.info,
    warning: console.warn,
    error: console.error,
    debug: console.debug,
    log: console.log,
};

/**
 * Logs a message at the specified level and optionally handles errors via an HTTP response.
 *
 * @param {Object} options - Configuration object.
 * @param {string} options.msg - The message to log.
 * @param {'info' | 'warning' | 'error' | 'debug' | 'log'} [options.level='info'] - The type of log message.
 * @param {Object} [options.response=null] - Express response object (optional). Required if using error handling.
 * @param {string} [options.error=null] - Optional error message to throw and send in the HTTP response.
 * @param {number} [options.statusCode=400] - HTTP status code to send if an error is thrown.
 *
 * @throws {Error} Throws an error with the provided error message if `error` and `response` are given.
 *
 * @example
 * logMessage({ msg: 'User created', level: 'info' });
 *
 * @example
 * logMessage({
 *   msg: 'Invalid credentials',
 *   level: 'error',
 *   response: res,
 *   error: 'Authentication failed',
 *   statusCode: 401
 * });
 */
const logMessage = ({
    msg,
    level = 'info',
    response = null,
    error = null,
    statusCode = null
}) => {
    if(msg) {
        const logFn = levels[level] || console.log;

        logFn(`[${level.toUpperCase()}]: ${msg}`);
    }

    if (error && response) {
        response.status(statusCode || 400); // Default to 400 if not given
        throw new Error(error);
    }
};

module.exports = { logMessage };