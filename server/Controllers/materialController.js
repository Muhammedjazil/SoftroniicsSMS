
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

const allowedAudiences = [
  "All interns",
  "By batches",
  "By Courses",
  "By Category",
  "Individual interns",
];

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

const validIds = (ids) =>
  ids.every((id) => mongoose.Types.ObjectId.isValid(id));

const removeAttachment = (attachment) => {
  if (!attachment) return;

  const filename = path.basename(attachment);
  const filePath = path.join(
    __dirname,
    "../uploads/materials",
    filename
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const populateMaterial = (query) =>
  query
    .populate("mentor", "fullName email")
    .populate("branch", "branchName")
    .populate("batches", "batchName branch")
    .populate("categories", "categoryName branch")
    .populate("courses", "courseName category")
    .populate("interns", "fullName email")
    .populate("individualInterns", "fullName email");

const getAudienceIds = async ({
  audience,
  branch,
  batches,
  categories,
  courses,
  individualInterns,
}) => {
  let interns = [];

  if (audience === "All interns") {
    interns = await Intern.find({
      branch: { $in: branch },
      isActive: true,
      isDeleted: false,
    }).distinct("_id");
  }

  if (audience === "By batches") {
    interns = await Intern.find({
      batch: { $in: [] },
      branch: { $in: branch },
      isActive: true,
      isDeleted: false,
    }).distinct("_id");

    // Intern.batch is a String in your schema.
    // Resolve using the selected Batch documents' batchName values.
    const selectedBatches = await Batch.find({
      _id: { $in: batches },
      branch: { $in: branch },
      isActive: true,
      isDeleted: false,
    }).select("batchName");

    const batchNames = selectedBatches.map((item) => item.batchName);

    interns = await Intern.find({
      batch: { $in: batchNames },
      branch: { $in: branch },
      isActive: true,
      isDeleted: false,
    }).distinct("_id");
  }

  if (audience === "By Courses") {
    interns = await Intern.find({
      course: { $in: courses },
      branch: { $in: branch },
      isActive: true,
      isDeleted: false,
    }).distinct("_id");
  }

  if (audience === "By Category") {
    const selectedCourses = await Course.find({
      category: { $in: categories },
      isActive: true,
      isDeleted: false,
    }).distinct("_id");

    interns = await Intern.find({
      course: { $in: selectedCourses },
      branch: { $in: branch },
      isActive: true,
      isDeleted: false,
    }).distinct("_id");
  }

  if (audience === "Individual interns") {
    interns = individualInterns;
  }

  return interns;
};

// =====================================================
// GET MATERIAL DROPDOWNS
// =====================================================

exports.getMaterialDropdowns = async (req, res) => {
  try {
    const [
      branches,
      mentors,
      batches,
      categories,
      courses,
      interns,
    ] = await Promise.all([
      Branch.find({
        isActive: true,
        isDeleted: false,
      }).select("branchName"),

      Staff.find({
        isActive: true,
        isDeleted: false,
        isMentor: true,
        employmentStatus: "Active",
      }).select("fullName email branch multipleBranches"),

      Batch.find({
        isActive: true,
        isDeleted: false,
        status: "Active",
      }).select("batchName branch"),

      Category.find({
        isActive: true,
        isDeleted: false,
      }).select("categoryName branch"),

      Course.find({
        isActive: true,
        isDeleted: false,
      }).select("courseName category"),

      Intern.find({
        isActive: true,
        isDeleted: false,
        courseStatus: "Ongoing",
      }).select("fullName email course branch batch"),
    ]);

    return res.status(200).json({
      message: "Material dropdowns fetched successfully",
      branches,
      mentors,
      batches,
      categories,
      courses,
      interns,
    });
  } catch (error) {
    console.error("Material Dropdown Error:", error);

    return res.status(500).json({
      message: "Failed to fetch material dropdowns",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE MATERIAL
// =====================================================

exports.createMaterial = async (req, res) => {
  try {
    const {
      title,
      mentor,
      audience,
      allowDownload,
    } = req.body;

    const branch = parseArray(req.body.branch);
    const batches = parseArray(req.body.batches);
    const categories = parseArray(req.body.categories);
    const courses = parseArray(req.body.courses);
    const individualInterns = parseArray(req.body.individualInterns);

    if (!title?.trim() || !mentor || !audience || !req.file) {
      return res.status(400).json({
        message: "Title, mentor, audience and attachment are required",
      });
    }

    if (!allowedAudiences.includes(audience)) {
      return res.status(400).json({
        message: "Invalid audience type",
      });
    }

    if (!branch.length) {
      return res.status(400).json({
        message: "Please select at least one branch",
      });
    }

    const allIds = [
      mentor,
      ...branch,
      ...batches,
      ...categories,
      ...courses,
      ...individualInterns,
    ];

    if (!validIds(allIds)) {
      return res.status(400).json({
        message: "Invalid ID provided",
      });
    }

    if (
      (audience === "By batches" && !batches.length) ||
      (audience === "By Category" && !categories.length) ||
      (audience === "By Courses" && !courses.length) ||
      (audience === "Individual interns" && !individualInterns.length)
    ) {
      return res.status(400).json({
        message: "Please select the required audience",
      });
    }

    const interns = await getAudienceIds({
      audience,
      branch,
      batches,
      categories,
      courses,
      individualInterns,
    });

    const material = await Material.create({
      title: title.trim(),
      mentor,
      attachments: `/uploads/materials/${req.file.filename}`,
      branch,
      audience,
      batches: audience === "By batches" ? batches : [],
      categories: audience === "By Category" ? categories : [],
      courses: audience === "By Courses" ? courses : [],
      interns,
      individualInterns:
        audience === "Individual interns" ? individualInterns : [],
      allowDownload: allowDownload !== "false",
    });

    const savedMaterial = await populateMaterial(
      Material.findById(material._id)
    );

    return res.status(201).json({
      message: "Material created successfully",
      material: savedMaterial,
    });
  } catch (error) {
    if (req.file) {
      removeAttachment(`/uploads/materials/${req.file.filename}`);
    }

    console.error("Create Material Error:", error);

    return res.status(500).json({
      message: "Failed to create material",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL MATERIALS
// =====================================================

exports.getMaterials = async (req, res) => {
  try {
    const materials = await populateMaterial(
      Material.find({
        isDeleted: false,
      }).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      message: "Materials fetched successfully",
      materials,
    });
  } catch (error) {
    console.error("Get Materials Error:", error);

    return res.status(500).json({
      message: "Failed to fetch materials",
      error: error.message,
    });
  }
};

// =====================================================
// GET MATERIAL BY ID
// =====================================================

exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid material ID",
      });
    }

    const material = await populateMaterial(
      Material.findOne({ _id: id, isDeleted: false })
    );

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    return res.status(200).json({
      message: "Material fetched successfully",
      material,
    });
  } catch (error) {
    console.error("Get Material Error:", error);

    return res.status(500).json({
      message: "Failed to fetch material",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MATERIAL
// =====================================================

exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid material ID",
      });
    }

    const material = await Material.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    const {
      title,
      mentor,
      audience,
      allowDownload,
    } = req.body;

    const branch = parseArray(req.body.branch);
    const batches = parseArray(req.body.batches);
    const categories = parseArray(req.body.categories);
    const courses = parseArray(req.body.courses);
    const individualInterns = parseArray(req.body.individualInterns);

    const nextAudience = audience ?? material.audience;
    const nextBranch = req.body.branch !== undefined
      ? branch
      : material.branch.map((item) => item.toString());

    const nextBatches = req.body.batches !== undefined
      ? batches
      : material.batches.map((item) => item.toString());

    const nextCategories = req.body.categories !== undefined
      ? categories
      : material.categories.map((item) => item.toString());

    const nextCourses = req.body.courses !== undefined
      ? courses
      : material.courses.map((item) => item.toString());

    const nextIndividualInterns =
      req.body.individualInterns !== undefined
        ? individualInterns
        : material.individualInterns.map((item) => item.toString());

    if (!allowedAudiences.includes(nextAudience)) {
      return res.status(400).json({
        message: "Invalid audience type",
      });
    }

    if (!nextBranch.length) {
      return res.status(400).json({
        message: "Please select at least one branch",
      });
    }

    const allIds = [
      ...nextBranch,
      ...nextBatches,
      ...nextCategories,
      ...nextCourses,
      ...nextIndividualInterns,
    ];

    if (mentor) allIds.push(mentor);

    if (!validIds(allIds)) {
      return res.status(400).json({
        message: "Invalid ID provided",
      });
    }

    if (title !== undefined) material.title = title.trim();
    if (mentor !== undefined) material.mentor = mentor;
    if (audience !== undefined) material.audience = audience;

    material.branch = nextBranch;
    material.batches =
      nextAudience === "By batches" ? nextBatches : [];
    material.categories =
      nextAudience === "By Category" ? nextCategories : [];
    material.courses =
      nextAudience === "By Courses" ? nextCourses : [];
    material.individualInterns =
      nextAudience === "Individual interns"
        ? nextIndividualInterns
        : [];

    if (allowDownload !== undefined) {
      material.allowDownload = allowDownload !== "false";
    }

    if (
      (nextAudience === "By batches" && !nextBatches.length) ||
      (nextAudience === "By Category" && !nextCategories.length) ||
      (nextAudience === "By Courses" && !nextCourses.length) ||
      (nextAudience === "Individual interns" &&
        !nextIndividualInterns.length)
    ) {
      return res.status(400).json({
        message: "Please select the required audience",
      });
    }

    material.interns = await getAudienceIds({
      audience: nextAudience,
      branch: nextBranch,
      batches: nextBatches,
      categories: nextCategories,
      courses: nextCourses,
      individualInterns: nextIndividualInterns,
    });

    const oldAttachment = material.attachments;

    if (req.file) {
      material.attachments = `/uploads/materials/${req.file.filename}`;
    }

    await material.save();

    if (req.file && oldAttachment) {
      removeAttachment(oldAttachment);
    }

    const updatedMaterial = await populateMaterial(
      Material.findById(material._id)
    );

    return res.status(200).json({
      message: "Material updated successfully",
      material: updatedMaterial,
    });
  } catch (error) {
    if (req.file) {
      removeAttachment(`/uploads/materials/${req.file.filename}`);
    }

    console.error("Update Material Error:", error);

    return res.status(500).json({
      message: "Failed to update material",
      error: error.message,
    });
  }
};

// =====================================================
// PERMANENTLY DELETE MATERIAL
// =====================================================

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid material ID",
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    const attachment = material.attachments;

    await Material.findByIdAndDelete(id);

    if (attachment) {
      removeAttachment(attachment);
    }

    return res.status(200).json({
      message: "Material permanently deleted successfully",
    });
  } catch (error) {
    console.error("Delete Material Error:", error);

    return res.status(500).json({
      message: "Failed to delete material",
      error: error.message,
    });
  }
};
