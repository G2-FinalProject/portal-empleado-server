import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRoleToUser,
} from "../controllers/RoleController.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { isAuthenticated, hasRole } from "../middlewares/authMiddleware.js";

const roleRouter = express.Router();
const checkAdmin = [isAuthenticated, hasRole(1)];

roleRouter.get("/", checkAdmin, getAllRoles);
roleRouter.get("/:id", checkAdmin, handleValidationErrors, getRoleById);
roleRouter.post("/", checkAdmin, handleValidationErrors, createRole);
roleRouter.patch("/:id", checkAdmin, handleValidationErrors, updateRole);
roleRouter.delete("/:id", checkAdmin, handleValidationErrors, deleteRole);
roleRouter.post("/assign", checkAdmin, handleValidationErrors, assignRoleToUser);

export default roleRouter;
