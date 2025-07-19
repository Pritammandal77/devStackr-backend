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

    const chats = await Chat.find({
        users: { $elemMatch: { $eq: currUser } }
    })
        .populate("users", "-password -refreshToken")
        .populate("latestMessage")
        .populate("groupAdmin", "-password -refreshToken")
        .sort({ updatedAt: -1 })

    res
        .status(200)
        .json(
            new ApiResponse(200, chats, "hello")
        )
})

const createGroupChat = asyncHandler(async (req, res) => {
    const userIds = JSON.parse(req.body.users)
    const groupName = req.body.groupName
    const currUser = req.user._id

    if (!userIds || !groupName) {
        throw new ApiError(400, "Please send the users & group name")
    }

    if (userIds.length < 2) {
        throw new ApiError(400, "please add 2 or more users to create a group chat")
    }

    userIds.push(currUser) //adding the curr user in the array , to create groupChat

    try {
        const groupChat = await Chat.create({
            chatName: groupName,
            isGroupChat: true,
            users: userIds,
            groupAdmin: currUser
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password -refreshToken")
            .populate("groupAdmin", "-password -refreshToken")

        res
            .status(200)
            .json(
                new ApiResponse(200, fullGroupChat, "groupchat created successfully")
            )
    } catch (error) {
        throw new ApiError(400, error?.message || "Failed to create group chat");
    }
})


const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, newChatName } = req.body;

    if (!chatId || !newChatName) {
        throw new ApiError(400, "Chat ID and new name are required");
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: newChatName
        },
        {
            new: true
        }
    ).populate("users", "-password -refreshToken")
        .populate("groupAdmin", "-password -refreshToken")

    if (!updatedChat) {
        throw new ApiError(400, "Chat not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, updatedChat, "chat name updated successfully")
        )
})


const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and user are required to add a member");
    }

    const addNewMember = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        { new: true }
    ).populate("users", "-password -refreshToken")
        .populate("groupAdmin", "-password -refreshToken")

    if (!addNewMember) {
        throw new ApiError(400, "Chat not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, addNewMember, "new member added successfully")
        )
})


const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and user are required to remove a member");
    }

    const removeMember = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        { new: true }
    ).populate("users", "-password -refreshToken")
        .populate("groupAdmin", "-password -refreshToken")

    if (!removeMember) {
        throw new ApiError(400, "Chat not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, removeMember, "member removed successfully")
        )
})

export {
    createOrFetchChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
}