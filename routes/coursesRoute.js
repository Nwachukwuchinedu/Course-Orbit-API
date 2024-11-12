import express from "express";
import coursesController from "../controllers/coursesController.js";

const router = express.Router();

router.post("/courses", coursesController);

export default router;
