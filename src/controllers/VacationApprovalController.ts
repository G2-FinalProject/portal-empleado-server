import type { Request, Response } from "express";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import { Role } from "../models/roleModel.js";

/**
 * ✅ Aprobar o rechazar una solicitud de vacaciones (con comentario)
 */
export const decideVacationRequest = async (req: Request, res: Response) => {
  try {
    const { id, action } = req.params;
    const { approver_id, comments } = req.body; // 👈 usamos el mismo campo existente

    // 🔸 Buscar la solicitud
    const request = await VacationRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    // 🔸 Buscar al aprobador
    const approver = await User.findByPk(approver_id, { include: [Role] });
    if (!approver) {
      return res.status(404).json({ message: "Aprobador no encontrado." });
    }

    // 🔸 Verificar rol
    const roleName = approver.role?.role_name;
    if (roleName !== "Admin" && roleName !== "Manager") {
      return res.status(403).json({
        message: "Solo un ADMIN o MANAGER puede aprobar o rechazar solicitudes.",
      });
    }

    // 🔸 Si es MANAGER, verificar que pertenezca al mismo departamento
    const requester = await User.findByPk(request.requester_id);
    if (!requester) {
      return res.status(404).json({ message: "Usuario solicitante no encontrado." });
    }

    if (roleName === "Manager" && approver.department_id !== requester.department_id) {
      return res.status(403).json({
        message: "Un MANAGER solo puede aprobar solicitudes de su mismo departamento.",
      });
    }

    // 🔸 Verificar que la solicitud esté pendiente
    if (request.request_status !== "pending") {
      return res.status(400).json({
        message: `La solicitud ya fue ${request.request_status}.`,
      });
    }

    // 🔸 Actualizar estado y comentario
    if (action === "approve") {
      request.request_status = "approved";
    } else if (action === "reject") {
      request.request_status = "rejected";
    } else {
      return res.status(400).json({ message: "Acción inválida. Usa 'approve' o 'reject'." });
    }

    // ✨ Guardamos el comentario (usando el mismo campo comments)
    if (comments) request.comments = comments;

    await request.save();

    return res.status(200).json({
      message: `Solicitud ${request.request_status} correctamente ✅`,
      request,
    });
  } catch (error) {
    console.error("❌ Error al aprobar/rechazar solicitud:", error);
    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};
