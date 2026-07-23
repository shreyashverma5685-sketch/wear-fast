const mongoose = require("mongoose");

const outfitHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
    ],
    category: {
      type: String,
      default: "Best Match",
    },
    wornAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const OutfitHistory = mongoose.model("OutfitHistory", outfitHistorySchema);

module.exports = OutfitHistory;
