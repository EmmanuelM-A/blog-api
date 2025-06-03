const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const commentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: uuidv4
    },
    content: {
        type: String,
        required: [true, "Content is required!"]
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