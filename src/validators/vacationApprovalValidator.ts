import { param, body } from "express-validator";

/**
 * 🧰 Validadores para aprobar o rechazar solicitudes de vacaciones
 */
export const decideVacationRequestRules = [
  param("id")
    .notEmpty().withMessage("El ID de la solicitud es obligatorio.")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero válido."),

  param("action")
    .notEmpty().withMessage("Debes especificar una acción.")
    .isIn(["approve", "reject"])
    .withMessage("La acción debe ser 'approve' o 'reject'."),

  body("approver_id")
    .notEmpty().withMessage("El campo approver_id es obligatorio.")
    .isInt({ min: 1 }).withMessage("El approver_id debe ser un número entero válido."),

  // ✨ Campo opcional de comentarios (usamos el mismo existente)
  body("comments")
    .optional()
    .isString().withMessage("El comentario debe ser texto.")
    .isLength({ max: 255 }).withMessage("El comentario no puede tener más de 255 caracteres."),
];
