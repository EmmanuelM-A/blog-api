const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema"); 
const { validatePostTitle } = require("../utils/input-validator");
const logger = require("../utils/logger");



/**
 * @description Creates a new post.
 * @route POST api/posts
 * @access private
 */
const createPost = asyncHandler( async (request, response) => {
    const { title, content } = request.body;

    const authorID = request.user?.id;

    if (typeof title !== "string" || typeof content !== "string" || !title.trim() || !content.trim()) {
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content are required and must be non-empty strings.");
    }

    if (title.length > constants.MAX_POST_TITLE_LENGTH) {
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`);
    }

    if (content.length > constants.MAX_POST_CONTENT_LENGTH) {
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
    }

    if (!authorID) {
        response.status(status.UNAUTHORIZED);
        throw new Error("You must be logged in to create a post.");
    }

    // Create and save the post
    const post = await Post.create({
        title: title.trim(),
        content: content.trim(),
        authorID
    });

    response.status(status.CREATED).json({post});

    logger.info(`The author: ${authorID} posted a new post: ${post.id}`);
});



/**
 * @description Gets all posts posted.
 * @route GET api/posts
 * @access public
 */
const getAllPosts = asyncHandler( async (request, response) => {
    const page = parseInt(request.query.page) || 1;

    const LIMIT = 10;

    const skip = (page - 1) * LIMIT;

    // Get all posts within range
    const allPosts = await Post.find()
        .skip(skip).
        limit(LIMIT).
        sort({ createdAt: -1 });

    const total = await Post.countDocuments();

    response.status(status.OK).json({
        allPosts,
        page,
        totalPages: Math.ceil(total / LIMIT),
        totalPosts: total
    });
});

/**
 * @description Get all posts by a specific user by username.
 * @route GET /api/posts/user/:username
 * @access Public
 */
const getAllUserPosts = asyncHandler(async (request, response) => {
    const { username } = request.params;
    const page = parseInt(request.query.page) || 1;
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    logger.debug(`Fetching posts for user: ${username} (page ${page})`);

    // Step 1: Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
        logger.warn(`User not found: ${username}`);
        return response.status(status.NOT_FOUND).json({
            message: "User not found"
        });
    }

    logger.info(`Found user ${username} with ID: ${user._id}`);

    // Step 2: Find posts by user ID
    const userPosts = await Post.find({ author_id: user._id })
        .skip(skip)
        .limit(LIMIT)
        .sort({ createdAt: -1 });

    const totalPosts = await Post.countDocuments({ author_id: user._id });

    logger.info(`Fetched ${userPosts.length} posts for user ${username}`);

    response.status(status.OK).json({
        userPosts,
        page,
        totalPages: Math.ceil(totalPosts / LIMIT),
        totalPosts
    });
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
 * @route POST api/posts/:id/comment
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

/**
 * @description Get the comments assocaited with a post.
 * @route GET api/posts/:id/like
 * @access public
 */
const getCommentsForPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get comments for posts" });
});

/**
 * @description Get the comments assocaite with a post.
 * @route GET api/posts/:id/like
 * @access public
 */
const getLikesForPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get likes for post" });
});

module.exports = { getPosts, getPost, createPost, editPost, deletePost, commentOnPost, likePost, getCommentsForPost, getLikesForPost };