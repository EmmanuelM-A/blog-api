const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const { validateUsername } = require("../utils/input-validator");



/**
 * @description Creates a new blog post.
 * @route POST api/posts
 * @access private
 */
const createPost = asyncHandler( async (request, response) => {
    const { title, content } = request.body;
    const authorID = request.params?.id;

    if (!authorID) {
        logger.warn("Unauthorized post creation attempt.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to create a post.");
    }

    if (typeof title !== "string" || typeof content !== "string") {
        logger.error("Invalid input types for post creation.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content must be strings.");
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
        logger.error("Empty title or content in post creation.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content must not be empty.");
    }

    if (trimmedTitle.length > constants.MAX_POST_TITLE_LENGTH) {
        logger.error(`Post title exceeds ${constants.MAX_POST_TITLE_LENGTH} characters.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`);
    }

    if (trimmedContent.length > constants.MAX_POST_CONTENT_LENGTH) {
        logger.error(`Post content exceeds ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
    }

    const post = await Post.create({
        title: trimmedTitle,
        content: trimmedContent,
        authorID
    });

    logger.info(`New post created by user ${authorID} with ID: ${post.id}`);

    response.status(status.CREATED).json({ post });
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
const getAllPostsByUser = asyncHandler(async (request, response) => {
    const { username } = request.params;
    const page = parseInt(request.query.page) || 1;

    if(!username) {
        logger.error("Missing username field");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Username must present!");
    }

    if(!validateUsername(username)) {
        logger.error("Invalid input");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Invalid username!");
    }

    const skip = (page - 1) * constants.POSTS_PER_PAGE_LIMIT;

    logger.debug(`Fetching the posts for the user: ${username} (page ${page})`);

    const userDB = await User.findOne({ username });

    if (!userDB) {
        logger.warn(`User not found: ${username}`);
        response.status(status.NOT_FOUND);
        throw new Error("User does not exist!");
    }

    logger.info(`Found the user ${username} with ID: ${userDB.id}`);

    const userPosts = await Post.find({ author_id: userDB.id })
        .skip(skip)
        .limit(constants.POSTS_PER_PAGE_LIMIT)
        .sort({ createdAt: -1 });

    const totalPosts = await Post.countDocuments({ author_id: userDB._id });

    logger.info(`Fetched ${userPosts.length} posts for user ${username}`);

    response.status(status.OK).json({
        userPosts,
        page,
        totalPages: Math.ceil(totalPosts / constants.POSTS_PER_PAGE_LIMIT),
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

module.exports = { getAllPosts, getAllPostsByUser, createPost, editPost, deletePost, commentOnPost, likePost, getCommentsForPost, getLikesForPost };