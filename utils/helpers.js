const bcrypt = require("bcrypt");

async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
}

module.exports = { hashPassword };