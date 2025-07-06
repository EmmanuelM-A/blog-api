const express = require('express');
const router = express.Router();
const { authorizeRoles } = require("../../../middleware/authorize-roles");
const { getAllUsers, deleteUser, updateUserRole } = require("../controllers/adminController");
const { authRouteProtection } = require('../../../middleware/authorize-routes');

router.use(authRouteProtection, authorizeRoles('admin'));

router.get('/users', getAllUsers);

router.delete('/users/:userId', deleteUser);

router.patch('/users/:userId/role', updateUserRole);

module.exports = router;