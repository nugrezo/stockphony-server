const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    stockphonyAccountNumber: {
      type: String,
      unique: true,
    },
    bankInfo: {
      bankName: { type: String },
      bankAccountNumber: { type: String },
      routingNumber: { type: String },
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    token: String,
    profilePhoto: {
      type: String,
      ref: "Image",
    },
  },
  {
    timestamps: true,
    toObject: {
      // remove `hashedPassword` field when we call `.toObject`
      transform: (_doc, user) => {
        delete user.hashedPassword;
        return user;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
