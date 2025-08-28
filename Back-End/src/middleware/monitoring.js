const logger = require('../config/logger');

// Middleware de monitoramento
const monitoring = {
  // Middleware para log de requisições
  requestLogger: (req, res, next) => {
    const start = Date.now();
    
    // Log da requisição
    logger.info('Requisição recebida', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Interceptar o final da resposta
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // Log da resposta
      logger.info('Resposta enviada', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    });

    next();
  },

  // Middleware para métricas de performance
  performanceMonitor: (req, res, next) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000; // em milissegundos
      
      // Log de performance
      if (duration > 1000) { // Log apenas se demorar mais de 1 segundo
        logger.warn('Requisição lenta detectada', {
          method: req.method,
          url: req.url,
          duration: `${duration.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      }
    });

    next();
  },

  // Middleware para captura de erros
  errorHandler: (err, req, res, next) => {
    // Log do erro
    logger.error('Erro na aplicação', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });

    // Resposta de erro para o cliente
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  },

  // Middleware para métricas de uso de memória
  memoryMonitor: (req, res, next) => {
    const memUsage = process.memoryUsage();
    
    // Log de uso de memória a cada 100 requisições
    if (Math.random() < 0.01) { // 1% das requisições
      logger.info('Métricas de memória', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  }
};

module.exports = monitoring;
