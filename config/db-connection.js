const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
    } catch (error) {
        mongoose.connection.close();
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDatabase;