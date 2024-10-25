const express = require("express");
const passport = require("passport");
const Transfer = require("../models/transfer");
const errors = require("../../lib/custom_errors");
const requireToken = passport.authenticate("bearer", { session: false });
const BadParamsError = errors.BadParamsError;

const router = express.Router();

// POST /transfer-funds
router.post("/transfer-funds", requireToken, async (req, res, next) => {
  try {
    const { transferType, bankName, routingNumber, bankAccount, amount } =
      req.body;

    // Validate input
    if (
      !transferType ||
      !bankName ||
      !routingNumber ||
      !bankAccount ||
      !amount
    ) {
      throw new BadParamsError("All fields are required.");
    }

    // Create new transfer document
    const newTransfer = await Transfer.create({
      user: req.user._id, // Get the user from the authenticated request
      transferType,
      bankName,
      routingNumber,
      bankAccount,
      amount,
      status: "pending", // Default to "pending"
    });

    // Send success response
    res.status(201).json({ transfer: newTransfer.toObject() });
  } catch (error) {
    next(error); // Pass error to the error handler middleware
  }
});

module.exports = router;
