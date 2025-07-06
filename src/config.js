/**
 * Application-wide constants for post validation and limits.
 * @typedef {Object} AppConstants
 * @typedef {Object} CommonErrorsMap
 * @property {number} MAX_POST_TITLE_LENGTH - Maximum allowed character length for a post title.
 * @property {number} MAX_POST_CONTENT_LENGTH - Maximum allowed character length for post content.
 * @property {number} POSTS_PER_PAGE_LIMIT - Defines the maximum number of posts returned per page in paginated post listings.
 * @property {number} MAX_CHAR_COMMENT_LENGTH - The maximum allowed character length for post comments.
 * @property {number} DEFAULT_PORT - The default port number to use as fallback if none is provided.
 * @property {Array<String>} VALID_ROLES - The list of all valid roles that a user can be.
 * @property {string} LOGS_DIRECTORY - The directory where log files are stored.
 * 
 */

const { StatusCodes } = require('http-status-codes');

/** @type {AppConstants} */
exports.constants = {
    MAX_POST_TITLE_LENGTH: 100,
    MAX_POST_CONTENT_LENGTH: 5000,
    POSTS_PER_PAGE_LIMIT: 10,
    MAX_CHAR_COMMENT_LENGTH: 500,
    DEFAULT_PORT: 5000,
    VALID_ROLES: ['user', 'author', 'admin'],
    LOGS_DIRECTORY: "../logs"
};