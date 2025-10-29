import { body, param, validationResult } from "express-validator";

// Common validation result handler
export const handleValidation = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
};

/** POST /holidays */
export const createHolidayValidator = [
  body("holiday_name")
    .trim()
    .isString().withMessage("holiday_name must be a string")
    .notEmpty().withMessage("holiday_name is required")
    .isLength({ min: 2, max: 120 }).withMessage("holiday_name length must be 2-120"),

  body("holiday_date")
    .isISO8601({ strict: true }).withMessage("holiday_date must be a valid ISO-8601 date (YYYY-MM-DD)"),

  body("location_id")
    .isInt({ gt: 0 }).withMessage("location_id must be a positive integer"),

  handleValidation,
];

/** PATCH /holidays/:id */
export const updateHolidayValidator = [
  param("id")
    .isInt({ gt: 0 }).withMessage("id must be a positive integer"),

  body("holiday_name")
    .optional({ nullable: true })
    .trim()
    .isString().withMessage("holiday_name must be a string")
    .isLength({ min: 2, max: 120 }).withMessage("holiday_name length must be 2-120"),

  body("holiday_date")
    .optional({ nullable: true })
    .isISO8601({ strict: true }).withMessage("holiday_date must be a valid ISO-8601 date (YYYY-MM-DD)"),

  body("location_id")
    .optional({ nullable: true })
    .isInt({ gt: 0 }).withMessage("location_id must be a positive integer"),

  handleValidation,
];

/** GET/DELETE /holidays/:id */
export const idParamValidator = [
  param("id")
    .isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  handleValidation,
];
