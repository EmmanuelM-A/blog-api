const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
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

    console.log(`Registeration attempt for email: ${email}`);

    if(!username || !email || !password) {
        console.warn("Validation failed: Missing fields");
        response.status(status.VALIDATION_ERROR);
        throw new Error("All fields must be filled!");
    }

    if(!validateUsername(username))

    const userAvailable = User.findOne({ email });

    if(!userAvailable) {

    }
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