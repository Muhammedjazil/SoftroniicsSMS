
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Task upload folder
const uploadPath = path.join(__dirname, "../uploads/tasks");

// Create folder if it doesn't exist
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

    console.log("TASK UPLOAD RUNNING");
console.log("Received field name:", file.fieldname);
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (file.fieldname !== "attachments") {
    return cb(new Error("Invalid task file field"));
  }

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error("Only JPG, PNG, WEBP and PDF files are allowed")
  );
};

// Multer configuration
const taskUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = taskUpload;
