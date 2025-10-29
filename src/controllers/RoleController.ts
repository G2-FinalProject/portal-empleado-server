import type { Request, Response } from "express";
import { Role } from "../models/roleModel.js";
import { User } from "../models/userModel.js";
import type { RoleCreationAttributes } from "../types/roleInterface.js";

/**
 * 🧩 Crear un nuevo rol
 */
export const createRole = async (req: Request, res: Response) => {
  const { role_name } = req.body as RoleCreationAttributes;

  try {
    const newRole = await Role.create({ role_name });

    res.status(201).json({
      message: `✅ Rol '${newRole.role_name}' creado correctamente.`,
      role: newRole
    });
  } catch (error) {
    console.error("Error al crear el rol:", error);
    res.status(500).json({ message: "❌ Error al crear el rol." });
  }
};


/**
 * 📋 Obtener todos los roles
 */
export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    res.status(500).json({ message: "Error al obtener los roles." });
  }
};

/**
 * 🔍 Obtener rol por ID
 */
export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id, {
      include: [{ model: User, attributes: ["id", "first_name", "last_name"] }],
    });

    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado." });
    }

    res.status(200).json(role);
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    res.status(500).json({ message: "Error al obtener el rol." });
  }
};

/**
 * ✏️ Actualizar rol
 */
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role_name } = req.body;

  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado." });
    }

    if (role_name !== undefined) {
      role.role_name = role_name;
    }

    await role.save();
    res.status(200).json(role);
  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    res.status(500).json({ message: "Error al actualizar el rol." });
  }
};

/**
 * 🗑️ Eliminar rol
 */
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado." });
    }

    // Verificar si hay usuarios asociados
    const userCount = await User.count({ where: { role_id: id } });
    if (userCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el rol porque hay ${userCount} usuario(s) asociado(s).`,
      });
    }

    await role.destroy();
    res.status(200).json({ message: "Rol eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar el rol:", error);
    res.status(500).json({ message: "Error al eliminar el rol." });
  }
};
/**
 * 👤 Asignar un rol a un usuario
 */
export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;

    // Validar datos recibidos
    if (!userId || !roleId) {
      return res.status(400).json({ error: "userId y roleId son requeridos." });
    }

    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    if (!role) return res.status(404).json({ error: "Rol no encontrado." });

    // ✅ Asignar el nuevo rol al usuario
    user.role_id = roleId;
    await user.save();

    return res.status(200).json({
      message: `Rol '${role.role_name}' asignado correctamente al usuario '${user.first_name} ${user.last_name}'.`,
      user: {
        id: user.id,
        nombre: `${user.first_name} ${user.last_name}`,
        nuevoRol: role.role_name,
      },
    });
  } catch (error) {
    console.error("Error al asignar el rol:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
