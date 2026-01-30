import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";

const secret = process.env.JWT_SECRET!;

/* ---------- REGISTER ---------- */
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, username, password } = req.body;

    // extra safety (optional but good)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      username,
      password: hashed,
    });

    res.status(201).json({ message: "Registered" });
  } catch (err: any) {
    // Mongo duplicate key fallback
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username already taken" });
    }

    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ---------- LOGIN ---------- */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isProd = process.env.NODE_ENV === "production";

  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn: "7d",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: isProd,                 // true on Render
      sameSite: isProd ? "none" : "lax",
    })
    .json({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
    });
};

/* ---------- PROFILE ---------- */
export const profile = async (req: Request, res: Response) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const info = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(info.id).select(
      "_id username fullName"
    );
    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ---------- LOGOUT ---------- */
export const logout = (_: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";

  res
    .cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(0),
    })
    .json("ok");
};
