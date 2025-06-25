const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
const { validateUsername, validatePassword, validateEmail } = require("../utils/input-validator");
const { hashPassword, comparePassword, generateRefreshToken, generateAccessToken } = require("../utils/helpers");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

/**
 * @function registerUser
 * @description
 * Handles an HTTP POST request to register a new user.
 * Performs validation of input fields (username, email, password),
 * checks for the uniqueness of username and email,
 * hashes the provided password, and creates a new user record in the database.
 *
 * @route POST api/users/register
 * @access Public
 *
 * @param {import('express').Request} request - Express request object.
 * Expects `username`, `email`, and `password` in the JSON body.
 * @param {import('express').Response} response - Express response object used to return the created user.
 *
 * @returns {Response} 201 - Returns the created user object (excluding password) on success.
 * @returns {Response} 400 - For validation errors like missing or invalid fields,
 * or if a user with the provided email/username already exists,
 * or if there's a database error during user creation.
 *
 * @throws {Error} Throws errors for validation failures (missing fields, invalid format),
 * duplicate user credentials, or database creation issues (handled by asyncHandler).
 *
 * @example
 * // Client request:
 * POST /api/users/register
 * {
 * "username": "newuser",
 * "email": "newuser@example.com",
 * "password": "StrongPassword123!"
 * }
 *
 * // Sample successful response (201 Created):
 * {
 * "_id": "60a6b9d4f1e9a21e4cfa1234",
 * "username": "newuser",
 * "email": "newuser@example.com",
 * "role": "user"
 * }
 *
 * // Sample error response (400 Bad Request if email exists):
 * // "Unable to register with the provided credentials"
 */
const registerUser = asyncHandler(async (request, response) => {
    // Extract user credentials from the request body.
    const { username, email, password } = request.body;

    logger.info(`Registration attempt for email: ${email}.`);

    // Define validation checks for username, email, and password.
    const validations = [
        { check: username, validateFunc: validateUsername(username), error: "Invalid username!" },
        { check: email, validateFunc: validateEmail(email), error: "Invalid email!" },
        { check: password, validateFunc: validatePassword(password), error: "Invalid password!" },
    ];

    // Loop through validations to ensure all fields are present and valid.
    for (const { check, validateFunc, error } of validations) {
        if (!check) {
            logger.error("Registration failed: Missing fields detected.");
            response.status(status.VALIDATION_ERROR);
            throw new Error("All fields must be filled!");
        }
        if (!validateFunc) {
            logger.error("Registration failed: Invalid input!");
            response.status(status.VALIDATION_ERROR);
            throw new Error(`Registration failed: ${error}`);
        }
    }

    // Check if a user with the provided username or email already exists.
    const isUserAvailable = await User.findOne({ $or: [{ username }, { email }] });

    if (isUserAvailable) {
        logger.error(`Registration failed: A user with the username: ${username} or email: ${email} already exists!`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("Unable to register with the provided credentials");
    }

    // Hash the user's password before storing it securely.
    const hashedPassword = await hashPassword(password);

    // Create the new user record in the database.
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "user"
    });

    logger.info(`User created: ${user}`);

    // If user creation failed, throw an error.
    if (!user) {
        logger.error(`User registration failed for the user: ${email}`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("An error occured during user registration!");
    }

    // Send a success response with the new user's public details.
    response.status(status.CREATED).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });

    logger.info(`Registration successful for the user: ${email}.`);
});


/**
 * @function loginUser
 * @description
 * Handles an HTTP POST request to authenticate and log in an existing user.
 * It validates the provided email and password, checks credentials against the database,
 * generates an access token and a refresh token, sets the refresh token as an
 * HTTP-only cookie, and saves the refresh token in the database for future use.
 *
 * @route POST api/users/login
 * @access Public
 *
 * @param {import('express').Request} request - Express request object.
 * Expects `email` and `password` in the JSON body.
 * @param {import('express').Response} response - Express response object used to return
 * authentication status, user data, and set cookies.
 *
 * @returns {Response} 200 - Returns the authenticated user object (excluding sensitive password)
 * and an access token on successful login.
 * @returns {Response} 400 - For validation errors like missing or invalid `email` or `password` fields.
 * @returns {Response} 401 - If the provided `email` or `password` credentials do not match
 * any user in the database, or if the password comparison fails.
 *
 * @throws {Error} Throws errors for missing fields, invalid input formats, or incorrect
 * credentials. These errors are caught by `asyncHandler` and translated into
 * appropriate HTTP responses.
 *
 * @example
 * // Client request:
 * POST /api/users/login
 * {
 * "email": "existinguser@example.com",
 * "password": "CorrectPassword123!"
 * }
 *
 * // Sample successful response (200 OK):
 * {
 * "_id": "60a6b9d4f1e9a21e4cfa1234",
 * "username": "existinguser",
 * "email": "existinguser@example.com",
 * "role": "user",
 * "token": "eyJhbGciOiJIUzI1NiI..." // JWT Access Token
 * }
 *
 * // Sample error response (400 Bad Request if email format is invalid):
 * // "Login failed: Invalid email!"
 *
 * // Sample error response (401 Unauthorized if credentials are incorrect):
 * // "Invalid credentials"
 */
const loginUser = asyncHandler(async (request, response) => {
    // Extract email and password from the request body.
    const { email, password } = request.body;

    // Define validation checks for email and password.
    const validations = [
        { check: email, validateFunc: validateEmail(email), error: "Invalid email!" },
        { check: password, validateFunc: validatePassword(password), error: "Invalid password!" },
    ];

    // Loop through validations to ensure all fields are present and valid.
    for (const { check, validateFunc, error } of validations) {
        if (!check) {
            logger.error("Login failed: Missing fields detected.");
            response.status(status.VALIDATION_ERROR);
            throw new Error("All fields must be filled!");
        }
        if (!validateFunc) {
            logger.error("Login failed: Invalid input!");
            response.status(status.VALIDATION_ERROR);
            throw new Error(`Login failed: ${error}`);
        }
    }

    // Find the user in the database by their email.
    const userDB = await User.findOne({ email });

    // Check if the user exists and if the provided password matches the stored hashed password.
    if (!userDB || !(await comparePassword(password, userDB.password))) {
        logger.error(`Login unsuccessful: ${email}`);
        response.status(status.UNAUTHORIZED);
        throw new Error("Invalid credentials");
    }

    // Generate both an access token (short-lived) and a refresh token (long-lived) for the user.
    const accessToken = generateAccessToken(userDB.id);
    const refreshToken = generateRefreshToken(userDB.id);

    // Save the generated refresh token to the user's record in the database.
    userDB.refreshToken = refreshToken;
    await userDB.save();

    // Set the refresh token as an HTTP-only cookie for secure storage on the client side.
    response.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Prevents client-side JavaScript access to the cookie.
        secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
        sameSite: "strict", // Protects against CSRF attacks.
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration in 7 days.
    });

    // Send a successful HTTP response (200 OK) with the user's public details and access token.
    response.status(status.OK).json({
        _id: userDB.id,
        username: userDB.username,
        email: userDB.email,
        role: userDB.role,
        token: accessToken // The access token for subsequent authenticated requests.
    });

    logger.info(`Login successful: ${email}`);
});


/**
 * @function currentUser
 * @description
 * Handles an HTTP GET request to retrieve the currently authenticated user's information.
 * This endpoint is protected and assumes that authentication middleware has already
 * processed the request and populated `request.user` with the authenticated user's details.
 *
 * @route GET api/users/current
 * @access Private
 *
 * @param {import('express').Request} request - Express request object.
 * Expects `request.user` to be populated by authentication middleware
 * containing the authenticated user's details.
 * @param {import('express').Response} response - Express response object used to return
 * the current user's data.
 *
 * @returns {Response} 200 - Returns the authenticated user object on success.
 * @returns {Response} 401 - If the request is not authenticated, meaning `request.user` is not populated.
 * (This specific error is typically handled by prior authentication middleware, not directly by this function).
 *
 * @throws {Error} No explicit errors are thrown by this function itself, as it relies on
 * preceding middleware to handle authentication and errors related to it.
 * Any errors would typically come from the `asyncHandler` if `request.user` is unexpectedly `null`/`undefined`
 * due to a misconfiguration or failure in prior middleware.
 *
 * @example
 * // Client request (after successful authentication, e.g., with a valid JWT in Authorization header):
 * GET /api/users/current
 *
 * // Sample successful response (200 OK):
 * {
 * "_id": "60a6b9d4f1e9a21e4cfa1234",
 * "username": "loggedInUser",
 * "email": "loggedin@example.com",
 * "role": "user",
 * "createdAt": "2024-01-01T10:00:00Z",
 * "updatedAt": "2024-01-01T10:00:00Z"
 * }
 *
 * // Sample error response (if not authenticated, usually handled by middleware):
 * // 401 Unauthorized
 * // "Not authorized, no token" or similar.
 */
const currentUser = asyncHandler( async (request, response) => {
    response.status(status.OK).json(request.user);

    logger.info(`Fetched current user: ${request.user?.email || "unknown email"}`);
});

/**
 * @function refreshAccessToken
 * @description
 * Handles an HTTP GET request to refresh an expired access token using a valid refresh token.
 * This function retrieves the refresh token from HTTP cookies, verifies its authenticity and
 * validity against stored records, and if successful, issues a new access token.
 *
 * @route POST api/users/refresh-token
 * @access Public (Requires refresh token in cookie)
 *
 * @param {import('express').Request} request - Express request object.
 * Expects the `refreshToken` in `request.cookies`.
 * @param {import('express').Response} response - Express response object used to return
 * the new access token or an error status.
 *
 * @returns {Response} 200 - Returns a JSON object containing the `newAccessToken` on success.
 * @returns {Response} 401 - If the `refreshToken` is not present in the cookies.
 * @returns {Response} 403 - If the `refreshToken` is invalid (e.g., expired, tampered,
 * not found in the database, or does not match the user's stored token).
 *
 * @throws {Error} Throws errors for missing refresh token, verification failures,
 * or user not found, which are handled by `asyncHandler`.
 *
 * @example
 * // Client request (after an access token has expired):
 * GET /api/users/refresh
 * // (The browser automatically sends the 'refreshToken' cookie)
 *
 * // Sample successful response (200 OK):
 * {
 * "accessToken": "eyJhbGciOiJIUzI1NiI..." // New JWT Access Token
 * }
 *
 * // Sample error response (401 Unauthorized if refresh token is missing):
 * // "Refresh token not provided"
 *
 * // Sample error response (403 Forbidden if refresh token is invalid/expired):
 * // "Invalid or expired refresh token"
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
 * @function logoutUser
 * @description
 * Handles an HTTP POST request to log out a user by invalidating their refresh token.
 * It retrieves the refresh token from HTTP cookies, removes it from the user's
 * record in the database, and clears the refresh token cookie from the client's browser.
 * This effectively logs the user out and requires re-authentication for future access.
 *
 * @route POST /api/users/logout
 * @access Public (Requires refresh token in cookie to invalidate)
 *
 * @param {import('express').Request} request - Express request object.
 * Expects the `refreshToken` in `request.cookies`.
 * @param {import('express').Response} response - Express response object used to return
 * a success message.
 *
 * @returns {Response} 200 - Returns a JSON object with a success message indicating
 * the user has been logged out.
 *
 * @throws {Error} No explicit errors are thrown by this function to the client as part of
 * a successful logout, even if a token is not present or the user is not found.
 * The primary goal is to ensure the client-side cookie is cleared. Errors related
 * to database operations would be handled by `asyncHandler`.
 *
 * @example
 * // Client request to log out:
 * POST /api/users/logout
 * // (The browser automatically sends the 'refreshToken' cookie if present)
 *
 * // Sample successful response (200 OK):
 * {
 * "message": "Logged out successfully"
 * }
 */
const logoutUser = asyncHandler(async (request, response) => {
    // Extract the refresh token from the request cookies.
    const token = request.cookies.refreshToken;

    // Check if a refresh token was present in the request.
    if (token) {
        // Attempt to find a user in the database with the extracted refresh token.
        const user = await User.findOne({ refreshToken: token });
        
        // If a user is found, clear their refresh token in the database to invalidate it.
        if (user) {
            user.refreshToken = null; // Set the refresh token to null to invalidate it.
            await user.save(); // Save the updated user document.
        }

        // Clear the 'refreshToken' cookie from the client's browser.
        // The options must match those used when setting the cookie during login.
        response.clearCookie("refreshToken", {
            httpOnly: true, // Must match the `httpOnly` setting used when the cookie was set.
            secure: process.env.NODE_ENV === "production", // Must match `secure` setting.
            sameSite: "Strict" // Must match `sameSite` setting.
        });
    }

    // Send a 200 OK response indicating successful logout, regardless of whether a token was present or found.
    response.status(status.OK).json({ message: "Logged out successfully" });
});

module.exports = { registerUser, loginUser, currentUser, refreshAccessToken, logoutUser };