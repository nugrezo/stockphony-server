const express = require("express");
const passport = require("passport");
const TransactionHistory = require("../models/transactionHistory");
const requireToken = passport.authenticate("bearer", { session: false });
const errors = require("../../lib/custom_errors");
const BadParamsError = errors.BadParamsError;

const router = express.Router();

// POST /transactions (with prefix within this file)
router.post("/transactions", requireToken, async (req, res, next) => {
  try {
    const {
      transactionType,
      bankName,
      routingNumber,
      bankAccount,
      stockTicker,
      shares,
      pricePerShare,
      amount,
    } = req.body;

    // Validate transaction type and required fields
    if (!transactionType || !amount) {
      throw new BadParamsError("Transaction type and amount are required.");
    }

    // Create new transaction document
    const newTransaction = await TransactionHistory.create({
      user: req.user._id,
      transactionType,
      bankName,
      routingNumber,
      bankAccount,
      stockTicker,
      shares,
      pricePerShare,
      amount,
      status: "pending",
    });

    res.status(201).json({ transaction: newTransaction.toObject() });
  } catch (error) {
    next(error);
  }
});

// GET /transactions - Retrieve all transactions for the authenticated user
router.get("/transactions", requireToken, async (req, res, next) => {
  try {
    // Find all transactions where the user matches the authenticated user
    const transactions = await TransactionHistory.find({
      user: req.user._id,
    }).sort({ createdAt: -1 }); // Sorting by creation date (newest first)
    console.log("Fetched user transactions:", transactions); // Log transactions

    res.status(200).json({
      transactions: transactions.map((transaction) => transaction.toObject()),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
