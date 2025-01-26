const express = require('express')
const { registerHandler, loginHandler, logoutHandler, refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,changeAvatar,changeCoverImage,getUserChannelProfile,getWatchHistory } = require('../controllers/user.controller.js')
const { upload } = require('../middlewares/multer.middleware.js')
const verifyJWT = require('../middlewares/auth.middleware.js')

const router = express.Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    , registerHandler)

router.route("/login").post(loginHandler)

// private route
router.route("/logout").post(verifyJWT,logoutHandler)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/get-user").get(verifyJWT,getCurrentUser)
router.route("/update-details").post(verifyJWT,updateAccountDetails)
router.route("/change-avatar").post(verifyJWT,upload.single("avatar"),changeAvatar)
router.route("/change-cover-image").post(verifyJWT,upload.single("coverImage"),changeCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

module.exports = router