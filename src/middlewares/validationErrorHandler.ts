import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// Revisa si los validadores (las reglas) encontraron algún error.
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

}