require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./Config/db");

const roleRoute = require("./Routes/roleRoute");
const staffRoute = require("./Routes/staffRoute");
const branchRoute = require("./Routes/branchRoute");
const timingRoute = require("./Routes/timingRoute");
const batchRoute = require("./Routes/batchRoute");
const mentorBatchRoute = require("./Routes/mentorBatchRoute");
const weeklyScheduleRoute = require("./Routes/weeklyScheduleRoute");
const moduleRoute = require("./Routes/moduleRoute");
const topicRoute = require("./Routes/topicRoute");

const app = express();
const PORT = process.env.PORT || 7000;

connectDb();

app.use(cors());
app.use(express.json());

app.use("/Rolemanagement", roleRoute);
app.use("/staffmanagement", staffRoute);
app.use("/branchmanagement", branchRoute);
app.use("/timemanagement", timingRoute);
app.use("/batchmanagement", batchRoute);
app.use("/mentorbatches", mentorBatchRoute);
app.use("/weeklyschedule", weeklyScheduleRoute);
app.use("/modulemanagement", moduleRoute);
app.use("/topicmanagement", topicRoute);

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

module.exports = app;