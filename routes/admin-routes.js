const express = require('express');
const router = express.Router();
const { authorizeRoles } = require("../middleware/role-middleware");
const { getAllUsers, deleteUser, updateUserRole } = require("../controllers/admin-controller");
const { authRouteProtection } = require('../middleware/auth-middleware');

router.use(authRouteProtection, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;