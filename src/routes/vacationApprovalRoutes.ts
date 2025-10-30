import express from "express";
import { decideVacationRequest } from "../controllers/VacationApprovalController.js";
import { decideVacationRequestRules } from "../validators/vacationApprovalValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { isAuthenticated, hasRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

const checkManagerOrAdmin = [isAuthenticated, hasRole(1,2)];


router.put("/:id/:action", checkManagerOrAdmin, decideVacationRequestRules, handleValidationErrors, decideVacationRequest);

export default router;
