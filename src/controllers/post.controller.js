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

    // Upload image if available
    if (imageLocalPath) {
        imageUrl = await uploadOnCloudinary(imageLocalPath);
        if (!imageUrl?.url) throw new ApiError(400, "Error while uploading image");
    }

    // Upload video if available
    if (videoLocalPath) {
        videoUrl = await uploadOnCloudinary(videoLocalPath);
        if (!videoUrl?.url) throw new ApiError(400, "Error while uploading video");
    }

    // Create post
    const newPost = await Post.create({
        description,
        image: imageUrl.url,
        video: videoUrl.url,
        author: userId
    });

    // Add post to user's posts array
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
            options: { sort: { createdAt: -1 } },  //it will sort it in newest posts first to older olders
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


const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({})
        .sort({ createdAt: -1 }) // Latest posts first
        .populate({
            path: "author",
            select: "name userName profilePicture"
        });

    if (!posts || posts.length === 0) {
        throw new ApiError(404, "No posts found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, posts, "All posts fetched successfully")
        );
});


const likesCount = asyncHandler(async (req, res) => {
    const { postId } = req.body
    const userId = req.user._id

    const post = await Post.findById(postId)

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
        post.likes.pull(userId); // Unlike
    } else {
        post.likes.push(userId); // Like
    }

    await post.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                postId: post._id,
                likesCount: post.likes.length,
                likes: post.likes,
                likedByUser: !alreadyLiked
            }, alreadyLiked ? "Post unliked" : "Post liked")
        );

})


const getUserPostsById = asyncHandler(async (req, res) => {
    const { postIds } = req.body;

    if (!Array.isArray(postIds)) {
        throw new ApiError(400, "postIds must be an array");
    }

    const posts = await Post.find({ _id: { $in: postIds } }).populate("author").sort({ createdAt: -1 });

    if (posts.length === 0) {
        throw new ApiError(404, "No posts found");
    }

    return res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});


export {
    createPost,
    getCurrentUserPosts,
    getAllPosts,
    likesCount,
    getUserPostsById
};
