import { Router } from "express";
import { followUser, unfollowUser } from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/follow").post(verifyJWT, followUser)

router.route("/unfollow").post(verifyJWT, unfollowUser)

export default router