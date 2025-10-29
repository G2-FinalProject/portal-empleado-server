import express  from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/UserController.js';
import { createUserRules, updateUserRules } from '../validators/userValidators.js';
import { handleValidationErrors } from '../middlewares/validationErrorHandler.js';
import { isAuthenticated, hasRole } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

const checkAdmin = [isAuthenticated, hasRole(1)];
const checkManager = [isAuthenticated, hasRole(2)]

userRouter.get('/', checkAdmin, getUsers);

userRouter.get('/:id', checkAdmin, getUserById);

userRouter.post('/',checkAdmin, createUserRules, handleValidationErrors, createUser);

userRouter.patch('/:id', checkAdmin, updateUserRules, handleValidationErrors, updateUser);

userRouter.delete('/:id', checkAdmin, deleteUser);

export default userRouter; 