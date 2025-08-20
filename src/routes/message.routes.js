import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router()

router.route("/send-message").post(verifyJWT, sendMessage)

router.route("/fetch-message/:chatId").get(verifyJWT, fetchMessages)

export default router