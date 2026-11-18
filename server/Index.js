require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./Config/db");

const app = express();
const PORT = process.env.PORT || 7000;

connectDb();

app.use(cors());
app.use(express.json());

  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
  });

// Export for Vercel Serverless Function
module.exports = app;
