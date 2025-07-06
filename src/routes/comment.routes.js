import { Router } from "express";
import { createComment, deleteComment, getCurrentPostComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/createcomment").post(verifyJWT, createComment)

router.route("/currentpostcomment").get(getCurrentPostComment)

router.route("/delete-comment/:id").delete(deleteComment)

export default router