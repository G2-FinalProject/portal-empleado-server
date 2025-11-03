import type { Request, Response } from "express";
import { VacationRequest } from "../models/vacationRequestModel.js";
import { User } from "../models/userModel.js";
import { Role } from "../models/roleModel.js";
import { sequelize } from "../database/db_connection.js";


export const decideVacationRequest = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
   const { id } = req.params;
   const { status, comment } = req.body; // status: "APPROVED" o "REJECTED"
   const loggedInUserId = req.user!.id; // Obtenido del token (¡Seguro!)

    // Buscar la solicitud
    const request = await VacationRequest.findByPk(id, { transaction: t });
    if (!request) {
      await t.rollback();
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    //  VALIDAR ESTADO PENDIENTE
    if (request.request_status !== "pending") {
      await t.rollback();
      return res.status(409).json({ // 409 Conflict
        message: `La solicitud ya fue ${request.request_status}. No se puede modificar.`,
      });
    }
     // 4. AUTORIZACIÓN (Usando el ID seguro del token)
    const approver = await User.findByPk(loggedInUserId, { include: [Role] });
    if (!approver) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario aprobador no encontrado." });
    }


    const roleName = approver.role?.role_name;

    if (roleName === "Manager") {
      const requester = await User.findByPk(request.requester_id, { transaction: t });
      if (!requester || (requester.department_id !== approver.department_id)) {
        await t.rollback();
        return res.status(403).json({
          message: "Un MANAGER solo puede aprobar solicitudes de su mismo departamento.",
        });
      }
    }

   //  Actualizar la solicitud
    request.request_status = status;
    request.approver_comment = comment || null; 

   if (status === "APPROVED") {
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

      // La resta
      requester.available_days = available - requested;
      await requester.save({ transaction: t });
    }

    // 5c. Guardar la solicitud
    await request.save({ transaction: t });

    // 6. ÉXITO (Confirmar la transacción)
    await t.commit();

    return res.status(200).json({
      message: `Solicitud ${status.toLowerCase()} correctamente.`,
      request,
    });

  } catch (error) {
    // 7. ERROR (Deshacer todo)
    await t.rollback();
    console.error("❌ Error al revisar solicitud:", error);
    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};
