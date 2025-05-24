const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
const { validateUsername, validatePassword, validateEmail } = require("../utils/input-validator");
const { hashPassword } = require("../utils/helpers");
const logger = require("../utils/logger");

// TODO - Test validation and the register method

/**
 * @description Register a new user.
 * @route POST api/users/register
 * @access public
 */
const registerUser = asyncHandler( async (request, response) => {
    const { username, email, password } = request.body;

    logger.info(`Registration attempt for email: ${email}.`);

    const validations = [
        { check: username, validateFunc: validateUsername(username), error: "Invalid username!" },
        { check: email, validateFunc: validateEmail(email), error: "Invalid email!" },
        { check: password, validateFunc: validatePassword(password), error: "Invalid password!" },
    ];

    for(const { check, validateFunc, error } of validations) {
        if(!check) {            
            logger.error("Validation failed: Missing fields detected.");
            response.status(status.VALIDATION_ERROR);
            throw new Error("All fields must be filled!");
        }

        if(!validateFunc) {
            logger.error(error);
            response.status(status.VALIDATION_ERROR);
            throw new Error("Invalid input!");
        }
    }

    const isUserAvailable = await User.findOne({ $or: [{ username }, { email }] });

    if (isUserAvailable) {
        logger.error(`Registration failed: A user with the username: ${username} or email: ${email} already exists!`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("Unable to register with the provided credentials");
    }

    const hashedPassword = hashPassword(password);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    logger.info(`User created: ${user}`);

    if (!user) {
        logger.error(`User registration failed for the user: ${user}`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("An error occured during user registration!");
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