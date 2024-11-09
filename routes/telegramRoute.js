import express from "express";
import telegramController from "../controllers/telegramController.js";

const router = express.Router();

router.post("/sendMessageToTelegram", telegramController);

export default router;
