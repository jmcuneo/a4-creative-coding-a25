const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Shift = require("../models/Shift");

const router = express.Router();


let currentUser = null;

// --- LOGIN / LOGOUT ---
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        let user = await User.findOne({ username });

        // If user doesn't exist, create
        if (!user) {
            const hashed = await bcrypt.hash(password, 10);
            user = await User.create({ username, passwordHash: hashed });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        currentUser = user;
        res.json({ username: user.username, _id: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

router.post("/logout", (req, res) => {
    currentUser = null;
    res.json({ success: true });
});

// --- SHIFTS ---
router.get("/shifts", async (req, res) => {
    if (!currentUser) return res.status(401).json({ error: "Not logged in" });

    const shifts = await Shift.find({ user: currentUser._id }).lean();
    res.json(shifts);
});

router.post("/shifts", async (req, res) => {
    if (!currentUser) return res.status(401).json({ error: "Not logged in" });

    try {
        const { restaurant, hours, tips } = req.body;
        const shift = await Shift.create({
            restaurant,
            hours,
            tips,
            user: currentUser._id,
        });
        res.json(shift);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to save shift" });
    }
});

router.put("/shifts/:id", async (req, res) => {
    if (!currentUser) return res.status(401).json({ error: "Not logged in" });

    try {
        const { restaurant, hours, tips } = req.body;
        const shift = await Shift.findOneAndUpdate(
            { _id: req.params.id, user: currentUser._id },
            { restaurant, hours, tips },
            { new: true }
        );
        if (!shift) return res.status(404).json({ error: "Shift not found" });
        res.json(shift);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to update shift" });
    }
});

router.delete("/shifts/:id", async (req, res) => {
    if (!currentUser) return res.status(401).json({ error: "Not logged in" });

    try {
        await Shift.findOneAndDelete({ _id: req.params.id, user: currentUser._id });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to delete shift" });
    }
});

router.get("/shifts/:id", async (req, res) => {
    if (!currentUser) return res.status(401).json({ error: "Not logged in" });

    try {
        const shift = await Shift.findOne({ _id: req.params.id, user: currentUser._id }).lean();
        if (!shift) return res.status(404).json({ error: "Shift not found" });
        res.json(shift);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to fetch shift" });
    }
});

module.exports = router;

