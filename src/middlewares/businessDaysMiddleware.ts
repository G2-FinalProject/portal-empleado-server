import type { Request, Response, NextFunction } from "express";
import { parseISO, isValid, eachDayOfInterval, isWeekend } from "date-fns";
import { Op } from "sequelize";
import { User } from "../models/userModel.js";
import { Holiday } from "../models/holidayModel.js";

// normaliza a 'YYYY-MM-DD'
function toISODateOnly(d: Date | string) {
  if (typeof d === "string") return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}

/**
 * Aplica reglas de negocio para vacaciones:
 * - valida start_date/end_date (ISO y orden)
 * - rechaza si el rango incluye sábado/domingo o festivo de la location del usuario
 * - calcula requested_days y lo inyecta en req.body
 *
 * Uso:
 *  - POST /vacations: siempre exige start_date y end_date
 *  - PUT /vacations/:id: solo actúa si llegan ambas fechas; si llega una sola -> 400
 */
export async function enforceBusinessDays(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "No autenticado." });

    const user = await User.findByPk(userId);
    if (!user) return res.status(400).json({ message: "Usuario no encontrado." });

    const locationId = (user as any).location_id;
    if (!locationId) {
      return res.status(422).json({ message: "El usuario no tiene una ubicación asignada." });
    }

    const hasStart = typeof req.body.start_date === "string";
    const hasEnd = typeof req.body.end_date === "string";

    // PUT: si llega una sola fecha, es error (evitamos estados inconsistentes)
    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      return res.status(400).json({
        message: "Para cambiar fechas, start_date y end_date deben venir juntas.",
      });
    }

    // Si no llegan fechas en absoluto (PUT sin cambios de rango), ignoramos y seguimos
    if (!hasStart && !hasEnd) {
      if (typeof req.body.requested_days !== "undefined") delete req.body.requested_days;
      return next();
    }

    // Validaciones de formato y orden
    const startISO = toISODateOnly(req.body.start_date);
    const endISO = toISODateOnly(req.body.end_date);

    const start = parseISO(startISO);
    const end = parseISO(endISO);

    if (!isValid(start) || !isValid(end)) {
      return res.status(400).json({ message: "Fechas inválidas. Usa formato YYYY-MM-DD." });
    }
    if (end < start) {
      return res.status(400).json({ message: "end_date no puede ser anterior a start_date." });
    }

    // Obtener festivos del rango para la location
    const holidays = await Holiday.findAll({
      where: {
        location_id: locationId,
        holiday_date: { [Op.between]: [startISO, endISO] },
      },
      attributes: ["holiday_date"],
    });
    const holidaySet = new Set(
      holidays.map(h =>
        typeof h.holiday_date === "string"
          ? h.holiday_date
          : h.holiday_date.toISOString().slice(0, 10)
      )
    );

    // Analizar rango día a día
    const days = eachDayOfInterval({ start, end });
    let requestedDays = 0;
    const invalidDates: string[] = [];

    for (const d of days) {
      const iso = toISODateOnly(d);
      const weekend = isWeekend(d);
      const holiday = holidaySet.has(iso);

      if (weekend || holiday) {
        invalidDates.push(iso);
      } else {
        requestedDays++;
      }
    }

    // Reglas del issue: rechazar si incluye finde o festivo
    if (invalidDates.length > 0) {
      return res.status(400).json({
        message:
          "El rango incluye fines de semana o festivos según tu ubicación. Debe contener solo días laborables.",
        details: { nonWorkingDates: invalidDates },
      });
    }

    // Fuente de verdad: inyectar requested_days calculado
    req.body.requested_days = requestedDays;
    return next();
  } catch (error) {
    console.error("❌ Error validando días laborables:", error);
    return res.status(500).json({ message: "Error interno al validar el rango de vacaciones." });
  }
}
