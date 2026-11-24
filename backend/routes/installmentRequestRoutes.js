import express from "express";
import {
  createInstallmentRequest,
  listInstallmentRequests,
  updateInstallmentRequestStatus,
} from "../controllers/installmentRequestController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInstallmentRequest);
router
  .route("/admin")
  .get(protect, admin, listInstallmentRequests);
router
  .route("/:id/status")
  .put(protect, admin, updateInstallmentRequestStatus);

export default router;
