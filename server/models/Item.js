const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  color: { type: String, required: true },
  occasion: { type: String, required: true },
  image: { type: String },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;