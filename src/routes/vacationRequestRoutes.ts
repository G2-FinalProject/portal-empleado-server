import express from "express";
import {
  createVacationRequest,
  getAllVacationRequests,
  getVacationRequestById,
  updateVacationRequest,
  deleteVacationRequest,
} from "../controllers/VacationRequestController.js";
import {
  validateVacationBody,
  validateVacationId,
  validateUpdateBody,
} from "../validators/vacationRequestValidator.js";

const router = express.Router();

/**
 * 🌴 Rutas para manejar solicitudes de vacaciones con validaciones detalladas
 */
router.post("/", validateVacationBody, createVacationRequest);
router.get("/", getAllVacationRequests);
router.get("/:id", validateVacationId, getVacationRequestById);
router.put("/:id", validateVacationId, validateUpdateBody, updateVacationRequest);
router.delete("/:id", validateVacationId, deleteVacationRequest);

export default router;
