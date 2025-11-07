import express from "express";
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole, assignRoleToUser, } from "../controllers/RoleController.js";
import { handleValidationErrors } from "../middlewares/validationErrorHandler.js";
import { checkAdmin } from '../utils/authChecks.js';


const roleRouter = express.Router();

roleRouter.get("/", checkAdmin, getAllRoles);
roleRouter.get("/:id", checkAdmin, handleValidationErrors, getRoleById);

roleRouter.post("/", checkAdmin, handleValidationErrors, createRole);

roleRouter.patch("/:id", checkAdmin, handleValidationErrors, updateRole);

roleRouter.delete("/:id", checkAdmin, handleValidationErrors, deleteRole);

roleRouter.post("/assign", checkAdmin, handleValidationErrors, assignRoleToUser);

export default roleRouter;
