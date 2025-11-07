import type { Request, Response, NextFunction } from 'express';

/**
 * Copia el id del usuario autenticado a req.body.requester_id
 * para que el validador lo use sin permitir spoofing.
 * Debe ejecutarse DESPUÉS de isAuthenticated.
 */
export function attachRequesterId(req: Request, _res: Response, next: NextFunction) {
  if ('requester_id' in req.body) delete (req.body as any).requester_id;

  const userId = (req as any).user?.id;
  if (userId) (req.body as any).requester_id = userId;

  next();
}
