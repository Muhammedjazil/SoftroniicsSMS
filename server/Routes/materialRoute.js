
const express = require("express");
const router = express.Router();

const materialController = require("../Controllers/materialController");
const materialUpload = require("../Middleware/materialUpload");
const { checkAuth: CheckAuth } = require("../Middleware/checkAuth");
// Admin routes
router.get("/dropdowns", CheckAuth, materialController.getMaterialDropdowns);
router.get("/", CheckAuth, materialController.getMaterials);

router.post(
  "/",
  CheckAuth,
  materialUpload.single("attachments"),
  materialController.createMaterial
);

router.put(
  "/:id",
  CheckAuth,
  materialUpload.single("attachments"),
  materialController.updateMaterial
);

router.delete("/:id", CheckAuth, materialController.deleteMaterial);

// Intern route - keep before /:id
router.get("/intern", CheckAuth, materialController.getInternMaterials);

router.get("/:id", CheckAuth, materialController.getMaterialById);

module.exports = router;