const mongoose = require("mongoose");

const example2Schema = new mongoose.Schema(
  {
    content1: {
      type: String,
      required: true,
    },
    content2: {
      type: String,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_doc, comments) => {
        delete comments.createdAt;
        return comments;
      },
    },
  }
);

module.exports = example2Schema;
