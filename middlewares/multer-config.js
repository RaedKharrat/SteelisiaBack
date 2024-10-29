import multer, { diskStorage } from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// MIME types for supported image formats
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

// Exporting a middleware function that configures multer for handling file uploads
export default multer({
    // Configuring multer with disk storage
    storage: diskStorage({
        // Setting the destination for uploaded files
        destination: (req, file, callback) => {
            // Getting the current directory using dirname and fileURLToPath
            const __dirname = dirname(fileURLToPath(import.meta.url));

            // Callback to specify the destination path
            callback(null, join(__dirname, "../public/images"));
        },
        // Setting the filename for uploaded files
        filename: (req, file, callback) => {
            // Getting the file extension based on MIME type
            const extension = MIME_TYPES[file.mimetype];

            // Callback to specify the filename with a timestamp and extension
            callback(null, Date.now() + "." + extension);
        },
    }),
    // Setting size limits for uploaded files (512 KB in this case)
    limits: 512 * 1024,
}).single("image");