// import { Post } from "../models/post.model";
// import { User } from "../models/user.model";
// import { ApiError } from "../utils/ApiError";
// import { ApiResponse } from "../utils/ApiResponse";
// import { asyncHandler } from "../utils/asyncHandler";
// import { uploadOnCloudinary } from "../utils/cloudinary";

// const createPost = asyncHandler(async (req, res) => {
//     const { description } = req.body
//     const userId = req.user._id;

//     let postdescription;

//     if (!description) {
//         postdescription = ""
//     } else {
//         postdescription = description
//     }

//     const imageLocalPath = req.files?.image?.[0]?.path;
//     const videoLocalPath = req.files?.video?.[0]?.path;

//     let imageUrl, videoUrl;

//     if (imageLocalPath) {
//         imageUrl = await uploadOnCloudinary(imageLocalPath);
//     }

//     if (!imageUrl.url) {
//         throw new ApiError(400, "Error while uploading image")
//     }

//     if (videoLocalPath) {
//         videoUrl = await uploadOnCloudinary(videoLocalPath);
//     }

//     if (!videoUrl.url) {
//         throw new ApiError(400, "Error while uploading video")
//     }

//     const newPost = await Post.create({
//         description: postdescription,
//         image: imageUrl,
//         video: videoUrl,
//         author: userId
//     });

//     await User.findByIdAndUpdate(
//         userId,
//         {
//             $push: { posts: newPost._id }
//         }
//     )

//     return res
//         .status(201).
//         json(
//             new ApiResponse(201, newPost, "Post created and linked to user successfully.")
//         );
// })

// export { createPost }

import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
    const { description = "" } = req.body;  // ✅ default empty
    const userId = req.user._id;

    const imageLocalPath = req.files?.image?.[0]?.path;
    const videoLocalPath = req.files?.video?.[0]?.path;

    let imageUrl = { url: "" };
    let videoUrl = { url: "" };

    // ✅ Upload image if available
    if (imageLocalPath) {
        imageUrl = await uploadOnCloudinary(imageLocalPath);
        if (!imageUrl?.url) throw new ApiError(400, "Error while uploading image");
    }

    // ✅ Upload video if available
    if (videoLocalPath) {
        videoUrl = await uploadOnCloudinary(videoLocalPath);
        if (!videoUrl?.url) throw new ApiError(400, "Error while uploading video");
    }

    // ✅ Create post
    const newPost = await Post.create({
        description,
        image: imageUrl.url,
        video: videoUrl.url,
        author: userId
    });

    // ✅ Add post to user's posts array
    await User.findByIdAndUpdate(
        userId,
        { $push: { posts: newPost._id } },
        { new: true }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(201, newPost, "Post created and linked to user successfully.")
        );
});

const getCurrentUserPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
        .populate({
            path: "posts",
            populate: {
                path: "author", // nested populate if needed
                select: "name userName profilePicture"
            }
        });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user.posts, "User posts fetched successfully")
    );
});



export {
    createPost,
    getCurrentUserPosts
};
