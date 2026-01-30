// ✅ MUST BE FIRST LINE — loads .env
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
console.log("MONGO_URL:", process.env.MONGO_URL);


const app = express();
const PORT = process.env.PORT || 3001;

/* ---------- CORS ---------- */
const allowedOrigins = [
  "http://localhost:5173",
 "https://blog-app-frontend-black.vercel.app"

];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(cookieParser());

/* ---------- DATABASE ---------- */
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  throw new Error("❌ MONGO_URL is not defined");
}

mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
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
