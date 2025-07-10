const ApiError = require("../../utils/api-error");
const { validateUsername, validateEmail, validatePassword } = require("../validation/input-validator");
const { findUserById, findUserByCriteria, createUser } = require("../../database/models/user-model");
const { StatusCodes } = require('http-status-codes');
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require("../../utils/helpers");
const logger = require("../../utils/logger");

/**
 * Registers a new user after validating and hashing the password.
 * 
 * @param {Object} userData The user data required to register.
 * 
 * @returns {Promise<Object>} The created user object.
 */
async function registerUserService(userData) {
    // Extract user credentials from the request body.
    const { username, email, password } = userData;

	// Define validation checks for username, email, and password.
	const validations = [
        { check: username, validateFunc: validateUsername(username), errorMsg: "Invalid username provided!" },
        { check: email, validateFunc: validateEmail(email), errorMsg: "Invalid email provided!" },
        { check: password, validateFunc: validatePassword(password), errorMsg: "Invalid password provided!" }
    ];

	// Loop through validations to ensure all fields are present and valid.
	for (const { check, validateFunc, errorMsg } of validations) {
		if (!check) {
			logger.error("Registration failed: Missing fields detected.");

			throw new ApiError(
				"All fields must be filled!",
				StatusCodes.BAD_REQUEST,
				"MISSING_FIELDS",
				"Username, email, and password are required for registration."
			);
		}

		if (!validateFunc) {
			logger.error(`Registration failed: ${errorMsg}!`);

			throw new ApiError(
				`Registration failed: ${errorMsg}!`,
				StatusCodes.BAD_REQUEST,
				"INVALID_INPUT",
			);
		}
	}

	// Check if a user with the provided username or email already exists.
	const isUserTaken = await findUserByCriteria({ $or: [{ username }, { email }] })

	if (isUserTaken) {
		logger.error(`Registration failed: A user with the username: ${username} or email: ${email} already exists!`);

		throw new ApiError(
			"Unable to register with the provided credentials",
			StatusCodes.BAD_REQUEST,
			"USER_ALREADY_EXISTS",
		);
	}

	// Hash the user's password before storing it securely.
	const hashedPassword = await hashPassword(password);

	// Create the user object.
	const userObj = {
		username,
		email,
		password: hashedPassword
	}
	
	const userDB = await createUser(userObj);

	// If user creation failed, throw an error.
	if (!userDB) {
		logger.error(`User registration failed for the user: ${email}`);

		throw new ApiError(
			"An error occurred during user registration!",
			StatusCodes.BAD_REQUEST,
			"REGISTRATION_ERROR",
			"Please ensure all fields are valid and try again."
		);
	}

	logger.debug(`The user ${userDB.username} (${userDB._id}) has been created.`);

	return userDB;
}

/**
 * Authenticates a user and returns tokens if credentials are valid.
 * 
 * @param {Object} userCredentials The user credentials needed to login.
 * 
 * @returns {Object} An object containing the access and refresh token.
 */
async function loginUserService(userCredentials) {
	// Extract email and password from the user's credentials.
	const { email, password } = userCredentials;

	// Define validation checks for email and password.
	const validations = [
		{ check: email, validateFunc: validateEmail(email), errorMsg: "Invalid email provided!" },
		{ check: password, validateFunc: validatePassword(password), errorMsg: "Invalid password provided!" },
	];

	// Loop through validations to ensure all fields are present and valid.
	for (const { check, validateFunc, errorMsg } of validations) {
		if (!check) {
			logger.error("Login failed: Missing fields detected.");
			throw new ApiError(
				"All fields must be filled!",
				StatusCodes.BAD_REQUEST,
				"MISSING_FIELDS",
				"Email and password are required for login."
			);
		}

		if (!validateFunc) {
			logger.error("Login failed: Invalid input!");

			throw new ApiError(
				`Login failed: ${errorMsg}`,
				StatusCodes.BAD_REQUEST,
				"INVALID_INPUT",
				"Please ensure the email or password meet the required formats."
			);
		}
	}

	// Find the user in the database by their email.
	const userDB = await findUserByCriteria({ email })

	// Check if the user exists and if the provided password matches the stored hashed password.
	if (!userDB || !(await comparePassword(password, userDB.password))) {
		logger.error(`Login unsuccessful: ${email}`);

		throw new ApiError(
			"Invalid credentials",
			StatusCodes.UNAUTHORIZED,
			"INVALID_CREDENTIALS",
			"The email or password provided is incorrect. Please try again."
		);
	}

	// Generate both an access token and a refresh token for the user.
	const accessToken = generateAccessToken(userDB.id);
	const refreshToken = generateRefreshToken(userDB.id);

	// Save the generated refresh token to the user's record in the database.
	userDB.refreshToken = refreshToken;
    await userDB.save();

	return {
		userDB,
		accessToken,
		refreshToken
	}
}

/**
 * Retrieves the current authenticated user's data.
 * 
 * @param {string} userId The user's id.
 * 
 * @returns {Promise<Object>} The user object.
 */
async function getCurrentUserService(userId) {
	const userDB = await findUserById(userId);

	// Check if the user exists
	if(!userDB) {
		throw new ApiError(
			"User not found",
			StatusCodes.NOT_FOUND,
			"USER_NOT_FOUND"
		);
	}

	return userDB;
}

/**
 * Refreshes the access token using a refresh token.
 * 
 * @param {string} token The refresh token stored in cookies.
 * 
 * @returns {String} The new access token.
 */
async function refreshAccessTokenService(token) {
	logger.debug("Refresh token request received.");

    if (!token) {
        logger.warn("Refresh token not provided in cookies.");
        throw new ApiError(
            "Refresh token not provided",
            StatusCodes.UNAUTHORIZED,
            "MISSING_REFRESH_TOKEN",
        );
    }

    try {
        logger.debug("Verifying refresh token...");
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        logger.debug(`Refresh token verified for user ID: ${decoded.id}`);

		const userDB = await findUserById(decoded.id);

        if (!userDB) {
            logger.warn(`User not found for ID: ${decoded.id}`);
            throw new ApiError(
                "User not found",
                StatusCodes.FORBIDDEN,
                "USER_NOT_FOUND",
            );
        }

        if (userDB.refreshToken !== token) {
            logger.warn("Refresh token does not match the one stored in DB.");

            throw new ApiError(
                "Invalid refresh token",
                StatusCodes.FORBIDDEN,
                "INVALID_REFRESH_TOKEN"
            );
        }

        const accessToken = generateAccessToken(userDB.id);

		logger.info(`New access token generated for user ID: ${userDB.id}`);

		return accessToken;
    } catch (err) {
        logger.error(`Refresh token verification failed: ${err.message}`);

        throw new ApiError(
            "Invalid or expired refresh token",
            StatusCodes.FORBIDDEN,
            "INVALID_OR_EXPIRED_REFRESH_TOKEN",
            "The provided refresh token is either invalid or has expired."
        );
    }
}

/**
 * Logs out a user by invalidating their refresh token.
 * 
 * @param {string} token The refresh token found in the cookies.
 * 
 * @returns {void}
 */
async function logoutUserService(token) {
	// Check if token was provided
    if (!token) {
		logger.error("Logout failed: No refresh token provided!");

		throw new ApiError(
			"No refresh token provided",
			StatusCodes.NOT_FOUND,
			"NO_REFRESH_TOKEN_FOUND"
		)
	}

	// Attempt to find a user in the database with the extracted refresh token.
	const user = await findUserByCriteria({ refreshToken: token });

	if (!user) {
		// If no user is found with the provided refresh token, log this event.
		logger.warn("Logout attempt with an invalid or expired refresh token.");

		throw new ApiError(
			"Invalid or expired refresh token",
			StatusCodes.FORBIDDEN,
			"INVALID_REFRESH_TOKEN"
		);
	}
	
	// If a user is found, clear their refresh token in the database to invalidate it.
	user.refreshToken = null; // Set the refresh token to null to invalidate it.
	await user.save(); // Save the updated user document.

	logger.debug(`The refresh token: ${token} has been invalidated.`);
}

module.exports = {
	registerUserService,
	loginUserService,
	getCurrentUserService,
	refreshAccessTokenService,
	logoutUserService,
};