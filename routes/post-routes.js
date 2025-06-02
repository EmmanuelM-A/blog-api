const express = require('express');
const router = express.Router();
const { 
    getAllPosts, 
    getAllPostsByUser, 
    createPost, 
    editPost, 
    deletePost,
} = require("../controllers/post-controller");

const { 
    commentOnPost,
    getCommentsForPost
} = require("../controllers/comment-controller");

const { authRouteProtection } = require('../middleware/auth-middleware');
const { authorizeRoles } = require('../middleware/role-middleware');
const { getLikesForPost, likePost } = require('../controllers/like-controller');


// Public routes
router.route('/').get(getAllPosts);

router.route('/user/:username').get(getAllPostsByUser);

router.get('/:postId/comments', getCommentsForPost);

router.get('/:postId/likes', getLikesForPost);

router.post('/:postId/comment', authRouteProtection, commentOnPost);

router.post('/:postId/like', authRouteProtection, likePost);

// Protected routes for authors/admins
router.post('/', authRouteProtection, authorizeRoles('author', 'admin'), createPost);

router.patch('/:postId', authRouteProtection, authorizeRoles('author', 'admin'), editPost);

router.delete('/:postId', authRouteProtection, authorizeRoles('author', 'admin'), deletePost);

module.exports = router;