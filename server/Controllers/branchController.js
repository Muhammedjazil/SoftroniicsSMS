const mongoose = require("mongoose");
const Branch = require("../Models/branchModel");
const Batch = require("../Models/batchModel");
const Timing = require("../Models/timingModel");
const WeeklySchedule = require("../Models/weeklyScheduleModel");

// =====================================
// GET ALL BRANCHES
// =====================================
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json(branches);
  } catch (error) {
    console.error("Get branches error:", error);

    return res.status(500).json({
      message: "Failed to fetch branches",
      error: error.message,
    });
  }
};

// =====================================
// GET BRANCH BY ID
// =====================================
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    const branch = await Branch.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    return res.status(200).json(branch);
  } catch (error) {
    console.error("Get branch error:", error);

    return res.status(500).json({
      message: "Failed to fetch branch",
      error: error.message,
    });
  }
};

// =====================================
// CREATE NEW BRANCH
// =====================================
const createBranch = async (req, res) => {
  try {
    const { branchName, branch, location, batchType } = req.body;

    // Supports both branchName and your existing frontend's branch field
    const finalBranchName = branchName || branch;

    if (!finalBranchName || !location) {
      return res.status(400).json({
        message: "Branch name and location are required",
      });
    }

    const trimmedBranchName = finalBranchName.trim();
    const trimmedLocation = location.trim();

    // Check duplicate branch
    const existingBranch = await Branch.findOne({
      branchName: {
        $regex: `^${trimmedBranchName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      isDeleted: false,
    });

    if (existingBranch) {
      return res.status(409).json({
        message: "Branch already exists",
      });
    }

    const newBranch = await Branch.create({
      branchName: trimmedBranchName,
      location: trimmedLocation,
      batchType: batchType || "Regular",
    });

    return res.status(201).json({
      message: "Branch created successfully",
      branch: newBranch,
    });
  } catch (error) {
    console.error("Create branch error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Branch already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create branch",
      error: error.message,
    });
  }
};

// =====================================
// UPDATE BRANCH
// =====================================
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    const { branchName, branch, location, batchType } = req.body;

    const updateData = {};

    if (branchName !== undefined || branch !== undefined) {
      const finalName = branchName || branch;

      if (!finalName.trim()) {
        return res.status(400).json({
          message: "Branch name cannot be empty",
        });
      }

      updateData.branchName = finalName.trim();
    }

    if (location !== undefined) {
      if (!location.trim()) {
        return res.status(400).json({
          message: "Location cannot be empty",
        });
      }

      updateData.location = location.trim();
    }

    if (batchType !== undefined) {
      updateData.batchType = batchType;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No update data provided",
      });
    }

    const updatedBranch = await Branch.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBranch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      message: "Branch updated successfully",
      branch: updatedBranch,
    });
  } catch (error) {
    console.error("Update branch error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Branch name already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update branch",
      error: error.message,
    });
  }
};

// =====================================
// DELETE BRANCH (PERMANENT + SAFE)
// =====================================
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate branch ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    // 2. Check whether branch exists
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    // 3. Check references in Batch collection
    const batchCount = await Batch.countDocuments({
      branch: id,
      isDeleted: { $ne: true },
    });

    // 4. Check references in Timing collection
    const timingCount = await Timing.countDocuments({
      branch: id,
      isDeleted: { $ne: true },
    });

    // 5. Check references in WeeklySchedule collection
    const weeklyScheduleCount = await WeeklySchedule.countDocuments({
      "schedule.sub_details.branch": id,
    });

    // 6. Prevent deletion if references exist
    if (batchCount > 0 || timingCount > 0 || weeklyScheduleCount > 0) {
      return res.status(409).json({
        message: "Cannot delete this branch because it is being used.",
        dependencies: {
          batches: batchCount,
          timings: timingCount,
          weeklySchedules: weeklyScheduleCount,
        },
      });
    }

    // 7. Permanently delete branch
    await Branch.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Branch permanently deleted successfully",
    });
  } catch (error) {
    console.error("Delete branch error:", error);

    return res.status(500).json({
      message: "Failed to delete branch",
      error: error.message,
    });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};