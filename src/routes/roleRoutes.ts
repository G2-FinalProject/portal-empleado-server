import express from "express";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
} from "../controllers/RoleController.js";

const router = express.Router();

router.get("/", getAllRoles);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);
router.put("/assign", assignRoleToUser);

export default router;
