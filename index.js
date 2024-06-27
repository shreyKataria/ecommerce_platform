// initialize
require("dotenv").config();
const express = require("express");
const app = express();

// imports
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoute");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/productsRoute");
const orderRoutes = require("./routes/orderRoute");

// host
const port = process.env.PORT || 8000;

// db
connectDB();

// middlewares
app.use(express.json());
app.use(bodyParser.json());

// routes
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

// server
app.listen(port, () => {
  console.log(`app is listening to port : ${port}`);
});
