const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const { validateUsername } = require("../utils/input-validator");
const redisClient = require("../config/redis-client");
const { clearPostCache } = require("../utils/cache-utils");

// TODO: SETUP REDIS CACHE AND TEST CACHING

/**
 * @description Creates a new blog post.
 * @route POST api/posts
 * @access privateí
 */
const createPost = asyncHandler( async (request, response) => {
    const { title, content } = request.body;
    const author_id = request.query.author_id;

    if (!author_id) {
        logger.warn("Unauthorized post creation attempt.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to create a post.");
    }

    const user = await User.findById(author_id);
    if (!user) {
        logger.error(`User not found for ${author_id}.`);
        response.status(status.NOT_FOUND);
        throw new Error("User not found.");
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

    // Clear cache
    logger.info("Cache cleared on post creation!");

    await clearPostCache();

    logger.info(`Post creation attempt by the user: ${author_id}`);

    const post = await Post.create({
        title: trimmedTitle,
        content: trimmedContent,
        author_id: author_id,
    });

    logger.info(`New post created by user ${author_id} with ID: ${post.id}`);

    response.status(status.CREATED).json({ post });
});

/**
 * @description Gets all posts with pagination. Uses Redis cache
 * @route GET api/posts
 * @access public
 */
const getAllPosts = asyncHandler( async (request, response) => {
    const page = parseInt(request.query.page) || 1;

    const skip = (page - 1) * constants.POSTS_PER_PAGE_LIMIT;

    const cacheKey = `posts:page:${page}`;

    logger.debug("Get all posts request sent!");

    // Try to fetch from cache
    const cached = await redisClient.get(cacheKey);

    if (cached) {
        logger.debug(`Cache hit for ${cacheKey}`);
        logger.info("Fetched the user posts");
        return res.status(status.OK).json(JSON.parse(cached));
    }

    // Get all posts within range
    const allPosts = await Post.find()
        .skip(skip)
        .limit(constants.POSTS_PER_PAGE_LIMIT)
        .sort({ createdAt: -1 })
        .populate("user_id", "username");

    const total = await Post.countDocuments();

    const responseData = {
        allPosts,
        page,
        totalPages: Math.ceil(total / LIMIT),
        totalPosts: total
    };

    logger.info("Fetched the user posts");

    // Cache the response
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData)); // Cache for 1 hour

    logger.debug(`Cache set for ${cacheKey}`);

    response.status(status.OK).json(responseData);
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

    logger.info(`Fetching the posts for the user: ${username} (page ${page})`);

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
 * @route PATCH api/posts/:id
 * @access private
 */
const editPost = asyncHandler( async (request, response) => {
    const { title, content } = request.body;
    const { postId } = request.params;
    const userId = request.user?.id;

    if (!userId) {
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

    if (String(post.author_id) !== String(userId)) {
        logger.warn(`User ${userId} attempted to edit post ${postId} without permission.`);
        response.status(status.FORBIDDEN);
        throw new Error("You do not have permission to edit this post.");
    }

    // Clear cache
    logger.info("Cache cleared on post editing!");
    await clearPostCache();

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
 * @route DELETE api/posts/:postId
 * @access private
 */
const deletePost = asyncHandler( async (request, response) => {
    const { postId } = request.params;
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

    // Clear cache
    logger.info("Cache cleared on post deletion!");
    await clearPostCache();

    await post.deleteOne();

    logger.info(`Post ${postId} deleted by user ${userId}.`);
    response.status(status.OK).json({ 
        message: "Post deleted successfully." 
    });
});

module.exports = { getAllPosts, getAllPostsByUser, createPost, editPost, deletePost };