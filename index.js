import express from "express";
import axios from "axios";
import crypto from "crypto";
import coursesRoute from "./routes/coursesRoute.js";
import courseRoute from "./routes/courseRoute.js";
import filterRoute from "./routes/filterRoute.js";
import telegramRoute from "./routes/telegramRoute.js";
import sendCourseAPI from "./routes/sendCourseAPI.js";
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
// import updateCourseToDatabaseRoute from "./routes/updateCourseToDatabaseRoute.js";

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
  "http://127.0.0.1:5500",
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
// app.use("/api", updateCourseToDatabaseRoute);
app.use("/api", sendCourseAPI);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Schedule the cleanup job to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  console.log("Running coupon cleanup job...");
  cleanupCoupons();
});



// Token Schema
const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Token = mongoose.model("Token", tokenSchema);

// Middleware to Validate Token
const validateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const tokenExists = await Token.findOne({ token });
  if (!tokenExists) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  next();
};

// Endpoint to Generate Token
app.post("/api/generate-token", async (req, res) => {
  try {
    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token to the database
    const newToken = new Token({ token });
    await newToken.save();

    // Respond with the token
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating token" });
  }
});

// Protected Route
app.get("/api/get-udemy-courses", validateToken, async (req, res) => {
  try {
    const response = await axios.post(
      "https://course-orbit-api.onrender.com/api/courses",{}
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching courses data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
