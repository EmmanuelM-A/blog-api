const ApiError = require("../../utils/ApiError");
const {
	userValidation
} = require("../validation/input-validator");
const { findUserById } = require("../../database/models/user-model");

const {
	StatusCodes
} = require('http-status-codes');

/**
 * Registers a new user after validating and hashing the password.
 * 
 * @param {Object} userData The user data required to register.
 * 
 * @returns {Promise<Object>} - The created user object
 */
async function registerUserService(userData) {
    // Extract user credentials from the request body.
    const { username, email, password } = request.body;

	// Define validation checks for username, email, and password.
	const validations = userValidation(username, email, password);

	// Loop through validations to ensure all fields are present and valid.
	for (const { check, validateFunc, errorMsg } of validations) {
		if (!check) {
			logger.error("Registration failed: Missing fields detected.");

			throw new ApiError(
				"All fields must be filled!",
				StatusCodes.VALIDATION_ERROR,
				"MISSING_FIELDS",
				"Username, email, and password are required for registration."
			);
		}

		if (!validateFunc) {
			logger.error(`Registration failed: ${errorMsg}!`);

			throw new ApiError(
				`Registration failed: ${errorMsg}!`,
				StatusCodes.VALIDATION_ERROR,
				"INVALID_INPUT",
			);
		}
	}

	// Check if a user with the provided username or email already exists.
	const isUserTaken = await User.findOne({ $or: [{ username }, { email }] });

	const isUserTaken = find

	if (isUserTaken) {
		logger.error(`Registration failed: A user with the username: ${username} or email: ${email} already exists!`);

		throw new ApiError(
			"Unable to register with the provided credentials",
			StatusCodes.VALIDATION_ERROR,
			"USER_ALREADY_EXISTS",
		);
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

		throw new ApiError(
			"An error occurred during user registration!",
			StatusCodes.VALIDATION_ERROR,
			"REGISTRATION_ERROR",
			"Please ensure all fields are valid and try again."
		);
	}

	sendSuccessResponse(
		response, 
		StatusCodes.CREATED, 
		"User registered successfully.", 
		{
			userId: user.id,
			username: user.username,
			email: user.email,
			role: user.role
		}
	);

	logger.info(`Registration successful for the user: ${email}.`);

}

/**
 * Authenticates a user and returns tokens if credentials are valid.
 * 
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
 */
async function loginUserService(credentials) {}

/**
 * Retrieves the current authenticated user's data.
 * 
 * @param {string} userId
 * @returns {Promise<Object>} - The user object
 */
async function getCurrentUserService(userId) {}

/**
 * Refreshes the access token using a refresh token.
 * 
 * @param {string} refreshToken
 * @returns {Promise<string>} - The new access token
 */
async function refreshAccessTokenService(refreshToken) {}

/**
 * Logs out a user by invalidating their refresh token.
 * 
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
async function logoutUserService(refreshToken) {}

module.exports = {
  registerUserService,
  loginUserService,
  getCurrentUserService,
  refreshAccessTokenService,
  logoutUserService,
};