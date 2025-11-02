import express  from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, getVacationSummary } from '../controllers/UserController.js';
import { createUserRules, updateUserRules } from '../validators/userValidators.js';
import { handleValidationErrors } from '../middlewares/validationErrorHandler.js';
import { isAuthenticated, hasRole } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

const checkAdmin = [isAuthenticated, hasRole(1)];
const checkManagerOrAdmin = [isAuthenticated, hasRole(1, 2)];
const checkAuth = [isAuthenticated];

userRouter.get('/', checkManagerOrAdmin, getUsers);

userRouter.get('/:id', checkManagerOrAdmin, getUserById);

userRouter.post('/',checkAdmin, createUserRules, handleValidationErrors, createUser);

userRouter.patch('/:id', checkAdmin, updateUserRules, handleValidationErrors, updateUser);

userRouter.delete('/:id', checkAdmin, deleteUser);

userRouter.get('/:id/vacations/summary',checkAuth, getVacationSummary);

export default userRouter;  