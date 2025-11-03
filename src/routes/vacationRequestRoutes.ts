import express from "express";
import {
  createVacationRequest,
  getAllVacationRequests,
  getVacationRequestById,
  updateVacationRequest,
  deleteVacationRequest,
} from "../controllers/VacationRequestController.js";
import {
  createVacationRequestRules,
  updateVacationRequestRules,
} from "../validators/vacationRequestValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { isAuthenticated, hasRole } from "../middlewares/authMiddleware.js";


const vacationRequestRouter = express.Router();
const checkAuth = [isAuthenticated]; 

vacationRequestRouter.get("/", checkAuth, getAllVacationRequests);
vacationRequestRouter.get("/:id", checkAuth, getVacationRequestById);
vacationRequestRouter.post("/", checkAuth, createVacationRequestRules, handleValidationErrors, createVacationRequest);
vacationRequestRouter.patch("/:id", checkAuth, updateVacationRequestRules, handleValidationErrors, updateVacationRequest);
vacationRequestRouter.delete("/:id", checkAuth, deleteVacationRequest);

export default vacationRequestRouter;
