import express from "express";
import { updateCashByEmail } from "../controllers/cashController.js"; // Adjust the path as needed

const router = express.Router();

// Route to update the cash field for a user based on email
router.put("/user/cash", updateCashByEmail);

export default router;
