const express = require('express');
const router = express.Router();
const { authorizeRoles } = require("../middleware/role-middleware");
const { getAllUsers, deleteUser, updateUserRole } = require("../controllers/admin-controller");
const { authRouteProtection } = require('../middleware/auth-middleware');

router.use(authRouteProtection, authorizeRoles('admin'));

/**
 * @swagger
 *  components:
 *      schmea:
 *          User:
 *              type: object
 *              
 */

/**
 * @swagger
 * /users:
 *  get:
 *      summary: Gets all the registered users.
 *      description: This api is used to get all the registered users
 *      responses:
 *          200:
 *              description: The users were returned successfully.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#components/schema/User'
 */
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;