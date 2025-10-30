import express from 'express';
import { login } from '../controllers/AuthController.js';
import { loginRules } from '../validators/authValidators.js';
import { handleValidationErrors } from '../middlewares/validationErrorHandler.js';

const authRouter = express.Router();

authRouter.post('/login', loginRules, handleValidationErrors, login);

export default authRouter;