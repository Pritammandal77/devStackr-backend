import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addToGroup, createGroupChat, createOrFetchChat, fetchChats, removeFromGroup, renameGroup } from "../controllers/chat.controller.js"

const router = Router()

router.route("/createchat").post(verifyJWT, createOrFetchChat)
router.route("/fetchchats").get(verifyJWT, fetchChats)
router.route("/create-group-chat").post(verifyJWT, createGroupChat)
router.route("/rename-group").put(verifyJWT, renameGroup)
router.route("/add-new-member").put(verifyJWT, addToGroup)
router.route("/remove-member").put(verifyJWT, removeFromGroup)

export default router