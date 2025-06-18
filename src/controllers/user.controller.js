import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}


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

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!(email || password)) {
        throw new ApiError(400, "username and password is required")
    }

    //User.findOne return the first document matches either the email or password (bcoz , we use $or operator)
    const user = await User.findOne({
        $or: [{ email }, { password }]
    })

    if (!user) {
        throw new ApiError(400, "user with this email or does not exist")
    }

    //we are using the isPasswordCorrect method from the user.model.js
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    //generating access & refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                "loggedIn Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out successfully"))

})


const setUserAboutData = asyncHandler(async (req, res) => {
    const { name, userName, bio, about, githubLink, linkedinLink } = req.body;

    const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let profilePicture, coverImage;

    if (profilePictureLocalPath) {
        profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
    }

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    const userAboutData = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: name || "",
            userName: userName || "",
            profilePicture: profilePicture?.url || "", // Only update if provided
            coverImage: coverImage?.url || "",
            bio: bio || "",
            about: about || "",
            githubLink: githubLink || "",
            linkedinLink: linkedinLink || "",
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, userAboutData, "User updated successfully")
    );
});



const refreshAccessToken = asyncHandler(async (req, res) => {
    //user ka refresh token ham cookies se access kar skte hain
    const incomingRefreshToken = req.cookies.resfreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        //verify refreshToken
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    //obvios se baat hain , agar user password change karna chahta hain hain, matlab wo user
    //already logged in hain

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "current user fetched successfully"
            ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    setUserAboutData,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser
}