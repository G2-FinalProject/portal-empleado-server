import { body } from 'express-validator';
import { Department } from '../models/departmentModel.js';

// Reglas para CREAR un departamento
export const createDepartmentRules = [
  body('department_name')
    .notEmpty().withMessage('El nombre del departamento es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.')
    // Comprobamos que no exista ya un departamento con ese nombre
    .custom(async (name) => {
      const department = await Department.findOne({ where: { department_name: name } });
      if (department) {
        return Promise.reject('El nombre del departamento ya está en uso.');
      }
    }),

  body('manager_id')
    .optional() // ¡Es opcional! (Gracias a tus cambios)
    .isInt({ min: 1 }).withMessage('El manager_id debe ser un número entero positivo.')
];

// Reglas para ACTUALIZAR un departamento
export const updateDepartmentRules = [
  body('department_name')
    .optional() // Al actualizar, puede que solo quieran cambiar el manager
    .isString().withMessage('El nombre debe ser texto.')
    .custom(async (name, { req }) => {
      const id = req.params?.id; // Acceso seguro
      // Buscamos si OTRO departamento (con ID distinto) tiene ese nombre
      const department = await Department.findOne({ where: { department_name: name } });
      
      if (department && id && department.id !== Number(id)) {
        return Promise.reject('El nombre del departamento ya está en uso por otro departamento.');
      }
    }),
  
  body('manager_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El manager_id debe ser un número entero positivo.')
];