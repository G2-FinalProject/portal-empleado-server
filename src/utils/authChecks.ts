import { isAuthenticated, hasRole } from '../middlewares/authMiddleware.js';

export const checkAdmin = [isAuthenticated, hasRole(1)];
export const checkManagerOrAdmin = [isAuthenticated, hasRole(1, 2)];
export const checkAuth = [isAuthenticated];
