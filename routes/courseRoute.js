import express from "express";
import getCourseById from "../controllers/courseController.js";

const router = express.Router();

// Route to get a specific course by ID
router.get("/courses/:courseId", getCourseById);

export default router;