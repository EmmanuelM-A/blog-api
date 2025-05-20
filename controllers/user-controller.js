const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
const { logMessage } = require("../utils/log-utils");
const { 
    validateUsername,
    validatePassword,
    validateEmail 
} = require("../utils/input-validator");

/**
 * @description Register a new user.
 * @route POST api/users/register
 * @access public
 */
const registerUser = asyncHandler( async (request, response) => {
    const { username, email, password } = request.body;

    logMessage({ msg: `Registration attempt for email: ${email}`, level: "debug" });

    if(!username || !email || !password) {
        logMessage({
            msg: "Validation failed: Missing fields.",
            level: "warn",
            response: response,
            error: "All fields must be filled!",
            statusCode: status.VALIDATION_ERROR
        });
    }

    if(!validateUsername(username)) {
        logMessage({
            msg: "Username inputted is invalid.",
            level: "warn",
            response: response,
            error: "Invalid input!",
            statusCode: status.VALIDATION_ERROR
        });
    }

    if(!validatePassword(password)) {
        logMessage({
            msg: "Password inputted is invalid.",
            level: "warn",
            response: response,
            error: "Invalid input!",
            statusCode: status.VALIDATION_ERROR
        });
    }

    if(!validateEmail(email)) {
        logMessage({
            msg: "Email inputted is invalid.",
            level: "warn",
            response: response,
            error: "Invalid input!",
            statusCode: status.VALIDATION_ERROR
        });
    }

    const userAvailable = await User.findOne({ email });

    if (userAvailable) {
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
const loginUser = asyncHandler( async () => {

});

/**
 * @description Gets the current user.
 * @route GET api/users/current
 * @access public
 */
const currentUser = asyncHandler( async () => {

});

module.exports = { registerUser, loginUser, currentUser};