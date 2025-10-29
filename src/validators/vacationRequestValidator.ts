import { body } from "express-validator";
import { Op } from "sequelize";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import { Holiday } from "../models/holidayModel.js";

/**
 * 🔧 Utilidad: Generar un array con todas las fechas entre dos días
 */
function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * 📥 Reglas avanzadas para crear una solicitud de vacaciones
 */
export const createVacationRules = [
  // 🧍‍♀️ Validar ID del usuario
  body("requester_id")
    .notEmpty().withMessage("El ID del solicitante es obligatorio.")
    .isInt({ min: 1 }).withMessage("El ID del solicitante debe ser un número positivo.")
    .bail()
    .custom(async (id) => {
      const user = await User.findByPk(id);
      if (!user) {
        return Promise.reject("El usuario solicitante no existe.");
      }
    }),

  // 🗓️ Validar fechas
  body("start_date")
    .notEmpty().withMessage("La fecha de inicio es obligatoria.")
    .isISO8601().withMessage("Formato de fecha inválido (usa YYYY-MM-DD)."),

  body("end_date")
    .notEmpty().withMessage("La fecha de fin es obligatoria.")
    .isISO8601().withMessage("Formato de fecha inválido (usa YYYY-MM-DD).")
    .bail()
    .custom((end_date, { req }) => {
      const start_date = req.body.start_date;
      if (new Date(end_date) < new Date(start_date)) {
        throw new Error("La fecha de fin no puede ser anterior a la de inicio.");
      }
      return true;
    }),

  // 📅 Validar cantidad de días solicitados
  body("requested_days")
    .notEmpty().withMessage("Debe indicar la cantidad de días solicitados.")
    .isInt({ min: 1 }).withMessage("Los días solicitados deben ser un número positivo.")
    .bail()
    .custom(async (requested_days, { req }) => {
  const user = await User.findByPk(req.body.requester_id);
  if (!user) return true;

  const requested = Number(requested_days);
  const available = Number(user.available_days);

  if (!isNaN(requested) && requested > available) {
    throw new Error(`No puede solicitar más de ${available} día(s) disponibles.`);
  }
  return true;
}),

  // 🔁 Validar que no haya solapamiento con otras solicitudes
  body("end_date").custom(async (end_date, { req }) => {
    const { requester_id, start_date } = req.body;
    if (!requester_id || !start_date) return true;

    const overlap = await VacationRequest.findOne({
      where: {
        requester_id,
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
        ],
      },
    });

    if (overlap) {
      return Promise.reject("Ya existe una solicitud en ese rango de fechas.");
    }

    return true;
  }),

  // 🚫 Validar que el rango no incluya fines de semana ni feriados
  body("end_date").custom(async (end_date, { req }) => {
    const { requester_id, start_date } = req.body;
    if (!requester_id || !start_date) return true;

    const user = await User.findByPk(requester_id);
    if (!user) return true;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const allDates = getDateRange(start, end);

    // 📆 Bloquear fines de semana
    const weekend = allDates.find(
      (d) => d.getDay() === 0 || d.getDay() === 6 // 0 = domingo, 6 = sábado
    );
    if (weekend) {
      throw new Error("El rango de fechas incluye fines de semana, los cuales no son válidos.");
    }

    // 🎉 Bloquear feriados según la ubicación del usuario
    const holidays = await Holiday.findAll({
      where: {
        location_id: user.location_id, // 🔥 Solo feriados de la misma ubicación
        holiday_date: { [Op.between]: [start, end] },
      },
    });

    if (holidays.length > 0) {
      const names = holidays.map((h) => h.holiday_name).join(", ");
      throw new Error(`El rango de fechas incluye días feriados: ${names}.`);
    }

    return true;
  }),
];
