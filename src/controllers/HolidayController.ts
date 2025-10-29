import type { Request, Response } from "express";
import { Holiday } from "../models/holidayModel.js";
import { Location } from "../models/locationModel.js";


export const getAllHolidays = async (_req: Request, res: Response) => {
    try {
        const holidays = await Holiday.findAll({
            include: [{ model: Location, attributes: ["id", "location_name"] }],
            order: [["holiday_date", "ASC"]],
        });
        res.status(200).json(holidays);
    } catch (error) {
        console.error("Error fetching holidays:", error);
        res.status(500).json({ message: "Error fetching holidays." });
    }
};


export const getHolidayById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const holiday = await Holiday.findByPk(id, {
            include: [{ model: Location, attributes: ["id", "location_name"] }],
        });

        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found." });
        }

        res.status(200).json(holiday);
    } catch (error) {
        console.error("Error fetching holiday:", error);
        res.status(500).json({ message: "Error fetching holiday." });
    }
};


