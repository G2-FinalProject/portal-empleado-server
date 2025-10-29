import express from "express";
import {
  createVacationRequest,
  getAllVacationRequests,
  getVacationRequestById,
  updateVacationRequest,
  deleteVacationRequest,
} from "../controllers/VacationRequestController.js";

const vacationRequestRouter = express.Router();

// 🌴 Rutas para solicitudes de vacaciones
vacationRequestRouter.get("/", getAllVacationRequests);
vacationRequestRouter.get("/:id", getVacationRequestById);
vacationRequestRouter.post("/", createVacationRequest);
vacationRequestRouter.put("/:id", updateVacationRequest);
vacationRequestRouter.delete("/:id", deleteVacationRequest);

export default vacationRequestRouter;
