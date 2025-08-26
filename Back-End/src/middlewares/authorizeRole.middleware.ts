import { Request, Response, NextFunction } from 'express';

export function authorizeRole(roles: string | string[]) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req: Request, res: Response, next: NextFunction) => {
    // req.user é preenchido pelo authenticateJWT
    // @ts-ignore
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }
    if (!allowed.includes(user.role)) {
      return res.status(403).json({ message: `Acesso restrito: requer um dos papéis: ${allowed.join(', ')}.` });
    }
    next();
  };
}
