const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const itemRoutes = require("./routes/items");

const app = express();
const PORT = 5000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/items", itemRoutes);

app.get("/", (req, res) => {
  res.send("WEAR FAST server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});