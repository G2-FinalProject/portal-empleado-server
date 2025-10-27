import type { Request, Response, NextFunction } from "express";

/**
 * 📥 Validar body al crear una solicitud
 */
export const validateVacationBody = (req: Request, res: Response, next: NextFunction) => {
  const { requester_id, start_date, end_date, requested_days } = req.body;
  const errors: { field: string; message: string }[] = [];

  // Campos obligatorios
  if (!requester_id) errors.push({ field: "requester_id", message: "El ID del solicitante es obligatorio" });
  if (!start_date) errors.push({ field: "start_date", message: "La fecha de inicio es obligatoria" });
  if (!end_date) errors.push({ field: "end_date", message: "La fecha de fin es obligatoria" });
  if (!requested_days) errors.push({ field: "requested_days", message: "Debe indicar la cantidad de días solicitados" });

  // Tipos de datos
  if (requester_id && (typeof requester_id !== "number" || requester_id <= 0)) {
    errors.push({ field: "requester_id", message: "Debe ser un número válido mayor que 0" });
  }

  if (start_date && isNaN(Date.parse(start_date))) {
    errors.push({ field: "start_date", message: "Formato de fecha inválido (usa YYYY-MM-DD)" });
  }

  if (end_date && isNaN(Date.parse(end_date))) {
    errors.push({ field: "end_date", message: "Formato de fecha inválido (usa YYYY-MM-DD)" });
  }

  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    errors.push({ field: "end_date", message: "La fecha de fin no puede ser anterior a la de inicio" });
  }

  if (requested_days && (typeof requested_days !== "number" || requested_days <= 0)) {
    errors.push({ field: "requested_days", message: "Los días solicitados deben ser un número positivo" });
  }

  // Si hay errores → devolver todos juntos
  if (errors.length > 0) return res.status(400).json({ errors });

  next();
};

/**
 * 🔍 Validar ID de la solicitud
 */
export const validateVacationId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (isNaN(numericId) || numericId <= 0) {
    return res.status(400).json({
      errors: [{ field: "id", message: "El ID debe ser un número válido mayor que 0" }],
    });
  }

  next();
};

/**
 * ✏️ Validar body al actualizar una solicitud
 */
export const validateUpdateBody = (req: Request, res: Response, next: NextFunction) => {
  const { start_date, end_date, requested_days, request_status } = req.body;
  const errors: { field: string; message: string }[] = [];

  // Verificar que haya al menos un campo
  if (!start_date && !end_date && !requested_days && !request_status) {
    return res.status(400).json({
      errors: [{ field: "body", message: "Debe enviar al menos un campo para actualizar" }],
    });
  }

  if (start_date && isNaN(Date.parse(start_date))) {
    errors.push({ field: "start_date", message: "Formato de fecha inválido (usa YYYY-MM-DD)" });
  }

  if (end_date && isNaN(Date.parse(end_date))) {
    errors.push({ field: "end_date", message: "Formato de fecha inválido (usa YYYY-MM-DD)" });
  }

  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    errors.push({ field: "end_date", message: "La fecha de fin no puede ser anterior a la de inicio" });
  }

  if (requested_days && (typeof requested_days !== "number" || requested_days <= 0)) {
    errors.push({ field: "requested_days", message: "Los días solicitados deben ser un número positivo" });
  }

  if (errors.length > 0) return res.status(400).json({ errors });

  next();
};
