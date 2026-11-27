
// Controllers/staffController.js


const bcrypt = require("bcryptjs");

const Staff = require("../Models/staffModel").Staff;
const Role = require("../Models/roleModel").Staff;
const Branch = require("../Models/branchModel");
const { deleteFromCloudinary } = require("../Config/cloudinary");

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


const takeallstaff = async (req, res) => {
  try {
    const response = await Staff.find({ isDeleted: false })
      .select("-password")
      .populate("role", "role")
      .populate("branch", "branchName")
      .populate("multipleBranches", "branchName")
      .populate("time", "timeSlot")
      .sort({ createdAt: -1 });

    return res.status(200).json(response);

  } catch (error) {
    console.error("Fetch Staff Error:", error);

    return res.status(500).json({
      message: "Failed to fetch staff",
      error: error.message
    });
  }
};

const updatestaff = async (req, res) => {
  try {
    const { id } = req.params;

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
      mentorTimings
    } = req.body;

    // Find existing staff
    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    // Check duplicate email, excluding this staff
    const duplicateStaff = await Staff.findOne({
      _id: { $ne: id },
      $or: [
        { email: email?.toLowerCase() },
        { officialEmail: officialemail?.toLowerCase() }
      ]
    });

    if (duplicateStaff) {
      return res.status(409).json({
        message: "Email or official email already exists"
      });
    }

    // Map frontend fields to schema fields
    staff.fullName = fullname;
    staff.dateOfBirth = dateofbirth;
    staff.gender = gender;
    staff.email = email?.toLowerCase();
    staff.staffPhoneNumber = phone;
    staff.staffWhatsAppNumber = whatsapp;
    staff.staffPermanentAddress = address;
    staff.district = district;
    staff.state = state;

    staff.department = department;
    staff.branch = branch;

    staff.isMultipleBranch =
      allowAdditionalBranches === "true";

    staff.multipleBranches =
      staff.isMultipleBranch
        ? parseArray(additionalBranches)
        : [];

    staff.role = role;
    staff.yearsOfExperience = experience
      ? Number(experience)
      : 0;

    staff.dateOfJoining = joindate;
    staff.employmentStatus = status;
    staff.resignationDate = resingnation || null;
    staff.remarks = remark;

    staff.isMentor = mentorRole === "true";

    staff.time = staff.isMentor
      ? parseArray(mentorTimings)
      : [];

    staff.officialEmail = officialemail?.toLowerCase();

    // Update password only if a new password is entered
    if (password && password.trim() !== "") {
      staff.password = await bcrypt.hash(password, 10);
    }

    // Update photo only if a new photo is uploaded
    if (req.files?.photo?.[0]?.path) {
      if (staff.photo) await deleteFromCloudinary(staff.photo);
      staff.photo = req.files.photo[0].path;
    }

    // Update resume only if a new resume is uploaded
    if (req.files?.resume?.[0]?.path) {
      if (staff.resume) await deleteFromCloudinary(staff.resume);
      staff.resume = req.files.resume[0].path;
    }

    const savedStaff = await staff.save();

    const updatedStaff = await Staff.findById(savedStaff._id)
      .select("-password")
      .populate("branch", "branchName")
      .populate("multipleBranches", "branchName")
      .populate("role", "role")
      .populate("time", "timeSlot");

    return res.status(200).json({
      message: "Staff updated successfully",
      data: updatedStaff
    });

  } catch (error) {
    console.error("Update Staff Error:", error);

    return res.status(500).json({
      message: "Staff not updated!",
      error: error.message
    });
  }
};

const removestaff=async(req,res)=>{
  try{
    const {id}=req.params
    const user=await Staff.findByIdAndDelete(id)
    res.json("staff removed successfully")
  }
  catch(error){
    res.json({message:"satff not removed!"})
  }
}

module.exports = {
  takeroletitle,
  createstaff,
  takeallstaff,
  updatestaff,
  removestaff
};
