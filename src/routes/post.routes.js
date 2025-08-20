import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPost, deleteAPost, editPost, getAllPosts, getAPostById, getCurrentUserPosts, getUserPostsById, likesCount } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/createpost").post(
    verifyJWT,
    upload.fields([
        {
            name: "image",
            maxCount: 1 // how many files we are required
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

router.route("/allposts").get(getAllPosts)

router.route("/likes").put(verifyJWT, likesCount)

router.route("/userpostsbyid").post(getUserPostsById);

router.route("/deletepost/:postId").delete(deleteAPost)

router.route("/getpostbyid/:postId").get(getAPostById)

router.route("/editpost/:postId").post(editPost)

export default router