
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload folder path
const uploadPath = path.join(__dirname, "../uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname).toLowerCase()
    );
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photo") {
    const allowedImages = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedImages.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  }

  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }

    return cb(new Error("Only PDF resumes are allowed"));
  }

  cb(new Error("Invalid file field"));
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = upload;
