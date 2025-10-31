import type { Request, Response } from "express";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import type { VacationStatus } from "../types/vacationRequest.js";

/**
 * 🧩 Crear una nueva solicitud de vacaciones
 * Las validaciones de campos y fechas se manejan en los validadores.
 */
export const createVacationRequest = async (req: Request, res: Response) => {
  try {
    const requester_id = req.user!.id;
    const {start_date, end_date, requested_days, comments } = req.body;

    const newRequest = await VacationRequest.create({
      requester_id,
      start_date,
      end_date,
      requested_days,
      requester_comment: comments || null, 
      request_status: "pending" satisfies VacationStatus,
    });

    res.status(201).json(newRequest);
  } catch (error: any) {
    console.error("❌ Error al crear solicitud:", error);
    res.status(500).json({ message: "Error al crear la solicitud de vacaciones." });
  }
};

/**
 * 📋 Obtener todas las solicitudes con info del usuario
 */
export const getAllVacationRequests = async (_req: Request, res: Response) => {
  try {
    const requests = await VacationRequest.findAll({
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "first_name", "last_name", "email", "region", "city"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(requests);
  } catch (error: any) {
    console.error("❌ Error al obtener solicitudes:", error);
    res.status(500).json({ message: "Error al obtener las solicitudes." });
  }
};

/**
 * 🔍 Obtener una solicitud por ID
 */
export const getVacationRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await VacationRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    res.status(200).json(request);
  } catch (error: any) {
    console.error("❌ Error al obtener solicitud:", error);
    res.status(500).json({ message: "Error al obtener la solicitud." });
  }
};

/**
 * 📝 Actualizar una solicitud existente
 */
export const updateVacationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, requested_days, request_status, comments } = req.body;

    const request = await VacationRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    await request.update({
      start_date,
      end_date,
      requested_days,
      request_status,
     requester_comment: comments,
    });

    res.status(200).json(request);
  } catch (error: any) {
    console.error("❌ Error al actualizar solicitud:", error);
    res.status(500).json({ message: "Error al actualizar la solicitud." });
  }
};

/**
 * 🗑️ Eliminar una solicitud
 */
export const deleteVacationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await VacationRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    await request.destroy();
    res.status(200).json({ message: "Solicitud eliminada exitosamente." });
  } catch (error: any) {
    console.error("❌ Error al eliminar solicitud:", error);
    res.status(500).json({ message: "Error al eliminar la solicitud." });
  }
};
