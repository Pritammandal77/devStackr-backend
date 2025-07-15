import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            alert("Could not find the path")
            return
        }

        //to upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })

        //file has been uploaded successfully
        // console.log("file is uploaded on Cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response //old code
        // return response.secure_url;   // Return the HTTPS version of the uploaded file URL to avoid mixed content issues on frontend

    } catch (error) {
        //agar hamari file uplaod nahi hoti hain , to usse local server se bhe toh hatana pdega na...
        fs.unlinkSync(localFilePath)  //it removes the locally saved temporary file as the upload operation got failed
        return null;
    }
}


export { uploadOnCloudinary }