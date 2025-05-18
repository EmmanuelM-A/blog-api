const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);

        console.log(`MongoDB connected: ${connect.connection.host} Database: ${connect.connection.name}.`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDatabase;