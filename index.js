import express from "express";
import coursesRoute from "./routes/coursesRoute.js";
import filterRoute from "./routes/filterRoute.js";
import telegramRoute from "./routes/telegramRoute.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cors from "cors";

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes before defining routes
const allowedOrigins = ["https://courseorbit.vercel.app", "http://localhost:5173"];

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
app.use("/api", filterRoute);
app.use("/api", telegramRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
