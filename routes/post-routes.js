const express = require('express');
const router = express.Router();
const { 
    getPosts, 
    getPost, 
    createPost, 
    editPost, 
    deletePost, 
    commentOnPost, 
    likePost,
    getCommentsForPost,
    getLikesForPost 
} = require("../controllers/post-controller");

const { authRouteProtection } = require('../middleware/auth-middleware');
const { authorizeRoles } = require('../middleware/role-middleware');


// Public routes
router.route('/').get(getPosts);

router.route('/:id').get(getPost);

router.get('/:id/comments', getCommentsForPost);

router.get('/:id/likes', getLikesForPost);

router.post('/:id/comment', authRouteProtection, commentOnPost);

router.post('/:id/like', authRouteProtection, likePost);

// Protected routes for authors/admins
router.post('/', authRouteProtection, authorizeRoles('author', 'admin'), createPost);

router.put('/:id', authRouteProtection, authorizeRoles('author', 'admin'), editPost);

router.delete('/:id', authRouteProtection, authorizeRoles('author', 'admin'), deletePost);

module.exports = router;