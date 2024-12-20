import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// MIME types for supported image formats
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

// Configure storage
const storage = multer.memoryStorage(); // Use memory storage to store images as buffer

const fileFilter = (req, file, callback) => {
    if (!MIME_TYPES[file.mimetype]) {
        callback(new Error("Unsupported file type"), false);
    } else {
        callback(null, true);
    }
};

export default multer({
    storage,
    limits: { fileSize: 2048 * 2048 }, // Limit to 2MB per image
    fileFilter,
}).array("images", 10); // Change to array to accept multiple files
