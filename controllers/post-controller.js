const asyncHandler = require("express-async-handler");

/**
 * @description Gets all posts posted by a user.
 * @route GET api/posts
 * @access public
 */
const getPosts = asyncHandler( async () => {

});

/**
 * @description Get a post posted by a user.
 * @route GET api/posts/:id
 * @access public
 */
const getPost = asyncHandler( async () => {

});

/**
 * @description Creates a new post.
 * @route POST api/posts
 * @access private
 */
const createPost = asyncHandler( async () => {

});

/**
 * @description Edit a post
 * @route PUT api/posts/:id
 * @access private
 */
const editPost = asyncHandler( async () => {

});

/**
 * @description Delete a post
 * @route DELETE api/posts/:id
 * @access private
 */
const deletePost = asyncHandler( async () => {

});

/**
 * @description Comment on a post.
 * @route POST api/posts/:id/comments
 * @access private
 */
const commentOnPost = asyncHandler( async () => {

});


/**
 * @description Like/Unlike a post.
 * @route POST api/posts/:id/like
 * @access private
 */
const likePost = asyncHandler( async () => {

});