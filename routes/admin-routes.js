const express = require('express');
const router = express.Router();
const { authorizeRoles } = require("../middleware/role-middleware");
const { getAllUsers, deleteUser, updateUserRole } = require("../controllers/admin-controller");
const { authRouteProtection } = require('../middleware/auth-middleware');

router.use(authRouteProtection, authorizeRoles('admin'));

/**
 * @swagger
 *  components:
 *      schema:
 *          User:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                  username:
 *                      type: string
 *                  email:
 *                      type: string
 *                  role:
 *                      type: string
 *                  createdAt:
 *                      type: string
 *                  updatedAt:
 *                      type: string
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

/**
 * @swagger
 * /users/{id}:
 *  delete:
 *      summary: Delete a user by their id.
 *      description: This api deletes a given user by their id.
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: The user's uuid
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: The users was deleted successfully.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: "User JohnD deleted successfully."
 *                          
 */
router.delete('/users/:id', deleteUser);


router.patch('/users/:id/role', updateUserRole);

module.exports = router;