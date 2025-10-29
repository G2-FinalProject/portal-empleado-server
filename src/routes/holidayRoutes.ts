import { Router } from "express";
import {
  getAllHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/HolidayController.js";
import {
  createHolidayValidator,
  updateHolidayValidator,
  idParamValidator,
} from "../validators/holidayValidator.js";

const HolidayRouter = Router();

HolidayRouter.get("/", getAllHolidays);
HolidayRouter.get("/:id", idParamValidator, getHolidayById);
HolidayRouter.post("/", createHolidayValidator, createHoliday);
HolidayRouter.patch("/:id", updateHolidayValidator, updateHoliday);
HolidayRouter.delete("/:id", idParamValidator, deleteHoliday);

export default HolidayRouter;
