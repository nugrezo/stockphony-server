const express = require("express");
const passport = require("passport");
const Stock = require("../models/stock");
const axios = require("axios"); // Import axios for external API requests
const customErrors = require("../../lib/custom_errors");

const requireAdminToken = passport.authenticate("admin-bearer", {
  session: false,
});
const router = express.Router();

// Error handling utilities
const handle404 = customErrors.handle404;
const requireOwnership = customErrors.requireOwnership;

// Function to calculate `change` and `changePercent`
const calculateChange = (initialPrice, dayLow, dayHigh) => {
  const change = dayHigh - initialPrice; // Change is difference between dayHigh and initial price
  const changePercent = ((dayHigh - initialPrice) / initialPrice) * 100; // Calculate percentage change
  return { change, changePercent };
};

// Finnhub API configuration
const finnhubApiKey = "csa9d79r01qsm2oanoc0csa9d79r01qsm2oanocg"; // Replace with your Finnhub API key
const fetchExternalStockData = async (ticker) => {
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubApiKey}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch stock data from Finnhub:", error);
    throw error;
  }
};

// CREATE - POST /stocks (Admin adds a new stock)
router.post("/stocks", requireAdminToken, async (req, res, next) => {
  try {
    const {
      companyName,
      stockTicker,
      stockVolume,
      initialPrice,
      dayHigh,
      dayLow,
      randomPriceGenerator, // Include randomPriceGenerator here
    } = req.body.stock;

    // Check if the stockTicker already exists
    const existingStock = await Stock.findOne({ stockTicker });
    if (existingStock) {
      return res
        .status(400)
        .json({ message: "Stock with this ticker already exists." });
    }

    // Calculate change and changePercent
    const { change, changePercent } = calculateChange(
      initialPrice,
      dayLow,
      dayHigh
    );

    // Create a new stock document for admin-added stock
    const newStock = await Stock.create({
      companyName,
      stockTicker,
      stockVolume,
      initialPrice,
      dayHigh,
      dayLow,
      change,
      changePercent,
      source: "admin",
      owner: req.user._id,
      randomPriceGenerator, // Pass the randomPriceGenerator to Stock.create
    });
    console.log("Newly created stock:", newStock);

    res.status(201).json({ stock: newStock.toObject() });
  } catch (error) {
    next(error);
  }
});

// GET /stocks - Fetch all stocks from the backend (admin-added + external API)
router.get("/stocks", async (req, res, next) => {
  try {
    const adminStocks = await Stock.find(); // Fetch all stocks from the MongoDB collection

    // Fetch external stock data (for example, you can fetch data for predefined tickers)
    const externalTickers = ["AAPL", "GOOGL", "MSFT"]; // Example tickers
    const externalStockPromises = externalTickers.map((ticker) =>
      fetchExternalStockData(ticker)
    );
    const externalStocks = await Promise.all(externalStockPromises);

    const formattedExternalStocks = externalStocks.map((data, index) => ({
      stockTicker: externalTickers[index],
      dayHigh: data.h, // High price
      dayLow: data.l, // Low price
      initialPrice: data.o, // Open price
      change: data.c - data.o, // Current price minus open price
      changePercent: ((data.c - data.o) / data.o) * 100, // Calculate percentage change
      source: "api", // Mark these as external API stocks
    }));

    // Combine admin-added and external API stocks
    const allStocks = [...adminStocks, ...formattedExternalStocks];

    res.status(200).json({ stocks: allStocks });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
