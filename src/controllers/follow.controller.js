import { Follow } from "../models/follow.model";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const followUser = asyncHandler(async (req, res) => {
    const { userToFollow } = req.body
    const currentUser = req.user._id

    if (currentUser.toString() === userToFollow) {
        throw new ApiError(400, "You can't follow yourself");
    }

    const alreadyFollowed = await Follow.findOne({
        follower: currentUser,
        following: userToFollow
    });

    if (alreadyFollowed) {
        new ApiResponse(200, {}, "already following")
    }

    await Follow.create(
        {
            follower: currentUser,
            following: userToFollow
        }
    )

    return new res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Followed successfully")
        )
})