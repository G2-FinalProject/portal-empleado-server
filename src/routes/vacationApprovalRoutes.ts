import express from "express";
import { decideVacationRequest } from "../controllers/VacationApprovalController.js";
import {  reviewVacationRequestRules } from "../validators/vacationApprovalValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { checkManagerOrAdmin } from '../utils/authChecks.js';

const vacationApprovalRouter = express.Router();


vacationApprovalRouter.patch( "/:id/review", checkManagerOrAdmin, reviewVacationRequestRules,  handleValidationErrors, decideVacationRequest);

export default vacationApprovalRouter;
