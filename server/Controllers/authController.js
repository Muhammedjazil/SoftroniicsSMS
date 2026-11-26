const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../Models/userModel");
const { Staff } = require("../Models/staffModel");
const Intern = require("../Models/internModel");
const roleModule = require("../Models/roleModel");
const Role = roleModule.Role || roleModule;

const JWT_SECRET = process.env.JWT_SECRET || "softroniics_sms_secret_2026";

// Helper: Compare password supporting both bcrypt hashes and plain text
const verifyPassword = async (plainPassword, storedPassword) => {
  if (!plainPassword || !storedPassword) return false;
  if (
    storedPassword.startsWith("$2a$") ||
    storedPassword.startsWith("$2b$") ||
    storedPassword.startsWith("$2y$")
  ) {
    return bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
};

// Helper: Sign JWT token
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Create initial Admin account (in User collection)
// @route   POST /auth/register-admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, 10-digit mobile, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: mobile.trim() }],
      isDeleted: false,
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An admin account with this email or mobile already exists." });
    }

    // Safely find or create Super Admin role
    let adminRole = null;
    try {
      adminRole = await Role.findOne({
        role: { $regex: /^super\s*admin$/i },
        isDeleted: { $ne: true },
      });

      if (!adminRole) {
        adminRole = await Role.create({
          role: "Super Admin",
          description: "Full system administrator access",
        });
      }
    } catch (roleErr) {
      console.warn("Skipping Role assignment:", roleErr.message);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password: hashedPassword,
      ...(adminRole ? { role: adminRole._id } : {}),
      isActive: true,
    });

    return res.status(201).json({
      message: "Admin account created successfully",
      user: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: adminRole?.role || "Super Admin",
        userType: "admin",
      },
    });
  } catch (error) {
    console.error("Register admin error:", error);
    return res.status(500).json({
      message: "Server error while creating admin account",
      error: error.message,
    });
  }
};

// @desc    Unified Login for Admin (User), Staff, and Intern
// @route   POST /auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------------
    // 1. Check Admin (User Collection)
    // -----------------------------------------
    const adminUser = await User.findOne({
      email: normalizedEmail,
      isDeleted: false,
    }).populate("role", "role permissions");

    if (adminUser) {
      if (!adminUser.isActive) {
        return res.status(403).json({ message: "This admin account is inactive." });
      }

      const isMatch = await verifyPassword(password, adminUser.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const roleName = adminUser.role?.role || "Super Admin";
      const tokenPayload = {
        id: adminUser._id,
        email: adminUser.email,
        userType: "admin",
        role: roleName,
      };

      const accessToken = signToken(tokenPayload);

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          userType: "admin",
          role: roleName,
          permissions: adminUser.role?.permissions || [],
        },
      });
    }

    // -----------------------------------------
    // 2. Check Staff Collection (officialEmail or email)
    // -----------------------------------------
    const staffMember = await Staff.findOne({
      $or: [{ officialEmail: normalizedEmail }, { email: normalizedEmail }],
      isDeleted: false,
    })
      .populate("role", "role permissions")
      .populate("branch", "branchName name");

    if (staffMember) {
      if (!staffMember.isActive || staffMember.employmentStatus === "Inactive") {
        return res
          .status(403)
          .json({ message: "Your staff account is inactive. Contact Admin." });
      }

      const isMatch = await verifyPassword(password, staffMember.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const roleName = staffMember.role?.role || (staffMember.isMentor ? "Mentor" : "Staff");
      const tokenPayload = {
        id: staffMember._id,
        email: staffMember.officialEmail,
        userType: "staff",
        role: roleName,
        isMentor: staffMember.isMentor,
      };

      const accessToken = signToken(tokenPayload);

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
          _id: staffMember._id,
          name: staffMember.fullName,
          email: staffMember.officialEmail,
          personalEmail: staffMember.email,
          userType: "staff",
          role: roleName,
          isMentor: staffMember.isMentor,
          branch: staffMember.branch,
          permissions: staffMember.role?.permissions || [],
        },
      });
    }

    // -----------------------------------------
    // 3. Check Intern Collection (officialEmail or email)
    // -----------------------------------------
    const internMember = await Intern.findOne({
      $or: [{ officialEmail: normalizedEmail }, { email: normalizedEmail }],
      isDeleted: false,
    })
      .populate("branch", "branchName name")
      .populate("course", "courseName");

    if (internMember) {
      if (!internMember.isActive || internMember.courseStatus === "Dropped") {
        return res
          .status(403)
          .json({ message: "Your intern account is inactive. Contact Admin." });
      }

      const isMatch = await verifyPassword(password, internMember.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const tokenPayload = {
        id: internMember._id,
        email: internMember.officialEmail,
        userType: "intern",
        role: "Intern",
      };

      const accessToken = signToken(tokenPayload);

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
          _id: internMember._id,
          admissionNumber: internMember.admissionNumber || "",
          name: internMember.fullName,
          email: internMember.officialEmail,
          personalEmail: internMember.email,
          userType: "intern",
          role: "Intern",
          batch: internMember.batch,
          branch: internMember.branch,
          course: internMember.course,
        },
      });
    }

    return res.status(401).json({ message: "Invalid email or password." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

// @desc    Get fresh current user details from DB using JWT token
// @route   GET /auth/me
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.userType === "intern") {
      const internMember = await Intern.findOne({
        _id: decoded.id,
        isDeleted: false,
      })
        .populate("branch", "branchName name")
        .populate("course", "courseName");

      if (!internMember) {
        return res.status(404).json({ message: "Intern account not found." });
      }

      if (!internMember.isActive || internMember.courseStatus === "Dropped") {
        return res
          .status(403)
          .json({ message: "Your intern account is inactive. Contact Admin." });
      }

      return res.status(200).json({
        user: {
          _id: internMember._id,
          admissionNumber: internMember.admissionNumber || "",
          name: internMember.fullName,
          email: internMember.officialEmail,
          personalEmail: internMember.email,
          userType: "intern",
          role: "Intern",
          batch: internMember.batch,
          branch: internMember.branch,
          course: internMember.course,
        },
      });
    }

    if (decoded.userType === "staff") {
      const staffMember = await Staff.findOne({
        _id: decoded.id,
        isDeleted: false,
      })
        .populate("role", "role permissions")
        .populate("branch", "branchName name");

      if (!staffMember) {
        return res.status(404).json({ message: "Staff account not found." });
      }

      const roleName =
        staffMember.role?.role || (staffMember.isMentor ? "Mentor" : "Staff");

      return res.status(200).json({
        user: {
          _id: staffMember._id,
          name: staffMember.fullName,
          email: staffMember.officialEmail,
          personalEmail: staffMember.email,
          userType: "staff",
          role: roleName,
          isMentor: staffMember.isMentor,
          branch: staffMember.branch,
          permissions: staffMember.role?.permissions || [],
        },
      });
    }

    const adminUser = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).populate("role", "role permissions");

    if (!adminUser) {
      return res.status(404).json({ message: "Admin account not found." });
    }

    return res.status(200).json({
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        userType: "admin",
        role: adminUser.role?.role || "Super Admin",
        permissions: adminUser.role?.permissions || [],
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginUser,
  getCurrentUser,
};