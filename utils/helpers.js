const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
}

async function comparePassword(inputtedPassword, dbPassword) {
    return bcrypt.compare(inputtedPassword, dbPassword);
}

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m"
    });
};

const usernameChecker

module.exports = { hashPassword, comparePassword, generateToken };