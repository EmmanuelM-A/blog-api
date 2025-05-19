const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: uuidv4
    },
    username: {
        type: String,
        required: [true, "Name is required!"]
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);