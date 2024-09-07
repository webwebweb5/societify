import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnFollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.patch("/update", protectRoute, updateUser);

export default router;