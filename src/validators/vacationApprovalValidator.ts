import { param, body } from "express-validator";

export const reviewVacationRequestRules = [
  param("id")
    .notEmpty().withMessage("El ID de la solicitud es obligatorio.")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero válido."),

  // Validamos el 'status' que viene en el BODY
  body("status")
    .notEmpty().withMessage("Debes especificar un estado.")
    .isIn(["APPROVED", "REJECTED"]) //  Acepta solo estos dos valores
    .withMessage("El estado debe ser 'APPROVED' o 'REJECTED'."),

  // El comentario es opcional
  body("comment")
    .optional()
    .isString().withMessage("El comentario debe ser texto.")
    .isLength({ max: 255 }).withMessage("El comentario no puede tener más de 255 caracteres."),
];