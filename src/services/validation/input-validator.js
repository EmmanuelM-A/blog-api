const validator = require('validator');
const { body } = require('express-validator');
const restrictedUsernames = require('../users/restricted-usernames.json');
const { constants } = require('../../config');

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

/**
 * Creates a validation object list of validators to validate user credentials.
 * 
 * @param {string} username The user's username.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * 
 * @returns A list of validators. 
 */
const userValidation = (username, email, password) => {
    return [
        { check: username, validateFunc: validateUsername(username), errorMsg: "Invalid username provided!" },
        { check: email, validateFunc: validateEmail(email), errorMsg: "Invalid email provided!" },
        { check: password, validateFunc: validatePassword(password), errorMsg: "Invalid password provided!" }
    ]
}


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

module.exports = {
    validateUsername,
    validatePassword,
    validateEmail,
    validatePostTitle,
    validatePostContent,
    userValidation
};