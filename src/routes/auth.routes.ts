import { Router } from "express";
import {
  register,
  login,
  profile,
  logout,
} from "../controllers/auth.controllers";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", profile);
router.post("/logout", logout);

export default router;
