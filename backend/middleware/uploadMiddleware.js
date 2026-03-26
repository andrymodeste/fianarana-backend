const multer = require("multer");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

let storage;

if (isProduction && process.env.CLOUDINARY_CLOUD_NAME) {
    const cloudinary = require("cloudinary").v2;
    const { CloudinaryStorage } = require("multer-storage-cloudinary");

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    storage = new CloudinaryStorage({
        cloudinary,
        params: async (_req, file) => {
            const ext = path.extname(file.originalname).slice(1);
            const isPdf = file.mimetype === "application/pdf";
            const isVideo = file.mimetype.startsWith("video/");
            return {
                folder: "fianarana",
                resource_type: isPdf || isVideo ? "raw" : "image",
                format: isPdf ? "pdf" : isVideo ? ext : undefined,
                allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "pdf", "mp4", "avi", "mov"],
            };
        },
    });
} else {
    storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, path.join(__dirname, "../uploads"));
        },
        filename: (_req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
            cb(null, unique + path.extname(file.originalname));
        },
    });
}

const fileFilter = (_req, file, cb) => {
    const allowed = [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "application/pdf", "video/mp4", "video/avi", "video/quicktime",
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File type not allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

module.exports = upload;
