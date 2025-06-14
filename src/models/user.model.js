import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
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
        profilePicture: {
            type: String, //getting the url from cloudinary
            // required: true,
        },
        coverImage: {
            type: String, //getting the url from cloudinary
        },
        bio: {
            type: String,
            maxlength: 250,
            default: ""
        },
        githubLink: {
            type: String,
            trim: true,
            default: ""
        },
        linkedinLink: {
            type: String,
            trim: true,
            default: ""
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

//it is a middleware , it encrypts the password just before saving it in db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    //to hide the real password
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            userName: this.userName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)