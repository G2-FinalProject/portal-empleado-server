import express from 'express';
import {  createDepartment, getAllDepartments,getDepartmentById,updateDepartment,deleteDepartment} from '../controllers/DepartmentController.js';

const departmentRouter = express.Router();

departmentRouter.get('/', getAllDepartments);
departmentRouter.get('/:id', getDepartmentById);
departmentRouter.post('/', createDepartment);
departmentRouter.patch('/:id', updateDepartment);
departmentRouter.delete('/:id', deleteDepartment);

export default departmentRouter;