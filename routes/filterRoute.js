import express from "express";
import filterController from "../controllers/filterController.js";

const router = express.Router();

router.post('/filter', filterController)

export default router
