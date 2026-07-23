const express = require("express");
const router = express.Router();
const OutfitHistory = require("../models/OutfitHistory");
const protect = require("../middleware/auth");

// POST /history - Save a new worn outfit log
router.post("/", protect, async (req, res) => {
  try {
    const { itemIds, category, wornAt } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "itemIds array is required" });
    }

    const historyRecord = new OutfitHistory({
      userId: req.userId,
      itemIds,
      category: category || "Best Match",
      wornAt: wornAt ? new Date(wornAt) : Date.now(),
    });

    const saved = await historyRecord.save();
    const populated = await OutfitHistory.findById(saved._id).populate("itemIds");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error creating outfit history record:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /history - Fetch user's worn outfit logs sorted by date descending
router.get("/", protect, async (req, res) => {
  try {
    const history = await OutfitHistory.find({ userId: req.userId })
      .sort({ wornAt: -1 })
      .populate("itemIds");

    res.json(history);
  } catch (err) {
    console.error("Error fetching outfit history:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
