const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
    restaurant: { type: String, required: true },
    hours: { type: Number, required: true },
    tips: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.models.Shift || mongoose.model("Shift", shiftSchema);
