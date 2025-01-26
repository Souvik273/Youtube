const asyncHandler = require('../utils/asyncHandler.js')
const { ApiError } = require('../utils/ApiError.js')
const uploadOnCloudinary = require('../services/cloudinary.js')
const { ApiResponse } = require('../utils/ApiResponse.js')
const jwt = require("jsonwebtoken")
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

// generate accessToken by the help of refreshToken
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorised request")
    }

    try{
        const decoded = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decoded._id)
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used") 
        }

        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    }catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword } = req.body

    if(!(oldPassword && newPassword)){
        throw new ApiError(400,"all fields are required!!!")
    }

    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(401,"unauthorized login again!!!")
    }

    const isCorrectPassword = await user.isPassword(oldPassword)
    if(!isCorrectPassword){
        throw new ApiError(400,"invalid password !!!") 
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,
        user , 
        "Password changed successfully"
    ))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).
    json(new ApiResponse(200,
        req.user,
        "User received successfully !!!"
    ))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const { fullname,email } = req.body
    if(!(fullname && email)){
        throw new ApiError(409,"all fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{fullname,email}
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200,user,"user details updated successfully")
    )
})

const changeAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file.path

    if(!avatarLocalPath){
        throw new ApiError(404,"avatar local path missing")
    }

    try {
        const cloudPath = await uploadOnCloudinary(avatarLocalPath)
    
        if(!cloudPath.url){
            throw new ApiError(400,"cloud upload failed")
        }
    
        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set:{avatar:cloudPath.url}
            },
            {
                new:true
            }
        ).select("-password -_id -refreshToken")
    
        return res.status(200).
        json(new ApiResponse(200,user,"avatar updated successsfully"))
    } catch (error) {
        throw new ApiError(409,"cloudinary upload failed for avatar update")
    }
})

const changeCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file.path

    if(!coverImageLocalPath){
        throw new ApiError(404,"coverImage local path missing")
    }

    try {
        const cloudPath = await uploadOnCloudinary(coverImageLocalPath)
    
        if(!cloudPath.url){
            throw new ApiError(400,"cloud upload failed")
        }
    
        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set:{avatar:cloudPath.url}
            },
            {
                new:true
            }
        ).select("-password -_id -refreshToken")
    
        return res.status(200).
        json(new ApiResponse(200,user,"coverImage updated successsfully"))
    } catch (error) {
        throw new ApiError(409,"cloudinary upload failed for coverImage update")
    }
})

module.exports = { 
    registerHandler,
    loginHandler,
    logoutHandler,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    changeAvatar,
    changeCoverImage 
}