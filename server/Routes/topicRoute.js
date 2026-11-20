const express = require("express");
const router = express.Router();

const {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} = require("../Controllers/topicController");

router.post("/", createTopic);
router.get("/", getAllTopics);
router.get("/:id", getTopicById);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

module.exports = router;