
const Intern = require("../Models/internModel");
const bcrypt = require("bcrypt");
const { deleteFromCloudinary } = require("../Config/cloudinary");

const generateUniqueInternId = async () => {
  const year = new Date().getFullYear();
  const prefix = `INT-${year}-`;

  const latestIntern = await Intern.findOne({
    admissionNumber: { $regex: `^${prefix}\\d+$` }
  })
    .sort({ admissionNumber: -1 })
    .select("admissionNumber")
    .lean();

  let nextNumber = 1;
  if (latestIntern?.admissionNumber) {
    const numericPart = parseInt(latestIntern.admissionNumber.replace(prefix, ""), 10);
    if (!Number.isNaN(numericPart)) {
      nextNumber = numericPart + 1;
    }
  }

  while (true) {
    const candidate = `${prefix}${String(nextNumber).padStart(4, "0")}`;
    const exists = await Intern.exists({ admissionNumber: candidate });
    if (!exists) return candidate;
    nextNumber += 1;
  }
};

const createIntern = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      email,
      phone,
      whatsapp,
      guardianName,
      fatherName,
      motherName,
      parentPhone,
      address,
      district,
      state,
      course,
      branch,
      startDate,
      completionDate,
      batch,
      courseStatus,
      careerAdvisor,
      syllabusStatus,
      remarks,
      placementStatus,
      linkedin,
      portfolio,
      companyName,
      jobRole,
      studentEmail,
      password
    } = req.body;

    // Check required fields
    if (
      !fullName ||
      !dob ||
      !gender ||
      !email ||
      !phone ||
      !course ||
      !branch ||
      !startDate ||
      !batch ||
      !studentEmail ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    // Check duplicate email
    const existingIntern = await Intern.findOne({
      $or: [
        { email: email.toLowerCase() },
        { officialEmail: studentEmail.toLowerCase() }
      ]
    });

    if (existingIntern) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Uploaded Cloudinary URLs
    const photo = req.files?.photo?.[0]?.path || "";

    const resume = req.files?.resume?.[0]?.path || "";

    let intern;
    for (let attempt = 0; attempt < 3; attempt++) {
      const admissionNumber = await generateUniqueInternId();

      intern = new Intern({
        admissionNumber,
        fullName: fullName.trim(),
        dateOfBirth: dob,
        gender,
        email: email.toLowerCase(),
        internPhoneNumber: phone,
        internWhatsAppNumber: whatsapp,
        guardianName,
        fatherName,
        motherName,
        guardianParentPhone: parentPhone,
        internPermanentAddress: address,
        district,
        state,
        photo,

        course,
        branch,
        courseStartedDate: startDate,
        completionDate: completionDate || null,
        batch,
        courseStatus: courseStatus || "Ongoing",
        careerAdvisor: careerAdvisor || undefined,
        remarks,

        internSyllabusStatus: syllabusStatus || "Not Started",

        placementStatus: placementStatus || "Not Placed",
        linkedin,
        portfolio,
        companyName,
        jobRole,
        resume,

        officialEmail: studentEmail.toLowerCase(),
        password: hashedPassword
      });

      try {
        await intern.save();
        break;
      } catch (saveError) {
        if (
          saveError?.code === 11000 &&
          saveError?.keyPattern?.admissionNumber &&
          attempt < 2
        ) {
          continue;
        }
        throw saveError;
      }
    }

    const savedIntern = await Intern.findById(intern._id)
      .populate("course", "courseName")
      .populate("branch", "branchName")
      .populate("careerAdvisor", "fullName")
      .select("-password");

    return res.status(201).json({
      message: "Intern created successfully",
      intern: savedIntern
    });

  } catch (error) {
    console.error("Create Intern Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create intern"
    });
  }
};

const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.find({ isDeleted: false })
      .populate("course", "courseName")
      .populate("branch", "branchName")
      .populate("careerAdvisor", "fullName")
      .populate("batch", "batchName")
      .sort({ createdAt: -1 })
      .select("-password");

    return res.status(200).json({
      message: "Interns fetched successfully",
      interns
    });

  } catch (error) {
    console.error("Get Interns Error:", error);

    return res.status(500).json({
      message: "Failed to fetch interns"
    });
  }
};

const updateIntern = async (req, res) => {
  try {
    const { id } = req.params;

    const intern = await Intern.findById(id);

    if (!intern || intern.isDeleted) {
      return res.status(404).json({
        message: "Intern not found"
      });
    }

    const {
      fullName,
      dob,
      gender,
      email,
      phone,
      whatsapp,
      guardianName,
      fatherName,
      motherName,
      parentPhone,
      address,
      district,
      state,
      course,
      branch,
      startDate,
      completionDate,
      batch,
      courseStatus,
      careerAdvisor,
      syllabusStatus,
      remarks,
      placementStatus,
      linkedin,
      portfolio,
      companyName,
      jobRole,
      studentEmail,
      password
    } = req.body;

    // Update normal fields
    intern.fullName = fullName;
    intern.dateOfBirth = dob;
    intern.gender = gender;
    intern.email = email;
    intern.internPhoneNumber = phone;
    intern.internWhatsAppNumber = whatsapp;
    intern.guardianName = guardianName;
    intern.fatherName = fatherName;
    intern.motherName = motherName;
    intern.guardianParentPhone = parentPhone;
    intern.internPermanentAddress = address;
    intern.district = district;
    intern.state = state;

    intern.course = course;
    intern.branch = branch;
    intern.courseStartedDate = startDate;
    intern.completionDate = completionDate || null;
    intern.batch = batch;

    intern.courseStatus = courseStatus;
    intern.careerAdvisor = careerAdvisor || null;
    intern.internSyllabusStatus = syllabusStatus;
    intern.remarks = remarks;

    intern.placementStatus = placementStatus;
    intern.linkedin = linkedin;
    intern.portfolio = portfolio;
    intern.companyName = companyName;
    intern.jobRole = jobRole;
    intern.officialEmail = studentEmail;

    // Replace files only when new files are uploaded
    if (req.files?.photo?.[0]?.path) {
      if (intern.photo) await deleteFromCloudinary(intern.photo);
      intern.photo = req.files.photo[0].path;
    }

    if (req.files?.resume?.[0]?.path) {
      if (intern.resume) await deleteFromCloudinary(intern.resume);
      intern.resume = req.files.resume[0].path;
    }

    // Change password only if a new password is provided
    if (password && password.trim() !== "") {
      const bcrypt = require("bcryptjs");
      intern.password = await bcrypt.hash(password, 10);
    }

    await intern.save();

    const updatedIntern = await Intern.findById(id)
      .populate("course", "courseName")
      .populate("branch", "branchName")
      .populate("careerAdvisor", "fullName")
      .populate("batch", "batchName")
      .select("-password");

    return res.status(200).json({
      message: "Intern updated successfully",
      intern: updatedIntern
    });

  } catch (error) {
    console.error("Update Intern Error:", error);

    return res.status(500).json({
      message: "Failed to update intern",
      error: error.message
    });
  }
};

const removeintern=async(req,res)=>{
    try{
        const {id}=req.params;
        const intern=await Intern.findByIdAndDelete(id);
        if (intern?.photo) await deleteFromCloudinary(intern.photo);
        if (intern?.resume) await deleteFromCloudinary(intern.resume);
        res.json("intern deleted")
    }
    catch(error){
        res.json({message:"intern not deleted"})
    }
}

module.exports = { 
    createIntern,
    getAllInterns,
    updateIntern,
    removeintern
 };
