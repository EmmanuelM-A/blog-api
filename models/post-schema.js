const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const postSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: uuidv4
    },
    title: {
        type: String,
        required: [true, "All posts must have a title!"],
    },
    content: {
        type: String,
        required: [true, "All posts must have content!"],
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);