const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");

/**
 * @description Gets all posts posted by a user.
 * @route GET api/posts
 * @access public
 */
const getPosts = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get Posts" });
});

/**
 * @description Get a post posted by a user.
 * @route GET api/posts/:id
 * @access public
 */
const getPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get Post" });
});

/**
 * @description Creates a new post.
 * @route POST api/posts
 * @access private
 */
const createPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Create Post" });
});

/**
 * @description Edit a post
 * @route PUT api/posts/:id
 * @access private
 */
const editPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Edit Post" });
});

/**
 * @description Delete a post
 * @route DELETE api/posts/:id
 * @access private
 */
const deletePost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Delete Post" });
});

/**
 * @description Comment on a post.
 * @route POST api/posts/:id/comments
 * @access public
 */
const commentOnPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Commnet On Post" });
});


/**
 * @description Like/Unlike a post.
 * @route POST api/posts/:id/like
 * @access public
 */
const likePost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Like Post" });
});

module.exports = { getPosts, getPost, createPost, editPost, deletePost, commentOnPost, likePost };