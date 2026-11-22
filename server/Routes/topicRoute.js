const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} = require("../Controllers/topicController");

router.post("/", checkAuth, checkPermission("topicManagement", "addTopic"), createTopic);
router.get("/", checkAuth, checkPermission("topicManagement", "viewTopic"), getAllTopics);
router.get("/:id", checkAuth, checkPermission("topicManagement", "viewTopic"), getTopicById);
router.put("/:id", checkAuth, checkPermission("topicManagement", "editTopic"), updateTopic);
router.delete("/:id", checkAuth, checkPermission("topicManagement", "deleteTopic"), deleteTopic);

module.exports = router;