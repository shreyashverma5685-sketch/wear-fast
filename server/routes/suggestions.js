const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const protect = require("../middleware/auth");

router.post("/", protect, async (req, res) => {
  try {
    const { occasion, weather, timeOfDay } = req.body;

    const allItems = await Item.find({ userId: req.userId });

    const matching = allItems.filter((item) => item.occasion === occasion);

    const buckets = {
      top: matching.filter((item) => item.category === "top"),
      bottom: matching.filter((item) => item.category === "bottom"),
      dress: matching.filter((item) => item.category === "dress"),
      shoes: matching.filter((item) => item.category === "shoes"),
      accessory: matching.filter((item) => item.category === "accessory"),
    };

    const outfit = {};

    if (buckets.dress.length > 0) {
      outfit.dress = buckets.dress[0];
    } else {
      if (buckets.top.length > 0) outfit.top = buckets.top[0];
      if (buckets.bottom.length > 0) outfit.bottom = buckets.bottom[0];
    }

    if (buckets.shoes.length > 0) outfit.shoes = buckets.shoes[0];
    if (buckets.accessory.length > 0) outfit.accessory = buckets.accessory[0];

    if (Object.keys(outfit).length === 0) {
      return res.status(404).json({ message: "No matching items found for this occasion" });
    }

    res.json({ occasion, weather, timeOfDay, outfit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;