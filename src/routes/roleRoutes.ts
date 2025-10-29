import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRoleToUser,
} from "../controllers/RoleController.js";

const roleRouter = express.Router();

roleRouter.get("/", getAllRoles);
roleRouter.get("/:id", getRoleById);
roleRouter.post("/", createRole);
roleRouter.patch("/:id", updateRole);
roleRouter.delete("/:id", deleteRole);
roleRouter.post("/assign", assignRoleToUser);

export default roleRouter;
