import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        comment: {
            type: String,
            maxlength: 400,
            required: true
        },
        postId: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Comment = mongoose.model("Comment", commentSchema)