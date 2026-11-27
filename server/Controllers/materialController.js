
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Material = require("../Models/materialModel");
const Branch = require("../Models/branchModel");
const { Staff } = require("../Models/staffModel");
const Batch = require("../Models/batchModel");
const Category = require("../Models/categoryModel");
const Course = require("../Models/courseModel");
const Intern = require("../Models/internModel");

// Allowed audience types
const allowedAudiences = [
  "All interns",
  "By batches",
  "By Courses",
  "By Category",
  "Individual interns",
];

// Convert input into array
const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
};

// Validate MongoDB IDs
const validIds = (ids) => {
  return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
};

// Remove uploaded attachment
const removeAttachment = (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(__dirname, "..", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Populate material details
const populateMaterial = (query) => {
  return query
    .populate("mentor", "fullName name email")
    .populate("branch", "branchName")
    .populate("batches", "batchName")
    .populate("categories", "categoryName")
    .populate("courses", "courseName")
    .populate("interns", "fullName email")
    .populate("individualInterns", "fullName email");
};

// Calculate interns based on audience
const getAudienceIds = async ({
  audience,
  branch,
  batches,
  courses,
  categories,
  individualInterns,
}) => {
  let internFilter = {
    branch: { $in: branch },
    isActive: true,
    isDeleted: false,
    role: "Intern",
  };

  if (audience === "All interns") {
    return await Intern.find(internFilter).distinct("_id");
  }

  if (audience === "By batches") {
    return await Intern.find({
      ...internFilter,
      batch: { $in: batches },
    }).distinct("_id");
  }

  if (audience === "By Courses") {
    return await Intern.find({
      ...internFilter,
      course: { $in: courses },
    }).distinct("_id");
  }

  if (audience === "By Category") {
    const categoryCourses = await Course.find({
      category: { $in: categories },
    }).distinct("_id");

    return await Intern.find({
      ...internFilter,
      course: { $in: categoryCourses },
    }).distinct("_id");
  }

  if (audience === "Individual interns") {
    return await Intern.find({
      _id: { $in: individualInterns },
      ...internFilter,
    }).distinct("_id");
  }

  return [];
};

// Dropdown data
exports.getMaterialDropdowns = async (req, res) => {
  try {
    const [branches, batches, categories, courses, interns, mentors] =
      await Promise.all([
        Branch.find({ isDeleted: false }),
        Batch.find({ isDeleted: false }),
        Category.find({ isDeleted: false }),
        Course.find({ isDeleted: false }),
        Intern.find({
          role: "Intern",
          isActive: true,
          isDeleted: false,
        }),
        Staff.find({ isDeleted: false }),
      ]);

    res.status(200).json({
      success: true,
      branches,
      batches,
      categories,
      courses,
      interns,
      mentors,
    });
  } catch (error) {
    console.error("Get material dropdowns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dropdown data",
      error: error.message,
    });
  }
};

// Create material
exports.createMaterial = async (req, res) => {
  try {
    const {
      title,
      mentor,
      branch,
      audience,
      allowDownload,
    } = req.body;

    const branches = parseArray(branch);
    const batches = parseArray(req.body.batches);
    const courses = parseArray(req.body.courses);
    const categories = parseArray(req.body.categories);
    const individualInterns = parseArray(req.body.individualInterns);

    if (!title || !mentor || !branches.length || !audience) {
      return res.status(400).json({
        success: false,
        message: "Title, mentor, branch and audience are required",
      });
    }

    if (!allowedAudiences.includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audience type",
      });
    }

    const allIds = [
      ...branches,
      mentor,
      ...batches,
      ...courses,
      ...categories,
      ...individualInterns,
    ];

    if (!validIds(allIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a material attachment",
      });
    }

    // Validate required audience selection
    if (audience === "By batches" && !batches.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one batch",
      });
    }

    if (audience === "By Courses" && !courses.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one course",
      });
    }

    if (audience === "By Category" && !categories.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one category",
      });
    }

    if (
      audience === "Individual interns" &&
      !individualInterns.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one intern",
      });
    }

    const attachment = `/uploads/materials/${req.file.filename}`;

    const assignedInterns = await getAudienceIds({
      audience,
      branch: branches,
      batches,
      courses,
      categories,
      individualInterns,
    });

    const material = await Material.create({
      title,
      mentor,
      attachments: attachment,
      branch: branches,
      audience,
      batches,
      courses,
      categories,
      individualInterns,
      interns: assignedInterns,
      allowDownload:
        allowDownload === undefined
          ? true
          : allowDownload === "true" || allowDownload === true,
    });

    const result = await populateMaterial(
      Material.findById(material._id)
    );

    res.status(201).json({
      success: true,
      message: "Material created successfully",
      material: result,
    });
  } catch (error) {
    console.error("Create material:", error);

    if (req.file) {
      removeAttachment(`/uploads/materials/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: "Failed to create material",
      error: error.message,
    });
  }
};

// Get all materials for admin
exports.getMaterials = async (req, res) => {
  try {
    const materials = await populateMaterial(
      Material.find({ isDeleted: false }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("Get materials:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message,
    });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await populateMaterial(
      Material.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("Get material by ID:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch material",
      error: error.message,
    });
  }
};

// Update material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    const {
      title,
      mentor,
      branch,
      audience,
      allowDownload,
    } = req.body;

    const branches =
      branch !== undefined ? parseArray(branch) : material.branch.map(String);

    const batches =
      req.body.batches !== undefined
        ? parseArray(req.body.batches)
        : material.batches.map(String);

    const courses =
      req.body.courses !== undefined
        ? parseArray(req.body.courses)
        : material.courses.map(String);

    const categories =
      req.body.categories !== undefined
        ? parseArray(req.body.categories)
        : material.categories.map(String);

    const individualInterns =
      req.body.individualInterns !== undefined
        ? parseArray(req.body.individualInterns)
        : material.individualInterns.map(String);

    const updatedAudience = audience || material.audience;
    const updatedMentor = mentor || material.mentor.toString();

    if (!allowedAudiences.includes(updatedAudience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audience type",
      });
    }

    const allIds = [
      ...branches,
      updatedMentor,
      ...batches,
      ...courses,
      ...categories,
      ...individualInterns,
    ];

    if (!validIds(allIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided",
      });
    }

    if (!title && !material.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const assignedInterns = await getAudienceIds({
      audience: updatedAudience,
      branch: branches,
      batches,
      courses,
      categories,
      individualInterns,
    });

    material.title = title || material.title;
    material.mentor = updatedMentor;
    material.branch = branches;
    material.audience = updatedAudience;
    material.batches = batches;
    material.courses = courses;
    material.categories = categories;
    material.individualInterns = individualInterns;
    material.interns = assignedInterns;

    if (allowDownload !== undefined) {
      material.allowDownload =
        allowDownload === "true" || allowDownload === true;
    }

    if (req.file) {
      removeAttachment(material.attachments);
      material.attachments = `/uploads/materials/${req.file.filename}`;
    }

    await material.save();

    const result = await populateMaterial(
      Material.findById(material._id)
    );

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      material: result,
    });
  } catch (error) {
    console.error("Update material:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update material",
      error: error.message,
    });
  }
};

// Soft delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    material.isDeleted = true;
    material.isActive = false;
    material.deletedAt = new Date();

    await material.save();

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message,
    });
  }
};

// Get materials assigned to logged-in intern
exports.getInternMaterials = async (req, res) => {
  try {
    // CheckAuth middleware should set req.userId
    const internId = req.userId;

    if (!internId || !mongoose.Types.ObjectId.isValid(internId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid intern authentication",
      });
    }

    const intern = await Intern.findOne({
      _id: internId,
      role: "Intern",
      isActive: true,
      isDeleted: false,
    });

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found",
      });
    }

    const materials = await populateMaterial(
      Material.find({
        interns: intern._id,
        branch: intern.branch,
        isActive: true,
        isDeleted: false,
      }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("Get intern materials:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch intern materials",
      error: error.message,
    });
  }
};