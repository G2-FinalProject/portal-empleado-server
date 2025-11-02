import express from "express";
import { decideVacationRequest } from "../controllers/VacationApprovalController.js";
import {  reviewVacationRequestRules } from "../validators/vacationApprovalValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { isAuthenticated, hasRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

const checkManagerOrAdmin = [isAuthenticated, hasRole(1,2)];


router.patch( "/:id/review", checkManagerOrAdmin, reviewVacationRequestRules,  handleValidationErrors, decideVacationRequest);

export default router;
