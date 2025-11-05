import express from "express";
import {
  createVacationRequest,
  getAllVacationRequests,
  getVacationRequestById,
  updateVacationRequest,
  deleteVacationRequest, getMyVacationRequests
} from "../controllers/VacationRequestController.js";
import {
  createVacationRequestRules,
  updateVacationRequestRules,
} from "../validators/vacationRequestValidator.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { isAuthenticated, hasRole } from "../middlewares/authMiddleware.js";
import { enforceBusinessDays } from "../middlewares/businessDaysMiddleware.js";

// para que el validator existente pueda usar requester_id del body sin romper seguridad
const attachRequesterId = (req: any, _res: any, next: any) => {
  if (req.user?.id) req.body.requester_id = req.user.id;
  next();
};

const vacationRequestRouter = express.Router();
const checkAuth = [isAuthenticated];

vacationRequestRouter.get("/my-requests", checkAuth, getMyVacationRequests);
vacationRequestRouter.get("/", checkAuth, getAllVacationRequests);
vacationRequestRouter.get("/:id", checkAuth, getVacationRequestById);

vacationRequestRouter.post("/", checkAuth, attachRequesterId, enforceBusinessDays,createVacationRequestRules, handleValidationErrors,  createVacationRequest);

vacationRequestRouter.patch("/:id", checkAuth, enforceBusinessDays,updateVacationRequestRules, handleValidationErrors,  updateVacationRequest);

vacationRequestRouter.delete("/:id", checkAuth, deleteVacationRequest);

export default vacationRequestRouter;
