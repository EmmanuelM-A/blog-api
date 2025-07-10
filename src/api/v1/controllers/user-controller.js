const expressAsyncHandler = require("express-async-handler");
const { sendSuccessResponse } = require("../../../utils/helpers");
const { registerUserService, loginUserService, getCurrentUserService, refreshAccessTokenService } = require("../../../services/users/user-service");
const { StatusCodes } = require("http-status-codes");
const logger = require("../../../utils/logger");

/**
 * Handles an HTTP POST request to register a new user.
 */
const registerUser = expressAsyncHandler(async (request, response) => {
    // Extract user credentials from the request body.
    const userCredentials = request.body;

    const user = await registerUserService(userCredentials);

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

    logger.info(`Registration successful for the user: ${user.username} (${user.id}).`);
});

/**
 * Handles an HTTP POST request to authenticate and log in an existing user.
 */
const loginUser = expressAsyncHandler(async (request, response) => {
    // Generate tokens after authentication
    const { userDB, accessToken, refreshToken } = await loginUserService(request.body);

    // Set the refresh token as an HTTP-only cookie for secure storage on the client side.
    response.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Prevents client-side JavaScript access to the cookie.
        secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
        sameSite: "strict", // Protects against CSRF attacks.
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration in 7 days.
    });

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "User logged in successfully.",
        {
            userId: userDB.id,
            username: userDB.username,
            email: userDB.email,
            role: userDB.role,
            token: accessToken
        }
    );

    logger.info(`Login successful for the user: ${userDB.username} (${userDB.id}).`);
});


/**
 * Handles a HTTP GET request to retrieve the currently authenticated user's information.
 */
const currentUser = expressAsyncHandler( async (request, response) => {
    const user = await getCurrentUserService(request.user.id);

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Current user fetched successfully.",
        { user }
    );

    logger.info(`Fetched ${request.user.username}'s information successfully!`);
});


/**
 * Handles an HTTP GET request to refresh an expired access token using a valid refresh token.
 */
const refreshAccessToken = expressAsyncHandler(async (request, response) => {
    // Generate new access token
    const newAccessToken = await refreshAccessTokenService(request.cookies.refreshToken);

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Access token refreshed successfully.",
        { accessToken: newAccessToken }
    );
});

/**
 * Handles an HTTP POST request to log out a user by invalidating their refresh token.
 */
const logoutUser = expressAsyncHandler(async (request, response) => {
    // Invalidate the user's refresh token
    await loginUserService(request.cookies.refreshToken);

    // Clear the 'refreshToken' cookie from the client's browser.
	// The options must match those used when setting the cookie during login.
	response.clearCookie("refreshToken", {
		httpOnly: true, // Must match the `httpOnly` setting used when the cookie was set.
		secure: process.env.NODE_ENV === "production", // Must match `secure` setting.
		sameSite: "Strict" // Must match `sameSite` setting.
	});

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Logged out successfully."
    );
    
    logger.info("User logged out successfully, refresh token cleared.");
});

module.exports = { registerUser, loginUser, currentUser, refreshAccessToken, logoutUser };