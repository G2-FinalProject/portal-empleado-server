import { body } from "express-validator";
import { Role } from "../models/roleModel.js";
import { User } from "../models/userModel.js"

// 🔹 Crear un rol
export const createRoleRules = [
  body("role_name")
    .notEmpty().withMessage("El nombre del rol es obligatorio.")
    .isString().withMessage("El nombre del rol debe ser texto.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre del rol debe tener entre 3 y 50 caracteres.")
    .custom(async (name) => {
      const existing = await Role.findOne({ where: { role_name: name } });
      if (existing) {
        return Promise.reject("El nombre del rol ya está en uso.");
      }
    }),
];

// 🔹 Actualizar un rol
export const updateRoleRules = [
  body("role_name")
    .optional()
    .isString().withMessage("El nombre del rol debe ser texto.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre del rol debe tener entre 3 y 50 caracteres.")
    .custom(async (name, { req }) => {
      const id = req.params?.id;
      const role = await Role.findOne({ where: { role_name: name } });
      if (role && id && role.id !== Number(id)) {
        return Promise.reject("El nombre del rol ya está en uso por otro rol.");
      }
    }),
];

// 🔹 Asignar un rol a un usuario
export const assignRoleRules = [
  body("userId")
    .notEmpty().withMessage("El campo userId es obligatorio.")
    .isInt({ min: 1 }).withMessage("El userId debe ser un número positivo.")
    .bail()
    .custom(async (userId) => {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("El usuario especificado no existe.");
      }
      return true;
    }),

  body("roleId")
    .notEmpty().withMessage("El campo roleId es obligatorio.")
    .isInt({ min: 1 }).withMessage("El roleId debe ser un número positivo.")
    .bail()
    .custom(async (roleId) => {
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new Error("El rol especificado no existe.");
      }
      return true;
    }),
];
