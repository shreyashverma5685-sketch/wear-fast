const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const itemRoutes = require("./routes/items");
const authRoutes = require("./routes/auth");
const suggestionsRouter = require("./routes/suggestions");
const historyRoutes = require("./routes/history");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow local dev, plus any deployed frontend URL set via env var.
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: allowedOrigins }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/items", itemRoutes);
app.use("/auth", authRoutes);
app.use("/suggestions", suggestionsRouter);
app.use("/history", historyRoutes);

app.get("/", (req, res) => {
  res.send("WEAR FAST server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});