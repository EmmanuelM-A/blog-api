const express = require("express");
const {
	registerUser,
	loginUser,
	currentUser,
	logoutUser,
	refreshAccessToken,
} = require("../controllers/user-controller");
const { authRouteProtection } = require("../../../middleware/authorize-routes");
const { authLimiter } = require("../../../middleware/api-rate-limiter");
const router = express.Router();

router.post("/register", authLimiter, registerUser);

router.post("/login", authLimiter, loginUser);

router.get("/current", authRouteProtection, currentUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logoutUser);

module.exports = router;
