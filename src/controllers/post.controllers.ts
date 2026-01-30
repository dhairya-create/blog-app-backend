import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import Post from "../models/Post";
import cloudinary from "../lib/cloudinary";

const secret = process.env.JWT_SECRET!;

export const getPosts = async (_: Request, res: Response) => {
  const posts = await Post.find()
    .populate("author", "fullName")
    .sort({ createdAt: -1 });
  res.json(posts);
};

export const getPost = async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "fullName"
  );
  if (!post) return res.status(404).end();
  res.json(post);
};

export const createPost = async (req: any, res: Response) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = jwt.verify(token, secret) as { id: string };

    let cover: string | null = null;

    if (req.file) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blog-posts" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      cover = uploadResult.secure_url;
    }

    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      cover,
      author: user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).end();

  const user = jwt.verify(token, secret) as { id: string };
  const post = await Post.findById(req.params.id);

  if (!post || post.author.toString() !== user.id)
    return res.status(403).end();

  post.title = req.body.title;
  post.content = req.body.content;
  await post.save();

  res.json(post);
};

export const deletePost = async (req: Request, res: Response) => {
  const { token } = req.cookies;
  const user = jwt.verify(token, secret) as { id: string };

  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== user.id)
    return res.status(403).end();

  await post.deleteOne();
  res.json({ message: "Deleted" });
};
