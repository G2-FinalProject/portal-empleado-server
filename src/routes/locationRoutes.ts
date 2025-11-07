import { Router } from 'express';
import { createLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } from '../controllers/LocationController.js';
import { checkAdmin, checkManagerOrAdmin } from '../utils/authChecks.js';
import { handleValidationErrors } from '../middlewares/validationErrorHandler.js';

const locationRouter = Router();

locationRouter.get('/',checkManagerOrAdmin, getAllLocations);
locationRouter.get('/:id', checkManagerOrAdmin, getLocationById);

locationRouter.post('/', checkAdmin, handleValidationErrors, createLocation);

locationRouter.patch('/:id', checkAdmin, handleValidationErrors, updateLocation);

locationRouter.delete('/:id', checkAdmin, deleteLocation);

export default locationRouter;
