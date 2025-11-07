import { body, param } from 'express-validator';

export const createLocationValidator = [
  body('location_name')
    .trim()
    .notEmpty().withMessage('location_name es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('location_name debe tener entre 2 y 100 carateres'),
];

export const updateLocationValidator = [
  param('id').isInt({ gt: 0 }).withMessage('id must be int'),
  body('location_name')
    .optional()
    .trim()
    .notEmpty().withMessage('location_name no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('location_name debe tener entre 2 y 100 caracteres'),
];
