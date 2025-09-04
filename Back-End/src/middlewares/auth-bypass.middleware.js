const { AUTH_CONFIG, getMockUser } = require('../config/auth-config');

// Middleware que sempre passa a autenticação (bypass)
function authenticateJWT(req, res, next) {
  // Adiciona header de aviso quando autenticação está desabilitada
  if (!AUTH_CONFIG.AUTH_ENABLED) {
    res.setHeader('X-Auth-Bypass', AUTH_CONFIG.BYPASS_MESSAGE);
  }
  
  // Simula um usuário autenticado
  req.user = getMockUser();
  next();
}

// Middleware que sempre autoriza qualquer role
function authorizeRole(roles) {
  return (req, res, next) => {
    // Sempre autoriza, não verifica roles
    next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRole
};
