import express from "express";
import {
  createVacationRequest,
  getAllVacationRequests,
  getVacationRequestById,
  updateVacationRequest,
  deleteVacationRequest,
  getVacationSummary,
} from "../controllers/VacationRequestController.js";

import {
  createVacationRequestRules,
  updateVacationRequestRules,
  deleteVacationRequestRules,
  getVacationSummaryRules,
} from "../validators/vacationRequestValidator.js";

import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";

const router = express.Router();

// 🌴 Rutas para solicitudes de vacaciones
router.get("/", getAllVacationRequests);
router.get("/:id", getVacationRequestById);
router.post("/", createVacationRequestRules, handleValidationErrors, createVacationRequest);
router.put("/:id", updateVacationRequestRules, handleValidationErrors, updateVacationRequest);
router.delete("/:id", deleteVacationRequestRules, handleValidationErrors, deleteVacationRequest);
router.get("/:id/summary", getVacationSummaryRules, handleValidationErrors, getVacationSummary);

export default router;
