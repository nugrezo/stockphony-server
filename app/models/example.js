const mongoose = require("mongoose");
const sampleContentSchema = require("./example2");
const sampleContent1Schema = require("./example1");

const exampleSchema = new mongoose.Schema(
  {
    content1: {
      type: String,
      required: true,
    },
    content2: {
      type: String,
      ref: "User",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content3: [sampleContentSchema],
    content4: [sampleContent1Schema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Example", exampleSchema);
