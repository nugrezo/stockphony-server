// app/models/buyingPower.js
const mongoose = require("mongoose");

const buyingPowerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one buying power entry per user
    },
    amount: {
      type: Number,
      default: 10000, // Default initial buying power
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BuyingPower", buyingPowerSchema);
