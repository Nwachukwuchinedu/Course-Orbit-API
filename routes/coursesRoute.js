import express from "express";
import courseController from "../controllers/courseController.js";

const router = express.Router();

router.post('/courses', courseController)

export default router
