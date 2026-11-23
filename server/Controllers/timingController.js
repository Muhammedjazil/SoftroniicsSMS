const Timing = require("../Models/timingModel");
const Branch = require("../Models/branchModel");

// @desc    Create a new timing slot
// @route   POST /timemanagement
const createTiming = async (req, res) => {
  try {
    const { branch, timeSlot } = req.body;

    if (!branch || !timeSlot || !timeSlot.trim()) {
      return res.status(400).json({ message: "Branch and time slot are required." });
    }

    const formattedSlot = timeSlot.trim();

    // Prevent duplicate timeSlot in the same branch
    const existing = await Timing.findOne({
      branch,
      timeSlot: formattedSlot,
      isDeleted: false,
    });

    if (existing) {
      return res.status(409).json({ message: "This time slot already exists for the selected branch." });
    }

    const newTiming = new Timing({
      branch,
      timeSlot: formattedSlot,
    });

    const savedTiming = await newTiming.save();
    const populatedTiming = await Timing.findById(savedTiming._id).populate(
      "branch",
      "branchName name"
    );

    return res.status(201).json({
      message: "Timing created successfully",
      data: populatedTiming,
    });
  } catch (error) {
    console.error("Error creating timing:", error);
    return res.status(500).json({ message: "Server error while creating timing", error: error.message });
  }
};

// @desc    Get all active timings (optionally filtered by branch)
// @route   GET /timemanagement
const getAllTimings = async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = { isDeleted: false };

    if (branch && branch !== "All Branches") {
      filter.branch = branch;
    }

    const timings = await Timing.find(filter)
      .populate("branch", "branchName name")
      .sort({ createdAt: 1 });

    return res.status(200).json(timings);
  } catch (error) {
    console.error("Error fetching timings:", error);
    return res.status(500).json({ message: "Server error while fetching timings", error: error.message });
  }
};

// @desc    Update an existing timing slot
// @route   PUT /timemanagement/:id
const updateTiming = async (req, res) => {
  try {
    const { branch, timeSlot, isActive } = req.body;

    const timing = await Timing.findOne({ _id: req.params.id, isDeleted: false });
    if (!timing) {
      return res.status(404).json({ message: "Timing not found" });
    }

    const targetBranch = branch || timing.branch;
    const targetSlot = timeSlot ? timeSlot.trim() : timing.timeSlot;

    // Check duplicate against other records in same branch
    const duplicate = await Timing.findOne({
      _id: { $ne: req.params.id },
      branch: targetBranch,
      timeSlot: targetSlot,
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(409).json({ message: "This time slot already exists for the selected branch." });
    }

    timing.branch = targetBranch;
    timing.timeSlot = targetSlot;
    if (typeof isActive === "boolean") {
      timing.isActive = isActive;
    }

    await timing.save();

    const updatedTiming = await Timing.findById(timing._id).populate(
      "branch",
      "branchName name"
    );

    return res.status(200).json({
      message: "Timing updated successfully",
      data: updatedTiming,
    });
  } catch (error) {
    console.error("Error updating timing:", error);
    return res.status(500).json({ message: "Server error while updating timing", error: error.message });
  }
};

// @desc    Soft delete a timing slot
// @route   DELETE /timemanagement/:id
const deleteTiming = async (req, res) => {
  try {
    const timing = await Timing.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!timing) {
      return res.status(404).json({ message: "Timing not found" });
    }

    return res.status(200).json({
      message: "Timing deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting timing:", error);
    return res.status(500).json({ message: "Server error while deleting timing", error: error.message });
  }
};

module.exports = {
  createTiming,
  getAllTimings,
  updateTiming,
  deleteTiming,
};