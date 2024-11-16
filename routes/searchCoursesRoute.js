import express from "express";
import { searchCourses } from "../controllers/searchCoursesController.js";

const router = express.Router();

// Search route
router.get("/search", searchCourses);

export default router;
