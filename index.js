import express from "express";
import coursesRoute from "./routes/coursesRoute.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cors from "cors";

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes before defining routes
app.use(cors({ origin: "http://localhost:5173" }));

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use("/api", coursesRoute);

app.get("/", (req, res) => {
  res.send("This is express app");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
