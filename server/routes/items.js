const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const protect = require("../middleware/auth");

// GET all items for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new item for the logged-in user
router.post("/", protect, async (req, res) => {
  try {
    const item = await Item.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an item (only if it belongs to the logged-in user)
router.put("/:id", protect, async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an item (only if it belongs to the logged-in user)
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;