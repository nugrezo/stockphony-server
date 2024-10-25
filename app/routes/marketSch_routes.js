const express = require("express");
const passport = require("passport");
const MarketSchedule = require("../models/marketSchedule");
const customErrors = require("../../lib/custom_errors");

const requireAdminToken = passport.authenticate("admin-bearer", {
  session: false,
});

const router = express.Router();

// Error handling utilities
const handle404 = customErrors.handle404;

// Function to fetch external market schedule data (if required)
const fetchExternalMarketData = async () => {
  // If you need to fetch external market data, implement it here
  // For example, you could call an external API to get market hours in different regions
};

// CREATE or UPDATE - POST /set-market-schedule (Admin sets market schedule)
router.post(
  "/set-market-schedule",
  requireAdminToken,
  async (req, res, next) => {
    try {
      const { openTime, closeTime, holidays } = req.body;

      // Check if there is an existing market schedule
      let marketSchedule = await MarketSchedule.findOne();
      if (!marketSchedule) {
        marketSchedule = new MarketSchedule();
      }

      // Update market schedule with the new values
      marketSchedule.openTime = openTime;
      marketSchedule.closeTime = closeTime;
      marketSchedule.holidays = holidays;

      // Save the updated schedule to the database
      await marketSchedule.save();

      res
        .status(200)
        .json({ message: "Market schedule updated successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// GET /market-schedule - Fetch the current market schedule (admin-added + external data if needed)
router.get("/market-schedule", async (req, res, next) => {
  try {
    const marketSchedule = await MarketSchedule.findOne();

    // If no admin-defined schedule exists, use default
    const openTime = marketSchedule?.openTime || "09:30";
    const closeTime = marketSchedule?.closeTime || "16:30";
    const holidays = marketSchedule?.holidays || [];
    const timeZone = marketSchedule?.timeZone || "America/New_York";

    const today = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD'
    const currentTime = new Date().toLocaleTimeString("en-US", {
      timeZone: timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Check if today is a holiday
    const isHoliday = holidays.includes(today);

    // Check if market is open or closed
    const isMarketOpen =
      (currentTime >= openTime && currentTime <= "23:59") ||
      (currentTime >= "00:00" && currentTime <= closeTime);

    let message;

    if (isHoliday) {
      message = "The market is closed today due to a holiday.";
    } else if (!isMarketOpen) {
      message = `The market is currently closed. It will open at ${openTime} (local time).`;
    } else {
      message = `The market is currently open and will close at ${closeTime} (local time).`;
    }

    // Return the schedule with the appropriate message
    res.status(200).json({
      schedule: {
        openTime,
        closeTime,
        holidays,
        timeZone,
      },
      message,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
