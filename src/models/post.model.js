import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const postSchema = new Schema(
    {
        description: {
            type: String,
            maxlength: 2000,
            required: true
        },
        image: {
            type: String, //url from cloudinary
        },
        video: {
            type: String //url from cloudinary
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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

postSchema.plugin(mongooseAggregatePaginate)


export const Post = mongoose.model("Post", postSchema)