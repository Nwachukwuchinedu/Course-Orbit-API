import express from "express";
import { fetchCourses} from "../controllers/sendCourseAPI.js";

const router = express.Router();

router.post("/fetch-courses", fetchCourses);

export default router;
