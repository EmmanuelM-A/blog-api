const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
const { validateUsername, validatePassword, validateEmail } = require("../utils/input-validator");
const { hashPassword, comparePassword, generateRefreshToken, generateAccessToken } = require("../utils/helpers");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

/**
 * @description Register a new user.
 * @route POST api/users/register
 * @access public
 * 
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
            logger.error("Registration failed: Missing fields detected.");
            response.status(status.VALIDATION_ERROR);
            throw new Error("All fields must be filled!");
        }

        if(!validateFunc) {
            logger.error("Registration failed: Invalid input!");
            response.status(status.VALIDATION_ERROR);
            throw new Error(`Registration failed: ${error}`);
        }
    }

    const isUserAvailable = await User.findOne({ $or: [{ username }, { email }] });

    if (isUserAvailable) {
        logger.error(`Registration failed: A user with the username: ${username} or email: ${email} already exists!`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("Unable to register with the provided credentials");
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "user"
    });

    logger.info(`User created: ${user}`);

    if (!user) {
        logger.error(`User registration failed for the user: ${email}`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("An error occured during user registration!");
    }

    response.status(status.CREATED).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });

    logger.info(`Registration successful for the user: ${email}.`);
});

/**
 * @description Login a user.
 * @route POST api/users/login
 * @access public
 */
const loginUser = asyncHandler( async (request, response) => {
    const { email, password } = request.body;

    const validations = [
        { check: email, validateFunc: validateEmail(email), error: "Invalid email!" },
        { check: password, validateFunc: validatePassword(password), error: "Invalid password!" },
    ];

    for(const { check, validateFunc, error } of validations) {
        if(!check) {            
            logger.error("Login failed: Missing fields detected.");
            response.status(status.VALIDATION_ERROR);
            throw new Error("All fields must be filled!");
        }

        if(!validateFunc) {
            logger.error("Login failed: Invalid input!");
            response.status(status.VALIDATION_ERROR);
            throw new Error(`Login failed: ${error}`);
        }
    }

    // Find user in DB using the inputted email
    const userDB = await User.findOne({ email });

    if(!userDB || !(await comparePassword(password, userDB.password))) {
        logger.error(`Login unsuccessful: ${email}`);
        response.status(status.UNAUTHORIZED);
        throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken(userDB.id);
    const refreshToken = generateRefreshToken(userDB.id);

    // Save refresh token in DB
    userDB.refreshToken = refreshToken;
    await userDB.save();

    response.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    response.status(status.OK).json({
        _id: userDB.id,
        username: userDB.username,
        email: userDB.email,
        role: userDB.role,
        token: accessToken
    });

    logger.info(`Login successful: ${email}`);
});

/**
 * @description Gets the current user.
 * @route GET api/users/current
 * @access public
 */
const currentUser = asyncHandler( async (request, response) => {
    response.status(status.OK).json(request.user);

    logger.info(`Fetched current user: ${request.user?.email || "unknown email"}`);
});

/**
 * @description Refreshes the access token using a valid refresh token cookie.
 * @route POST /api/users/refresh-token
 * @access Public
 */
const refreshAccessToken = asyncHandler(async (request, response) => {
    logger.info("Refresh token request received.");

    const token = request.cookies.refreshToken;

    if (!token) {
        logger.warn("Refresh token not provided in cookies.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Refresh token not provided");
    }

    try {
        logger.info("Verifying refresh token...");
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        logger.info(`Refresh token verified for user ID: ${decoded.id}`);

        const userDB = await User.findById(decoded.id);

        if (!userDB) {
            logger.warn(`User not found for ID: ${decoded.id}`);
            response.status(status.FORBIDDEN);
            throw new Error("Invalid refresh token");
        }

        if (userDB.refreshToken !== token) {
            logger.warn("Refresh token does not match the one stored in DB.");
            response.status(status.FORBIDDEN);
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = generateAccessToken(userDB.id);
        logger.info(`New access token generated for user ID: ${userDB.id}`);
        response.status(status.OK).json({ accessToken: newAccessToken });

    } catch (err) {
        logger.error(`Refresh token verification failed: ${err.message}`);
        response.status(status.FORBIDDEN);
        throw new Error("Invalid or expired refresh token");
    }
});

/**
 * @route POST /api/users/logout
 */
const logoutUser = asyncHandler(async (request, response) => {
    const token = request.cookies.refreshToken;

    if (token) {
        const user = await User.findOne({ refreshToken: token });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        response.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });
    }

    response.status(status.OK).json({ message: "Logged out successfully" });
});



module.exports = { registerUser, loginUser, currentUser, refreshAccessToken, logoutUser };