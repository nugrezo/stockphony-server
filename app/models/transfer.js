const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the user who is making the transfer
      required: true,
    },
    transferType: {
      type: String,
      enum: ["toStockphony", "fromStockphony"], // Define the types of transfer
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    routingNumber: {
      type: String,
      required: true,
    },
    bankAccount: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Ensure a positive amount
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"], // Track transfer status
      default: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Transfer", transferSchema);
