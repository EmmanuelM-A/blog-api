const validator = require('validator');
const { body } = require('express-validator');
const restrictedUsernames = require('../config/restricted-usernames.json');
const { constants } = require('./constants');

/**
 * Validates the username.
 * @param {string} input The input to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
const validateUsername = (input) => {
    return (
        typeof input === "string" &&
        validator.isLength(input, { min: 3, max: 20 }) &&
        /^[a-zA-Z0-9_]+$/.test(input) &&
        !restrictedUsernames.includes(input.toLowerCase())
    );
};

/**
 * Validates the user's inputted password.
 * @param {string} input The input to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
const validatePassword = (input) => {
    return (
        typeof input === "string" &&
        validator.isStrongPassword(input, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
    );
};

/**
 * Validates the user's inputted email.
 * @param {string} input The input to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
const validateEmail = (input) => {
    return (
        typeof input === "string" &&
        !validator.isEmpty(input) &&
        validator.isEmail(input)
    );
};

const validatePostTitle = (input) => {
    return (
        typeof input === "string" &&
        !validator.isEmpty(input) &&
        input.length <= constants.MAX_POST_TITLE_LENGTH
    );
}

const validatePostContent = (input) => {
    return (
        typeof input === "string" &&
        !validator.isEmpty(input) &&
        input.length <= constants.MAX_POST_CONTENT_LENGTH
    );
}

const validatePostRoute = [
    body('title')
        .isString()
        .isLength({ max: constants.MAX_POST_TITLE_LENGTH })
        .withMessage("Title must be under 100 characters."),
    body('content')
        .isString()
        .isLength({ max: constants.MAX_POST_CONTENT_LENGTH })
        .withMessage('Content must be under 5000 characters.'),
];

module.exports = {
    validateUsername,
    validatePassword,
    validateEmail
};