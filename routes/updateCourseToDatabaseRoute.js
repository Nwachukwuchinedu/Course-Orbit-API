import express from "express";
import updateCourseToDatabaseController from "../controllers/updateCourseToDatabaseController.js";

const router = express.Router();

router.post("/fetchAndUploadCourses", updateCourseToDatabaseController);

export default router;
