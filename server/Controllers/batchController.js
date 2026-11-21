const Batch = require("../Models/batchModel");
const Intern = require("../Models/internModel"); // Adjust path/filename to match your Intern model

// @desc    Create a new batch
// @route   POST /batchmanagement
const createBatch = async (req, res) => {
  try {
    const { batchName, branch, status, interns = [], days = [] } = req.body;

    if (!batchName || !branch) {
      return res.status(400).json({ message: "Batch name and branch are required." });
    }

    // Check duplicate active batch name in the same branch
    const existingBatch = await Batch.findOne({
      batchName: batchName.trim().toUpperCase(),
      branch,
      isDeleted: false,
    });

    if (existingBatch) {
      return res.status(409).json({ message: "A batch with this name already exists in this branch." });
    }

    const newBatch = new Batch({
      batchName: batchName.trim().toUpperCase(),
      branch,
      status: status || "Active",
      interns,
      days,
      totalInterns: interns.length,
    });

    const savedBatch = await newBatch.save();

    const populatedBatch = await Batch.findById(savedBatch._id)
      .populate("branch", "branchName name")
      .populate({
        path: "interns",
        select: "name admissionNo admissionNumber course courseName branch",
        populate: { path: "course", select: "courseName name", strictPopulate: false },
      });

    return res.status(201).json({
      message: "Batch created successfully",
      data: populatedBatch,
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    return res.status(500).json({ message: "Server error while creating batch", error: error.message });
  }
};

// @desc    Get all non-deleted batches
// @route   GET /batchmanagement
const getAllBatches = async (req, res) => {
  try {
    const { branch, status, search } = req.query;

    const filter = { isDeleted: false };

    if (branch && branch !== "All Branches") {
      filter.branch = branch;
    }

    if (status && status !== "All Status") {
      filter.status = status;
    }

    if (search && search.trim() !== "") {
      filter.batchName = { $regex: search.trim(), $options: "i" };
    }

    const batches = await Batch.find(filter)
      .populate("branch", "branchName name")
      .populate({
        path: "interns",
        select: "name admissionNo admissionNumber course courseName branch",
        populate: { path: "course", select: "courseName name", strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return res.status(500).json({ message: "Server error while fetching batches", error: error.message });
  }
};

// @desc    Get single batch by ID
// @route   GET /batchmanagement/:id
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.id, isDeleted: false })
      .populate("branch", "branchName name")
      .populate({
        path: "interns",
        select: "name admissionNo admissionNumber course courseName branch",
        populate: { path: "course", select: "courseName name", strictPopulate: false },
      });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    return res.status(200).json(batch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    return res.status(500).json({ message: "Server error while fetching batch", error: error.message });
  }
};

// @desc    Update an existing batch
// @route   PUT /batchmanagement/:id
const updateBatch = async (req, res) => {
  try {
    const { batchName, branch, status, interns, days } = req.body;

    const batch = await Batch.findOne({ _id: req.params.id, isDeleted: false });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batchName !== undefined) batch.batchName = batchName.trim().toUpperCase();
    if (branch !== undefined) batch.branch = branch;
    if (status !== undefined) {
      batch.status = status;
      batch.isActive = status === "Active";
    }
    if (Array.isArray(interns)) {
      batch.interns = interns;
      batch.totalInterns = interns.length;
    }
    if (Array.isArray(days)) {
      batch.days = days;
    }

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate("branch", "branchName name")
      .populate({
        path: "interns",
        select: "name admissionNo admissionNumber course courseName branch",
        populate: { path: "course", select: "courseName name", strictPopulate: false },
      });

    return res.status(200).json({
      message: "Batch updated successfully",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    return res.status(500).json({ message: "Server error while updating batch", error: error.message });
  }
};

// @desc    Toggle batch status
// @route   PUT /batchmanagement/status/:id
const changeBatchStatus = async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.id, isDeleted: false });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const nextStatus = req.body.status || (batch.status === "Active" ? "Inactive" : "Active");
    batch.status = nextStatus;
    batch.isActive = nextStatus === "Active";

    await batch.save();

    return res.status(200).json({
      message: "Batch status updated",
      data: batch,
    });
  } catch (error) {
    console.error("Error changing batch status:", error);
    return res.status(500).json({ message: "Server error while updating status", error: error.message });
  }
};

// @desc    Soft delete a batch
// @route   DELETE /batchmanagement/:id
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    return res.status(200).json({
      message: "Batch deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return res.status(500).json({ message: "Server error while deleting batch", error: error.message });
  }
};

// @desc    Get interns filtered by branch (for Intern Assignment dropdown)
// @route   GET /batchmanagement/interns/:branchId
const getInternsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const interns = await Intern.find({
      branch: branchId,
      isDeleted: { $ne: true },
    })
      .select("name admissionNo admissionNumber course courseName branch")
      .populate({ path: "course", select: "courseName name", strictPopulate: false });

    return res.status(200).json(interns);
  } catch (error) {
    console.error("Error fetching interns by branch:", error);
    return res.status(500).json({ message: "Server error while fetching interns", error: error.message });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  changeBatchStatus,
  deleteBatch,
  getInternsByBranch,
};