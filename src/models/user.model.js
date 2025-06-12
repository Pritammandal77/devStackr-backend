import mongoose, { Schema } from "mongoose"

const userSchema = (
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true     //whenever we use any field as an searcheble element , then we set its index : true , but ye jada use karne se performance issues aate hain
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+\@.+\..+/, "Please enter a valid email address"]
        },
        password: {
            type: String,
            required: [true, 'Password is required'], //custom error, if user doesnt inputs their password
            minlength: [8, "Password must be at least 8 characters long"]
        },
        avatar: {
            type: String, //getting the url from cloudinary
            required: true,
        },
        coverImage: {
            type: String, //getting the url from cloudinary
        },
        bio: {
            type: String,
            maxlength: 250
        },
        githubLink: {
            type: String,
            trim: true
        },
        linkedinLink: {
            type: String,
            trim: true
        },
        skills: [String] // e.g. ['React', 'Node.js', 'MongoDB']
        ,
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }],
        projects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project"
        }],
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema)