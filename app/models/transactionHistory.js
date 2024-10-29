const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["deposit", "withdrawal", "buy", "sell"],
      required: true,
    },
    bankName: {
      type: String,
      required: function () {
        return ["deposit", "withdrawal"].includes(this.transactionType);
      },
    },
    routingNumber: {
      type: String,
      required: function () {
        return ["deposit", "withdrawal"].includes(this.transactionType);
      },
    },
    bankAccount: {
      type: String,
      required: function () {
        return ["deposit", "withdrawal"].includes(this.transactionType);
      },
    },
    stockTicker: {
      type: String,
      required: function () {
        return ["buy", "sell"].includes(this.transactionType);
      },
    },
    shares: {
      type: Number,
      required: function () {
        return ["buy", "sell"].includes(this.transactionType);
      },
    },
    pricePerShare: {
      type: Number,
      required: function () {
        return ["buy", "sell"].includes(this.transactionType);
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TransactionHistory", transactionHistorySchema);
