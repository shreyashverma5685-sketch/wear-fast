const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  color: {
    type: String,
    required: true,
    enum: ["black", "white", "grey", "navy", "beige", "brown", "red", "blue", "green", "yellow", "pink", "orange", "purple"],
    default: "black",
  },
  fit: {
    type: String,
    required: true,
    enum: ["slim", "regular", "loose", "oversized"],
    default: "regular",
  },
  fabricWeight: {
    type: String,
    required: true,
    enum: ["light", "medium", "heavy"],
    default: "medium",
  },
  formality: {
    type: String,
    required: true,
    enum: ["casual", "smart-casual", "formal"],
    default: "casual",
  },
  occasion: { type: String, required: true },
  image: { type: String },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;