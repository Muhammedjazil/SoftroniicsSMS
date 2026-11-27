const multer = require("multer");
const { withCloudinary } = require("../Config/cloudinary");

const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
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

const multerTaskUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const taskUpload = withCloudinary(multerTaskUpload, "softroniics/tasks");

module.exports = taskUpload;
