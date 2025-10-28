import type { Request, Response } from "express";
import { Location } from "../models/locationModel.js";
import { User } from "../models/userModel.js";
import { Holiday } from "../models/holidayModel.js";
import type { LocationCreationAttributes } from "../types/locationInterface.js";

// GET
export const getAllLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await Location.findAll({
      // incluye usuarios y festivos asociados 
      include: [
        { model: User, attributes: ["id", "first_name", "last_name", "email"] },
        { model: Holiday, attributes: ["id", "holiday_name", "holiday_date"] },
      ],
      order: [["location_name", "ASC"]],
    });

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error fetching locations." });
  }
};

// GET:id 
export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id, {      
      include: [
        { model: User, attributes: ["id", "first_name", "last_name", "email"] },
        { model: Holiday, attributes: ["id", "holiday_name", "holiday_date"] },
      ],
    });

    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ message: "Error fetching location." });
  }
};

