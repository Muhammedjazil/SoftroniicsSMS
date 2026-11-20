require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./Config/db");
const roleRoute = require("./Routes/roleRoute");
const staffRoute = require("./Routes/staffRoute");
const batchRoute = require("./Routes/batchRoute");
// const branchRoute = require("./Routes/branchRoute");
const mentorBatchRoute = require("./Routes/mentorBatchRoute");

const app = express();
const PORT = process.env.PORT || 7000;

connectDb();

app.use(cors());
app.use(express.json());

app.use("/Rolemanagement", roleRoute);
app.use("/staffmanagement", staffRoute);
app.use("/batchmanagement", batchRoute);
// app.use("/branchmanagement", branchRoute);
app.use("/mentorbatches", mentorBatchRoute);


app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

// Export for Vercel Serverless Function
module.exports = app;