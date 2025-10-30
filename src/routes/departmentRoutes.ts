import express from 'express';
import {  createDepartment, getAllDepartments,getDepartmentById,updateDepartment,deleteDepartment} from '../controllers/DepartmentController.js';
import { createDepartmentRules, updateDepartmentRules } from '../validators/departmentValidators.js';
import { handleValidationErrors } from '../middlewares/validationErrorHandler.js';
import { isAuthenticated, hasRole } from '../middlewares/authMiddleware.js';


const departmentRouter = express.Router();

const checkAdmin = [isAuthenticated, hasRole(1)];


departmentRouter.get('/', checkAdmin, getAllDepartments);
departmentRouter.get('/:id', checkAdmin, getDepartmentById);
departmentRouter.post('/', checkAdmin, createDepartmentRules, handleValidationErrors,createDepartment);
departmentRouter.patch('/:id', checkAdmin, updateDepartmentRules, handleValidationErrors, updateDepartment);
departmentRouter.delete('/:id', checkAdmin, deleteDepartment);

export default departmentRouter;