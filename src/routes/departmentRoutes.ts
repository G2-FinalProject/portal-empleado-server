import express from 'express';
import {  createDepartment, getAllDepartments,getDepartmentById,updateDepartment,deleteDepartment} from '../controllers/DepartmentController.js';
import { createDepartmentRules, updateDepartmentRules } from '../validators/departmentValidators.js';
import { handleValidationErrors } from '../middlewares/validationErrorHandler.js';
import { checkAdmin, checkManagerOrAdmin } from '../utils/authChecks.js';


const departmentRouter = express.Router();

departmentRouter.get('/', checkAdmin, getAllDepartments);
departmentRouter.get('/:id', checkManagerOrAdmin, getDepartmentById);

departmentRouter.post('/', checkAdmin, createDepartmentRules, handleValidationErrors,createDepartment);

departmentRouter.patch('/:id', checkAdmin, updateDepartmentRules, handleValidationErrors, updateDepartment);

departmentRouter.delete('/:id', checkAdmin, handleValidationErrors, deleteDepartment);

export default departmentRouter;