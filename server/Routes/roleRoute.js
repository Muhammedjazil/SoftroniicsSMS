const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  createnewrole,
  takeallrole,
  updaterole,
  roleremove,
  changestatus,
} = require("../Controllers/roleController");

router.post("/", checkAuth, checkPermission("roleManagement", "addRole"), createnewrole);
router.get("/", checkAuth, checkPermission("roleManagement", "viewRole"), takeallrole);
router.put("/:id", checkAuth, checkPermission("roleManagement", "editRole"), updaterole);
router.delete("/:id", checkAuth, checkPermission("roleManagement", "deleteRole"), roleremove);
router.put("/status/:id", checkAuth, checkPermission("roleManagement", "editRole"), changestatus);

module.exports = router;