const Topic = require("../Models/topicModel");
const Module = require("../Models/moduleModel");

// @desc    Create a new topic & push into parent Module.topics
// @route   POST /topicmanagement
const createTopic = async (req, res) => {
  try {
    const { topicName, module: moduleId } = req.body;

    if (!topicName || !topicName.trim() || !moduleId) {
      return res
        .status(400)
        .json({ message: "Topic name and module are required." });
    }

    const formattedName = topicName.trim().toUpperCase();

    const parentModule = await Module.findOne({ _id: moduleId, isDeleted: false });
    if (!parentModule) {
      return res.status(404).json({ message: "Selected module not found." });
    }

    // Prevent duplicate active topic inside the same module
    const existing = await Topic.findOne({
      topicName: formattedName,
      module: moduleId,
      isDeleted: false,
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "This topic already exists in the selected module." });
    }

    const newTopic = new Topic({
      topicName: formattedName,
      module: moduleId,
    });

    const savedTopic = await newTopic.save();

    // Link topic to parent Module & trigger pre('save') to update totalTopics
    if (!parentModule.topics.some((tId) => tId.toString() === savedTopic._id.toString())) {
      parentModule.topics.push(savedTopic._id);
      await parentModule.save();
    }

    const populatedTopic = await Topic.findById(savedTopic._id).populate(
      "module",
      "moduleName"
    );

    return res.status(201).json({
      message: "Topic created successfully",
      data: populatedTopic,
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    return res.status(500).json({
      message: "Server error while creating topic",
      error: error.message,
    });
  }
};

// @desc    Get all active topics (optionally filtered by module or search)
// @route   GET /topicmanagement
const getAllTopics = async (req, res) => {
  try {
    const { module: moduleId, search } = req.query;
    const filter = { isDeleted: false };

    if (moduleId && moduleId !== "All Modules") {
      filter.module = moduleId;
    }

    if (search && search.trim() !== "") {
      filter.topicName = { $regex: search.trim(), $options: "i" };
    }

    const topics = await Topic.find(filter)
      .populate("module", "moduleName")
      .sort({ createdAt: -1 });

    return res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return res.status(500).json({
      message: "Server error while fetching topics",
      error: error.message,
    });
  }
};

// @desc    Get single topic by ID
// @route   GET /topicmanagement/:id
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "module",
      "moduleName"
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return res.status(500).json({
      message: "Server error while fetching topic",
      error: error.message,
    });
  }
};

// @desc    Update a topic & sync Module.topics if moved to another module
// @route   PUT /topicmanagement/:id
const updateTopic = async (req, res) => {
  try {
    const { topicName, module: newModuleId } = req.body;

    const topic = await Topic.findOne({ _id: req.params.id, isDeleted: false });
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const targetModuleId = newModuleId || topic.module.toString();
    const targetName = topicName ? topicName.trim().toUpperCase() : topic.topicName;

    // Duplicate check within target module
    const duplicate = await Topic.findOne({
      _id: { $ne: req.params.id },
      topicName: targetName,
      module: targetModuleId,
      isDeleted: false,
    });

    if (duplicate) {
      return res
        .status(409)
        .json({ message: "This topic already exists in the selected module." });
    }

    const oldModuleId = topic.module.toString();

    topic.topicName = targetName;
    topic.module = targetModuleId;
    await topic.save();

    // If module changed, move topic reference between old and new Module docs
    if (oldModuleId !== targetModuleId.toString()) {
      const oldModule = await Module.findById(oldModuleId);
      if (oldModule) {
        oldModule.topics = oldModule.topics.filter(
          (tId) => tId.toString() !== topic._id.toString()
        );
        await oldModule.save();
      }

      const newModule = await Module.findById(targetModuleId);
      if (newModule) {
        if (!newModule.topics.some((tId) => tId.toString() === topic._id.toString())) {
          newModule.topics.push(topic._id);
          await newModule.save();
        }
      }
    }

    const updatedTopic = await Topic.findById(topic._id).populate(
      "module",
      "moduleName"
    );

    return res.status(200).json({
      message: "Topic updated successfully",
      data: updatedTopic,
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return res.status(500).json({
      message: "Server error while updating topic",
      error: error.message,
    });
  }
};

// @desc    Soft delete a topic & remove reference from parent Module
// @route   DELETE /topicmanagement/:id
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Remove topic from parent Module & update totalTopics
    const parentModule = await Module.findById(topic.module);
    if (parentModule) {
      parentModule.topics = parentModule.topics.filter(
        (tId) => tId.toString() !== topic._id.toString()
      );
      await parentModule.save();
    }

    return res.status(200).json({
      message: "Topic deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return res.status(500).json({
      message: "Server error while deleting topic",
      error: error.message,
    });
  }
};

module.exports = {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
};