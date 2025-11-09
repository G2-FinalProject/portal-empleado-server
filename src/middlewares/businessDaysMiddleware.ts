import type { Request, Response, NextFunction } from "express";
import { parseISO, isValid, eachDayOfInterval, isWeekend } from "date-fns";
import { Op } from "sequelize";
import { User } from "../models/userModel.js";
import { Holiday } from "../models/holidayModel.js";

// normalize to 'YYYY-MM-DD'
function toISODateOnly(d: Date | string) {
  if (typeof d === "string") return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}

/**
 * Business rules middleware for vacation requests:
 * - validates start_date/end_date (ISO format and order)
 * - counts ONLY business days (excludes weekends & holidays by user's location)
 * - injects requested_days into req.body
 *
 * POST /vacations: requires dates
 * PATCH /vacations/:id: if both dates provided → recalc; if only one → 400; if none → skip
 */
export async function enforceBusinessDays(req: Request, res: Response, next: NextFunction) {
  try {
    // nunca aceptar requested_days del cliente
    if ("requested_days" in req.body) delete (req.body as any).requested_days;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const user = await User.findByPk(userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    const locationId = (user as any).location_id;
    if (!locationId) {
      return res.status(422).json({ message: "User has no assigned location." });
    }

    const hasStart = typeof req.body.start_date === "string";
    const hasEnd = typeof req.body.end_date === "string";

    // PATCH: si llega solo una de las fechas → 400
    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      return res.status(400).json({
        message: "When updating, both start_date and end_date must be provided together.",
      });
    }

    // PATCH: si no llegan fechas → no recalcular, seguir
    if (!hasStart && !hasEnd) {
      if (typeof req.body.requested_days !== "undefined") delete req.body.requested_days;
      return next();
    }

    // Validar formato y orden
    const startISO = toISODateOnly(req.body.start_date);
    const endISO = toISODateOnly(req.body.end_date);

    const start = parseISO(startISO);
    const end = parseISO(endISO);

    if (!isValid(start) || !isValid(end)) {
      return res.status(400).json({ message: "Invalid dates. Use format YYYY-MM-DD." });
    }
    if (end < start) {
      return res.status(400).json({ message: "end_date cannot be earlier than start_date." });
    }

    // Feriados del rango para la ubicación del usuario
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

    // Contar solo business days (excluye finde y festivos)
    const days = eachDayOfInterval({ start, end });
    let requestedDays = 0;
    for (const d of days) {
      const iso = toISODateOnly(d);
      if (!isWeekend(d) && !holidaySet.has(iso)) {
        requestedDays++;
      }
    }

    // Si no hay días hábiles en el rango → 400
    if (requestedDays === 0) {
      return res.status(400).json({
        message: "Selected range contains no business days.",
      });
    }

    // Inyectar el conteo de business days
    (req.body as any).requested_days = requestedDays;

    return next();
  } catch (error) {
    console.error("❌ Error validating business days:", error);
    return res.status(500).json({ message: "Internal error while validating vacation range." });
  }
}
