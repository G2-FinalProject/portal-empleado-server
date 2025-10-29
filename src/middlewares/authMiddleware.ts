import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../utils/jwt.js';

//Este es un truco de TypeScript. Le "enseñamos" a Express
// que ahora nuestro objeto `req` puede tener una propiedad `user`.
declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload; // 'user' tendrá el contenido del token (id y role)
    }
  }
}

