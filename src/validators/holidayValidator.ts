import { body, param } from "express-validator";

/** POST /holidays */
export const createHolidayValidator = [
  body("holiday_name")
    .trim()
    .isString().withMessage("holiday_name debe ser string")
    .notEmpty().withMessage("holiday_name es obligatorio")
    .isLength({ min: 2, max: 120 }).withMessage("holiday_name longitud debe ser 2-120"),

  body("holiday_date")
    .isISO8601({ strict: true }).withMessage("holiday_date debe ser valid ISO-8601 date (YYYY-MM-DD)"),

  body("location_id")
    .isInt({ gt: 0 }).withMessage("location_id debe ser numero entero"),

];

/** PATCH /holidays/:id */
export const updateHolidayValidator = [
  param("id")
    .isInt({ gt: 0 }).withMessage("id debe ser numero entero"),

  body("holiday_name")
    .optional({ nullable: true })
    .trim()
    .isString().withMessage("holiday_name debe ser string")
    .isLength({ min: 2, max: 120 }).withMessage("holiday_name length debe ser 2-120"),

  body("holiday_date")
    .optional({ nullable: true })
    .isISO8601({ strict: true }).withMessage("holiday_date debe ser valid ISO-8601 date (YYYY-MM-DD)"),

  body("location_id")
    .optional({ nullable: true })
    .isInt({ gt: 0 }).withMessage("location_id debe ser numero entero"),

];

/** GET/DELETE /holidays/:id */
export const idParamValidator = [
  param("id")
    .isInt({ gt: 0 }).withMessage("id debe ser numero entero"),

];
