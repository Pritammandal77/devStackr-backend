import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, "./public/temp")  //this works on local server, but not in live server
        // cb(null, "/tmp"); // this works on render , but not in local
        cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`; //it create Unique filename to prevent overwrite
        cb(null, uniqueName);
    }
})

export const upload = multer({
    storage: storage
})
