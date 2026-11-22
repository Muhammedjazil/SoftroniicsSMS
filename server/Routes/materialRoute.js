const express = require("express");
const router = express.Router();

const materialController = require("../Controllers/materialController");
const materialUpload = require("../Middleware/materialUpload");

router.get("/dropdowns", materialController.getMaterialDropdowns);
router.get("/", materialController.getMaterials);

router.post(
  "/",
  materialUpload.single("attachments"),
  materialController.createMaterial
);

router.get("/:id", materialController.getMaterialById);

router.put(
  "/:id",
  materialUpload.single("attachments"),
  materialController.updateMaterial
);

router.delete("/:id", materialController.deleteMaterial);

module.exports = router;