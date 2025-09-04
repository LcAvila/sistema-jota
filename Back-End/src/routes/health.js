const express = require('express');
// Prisma removed - using Supabase instead
const logger = require('../config/logger');

// Redis opcional
let cache = null;
if (process.env.NODE_ENV === 'production') {
  try {
    const redisModule = require('../config/redis');
    cache = redisModule.cache;
  } catch (error) {
    console.log('⚠️ Redis não disponível para health check');
  }
}

const router = express.Router();
// Prisma client removed - using Supabase instead

// Health check básico
router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Erro no health check básico:', error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Health check detalhado
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Database connection test removed - using Supabase instead
    let dbStatus = 'not_configured';
    let dbResponseTime = 0;
    
    // Testar Redis
    let redisStatus = 'unknown';
    let redisResponseTime = 0;
    
    if (cache) {
      try {
        const redisStart = Date.now();
        await cache.set('health:test', 'ok', 60);
        const testValue = await cache.get('health:test');
        redisResponseTime = Date.now() - redisStart;
        redisStatus = testValue === 'ok' ? 'connected' : 'error';
        await cache.del('health:test');
      } catch (redisError) {
        redisStatus = 'error';
        logger.error('Erro na conexão com Redis:', redisError);
      }
    } else {
      redisStatus = 'not_configured';
      redisResponseTime = 0;
    }
    
    // Métricas de sistema
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Table count removed - using Supabase instead
    let tableCount = 0;
    
    const totalTime = Date.now() - startTime;
    
    const healthData = {
      status: redisStatus === 'connected' || redisStatus === 'not_configured' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${totalTime}ms`,
      
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
        tables: tableCount,
        connection: dbStatus === 'connected' ? 'healthy' : 'unhealthy'
      },
      
      redis: {
        status: redisStatus,
        responseTime: `${redisResponseTime}ms`,
        connection: redisStatus === 'connected' ? 'healthy' : 'unhealthy'
      },
      
      system: {
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        },
        cpu: {
          user: `${Math.round(cpuUsage.user / 1000)}ms`,
          system: `${Math.round(cpuUsage.system / 1000)}ms`
        },
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };
    
    // Log do health check
    logger.info('Health check detalhado executado', {
      status: healthData.status,
      responseTime: totalTime,
      dbStatus,
      redisStatus
    });
    
    res.json(healthData);
    
  } catch (error) {
    logger.error('Erro no health check detalhado:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check para load balancer
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Métricas de performance
router.get('/metrics', async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000)
      },
      
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      }
    };
    
    res.json(metrics);
    
  } catch (error) {
    logger.error('Erro ao obter métricas:', error);
    res.status(500).json({ error: 'Erro ao obter métricas' });
  }
});

module.exports = router;
