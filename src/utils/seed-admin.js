require("dotenv").config();

const mongoose = require("mongoose");
const { hashPassword } = require("./helpers");
const { findUserByCriteria, createUser } = require("../database/models/user-model");
const logger = require("./logger");

const seedAdmin = async () => {
    const adminDetails = {
        username: "TopDog",
        email: "topdog@example.com",
        password: "TheTopD0g!"
    };

    try {
        await mongoose.connect(process.env.DEV_MONGO_URI);

        const isUserAvailable = await findUserByCriteria({
            $or: [{ username: adminDetails.username }, { email: adminDetails.email }]
        });

        if (isUserAvailable) {
            logger.info("Admin already exists.");
        } else {
            const hashedPassword = await hashPassword(adminDetails.password);

            const admin = await createUser({
                username: adminDetails.username,
                email: adminDetails.email,
                password: hashedPassword,
                role: "admin"
            });

            logger.info("Admin user created:", admin.email);
        }

        mongoose.connection.close();
    } catch (err) {
        logger.error("Error seeding admin:", err.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();