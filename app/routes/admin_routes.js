const express = require("express");
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require("crypto");
// Passport docs: http://www.passportjs.org/docs/
const passport = require("passport");
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require("bcrypt");

// see above for explanation of "salting", 10 rounds is recommended
const bcryptSaltRounds = 10;

// pull in error types and the logic to handle them and set status codes
const errors = require("../../lib/custom_errors");

const BadParamsError = errors.BadParamsError;

const BadCredentialsError = errors.BadCredentialsError;

const Admin = require("../models/admin");

const multer = require("multer");

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate("bearer", { session: false });

const router = express.Router();

// SIGN UP
// POST /sign-up
router.post("/sign-up", async (req, res, next) => {
  try {
    const credentials = req.body.credentials;

    if (
      !credentials ||
      !credentials.password ||
      credentials.password !== credentials.password_confirmation
    ) {
      throw new BadParamsError();
    }

    const hash = await bcrypt.hash(
      req.body.credentials.password,
      bcryptSaltRounds
    );

    const admin = {
      fullName: req.body.credentials.fullName,
      email: req.body.credentials.email,
      username: req.body.credentials.username,
      hashedPassword: hash,
    };

    const newAdmin = await Admin.create(admin);

    res.status(201).json({ admin: newAdmin.toObject() });
  } catch (error) {
    next(error);
  }
});

// SIGN IN
// POST /sign-in

router.post("/sign-in", async (req, res, next) => {
  const pw = req.body.credentials.password;

  try {
    const admin = await Admin.findOne({ email: req.body.credentials.email });

// TODO: maybe different error message for Admin?
    if (!admin) {
      throw new BadCredentialsError();
    }

    const correctPassword = await bcrypt.compare(pw, admin.hashedPassword);

    if (!correctPassword) {
      throw new BadCredentialsError();
    }

    // If the passwords matched
    const token = crypto.randomBytes(16).toString("hex");
    admin.token = token;

    // Save the token to the DB as a property on the user
    await admin.save();

    // Return status 201, the email, and the new token
    res.status(201).json({ admin: admin.toObject() });
  } catch (error) {
    // Handle errors and pass them to the error handler
    next(error);
  }
});

// CHANGE password
// PATCH /change-password
router.patch("/change-password", requireToken, async (req, res, next) => {
  try {
    // `req.user` will be determined by decoding the token payload
    const admin = await Admin.findById(req.admin.id);

    // check that the old password is correct
    const correctPassword = await bcrypt.compare(
      req.body.passwords.old,
      admin.hashedPassword
    );

    // `correctPassword` will be true if hashing the old password ends up the
    // same as `user.hashedPassword`
    if (!req.body.passwords.new || !correctPassword) {
      throw new BadParamsError();
    }

    // hash the new password
    const hash = await bcrypt.hash(req.body.passwords.new, bcryptSaltRounds);

    // set and save the new hashed password in the DB
    admin.hashedPassword = hash;
    await admin.save();

    // respond with no content and status 204
    res.sendStatus(204);
  } catch (error) {
    // pass any errors along to the error handler
    next(error);
  }
});

router.delete("/sign-out", requireToken, (req, res, next) => {
  // create a new random token for the user, invalidating the current one
  req.admin.token = crypto.randomBytes(16);
  // save the token and respond with 204
  req.admin
    .save()
    .then(() => res.sendStatus(204))
    .catch(next);
});

// GET /users/:id
router.get("/admin/:id", requireToken, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      throw new BadCredentialsError();
    }

    // Respond with user JSON
    res.status(200).json({ admin: admin.toObject() });
  } catch (error) {
    // If an error occurs, pass it to the error handler middleware
    next(error);
  }
});

router.patch("/change-username/:id", requireToken, async (req, res, next) => {
  try {
    // Find the user by ID
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      throw new BadCredentialsError();
    }

    // Update the username if provided in the request body
    if (req.body.username) {
      admin.username = req.body.username;
    }

    // Save the updated user
    await admin.save();

    // If the update succeeded, return 204 and no JSON
    res.sendStatus(204);
  } catch (error) {
    // If an error occurs, pass it to the error handler middleware
    next(error);
  }
});

// PATCH /change-email/:id
router.patch("/change-email/:id", requireToken, async (req, res, next) => {
  try {
    // Find the user by ID
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      throw new BadCredentialsError();
    }

    // Update the email if provided in the request body
    if (req.body.email) {
      admin.email = req.body.email;
    }

    // Save the updated user
    await admin.save();

    // If the update succeeded, return 204 and no JSON
    res.sendStatus(204);
  } catch (error) {
    // If an error occurs, pass it to the error handler middleware
    next(error);
  }
});

// POST /upload-photo - Handle photo uploads for authenticated users
router.post("/upload-photo", requireToken, async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    console.log("req.body in photo upload is ", req.body);
    
// TODO: Do we want to add different token handlers in auth.js for admin vs users? 

    // Find the user by ID
    const admin = await Admin.findById(req.admin.id);

    console.log("User object before update:", admin);

    // Check if an image URL was provided
    if (!imageUrl) {
      return res.status(400).json({ message: "No photo URL provided" });
    }

    // Verify that the user making the request is the owner
    if (!admin || admin._id.toString() !== req.admin.id) {
      console.log("Unauthorized access. User not found or IDs do not match.");
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Update the user's profile photo
    admin.profilePhoto = imageUrl;
    await admin.save();
    console.log("Photo URL saved successfully");

    // Respond with success message
    res.status(201).json({
      message: "Photo uploaded successfully",
      admin: admin,
    });
  } catch (error) {
    next(error);
  }
});

// GET /photos/:id - Retrieve and display a specific photo by its ID
router.get("/get-photo", requireToken, async (req, res, next) => {
  try {
    // Find the user by ID
    const admin = await Admin.findById(req.admin.id);

    console.log("User object:", admin);

    // Check if the user exists
    if (!admin) {
      console.log("User not found.");
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has a profile photo
    if (!admin.profilePhoto) {
      console.log("User has no profile photo.");
      return res.status(404).json({ message: "User has no profile photo" });
    }

    // Return the user's profile photo URL
    res.status(200).json({
      message: "Profile photo retrieved successfully",
      photoUrl: admin.profilePhoto,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /delete-photo - Handle photo deletion for authenticated users

router.delete("/delete-photo", requireToken, async (req, res, next) => {
  try {
    // Find the user by ID
    const admin = await Admin.findById(req.admin.id);

    console.log("User object before deleting photo:", admin);

    // Check if the user exists
    if (!admin) {
      console.log("User not found.");
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has a profile photo
    if (!admin.profilePhoto) {
      console.log("User has no profile photo to delete.");
      return res
        .status(404)
        .json({ message: "User has no profile photo to delete" });
    }

    // Delete the user's profile photo
    admin.profilePhoto = undefined; // Remove the photo URL
    await admin.save();
    console.log("Profile photo deleted successfully");

    // Respond with success message
    res.status(200).json({
      message: "Profile photo deleted successfully",
      admin: admin,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
