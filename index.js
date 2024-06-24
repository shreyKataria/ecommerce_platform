// initialize
require("dotenv").config();
const express = require("express");
const app = express();

// imports
const connectDB = require("./config/db");
const userRoute = require("./routes/userrouter");
const bodyParser = require("body-parser");

// host
const port = process.env.PORT || 8000;

// db
connectDB();

// middlewares
app.use(express.json());
app.use(bodyParser.json());

// routes
app.use("/api", userRoute);

// server
app.listen(port, () => {
  console.log(`app is listening to port : ${port}`);
});