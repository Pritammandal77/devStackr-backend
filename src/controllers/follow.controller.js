import { Follow } from "../models/follow.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const followUser = asyncHandler(async (req, res) => {
    const { userToFollow } = req.body

    //we are getting this req.user._id because of the verifyJWT middleware
    const currentUser = req.user._id

    if (currentUser.toString() === userToFollow) {
        throw new ApiError(400, "You can't follow yourself");
    }

    const alreadyFollowed = await Follow.findOne({
        follower: currentUser,
        following: userToFollow
    });

    if (alreadyFollowed) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Already following")
            );
    }

    await Follow.create(
        {
            follower: currentUser,
            following: userToFollow
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Followed successfully")
        )
})

const unfollowUser = asyncHandler(async (req, res) => {
    const { userToUnfollowId } = req.body
    const currentUserId = req.user._id

    const follow = await Follow.findOneAndDelete({
        follower: currentUserId,
        following: userToUnfollowId
    });

    if (!follow) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, {}, "Not following this user")
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Unfollowed successfully")
        );
})


const getFollowersList = asyncHandler(async (req, res) => {
    const { id } = req.params
    // const userId = req.params.userId;
    const followers = await Follow.find({ following: id }).populate({
        path: "follower",
        select: "-password -refreshToken"
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, followers, "followers fetched successfully")
        )
})

const getFollowingList = asyncHandler(async (req, res) => {
    const { id } = req.params

    const following = await Follow.find({ follower: id }).populate({
        path: "following",
        select: "-password -refreshToken"
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, following, "following fetched successfully")
        )
})

export {
    followUser,
    unfollowUser,
    getFollowersList,
    getFollowingList
}