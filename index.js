const cluster = require("cluster");
const os = require("os");

// load balancing
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
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
  const limiter = require("./middlewares/rateLimit");
  const errorHandler = require("./middlewares/errorHandler");
  const { mockPayPal, mockStripe } = require("./mocks/paymentMocks");
  const mockLogistics = require("./mocks/logisticMocks");
  const fs = require("fs");
  const https = require("https");

  // host
  const PORT = process.env.PORT || 8000;

  // db
  connectDB();

  // middlewares
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(errorHandler);
  app.use(limiter);

  // nock apis
  mockPayPal();
  mockStripe();
  mockLogistics();

  // routes
  app.use("/api", userRoutes);
  app.use("/api", productRoutes);
  app.use("/api", orderRoutes);

  // server
  if (process.env.NODE_ENV === "production") {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(
        `https Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } else {
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  }
  console.log(`Worker ${process.pid} started`);
}
