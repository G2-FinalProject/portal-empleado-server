import { Router } from "express";
import { getAllHolidays, getHolidayById, createHoliday, updateHoliday, deleteHoliday, } from "../controllers/HolidayController.js";
import { createHolidayValidator, updateHolidayValidator, idParamValidator, } from "../validators/holidayValidator.js";
import { checkAdmin, checkAuth } from '../utils/authChecks.js';
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";


const HolidayRouter = Router();

HolidayRouter.get("/", checkAuth, getAllHolidays);
HolidayRouter.get("/:id", checkAuth, idParamValidator, getHolidayById);

HolidayRouter.post("/", checkAdmin, createHolidayValidator, handleValidationErrors, createHoliday);

HolidayRouter.patch("/:id", checkAdmin, updateHolidayValidator, handleValidationErrors, updateHoliday);

HolidayRouter.delete("/:id", checkAdmin, idParamValidator, handleValidationErrors, deleteHoliday);

export default HolidayRouter;
