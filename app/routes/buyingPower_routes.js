const express = require("express");
const passport = require("passport");
const BuyingPower = require("../models/buyingPower");

const requireToken = passport.authenticate("bearer", { session: false });
const router = express.Router();

// Fetch buying power for the authenticated user (no auto-creation)
router.get("/buyingPower", requireToken, async (req, res, next) => {
  try {
    console.log("Received GET /buyingPower request"); // Log request received
    console.log("Authenticated user ID:", req.user._id); // Log authenticated user ID

    const buyingPower = await BuyingPower.findOne({ userId: req.user._id });
    if (!buyingPower) {
      return res.status(404).json({ message: "Buying power not found" });
    }
    console.log("Found buying power:", buyingPower.amount); // Log found amount

    res.status(200).json({ buyingPower: buyingPower.amount });
  } catch (error) {
    console.error("Error in GET /buyingPower:", error); // Log any errors

    next(error);
  }
});

// Create buying power for the authenticated user
router.post("/buyingPower", requireToken, async (req, res, next) => {
  try {
    const existingBuyingPower = await BuyingPower.findOne({
      userId: req.user._id,
    });
    if (existingBuyingPower) {
      return res.status(400).json({ message: "Buying power already exists" });
    }

    const newBuyingPower = await BuyingPower.create({
      userId: req.user._id,
      amount: req.body.amount || 10000, // Default value or custom amount from the request
    });

    res.status(201).json({ buyingPower: newBuyingPower.amount });
  } catch (error) {
    next(error);
  }
});

// Update buying power for the authenticated user
router.patch("/buyingPower", requireToken, async (req, res, next) => {
  try {
    const { amount } = req.body;
    const buyingPower = await BuyingPower.findOneAndUpdate(
      { userId: req.user._id },
      { amount },
      { new: true }
    );

    if (!buyingPower) {
      return res.status(404).json({ message: "Buying power not found" });
    }

    res.status(200).json({ buyingPower: buyingPower.amount });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
