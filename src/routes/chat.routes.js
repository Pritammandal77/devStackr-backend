import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createGroupChat, createOrFetchChat, fetchChats } from "../controllers/chat.controller.js"

const router = Router()

router.route("/createchat").post(verifyJWT, createOrFetchChat)
router.route("/fetchchats").get(verifyJWT, fetchChats)
router.route("/create-group-chat").get(verifyJWT, createGroupChat)

export default router