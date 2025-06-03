const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
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
});

likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);