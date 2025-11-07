import express from "express";
import { createVacationRequest, getAllVacationRequests, getVacationRequestById, updateVacationRequest, deleteVacationRequest, getMyVacationRequests } from "../controllers/VacationRequestController.js";
import { createVacationRequestRules, updateVacationRequestRules, } from "../validators/vacationRequestValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { enforceBusinessDays } from "../middlewares/businessDaysMiddleware.js";
import { attachRequesterId } from "../middlewares/attachRequesterId.js";
import { checkAdmin, checkManagerOrAdmin, checkAuth } from '../utils/authChecks.js';


const vacationRequestRouter = express.Router();

vacationRequestRouter.get("/my-requests", checkAuth, getMyVacationRequests);
vacationRequestRouter.get("/", checkAuth, getAllVacationRequests);
vacationRequestRouter.get("/:id", checkAuth, getVacationRequestById);

vacationRequestRouter.post("/", checkAuth, attachRequesterId, enforceBusinessDays,createVacationRequestRules, handleValidationErrors,  createVacationRequest);

vacationRequestRouter.patch("/:id", checkAuth, enforceBusinessDays,updateVacationRequestRules, handleValidationErrors,  updateVacationRequest);

vacationRequestRouter.delete("/:id", checkAuth, deleteVacationRequest);

export default vacationRequestRouter;
