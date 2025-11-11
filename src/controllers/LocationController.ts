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
        { model: User, as: "users", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Holiday, as: "holidays", attributes: ["id", "holiday_name", "holiday_date"] },
      ],

      order: [["location_name", "ASC"]],
    });

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error inesperado al cargar las poblaciones." });
  }
};

// GET:id
export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id, {
      include: [
        { model: User, as: "users", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Holiday, as: "holidays", attributes: ["id", "holiday_name", "holiday_date"] },
      ],

    });

    if (!location) {
      return res.status(404).json({ message: "Población no encontrada." });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ message: "Error al obtener la información de la población." });
  }
};

// POST
export const createLocation = async (req: Request, res: Response) => {
  const { location_name } = req.body as LocationCreationAttributes;

  try {
    // ve si la ubicacion ya existe
    const existing = await Location.findOne({ where: { location_name } });
    if (existing) {
      return res.status(400).json({ message: "Esta población ya existe en el sistema." });
    }

    // post
    const newLocation = await Location.create({ location_name });
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ message: "Error inesperado al crear la población." });
  }
};

// PATCH:id
export const updateLocation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { location_name } = req.body as LocationCreationAttributes;

  try {
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ message: "Población no encontrada para actualizar." });
    }

    // busca duplicados
    if (location_name && location_name !== location.location_name) {
      const existing = await Location.findOne({ where: { location_name } });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Ya existe otra población con este nombre." });
      }
    }

    // actualiza el nombre
    await location.update({ location_name });

    // Fetch ubicacion actualizada con datos asociados
    const updated = await Location.findByPk(id, {
      include: [
        { model: User, as: 'users', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Holiday, as: 'holidays', attributes: ['id', 'holiday_name', 'holiday_date'] },
      ],
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Error inesperado al actualizar la población." });
  }
};

// DELETEid
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ message: "Población no encontrada para eliminar." });
    }

    // Delete
    await location.destroy();
    res.status(200).json({ message: "Población eliminada correctamente." });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ message: "Error inesperado al eliminar la población." });
  }
};
