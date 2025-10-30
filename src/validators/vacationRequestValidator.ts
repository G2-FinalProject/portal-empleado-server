import { body, param } from "express-validator";
import { User } from "../models/userModel.js";

/**
 * ✅ Validadores para las solicitudes de vacaciones
 */

/* -------------------------------------------------------
   🟢 Crear nueva solicitud de vacaciones
------------------------------------------------------- */
export const createVacationRequestRules = [
  body("requester_id")
    .notEmpty().withMessage("El campo requester_id es obligatorio.")
    .isInt({ min: 1 }).withMessage("El requester_id debe ser un número entero positivo.")
    .custom(async (id) => {
      const user = await User.findByPk(id);
      if (!user) {
        return Promise.reject("El usuario solicitante no existe.");
      }
    }),

  body("start_date")
    .notEmpty().withMessage("La fecha de inicio es obligatoria.")
    .isISO8601().withMessage("La fecha de inicio debe tener formato YYYY-MM-DD."),

  body("end_date")
    .notEmpty().withMessage("La fecha de fin es obligatoria.")
    .isISO8601().withMessage("La fecha de fin debe tener formato YYYY-MM-DD."),

  body("requested_days")
    .notEmpty().withMessage("El número de días solicitados es obligatorio.")
    .isInt({ min: 1 }).withMessage("Los días solicitados deben ser un número entero positivo."),

  body("requester_comment")
    .optional()
    .isString().withMessage("El comentario debe ser texto.")
    .isLength({ max: 255 }).withMessage("El comentario no puede superar los 255 caracteres."),
];

/* -------------------------------------------------------
   🟠 Actualizar solicitud de vacaciones
------------------------------------------------------- */
export const updateVacationRequestRules = [
  param("id")
    .notEmpty().withMessage("El ID de la solicitud es obligatorio.")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número válido."),

  body("start_date")
    .optional()
    .isISO8601().withMessage("La fecha de inicio debe tener formato YYYY-MM-DD."),

  body("end_date")
    .optional()
    .isISO8601().withMessage("La fecha de fin debe tener formato YYYY-MM-DD."),

  body("requested_days")
    .optional()
    .isInt({ min: 1 }).withMessage("Los días solicitados deben ser un número entero positivo."),

  body("requester_comment")
    .optional()
    .isString().withMessage("El comentario debe ser texto.")
    .isLength({ max: 255 }).withMessage("El comentario no puede superar los 255 caracteres."),
];

/* -------------------------------------------------------
   🔴 Eliminar solicitud de vacaciones
------------------------------------------------------- */
export const deleteVacationRequestRules = [
  param("id")
    .notEmpty().withMessage("El ID de la solicitud es obligatorio.")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número válido."),
];

/* -------------------------------------------------------
   🧮 Obtener resumen de vacaciones (Issue #8)
------------------------------------------------------- */
export const getVacationSummaryRules = [
  param("id")
    .notEmpty().withMessage("El ID del usuario es obligatorio.")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número válido."),
];
