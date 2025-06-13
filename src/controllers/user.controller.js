import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {

    const { name, userName, email, password } = req.body

    if ([name, userName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    //UserSchema se findOne kar rhe hain, mtln jo bhe pehla match hoga wo mil jaayega
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or userName already exist")
    }

    // const profilePictureLocalPath = req.files?.profilePicture[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    // const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        name: name,
        userName: userName,
        email: email,
        password: password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
})



export { registerUser }