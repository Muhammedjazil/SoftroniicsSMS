const multer = require("multer");
const { withCloudinary } = require("../Config/cloudinary");

// Use memory storage so files can be streamed directly to Cloudinary
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photo") {
    const allowedImages = ["image/jpeg", "image/png", "image/webp"];

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

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

const upload = withCloudinary(multerUpload, (req, file) => {
  const baseUrl = req.baseUrl || "";
  if (baseUrl.toLowerCase().includes("intern")) {
    return file.fieldname === "resume"
      ? "softroniics/interns/resumes"
      : "softroniics/interns/photos";
  }
  return file.fieldname === "resume"
    ? "softroniics/staff/resumes"
    : "softroniics/staff/photos";
});

module.exports = upload;
