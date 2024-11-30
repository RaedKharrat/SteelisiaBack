import multer, { diskStorage } from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// MIME types for supported image formats
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

// Configuring multer storage and file handling
const storage = diskStorage({
    destination: (req, file, callback) => {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        callback(null, join(__dirname, "../public/images"));
    },
    filename: (req, file, callback) => {
        const extension = MIME_TYPES[file.mimetype];
        callback(null, Date.now() + "." + extension);
    },
});

const fileFilter = (req, file, callback) => {
    if (!MIME_TYPES[file.mimetype]) {
        callback(new Error("Unsupported file type"), false);
    } else {
        callback(null, true);
    }
};

export default multer({
    storage,
    limits: { fileSize: 2048 * 1024 }, // Limit to 512KB
    fileFilter,
}).array("images", 10); // Change to array to accept multiple files (up to 10 in this case)


