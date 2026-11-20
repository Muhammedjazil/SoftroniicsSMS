
// Controllers/staffController.js

const bcrypt = require("bcryptjs");

const Staff = require("../Models/staffModel").Staff;
const Role = require("../Models/roleModel").Staff;
const Branch = require("../Models/branchModel").Branch;

// Convert FormData array values into JavaScript arrays
const parseArray = (value) => {
  if (!value) return [];

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const takeroletitle = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).select("role");

    return res.status(200).json(roles);
  } catch (error) {
    console.error("Role Fetch Error:", error);

    return res.status(500).json({
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

// CREATE STAFF
const createstaff = async (req, res) => {
  try {
    const {
      fullname,
      dateofbirth,
      gender,
      email,
      phone,
      whatsapp,
      address,
      district,
      state,
      department,
      branch,
      allowAdditionalBranches,
      additionalBranches,
      role,
      experience,
      joindate,
      status,
      resingnation,
      remark,
      officialemail,
      password,
      mentorRole,
      mentorTimings,
    } = req.body;

    // Required field validation
    if (
      !fullname ||
      !dateofbirth ||
      !gender ||
      !email ||
      !phone ||
      !department ||
      !branch ||
      !joindate ||
      !status ||
      !role ||
      !officialemail ||
      !password
    ) {
      return res.status(400).json({
        message: "Please provide all required staff details.",
      });
    }

    // Check existing email
    const existingStaff = await Staff.findOne({
      $or: [
        { email: email.toLowerCase() },
        { officialEmail: officialemail.toLowerCase() },
      ],
    });

    if (existingStaff) {
      return res.status(409).json({
        message: "Staff email or official email already exists.",
      });
    }

    // Validate role
    const roleExists = await Role.findById(role);

    if (!roleExists) {
      return res.status(400).json({
        message: "Selected role does not exist.",
      });
    }

    // Validate branch
    const branchExists = await Branch.findById(branch);

    if (!branchExists) {
      return res.status(400).json({
        message: "Selected branch does not exist.",
      });
    }

    // Parse arrays sent through FormData
    const parsedAdditionalBranches = parseArray(additionalBranches);
    const parsedMentorTimings = parseArray(mentorTimings);

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Uploaded Cloudinary URLs
    const photoUrl = req.files?.photo?.[0]?.path || "";
    const resumeUrl = req.files?.resume?.[0]?.path || "";

    const newStaff = new Staff({
      fullName: fullname,
      dateOfBirth: dateofbirth,
      gender,
      email: email.toLowerCase(),
      staffPhoneNumber: phone,
      staffWhatsAppNumber: whatsapp,
      staffPermanentAddress: address,
      district,
      state,
      photo: photoUrl,

      isMultipleBranch: allowAdditionalBranches === "true",
      multipleBranches: parsedAdditionalBranches,

      department,
      branch,
      yearsOfExperience: experience ? Number(experience) : 0,
      dateOfJoining: joindate,
      employmentStatus: status,
      resignationDate: resingnation || null,
      resume: resumeUrl,
      remarks: remark,

      role,

      isMentor: mentorRole === "true",
      time: mentorRole === "true" ? parsedMentorTimings : [],

      officialEmail: officialemail.toLowerCase(),
      password: hashedPassword,
    });

    const savedStaff = await newStaff.save();

    const populatedStaff = await Staff.findById(savedStaff._id)
      .populate("branch", "branchName")
      .populate("multipleBranches", "branchName")
      .populate("role", "role")
      .populate("time", "timeSlot");

    return res.status(201).json({
      message: "Staff created successfully",
      data: populatedStaff,
    });
  } catch (error) {
    console.error("Create Staff Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or official email already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid staff data.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create staff",
      error: error.message,
    });
  }
};

module.exports = {
  takeroletitle,
  createstaff,
};
