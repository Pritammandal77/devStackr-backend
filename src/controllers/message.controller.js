import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, message } = req.body
    const currUser = req.user._id

    if (!chatId || !message) {
        throw new ApiError(400, "Invalid data passed into the request")
    }

    let newMessage = await Message.create({
        sender: currUser,
        content: message,
        chat: chatId
    })

    newMessage = await newMessage.populate("sender", "_id name profilePicture")
    newMessage = await newMessage.populate("chat")

    newMessage = await User.populate(newMessage, {
        path: 'chat.users',
        select: '_id name profilePicture email'
    })

    if (!newMessage) {
        throw new ApiError(500, "error while sending the message")
    }

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: newMessage
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, newMessage, "message sent successfully")
        )
})

const fetchMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    if (!chatId) {
        throw new ApiError(400, "could'nt get the chat ID")
    }

    const messages = await Message.find({ chat: chatId }).populate(
        "sender", "_id name profilePicture"
    ).populate("chat")

    if (!messages) {
        throw new ApiError(500, "Error while fetching the messages")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, messages, "messages fetched successfully")
        )
})

export {
    sendMessage,
    fetchMessages
}