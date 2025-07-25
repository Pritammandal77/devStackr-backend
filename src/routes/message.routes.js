import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";

const router = Router()

router.route("/send-message").post(verifyJWT, sendMessage)

export default router