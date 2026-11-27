const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const cloudinary = require("cloudinary").v2;

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }

  return false;
};

configureCloudinary();

/**
 * Upload a file buffer to Cloudinary using upload_stream.
 * Uses resource_type: "auto" so both images and PDFs are supported.
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  if (!configureCloudinary()) {
    return Promise.reject(
      new Error(
        "Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env and restart the server."
      )
    );
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Extract Cloudinary public_id and resource_type from a Cloudinary URL.
 */
const extractCloudinaryInfo = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return null;
  if (!fileUrl.includes("res.cloudinary.com")) return null;

  try {
    const url = new URL(fileUrl);
    // Format: /<cloud_name>/<resource_type>/upload/[v<version>/]<public_id>[.<ext>]
    const match = url.pathname.match(
      /^\/[^/]+\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/
    );
    if (!match) return null;

    const resourceType = match[1];
    let publicId = decodeURIComponent(match[2]);

    // For image/video, Cloudinary public_id excludes the file extension
    if (resourceType !== "raw") {
      publicId = publicId.replace(/\.[^/.]+$/, "");
    }

    return { publicId, resourceType };
  } catch {
    return null;
  }
};

/**
 * Delete a file from Cloudinary by its URL.
 * Safely no-ops for non-Cloudinary or empty paths.
 */
const deleteFromCloudinary = async (fileUrl) => {
  const info = extractCloudinaryInfo(fileUrl);
  if (!info) return null;

  try {
    return await cloudinary.uploader.destroy(info.publicId, {
      resource_type: info.resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return null;
  }
};

/**
 * Wraps a multer instance so uploaded files in req.file / req.files
 * are streamed to Cloudinary and file.path is set to the Cloudinary secure_url.
 */
const withCloudinary = (multerInstance, getFolder) => {
  const uploadFileToCloudinary = async (req, file) => {
    const folder =
      typeof getFolder === "function" ? getFolder(req, file) : getFolder;
    const isPdf = file.mimetype === "application/pdf";
    const result = await uploadBufferToCloudinary(file.buffer, {
      folder,
      resource_type: "auto",
      ...(isPdf ? { format: "pdf" } : {}),
    });

    file.path = result.secure_url;
    file.filename = result.public_id;
    file.cloudinaryPublicId = result.public_id;
    file.cloudinaryResourceType = result.resource_type;
  };

  const wrapMiddleware = (multerMiddleware) => (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      try {
        if (req.file) {
          await uploadFileToCloudinary(req, req.file);
        }

        if (req.files) {
          if (Array.isArray(req.files)) {
            await Promise.all(
              req.files.map((file) => uploadFileToCloudinary(req, file))
            );
          } else {
            const allFiles = Object.values(req.files).flat();
            await Promise.all(
              allFiles.map((file) => uploadFileToCloudinary(req, file))
            );
          }
        }

        next();
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: uploadError.message || "Failed to upload file to Cloudinary",
        });
      }
    });
  };

  return {
    single: (fieldName) => wrapMiddleware(multerInstance.single(fieldName)),
    array: (fieldName, maxCount) =>
      wrapMiddleware(multerInstance.array(fieldName, maxCount)),
    fields: (fields) => wrapMiddleware(multerInstance.fields(fields)),
    any: () => wrapMiddleware(multerInstance.any()),
    none: () => multerInstance.none(),
  };
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  withCloudinary,
};
