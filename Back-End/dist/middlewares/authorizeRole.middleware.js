"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = authorizeRole;
function authorizeRole(roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
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
