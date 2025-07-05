const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { constants } = require('../utils/constants');

const commentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: uuidv4
    },
    content: {
        type: String,
        required: [true, "Content is required!"],
        maxLength: constants.MAX_CHAR_COMMENT_LENGTH
    },
    post_id: {
        type: String,
        required: true,
        ref: "Post"
    },
    user_id: {
        type: String,
        required: true,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);