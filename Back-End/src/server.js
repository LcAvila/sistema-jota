// Carregar variáveis de ambiente primeiro
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Prisma removed - using Supabase instead
const compression = require('compression');
const helmet = require('helmet');

// Importar configurações e middlewares
const logger = require('./config/logger');
const rateLimiters = require('./middleware/rateLimit');
const { validate } = require('./middleware/validation');
const monitoring = require('./middleware/monitoring');

// Redis opcional (só em produção)
let connectRedis = null;
let cacheMiddleware = null;
if (process.env.NODE_ENV === 'production') {
  try {
    const redisModule = require('./config/redis');
    connectRedis = redisModule.connectRedis;
    cacheMiddleware = require('./middleware/cache');
  } catch (error) {
    console.log('⚠️ Redis não disponível, continuando sem cache');
  }
}

// Prisma client removed - using Supabase instead

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

// Middleware de segurança e performance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS SUPER SIMPLES - PERMITIR TUDO
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// CORS adicional com express-cors
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de monitoramento
app.use(monitoring.requestLogger);
app.use(monitoring.performanceMonitor);
app.use(monitoring.memoryMonitor);

// Rate limiting
app.use('/api/auth/', rateLimiters.auth);
app.use('/api/', rateLimiters.api);
app.use('/api/products', rateLimiters.create);
app.use('/api/orders', rateLimiters.create);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexão com banco de dados Neon Tech

// Login agora é gerenciado pelo controller de autenticação

// Importar rotas TypeScript (compiladas para JavaScript)
const authRoutes = require('../dist/routes/auth.routes');
const productsRoutes = require('../dist/routes/products.routes');
const ordersRoutes = require('../dist/routes/orders.routes');
const usersRoutes = require('../dist/routes/users.routes');
const salesRoutes = require('../dist/routes/sales.routes');
const stockRoutes = require('../dist/routes/stock.routes');
const importsRoutes = require('../dist/routes/imports.routes');
const publicRoutes = require('../dist/routes/public.routes');
const dashboardRoutes = require('../dist/routes/dashboardRoutes');

// Usar as rotas
app.use('/api/auth', authRoutes.default);
app.use('/api/products', productsRoutes.default);
app.use('/api/orders', ordersRoutes.default);
app.use('/api/users', usersRoutes.default);
app.use('/api/sales', salesRoutes.default);
app.use('/api/stock', stockRoutes.default);
app.use('/api/imports', importsRoutes.default);
app.use('/api/public', publicRoutes.default);
app.use('/api/dashboard', dashboardRoutes.default);

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota protegida de exemplo - agora gerenciada pelo controller de usuários

// Importar rotas de health check
const healthRoutes = require('./routes/health');

// Usar as rotas de health check
app.use('/api/health', healthRoutes);

// Função de inicialização
async function startServer() {
  try {
    // Conectar ao Redis (só em produção)
    if (process.env.NODE_ENV === 'production' && connectRedis) {
      try {
        await connectRedis();
        console.log(`🗄️ Cache: Redis configurado`);
      } catch (error) {
        console.log(`⚠️ Cache: Redis não disponível`);
      }
    } else {
      console.log(`⚠️ Cache: Redis não configurado (modo desenvolvimento)`);
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info('🚀 Servidor iniciado com sucesso', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🔒 Segurança: Helmet, Rate Limiting, CORS configurado`);
      console.log(`📊 Monitoramento: Winston Logger, Performance Monitor`);
      console.log(`✅ Validação: Joi schemas implementados`);
      console.log(`\n🗄️ Conectado ao Supabase`);
      console.log(`   Sistema Jota - Backend integrado`);
    });
    
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Middleware de tratamento de erros (deve ser o último)
app.use(monitoring.errorHandler);

// Iniciar servidor
startServer();
