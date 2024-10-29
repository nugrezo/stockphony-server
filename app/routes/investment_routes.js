const express = require("express");
const passport = require("passport");
const errors = require("../../lib/custom_errors");
const Investment = require("../models/investment");

// Custom error classes
const BadParamsError = errors.BadParamsError;

// Enforce authentication with Passport
const requireToken = passport.authenticate("bearer", { session: false });

const router = express.Router();

// Buy action: create or update an investment
// routes/investment_routes.js

router.post("/buy", requireToken, async (req, res, next) => {
  try {
    const { stockTicker, shares, purchasePrice, avgCost, date } =
      req.body.investment;

    if (!stockTicker || shares <= 0 || !purchasePrice || !avgCost) {
      throw new errors.BadParamsError("Invalid investment parameters.");
    }

    // Create a new investment entry for each buy action
    const newInvestment = await Investment.create({
      userId: req.user.id,
      stockTicker,
      shares,
      purchasePrice,
      avgCost,
      date: date || new Date(), // Use provided date or current date
    });

    res.status(201).json({
      message: "Investment created successfully",
      investment: newInvestment,
    });
  } catch (error) {
    next(error);
  }
});

// Get all investments for the authenticated user
router.get("/investments", requireToken, async (req, res, next) => {
  // GET /investments
  try {
    const investments = await Investment.find({ userId: req.user.id });
    res.status(200).json({ investments });
  } catch (error) {
    next(error);
  }
});

// Sell shares of an investment
// Sell shares of an investment
router.post("/sell", requireToken, async (req, res, next) => {
  try {
    const { stockTicker, sharesToSell, sellPrice, date } = req.body.investment;

    // Validate input
    if (!stockTicker || sharesToSell <= 0 || !sellPrice) {
      throw new errors.BadParamsError("Invalid sell parameters.");
    }

    // Find the user's investment based on stockTicker
    const investment = await Investment.findOne({
      userId: req.user.id,
      stockTicker,
    });

    if (!investment || investment.shares < sharesToSell) {
      return res.status(400).json({
        message: `Not enough shares to sell. You currently have ${
          investment ? investment.shares : 0
        } shares.`,
      });
    }

    // Update or remove the investment
    if (investment.shares === sharesToSell) {
      await Investment.deleteOne({ _id: investment._id }); // Delete if selling all shares
      res.status(200).json({ message: "Investment sold completely." });
    } else {
      investment.shares -= sharesToSell;
      await investment.save();
      res
        .status(200)
        .json({ message: "Shares sold successfully.", investment });
    }
  } catch (error) {
    next(error);
  }
});

// Delete an investment (if needed)
router.delete("/investments/:id", requireToken, async (req, res, next) => {
  // DELETE /investments/:id
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.status(200).json({ message: "Investment deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
