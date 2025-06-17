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

const { 
    getLikesForPost, 
    likePost 
} = require('../controllers/like-controller');

const { authRouteProtection } = require('../middleware/auth-middleware');
const { authorizeRoles } = require('../middleware/role-middleware');


///////////////////////////////////////////// PUBLIC ROUTES /////////////////////////////////////////////

router.get('/', getAllPosts);

router.get('/user/:username', getAllPostsByUser);

router.get('/comments/:postId', getCommentsForPost);

router.get('/likes/:postId', getLikesForPost);

// Protected routes for authors/admins
router.post('/', authRouteProtection, authorizeRoles('author', 'admin'), createPost);

router.patch('/:postId', authRouteProtection, authorizeRoles('author', 'admin'), editPost);

router.delete('/:postId', authRouteProtection, authorizeRoles('author', 'admin'), deletePost);

router.post('/comment/:postId', authRouteProtection, commentOnPost);

router.post('/like/:postId', authRouteProtection, likePost);

module.exports = router;