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
        return (
          this.transactionType === "buy" || this.transactionType === "sell"
        );
      },
    },
    shares: {
      type: Number,
      required: function () {
        return (
          this.transactionType === "buy" || this.transactionType === "sell"
        );
      },
    },
    pricePerShare: {
      type: Number,
      required: function () {
        return (
          this.transactionType === "buy" || this.transactionType === "sell"
        );
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
