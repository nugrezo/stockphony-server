// require necessary NPM packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// require route files
const userRoutes = require("./app/routes/user_routes");
const adminRoutes = require("./app/routes/admin_routes");

// require middleware
const errorHandler = require("./lib/error_handler");
const replaceToken = require("./lib/replace_token");
const requestLogger = require("./lib/request_logger");

// require database configuration logic
const db = require("./config/db");

// require configured passport authentication middleware
const auth = require("./lib/auth");

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 4741;
const clientDevPort = 7165;

// establish database connection
mongoose
  .connect(db, {})
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// instantiate express application object
const app = express();

// Set up CORS configuration with multiple origins
const allowedOrigins = [
  `http://localhost:${clientDevPort}`, // Add other origins here if needed
  `http://localhost:3000`, // Example of another development origin
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and credentials
  })
);

// define port for API to run on
const port = process.env.PORT || serverDevPort;

// Middleware for token authorization
app.use(replaceToken);

// Register passport authentication middleware
app.use(auth);

// Add `express.json` middleware for parsing JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Log each request as it comes in for debugging
app.use(requestLogger);

// Register route files
app.use(userRoutes);
app.use(adminRoutes);

// Register error handling middleware
app.use(errorHandler);

// Run API on designated port
app.listen(port, () => {
  console.log("listening on port " + port);
});

// needed for testing
module.exports = app;
