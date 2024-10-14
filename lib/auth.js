// require authentication related packages
const passport = require("passport");
const bearer = require("passport-http-bearer");

// user model will be used to set `req.user` in
// authenticated routes
const User = require("../app/models/user");
const Admin = require("../app/models/admin");

// this strategy will grab a bearer token from the HTTP headers and then
// run the callback with the found token as `token`
const strategy = new bearer.Strategy(async function (token, done) {
  try {
    // Log the received token
    console.log("Received token:", token);
    
    // Look for a user or admin whose token matches the one from the header
    let user = await Admin.findOne({ token }) || await User.findOne({ token: token });
    let role;
    if (user.__t === "Admin") {
      role = "admin";
    } else {
      role = "user";
    }
    // Log the found user (if any) and their role
    console.log(`Authenticated ${role}: ${user.email}`);

    // If we found a user, pass it along to the route files
    // If we didn't, `user` will be `null`
    return done(null, user, { scope: "all" });
  } catch (error) {
    // Log the error
    console.error("Error in User.findOne:", error);
    return done(error);
  }
});

// serialize and deserialize functions are used by passport under
// the hood to determine what `req.user` should be inside routes
passport.serializeUser((user, done) => {
  // we want access to the full Mongoose object that we got in the
  // strategy callback, so we just pass it along with no modifications
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// register this strategy with passport
passport.use(strategy);

// create a passport middleware based on all the above configuration
module.exports = passport.initialize();
