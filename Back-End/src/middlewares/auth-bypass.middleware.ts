import { Request, Response, NextFunction } from 'express';
import { AUTH_CONFIG, getMockUser } from '../config/auth-config';

// Middleware que sempre passa a autenticação (bypass)
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  // Adiciona header de aviso quando autenticação está desabilitada
  if (!AUTH_CONFIG.AUTH_ENABLED) {
    res.setHeader('X-Auth-Bypass', 'true');
  }
  
  // Simula um usuário autenticado
  // @ts-ignore
  req.user = getMockUser();
  next();
}

// Middleware que sempre autoriza qualquer role
export function authorizeRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sempre autoriza, não verifica roles
    next();
  };
}
