import express  from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/UserController.js';

const userRouter = express.Router();

userRouter.get('/', getUsers);

userRouter.get('/:id', getUserById);

userRouter.post('/', createUser);

userRouter.patch('/:id', updateUser);

userRouter.delete('/:id', deleteUser);

export default userRouter; 