import { body } from 'express-validator';

export const loginRules = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('El email no tiene un formato válido.'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
];