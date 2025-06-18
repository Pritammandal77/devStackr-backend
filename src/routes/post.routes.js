import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPost, getCurrentUserPosts } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/createpost").post(
    verifyJWT,
    upload.fields([
        {
            name: "image",
            maxCount: 1 //how many files we are required
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    createPost
)

router.route("/getcurrentuserposts").get(
    verifyJWT,
    getCurrentUserPosts
)

export default router