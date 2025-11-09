import { body } from "express-validator";
import { User } from "../models/userModel.js";


export const createVacationRequestRules = [

  body("start_date")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria.")
    .isISO8601()
    .withMessage("Formato de fecha inválido (usa YYYY-MM-DD)."),

  body("end_date")
    .notEmpty()
    .withMessage("La fecha de fin es obligatoria.")
    .isISO8601()
    .withMessage("Formato de fecha inválido (usa YYYY-MM-DD).")
    .bail()
    .custom((end_date, { req }) => {
      const { start_date } = req.body;
      if (new Date(end_date) < new Date(start_date)) {
        throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
      }
      return true;
    }),

  // 🔸 requested_days (debe ser número y positivo)
  body("requested_days")
    .notEmpty()
    .withMessage("Debe indicar la cantidad de días solicitados.")
    .isInt({ min: 1 })
    .withMessage("Los días solicitados deben ser un número positivo.")
    .bail()
    .custom(async (requested_days, { req }) => {
      const user = await User.findByPk(req.body.requester_id);
      if (!user) return true;

      const available_days = user.available_days ?? 0;
      if (requested_days > available_days) {
        throw new Error(
          `No puedes solicitar ${requested_days} días. Solo tienes ${available_days} disponibles.`
        );
      }

      return true;
    }),

  // 🔸 requester_comment (opcional pero limitado)
  body("comments")
    .optional()
    .isString()
    .withMessage("El comentario debe ser texto.")
    .isLength({ max: 255 })
    .withMessage("El comentario no puede superar los 255 caracteres."),
];

/**
 * 📝 Validaciones para actualizar una solicitud
 */
export const updateVacationRequestRules = [
  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Formato de fecha inválido (usa YYYY-MM-DD)."),

  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("Formato de fecha inválido (usa YYYY-MM-DD).")
    .custom((end_date, { req }) => {
      if (req.body.start_date && new Date(end_date) < new Date(req.body.start_date)) {
        throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
      }
      return true;
    }),

  body("comments")
    .optional()
    .isString()
    .withMessage("El comentario debe ser texto.")
    .isLength({ max: 255 })
    .withMessage("El comentario no puede superar los 255 caracteres."),
];
