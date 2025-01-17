const { v2 } = require('cloudinary')
const fs = require('fs')

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: 'auto'
        })

        // file has been uploaded successfully
        console.log(`File is uploaded successfully : ${response.url}`)

        fs.unlinkSync(localfilepath)

        return response
    } catch {
        // remove locally saved temopary file as the upload operation got failed
        fs.unlinkSync(localfilepath)
        return null
    }
}

module.exports = uploadOnCloudinary