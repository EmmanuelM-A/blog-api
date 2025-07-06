require('dotenv').config();

const mongoose = require("mongoose");
const { hashPassword } = require("./helpers");
const { findUserByCriteria, updateUserDetail } = require('../database/models/user-model');

/**
 * Setups the admin and save its details to the database.
 */
const seedAdmin = async () => {
    const adminDetails = {
        username: "TopDog",
        email: "topdog@example.com",
        password: "TheTopD0g!"
    };

    try {
        await mongoose.connect(process.env.CONNECTION_STRING);

        const isUserAvaiable = await findUserByCriteria({ $or: [{ username: adminDetails.username }, { email: adminDetails.email }] });

        if (isUserAvaiable) {
            console.log("Admin already exists.");
        } else {
            const hashedPassword = await hashPassword(adminDetails.password);

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