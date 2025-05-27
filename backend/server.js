require("dotenv").config();

const express = require("express");
const ErrorHandler = require("./middleware/error");
const connectDatabase = require("./db/Database");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require('express-session');

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// connect db
connectDatabase();

// middlewares
app.use(express.json());
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const certificateDir = path.join(uploadsDir, 'certificates');
if (!fs.existsSync(certificateDir)) {
  fs.mkdirSync(certificateDir, { recursive: true });
}

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000",
    //origin: "https://tamkeen-frontend.vercel.app",
    credentials: true,
  })
);

// Static file serving - serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //sirf product
//app.use('/uploads', express.static('/tmp/uploads'));
app.use("/", express.static(path.join(__dirname, "uploads"))); //baqi sarey

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Add this BEFORE passport initialization
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes (only for OAuth flow)
    }
  })
);

// Initialize passport
const passport = require('./middleware/passport');
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const message = require("./controller/message");
const conversation = require("./controller/conversation");

const serviceRoutes = require("./controller/services");
const bookings = require("./controller/booking");
const BulkOrder = require("./controller/bulkorder");
const wholesaleMarket = require("./controller/wholesaleMarket");
const Workshop = require("./controller/Workshop");
const forum = require("./controller/forum");
const maps = require("./controller/maps");
const salesAnalysis = require("./controller/salesAnalysis");
const ServiceCategory = require("./controller/serviceCategory");

// end points
app.use("/api/v2/forum", forum);
app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/services", serviceRoutes);
app.use("/api/v2/book", bookings);
app.use("/api/v2/bulk-order", BulkOrder);
app.use("/api/v2/wholesaleMarket", wholesaleMarket);
app.use("/api/v2/workshop", Workshop);
app.use("/api/v2/map", maps);
app.use("/api/v2/sales-analysis", salesAnalysis);
app.use("/api/v2/service-categories", ServiceCategory);

// Error handler
app.use(ErrorHandler);

// create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server for handling UNCAUGHT EXCEPTION! 💥`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});