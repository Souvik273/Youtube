const { jwt } = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.model");

const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {

        const token = await req.cookie?.accessToken || req.headers("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthorise access")
        }
    
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findOne(decoded?._id).select("-password refreshToken")
        
        if(!user){
            throw new ApiError(401,"Invalid user ")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,"Unverified user")
    }
})

module.exports = verifyJWT