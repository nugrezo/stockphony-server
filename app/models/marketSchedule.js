const mongoose = require("mongoose");

const marketScheduleSchema = new mongoose.Schema(
  {
    openTime: { type: String, required: true }, // Store time in 'HH:mm' format
    closeTime: { type: String, required: true }, // Store time in 'HH:mm' format
    timeZone: { type: String, default: "America/New_York" }, // Time zone
    holidays: [{ type: String }], // List of holidays in 'YYYY-MM-DD' format
  },
  { timestamps: true }
);

const MarketSchedule = mongoose.model("MarketSchedule", marketScheduleSchema);

module.exports = MarketSchedule;
