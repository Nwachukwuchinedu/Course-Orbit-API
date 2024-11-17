import express from "express";
import coursesRoute from "./routes/coursesRoute.js";
import courseRoute from "./routes/courseRoute.js";
import filterRoute from "./routes/filterRoute.js";
import telegramRoute from "./routes/telegramRoute.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cron from "node-cron";
import { cleanupCoupons } from "./controllers/couponCleanupController.js";
import searchCoursesRoute from "./routes/searchCoursesRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import updateCourseToDatabaseRoute from "./routes/updateCourseToDatabaseRoute.js";
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  }); 

  // Use the StealthPlugin to enhance Puppeteer's stealth capabilities
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes before defining routes
const allowedOrigins = [
  "https://course-orbit.vercel.app",
  "http://localhost:5173",
  "https://course-orbit-payment.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use("/api", coursesRoute);
app.use("/api", courseRoute);
app.use("/api", filterRoute);
// app.use("/api", telegramRoute);
app.use("/api/auth", authRoutes);
app.use("/api", searchCoursesRoute);
app.use("/api", paymentRoute);
app.use("/api", updateCourseToDatabaseRoute);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Schedule the cleanup job to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  console.log("Running coupon cleanup job...");
  cleanupCoupons();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
