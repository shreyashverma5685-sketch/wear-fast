const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const itemRoutes = require("./routes/items");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/items", itemRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("WEAR FAST server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});