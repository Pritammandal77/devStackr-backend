import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";

const createComment = asyncHandler(async (req, res) => {
    const { postId, commentText } = req.body
    const user = req.user._id

    if (!user) {
        throw new ApiError("no user found")
    }

    if (!postId) {
        throw new ApiError("postId is required")
    }

    if (!commentText) {
        throw new ApiError("comment is required")
    }

    const newComment = await Comment.create({
        comment: commentText,
        postId: postId,
        user: user
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, newComment, "comment created successfully")
        )
})

const getCurrentPostComment = asyncHandler(async (req, res) => {
    const { postId } = req.query

    const comments = await Comment.find({ postId }).populate({
        path: "user",
        select: "_id name userName profilePicture"
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "comments fetched successfully")
        );
})

export {
    createComment,
    getCurrentPostComment
}