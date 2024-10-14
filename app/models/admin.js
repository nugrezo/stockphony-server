const mongoose = require("mongoose");
const { User, userSchema } = require("./user");

const adminSchema = new mongoose.Schema(
  {
    role: { type: String, default: "admin" },
    permissions: { type: [String], default: ["create", "update", "delete"] },
  },
  {
    timestamps: true,
    toObject: {
      // remove `hashedPassword` field when we call `.toObject`
      transform: (_doc, admin) => {
        delete admin.hashedPassword;
        return admin;
      },
    },
  }
);

module.exports = mongoose.model("Admin", adminSchema);
