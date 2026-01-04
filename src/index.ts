// ✅ MUST BE FIRST LINE — loads .env
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";

const app = express();
const PORT = process.env.PORT || 3001;


const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("❌ CLIENT_URL is not defined in .env");
}

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* ---------- DATABASE ---------- */
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  throw new Error("❌ MONGO_URL is not defined in .env");
}

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ---------- ROUTES ---------- */
app.use(authRoutes);
app.use(postRoutes);

/* ---------- SERVER ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

