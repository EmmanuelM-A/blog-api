const bcrypt = require("bcrypt");

async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
}

async function comparePassword(inputtedPassword, dbPassword) {
    return bcrypt.compare(inputtedPassword, dbPassword);
}

module.exports = { hashPassword, comparePassword };