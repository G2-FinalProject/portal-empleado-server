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
 * - rejects if the range includes a weekend or a holiday based on the user's location
 * - calculates requested_days and injects it into req.body
 *
 * Usage:
 *  - POST /vacations: always requires start_date and end_date
 *  - PUT /vacations/:id: only acts if both dates are provided; if only one is sent -> 400
 */
export async function enforceBusinessDays(req: Request, res: Response, next: NextFunction) {
  try {
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

    // PUT: if only one date arrives, reject (avoid inconsistent states)
    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      return res.status(400).json({
        message: "When updating, both start_date and end_date must be provided together.",
      });
    }

    // If no dates are sent at all (PUT without date changes), skip validation
    if (!hasStart && !hasEnd) {
      if (typeof req.body.requested_days !== "undefined") delete req.body.requested_days;
      return next();
    }

    // Validate format and date order
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

    // Fetch holidays within the range for the user's location
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

    // Analyze the range day by day
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

    // Reject if any weekend or holiday is included
    if (invalidDates.length > 0) {
      return res.status(400).json({
        message:
          "The range includes weekends or holidays based on your location. It must contain only business days.",
        details: { nonWorkingDates: invalidDates },
      });
    }

    // Source of truth: inject calculated requested_days
    req.body.requested_days = requestedDays;
    return next();
  } catch (error) {
    console.error("❌ Error validating business days:", error);
    return res.status(500).json({ message: "Internal error while validating vacation range." });
  }
}
