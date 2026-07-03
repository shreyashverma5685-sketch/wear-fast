const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const protect = require("../middleware/auth");

// GET all items for logged in user
router.get("/", protect, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new item
router.post("/", protect, async (req, res) => {
  try {
    const item = await Item.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an item
router.put("/:id", protect, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an item
router.delete("/:id", protect, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;