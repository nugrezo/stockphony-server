const passport = require("passport");
const bearer = require("passport-http-bearer");

// Import Admin model
const Admin = require("../app/models/admin");

// Define the Bearer strategy for Admin
const adminStrategy = new bearer.Strategy(async function (token, done) {
  try {
    // Log the received token
    console.log("Received Admin token:", token);

    // Find an admin by token
    const admin = await Admin.findOne({ token: token });

    // Log the found admin (if any)
    console.log("Found Admin:", admin);

    // If found, pass it to the route handler
    return done(null, admin, { scope: "all" });
  } catch (error) {
    // Log the error
    console.error("Error in Admin.findOne:", error);
    return done(error);
  }
});

// serialize and deserialize functions are used by passport
passport.serializeUser((admin, done) => {
  done(null, admin);
});

passport.deserializeUser((admin, done) => {
  done(null, admin);
});

// Register the admin strategy with passport
passport.use("admin-bearer", adminStrategy);

module.exports = passport.initialize();
