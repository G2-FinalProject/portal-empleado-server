import type { Request, Response } from "express";
import { Role } from "../models/roleModel.js";
import { User } from "../models/userModel.js";
import { validateRoleData, validateAssignData } from "../validators/roleValidation.js";

/**
 * 📜 Obtener todos los roles
 */
export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "role_name", "created_at"],
      order: [["id", "ASC"]],
    });

    if (roles.length === 0) {
      return res.status(404).json({ message: "No se encontraron roles registrados" });
    }

    return res.status(200).json(roles);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * 🛠️ Crear un nuevo rol
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { role_name } = req.body;
    const error = validateRoleData(role_name);
    if (error) return res.status(400).json({ error });

    const existingRole = await Role.findOne({ where: { role_name } });
    if (existingRole) {
      return res.status(409).json({ error: "El rol ya existe" });
    }

    const newRole = await Role.create({ role_name: role_name.trim() });
    return res.status(201).json({
      message: `🎉 Rol '${newRole.role_name}' creado exitosamente`,
      role: newRole,
    });
  } catch (error) {
    console.error("❌ Error al crear rol:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * ✏️ Actualizar un rol existente
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_name } = req.body;
    const error = validateRoleData(role_name);
    if (error) return res.status(400).json({ error });

    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ error: "Rol no encontrado" });

    await role.update({ role_name: role_name.trim() });
    return res.status(200).json({
      message: `✏️ Rol actualizado correctamente a '${role_name}'`,
      role,
    });
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * 🗑️ Eliminar un rol
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ error: "Rol no encontrado" });

    await role.destroy();
    return res.status(200).json({ message: "🗑️ Rol eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * 👤 Asignar rol a un usuario
 */
export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    const error = validateAssignData(userId, roleId);
    if (error) return res.status(400).json({ error });

    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (!role) return res.status(404).json({ error: "Rol no encontrado" });

    user.role_id = roleId;
    await user.save();

    return res.status(200).json({
      message: `✅ Rol '${role.role_name}' asignado correctamente al usuario '${user.first_name}'`,
    });
  } catch (error) {
    console.error("❌ Error al asignar rol:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
