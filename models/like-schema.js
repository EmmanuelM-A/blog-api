const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
});

module.exports = mongoose.model("Like", likeSchema);