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


// const setUserAboutData = asyncHandler(async (req, res) => {
//     const { name, userName, bio, githubLink, linkedinLink } = req.body

//     // this gives us the access of profilePicture file , we are extractiong the path of the profilePicture's local server path,
//     //  not from cloudinary
//     //multer gives us req.files access
//     const profilePictureLocalPath = req.files?.profilePicture[0]?.path

//     let profilePicture;
//     if (profilePictureLocalPath) {
//         //uploading this local profilePicture file to cloudinary
//         profilePicture = await uploadOnCloudinary(profilePictureLocalPath)
//     }

//     let coverImageLocalPath;
//     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
//         coverImageLocalPath = req.files.coverImage[0].path
//     }

//     //uploading this local coverImage file to cloudinary
//     let coverImage;
//     if (coverImageLocalPath) {
//         coverImage = await uploadOnCloudinary(coverImageLocalPath);
//     }

//     // if (!profilePicture) {
//     //     throw new ApiError(400, "profilePicture file is required")
//     // }

//     const userAboutData = await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             name: name || "",
//             userName: userName || "",
//             profilePicture: profilePicture?.url || "",
//             coverImage: coverImage?.url || "",
//             bio: bio || "",
//             githubLink: githubLink || "",
//             linkedinLink: linkedinLink || "",
//             // skills: [skills]
//         },
//         {
//             new: true
//         }
//     ).select("-password")

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, userAboutData, "User registered successfully")
//         )

// })


const setUserAboutData = asyncHandler(async (req, res) => {
    const { name, userName, bio, githubLink, linkedinLink } = req.body;

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


export {
    registerUser,
    loginUser,
    logoutUser,
    setUserAboutData,
    refreshAccessToken
}