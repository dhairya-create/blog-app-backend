import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";

const secret = process.env.JWT_SECRET!;

export const register = async (req: Request, res: Response) => {
  const { fullName, username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ fullName, username, password: hashed });
  res.json({ message: "Registered" });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  jwt.sign({ id: user._id }, secret, {}, (_, token) => {
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",

    }).json({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
    });
  });
};

export const profile = async (req: Request, res: Response) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).end();

  const info = jwt.verify(token, secret) as { id: string };
  const user = await User.findById(info.id).select("_id username fullName");
  res.json(user);
};

export const logout = (_: Request, res: Response) => {
  res.cookie("token", "", { expires: new Date(0) }).json("ok");
};
