import multer from "multer";
// Configuring multer to use memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    const MIME_TYPES = ["image/jpg", "image/jpeg", "image/png"];
    if (MIME_TYPES.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Unsupported file type"), false);
    }
};

export default multer({
    storage,
    limits: { fileSize: 2048 * 1024 }, // Limit to 2MB
    fileFilter,
}).array("images", 10); // Accept up to 10 files