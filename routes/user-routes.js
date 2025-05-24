const express = require("express");
const { registerUser, loginUser, currentUser } = require("../controllers/user-controller");
const { authRouteProtection } = require("../middleware/auth-middleware");
const router = express.Router();


router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/current', authRouteProtection, currentUser);

module.exports = router;