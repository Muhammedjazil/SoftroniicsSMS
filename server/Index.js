require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDb = require("./Config/db");

const authRoute = require("./Routes/authRoute");
const roleRoute = require("./Routes/roleRoute");
const staffRoute = require("./Routes/staffRoute");
const batchRoute = require("./Routes/batchRoute");
const branchRoute = require("./Routes/branchRoute");
const mentorBatchRoute = require("./Routes/mentorBatchRoute");
const timingRoute = require("./Routes/timingRoute");
const weeklyScheduleRoute = require("./Routes/weeklyScheduleRoute");
const categoryRoute = require("./Routes/categoryRoute");
const courseRoute = require("./Routes/courseRoute");
const moduleRoute = require("./Routes/moduleRoute");
const topicRoute = require("./Routes/topicRoute");
const internScheduleRoute = require("./Routes/internScheduleRoute");

const app = express();
const PORT = process.env.PORT || 7000;

connectDb();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoute);
app.use("/Rolemanagement", roleRoute);
app.use("/staffmanagement", staffRoute);
app.use("/batchmanagement", batchRoute);
app.use("/branchmanagement", branchRoute);
app.use("/mentorbatches", mentorBatchRoute);
app.use("/timemanagement", timingRoute);
app.use("/weeklyschedule", weeklyScheduleRoute);
app.use("/categorymanagement", categoryRoute);
app.use("/coursemanagement", courseRoute);
app.use("/modulemanagement", moduleRoute);
app.use("/topicmanagement", topicRoute);
app.use("/internschedule", internScheduleRoute);

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

// Export for Vercel Serverless Function
module.exports = app;