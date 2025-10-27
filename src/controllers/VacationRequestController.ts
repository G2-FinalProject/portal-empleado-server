import type { Request, Response } from "express";
import { Op } from "sequelize";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import type { VacationStatus } from "../types/vacationRequest.js";

/**
 * 🧩 Crear una nueva solicitud de vacaciones
 */
export const createVacationRequest = async (req: Request, res: Response) => {
  try {
    const { requester_id, start_date, end_date, requested_days, comments } = req.body;

    // Validaciones básicas
    if (!requester_id || !start_date || !end_date || !requested_days) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // ✅ Verificar si el usuario existe
    const user = await User.findByPk(requester_id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // ✅ Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: "La fecha de fin debe ser posterior a la de inicio" });
    }

    // ✅ Verificar solapamiento de fechas
    const overlapping = await VacationRequest.findOne({
      where: {
        requester_id,
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
        ],
      },
    });

    if (overlapping) {
      return res.status(409).json({
        error: "Ya existe una solicitud en ese rango de fechas",
      });
    }

    // ✅ Crear la solicitud con estado "pending" por defecto
    const newRequest = await VacationRequest.create({
      requester_id,
      start_date,
      end_date,
      requested_days,
      comments: comments || null,
      request_status: "pending" satisfies VacationStatus,
    });

    return res.status(201).json({
      message: "Solicitud creada correctamente ✅",
      request: newRequest,
    });
  } catch (error: any) {
    console.error("❌ Error al crear solicitud:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
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

    return res.status(200).json(requests);
  } catch (error: any) {
    console.error("❌ Error al obtener solicitudes:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * 🔍 Obtener solicitud por ID
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

    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

    return res.status(200).json(request);
  } catch (error: any) {
    console.error("❌ Error al buscar solicitud:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * 📝 Actualizar solicitud existente
 */
export const updateVacationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, requested_days, request_status, comments } = req.body;

    const request = await VacationRequest.findByPk(id);
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

    // ⚙️ Actualizamos los campos enviados (manteniendo los antiguos si no vienen)
    await request.update({
      start_date: start_date || request.start_date,
      end_date: end_date || request.end_date,
      requested_days: requested_days || request.requested_days,
      request_status: (request_status as VacationStatus) || request.request_status,
      comments: comments ?? request.comments,
    });

    return res.status(200).json({
      message: "Solicitud actualizada correctamente ✏️",
      request,
    });
  } catch (error: any) {
    console.error("❌ Error al actualizar solicitud:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * ❌ Eliminar solicitud
 */
export const deleteVacationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await VacationRequest.findByPk(id);
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

    await request.destroy();

    return res.status(200).json({ message: "Solicitud eliminada correctamente 🗑️" });
  } catch (error: any) {
    console.error("❌ Error al eliminar solicitud:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
