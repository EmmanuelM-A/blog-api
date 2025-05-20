const express = require('express');
const router = express.Router();
const { 
    getPosts, 
    getPost, 
    createPost, 
    editPost, 
    deletePost, 
    commentOnPost, 
    likePost 
} = require("../controllers/post-controller");

router.route('/').get(getPosts).post(createPost);

router.route('/:id').get(getPost).put(editPost).delete(deletePost);

router.post('/:id/comments', commentOnPost);

router.post('/:id/like', likePost);

module.exports = router;