require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGODB_URI;

if (!MONGO_URL) {
  console.error("MONGODB_URL is not defined in environment variables");
  return;
}

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Successfully Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
