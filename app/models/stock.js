const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    stockTicker: {
      type: String,
      required: true,
      unique: true,
    },
    stockVolume: {
      type: Number,
      required: true, // Must be filled for admin-added stocks
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    dayHigh: {
      type: Number,
      required: true, // Admin must fill this when adding stock
    },
    dayLow: {
      type: Number,
      required: true, // Admin must fill this when adding stock
    },
    change: {
      type: Number,
      required: true, // Calculated change from initialPrice and dayLow
    },
    changePercent: {
      type: Number,
      required: true, // Calculated percentage change from dayLow
    },
    source: {
      type: String, // 'api' for API stocks, 'admin' for admin-added stocks
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null, // API stocks don't have owners, admin-added ones do
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toObject: {
      // Remove `owner` and `source` when sending data to the frontend
      transform: (_doc, stock) => {
        delete stock.owner;
        delete stock.source;
        return stock;
      },
    },
  }
);

module.exports = mongoose.model("Stock", stockSchema);
