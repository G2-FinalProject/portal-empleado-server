import { body } from "express-validator";
import { Role } from "../models/roleModel.js";
import { User } from "../models/userModel.js";
import type { RoleCreationAttributes } from "../types/roleInterface.js"; // ✅ sin .js

/**
 * 🛠️ Reglas para crear un rol
 */
export const createRoleRules = [
  body("role_name")
    .notEmpty().withMessage("El nombre del rol es obligatorio.")
    .isString().withMessage("El nombre del rol debe ser texto.")
    .isLength({ min: 3, max: 50 })
      .withMessage("El nombre del rol debe tener entre 3 y 50 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage("El nombre del rol solo puede contener letras y espacios.")
    .custom(async (name: RoleCreationAttributes["role_name"]) => {
      const existing = await Role.findOne({ where: { role_name: name } });
      if (existing) return Promise.reject("El rol ya existe.");
    }),
];

/**
 * ✏️ Reglas para actualizar un rol
 */
export const updateRoleRules = [
  body("role_name")
    .optional()
    .isString().withMessage("El nombre del rol debe ser texto.")
    .isLength({ min: 3, max: 50 })
      .withMessage("El nombre del rol debe tener entre 3 y 50 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage("El nombre del rol solo puede contener letras y espacios.")
    .custom(async (name: RoleCreationAttributes["role_name"], { req }: { req: any }) => {
      const id = req.params?.id;
      const existing = await Role.findOne({ where: { role_name: name } });
      if (existing && id && existing.id !== Number(id)) {
        return Promise.reject("El nombre del rol ya está en uso por otro rol.");
      }
    }),
];

/**
 * 👥 Reglas para asignar un rol a un usuario
 */
export const assignRoleRules = [
  body("userId")
    .notEmpty().withMessage("El userId es obligatorio.")
    .isInt({ min: 1 }).withMessage("El userId debe ser un número entero positivo.")
    .custom(async (userId: number) => {
      const user = await User.findByPk(userId);
      if (!user) return Promise.reject("Usuario no encontrado.");
    }),

  body("roleId")
    .notEmpty().withMessage("El roleId es obligatorio.")
    .isInt({ min: 1 }).withMessage("El roleId debe ser un número entero positivo.")
    .custom(async (roleId: number) => {
      const role = await Role.findByPk(roleId);
      if (!role) return Promise.reject("Rol no encontrado.");
    }),
];
