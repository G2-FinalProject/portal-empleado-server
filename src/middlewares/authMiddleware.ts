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

 //Comprueba si el usuario ha enviado un token JWT válido.

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  
  // 1. Buscar el "pase mágico" (token) en las cabeceras (Headers)
  const authHeader = req.headers.authorization;

  // 2. ¿Existe el pase?
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  //    Nos quedamos solo con la parte del token (la segunda).
  const token = authHeader.split(' ')[1];

 if (!token) {
    return res.status(401).json({ message: 'Token malformado. No se encontró el token.' });
  }

  try {
       const payload = verifyToken(token);

    if (!payload) {
      throw new Error('Token inválido');
    }

    req.user = payload;

    next();

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// Por eso podemos usarla en las rutas como `hasRole(1)` (para Admin), `hasRole(2)` (para Manager), `hasRole(3)` (para Employee)
export const hasRole = (...roles: number[]) => { 

  // Esta es la función de middleware real que se ejecutará
  return (req: Request, res: Response, next: NextFunction) => {
    
       if (!req.user) {
      return res.status(500).json({ message: 'Error interno: No se encontró el usuario en la petición.' });
    }

    //  Sacamos el rol que el (isAuthenticated) ya guardó
    const userRole = req.user.role; // (Este 'role' es el role_id)

    //  Comprobamos si el rol del usuario (ej. 2) está en la
    //   lista de roles permitidos que pasamos (ej. ...roles sería [1])
    if (!roles.includes(userRole)) {
    
      return res.status(403).json({ 
        message: 'Acceso denegado. No tienes permisos de administrador.' 
      });
    }

        next();
  };
};