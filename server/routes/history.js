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

// DELETE /history/:id - Delete a specific history log entry
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await OutfitHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "History record not found" });
    }

    res.json({ message: "Outfit removed from history", id: req.params.id });
  } catch (err) {
    console.error("Error deleting outfit history record:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /history/undo - Undo/remove recent worn log matching itemIds
router.post("/undo", protect, async (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "itemIds array is required" });
    }

    // Sort requested item IDs string representations
    const targetItemIdsStr = itemIds.map(id => id.toString()).sort().join(",");

    // Find user's history records
    const records = await OutfitHistory.find({ userId: req.userId }).sort({ wornAt: -1 });

    let matchRecord = null;
    for (const rec of records) {
      const recItemIdsStr = rec.itemIds.map(id => id.toString()).sort().join(",");
      if (recItemIdsStr === targetItemIdsStr) {
        matchRecord = rec;
        break;
      }
    }

    if (matchRecord) {
      await OutfitHistory.findByIdAndDelete(matchRecord._id);
      return res.json({ message: "Outfit undone successfully", id: matchRecord._id });
    }

    res.status(404).json({ message: "No matching history record found to undo" });
  } catch (err) {
    console.error("Error undoing outfit history:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

