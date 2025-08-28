const rateLimit = require('express-rate-limit');

// Rate limiting para diferentes endpoints
const rateLimiters = {
  // Rate limit para autenticação (mais restritivo)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: {
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60 // segundos
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        retryAfter: 15 * 60
      });
    }
  }),

  // Rate limit para API geral
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Rate limit para criação de recursos
  create: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 criações por IP
    message: {
      error: 'Muitas tentativas de criação. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Rate limit para uploads
  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 uploads por IP
    message: {
      error: 'Muitas tentativas de upload. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
  })
};

module.exports = rateLimiters;
