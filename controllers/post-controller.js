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

    const skip = (page - 1) * constants.POSTS_PER_PAGE_LIMIT;

    // Get all posts within range
    const allPosts = await Post.find()
        .skip(skip).
        limit(constants.POSTS_PER_PAGE_LIMIT).
        sort({ createdAt: -1 });

    const total = await Post.countDocuments();

    response.status(status.OK).json({
        allPosts,
        page,
        totalPages: Math.ceil(total / constants.POSTS_PER_PAGE_LIMIT),
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
    const { title, content } = request.body;
    const postID = request.params.id;
    const userID = request.params?.id;

    if (!userID) {
        logger.warn("Unauthorized attempt to edit post.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to edit a post.");
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

    const post = await Post.findById(postId);

    if (!post) {
        logger.warn(`Edit failed: Post with id ${postId} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    if (String(post.authorID) !== String(userId)) {
        logger.warn(`User ${userId} attempted to edit post ${postId} without permission.`);
        response.status(status.FORBIDDEN);
        throw new Error("You do not have permission to edit this post.");
    }

    post.title = trimmedTitle;
    post.content = trimmedContent;
    await post.save();

    logger.info(`Post ${postId} edited by user ${userId}.`);
    response.status(status.OK).json({ 
        message: "Post updated successfully.", 
        post 
    });
});

/**
 * @description Delete a post
 * @route DELETE api/posts/:id
 * @access private
 */
const deletePost = asyncHandler( async (request, response) => {
    const postId = request.params.id;
    const userId = request.user?.id;

    if (!userId) {
        logger.warn("Unauthorized attempt to delete post.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to delete a post.");
    }

    const post = await Post.findById(postId);

    if (!post) {
        logger.warn(`Delete failed: Post with id ${postId} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    if (String(post.author_id) !== String(userId)) {
        logger.warn(`User ${userId} attempted to delete post ${postId} without permission.`);
        response.status(status.FORBIDDEN);
        throw new Error("You do not have permission to delete this post.");
    }

    await post.deleteOne();

    logger.info(`Post ${postId} deleted by user ${userId}.`);
    response.status(status.OK).json({ 
        message: "Post deleted successfully." 
    });
});

module.exports = { getAllPosts, getAllPostsByUser, createPost, editPost, deletePost };