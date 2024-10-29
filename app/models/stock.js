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
      required: true,
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    dayHigh: {
      type: Number,
      required: true,
    },
    dayLow: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    changePercent: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    randomPriceGenerator: {
      type: String,
      enum: ["yes", "no"],
      default: "no", // Default to 'no' if not specified
    },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_doc, stock) => {
        delete stock.owner;
        delete stock.source;
        return stock;
      },
    },
  }
);

module.exports = mongoose.model("Stock", stockSchema);
