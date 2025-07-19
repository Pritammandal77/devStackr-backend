import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//for creating and fetching 1-1 chat
const createOrFetchChat = asyncHandler(async (req, res) => {
    const currUser = req.user._id
    const { userId } = req.body //2nd person id, jiske saath currUser chat karega

    if (!userId) {
        throw new ApiError(400, "cannot get the userId from the params")
    }

    if (userId === currUser.toString()) {
        throw new ApiError(400, "You cannot create a chat with yourself");
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: currUser } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password -refreshToken").populate("latestMessage")

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: "name pic email"
    })

    if (isChat.length > 0) {
        res
            .status(200)
            .json(
                new ApiResponse(200, isChat[0], "chat fetched successfully")
            )
    } else {
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [currUser, userId]
        }

        try {
            const createdChat = await Chat.create(chatData)

            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password -refreshToken")

            res
                .status(200)
                .json(
                    new ApiResponse(200, FullChat, "chat created succesfully")
                )
        } catch (error) {
            throw new ApiError(400, error?.message || "Failed to create chat")
        }
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    const currUser = req.user._id

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "hello")
        )
})

export {
    createOrFetchChat,
    fetchChats
}