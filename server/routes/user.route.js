const express = require('express')
const { registerHandler, loginHandler, logoutHandler, refreshAccessToken } = require('../controllers/user.controller.js')
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

module.exports = router