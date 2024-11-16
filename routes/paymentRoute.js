// routes/payment.js
import express from "express";
import { togglePaidStatus } from "../controllers/paymentController.js";

const router = express.Router();

// Route to toggle 'paid' status for a user
router.post("/toggle-paid", togglePaidStatus);

export default router;
