import mongoose, { Schema } from "mongoose";

const postsSchema = (
    {
        description: {
            type: String,
            maxlength : 400,
            required : true
        },
        image: {
            type: String, //url from cloudinary
        },
        video: {
            type: String //url from cloudinary
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comments"
        }],
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
    },
    {
        timestamps: true
    }
)

export const Posts = mongoose.model("Post", postsSchema)