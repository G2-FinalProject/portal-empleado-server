import { body, param } from "express-validator";

/**
 * 📋 Reglas de validación para aprobar o rechazar solicitudes
 */
export const approveVacationRules = [
  // Validar el parámetro ID de la solicitud
  param("id")
    .notEmpty()
    .withMessage("El ID de la solicitud es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo."),

  // Validar el parámetro action ('approve' o 'reject')
  param("action")
    .notEmpty()
    .withMessage("La acción es obligatoria ('approve' o 'reject').")
    .isIn(["approve", "reject"])
    .withMessage("La acción solo puede ser 'approve' o 'reject'."),

  // Validar el campo approver_id mientras no exista autenticación por token
  body("approver_id")
    .notEmpty()
    .withMessage("El ID del aprobador es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El ID del aprobador debe ser un número positivo."),
];
