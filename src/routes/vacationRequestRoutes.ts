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

const vacationRequestRouter = express.Router();

vacationRequestRouter.get("/", getAllVacationRequests);
vacationRequestRouter.get("/:id", getVacationRequestById);
vacationRequestRouter.post("/", createVacationRequestRules, handleValidationErrors, createVacationRequest);
vacationRequestRouter.put("/:id", updateVacationRequestRules, handleValidationErrors, updateVacationRequest);
vacationRequestRouter.delete("/:id", deleteVacationRequest);

export default vacationRequestRouter;
