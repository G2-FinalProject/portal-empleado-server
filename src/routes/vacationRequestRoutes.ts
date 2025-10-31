import express from "express";
import {
  createVacationRequest,
  getAllVacationRequests,
  getVacationRequestById,
  updateVacationRequest,
  deleteVacationRequest,
} from "../controllers/VacationRequestController.js";

import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { isAuthenticated, hasRole } from "../middlewares/authMiddleware.js";


const vacationRequestRouter = express.Router();
const checkAuth = [isAuthenticated];


vacationRequestRouter.get("/", checkAuth, getAllVacationRequests);
vacationRequestRouter.get("/:id", checkAuth, getVacationRequestById);
vacationRequestRouter.post("/", checkAuth, handleValidationErrors, createVacationRequest);
vacationRequestRouter.put("/:id", checkAuth, handleValidationErrors, updateVacationRequest);
vacationRequestRouter.delete("/:id",checkAuth,  deleteVacationRequest);

export default vacationRequestRouter;
