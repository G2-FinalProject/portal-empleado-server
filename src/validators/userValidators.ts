import { body } from 'express-validator';
import { User } from '../models/userModel.js';

//Reglas para CREAR un Usuario (POST /users)

export const createUserRules = [
  body('first_name')
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),

  body('last_name')
    .notEmpty().withMessage('El apellido es obligatorio.')
    .isString().withMessage('El apellido debe ser texto.')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres.'),

  body('email')
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('El email no tiene un formato válido.')
    // Validación "custom": Comprueba si el email ya existe en la BBDD
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        // Si ya existe, "rechazamos" la promesa y el validador fallará
        return Promise.reject('El email ya está en uso.');
      }
    }),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),

  body('role_id')
    .notEmpty().withMessage('El role_id es obligatorio.')
    .isInt({ min: 1 }).withMessage('El role_id debe ser un número entero positivo.'),

  body('department_id')
    .notEmpty().withMessage('El department_id es obligatorio.')
    .isInt({ min: 1 }).withMessage('El department_id debe ser un número entero positivo.'),

  body('location_id') // <-- ¡El nuevo campo!
    .notEmpty().withMessage('El location_id es obligatorio.')
    .isInt({ min: 1 }).withMessage('El location_id debe ser un número entero positivo.')
];

// Reglas para ACTUALIZAR un Usuario (PATCH /users/:id)
export const updateUserRules = [
  // Al actualizar, todos los campos son opcionales
  body('first_name')
    .optional()
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),

  body('last_name')
    .optional()
    .isString().withMessage('El apellido debe ser texto.')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres.'),

  body('email')
    .optional()
    .isEmail().withMessage('El email no tiene un formato válido.')
   .custom(async (email, { req }) => {
    
      const id = req.params?.id; 
      
      const existingUser = await User.findOne({ where: { email } });
      
      //  Añadimos 'id &&' para asegurarnos de que 'id' no es undefined
      if (existingUser && id && existingUser.id !== Number(id)) {
        return Promise.reject('Ese email ya está en uso por otro usuario.');
      }
    }),

  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),

  body('role_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El role_id debe ser un número entero positivo.'),

  body('department_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El department_id debe ser un número entero positivo.'),

  body('location_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El location_id debe ser un número entero positivo.')
];