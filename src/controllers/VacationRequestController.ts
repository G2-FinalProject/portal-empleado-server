import type { Request, Response } from "express";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import type { VacationStatus } from "../types/vacationRequest.js";

/**
 * 🧩 Crear una nueva solicitud de vacaciones
 * Solo crea si el usuario tiene días disponibles suficientes.
 */
export const createVacationRequest = async (req: Request, res: Response) => {
  try {
    const requester_id = req.user!.id;
    const { start_date, end_date, comments } = req.body;

    // 🔹 Crear la solicitud si tiene saldo suficiente
    const newRequest = await VacationRequest.create({
      requester_id,
      start_date,
      end_date,
      requested_days: req.body.requested_days,
      requester_comment: comments || null,
      request_status: "pending" satisfies VacationStatus,
    });

    res.status(201).json({
      message: "🎉 Solicitud de vacaciones creada correctamente.",
      request: newRequest,
    });
  } catch (error: any) {
    console.error("❌ Error al crear solicitud:", error);
    res.status(500).json({ message: "Error al crear la solicitud de vacaciones." });
  }
};

/**
 * 📋 Obtener todas las solicitudes con info del usuario
 */
export const getAllVacationRequests = async (req: Request, res: Response) => {
  try {

    /*Importante para filtrar la visibilidad: 
   - Admin: No pone filtro → ve todo
   - Manager: Filtra por `department_id` → solo ve su departamento
   - Employee: Filtra por `requester_id` → solo ve sus propias solicitudes
    */
    const loggedInUserId = req.user!.id;
    const loggedInUserRole = req.user!.role;
    const loggedInUser = await User.findByPk(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    let whereClause = {};
    if (loggedInUserRole === 3) {
      whereClause = { requester_id: loggedInUserId };
    } 
    else if (loggedInUserRole === 2) {
      const usersInDepartment = await User.findAll({
        where: { department_id: loggedInUser.department_id },
        attributes: ['id']
      });
      
      const userIds = usersInDepartment.map(user => user.id);
      whereClause = { requester_id: userIds };
    }

    const requests = await VacationRequest.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "requester",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "available_days",
            "department_id",
            "location_id",
            "role_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(requests);
  } catch (error: any) {
    console.error("❌ Error al obtener solicitudes:", error.message || error);
    res.status(500).json({
      message: "Error al obtener las solicitudes.",
      error: error.message || error
    });
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
    const { start_date, end_date, request_status, comments } = req.body;

    const request = await VacationRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    const payload: Partial<VacationRequest> & {
      requester_comment?: string | null;
      request_status?: VacationStatus;
    } = {
      request_status,
      requester_comment: comments ?? request.requester_comment,
    };

    if (start_date && end_date) {
      payload.start_date = start_date;
      payload.end_date = end_date;
      payload.requested_days = req.body.requested_days; // <- recalculado por el middleware
    }
    else {
      // CHANGE (defensivo): si el cliente manda requested_days sin cambiar fechas, lo ignoramos
      if (typeof req.body.requested_days !== "undefined") {
        // no lo incluimos en payload => no se actualiza
      }
    }

    await request.update(payload as any);


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


// Obtener SOLO las solicitudes del usuario autenticado

export const getMyVacationRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // ← El ID viene del token JWT (middleware isAuthenticated)

    const requests = await VacationRequest.findAll({
      where: {
        requester_id: userId // ← FILTRAR solo por este usuario
      },
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(requests);
  } catch (error: any) {
    console.error("❌ Error al obtener mis solicitudes:", error);
    res.status(500).json({
      message: "Error al obtener tus solicitudes.",
      error: error.message || error
    });
  }
};