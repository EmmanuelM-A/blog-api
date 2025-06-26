/**
 * This module defines the ApiError class, which is used to represent errors in the API.
 * It extends the built-in Error class to provide additional properties such as status code, error code, and details.
 */
class ApiError extends Error {
    /**
     * The ApiError class is used to create custom error objects for API responses.
     * It allows for detailed error handling by providing a message, status code, error code, and optional details.
     * All API errors are caught and handled by the global `errorHandler`.
     * 
     * @param {String} message The error message to be displayed.
     * @param {Number} status The HTTP status code associated with the error.
     * @param {String} code The error code for programmatic identification of the error type (default is 'GENERIC_ERROR').
     * @param {Object} details Any additional details about the error (default is null).
     */
    constructor(message, status, code = 'GENERIC_ERROR', details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;