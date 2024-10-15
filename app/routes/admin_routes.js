const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Admin = require("../models/admin");
const errors = require("../../lib/custom_errors");

const bcryptSaltRounds = 10;
const BadParamsError = errors.BadParamsError;
const BadCredentialsError = errors.BadCredentialsError;

const requireAdminToken = passport.authenticate("admin-bearer", {
  session: false,
});

const router = express.Router();

// ADMIN SIGN-UP
router.post("/admin-sign-up", async (req, res, next) => {
  try {
    const credentials = req.body.credentials;

    if (
      !credentials ||
      !credentials.password ||
      credentials.password !== credentials.password_confirmation
    ) {
      throw new BadParamsError();
    }

    const hash = await bcrypt.hash(credentials.password, bcryptSaltRounds);

    const newAdmin = await Admin.create({
      fullName: credentials.fullName,
      email: credentials.email,
      adminID: credentials.adminID,
      hashedPassword: hash,
    });

    res.status(201).json({ admin: newAdmin.toObject() });
  } catch (error) {
    next(error);
  }
});

// ADMIN SIGN-IN
router.post("/admin-sign-in", async (req, res, next) => {
  const { adminID, password } = req.body.credentials;

  try {
    const admin = await Admin.findOne({ adminID });

    if (!admin) {
      throw new BadCredentialsError();
    }

    const correctPassword = await bcrypt.compare(
      password,
      admin.hashedPassword
    );

    if (!correctPassword) {
      throw new BadCredentialsError();
    }

    const token = crypto.randomBytes(16).toString("hex");
    admin.token = token;

    await admin.save();

    res.status(201).json({ admin: admin.toObject() });
  } catch (error) {
    next(error);
  }
});

// ADMIN SIGN-OUT
router.delete("/admin-sign-out", requireAdminToken, (req, res, next) => {
  // create a new random token for the admin, invalidating the current one
  req.user.token = crypto.randomBytes(16);
  // save the token and respond with 204
  req.user
    .save()
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;
