// require necessary NPM packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// require route files
const userRoutes = require("./app/routes/user_routes");
const adminRoutes = require("./app/routes/admin_routes");
const stockRoutes = require("./app/routes/stock_routes");
const marketScheduleRoutes = require("./app/routes/marketSch_routes"); // Import market schedule routes
const transferRoutes = require("./app/routes/transfer_routes");
const investmentRoutes = require("./app/routes/investment_routes");
const buyingPowerRoutes = require("./app/routes/buyingPower_routes");
const transactionHistoryRoutes = require("./app/routes/transactionHistory_routes");

// const example1Routes = require("./app/routes/example1_routes");
// const example2Routes = require("./app/routes/example2_routes");

// require middleware
const errorHandler = require("./lib/error_handler");
const replaceToken = require("./lib/replace_token");
const requestLogger = require("./lib/request_logger");

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require("./config/db");

// require configured passport authentication middleware
const auth = require("./lib/auth");
const adminAuth = require("./lib/adminAuth");

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 4741;
const clientDevPort = 7165;

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
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

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on render.com
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}`,
  })
);

// define port for API to run on
const port = process.env.PORT || serverDevPort;

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken);

// register passport authentication middleware
app.use(auth);
app.use(adminAuth);

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json());
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// log each request as it comes in for debugging
app.use(requestLogger);

// register route files
app.use(userRoutes);
app.use(adminRoutes);
app.use(stockRoutes);
app.use(marketScheduleRoutes);
app.use(transferRoutes);
app.use(investmentRoutes);
app.use(buyingPowerRoutes);
app.use(transactionHistoryRoutes);

// app.use(example1Routes);
// app.use(example2Routes);

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler);

// run API on designated port (4741 in this case)
app.listen(port, () => {
  console.log("listening on port " + port);
});

// needed for testing
module.exports = app;
