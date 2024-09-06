import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", signup);
router.get("/login", login);
router.get("/logout", logout);

export default router;
