const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
const { logMessage } = require("../utils/log-utils");
const { 
    validateUsername,
    validatePassword,
    validateEmail 
} = require("../utils/input-validator");
const bcrypt = require("bcrypt");

/**
 * @description Register a new user.
 * @route POST api/users/register
 * @access public
 */
const registerUser = asyncHandler( async (request, response) => {
    const { username, email, password } = request.body;

    logMessage({ msg: `Registration attempt for email: ${email}`, level: "debug" });

    const validations = [
        { check: username, validateFunc: validateUsername(username), error: "Invalid username!" },
        { check: email, validateFunc: validateEmail(email), error: "Invalid email!" },
        { check: password, validateFunc: validatePassword(password), error: "Invalid password!" },
    ];

    for(const { check, validateFunc, error } of validations) {
        if(!check) {
            logMessage({
                msg: "Validation failed: Missing fields.",
                level: "warning",
                response,
                error: "All fields must be filled!",
                statusCode: status.VALIDATION_ERROR
            });
        }

        if(!validateFunc) {
            logMessage({
                msg: error,
                level: "warning",
                response,
                error: "Invalid input!",
                statusCode: status.VALIDATION_ERROR
            });
        }
    }

    const isUserAvailable = await User.findOne({ username, email });

    if (isUserAvailable) {
        logMessage({
            response: response, 
            error: "Unable to register with the provided credentials",
            statusCode: status.VALIDATION_ERROR
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    logMessage({ msg: `User created: ${user}`, level: "debug" });

    if (!user) {
        logMessage({
            response: response,
            error: "User data is not valid!",
            statusCode: status.VALIDATION_ERROR
        });
    }

    response.status(status.CREATED).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });
});

/**
 * @description Login a user.
 * @route POST api/users/login
 * @access public
 */
const loginUser = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "User Login" });
});

/**
 * @description Gets the current user.
 * @route GET api/users/current
 * @access public
 */
const currentUser = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get Current User" });
});

module.exports = { registerUser, loginUser, currentUser};