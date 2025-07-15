const express = require('express');
const router = express.Router();
const { getAllPosts, getAllPostsByUser, createPost, editPost, deletePost } = require("../controllers/post-controller");

const { commentOnPost, getCommentsForPost } = require("../controllers/comment-controller");

const { getLikesForPost, likePost } = require('../controllers/like-controller');

const { authorizeRoles } = require("../../../middleware/authorize-roles");
const { authRouteProtection } = require('../../../middleware/authorize-routes');


///////////////////////////////////////////// PUBLIC ROUTES /////////////////////////////////////////////

router.get('/', getAllPosts);

router.get('/user/:username', getAllPostsByUser);

router.get('/comments/:postId', getCommentsForPost);

router.get('/likes/:postId', getLikesForPost);

///////////////////////////////////////////// PROTECTED ROUTES FOR AUTHORS AND ADMINS /////////////////////////////////////////////

router.post('/', authRouteProtection, authorizeRoles('user', 'author', 'admin'), createPost);

router.patch('/:postId', authRouteProtection, authorizeRoles('author', 'admin'), editPost);

router.delete('/:postId', authRouteProtection, authorizeRoles('author', 'admin'), deletePost);

router.post('/comment/:postId', authRouteProtection, commentOnPost);

router.post('/like/:postId', authRouteProtection, likePost);

module.exports = router;