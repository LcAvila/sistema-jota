const redis = require('redis');

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End of server list, give up
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
};

// Criar cliente Redis
let client = null;

// Função para conectar ao Redis
async function connectRedis() {
  try {
    client = redis.createClient(redisConfig);
    
    client.on('error', (err) => {
      console.error('❌ Erro no Redis:', err);
    });
    
    client.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });
    
    client.on('ready', () => {
      console.log('🚀 Redis pronto para uso');
    });
    
    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Falha ao conectar ao Redis:', error);
    return null;
  }
}

// Função para obter cliente Redis
function getRedisClient() {
  return client;
}

// Funções de cache
const cache = {
  // Definir valor com TTL
  async set(key, value, ttl = 3600) {
    if (!client) return false;
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao definir cache:', error);
      return false;
    }
  },

  // Obter valor
  async get(key) {
    if (!client) return null;
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erro ao obter cache:', error);
      return null;
    }
  },

  // Deletar chave
  async del(key) {
    if (!client) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Erro ao deletar cache:', error);
      return false;
    }
  },

  // Limpar cache por padrão
  async clear(pattern = '*') {
    if (!client) return false;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cache
};
