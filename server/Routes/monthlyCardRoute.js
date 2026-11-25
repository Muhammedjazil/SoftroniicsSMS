
const express = require("express");
const router = express.Router();

const { checkAuth } = require("../Middleware/checkAuth");

const {
  getMyMonthlyCard,
  getInternsForMonthlyCard,
  getMonthlyCardsByIntern,
  createOrUpdateMonthlyCard,
  deleteMonthlyCard,
} = require("../Controllers/monthlyCardController");

router.get("/", checkAuth, getMyMonthlyCard);

router.get("/interns", checkAuth, getInternsForMonthlyCard);

router.get("/intern/:internId", checkAuth, getMonthlyCardsByIntern);

router.post("/", checkAuth, createOrUpdateMonthlyCard);

router.delete("/:id", checkAuth, deleteMonthlyCard);

module.exports = router;
