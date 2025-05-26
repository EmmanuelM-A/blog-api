const mongoose = require("mongoose");
const User = require("./models/user-schema");
const { hashPassword } = require("./utils/helpers");
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);

        const email = "admin@example.com";

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin already exists.");
        } else {
            const hashedPassword = await hashPassword("Admin@123");
            const admin = await User.create({
                username: "admin",
                email,
                password: hashedPassword,
                role: "admin"
            });

            console.log("Admin user created:", admin.email);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding admin:", err.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();