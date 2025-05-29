/**
 * Application-wide constants for post validation and limits.
 * @typedef {Object} AppConstants
 * @property {number} MAX_POST_TITLE_LENGTH - Maximum allowed character length for a post title.
 * @property {number} MAX_POST_CONTENT_LENGTH - Maximum allowed character length for post content.
 */

/** @type {AppConstants} */
exports.constants = {
    MAX_POST_TITLE_LENGTH: 100,
    MAX_POST_CONTENT_LENGTH: 5000,
};