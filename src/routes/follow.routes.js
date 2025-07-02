import { Router } from "express";
import { followUser, getFollowersList, getFollowingList, unfollowUser } from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
 
router.route("/follow").post(verifyJWT, followUser)

router.route("/unfollow").post(verifyJWT, unfollowUser)

router.route("/followerslist/:id").get(getFollowersList)

router.route("/followingslist/:id").get(getFollowingList)

export default router