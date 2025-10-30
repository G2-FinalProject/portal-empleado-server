import express from "express";
import { decideVacationRequest } from "../controllers/VacationApprovalController.js";
import { decideVacationRequestRules } from "../validators/vacationApprovalValidator.js";

const router = express.Router();

// ✅ Ruta para aprobar o rechazar una solicitud
router.put("/:id/:action", decideVacationRequestRules, decideVacationRequest);

export default router;
