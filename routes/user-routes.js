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

router.route('/posts').get(getPosts).post(createPost);

router.route('/posts/:id').get(getPost).put(editPost).delete(deletePost);

router.post('/posts/:id/comments', commentOnPost);

router.post('/posts/:id/like', likePost);


module.exports = router;