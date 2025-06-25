/**
 * Application-wide constants for post validation and limits.
 * @typedef {Object} AppConstants
 * @typedef {Object} CommonErrorsMap
 * @property {number} MAX_POST_TITLE_LENGTH - Maximum allowed character length for a post title.
 * @property {number} MAX_POST_CONTENT_LENGTH - Maximum allowed character length for post content.
 * @property {number} POSTS_PER_PAGE_LIMIT - Defines the maximum number of posts returned per page in paginated post listings.
 * @property {number} MAX_CHAR_COMMENT_LENGTH - The maximum allowed character length for post comments.
 * @property {number} DEFAULT_PORT - The default port number to use as fallback if none is provided.
 * 
 */

const { status } = require("./status");

/** @type {AppConstants} */
exports.constants = {
    MAX_POST_TITLE_LENGTH: 100,
    MAX_POST_CONTENT_LENGTH: 5000,
    POSTS_PER_PAGE_LIMIT: 10,
    MAX_CHAR_COMMENT_LENGTH: 500,
    DEFAULT_PORT: 5000,
};

/** @type {CommonErrorsMap} */
exports.COMMON_ERRORS_MAP = {
    [status.VALIDATION_ERROR]: {
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        details: "One or more input fields are invalid."
    },
    [status.NOT_FOUND]: {
        message: "Resource not found.",
        code: "NOT_FOUND",
        details: "The requested resource could not be found."
    },
    [status.UNAUTHORIZED]: {
        message: "Authentication required or invalid credentials.",
        code: "UNAUTHORIZED",
        details: "You are not authorized to access this resource."
    },
    [status.FORBIDDEN]: {
        message: "Access denied.",
        code: "FORBIDDEN",
        details: "You do not have permission to perform this action."
    },
    [status.SERVER_ERROR]: { // Generic 500 for explicit SERVER_ERROR or uncaught errors
        message: "An internal server error occurred.",
        code: "INTERNAL_SERVER_ERROR",
        details: "Something went wrong on our server."
    },
};