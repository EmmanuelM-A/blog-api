const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");


/**
 * @description Like/Unlike a post.
 * @route POST api/posts/:id/like
 * @access public
 */
const likePost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Like Post" });
});

/**
 * @description Get the comments assocaite with a post.
 * @route GET api/posts/:id/like
 * @access public
 */
const getLikesForPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get likes for post" });
});

module.exports = {
    likePost,
    getLikesForPost
}