import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAboutData} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

//using the verifyJWT middleware
router.route("/logout").post(verifyJWT, logoutUser)


router.route("/updateUserAboutData").post(
    verifyJWT,
    upload.fields([
        {
            name: "profilePicture",
            maxCount: 1 //how many files we are required
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    updateUserAboutData
)

router.route("/refresh-token").post(refreshAccessToken)

export default router