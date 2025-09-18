// seed.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";  // assumes you have models/User.js

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shifttracker";

async function seed() {
    await mongoose.connect(MONGO_URI);

    const username = "testuser";
    const password = "password123";

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // upsert user
    await User.findOneAndUpdate(
        { username },
        { username, password: hashed },
        { upsert: true }
    );

    console.log(`✅ User created: ${username} / ${password}`);
    mongoose.disconnect();
}

seed();
