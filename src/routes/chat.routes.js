import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createOrFetchChat, fetchChats } from "../controllers/chat.controller.js"

const router = Router()

router.route("/createchat").post(verifyJWT, createOrFetchChat)
router.route("/fetchchats").get(verifyJWT, fetchChats)

export default router