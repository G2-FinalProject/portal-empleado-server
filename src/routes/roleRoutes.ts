import express, { type Request, type Response, type NextFunction } from "express";
import { validationResult, type ValidationError } from "express-validator";

// ✅ Importa tus controladores
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
} from "../controllers/RoleController.js";

// ✅ Importa tus reglas reales (las que ya tienes)
import {
  createRoleRules,
  updateRoleRules,
  assignRoleRules,
} from "../validators/roleValidation.js";

const router = express.Router();

/**
 * 🧹 Middleware para manejar errores de validación (NO reemplaza tus validadores)
 */
const handleValidationInline = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: ValidationError) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }
  next();
};

// ✅ Rutas finales conectadas a tus controladores y validadores reales
router.get("/", getAllRoles);
router.post("/", createRoleRules, handleValidationInline, createRole);
router.put("/:id", updateRoleRules, handleValidationInline, updateRole);
router.delete("/:id", deleteRole);
router.post("/assign", assignRoleRules, handleValidationInline, assignRoleToUser);

export default router;
