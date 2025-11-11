import type { Request, Response } from "express";
import { Holiday } from "../models/holidayModel.js";
import { Location } from "../models/locationModel.js";


export const getAllHolidays = async (_req: Request, res: Response) => {
    try {
        const holidays = await Holiday.findAll({
            include: [{ model: Location, as: "location", attributes: ["id", "location_name"] }]
,
            order: [["holiday_date", "ASC"]],
        });
        res.status(200).json(holidays);
    } catch (error) {
        console.error("Error fetching holidays:", error);
        res.status(500).json({ message: "Error al cargar los festivos." });
    }
};


export const getHolidayById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

       const holiday = await Holiday.findByPk(id, {
  include: [{ model: Location, as: "location", attributes: ["id", "location_name"] }],
});

        if (!holiday) {
            return res.status(404).json({ message: "Festivo no encontrado." });
        }

        res.status(200).json(holiday);
    } catch (error) {
        console.error("Error fetching holiday:", error);
        res.status(500).json({ message: "Error al obtener la información del festivo." });
    }
};

export const createHoliday = async (req: Request, res: Response) => {
    try {
        const { holiday_name, holiday_date, location_id } = req.body as {
            holiday_name: string;
            holiday_date: Date; // ISO date string (YYYY-MM-DD)
            location_id: number;
        };

        const location = await Location.findByPk(location_id);
        if (!location) {
            return res.status(400).json({ message: "La población especificada no existe" });
        }

        // locatio_id y holiday deben ser unicos
        const duplicated = await Holiday.findOne({
            where: { location_id, holiday_date },
        });
        if (duplicated) {
            return res
                .status(400)
                .json({ message: "Ya existe un festivo registrado para esa fecha en esta población." });
        }

        const newHoliday = await Holiday.create({ holiday_name, holiday_date, location_id });

        const created = await Holiday.findByPk(newHoliday.id, {
            include: [{ model: Location, as: "location", attributes: ["id", "location_name"] }]
,
        });

        res.status(201).json(created);
    } catch (error) {
        console.error("Error creating holiday:", error);
        res.status(500).json({ message: "Error inesperado al crear el festivo." });
    }
};

export const updateHoliday = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { holiday_name, holiday_date, location_id } = req.body as {
            holiday_name?: string;
            holiday_date?: string;
            location_id?: number;
        };

        const holiday = await Holiday.findByPk(id);
        if (!holiday) {
            return res.status(404).json({ message: "Festivo no encontrado para actualizar." });
        }

        if (typeof location_id === "number") {
            const loc = await Location.findByPk(location_id);
            if (!loc) {
                return res.status(400).json({ message: "La población seleccionada no existe." });
            }
        }

        // Determina valores objetivo para unicidad
        const targetLocationId = typeof location_id === "number" ? location_id : holiday.location_id;
        const targetDate = typeof holiday_date === "string" ? holiday_date : holiday.holiday_date;

        if (
            (typeof location_id === "number" && location_id !== holiday.location_id) ||
            (typeof holiday_date === "string" && holiday_date !== holiday.holiday_date.toISOString())
        ) {
            const existsSame = await Holiday.findOne({
                where: { location_id: targetLocationId, holiday_date: targetDate },
            });
            if (existsSame && existsSame.id !== holiday.id) {
                return res
                    .status(400)
                    .json({ message: "Ya existe otro festivo para esa fecha en la ubicación seleccionada." });
            }
        }

        const updateData: {
            holiday_name?: string;
            holiday_date?: Date;     // <- Date, no string
            location_id?: number;
        } = {};

        if (typeof holiday_name === "string") {
            updateData.holiday_name = holiday_name;
        }

        if (typeof holiday_date === "string") {
            const d = new Date(holiday_date);
            if (Number.isNaN(d.getTime())) {
                return res.status(422).json({ message: "El campo holiday_date debe ser una fecha válida." });
            }
            updateData.holiday_date = d; // <- Date para Sequelize (DATEONLY)
        }

        if (typeof location_id === "number") {
            updateData.location_id = location_id;
        }

        await holiday.update(updateData);

        const updated = await Holiday.findByPk(id, {
            include: [{ model: Location, as: "location", attributes: ["id", "location_name"] }]
,
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating holiday:", error);
        return res.status(500).json({ message: "Error inesperado al actualizar el festivo." });
    }
};

export const deleteHoliday = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const holiday = await Holiday.findByPk(id);
        if (!holiday) {
            return res.status(404).json({ message: "Festivo no encontrado para eliminar." });
        }

        await holiday.destroy();
        res.status(200).json({ message: "Festivo eliminado correctamente." });
    } catch (error) {
        console.error("Error deleting holiday:", error);
        res.status(500).json({ message: "Error inesperado al eliminar el festivo." });
    }
};


