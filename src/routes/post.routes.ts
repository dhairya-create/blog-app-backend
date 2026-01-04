import { Router } from "express";

import upload from "../../middleware/upload";
import { getPosts, getPost, createPost, updatePost, deletePost } from "../controllers/post.controllers";

const router = Router();

router.get("/posts", getPosts);
router.get("/post/:id", getPost);
router.post("/post", upload.single("cover"), createPost);
router.put("/post/:id", updatePost);
router.delete("/post/:id", deletePost);

export default router;
