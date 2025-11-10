import type { Request, Response } from "express";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import { Role } from "../models/roleModel.js";
import { sequelize } from "../database/db_connection.js";


export const decideVacationRequest = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
   const { id } = req.params;
   const { status, comment } = req.body; // status: "approved" o "rejected"
   const loggedInUserId = req.user!.id; 
    const loggedInUserRole = req.user!.role;

    const request = await VacationRequest.findByPk(id, { transaction: t });
    if (!request) {
      await t.rollback();
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    if (request.request_status !== "pending") {
      await t.rollback();
      return res.status(409).json({ 
        message: `La solicitud ya fue ${request.request_status}. No se puede modificar.`,
      });
    }
  // AUTORIZACIÓN POR ROL
    if (loggedInUserRole === 2) {

      const manager = await User.findByPk(loggedInUserId, { transaction: t });
      if (!manager) {
        await t.rollback();
        return res.status(404).json({ message: "Usuario aprobador no encontrado." });
      }

      const requester = await User.findByPk(request.requester_id, { transaction: t });
      if (!requester) {
        await t.rollback();
        return res.status(404).json({ message: "Solicitante no encontrado." });
      }

      /* ⚠️⚠️ VALIDACIÓN CRÍTICA: Comparar departamentos
      para asegurar que el manager solo pueda aprobar request de su propio departamento*/
      
      if (requester.department_id !== manager.department_id) {
        await t.rollback();
        return res.status(403).json({
          message: "No tienes permisos para aprobar/rechazar solicitudes de otros departamentos.",
        });
      }
    }

    request.request_status = status;
    request.approver_comment = comment || null; 

   if (status === "approved") {
      const requester = await User.findByPk(request.requester_id, { transaction: t });
      if (!requester) {
         await t.rollback();
         return res.status(404).json({ message: "No se encontró al solicitante." });
      }

      const available = requester.available_days; //
      const requested = request.requested_days;

      if (available < requested) {
        await t.rollback();
        return res.status(400).json({
          message: `El usuario no tiene ${requested} días. (Disponibles: ${available})`,
        });
      }

      requester.available_days = available - requested;
      await requester.save({ transaction: t });
    }

    await request.save({ transaction: t });
    await t.commit();

    return res.status(200).json({
      message: `Solicitud ${status.toLowerCase()} correctamente.`,
      request,
    });

  } catch (error) {
    await t.rollback();
    console.error("❌ Error al revisar solicitud:", error);
    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};