import express from "express";
import { getBankTransferConfig } from "../controllers/bankPaymentController.js";

const router = express.Router();

router.get("/config", getBankTransferConfig);

export default router;
