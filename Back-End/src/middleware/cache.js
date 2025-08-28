const { cache } = require('../config/redis');

// Middleware de cache
const cacheMiddleware = {
  // Cache para produtos (1 hora)
  productsCache: async (req, res, next) => {
    try {
      const cacheKey = `products:${req.query.category || 'all'}:${req.query.page || 1}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          ...cachedData,
          fromCache: true,
          cachedAt: new Date().toISOString()
        });
      }
      
      // Adicionar função para definir cache na resposta
      res.setCache = async (data) => {
        await cache.set(cacheKey, data, 3600); // 1 hora
        return data;
      };
      
      next();
    } catch (error) {
      console.error('Erro no cache de produtos:', error);
      next(); // Continuar sem cache em caso de erro
    }
  },

  // Cache para categorias (2 horas)
  categoriesCache: async (req, res, next) => {
    try {
      const cacheKey = 'categories:all';
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          ...cachedData,
          fromCache: true,
          cachedAt: new Date().toISOString()
        });
      }
      
      res.setCache = async (data) => {
        await cache.set(cacheKey, data, 7200); // 2 horas
        return data;
      };
      
      next();
    } catch (error) {
      console.error('Erro no cache de categorias:', error);
      next();
    }
  },

  // Cache para usuário (30 minutos)
  userCache: async (req, res, next) => {
    try {
      const userId = req.params.id || req.user?.userId;
      if (!userId) return next();
      
      const cacheKey = `user:${userId}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          ...cachedData,
          fromCache: true,
          cachedAt: new Date().toISOString()
        });
      }
      
      res.setCache = async (data) => {
        await cache.set(cacheKey, data, 1800); // 30 minutos
        return data;
      };
      
      next();
    } catch (error) {
      console.error('Erro no cache de usuário:', error);
      next();
    }
  },

  // Cache para dashboard (15 minutos)
  dashboardCache: async (req, res, next) => {
    try {
      const cacheKey = `dashboard:${req.user?.storeId || 'public'}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          ...cachedData,
          fromCache: true,
          cachedAt: new Date().toISOString()
        });
      }
      
      res.setCache = async (data) => {
        await cache.set(cacheKey, data, 900); // 15 minutos
        return data;
      };
      
      next();
    } catch (error) {
      console.error('Erro no cache do dashboard:', error);
      next();
    }
  },

  // Função para invalidar cache
  invalidateCache: async (pattern) => {
    try {
      await cache.clear(pattern);
      console.log(`Cache invalidado para padrão: ${pattern}`);
    } catch (error) {
      console.error('Erro ao invalidar cache:', error);
    }
  }
};

module.exports = cacheMiddleware;
