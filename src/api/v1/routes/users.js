const express = require("express");
const { 
    registerUser, 
    loginUser, 
    currentUser, 
    logoutUser, 
    refreshAccessToken, 
} = require("../controllers/userController");
const { authRouteProtection } = require("../middleware/auth-middleware");
const router = express.Router();


router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/current', authRouteProtection, currentUser);

router.post('/refresh-token', refreshAccessToken);

router.post('/logout', logoutUser);

module.exports = router;