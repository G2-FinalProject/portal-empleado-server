import express from "express";
import { decideVacationRequest } from "../controllers/VacationApprovalController.js";
import {  reviewVacationRequestRules } from "../validators/vacationApprovalValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { checkManagerOrAdmin } from '../utils/authChecks.js';

const router = express.Router();


router.patch( "/:id/review", checkManagerOrAdmin, reviewVacationRequestRules,  handleValidationErrors, decideVacationRequest);

export default router;
