const multer = require("multer");
const { withCloudinary } = require("../Config/cloudinary");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (file.fieldname !== "attachments") {
    return cb(new Error("Invalid material file field"));
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, PNG, WEBP and PDF files are allowed")
    );
  }

  cb(null, true);
};

const multerMaterialUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const materialUpload = withCloudinary(
  multerMaterialUpload,
  "softroniics/materials"
);

module.exports = materialUpload;
