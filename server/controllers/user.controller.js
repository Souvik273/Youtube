const asyncHandler = require('../utils/asyncHandler.js')
const { ApiError } = require('../utils/ApiError.js')
const uploadOnCloudinary = require('../services/cloudinary.js')
const { ApiResponse } = require('../utils/ApiResponse.js')

const User = require('../models/user.model.js')

const registerUser = asyncHandler(async (req, res) => {
    // get user details 
    // validation 
    // check if already exist : username , email
    // check for images, check for avatar
    // upload them cloudinary , avatar
    // create user object - create entry in db 
    // remove passsword and refresh token field from response
    // check for user creation 
    // return response 

    const { username, email, fullname, password } = req.body

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "user with email and username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    // const coverIageLocalPath = req.files?.coverImage[0]?.path

    let coverIageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverIageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverIageLocalPath)

    if (!avatar) {
        throw new ApiError(404, "Avatar required")
    }

    const newUser = await User.create({
        fullname, avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, password,
        username: username.toLower()
    })

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

module.exports = { registerUser }