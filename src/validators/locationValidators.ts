import { body, param } from 'express-validator';

export const createLocationValidator = [
  body('location_name')
    .trim()
    .notEmpty().withMessage('location_name is required')
    .isLength({ min: 2, max: 100 }).withMessage('location_name must have between 2 and 100 caraters'),
];

export const updateLocationValidator = [
  param('id').isInt({ gt: 0 }).withMessage('id must be int'),
  body('location_name')
    .optional()
    .trim()
    .notEmpty().withMessage('location_name no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('location_name must have between 2 and 100 caracters'),
];
