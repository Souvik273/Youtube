const asyncHandler = require('../utils/asyncHandler.js')
const { ApiError } = require('../utils/ApiError.js')
const uploadOnCloudinary = require('../services/cloudinary.js')
const { ApiResponse } = require('../utils/ApiResponse.js')
const User = require('../models/user.model.js')

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        // find the user 
        const user = await User.findById(userId)

        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        if (!accessToken || !refreshToken) {
            throw new Error("Token generation failed");
        }

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        console.log(`Error while generating the tokens: ${error.message}`)
    }
}

const registerHandler = asyncHandler(async (req, res) => {
    // get user details 
    // validation 
    // check if already exist : username , email
    // check for images, check for avatar
    // upload them cloudinary , avatar
    // create user object - create entry in db 
    // remove passsword and refresh token field from response
    // check for user creation 
    // return response 

    // console.log("req.files:", req.files);

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
    console.log("Avatar upload response:", avatar);

    const coverImage = await uploadOnCloudinary(coverIageLocalPath)
    console.log("Cover Image upload response:", coverImage);

    if (!avatar) {
        throw new ApiError(404, "Avatar required")
    }

    const newUser = await User.create({
        fullname, avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, password,
        username: username.toLowerCase()
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

const loginHandler = asyncHandler(async(req,res)=>{
    // get fields from req body
    const {username,email,password} = req.body

    // check all fields are present or not 
    if([username,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"all fields are required")
    }

    // find the user from the DB 
    const user = await User.findOne({$or:[{username},{email}]})

    // check user is present or not 
    if(!user){
        throw new ApiError(404,"user not found!!!")
    }

    // check the passsword is valid or not 
    const isPasswordCorrect = await user.isPassword(password)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials")
    }

    // generate the tokens 
    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    // send to cookies
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,refreshToken,accessToken
            },
            "User logged in successfully"
        )
    )
})

const logoutHandler = asyncHandler(async(req,res)=>{
    // find the user using auth middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken:undefined}
        }
    )

    // clear the cookies from cookie and db 
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"logout successfull"))
})

module.exports = { registerHandler,loginHandler,logoutHandler }