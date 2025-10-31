import type { Request, Response } from "express";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import type { VacationStatus } from "../types/vacationRequest.js";

/**
 * 🧩 Crear una nueva solicitud de vacaciones (con control de saldo)
 */
export const createVacationRequest = async (req: Request, res: Response) => {
  try {
    const requester_id = req.user!.id;
    const { start_date, end_date, requested_days, requester_comment } = req.body;

    // Validar campos obligatorios
    if (!requester_id || !start_date || !end_date || !requested_days) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    // 1️⃣ Buscar usuario
    const user = await User.findByPk(requester_id, { include: [VacationRequest] });
    if (!user) {
      return res.status(404).json({ message: "Usuario solicitante no encontrado." });
    }

    // 2️⃣ Calcular días usados (solo solicitudes aprobadas)
    const approvedRequests = user.vacation_requests.filter(
      (req) => req.request_status === "approved"
    );
    const used_days = approvedRequests.reduce(
      (total, req) => total + req.requested_days,
      0
    );

    const allowance_days = user.available_days ?? 23;
    const remaining_days = Math.max(allowance_days - used_days, 0);

    // 3️⃣ Validar saldo disponible
    if (remaining_days === 0) {
      return res.status(400).json({
        message: "No tienes días de vacaciones disponibles.",
      });
    }

    if (requested_days > remaining_days) {
      return res.status(400).json({
        message: `No puedes solicitar ${requested_days} días. Solo tienes ${remaining_days} días disponibles.`,
      });
    }

    // 4️⃣ Crear solicitud
    const newRequest = await VacationRequest.create({
      requester_id,
      start_date,
      end_date,
      requested_days,
      requester_comment: requester_comment || null,
      request_status: "pending" satisfies VacationStatus,
    });

    return res.status(201).json({
      message: "Solicitud de vacaciones creada correctamente.",
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ Error al crear solicitud:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * 📋 Obtener todas las solicitudes de vacaciones
 */
export const getAllVacationRequests = async (_req: Request, res: Response) => {
  try {
    const requests = await VacationRequest.findAll({ include: [User] });
    return res.status(200).json({
      message: "Solicitudes obtenidas correctamente.",
      total: requests.length,
      requests,
    });
  } catch (error) {
    console.error("❌ Error al obtener solicitudes:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * 🔍 Obtener una solicitud por ID
 */
export const getVacationRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await VacationRequest.findByPk(id, { include: [User] });

    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    return res.status(200).json({
      message: "Solicitud encontrada.",
      request,
    });
  } catch (error) {
    console.error("❌ Error al obtener solicitud:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * ✏️ Actualizar una solicitud (solo si está pendiente)
 */
export const updateVacationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, requested_days, requester_comment } = req.body;

    const request = await VacationRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    // Solo se puede actualizar si sigue pendiente
    if (request.request_status !== "pending") {
      return res.status(400).json({
        message: "Solo se pueden actualizar solicitudes pendientes.",
      });
    }

    // Actualizar valores
    request.start_date = start_date || request.start_date;
    request.end_date = end_date || request.end_date;
    request.requested_days = requested_days || request.requested_days;
    request.requester_comment = requester_comment || request.requester_comment;

    await request.save();

    return res.status(200).json({
      message: "Solicitud actualizada correctamente.",
      request,
    });
  } catch (error) {
    console.error("❌ Error al actualizar solicitud:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
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
    return res.status(200).json({ message: "Solicitud eliminada exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar solicitud:", error);
    return res.status(500).json({ message: "Error al eliminar la solicitud." });
  }
};

/**
 * 📊 Obtener resumen de vacaciones de un usuario
 * Cumple con la issue #8
 * Endpoint: GET /users/:id/vacations/summary
 */
export const getVacationSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authUser = req.user;

    // 1️⃣ Autorización
    if (
      !authUser ||
      (authUser.role !== 1 && authUser.role !== 2 && authUser.id !== Number(id))
    ) {
      return res.status(403).json({
        message: "No tienes permisos para ver este resumen.",
      });
    }

    // 2️⃣ Buscar usuario y sus solicitudes
    const user = await User.findByPk(id, { include: [VacationRequest] });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // 3️⃣ Calcular días usados y disponibles
    const allowance_days = user.available_days ?? 23;

    const approvedRequests = user.vacation_requests.filter(
      (req) => req.request_status === "approved"
    );
    const used_days = approvedRequests.reduce(
      (sum, req) => sum + req.requested_days,
      0
    );

    const remaining_days =
      user.available_days ?? Math.max(allowance_days - used_days, 0);

    // 4️⃣ Respuesta final
    return res.status(200).json({
      user_id: user.id,
      full_name: `${user.first_name} ${user.last_name}`,
      allowance_days,
      used_days,
      remaining_days,
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen de vacaciones:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
