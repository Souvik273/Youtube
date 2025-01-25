const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            console.error("Local file path is missing.");
            return null;
        }

        console.log("Uploading to Cloudinary:", localfilepath);

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
        });

        console.log("Cloudinary Upload Response:", response);

        // Remove the temporary file
        fs.unlinkSync(localfilepath);

        return response;
    } catch (err) {
        console.error("Cloudinary Upload Error:", err.message);
        // Remove the temporary file in case of failure
        fs.unlinkSync(localfilepath);
        return null;
    }
};

module.exports = uploadOnCloudinary;
