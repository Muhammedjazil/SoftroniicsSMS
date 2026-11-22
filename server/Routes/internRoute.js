const express = require("express");
const router = express.Router();

const upload = require("../Middleware/upload");

const {
  createIntern,
  getAllInterns,
  updateIntern,
  removeintern
} = require("../Controllers/internController");

router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  createIntern
);

router.get("/", getAllInterns);

router.delete("/:id",removeintern);

router.put(
  "/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  updateIntern
);

module.exports = router;