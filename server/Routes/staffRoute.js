const express = require("express");
const router = express.Router();

const upload = require("../Middleware/upload");

const {
  takeroletitle,
  createstaff,
  takeallstaff,
  updatestaff,
  removestaff
} = require("../Controllers/staffController");

// Fetch roles
router.get("/", takeroletitle);


router.get("/allstaff",takeallstaff)

router.delete("/:id",removestaff)

router.put(
  "/:id",
  
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  updatestaff
);

// Create staff without JWT authentication for now
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  createstaff
);

module.exports = router;