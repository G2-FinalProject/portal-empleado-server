import { Router } from 'express';
import {
  createLocation, getAllLocations, getLocationById, updateLocation, deleteLocation
} from '../controllers/LocationController.js';

const locationRouter = Router();

locationRouter.post('/', createLocation);
locationRouter.get('/',  getAllLocations);
locationRouter.get('/:id',  getLocationById);
locationRouter.patch('/:id',  updateLocation);
locationRouter.delete('/:id',  deleteLocation);

export default locationRouter;
