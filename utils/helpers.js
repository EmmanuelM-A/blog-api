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

const generateAccessToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m"
    });
};

const generateRefreshToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d" // TODO: LOOK INTO THIS AGAIN
    });
}

module.exports = { hashPassword, comparePassword, generateAccessToken, generateRefreshToken };